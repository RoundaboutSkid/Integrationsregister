Backlog — Integrationsregister Authoring (Neo4j + REST + React)

Scope
- Goal: Add authoring to replace Excel as the write source while keeping the current app read‑only until cutover. Path: Option A + D (edit‑first on top of a solid REST API), then creation, then bulk import, then cutover and lock Excel.
- Database: Neo4j community (container). Auth: Entra ID/AD. API: REST. UI: React (hosted in the app).

Conventions
- Status values: Planned | In Progress | Done | Parked
- IDs: Epics `EP-###`, Stories `ST-###`, Tasks `TSK-###`, Questions `Q-###`
- Each story has clear acceptance criteria and measurable outcomes.
- This file is the single source of truth for scope during this collaboration.

References
- Data source workbook: Integrationsregister.xlsx (sheets parsed: Applikation, Integration, Integrationslösning, Integrationsbeställning, link sheets; vocabularies in Readme)
- Controlled vocabularies discovered: Livscykelstatus = {Planerad, I drift, Avvecklad}; Integrationsmönster = list from Readme sheet.

EP-001 Foundation (API, Auth, Schema) — Status: Planned
- ST-001 OpenAPI skeleton for REST surface
  - Status: Planned
  - Acceptance:
    - OpenAPI 3 document checked in with entities: Application, Integration, IntegrationSolution, IntegrationOrder, Vocabularies, Links.
    - CRUD + link endpoints defined with request/response models and error formats.
- ST-002 Entra ID JWT validation in backend
  - Status: Planned
  - Acceptance:
    - Backend validates tokens via JWKS (issuer/audience) and rejects invalid/expired tokens.
    - Health endpoint indicates auth config validity.
- ST-003 RBAC roles and mapping
  - Status: Planned
  - Acceptance:
    - Viewer: GET only; Editor: create/update/delete; Admin: bulk import/export + admin endpoints.
    - Role mapping from Entra group Object IDs is configurable and testable.
- ST-004 Shared validation schemas (Zod/JSON Schema)
  - Status: Planned
  - Acceptance:
    - Schemas for Application, Integration, IntegrationSolution, IntegrationOrder, and vocabularies.
    - Reused server-side and exported types for UI.

EP-002 Data Model & Constraints — Status: Planned
- ST-010 Define node/relationship model (from Excel mapping)
  - Status: Planned
  - Acceptance:
    - Nodes: Application(id,name,org,comment,status), Integration(id,name,pattern,status,links), IntegrationSolution(id,name,docLink), IntegrationOrder(id,oldId,date,name,desc,caseLink,designLink).
    - Rels: (Application)-[:SOURCE_OF]->(Integration)-[:TARGET_OF]->(Application); (Solution)-[:REALIZES]->(Integration); (Order)-[:ORDERS]->(Integration).
- ST-011 Neo4j constraints/migrations
  - Status: Planned
  - Acceptance:
    - Idempotent Cypher migration applies UNIQUE constraints for ids on each label.
    - Executed automatically on startup or via a CI/CD step.
- ST-012 Service-level relationship enforcement
  - Status: Planned
  - Acceptance:
    - Create/update fails if Integration lacks exactly one source and one target Application.
    - Transactions ensure no dangling or duplicate rels.

EP-003 Audit & Governance — Status: Planned
- ST-020 Append-only audit log
  - Status: Planned
  - Acceptance:
    - Each write captures who, action, entity type/id, before/after (diff), timestamp.
    - Admin endpoint to query audits by entity and user.
- ST-021 Soft delete with integrity
  - Status: Planned
  - Acceptance:
    - Entities support soft delete (tombstone) and are excluded by default from reads.
    - Prevent deletes that would break required relationships unless handled transactionally.

EP-004 Editing (v1) — Status: Planned
- ST-030 Edit Applications
  - Status: Planned
  - Acceptance:
    - Update name, org, comment, status (enum enforced).
    - Optimistic locking (etag/version) prevents overwrite conflicts.
- ST-031 Edit Integrations (properties)
  - Status: Planned
  - Acceptance:
    - Update name, status, pattern (enum), diagram link, realization.
    - Invalid values rejected with clear errors.
- ST-032 Rewire Integration relationships (source/target)
  - Status: Planned
  - Acceptance:
    - Update source/target Applications atomically; prior rels removed in the same transaction.
    - Prevent self-links and circular duplicates.
- ST-033 Edit Solutions and Orders
  - Status: Planned
  - Acceptance:
    - Update fields; manage links to Integrations from Integration detail UI.

