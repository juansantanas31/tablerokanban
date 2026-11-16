"use client";

import { useState } from "react";
import { Tarjeta as TarjetaTipo, Columna as ColumnaTipo } from "@/schemas/tarjeta.schema";
import styles from "./Tarjeta.module.css";

interface TarjetaProps {
  tarjeta: TarjetaTipo;
  columnasDisponibles?: ColumnaTipo[];
  onMoverTeclado?: (tarjetaId: string, columnaDestinoId: string) => void;
  onVerDetalle?: (id: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLElement>, tarjetaId: string) => void;
  onDragEnd?: (e: React.DragEvent<HTMLElement>) => void;
}

export function Tarjeta({
  tarjeta,
  columnasDisponibles = [],
  onMoverTeclado,
  onVerDetalle,
  onDragStart,
  onDragEnd,
}: TarjetaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", tarjeta.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(e, tarjeta.id);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLElement>) => {
    setIsDragging(false);
    onDragEnd?.(e);
  };

  const otrasColumnas = columnasDisponibles.filter((c) => c.id !== tarjeta.columnaId);

  // Generar código estilo Linear tipo LIN-XXXX
  const codigoLinear = tarjeta.id.startsWith("tarjeta-")
    ? `LIN-${tarjeta.id.replace("tarjeta-", "").slice(-4)}`
    : `LIN-1042`;

  const esUrgente = tarjeta.etiquetas.includes("urgente");
  const esImportante = tarjeta.etiquetas.includes("importante");

  // Asignado simulado
  const asignado = {
    nombre: "Elena M.",
    iniciales: "EM",
  };

  return (
    <li className={styles.cardItem}>
      <article
        className={`${styles.card} ${isDragging ? styles.cardDragging : ""}`}
        aria-labelledby={`tarjeta-titulo-${tarjeta.id}`}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        tabIndex={0}
      >
        {/* Top Meta Row */}
        <div className={styles.topMeta}>
          <div className={styles.idAndTag}>
            <span className={styles.cardCode}>{codigoLinear}</span>
            {tarjeta.etiquetas.length > 0 && (
              <span className={styles.tagBadge}>
                {tarjeta.etiquetas[0]}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {esUrgente ? (
              <span className={`${styles.priorityBadge} ${styles.priorityHigh}`}>
                <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
                  keyboard_double_arrow_up
                </span>
                Alta
              </span>
            ) : esImportante ? (
              <span className={`${styles.priorityBadge} ${styles.priorityMedium}`}>
                <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
                  drag_handle
                </span>
                Media
              </span>
            ) : (
              <span className={`${styles.priorityBadge} ${styles.priorityNormal}`}>
                <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
                  remove
                </span>
                Normal
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 id={`tarjeta-titulo-${tarjeta.id}`} className={styles.title}>
          {tarjeta.titulo}
        </h3>

        {/* Description snippet */}
        {tarjeta.descripcion && (
          <p className={styles.description}>{tarjeta.descripcion}</p>
        )}

        {/* Subtasks progress bar */}
        <div className={styles.subtasksRow}>
          <div className={styles.subtasksHeader}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                checklist
              </span>
              Subtareas
            </span>
            <span style={{ fontFamily: "var(--font-mono)" }}>3 / 5</span>
          </div>
          <div className={styles.subtasksTrack}>
            <div className={styles.subtasksBar} style={{ width: "60%" }} />
          </div>
        </div>

        {/* Card Footer */}
        <div className={styles.footer}>
          <div className={styles.assignee}>
            <div className={styles.avatarCircle} aria-hidden="true">
              {asignado.iniciales}
            </div>
            <span className={styles.assigneeName}>{asignado.nombre}</span>
          </div>

          <div className={styles.actionsRight}>
            {tarjeta.vence ? (
              <span className={styles.dueInfo}>
                <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
                  schedule
                </span>
                <time dateTime={tarjeta.vence}>{tarjeta.vence}</time>
              </span>
            ) : null}

            {/* Alternativa por teclado para mover (RF-03) */}
            {otrasColumnas.length > 0 && onMoverTeclado && (
              <select
                id={`mover-select-${tarjeta.id}`}
                className={styles.moveSelect}
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    onMoverTeclado(tarjeta.id, e.target.value);
                    e.target.value = "";
                  }
                }}
                aria-label={`Mover tarjeta "${tarjeta.titulo}" a otra columna`}
              >
                <option value="" disabled>
                  Mover a...
                </option>
                {otrasColumnas.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.nombre}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              className={styles.detailButton}
              onClick={() => onVerDetalle?.(tarjeta.id)}
              aria-label={`Ver detalles de tarjeta: ${tarjeta.titulo}`}
            >
              Detalles
            </button>
          </div>
        </div>
      </article>
    </li>
  );
}
