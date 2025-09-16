import { NextResponse } from "next/server";

import { writeIntegrationMarkdown } from "@/lib/files/md";
import { UnifiedDocForm } from "@/lib/schemas/zod";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const id = String(payload?.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "Missing integration id" }, { status: 400 });
    }

    const frontmatterInput = payload?.frontmatter ?? {};
    const body = typeof payload?.body === "string" ? payload.body : "";

    const parsed = UnifiedDocForm.parse(frontmatterInput);
    const frontmatter = {
      ...parsed,
      integration: {
        ...(parsed as any).integration,
        id
      }
    };

    const result = await writeIntegrationMarkdown(id, frontmatter, body);

    return NextResponse.json({ ok: true, id, path: result.filePath });
  } catch (error: any) {
    console.error("Failed to save integration", error);
    const message = error?.message ?? "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
