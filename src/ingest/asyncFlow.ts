import { runTx } from "../graph/neo";
import { z } from "zod";
import { AsyncDoc } from "../lib/schemas/zod";

export async function ingestAsyncFlow(doc: z.infer<typeof AsyncDoc>) {
  const integ = doc.integration;
  await runTx(async (tx) => {
    for (const key of ["app1", "rtjp", "app2"] as const) {
      const sys = (doc.systems as any)[key];
      await tx.run(`MERGE (s:System {id:$id}) SET s.name=$name`, { id: sys.id || key, name: sys.name || key });
    }
    await tx.run(`MERGE (i:Integration {id:$id}) SET i.title=$title, i.pattern=$pattern, i.interaction_type=$itype, i.flow_variant=$fv`, { id: integ.id, title: integ.title, pattern: integ.pattern, itype: integ.interaction_type, fv: (integ as any).flow_variant });

    for (const iface of doc.interfaces) {
      await tx.run(`MERGE (f:Interface {id:$id}) SET f.leg=$leg, f.connection_pattern=$cp`, { id: iface.id, leg: iface.leg, cp: iface.connection_pattern });
      await tx.run(`MATCH (i:Integration {id:$iid}), (f:Interface {id:$fid}) MERGE (i)-[:HAS_INTERFACE]->(f)`, { iid: integ.id, fid: iface.id });

      const secId = `${iface.security.encryption}|${iface.security.server_identification}|${iface.security.access_control}`;
      await tx.run(`MERGE (s:SecurityProfile {id:$id}) SET s += $props`, { id: secId, props: iface.security });
      await tx.run(`MATCH (f:Interface {id:$fid}), (s:SecurityProfile {id:$sid}) MERGE (f)-[:SECURED_BY]->(s)`, { fid: iface.id, sid: secId });

      const epKey = iface.endpoint.url || `${iface.endpoint.protocol}:${iface.endpoint.host || ""}:${iface.endpoint.port || ""}${iface.endpoint.path || ""}`;
      await tx.run(`MERGE (e:Endpoint {id:$id}) SET e += $props`, { id: epKey, props: { ...iface.endpoint } });
      await tx.run(`MATCH (f:Interface {id:$fid}), (e:Endpoint {id:$eid}) MERGE (f)-[:EXPOSED_AT]->(e)`, { fid: iface.id, eid: epKey });

      if ((iface as any).channel?.type) {
        const ch = (iface as any).channel;
        const chid = `${ch.type}:${ch.name || epKey}`;
        await tx.run(`MERGE (c:Channel {id:$id}) SET c.type=$type, c.name=$name`, { id: chid, type: ch.type, name: ch.name || null });
        await tx.run(`MATCH (f:Interface {id:$fid}), (c:Channel {id:$cid}) MERGE (f)-[:VIA_CHANNEL]->(c)`, { fid: iface.id, cid: chid });
      }

      // Roles → relations
      await tx.run(`MATCH (p:System {id:$pid}), (f:Interface {id:$fid}) MERGE (p)-[:PROVIDES]->(f)`, { pid: iface.service_roles.producer_system, fid: iface.id });
      for (const c of iface.service_roles.consumer_systems) {
        await tx.run(`MATCH (c:System {id:$cid}), (f:Interface {id:$fid}) MERGE (c)-[:CONSUMES]->(f)`, { cid: c, fid: iface.id });
      }
      if (iface.data_roles?.publisher_system) {
        await tx.run(`MATCH (p:System {id:$pid}), (f:Interface {id:$fid}) MERGE (p)-[:PUBLISHES]->(f)`, { pid: iface.data_roles.publisher_system, fid: iface.id });
      }
      if (iface.data_roles?.subscriber_systems) {
        for (const s of iface.data_roles.subscriber_systems) {
          await tx.run(`MATCH (s:System {id:$sid}), (f:Interface {id:$fid}) MERGE (s)-[:SUBSCRIBES_TO]->(f)`, { sid: s, fid: iface.id });
        }
      }
      if (iface.data_roles?.source_system) {
        await tx.run(`MATCH (s:System {id:$sid}), (f:Interface {id:$fid}) MERGE (s)-[:SOURCE_FOR]->(f)`, { sid: iface.data_roles.source_system, fid: iface.id });
      }
      if (iface.data_roles?.target_system) {
        await tx.run(`MATCH (t:System {id:$tid}), (f:Interface {id:$fid}) MERGE (t)-[:TARGET_FOR]->(f)`, { tid: iface.data_roles.target_system, fid: iface.id });
      }
    }
  });
}