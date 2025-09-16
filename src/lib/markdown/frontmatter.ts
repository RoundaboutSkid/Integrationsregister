// src/lib/markdown/frontmatter.ts
import fs from "fs/promises";
import matter from "gray-matter";
import { UnifiedDoc, HttpProxyDoc, RivtaDoc } from "../schemas/zod";

// Hjälpare: formatera Zod-liknande fel utan att importera ZodError
function formatIssues(err: unknown): string[] {
  const e: any = err;
  if (e && Array.isArray(e.issues)) {
    return e.issues.map((i: any) => {
      const path = Array.isArray(i.path) && i.path.length ? i.path.join(".") : "(root)";
      return `- ${path}: ${i.message}`;
    });
  }
  return [String(err)];
}

export async function parseAndValidate(path: string) {
  const raw = await fs.readFile(path, "utf8");
  const fm = matter(raw);

  try {
    const tpl = String(fm.data?.template || "");
    if (tpl.includes("HTTP (proxy)")) {
      return { frontmatter: HttpProxyDoc.parse(fm.data), body: fm.content };
    } else if (tpl.includes("RIV-TA")) {
      return { frontmatter: RivtaDoc.parse(fm.data), body: fm.content };
    } else {
      return { frontmatter: UnifiedDoc.parse(fm.data), body: fm.content };
    }
  } catch (err) {
    const lines = formatIssues(err);
    throw new Error(`Validation error in ${path}:\n${lines.join("\n")}`);
  }
}
