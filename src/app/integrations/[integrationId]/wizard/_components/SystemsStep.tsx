"use client";

import { useFormContext } from "react-hook-form";

const systems = [
  { key: "app1", label: "App 1", description: "Producer eller källa i första benet" },
  { key: "rtjp", label: "RTjP", description: "Tjänsteplattformen" },
  { key: "app2", label: "App 2", description: "Mottagare eller mål i andra benet" }
] as const;

export default function SystemsStep() {
  const { register } = useFormContext();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>System</h1>
      <p style={{ color: "#4b5563", marginBottom: "2rem" }}>
        Identifiera de system som ingår i integrationen. ID används i dokumentationen och Neo4j-indexet.
      </p>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {systems.map((system) => (
          <div key={system.key} style={{ border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <h2 style={{ margin: "0 0 0.5rem" }}>{system.label}</h2>
            <p style={{ margin: 0, color: "#6b7280" }}>{system.description}</p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <label style={{ flex: 1 }}>
                <span>System-ID</span>
                <input
                  {...register(`systems.${system.key}.id` as const)}
                  placeholder={`${system.key}`}
                  style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                />
              </label>
              <label style={{ flex: 1 }}>
                <span>Visningsnamn</span>
                <input
                  {...register(`systems.${system.key}.name` as const)}
                  placeholder={`${system.label}`}
                  style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                />
              </label>
            </div>
            <label style={{ display: "block", marginTop: "1rem" }}>
              <span>Kontakt / ansvarig</span>
              <input
                {...register(`systems.${system.key}.owner` as const)}
                placeholder="team@example.se"
                style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
