import { runTx } from "../graph/neo";
import { z } from "zod";
import { HttpProxyDoc } from "../lib/schemas/zod";

export async function ingestHttpProxySync(doc: z.infer<typeof HttpProxyDoc>) {
  const integ = doc.integration;
  await runTx(async (tx) => {
    // Systems
    for (const key of ["app1", "rtjp", "app2"] as const) {
      const sys = (doc.systems as any)[key];
      await tx.run(`MERGE (s:System {id:$id}) SET s.name=$name`, { id: sys.id || key, name: sys.name || key });
    }
    // Integration
    await tx.run(
      `MERGE (i:Integration {id:$id}) SET i.title=$title, i.pattern=$pattern, i.interaction_type=$itype`,
      { id: integ.id, title: integ.title, pattern: integ.pattern, itype: integ.interaction_type }
    );

    for (const iface of doc.interfaces) {
      await tx.run(`MERGE (f:Interface {id:$id}) SET f.leg=$leg, f.connection_pattern=$cp`, { id: iface.id, leg: iface.leg, cp: iface.connection_pattern });
      await tx.run(`MATCH (i:Integration {id:$iid}), (f:Interface {id:$fid}) MERGE (i)-[:HAS_INTERFACE]->(f)`, { iid: integ.id, fid: iface.id });

      // Security
      const secId = `${iface.security.encryption}|${iface.security.server_identification}|${iface.security.access_control}`;
      await tx.run(`MERGE (s:SecurityProfile {id:$id}) SET s += $props`, { id: secId, props: iface.security });
      await tx.run(`MATCH (f:Interface {id:$fid}), (s:SecurityProfile {id:$sid}) MERGE (f)-[:SECURED_BY]->(s)`, { fid: iface.id, sid: secId });

      // Endpoint
      const epId = iface.endpoint.url || `${iface.data_flow.protocol}:${iface.data_flow.endpoint}`;
      await tx.run(`MERGE (e:Endpoint {id:$id}) SET e += $props`, { id: epId, props: { ...iface.endpoint } });
      await tx.run(`MATCH (f:Interface {id:$fid}), (e:Endpoint {id:$eid}) MERGE (f)-[:EXPOSED_AT]->(e)`, { fid: iface.id, eid: epId });

      // Service roles → relations
      await tx.run(`MATCH (p:System {id:$pid}), (f:Interface {id:$fid}) MERGE (p)-[:PROVIDES]->(f)`, { pid: iface.service_roles.producer_system, fid: iface.id });
      for (const c of iface.service_roles.consumer_systems) {
        await tx.run(`MATCH (c:System {id:$cid}), (f:Interface {id:$fid}) MERGE (c)-[:CONSUMES]->(f)`, { cid: c, fid: iface.id });
      }
    }
  });
}