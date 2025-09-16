template: "Integrationsbeskrivning Synkront flöde HTTP (proxy)"
metadata_version: "1.0"
integration:
  id: "ie-http-proxy-001"
  title: "Exempel HTTP Proxy"
  pattern: "http_proxy_sync"
  interaction_type: "Request-Reply"
systems:
  app1: { id: "app1", name: "Källapp" }
  rtjp: { id: "rtjp", name: "RTjP" }
  app2: { id: "app2", name: "Målapp" }
interfaces:
  - id: "if-app1-rtjp"
    leg: "app_to_rtjp"
    connection_pattern: "Ta emot anslutning från HTTP-klient i synkront flöde"
    service_roles:
      producer_system: "rtjp"
      consumer_systems: ["app1"]
    data_flow:
      direction: "request"
      protocol: "https"
      endpoint: "/app/endpoint"
      format: "json"
    security:
      encryption: "Krypterad kanal med publik nyckel"
      server_identification: "Serveridentifiering med publik nyckel"
      access_control: "OAuth2/OIDC"
    endpoint:
      protocol: "https"
      url: "https://gateway.example/app/endpoint"
  - id: "if-rtjp-app2"
    leg: "rtjp_to_app"
    connection_pattern: "Ansluta till HTTP-server i synkront flöde"
    service_roles:
      producer_system: "app2"
      consumer_systems: ["rtjp"]
    data_flow:
      direction: "request"
      protocol: "https"
      endpoint: "https://app2.example/api"
      format: "json"
    security:
      encryption: "Krypterad kanal med publik nyckel"
      server_identification: "Serveridentifiering med publik nyckel"
      access_control: "Klientcertifikat"
    endpoint:
      protocol: "https"
      url: "https://app2.example/api"