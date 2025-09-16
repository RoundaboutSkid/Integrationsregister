"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

const encryptionOptions = [
  "Okrypterad kanal",
  "Krypterad kanal med publik nyckel"
] as const;

const serverIdentificationOptions = [
  "Anonym server",
  "Serveridentifiering med publik nyckel"
] as const;

const accessControlOptions = [
  "Username/Password",
  "API-nyckel",
  "Klientcertifikat",
  "OAuth2/OIDC",
  "Private Key JWT",
  "SSH Public Key Authentication"
] as const;

export default function SecurityStep() {
  const { register, control } = useFormContext();
  const { fields } = useFieldArray({ control, name: "interfaces" });

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Säkerhet</h1>
      <p style={{ color: "#4b5563", marginBottom: "2rem" }}>
        Specificera säkerhetsnivå för respektive ben enligt valt mönster.
      </p>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {fields.map((field, index) => (
          <div key={field.id} style={{ border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <h2 style={{ margin: "0 0 1rem" }}>Ben {index + 1}</h2>
            <label style={{ display: "block", marginBottom: "1rem" }}>
              <span>Kryptering</span>
              <select
                {...register(`interfaces.${index}.security.encryption` as const)}
                style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
              >
                <option value="">Välj...</option>
                {encryptionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "block", marginBottom: "1rem" }}>
              <span>Serveridentifiering</span>
              <select
                {...register(`interfaces.${index}.security.server_identification` as const)}
                style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
              >
                <option value="">Välj...</option>
                {serverIdentificationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "block" }}>
              <span>Åtkomstkontroll</span>
              <select
                {...register(`interfaces.${index}.security.access_control` as const)}
                style={{ width: "100%", marginTop: "0.35rem", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #d1d5db" }}
              >
                <option value="">Välj...</option>
                {accessControlOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
