"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tablero, TableroSchema } from "@/schemas/tarjeta.schema";
import { ModalDialog } from "@/components/Modal/ModalDialog";
import { AriaLiveAnnouncer } from "@/components/AriaLive/AriaLiveAnnouncer";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import styles from "./tableros.module.css";

const TABLERO_INICIAL: Tablero = {
  id: "tablero-demo-1",
  nombre: "Sprint 1 - Tablero de Organización",
  columnas: [
    { id: "col-por-hacer", nombre: "Por hacer", limiteWip: 10 },
    { id: "col-en-curso", nombre: "En curso", limiteWip: 3 },
    { id: "col-hecho", nombre: "Hecho", limiteWip: 50 },
  ],
  creadoEn: "2026-11-15T09:00:00.000Z",
};

export default function TablerosPage() {
  const [tableros, setTableros] = useLocalStorage<Tablero[]>("kanban_tableros", [
    TABLERO_INICIAL,
  ]);
  const [ultimoTableroId, setUltimoTableroId] = useLocalStorage<string | null>(
    "kanban_ultimo_tablero",
    "tablero-demo-1"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [anuncio, setAnuncio] = useState("Página de tableros lista");

  useEffect(() => {
    // Si no hay tableros guardados, inicializar con el inicial
    if (tableros.length === 0) {
      setTableros([TABLERO_INICIAL]);
    }
  }, [tableros.length, setTableros]);

  const handleCrearTablero = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNombre("");

    const nombreLimpio = nuevoNombre.trim();
    if (nombreLimpio.length < 1 || nombreLimpio.length > 100) {
      setErrorNombre("El nombre del tablero debe tener entre 1 y 100 caracteres.");
      return;
    }

    const nuevoTablero: Tablero = {
      id: `tablero-${Date.now()}`,
      nombre: nombreLimpio,
      columnas: [
        { id: `col-por-hacer-${Date.now()}`, nombre: "Por hacer", limiteWip: 10 },
        { id: `col-en-curso-${Date.now()}`, nombre: "En curso", limiteWip: 5 },
        { id: `col-hecho-${Date.now()}`, nombre: "Hecho" },
      ],
      creadoEn: new Date().toISOString(),
    };

    const validacion = TableroSchema.safeParse(nuevoTablero);
    if (!validacion.success) {
      setErrorNombre("Error al validar el tablero nuevo.");
      return;
    }

    setTableros((prev) => [...prev, validacion.data]);
    setUltimoTableroId(nuevoTablero.id);
    setAnuncio(`Tablero "${nuevoTablero.nombre}" creado exitosamente.`);
    setIsModalOpen(false);
    setNuevoNombre("");
  };

  return (
    <div className={styles.container}>
      <AriaLiveAnnouncer mensaje={anuncio} />

      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Mis Tableros</h1>
          {ultimoTableroId && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Último tablero visitado:{" "}
              <strong>
                {tableros.find((t) => t.id === ultimoTableroId)?.nombre || ultimoTableroId}
              </strong>
            </p>
          )}
        </div>

        <button
          type="button"
          className={styles.createButton}
          onClick={() => setIsModalOpen(true)}
          aria-haspopup="dialog"
        >
          + Nuevo Tablero
        </button>
      </div>

      <ul className={styles.boardsGrid} aria-label="Lista de tableros">
        {tableros.map((t) => (
          <li key={t.id}>
            <article className={styles.boardCard}>
              <h2 className={styles.boardTitle}>{t.nombre}</h2>
              <div className={styles.boardMeta}>
                <span>Columnas: {t.columnas.length}</span>
              </div>
              <div className={styles.columnsPreview}>
                {t.columnas.map((col) => (
                  <span key={col.id} className={styles.columnPill}>
                    {col.nombre}
                  </span>
                ))}
              </div>
              <Link
                href={`/tableros/${t.id}`}
                className={styles.openLink}
                onClick={() => setUltimoTableroId(t.id)}
              >
                Abrir Tablero
              </Link>
            </article>
          </li>
        ))}
      </ul>

      {/* Modal para crear tablero con <dialog> */}
      <ModalDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        titulo="Crear Nuevo Tablero"
      >
        <form onSubmit={handleCrearTablero} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label htmlFor="nombre-tablero" style={{ fontWeight: 700, fontSize: "0.875rem" }}>
              Nombre del Tablero *
            </label>
            <input
              id="nombre-tablero"
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Ej: Sprint 2 - Funcionalidades Clave"
              maxLength={100}
              required
              aria-invalid={!!errorNombre}
              aria-describedby={errorNombre ? "error-nombre-tablero" : undefined}
              style={{
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                fontSize: "1rem",
                minHeight: "44px",
              }}
            />
            {errorNombre && (
              <span id="error-nombre-tablero" role="alert" style={{ color: "var(--color-error)", fontSize: "0.8125rem" }}>
                {errorNombre}
              </span>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                minHeight: "44px",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 1.25rem",
                fontWeight: 700,
                cursor: "pointer",
                minHeight: "44px",
              }}
            >
              Crear Tablero
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}
