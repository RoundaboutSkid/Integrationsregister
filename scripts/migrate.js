import fs from 'fs/promises';
import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';
const database = process.env.NEO4J_DB || 'neo4j';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function main() {
  const session = driver.session({ database });
  try {
    const text = await fs.readFile('migrations/001_constraints.cypher', 'utf8');
    const stmts = text
      .split(/;\s*(?:\r?\n|$)/)   // dela på semikolon vid radbryt
      .map(s => s.trim())
      .filter(Boolean);

    for (const stmt of stmts) {
      await session.executeWrite(tx => tx.run(stmt));
      console.log('OK:', stmt.slice(0, 80) + (stmt.length > 80 ? '…' : ''));
    }
    console.log('Constraints applied.');
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

main();