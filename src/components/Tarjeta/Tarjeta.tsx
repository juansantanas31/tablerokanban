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

  const getTagClass = (tag: string) => {
    const normalizada = tag.toLowerCase().trim();
    switch (normalizada) {
      case "urgente":
        return styles.tagUrgente;
      case "importante":
        return styles.tagImportante;
      case "diseño":
        return styles.tagDiseno;
      case "desarrollo":
        return styles.tagDesarrollo;
      case "pruebas":
        return styles.tagPruebas;
      case "documentacion":
      case "documentación":
        return styles.tagDocumentacion;
      default:
        return styles.tagDefault;
    }
  };

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
        {tarjeta.etiquetas.length > 0 && (
          <div
            className={styles.tagsContainer}
            aria-label={`Etiquetas: ${tarjeta.etiquetas.join(", ")}`}
          >
            {tarjeta.etiquetas.map((tag) => (
              <span
                key={tag}
                className={`${styles.tag} ${getTagClass(tag)}`}
              >
                <span aria-hidden="true">•</span>
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 id={`tarjeta-titulo-${tarjeta.id}`} className={styles.title}>
          {tarjeta.titulo}
        </h3>

        {tarjeta.descripcion && (
          <p className={styles.description}>{tarjeta.descripcion}</p>
        )}

        <div className={styles.metaRow}>
          {tarjeta.vence ? (
            <span className={styles.dueDate}>
              <span aria-hidden="true">📅</span>
              <time dateTime={tarjeta.vence}>Vence: {tarjeta.vence}</time>
            </span>
          ) : (
            <span className={styles.dueDate}>Sin fecha límite</span>
          )}

          <div className={styles.actionsGroup}>
            {/* Alternativa por teclado para mover (RF-03) */}
            {otrasColumnas.length > 0 && onMoverTeclado && (
              <label className="sr-only" htmlFor={`mover-select-${tarjeta.id}`}>
                Mover tarjeta a otra columna
              </label>
            )}
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
              className={styles.actionButton}
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
