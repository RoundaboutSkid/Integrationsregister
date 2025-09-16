import type { Metadata } from "next";
import { readIntegrationMarkdown } from "@/lib/files/md";
import type { UnifiedDoc } from "@/lib/schemas/zod";
import WizardClient from "./WizardClient";

interface WizardPageProps {
  params: { integrationId: string };
}

export const metadata: Metadata = {
  title: "Integration Wizard"
};

export default async function IntegrationWizardPage({ params }: WizardPageProps) {
  const { integrationId } = params;

  let initialDoc: UnifiedDoc | undefined;
  let body = "";

  if (integrationId !== "new") {
    try {
      const result = await readIntegrationMarkdown(integrationId);
      initialDoc = result.frontmatter;
      body = result.body;
    } catch (error) {
      console.warn(`Could not load integration ${integrationId}:`, error);
    }
  }

  return (
    <WizardClient
      integrationId={integrationId}
      initialDoc={initialDoc}
      initialBody={body}
    />
  );
}
