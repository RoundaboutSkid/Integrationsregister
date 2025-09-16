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

export default function DataRolesStep() {
  const { register, control } = useFormContext();
  const { fields } = useFieldArray({ control, name: "interfaces" });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Data Roles</h1>
      <p style={{ color: "#4b5563", marginBottom: "2rem" }}>
        Beskriv datakällor och -mottagare. Detta används för att härleda producer/consumer vs. source/target.
      </p>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {fields.map((field, index) => (
          <div key={field.id} style={{ border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <h2 style={{ margin: "0 0 1rem" }}>Ben {index + 1}</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              <label>
                <span>Publisher</span>
                <input
                  {...register(`interfaces.${index}.data_roles.publisher_system` as const)}
                  placeholder="system-id"
                  style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                />
              </label>
              <Controller
                control={control}
                name={`interfaces.${index}.data_roles.subscriber_systems` as const}
                render={({ field: controllerField }) => (
                  <label>
                    <span>Subscribers (kommaseparerat)</span>
                    <input
                      value={asCsv(controllerField.value)}
                      onChange={(event) => controllerField.onChange(toArray(event.target.value))}
                      placeholder="system-a, system-b"
                      style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                    />
                  </label>
                )}
              />
              <label>
                <span>Data source</span>
                <input
                  {...register(`interfaces.${index}.data_roles.source_system` as const)}
                  placeholder="system-id"
                  style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                />
              </label>
              <label>
                <span>Data target</span>
                <input
                  {...register(`interfaces.${index}.data_roles.target_system` as const)}
                  placeholder="system-id"
                  style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
