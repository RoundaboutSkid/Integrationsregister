// scripts/validate-metadata.ts
import { glob } from "glob";
import fs from "fs/promises";
import matter from "gray-matter";
import { parseAndValidate } from "../src/lib/markdown/frontmatter";

const KNOWN_TEMPLATES = new Set([
  "Integrationsbeskrivning Synkront flöde HTTP (proxy)",
  "Integrationsbeskrivning Synkront flöde RIV-TA",
  "Integrationsbeskrivning Asynkront flöde"
]);

function isKnownTemplate(t?: unknown): t is string {
  return typeof t === "string" && KNOWN_TEMPLATES.has(t);
}

async function shouldValidate(file: string) {
  // snabbutslag: ignorera självklara mappar
  if (/(^|\/|\\)(copilot|generated)(\/|\\)/i.test(file)) return false;

  const raw = await fs.readFile(file, "utf8");
  const fm = matter(raw);
  return isKnownTemplate(fm.data?.template);
}

(async () => {
  // allow: npm run validate -- docs/templates/http_proxy_sync.example.md
  const args = process.argv.slice(2);
  const pattern = args.length ? args : ["docs/**/*.md"];

  const files = (await Promise.all(
    pattern.map(p => glob(p, { windowsPathsNoEscape: true }))
  )).flat();

  let ok = true;
  for (const f of files) {
    try {
      if (!(await shouldValidate(f))) {
        console.log(`SKIP ${f}`);
        continue;
      }
      await parseAndValidate(f);
      console.log(`OK   ${f}`);
    } catch (err) {
      ok = false;
      console.error(err instanceof Error ? err.message : String(err));
    }
  }
  process.exit(ok ? 0 : 1);
})();
