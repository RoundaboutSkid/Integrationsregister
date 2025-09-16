template: "Integrationsbeskrivning Asynkront flöde"
metadata_version: "1.0"
integration:
  id: "ie-async-001"
  title: "Exempel Asynkront"
  pattern: "async_flow"
  flow_variant: "Asynkront flöde med bearbetning"
  interaction_type: "One-way"
systems:
  app1: { id: "app1", name: "Avsändare" }
  rtjp: { id: "rtjp", name: "RTjP" }
  app2: { id: "app2", name: "Mottagare" }
interfaces:
  - id: "if-app1-rtjp"
    leg: "app_to_rtjp"
    connection_pattern: "Hämta från SFTP-server i asynkront flöde"
    service_roles: { producer_system: "app1", consumer_systems: ["rtjp"] }
    data_roles: { source_system: "app1", target_system: "rtjp" }
    data_flow: { direction: "pull", protocol: "sftp", endpoint: "sftp://host/in/*.hl7", format: "hl7v2" }
    security: { encryption: "Krypterad kanal med publik nyckel", server_identification: "Serveridentifiering med publik nyckel", access_control: "SSH Public Key Authentication" }
    endpoint: { protocol: "sftp", host: "host", port: 22, path: "/in/*.hl7" }
  - id: "if-rtjp-app2"
    leg: "rtjp_to_app"
    connection_pattern: "Lämna till mottagare HL7v2 i asynkront flöde"
    service_roles: { producer_system: "app2", consumer_systems: ["rtjp"] }
    data_roles: { source_system: "rtjp", target_system: "app2" }
    data_flow: { direction: "push", protocol: "mllp", endpoint: "mllp://host:2575", format: "hl7v2" }
    security: { encryption: "Okrypterad kanal", server_identification: "Anonym server", access_control: "Klientcertifikat" }
    endpoint: { protocol: "mllp", host: "host", port: 2575 }
processing_steps:
  - order: 1
    description: "Mappning HL7v2→FHIR"
    spec_ref: ""
    realization_component: "Asynkmaskin"