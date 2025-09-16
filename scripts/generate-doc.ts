import fs from "fs/promises";
import path from "path";
import yaml from "yaml";

// Usage: node scripts/generate-doc.js input.json output.md
(async () => {
  const [,, inFile, outFile] = process.argv;
  if (!inFile || !outFile) {
    console.error("Usage: node scripts/generate-doc.js <input.json> <output.md>");
    process.exit(1);
  }
  const raw = await fs.readFile(inFile, "utf8");
  const data = JSON.parse(raw);
  const fm = yaml.stringify(data);
  const content = `---\n${fm}---\n# Översikt\n\nBeskrivning…\n\n# Anslutning\n\n(Genereras från interfaces[])\n\n# Sekvensdiagram\n\n${data.sequence_diagram_mermaid ? "```mermaid\n" + data.sequence_diagram_mermaid + "\n```" : "Länk: "+(data.sequence_diagram_ref||"") }\n\n# Felhantering\n\n(Tabell genereras från error_handling[])\n\n# Spårbarhet\n\n${data.traceability?.requirements || ""}\n`;
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, content, "utf8");
  console.log(`Generated ${outFile}`);
})();