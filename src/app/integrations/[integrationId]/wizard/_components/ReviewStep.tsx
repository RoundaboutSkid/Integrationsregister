"use client";

import { useWatch, useFormContext } from "react-hook-form";

interface ReviewStepProps {
  body: string;
  onBodyChange: (value: string) => void;
}

export default function ReviewStep({ body, onBodyChange }: ReviewStepProps) {
  const form = useFormContext();
  const values = useWatch({ control: form.control });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Granska & Spara</h1>
      <p style={{ color: "#4b5563", marginBottom: "2rem" }}>
        Kontrollera frontmatter och komplettera eventuell fri text innan du sparar.
      </p>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.5rem" }}>Frontmatter</h2>
          <pre
            style={{
              backgroundColor: "#0f172a",
              color: "#f8fafc",
              padding: "1rem",
              borderRadius: "0.75rem",
              overflowX: "auto",
              maxHeight: "320px"
            }}
          >
            {JSON.stringify(values, null, 2)}
          </pre>
        </div>
        <div>
          <h2 style={{ marginBottom: "0.5rem" }}>Dokumentation (Markdown)</h2>
          <textarea
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            rows={12}
            placeholder="## Exempel
- Beskrivning av flödet"
            style={{ width: "100%", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #d1d5db", resize: "vertical" }}
          />
        </div>
      </div>
    </div>
  );
}
