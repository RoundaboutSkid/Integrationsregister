import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { LIFECYCLE_STATUSES, INTEGRATION_PATTERNS, REALIZATION_KEYS } from './constants.js';
import { verifyConnection, runQuery, toInt } from './neo4j.js';
import { applyMigrations } from './migrations.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Simple dev auth stub: in dev, derive roles from header; in prod, enforce JWT (to be implemented)
function getRolesFromHeaders(req) {
  const raw = req.header('x-dev-roles');
  if (!raw) return ['Viewer'];
  return raw.split(',').map(r => r.trim()).filter(Boolean);
}

function requireRole(required) {
  return (req, res, next) => {
    const roles = getRolesFromHeaders(req);
    if (roles.includes('Admin') || roles.includes(required)) return next();
    return res.status(403).json({ title: 'Forbidden', status: 403, detail: `Requires role ${required}` });
  };
}

app.get('/health', async (req, res) => {
  try {
    await verifyConnection();
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ title: 'DB Error', status: 500, detail: e.message });
  }
});

app.get('/auth/me', (req, res) => {
  // Placeholder: when JWT validation is added, populate from token claims
  const roles = getRolesFromHeaders(req);
  res.json({ userId: 'dev-user', name: 'Dev User', email: 'dev@example.com', roles, groups: [] });
});

// Vocabularies
app.get('/vocabularies/lifecycle-status', (req, res) => res.json(LIFECYCLE_STATUSES));
app.get('/vocabularies/integration-patterns', (req, res) => res.json(INTEGRATION_PATTERNS));

// Helpers
function parsePaging(req) {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const size = Math.max(1, Math.min(100, parseInt(req.query.size || '25', 10)));
  const skip = (page - 1) * size;
  return { page, size, skip };
}

// GET /applications
app.get('/applications', async (req, res) => {
  const { q, status, org } = req.query;
  const { page, size, skip } = parsePaging(req);
  const where = [];
  const params = { q: q ? q.toLowerCase() : null, status, org: org ? org.toLowerCase() : null };
  if (q) where.push('(toLower(n.name) CONTAINS $q OR toLower(n.id) CONTAINS $q)');
  if (status) where.push('n.lifecycleStatus = $status');
  if (org) where.push('toLower(n.owningOrg) CONTAINS $org');
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const dataQuery = `
    MATCH (n:Application)
    ${whereClause}
    WITH n ORDER BY n.name ASC SKIP $skip LIMIT $limit
    RETURN n
  `;
  const countQuery = `
    MATCH (n:Application)
    ${whereClause}
    RETURN count(n) AS total
  `;
  try {
    const [rows, countRows] = await Promise.all([
      runQuery(dataQuery, { ...params, skip: toInt(skip), limit: toInt(size) }),
      runQuery(countQuery, params)
    ]);
    const total = countRows[0]?.get('total').toNumber?.() ?? countRows[0]?.get('total') ?? 0;
    const data = rows.map(r => {
      const n = r.get('n');
      const props = n.properties;
      return {
        id: props.id,
        name: props.name,
        owningOrg: props.owningOrg ?? null,
        comment: props.comment ?? null,
        lifecycleStatus: props.lifecycleStatus,
        createdAt: props.createdAt ?? null,
        updatedAt: props.updatedAt ?? null
      };
    });
    res.set('X-Total-Count', String(total));
    res.json({ data, meta: { page, size, total } });
  } catch (e) {
    res.status(500).json({ title: 'Query Failed', status: 500, detail: e.message });
  }
});

// GET /applications/:id
app.get('/applications/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const rows = await runQuery('MATCH (n:Application {id:$id}) RETURN n', { id });
    if (!rows.length) return res.status(404).end();
    const props = rows[0].get('n').properties;
    res.json({
      id: props.id,
      name: props.name,
      owningOrg: props.owningOrg ?? null,
      comment: props.comment ?? null,
      lifecycleStatus: props.lifecycleStatus,
      createdAt: props.createdAt ?? null,
      updatedAt: props.updatedAt ?? null
    });
  } catch (e) {
    res.status(500).json({ title: 'Query Failed', status: 500, detail: e.message });
  }
});

// GET /applications/:id/integrations
app.get('/applications/:id/integrations', async (req, res) => {
  const id = req.params.id;
  const direction = (req.query.direction || 'all').toLowerCase();
  const { page, size, skip } = parsePaging(req);
  let match = '';
  if (direction === 'inbound') {
    match = 'MATCH (:Application {id:$id})<-[:TARGET_OF]-(i:Integration)<-[:SOURCE_OF]-(src:Application)';
  } else if (direction === 'outbound') {
    match = 'MATCH (:Application {id:$id})-[:SOURCE_OF]->(i:Integration)-[:TARGET_OF]->(tgt:Application)';
  } else {
    match = 'MATCH (src:Application)-[:SOURCE_OF]->(i:Integration)-[:TARGET_OF]->(tgt:Application) WHERE src.id=$id OR tgt.id=$id';
  }
  const dataQuery = `
    ${match}
    WITH i, src, tgt ORDER BY i.name ASC SKIP $skip LIMIT $limit
    RETURN i, src.id AS sourceId, tgt.id AS targetId
  `;
  const countQuery = `
    ${match}
    RETURN count(i) AS total
  `;
  try {
    const [rows, countRows] = await Promise.all([
      runQuery(dataQuery, { id, skip: toInt(skip), limit: toInt(size) }),
      runQuery(countQuery, { id })
    ]);
    const total = countRows[0]?.get('total').toNumber?.() ?? countRows[0]?.get('total') ?? 0;
    const data = rows.map(r => formatIntegration(r.get('i').properties, r.get('sourceId'), r.get('targetId')));
    res.set('X-Total-Count', String(total));
    res.json({ data, meta: { page, size, total } });
  } catch (e) {
    res.status(500).json({ title: 'Query Failed', status: 500, detail: e.message });
  }
});

