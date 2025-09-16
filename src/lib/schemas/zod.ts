import { z } from "zod";

export const LifecycleStageSchema = z.enum([
  "draft",
  "design_review",
  "approved",
  "test_ready",
  "qa_ready",
  "prod_ready",
  "operational"
]);
export type LifecycleStage = z.infer<typeof LifecycleStageSchema>;

const Lifecycle = z
  .object({
    stage: LifecycleStageSchema.default("draft"),
    updated_by: z.string().optional(),
    updated_at: z.string().optional()
  })
  .partial({ updated_by: true, updated_at: true });

const Approvals = z
  .object({
    architect: z.string().optional(),
    integrator: z.string().optional(),
    tester: z.string().optional(),
    ops: z.string().optional(),
    security: z.string().optional()
  })
  .partial();

const Environments = z.record(z.string(), z.record(z.any())).optional();

// Shared
export const ServiceRoles = z.object({
  producer_system: z.string(),
  consumer_systems: z.array(z.string()).default([])
});

export const DataRoles = z
  .object({
    publisher_system: z.string().optional(),
    subscriber_systems: z.array(z.string()).optional(),
    source_system: z.string().optional(),
    target_system: z.string().optional()
  })
  .partial();

export const Security = z.object({
  encryption: z.enum(["Okrypterad kanal", "Krypterad kanal med publik nyckel"]),
  server_identification: z.enum(["Anonym server", "Serveridentifiering med publik nyckel"]),
  access_control: z.union([
    z.enum(["Username/Password", "API-nyckel", "Klientcertifikat", "OAuth2/OIDC", "Private Key JWT"]),
    z.enum(["Username/Password", "API-nyckel", "Klientcertifikat", "SSH Public Key Authentication"])
  ])
});

export const EndpointHTTP = z.object({ protocol: z.literal("https"), url: z.string().optional() });
export const EndpointAsync = z.object({
  protocol: z.enum(["http", "https", "ftp", "sftp", "file", "jms", "mllp", "smtp"]),
  url: z.string().optional(),
  host: z.string().optional(),
  port: z.number().int().optional(),
  path: z.string().optional(),
  method: z.string().optional(),
  destination_type: z.enum(["queue", "topic"]).optional()
});

// HTTP Proxy Sync
export const HttpProxyInterface = z.object({
  id: z.string(),
  leg: z.enum(["app_to_rtjp", "rtjp_to_app"]),
  connection_pattern: z.string(),
  service_roles: ServiceRoles,
  data_roles: DataRoles.optional(),
  data_flow: z.object({
    direction: z.enum(["request", "response", "push", "pull", "publish", "subscribe"]),
    protocol: z.literal("https"),
    endpoint: z.string(),
    format: z.string()
  }),
  security: Security,
  interface: z.record(z.any()).optional(),
  realization: z.record(z.any()).optional(),
  endpoint: EndpointHTTP
});

export const HttpProxyDoc = z
  .object({
    template: z.literal("Integrationsbeskrivning Synkront flöde HTTP (proxy)"),
    metadata_version: z.literal("1.0"),
    integration: z
      .object({
        id: z.string(),
        title: z.string(),
        pattern: z.literal("http_proxy_sync"),
        interaction_type: z.enum(["One-way", "Request-Reply"])
      })
      .passthrough(),
    lifecycle: Lifecycle.optional(),
    systems: z.object({ app1: z.any(), rtjp: z.any(), app2: z.any() }),
    interfaces: z.array(HttpProxyInterface).min(2),
    environments: Environments,
    approvals: Approvals.optional()
  })
  .passthrough();

// RIV-TA Sync
export const RivtaInterface = z.object({
  id: z.string(),
  leg: z.enum(["app_to_rtjp", "rtjp_to_app"]),
  connection_pattern: z.enum([
    "Ta emot anslutning från tjänstekonsument RIV-TA i synkront flöde",
    "Ansluta till tjänsteproducent RIV-TA i synkront flöde"
  ]),
  service_roles: ServiceRoles,
  data_roles: DataRoles.optional(),
  data_flow: z.object({ direction: z.enum(["request", "response"]), protocol: z.literal("https"), endpoint: z.string(), format: z.string() }),
  security: z.object({
    encryption: z.literal("Krypterad kanal med publik nyckel"),
    server_identification: z.literal("Serveridentifiering med publik nyckel"),
    access_control: z.literal("Klientcertifikat")
  }),
  interface: z.record(z.any()).optional(),
  realization: z.record(z.any()).optional(),
  endpoint: EndpointHTTP,
  rivta: z.object({ contract: z.string().optional() }).optional()
});

