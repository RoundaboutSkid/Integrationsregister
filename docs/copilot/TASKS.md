# TASKS for Copilot/Codex

## 1) Unified schema
- Läs `/schemas/*.json` och säkerställ att `/schemas/unified.integration-metadata.v1.json` är en `oneOf` över tre scheman.

## 2) Zod & parser
- Generera Zod-typer i `/src/lib/schemas/zod.ts` från unified-schema.
- Implementera `parseAndValidate(path)` i `/src/lib/markdown/frontmatter.ts` (gray-matter + Zod).

## 3) Ingest
- Implementera `/src/ingest/httpProxySync.ts`, `/src/ingest/rivtaSync.ts`, `/src/ingest/asyncFlow.ts` enligt modellen.

## 4) CI
- Skapa `/scripts/validate-metadata.ts` och `/scripts/lint-secrets.ts`. Kör i `.github/workflows/validate.yml`.

## 5) Generator
- Implementera `/scripts/generate-doc.ts` som renderar MD från JSON (UnifiedDoc) till `/docs/generated/<id>.md`.