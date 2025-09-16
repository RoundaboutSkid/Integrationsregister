"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { UnifiedDocForm, UnifiedDoc } from "@/lib/schemas/zod";
import {
  collectMissingFields,
  REQUIRED_FIELDS,
  type LifecycleStage,
  type WizardStepId
} from "@/lib/stage/requirements";
import WizardLayout, { type WizardStepDefinition } from "./_components/WizardLayout";
import OverviewStep from "./_components/OverviewStep";
import SystemsStep from "./_components/SystemsStep";
import ServiceRolesStep from "./_components/ServiceRolesStep";
import SecurityStep from "./_components/SecurityStep";
import EndpointStep from "./_components/EndpointStep";
import DataRolesStep from "./_components/DataRolesStep";
import EnvParamsStep from "./_components/EnvParamsStep";
import ReviewStep from "./_components/ReviewStep";

interface WizardClientProps {
  integrationId: string;
  initialDoc?: UnifiedDoc;
  initialBody?: string;
}

type WizardFormValues = Record<string, any>;

const PATTERN_TEMPLATES: Record<string, string> = {
  http_proxy_sync: "Integrationsbeskrivning Synkront flöde HTTP (proxy)",
  rivta_sync: "Integrationsbeskrivning Synkront flöde RIV-TA",
  async_flow: "Integrationsbeskrivning Asynkront flöde"
};

const DEFAULT_INTERACTION: Record<string, string> = {
  http_proxy_sync: "Request-Reply",
  rivta_sync: "Request-Reply",
  async_flow: "One-way"
};

function createDefaultInterface(leg: "app_to_rtjp" | "rtjp_to_app") {
  return {
    id: "",
    leg,
    connection_pattern: "",
    service_roles: {
      producer_system: "",
      consumer_systems: [] as string[]
    },
    data_roles: {},
    data_flow: {},
    security: {},
    endpoint: {
      protocol: "https"
    },
    channel: {}
  };
}

function ensureInterfaces(doc: WizardFormValues) {
  const interfaces = Array.isArray(doc.interfaces) ? [...doc.interfaces] : [];
  while (interfaces.length < 2) {
    interfaces.push(createDefaultInterface(interfaces.length === 0 ? "app_to_rtjp" : "rtjp_to_app"));
  }
  return interfaces.map((item, index) => ({
    ...createDefaultInterface(index === 0 ? "app_to_rtjp" : "rtjp_to_app"),
    ...item,
    service_roles: {
      producer_system: item?.service_roles?.producer_system ?? "",
      consumer_systems: Array.isArray(item?.service_roles?.consumer_systems)
        ? item.service_roles.consumer_systems
        : [],
      ...item?.service_roles
    }
  }));
}

function createDefaultDoc(integrationId: string): WizardFormValues {
  const baseId = integrationId === "new" ? "" : integrationId;
  return {
    template: PATTERN_TEMPLATES.http_proxy_sync,
    metadata_version: "1.0",
    integration: {
      id: baseId,
      title: "",
      pattern: "http_proxy_sync",
      interaction_type: DEFAULT_INTERACTION.http_proxy_sync
    },
    lifecycle: { stage: "draft" },
    systems: {
      app1: { id: "", name: "" },
      rtjp: { id: "rtjp", name: "RTjP" },
      app2: { id: "", name: "" }
    },
    interfaces: ensureInterfaces({ interfaces: [] }),
    environments: {
      test: { endpoint_ref: "", credentials_ref: "", notes: "" },
      qa: { endpoint_ref: "", credentials_ref: "", notes: "" },
      prod: { endpoint_ref: "", credentials_ref: "", notes: "" }
    },
    approvals: {}
  };
}

function normalizeDoc(doc: WizardFormValues, integrationId: string): WizardFormValues {
  const pattern = doc?.integration?.pattern ?? "http_proxy_sync";
  const template = PATTERN_TEMPLATES[pattern] ?? PATTERN_TEMPLATES.http_proxy_sync;
  return {
    ...createDefaultDoc(integrationId),
    ...doc,
    template,
    metadata_version: doc.metadata_version ?? "1.0",
    integration: {
      ...createDefaultDoc(integrationId).integration,
      ...doc.integration,
      pattern,
      interaction_type: doc.integration?.interaction_type ?? DEFAULT_INTERACTION[pattern] ?? DEFAULT_INTERACTION.http_proxy_sync,
      flow_variant: doc.integration?.flow_variant ?? (pattern === "async_flow" ? "Asynkront flöde" : undefined)
    },
    lifecycle: {
      stage: doc.lifecycle?.stage ?? "draft",
      ...doc.lifecycle
    },
    systems: {
      ...createDefaultDoc(integrationId).systems,
      ...doc.systems
    },
    interfaces: ensureInterfaces(doc),
    environments: {
      ...createDefaultDoc(integrationId).environments,
      ...(doc.environments ?? {})
    }
  };
}