export const RivtaDoc = z
  .object({
    template: z.literal("Integrationsbeskrivning Synkront flöde RIV-TA"),
    metadata_version: z.literal("1.0"),
    integration: z
      .object({ id: z.string(), title: z.string(), pattern: z.literal("rivta_sync"), interaction_type: z.enum(["One-way", "Request-Reply"]) })
      .passthrough(),
    lifecycle: Lifecycle.optional(),
    systems: z.object({ app1: z.any(), rtjp: z.any(), app2: z.any() }),
    interfaces: z.array(RivtaInterface).min(2),
    environments: Environments,
    approvals: Approvals.optional()
  })
  .passthrough();

// Async Flow
export const AsyncInterface = z.object({
  id: z.string(),
  leg: z.enum(["app_to_rtjp", "rtjp_to_app"]),
  connection_pattern: z.enum([
    "Ta emot från HTTP-klient i asynkront flöde",
    "Ta emot från avsändare HL7v2 i asynkront flöde",
    "Ta emot från JMS-klient i asynkront flöde",
    "Hämta från FTP-server i asynkront flöde",
    "Hämta från SFTP-server i asynkront flöde",
    "Hämta från Fileshare i asynkront flöde",
    "Hämta från HTTP-server i asynkront flöde",
    "Lämna till FTP-server i asynkront flöde",
    "Lämna till SFTP-server i asynkront flöde",
    "Lämna till Fileshare i asynkront flöde",
    "Lämna till HTTP-server i asynkront flöde",
    "Lämna till mottagare HL7v2 i asynkront flöde",
    "Lämna till epostmottagare i asynkront flöde",
    "Lämna till JMS-klient i asynkront flöde"
  ]),
  service_roles: ServiceRoles,
  data_roles: DataRoles.optional(),
  data_flow: z.object({
    direction: z.enum(["push", "pull", "publish", "subscribe"]),
    protocol: z.enum(["http", "https", "ftp", "sftp", "file", "jms", "mllp", "smtp"]),
    endpoint: z.string().optional(),
    format: z.string()
  }),
  security: Security,
  interface: z.record(z.any()).optional(),
  realization: z.record(z.any()).optional(),
  endpoint: EndpointAsync,
  channel: z.object({ type: z.enum(["jms", "fileshare", "smtp", "mllp"]), name: z.string().optional() }).optional()
});

export const AsyncDoc = z
  .object({
    template: z.literal("Integrationsbeskrivning Asynkront flöde"),
    metadata_version: z.literal("1.0"),
    integration: z
      .object({
        id: z.string(),
        title: z.string(),
        pattern: z.literal("async_flow"),
        interaction_type: z.enum(["One-way", "Publish-Subscribe"]),
        flow_variant: z.enum(["Asynkront flöde", "Asynkront flöde med bearbetning"])
      })
      .passthrough(),
    lifecycle: Lifecycle.optional(),
    systems: z.object({ app1: z.any(), rtjp: z.any(), app2: z.any() }),
    interfaces: z.array(AsyncInterface).min(2),
    processing_steps: z
      .array(
        z.object({
          order: z.number().int().positive(),
          description: z.string(),
          spec_ref: z.string().optional(),
          realization_component: z.string().optional()
        })
      )
      .optional(),
    environments: Environments,
    approvals: Approvals.optional()
  })
  .passthrough();

// Unified union
export const UnifiedDoc = z.union([HttpProxyDoc, RivtaDoc, AsyncDoc]);
export type UnifiedDoc = z.infer<typeof UnifiedDoc>;

export const UnifiedDocForm = z.union([
  HttpProxyDoc.deepPartial(),
  RivtaDoc.deepPartial(),
  AsyncDoc.deepPartial()
]);
export type UnifiedDocForm = z.infer<typeof UnifiedDocForm>;
