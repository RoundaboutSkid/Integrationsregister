"use client";

import { useFormContext } from "react-hook-form";

const patterns = [
  { value: "http_proxy_sync", label: "HTTP Proxy" },
  { value: "rivta_sync", label: "RIV-TA" },
  { value: "async_flow", label: "Asynkront flöde" }
];

const interactionTypes = {
  http_proxy_sync: ["One-way", "Request-Reply"],
  rivta_sync: ["One-way", "Request-Reply"],
  async_flow: ["One-way", "Publish-Subscribe"]
} as const;

const lifecycleStages = [
  { value: "draft", label: "Draft" },
  { value: "design_review", label: "Design Review" },
  { value: "approved", label: "Approved" },
  { value: "test_ready", label: "Test Ready" },
  { value: "qa_ready", label: "QA Ready" },
  { value: "prod_ready", label: "Prod Ready" },
  { value: "operational", label: "Operational" }
];

export default function OverviewStep() {
  const { register, watch } = useFormContext();
  const pattern = watch("integration.pattern") || "http_proxy_sync";

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Översikt</h1>
      <p style={{ color: "#4b5563", marginBottom: "2rem" }}>
        Beskriv integrationens identitet, mönster och nuvarande livscykelsteg.
      </p>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <label style={{ flex: 1 }}>
            <span>ID</span>
            <input
              {...register("integration.id")}
              placeholder="ie-sample-001"
              style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
            />
          </label>
          <label style={{ flex: 1 }}>
            <span>Titel</span>
            <input
              {...register("integration.title")}
              placeholder="Ny integration"
              style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
            />
          </label>
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <label style={{ flex: 1 }}>
            <span>Mönster</span>
            <select
              {...register("integration.pattern")}
              style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
            >
              {patterns.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ flex: 1 }}>
            <span>Interaktionstyp</span>
            <select
              {...register("integration.interaction_type")}
              style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
            >
              {(interactionTypes as Record<string, readonly string[]>)[pattern]?.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        {pattern === "async_flow" ? (
          <label>
            <span>Flödesvariant</span>
            <select
              {...register("integration.flow_variant")}
              style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
            >
              <option value="Asynkront flöde">Asynkront flöde</option>
              <option value="Asynkront flöde med bearbetning">Asynkront flöde med bearbetning</option>
            </select>
          </label>
        ) : null}
        <label>
          <span>Livscykel</span>
          <select
            {...register("lifecycle.stage")}
            style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
          >
            {lifecycleStages.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Template</span>
          <input
            {...register("template")}
            readOnly
            style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db", backgroundColor: "#f9fafb" }}
          />
        </label>
      </div>
    </div>
  );
}
