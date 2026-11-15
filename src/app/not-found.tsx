import Link from "next/link";

export default function NotFound() {
  return (
    <div
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
      <h1 style={{ fontSize: "2.5rem", fontWeight: 800 }}>404 — No Encontrado</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
        El recurso o tablero que estás buscando no existe o no tienes permisos para acceder a él.
      </p>
      <Link
        href="/tableros"
        style={{
          display: "inline-block",
          backgroundColor: "var(--color-primary)",
          color: "#ffffff",
          padding: "0.75rem 1.5rem",
          borderRadius: "var(--radius-sm)",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        Ir a Mis Tableros
      </Link>
    </div>
  );
}
