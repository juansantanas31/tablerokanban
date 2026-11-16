"use client";

import { useId } from "react";
import type { Tarjeta as TarjetaType, Columna } from "@/schemas/tarjeta.schema";
import { Icon } from "@/components/Icon/Icon";
import styles from "./Tarjeta.module.css";

interface TarjetaProps {
  tarjeta: TarjetaType;
  columnasDisponibles?: Columna[];
  onMoverTeclado?: (tarjetaId: string, columnaDestinoId: string) => void;
  onVerDetalle?: (tarjetaId: string) => void;
}

export function Tarjeta({
  tarjeta,
  columnasDisponibles = [],
  onMoverTeclado,
  onVerDetalle,
}: TarjetaProps) {
  const etiqueta = tarjeta.etiquetas[0] || "general";
  const otrasColumnas = columnasDisponibles.filter((c) => c.id !== tarjeta.columnaId);
  const selectId = useId();

  // Drag and Drop nativo HTML5 (RF-02)
  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    e.dataTransfer.setData("text/plain", tarjeta.id);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add(styles.cardDragging);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLElement>) => {
    e.currentTarget.classList.remove(styles.cardDragging);
  };

  // Código mono estilo Linear LIN-XXXX
  const codigoLinear = tarjeta.id.toUpperCase().startsWith("LIN-")
    ? tarjeta.id.toUpperCase()
    : `LIN-${tarjeta.id.replace(/\D/g, "") || "1"}`;

  // Prioridad con clase y texto
  const esUrgente = tarjeta.etiquetas.includes("urgente");
  const esImportante = tarjeta.etiquetas.includes("importante");
  const textoPrioridad = esUrgente ? "Alta" : esImportante ? "Media" : "Normal";
  const iconoPrioridad = esUrgente ? "keyboard_double_arrow_up" : esImportante ? "drag_handle" : "check";
  const clasePrioridad = esUrgente
    ? styles.priorityHigh
    : esImportante
    ? styles.priorityMedium
    : styles.priorityNormal;

  // Mock asignado
  const asignado = {
    nombre: esUrgente ? "Alejandro V." : esImportante ? "Elena M." : "Carlos R.",
    iniciales: esUrgente ? "AV" : esImportante ? "EM" : "CR",
  };

  return (
    <li className={styles.cardItem}>
      <article
        className={styles.card}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        tabIndex={0}
        aria-labelledby={`tarjeta-titulo-${tarjeta.id}`}
        aria-describedby={`tarjeta-desc-${tarjeta.id}`}
        onClick={() => onVerDetalle?.(tarjeta.id)}
      >
        {/* Top Meta Row */}
        <div className={styles.topMeta}>
          <div className={styles.idAndTag}>
            <span className={styles.cardCode}>{codigoLinear}</span>
            <span className={styles.tagBadge}>{etiqueta}</span>
          </div>

          <div className={styles.topRightActions}>
            <span className={`${styles.priorityBadge} ${clasePrioridad}`}>
              <Icon name={iconoPrioridad} size={12} />
              <span>{textoPrioridad}</span>
            </span>

            <button
              type="button"
              className={styles.cardOptionsBtn}
              onClick={(e) => {
                e.stopPropagation();
                onVerDetalle?.(tarjeta.id);
              }}
              aria-label={`Opciones de tarjeta: ${tarjeta.titulo}`}
            >
              <Icon name="more_vert" size={16} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 id={`tarjeta-titulo-${tarjeta.id}`} className={styles.title}>
          {tarjeta.titulo}
        </h3>

        {/* Description snippet */}
        {tarjeta.descripcion && (
          <p id={`tarjeta-desc-${tarjeta.id}`} className={styles.description}>
            {tarjeta.descripcion}
          </p>
        )}

        {/* Subtasks progress bar */}
        <div className={styles.subtasksRow}>
          <div className={styles.subtasksHeader}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Icon name="checklist" size={13} style={{ color: "var(--text-muted)" }} />
              <span>Subtareas</span>
            </span>
            <span style={{ fontFamily: "var(--font-mono)" }}>3 / 5</span>
          </div>
          <div className={styles.subtasksTrack}>
            <div className={styles.subtasksBar} style={{ width: "60%" }} />
          </div>
        </div>

        {/* Card Footer (Stitch Screen 1) */}
        <div className={styles.footer}>
          <div className={styles.assignee}>
            <div className={styles.avatarCircle} aria-hidden="true">
              {asignado.iniciales}
            </div>
            <span className={styles.assigneeName}>{asignado.nombre}</span>
          </div>

          {tarjeta.vence ? (
            <span className={`${styles.dueInfo} ${esUrgente ? styles.dueInfoUrgent : ""}`}>
              <Icon name="schedule" size={13} />
              <time dateTime={tarjeta.vence}>
                {tarjeta.vence === "2026-11-20" ? "Hoy" : tarjeta.vence}
              </time>
            </span>
          ) : (
            <span className={styles.dueInfo}>
              <Icon name="event" size={13} />
              <span>Sin fecha</span>
            </span>
          )}
        </div>

        {/* Alternativa accesible por teclado para mover (RF-03 & Criterio de Aceptación 1) */}
        <div
          className={styles.keyboardMoveRow}
          onClick={(e) => e.stopPropagation()}
        >
          {otrasColumnas.length > 0 && onMoverTeclado && (
            <select
              id={`mover-select-${tarjeta.id || selectId}`}
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
            <Icon name="open_in_new" size={13} />
            <span>Detalle</span>
          </button>
        </div>
      </article>
    </li>
  );
}
