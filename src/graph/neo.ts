import neo4j, { Driver } from "neo4j-driver";

let driver: Driver | null = null;

export function getDriver() {
  if (!driver) {
    const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
    const user = process.env.NEO4J_USER || "neo4j";
    const password = process.env.NEO4J_PASSWORD || "neo4j";
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return driver;
}

export async function runTx<T>(fn: (tx: any) => Promise<T>): Promise<T> {
  const d = getDriver();
  const session = d.session();
  try {
    return await session.executeWrite(fn);
  } finally {
    await session.close();
  }
}