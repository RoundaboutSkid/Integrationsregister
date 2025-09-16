"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

const asyncProtocols = ["http", "https", "ftp", "sftp", "file", "jms", "mllp", "smtp"] as const;
const asyncChannelTypes = ["jms", "fileshare", "smtp", "mllp"] as const;

export default function EndpointStep() {
  const form = useFormContext();
  const pattern = useWatch({ control: form.control, name: "integration.pattern" });
  const { fields } = useFieldArray({ control: form.control, name: "interfaces" });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Endpoint & Channel</h1>
      <p style={{ color: "#4b5563", marginBottom: "2rem" }}>
        Specificera tekniska anslutningsuppgifter för respektive ben.
      </p>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {fields.map((field, index) => (
          <div key={field.id} style={{ border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <h2 style={{ margin: "0 0 1rem" }}>Ben {index + 1}</h2>
            {pattern === "async_flow" ? (
              <label style={{ display: "block", marginBottom: "1rem" }}>
                <span>Protokoll</span>
                <select
                  {...form.register(`interfaces.${index}.endpoint.protocol` as const)}
                  style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                >
                  <option value="">Välj...</option>
                  {asyncProtocols.map((value) => (
                    <option key={value} value={value}>
                      {value.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <input type="hidden" value="https" {...form.register(`interfaces.${index}.endpoint.protocol` as const)} />
            )}
            <div style={{ display: "grid", gap: "1rem" }}>
              <label>
                <span>URL</span>
                <input
                  {...form.register(`interfaces.${index}.endpoint.url` as const)}
                  placeholder="https://gateway/..."
                  style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                />
              </label>
              {pattern === "async_flow" ? (
                <>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <label style={{ flex: 2 }}>
                      <span>Host</span>
                      <input
                        {...form.register(`interfaces.${index}.endpoint.host` as const)}
                        placeholder="server.example.se"
                        style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                      />
                    </label>
                    <label style={{ flex: 1 }}>
                      <span>Port</span>
                      <input
                        {...form.register(`interfaces.${index}.endpoint.port` as const, { valueAsNumber: true })}
                        type="number"
                        placeholder="443"
                        style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                      />
                    </label>
                  </div>
                  <label>
                    <span>Sökväg</span>
                    <input
                      {...form.register(`interfaces.${index}.endpoint.path` as const)}
                      placeholder="/queue/example"
                      style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                    />
                  </label>
                  <label>
                    <span>Metod / Operation</span>
                    <input
                      {...form.register(`interfaces.${index}.endpoint.method` as const)}
                      placeholder="GET / PUT / SEND"
                      style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                    />
                  </label>
                  <label>
                    <span>Destinationstyp</span>
                    <select
                      {...form.register(`interfaces.${index}.endpoint.destination_type` as const)}
                      style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                    >
                      <option value="">Välj...</option>
                      <option value="queue">Queue</option>
                      <option value="topic">Topic</option>
                    </select>
                  </label>
                  <label>
                    <span>Channel</span>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.35rem" }}>
                      <select
                        {...form.register(`interfaces.${index}.channel.type` as const)}
                        style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                      >
                        <option value="">Typ...</option>
                        {asyncChannelTypes.map((value) => (
                          <option key={value} value={value}>
                            {value.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <input
                        {...form.register(`interfaces.${index}.channel.name` as const)}
                        placeholder="queue/input"
                        style={{ flex: 2, padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
                      />
                    </div>
                  </label>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