function assembleRealization(props) {
  const r = {};
  if (typeof props.realizationAMK === 'number') r.AMK = props.realizationAMK;
  if (typeof props.realizationMule === 'number') r.Mule = props.realizationMule;
  if (typeof props.realizationSKLTP === 'number') r.SKLTP = props.realizationSKLTP;
  return Object.keys(r).length ? r : null;
}

function formatIntegration(props, sourceId, targetId) {
  return {
    id: props.id,
    name: props.name,
    pattern: props.pattern ?? null,
    lifecycleStatus: props.lifecycleStatus,
    linkDiagram: props.linkDiagram ?? null,
    realization: assembleRealization(props),
    sourceId: sourceId ?? null,
    targetId: targetId ?? null,
    createdAt: props.createdAt ?? null,
    updatedAt: props.updatedAt ?? null
  };
}

// GET /integrations
app.get('/integrations', async (req, res) => {
  const { q, sourceId, targetId, status, pattern } = req.query;
  const { page, size, skip } = parsePaging(req);
  const where = [];
  const params = { q: q ? q.toLowerCase() : null, status, pattern, sourceId, targetId };
  if (q) where.push('(toLower(i.name) CONTAINS $q OR toLower(i.id) CONTAINS $q)');
  if (status) where.push('i.lifecycleStatus = $status');
  if (pattern) where.push('i.pattern = $pattern');
  let match = 'MATCH (src:Application)-[:SOURCE_OF]->(i:Integration)-[:TARGET_OF]->(tgt:Application)';
  if (sourceId) where.push('src.id = $sourceId');
  if (targetId) where.push('tgt.id = $targetId');
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const dataQuery = `
    ${match}
    ${whereClause}
    WITH i, src, tgt ORDER BY i.name ASC SKIP $skip LIMIT $limit
    RETURN i, src.id AS sourceId, tgt.id AS targetId
  `;
  const countQuery = `
    ${match}
    ${whereClause}
    RETURN count(i) AS total
  `;
  try {
    const [rows, countRows] = await Promise.all([
      runQuery(dataQuery, { ...params, skip: toInt(skip), limit: toInt(size) }),
      runQuery(countQuery, params)
    ]);
    const total = countRows[0]?.get('total').toNumber?.() ?? countRows[0]?.get('total') ?? 0;
    const data = rows.map(r => formatIntegration(r.get('i').properties, r.get('sourceId'), r.get('targetId')));
    res.set('X-Total-Count', String(total));
    res.json({ data, meta: { page, size, total } });
  } catch (e) {
    res.status(500).json({ title: 'Query Failed', status: 500, detail: e.message });
  }
});

// GET /integrations/:id
app.get('/integrations/:id', async (req, res) => {
  const id = req.params.id;
  const query = `
    MATCH (src:Application)-[:SOURCE_OF]->(i:Integration {id:$id})-[:TARGET_OF]->(tgt:Application)
    RETURN i, src.id AS sourceId, tgt.id AS targetId
  `;
  try {
    const rows = await runQuery(query, { id });
    if (!rows.length) return res.status(404).end();
    const r = rows[0];
    return res.json(formatIntegration(r.get('i').properties, r.get('sourceId'), r.get('targetId')));
  } catch (e) {
    res.status(500).json({ title: 'Query Failed', status: 500, detail: e.message });
  }
});
// Placeholder write-protected routes (stubs) to be implemented
app.post('/applications', requireRole('Editor'), (req, res) => res.status(501).json({ title: 'Not Implemented', status: 501 }));
app.post('/integrations', requireRole('Editor'), (req, res) => res.status(501).json({ title: 'Not Implemented', status: 501 }));
app.post('/solutions', requireRole('Editor'), (req, res) => res.status(501).json({ title: 'Not Implemented', status: 501 }));
app.post('/orders', requireRole('Editor'), (req, res) => res.status(501).json({ title: 'Not Implemented', status: 501 }));

// Audit endpoints (stubs)
app.get('/admin/audit', requireRole('Admin'), (req, res) => res.json([]));
app.get('/admin/audit/:entityType/:entityId', requireRole('Admin'), (req, res) => res.json([]));

const port = process.env.PORT || 4000;
(async () => {
  await applyMigrations();
  app.listen(port, () => console.log(`API listening on :${port}`));
})();
