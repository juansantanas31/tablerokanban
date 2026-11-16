"use client";

import type { Tarjeta, Columna } from "@/schemas/tarjeta.schema";
import { Icon } from "@/components/Icon/Icon";
import styles from "./TarjetaDetalleContenido.module.css";

interface TarjetaDetalleContenidoProps {
  tarjeta: Tarjeta;
  columnas?: Columna[];
  tableroNombre?: string;
  onCerrar?: () => void;
}

/**
 * Componente que muestra los detalles reales de una tarjeta según el esquema de datos del proyecto (Sección 8 y 9.4).
 * Presenta únicamente datos verídicos: título, descripción, columna, posición, etiquetas y fechas reales.
 */
export function TarjetaDetalleContenido({
  tarjeta,
  columnas = [],
  tableroNombre = "Tablero Kanban",
  onCerrar,
}: TarjetaDetalleContenidoProps) {
  const columna = columnas.find((c) => c.id === tarjeta.columnaId);
  const nombreColumna = columna ? columna.nombre : tarjeta.columnaId;

  // Prioridad real basada en etiquetas
  const esUrgente = tarjeta.etiquetas.includes("urgente");
  const esImportante = tarjeta.etiquetas.includes("importante");
  const tienePrioridad = esUrgente || esImportante;
  const textoPrioridad = esUrgente ? "Alta" : "Media";

  // Formato de fecha de creación
  const fechaCreacionTexto = tarjeta.creadoEn
    ? new Date(tarjeta.creadoEn).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "No registrada";

  return (
    <div className={styles.container}>
      {/* SubBar superior con ID y Columna real */}
      <div className={styles.subBar}>
        <div className={styles.subBarLeft}>
          <span className={styles.codeBadge}>{tarjeta.id}</span>
          <span className={styles.breadcrumb}>
            {tableroNombre} / {nombreColumna}
          </span>
        </div>

        <div className={styles.subBarRight}>
          <div className={styles.statusPillBtn}>
            <span className={styles.statusDot} />
            <span>{nombreColumna}</span>
          </div>

          {onCerrar && (
            <button
              type="button"
              onClick={onCerrar}
              className={styles.menuToggleBtn}
              aria-label="Cerrar modal"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Título y Descripción reales */}
      <div>
        <h2 className={styles.title}>{tarjeta.titulo}</h2>
        <p className={styles.description} style={{ marginTop: "0.5rem" }}>
          {tarjeta.descripcion && tarjeta.descripcion.trim().length > 0
            ? tarjeta.descripcion
            : "Esta tarjeta no tiene una descripción detallada."}
        </p>
      </div>

      {/* Metadatos reales del esquema Zod (Sección 8) */}
      <section className={styles.bentoGrid} aria-label="Metadatos reales de la tarea">
        <div className={styles.bentoRow}>
          <span className={styles.bentoLabel}>
            <Icon name="view_kanban" size={16} />
            Columna actual
          </span>
          <span className={styles.bentoValue} style={{ fontWeight: 600 }}>
            {nombreColumna}
          </span>
        </div>

        <div className={styles.divider} />

        <div className={styles.bentoRow}>
          <span className={styles.bentoLabel}>
            <Icon name="analytics" size={16} />
            Posición decimal (orden)
          </span>
          <span className={styles.bentoValue} style={{ fontFamily: "var(--font-mono)" }}>
            {tarjeta.posicion}
          </span>
        </div>

        {tienePrioridad && (
          <>
            <div className={styles.divider} />
            <div className={styles.bentoRow}>
              <span className={styles.bentoLabel}>
                <Icon name="signal_cellular_alt" size={16} />
                Prioridad
              </span>
              <span className={styles.bentoValue}>
                <span className={styles.priorityBadge}>
                  <Icon
                    name={esUrgente ? "keyboard_double_arrow_up" : "drag_handle"}
                    size={12}
                  />
                  <span>{textoPrioridad}</span>
                </span>
              </span>
            </div>
          </>
        )}

        <div className={styles.divider} />

        <div className={styles.bentoSplit}>
          <div className={styles.bentoMiniCard}>
            <span className={styles.bentoMiniLabel}>Fecha de creación</span>
            <span className={styles.bentoMiniValue}>
              <Icon name="calendar_today" size={14} />
              <time dateTime={tarjeta.creadoEn}>{fechaCreacionTexto}</time>
            </span>
          </div>

          <div className={styles.bentoMiniCard}>
            <span className={styles.bentoMiniLabel}>Fecha límite</span>
            <span className={styles.bentoMiniValue}>
              <Icon name="schedule" size={14} />
              {tarjeta.vence ? (
                <time dateTime={tarjeta.vence}>{tarjeta.vence}</time>
              ) : (
                <span style={{ color: "var(--text-muted)" }}>Sin fecha límite</span>
              )}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bentoRow}>
          <span className={styles.bentoLabel}>
            <Icon name="checklist" size={16} />
            Etiquetas asignadas
          </span>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
            {tarjeta.etiquetas && tarjeta.etiquetas.length > 0 ? (
              tarjeta.etiquetas.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    fontWeight: 700,
                  }}
                >
                  {tag}
                </span>
              ))
            ) : (
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Sin etiquetas
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
