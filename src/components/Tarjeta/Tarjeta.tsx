"use client";

import { useId } from "react";
import Link from "next/link";
import type { Tarjeta as TarjetaType, Columna } from "@/schemas/tarjeta.schema";
import { Icon } from "@/components/Icon/Icon";
import styles from "./Tarjeta.module.css";

interface TarjetaProps {
  tarjeta: TarjetaType;
  columnasDisponibles?: Columna[];
  tableroId?: string;
  onMoverTeclado?: (tarjetaId: string, columnaDestinoId: string) => void;
  onVerDetalle?: (tarjetaId: string) => void;
}

export function Tarjeta({
  tarjeta,
  columnasDisponibles = [],
  tableroId,
  onMoverTeclado,
  onVerDetalle,
}: TarjetaProps) {
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

  // Código identificador mono
  const codigo = tarjeta.id.toUpperCase().startsWith("LIN-")
    ? tarjeta.id.toUpperCase()
    : tarjeta.id;

  // Prioridad derivada de etiquetas reales
  const esUrgente = tarjeta.etiquetas.includes("urgente");
  const esImportante = tarjeta.etiquetas.includes("importante");
  const tienePrioridad = esUrgente || esImportante;
  const textoPrioridad = esUrgente ? "Alta" : "Media";
  const iconoPrioridad = esUrgente ? "keyboard_double_arrow_up" : "drag_handle";
  const clasePrioridad = esUrgente ? styles.priorityHigh : styles.priorityMedium;

  return (
    <li className={styles.cardItem}>
      <article
        className={styles.card}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        tabIndex={0}
        aria-labelledby={`tarjeta-titulo-${tarjeta.id}`}
        aria-describedby={tarjeta.descripcion ? `tarjeta-desc-${tarjeta.id}` : undefined}
      >
        {/* Top Meta Row */}
        <div className={styles.topMeta}>
          <div className={styles.idAndTag}>
            <span className={styles.cardCode}>{codigo}</span>
            {tarjeta.etiquetas.length > 0 && (
              <span className={styles.tagBadge}>{tarjeta.etiquetas[0]}</span>
            )}
          </div>

          <div className={styles.topRightActions}>
            {tienePrioridad && (
              <span className={`${styles.priorityBadge} ${clasePrioridad}`}>
                <Icon name={iconoPrioridad} size={12} />
                <span>{textoPrioridad}</span>
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
          <p id={`tarjeta-desc-${tarjeta.id}`} className={styles.description}>
            {tarjeta.descripcion}
          </p>
        )}

        {/* Card Footer: Etiquetas reales y fecha de vencimiento real */}
        <div className={styles.footer}>
          <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", alignItems: "center" }}>
            {tarjeta.etiquetas.slice(1).map((tag) => (
              <span key={tag} className={styles.tagBadge}>
                {tag}
              </span>
            ))}
          </div>

          {tarjeta.vence ? (
            <span className={`${styles.dueInfo} ${esUrgente ? styles.dueInfoUrgent : ""}`}>
              <Icon name="schedule" size={13} />
              <time dateTime={tarjeta.vence}>{tarjeta.vence}</time>
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

          {tableroId ? (
            <Link
              href={`/tableros/${tableroId}/tarjetas/${tarjeta.id}`}
              className={styles.detailButton}
              aria-label={`Ver detalles de tarjeta: ${tarjeta.titulo}`}
            >
              <Icon name="open_in_new" size={13} />
              <span>Detalle</span>
            </Link>
          ) : (
            <button
              type="button"
              className={styles.detailButton}
              onClick={() => onVerDetalle?.(tarjeta.id)}
              aria-label={`Ver detalles de tarjeta: ${tarjeta.titulo}`}
            >
              <Icon name="open_in_new" size={13} />
              <span>Detalle</span>
            </button>
          )}
        </div>
      </article>
    </li>
  );
}