export default function WizardClient({ integrationId, initialDoc, initialBody }: WizardClientProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [body, setBody] = useState(initialBody ?? "");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusVariant, setStatusVariant] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultDoc = useMemo(() => {
    if (initialDoc) {
      return normalizeDoc(initialDoc as unknown as WizardFormValues, integrationId);
    }
    return createDefaultDoc(integrationId);
  }, [initialDoc, integrationId]);

  const form = useForm<WizardFormValues>({
    resolver: zodResolver(UnifiedDocForm as any),
    defaultValues: defaultDoc,
    mode: "onChange"
  });

  useEffect(() => {
    form.reset(defaultDoc);
    setBody(initialBody ?? "");
    setActiveStep(0);
  }, [defaultDoc, initialBody, form]);

  const pattern = useWatch({ control: form.control, name: "integration.pattern" });

  useEffect(() => {
    const template = PATTERN_TEMPLATES[String(pattern)] ?? PATTERN_TEMPLATES.http_proxy_sync;
    form.setValue("template", template, { shouldDirty: true, shouldValidate: false });

    const defaultInteraction = DEFAULT_INTERACTION[String(pattern)] ?? DEFAULT_INTERACTION.http_proxy_sync;
    if (!form.getValues("integration.interaction_type")) {
      form.setValue("integration.interaction_type", defaultInteraction, { shouldDirty: false });
    }

    if (String(pattern) === "async_flow" && !form.getValues("integration.flow_variant")) {
      form.setValue("integration.flow_variant", "Asynkront flöde", { shouldDirty: false });
    }

    if (String(pattern) !== "async_flow") {
      form.setValue("integration.flow_variant", undefined, { shouldDirty: false });
    }
  }, [pattern, form]);

  const steps: WizardStepDefinition[] = useMemo(
    () => [
      { id: "overview", title: "Översikt", description: "ID, mönster och livscykel" },
      { id: "systems", title: "System", description: "System som ingår" },
      { id: "service_roles", title: "Service roles", description: "Producenter och konsumenter" },
      { id: "security", title: "Säkerhet", description: "Kanalens skydd" },
      { id: "endpoint", title: "Endpoint", description: "Tekniska parametrar" },
      { id: "data_roles", title: "Data roles", description: "Datakällor och mottagare" },
      { id: "env_params", title: "Miljöer", description: "Hemlighetsreferenser" },
      { id: "review", title: "Review", description: "Granska och spara" }
    ],
    []
  );

  form.watch();
  const values = form.getValues();
  const stage = (values?.lifecycle?.stage ?? "draft") as LifecycleStage;
  const currentStep = steps[activeStep];
  const missingFields = collectMissingFields(values, stage, currentStep.id);

  const missingAcrossStage = useMemo(() => {
    const requirements = REQUIRED_FIELDS[stage] ?? {};
    return Object.keys(requirements).flatMap((stepId) =>
      collectMissingFields(values, stage, stepId as WizardStepId)
    );
  }, [stage, values]);

  const allowSave = missingAcrossStage.length === 0 && Boolean((values?.integration?.id || "").trim());

  const handleNext = useCallback(async () => {
    const requirements = REQUIRED_FIELDS[stage]?.[currentStep.id];
    if (requirements && requirements.length > 0) {
      const valid = await form.trigger(requirements as any, { shouldFocus: true });
      if (!valid) {
        return;
      }
    }

    const updatedMissing = collectMissingFields(form.getValues(), stage, currentStep.id);
    if (updatedMissing.length === 0 && activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  }, [form, activeStep, steps.length, stage, currentStep.id]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepChange = useCallback((index: number) => {
    setActiveStep(index);
  }, []);

  const handleSubmit = form.handleSubmit(async (formValues) => {
    const trimmedId = String(formValues?.integration?.id ?? "").trim();
    if (!trimmedId) {
      setStatusVariant("error");
      setStatusMessage("Du måste ange ett ID för integrationen innan du kan spara.");
      return;
    }

    let parsed;
    try {
      parsed = UnifiedDocForm.parse(formValues);
    } catch (error) {
      setStatusVariant("error");
      setStatusMessage("Validering misslyckades. Säkerställ att obligatoriska fält är ifyllda.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage(null);
      const response = await fetch("/api/integrations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: trimmedId,
          frontmatter: parsed,
          body
        })
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Misslyckades att spara");
      }

      setStatusVariant("success");
      setStatusMessage("Integration sparad.");
      form.reset(parsed as any);
    } catch (error: any) {
      setStatusVariant("error");
      setStatusMessage(error?.message ?? "Ett oväntat fel inträffade vid sparande.");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleSave = useCallback(() => {
    void handleSubmit();
  }, [handleSubmit]);

  let stepContent: JSX.Element;
  switch (currentStep.id) {
    case "overview":
      stepContent = <OverviewStep />;
      break;
    case "systems":
      stepContent = <SystemsStep />;
      break;
    case "service_roles":
      stepContent = <ServiceRolesStep />;
      break;
    case "security":
      stepContent = <SecurityStep />;
      break;
    case "endpoint":
      stepContent = <EndpointStep />;
      break;
    case "data_roles":
      stepContent = <DataRolesStep />;
      break;
    case "env_params":
      stepContent = <EnvParamsStep />;
      break;
    case "review":
    default:
      stepContent = <ReviewStep body={body} onBodyChange={setBody} />;
      break;
  }

  return (
    <FormProvider {...form}>
      <WizardLayout
        steps={steps}
        activeStep={activeStep}
        onStepChange={handleStepChange}
        onNext={handleNext}
        onBack={handleBack}
        onSave={handleSave}
        isNextDisabled={missingFields.length > 0}
        isSubmitting={isSubmitting}
        allowSave={allowSave}
        missingFields={missingFields}
        statusMessage={statusMessage}
        statusVariant={statusVariant}
      >
        {stepContent}
      </WizardLayout>
    </FormProvider>
  );
}
