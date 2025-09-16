"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";

function asCsv(value: string[] | undefined) {
  if (!value || value.length === 0) {
    return "";
  }
  return value.join(", ");
}

function toArray(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ServiceRolesStep() {
  const { control, register } = useFormContext();
  const { fields } = useFieldArray({ control, name: "interfaces" });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Service Roles</h1>
      <p style={{ color: "#4b5563", marginBottom: "2rem" }}>
        Ange ansvariga system per ben. Du kan skriva flera konsumenter separerade med komma.
      </p>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {fields.map((field, index) => (
          <div key={field.id} style={{ border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <h2 style={{ margin: "0 0 0.5rem" }}>Ben {index + 1}</h2>
            <p style={{ margin: 0, color: "#6b7280" }}>Leg: {field.leg ?? ""}</p>
            <label style={{ display: "block", marginTop: "1rem" }}>
              <span>Connection pattern</span>
              <input
                {...register(`interfaces.${index}.connection_pattern` as const)}
                placeholder="Ta emot från ..."
                style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
              />
            </label>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <label style={{ flex: 1 }}>
                <span>Producer</span>
                <input
                  {...register(`interfaces.${index}.service_roles.producer_system` as const)}
                  placeholder="system-id"
                  style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                />
              </label>
              <Controller
                control={control}
                name={`interfaces.${index}.service_roles.consumer_systems` as const}
                render={({ field: controllerField }) => (
                  <label style={{ flex: 1 }}>
                    <span>Konsumenter</span>
                    <input
                      value={asCsv(controllerField.value)}
                      onChange={(event) => controllerField.onChange(toArray(event.target.value))}
                      placeholder="system-a, system-b"
                      style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                    />
                  </label>
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
