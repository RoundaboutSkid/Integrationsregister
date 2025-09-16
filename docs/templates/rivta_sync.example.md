template: "Integrationsbeskrivning Synkront flöde RIV-TA"
metadata_version: "1.0"
integration:
  id: "ie-rivta-001"
  title: "Exempel RIV-TA synkront"
  pattern: "rivta_sync"
  interaction_type: "Request-Reply"
systems:
  app1: { id: "app1", name: "Tjänstekonsument" }
  rtjp: { id: "rtjp", name: "RTjP" }
  app2: { id: "app2", name: "Tjänsteproducent" }
interfaces:
  - id: "if-app1-rtjp"
    leg: "app_to_rtjp"
    connection_pattern: "Ta emot anslutning från tjänstekonsument RIV-TA i synkront flöde"
    service_roles: { producer_system: "rtjp", consumer_systems: ["app1"] }
    data_flow: { direction: "request", protocol: "https", endpoint: "https://rtjp/...", format: "xml" }
    security: { encryption: "Krypterad kanal med publik nyckel", server_identification: "Serveridentifiering med publik nyckel", access_control: "Klientcertifikat" }
    endpoint: { protocol: "https", url: "https://rtjp/..." }
    rivta: { contract: "GetCareDocumentation:3" }
  - id: "if-rtjp-app2"
    leg: "rtjp_to_app"
    connection_pattern: "Ansluta till tjänsteproducent RIV-TA i synkront flöde"
    service_roles: { producer_system: "app2", consumer_systems: ["rtjp"] }
    data_flow: { direction: "request", protocol: "https", endpoint: "https://producer/...", format: "xml" }
    security: { encryption: "Krypterad kanal med publik nyckel", server_identification: "Serveridentifiering med publik nyckel", access_control: "Klientcertifikat" }
    endpoint: { protocol: "https", url: "https://producer/..." }
    rivta: { contract: "GetCareDocumentation:3" }