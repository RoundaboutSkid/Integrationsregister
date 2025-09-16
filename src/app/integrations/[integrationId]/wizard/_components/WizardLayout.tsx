"use client";

import type { ReactNode } from "react";
import type { WizardStepId } from "@/lib/stage/requirements";

export interface WizardStepDefinition {
  id: WizardStepId;
  title: string;
  description?: string;
}

interface WizardLayoutProps {
  steps: WizardStepDefinition[];
  activeStep: number;
  onStepChange: (index: number) => void;
  onNext: () => void;
  onBack: () => void;
  onSave: () => void;
  isNextDisabled: boolean;
  isSubmitting: boolean;
  allowSave: boolean;
  children: ReactNode;
  missingFields: string[];
  statusMessage?: string | null;
  statusVariant?: "success" | "error";
}

export default function WizardLayout({
  steps,
  activeStep,
  onStepChange,
  onNext,
  onBack,
  onSave,
  isNextDisabled,
  isSubmitting,
  allowSave,
  children,
  missingFields,
  statusMessage,
  statusVariant
}: WizardLayoutProps) {
  const statusColors = statusVariant === "success"
    ? { background: "#dcfce7", color: "#14532d", border: "#22c55e" }
    : { background: "#fee2e2", color: "#b91c1c", border: "#f87171" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "2rem", alignItems: "start" }}>
      <aside style={{ backgroundColor: "#ffffff", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.25rem" }}>Steg</h2>
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => onStepChange(index)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    width: "100%",
                    border: "none",
                    textAlign: "left",
                    background: isActive ? "#eef2ff" : "transparent",
                    color: isActive ? "#312e81" : "#1f2933",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    cursor: "pointer",
                    fontWeight: isActive ? 600 : 500,
                    boxShadow: isActive ? "inset 0 0 0 1px #4338ca" : "inset 0 0 0 1px #e5e7eb"
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "9999px",
                      background: isCompleted ? "#22c55e" : isActive ? "#4338ca" : "#e5e7eb",
                      color: isCompleted || isActive ? "#ffffff" : "#374151",
                      fontSize: "0.9rem",
                      fontWeight: 600
                    }}
                  >
                    {index + 1}
                  </span>
                  <span>
                    <div>{step.title}</div>
                    {step.description ? (
                      <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.25rem" }}>{step.description}</div>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>
      <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: "0.75rem", padding: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          {children}
        </div>
        <footer style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {statusMessage ? (
            <div
              style={{
                backgroundColor: statusColors.background,
                color: statusColors.color,
                border: `1px solid ${statusColors.border}`,
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem"
              }}
            >
              {statusMessage}
            </div>
          ) : null}
          {missingFields.length > 0 ? (
            <div style={{ backgroundColor: "#fef3c7", color: "#92400e", padding: "0.75rem 1rem", borderRadius: "0.75rem" }}>
              <strong>Obligatoriska fält saknas:</strong>
              <ul style={{ margin: "0.5rem 0 0 1.25rem" }}>
                {missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={onBack}
              disabled={activeStep === 0 || isSubmitting}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                cursor: activeStep === 0 || isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              Tillbaka
            </button>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={onNext}
                disabled={isSubmitting || isNextDisabled || activeStep === steps.length - 1}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #4338ca",
                  backgroundColor: isNextDisabled || activeStep === steps.length - 1 ? "#f3f4f6" : "#eef2ff",
                  color: "#312e81",
                  cursor: isNextDisabled || activeStep === steps.length - 1 ? "not-allowed" : "pointer"
                }}
              >
                Nästa
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={!allowSave || isSubmitting}
                style={{
                  padding: "0.75rem 1.75rem",
                  borderRadius: "0.75rem",
                  border: "none",
                  backgroundColor: allowSave && !isSubmitting ? "#4338ca" : "#d1d5db",
                  color: "#ffffff",
                  cursor: allowSave && !isSubmitting ? "pointer" : "not-allowed",
                  fontWeight: 600
                }}
              >
                {isSubmitting ? "Sparar..." : "Spara"}
              </button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
