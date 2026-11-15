"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div
      role="alert"
      style={{
        maxWidth: "600px",
        margin: "4rem auto",
        padding: "2rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        alignItems: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-error)" }}>
        Algo salió mal
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
        Ocurrió un error inesperado al procesar la solicitud.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        style={{
          backgroundColor: "var(--color-primary)",
          color: "#ffffff",
          border: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: "var(--radius-sm)",
          fontWeight: 700,
          cursor: "pointer",
          minHeight: "44px",
        }}
      >
        Reintentar
      </button>
    </div>
  );
}
