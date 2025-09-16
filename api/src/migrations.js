import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runCypher } from './neo4j.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function applyMigrations() {
  // Resolve migrations copied into image at build time or mounted at runtime
  const candidates = [
    path.resolve(__dirname, '../../db/migrations'),
    path.resolve(__dirname, './db/migrations')
  ];
  let migrationsDir = null;
  for (const p of candidates) {
    if (fs.existsSync(p)) { migrationsDir = p; break; }
  }
  if (!migrationsDir) {
    console.warn('No migrations directory found; skipping');
    return;
  }
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.cypher'))
    .sort();
  for (const f of files) {
    const full = path.join(migrationsDir, f);
    const content = fs.readFileSync(full, 'utf-8');
    console.log(`Applying migration: ${f}`);
    // Split on semicolons that terminate statements (tolerate Windows/Unix newlines)
    const statements = content
      .split(/;\s*(?:\r?\n|$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    for (const stmt of statements) {
      await runCypher(stmt);
    }
  }
}