EP-005 Authoring UI (hosted) — Status: Planned
- ST-040 Entra login (MSAL) and session handling
  - Status: Planned
  - Acceptance:
    - Users authenticate via Entra; roles visible in UI; session renewals handled.
- ST-041 Vocabularies surfaced to forms
  - Status: Planned
  - Acceptance:
    - Dropdowns for Livscykelstatus and Integrationsmönster populated from API; validation aligned.
- ST-042 Application edit screens
  - Status: Planned
  - Acceptance:
    - List, search, detail, edit form; inline errors; save & feedback.
- ST-043 Integration edit screens + relationship pickers
  - Status: Planned
  - Acceptance:
    - Source/Target pickers with search/autocomplete; validation prevents illegal selections.
- ST-044 Solutions/Orders edit and link management
  - Status: Planned
  - Acceptance:
    - CRUD pages; link/unlink from Integration detail; confirmation dialogs.

EP-006 Creation (v2) — Status: Planned
- ST-050 Create Application
  - Status: Planned
  - Acceptance:
    - Form with id uniqueness check, name, org, status; dedupe suggestions by id/name.
- ST-051 Create Integration (wizard)
  - Status: Planned
  - Acceptance:
    - Stepper: pick source → pick target → properties → review → create.
    - Enforces required rels and enums; transactionally creates rels and node.
- ST-052 Link Solutions and Orders from Integration
  - Status: Planned
  - Acceptance:
    - Add/remove links; prevents duplicates; audit recorded.

EP-007 Bulk & Export — Status: Planned
- ST-060 CSV/Excel exports for all entities
  - Status: Planned
  - Acceptance:
    - Filtered export endpoints; column headers match current workbook terminology where sensible.
- ST-061 Initial load (one-time import from Excel)
  - Status: Planned
  - Acceptance:
    - Import tool validates rows, reports errors/warnings, and upserts in passes (Applications → Integrations → Solutions/Orders → links).
    - Excel date serials converted correctly; summary report archived.

EP-008 Testing & Quality — Status: Planned
- ST-070 Unit tests for validators and mappers
  - Status: Planned
  - Acceptance:
    - Coverage for schema validation and Excel→model mapping rules (including enums and dates).
- ST-071 Integration tests for transactional Cypher
  - Status: Planned
  - Acceptance:
    - Tests verify atomic rewiring and rollback on error; no dangling rels.
- ST-072 E2E tests for core flows
  - Status: Planned
  - Acceptance:
    - Login, edit Application, edit Integration (including rewiring), create Integration wizard.

EP-009 Observability & Ops — Status: Planned
- ST-080 Structured logging and metrics
  - Status: Planned
  - Acceptance:
    - Logs include correlation IDs and user IDs for writes; basic metrics exposed (validation failures, write errors).
- ST-081 Health and readiness endpoints
  - Status: Planned
  - Acceptance:
    - Health checks: DB connectivity, auth/JWKS reachability, migrations applied.

EP-010 Cutover & Rollout — Status: Planned
- ST-090 Pilot rollout (Editors only)
  - Status: Planned
  - Acceptance:
    - Selected group uses authoring for edits; feedback collected; no regressions on read-only app.
- ST-091 Acceptance test and sign-off
  - Status: Planned
  - Acceptance:
    - All acceptance criteria met (auth, edit/create, audit, exports, tests pass).
- ST-092 Initial load and Excel lock-down
  - Status: Planned
  - Acceptance:
    - Import executed; discrepancies resolved; Excel write access revoked; communication sent.

Risks & Mitigations (tracked)
- R-001 Dual-entry window confusion (Excel vs app)
  - Mitigation: Clear comms; banner in authoring UI; prioritize Integration create.
- R-002 Relationship integrity (no DB rel constraints in community)
  - Mitigation: Service validation + transactional Cypher + integration tests.
- R-003 Role mapping drift
  - Mitigation: Configurable group IDs, health check for role resolution.

Open Questions
- Q-001 Confirm App1=source and App2=target for all Integrations.
- Q-002 Should “Realisering” be constrained (enum) or remain free text?
- Q-003 Any additional controlled vocabularies beyond those found in Readme?
- Q-004 Owner/Team modeling: include now or defer to v2?
- Q-005 Per-environment variations needed (e.g., endpoint overrides)?

Backlog Maintenance
- Update statuses as we progress; add decisions inline to relevant stories.
- Keep acceptance criteria specific and testable; link to commits/PRs when available.

