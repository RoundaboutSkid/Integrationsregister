import { glob } from "glob";
import { parseAndValidate } from "../src/lib/markdown/frontmatter";
import { HttpProxyDoc, RivtaDoc, AsyncDoc } from "../src/lib/schemas/zod";
import { ingestHttpProxySync } from "../src/ingest/httpProxySync";
import { ingestRivtaSync } from "../src/ingest/rivtaSync";
import { ingestAsyncFlow } from "../src/ingest/asyncFlow";
import { getDriver } from "../src/graph/neo";

(async () => {
  const files = await glob("docs/**/*.md", { ignore: ["**/generated/**"] });
  for (const f of files) {
    const { frontmatter } = await parseAndValidate(f);
    const tpl = (frontmatter as any).template as string;
    if (tpl.includes("HTTP (proxy)")) await ingestHttpProxySync(frontmatter as any);
    else if (tpl.includes("RIV-TA")) await ingestRivtaSync(frontmatter as any);
    else if (tpl.includes("Asynkront")) await ingestAsyncFlow(frontmatter as any);
    console.log(`INGESTED ${f}`);
  }
  await getDriver().close();
})();