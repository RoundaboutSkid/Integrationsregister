import neo4j from 'neo4j-driver';

let driver;

export function getDriver() {
  if (!driver) {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password';
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return driver;
}

export async function verifyConnection() {
  const d = getDriver();
  const session = d.session();
  try {
    await session.run('RETURN 1');
    return true;
  } finally {
    await session.close();
  }
}

export async function runCypher(cypher) {
  const d = getDriver();
  const session = d.session();
  try {
    await session.run(cypher);
  } finally {
    await session.close();
  }
}

export async function runQuery(cypher, params = {}) {
  const d = getDriver();
  const session = d.session({ defaultAccessMode: neo4j.session.READ });
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

export function toInt(n) {
  return neo4j.int(n);
}
