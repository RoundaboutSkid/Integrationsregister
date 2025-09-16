import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { UnifiedDoc, UnifiedDocForm } from "../schemas/zod";

export interface IntegrationMarkdown {
  frontmatter: UnifiedDoc;
  body: string;
  filePath: string;
}

const INTEGRATIONS_DIR = path.join(process.cwd(), "docs", "integrations");

async function ensureIntegrationsDir() {
  await fs.mkdir(INTEGRATIONS_DIR, { recursive: true });
}

export async function readIntegrationMarkdown(id: string): Promise<IntegrationMarkdown> {
  const filePath = path.join(INTEGRATIONS_DIR, `${id}.md`);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);
  const validation = UnifiedDoc.safeParse(parsed.data);

  if (!validation.success) {
    throw new Error(
      `Invalid frontmatter in ${filePath}:\n${validation.error.issues.map((i) => `- ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n")}`
    );
  }

  return {
    frontmatter: validation.data,
    body: parsed.content,
    filePath
  };
}

export async function writeIntegrationMarkdown(
  id: string,
  doc: unknown,
  body = ""
): Promise<{ filePath: string; frontmatter: unknown }> {
  await ensureIntegrationsDir();
  const filePath = path.join(INTEGRATIONS_DIR, `${id}.md`);
  const parsed = UnifiedDocForm.parse(doc);
  const integration = {
    ...(parsed as any).integration,
    id
  };
  const data = { ...parsed, integration } as Record<string, unknown>;
  const serialized = matter.stringify(body, data);
  await fs.writeFile(filePath, serialized, "utf8");
  return { filePath, frontmatter: data };
}

export async function upsertIntegrationMarkdown(id: string, doc: unknown, body = "") {
  const { filePath, frontmatter } = await writeIntegrationMarkdown(id, doc, body);
  return {
    frontmatter,
    body,
    filePath
  };
}
