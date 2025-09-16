"use client";

import { useFormContext } from "react-hook-form";

const environments = [
  { key: "test", label: "Test" },
  { key: "qa", label: "QA" },
  { key: "prod", label: "Prod" }
] as const;

export default function EnvParamsStep() {
  const { register } = useFormContext();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Miljöparametrar</h1>
      <p style={{ color: "#4b5563", marginBottom: "2rem" }}>
        Ange referenser till hemligheter och miljöspecifika parametrar för respektive miljö.
      </p>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {environments.map((env) => (
          <div key={env.key} style={{ border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <h2 style={{ margin: "0 0 1rem" }}>{env.label}</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              <label>
                <span>Endpoint ref</span>
                <input
                  {...register(`environments.${env.key}.endpoint_ref` as const)}
                  placeholder={`secret://${env.key}/endpoint`}
                  style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                />
              </label>
              <label>
                <span>Credentials ref</span>
                <input
                  {...register(`environments.${env.key}.credentials_ref` as const)}
                  placeholder={`secret://${env.key}/credentials`}
                  style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                />
              </label>
              <label>
                <span>Övrigt</span>
                <textarea
                  {...register(`environments.${env.key}.notes` as const)}
                  rows={3}
                  placeholder="Valfria instruktioner"
                  style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db", resize: "vertical" }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
