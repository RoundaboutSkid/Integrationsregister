export type LifecycleStage =
  | "draft"
  | "design_review"
  | "approved"
  | "test_ready"
  | "qa_ready"
  | "prod_ready"
  | "operational";

export type WizardStepId =
  | "overview"
  | "systems"
  | "service_roles"
  | "security"
  | "endpoint"
  | "data_roles"
  | "env_params"
  | "review";

type StepRequirements = Partial<Record<WizardStepId, string[]>>;
export type StageRequirementMap = Record<LifecycleStage, StepRequirements>;

function requiredFieldsFor(...fields: string[]): string[] {
  return fields;
}

export const REQUIRED_FIELDS: StageRequirementMap = {
  draft: {
    overview: requiredFieldsFor("integration.id", "integration.title", "integration.pattern"),
    systems: requiredFieldsFor("systems.app1", "systems.rtjp", "systems.app2")
  },
  design_review: {
    overview: requiredFieldsFor("integration.id", "integration.title", "integration.pattern", "integration.interaction_type"),
    systems: requiredFieldsFor("systems.app1", "systems.rtjp", "systems.app2"),
    service_roles: requiredFieldsFor("interfaces", "interfaces.0.service_roles.producer_system", "interfaces.0.service_roles.consumer_systems")
  },
  approved: {
    overview: requiredFieldsFor("integration.id", "integration.title", "integration.pattern", "integration.interaction_type"),
    systems: requiredFieldsFor("systems.app1", "systems.rtjp", "systems.app2"),
    service_roles: requiredFieldsFor("interfaces", "interfaces.0.service_roles.producer_system", "interfaces.0.service_roles.consumer_systems"),
    security: requiredFieldsFor("interfaces.0.security.encryption", "interfaces.0.security.server_identification", "interfaces.0.security.access_control")
  },
  test_ready: {
    overview: requiredFieldsFor("integration.id", "integration.title", "integration.pattern", "integration.interaction_type"),
    systems: requiredFieldsFor("systems.app1", "systems.rtjp", "systems.app2"),
    service_roles: requiredFieldsFor("interfaces", "interfaces.0.service_roles.producer_system", "interfaces.0.service_roles.consumer_systems"),
    security: requiredFieldsFor("interfaces.0.security.encryption", "interfaces.0.security.server_identification", "interfaces.0.security.access_control"),
    endpoint: requiredFieldsFor("interfaces.0.endpoint")
  },
  qa_ready: {
    overview: requiredFieldsFor("integration.id", "integration.title", "integration.pattern", "integration.interaction_type"),
    systems: requiredFieldsFor("systems.app1", "systems.rtjp", "systems.app2"),
    service_roles: requiredFieldsFor("interfaces", "interfaces.0.service_roles.producer_system", "interfaces.0.service_roles.consumer_systems"),
    security: requiredFieldsFor("interfaces.0.security.encryption", "interfaces.0.security.server_identification", "interfaces.0.security.access_control"),
    endpoint: requiredFieldsFor("interfaces.0.endpoint"),
    env_params: requiredFieldsFor("environments")
  },
  prod_ready: {
    overview: requiredFieldsFor("integration.id", "integration.title", "integration.pattern", "integration.interaction_type"),
    systems: requiredFieldsFor("systems.app1", "systems.rtjp", "systems.app2"),
    service_roles: requiredFieldsFor("interfaces", "interfaces.0.service_roles.producer_system", "interfaces.0.service_roles.consumer_systems"),
    security: requiredFieldsFor("interfaces.0.security.encryption", "interfaces.0.security.server_identification", "interfaces.0.security.access_control"),
    endpoint: requiredFieldsFor("interfaces.0.endpoint"),
    env_params: requiredFieldsFor("environments.prod")
  },
  operational: {
    overview: requiredFieldsFor("integration.id", "integration.title", "integration.pattern", "integration.interaction_type"),
    systems: requiredFieldsFor("systems.app1", "systems.rtjp", "systems.app2"),
    service_roles: requiredFieldsFor("interfaces", "interfaces.0.service_roles.producer_system", "interfaces.0.service_roles.consumer_systems"),
    security: requiredFieldsFor("interfaces.0.security.encryption", "interfaces.0.security.server_identification", "interfaces.0.security.access_control"),
    endpoint: requiredFieldsFor("interfaces.0.endpoint"),
    env_params: requiredFieldsFor("environments.prod"),
    review: requiredFieldsFor("approvals.ops", "approvals.security")
  }
};

export function collectMissingFields(values: Record<string, unknown>, stage: LifecycleStage, step: WizardStepId): string[] {
  const requirements = REQUIRED_FIELDS[stage]?.[step];
  if (!requirements || requirements.length === 0) {
    return [];
  }

  return requirements.filter((path) => {
    const value = path.split(".").reduce<unknown>((acc, key) => {
      if (acc === undefined || acc === null) {
        return undefined;
      }
      if (typeof acc !== "object") {
        return undefined;
      }
      if (Array.isArray(acc)) {
        const index = Number.parseInt(key, 10);
        if (Number.isNaN(index) || index >= acc.length) {
          return undefined;
        }
        return acc[index];
      }
      return (acc as Record<string, unknown>)[key];
    }, values);

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === "string") {
      return value.trim().length === 0;
    }

    return value === undefined || value === null;
  });
}
