# FIELD-GUIDE – Integration Metadata v1

## Roller
- **service_roles.producer_system**: system som tillhandahåller tjänsten/endpointen.
- **service_roles.consumer_systems[]**: system som använder tjänsten.
- **data_roles**: faktiska dataflödesroller.
  - `publisher_system` / `subscriber_systems[]` (event/pubrepl)
  - `source_system` / `target_system` (fil/batch, pull/push)

## Härledningsregler (default)
- **http_proxy_sync / rivta_sync**
  - `app_to_rtjp`: producer=rtjp, consumers=[app1]
  - `rtjp_to_app`: producer=app2, consumers=[rtjp]
- **async_flow**
  - "Hämta från *server": producer = serverägaren (ofta app1), consumers=[rtjp]; data_roles: source=app1, target=rtjp
  - "Lämna till *": producer = mottagarens endpointägare (ofta app2), consumers=[rtjp]; data_roles: source=rtjp, target=app2
  - "Ta emot från *klient": producer=rtjp (onramp), consumers=[app1]

> Reglerna används bara om fält saknas; explicit angivna fält vinner.

## Sekretesspolicy
- Ingen klartext för nycklar/lösenord. Använd `*_ref` fält som pekar till PMP/hemlighantering.