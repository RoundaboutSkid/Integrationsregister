import fs from "fs/promises";
import { glob } from "glob";
import matter from "gray-matter";

function hasSecret(value: any, path: string[] = []): string[] {
  const issues: string[] = [];
  if (typeof value === "string") {
    if (/-----BEGIN (.*) PRIVATE KEY-----/.test(value)) issues.push(path.join("."));
    if (value.length > 500 && /^[A-Za-z0-9+/=\n]+$/.test(value)) issues.push(path.join("."));
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => issues.push(...hasSecret(v, [...path, String(i)])));
  } else if (typeof value === "object" && value) {
    for (const [k, v] of Object.entries(value)) {
      const lower = k.toLowerCase();
      const isSensitiveKey = /(password|secret|token|apikey|api_key|key)/.test(lower);
      if (isSensitiveKey && !k.endsWith("_ref")) issues.push([...path, k].join("."));
      issues.push(...hasSecret(v, [...path, k]));
    }
  }
  return issues;
}

(async () => {
  const files = await glob("docs/**/*.md", { ignore: ["**/generated/**"] });
  let ok = true;
  for (const f of files) {
    const raw = await fs.readFile(f, "utf8");
    const fm = matter(raw);
    const issues = hasSecret(fm.data);
    if (issues.length) {
      ok = false;
      console.error(`Secret-like content in ${f}:`);
      for (const i of issues) console.error(`  - ${i}`);
    } else {
      console.log(`OK  ${f}`);
    }
  }
  process.exit(ok ? 0 : 1);
})();