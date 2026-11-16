"use client";

import { Icon } from "@/components/Icon/Icon";
import styles from "./FiltrosBar.module.css";

interface FiltrosBarProps {
  filtroTexto: string;
  onCambiarTexto: (texto: string) => void;
  filtroEtiqueta: string | null;
  onCambiarEtiqueta: (etiqueta: string | null) => void;
  onLimpiar: () => void;
  onNuevaTarea?: () => void;
}

const ETIQUETAS = [
  "urgente",
  "importante",
  "diseño",
  "desarrollo",
  "pruebas",
  "documentacion",
];

export function FiltrosBar({
  filtroTexto,
  onCambiarTexto,
  filtroEtiqueta,
  onCambiarEtiqueta,
  onLimpiar,
  onNuevaTarea,
}: FiltrosBarProps) {
  const hayFiltrosActivos = filtroTexto.trim() !== "" || filtroEtiqueta !== null;

  return (
    <section role="search" className={styles.container} aria-label="Búsqueda y filtros de tarjetas">
      {/* Filter & Action Row */}
      <div className={styles.filterRow}>
        <div className={styles.searchGroup}>
          <div className={styles.searchInputWrapper}>
            <Icon name="search" size={16} className={styles.searchIcon} />
            <label htmlFor="buscar-tarjetas" className="sr-only">
              Buscar por título o descripción
            </label>
            <input
              id="buscar-tarjetas"
              type="search"
              className={styles.searchInput}
              placeholder="Buscar tarea o código..."
              value={filtroTexto}
              onChange={(e) => onCambiarTexto(e.target.value)}
            />
          </div>

          <label htmlFor="filtrar-etiqueta" className="sr-only">
            Filtrar por etiqueta
          </label>
          <select
            id="filtrar-etiqueta"
            className={styles.tagSelect}
            value={filtroEtiqueta || ""}
            onChange={(e) => onCambiarEtiqueta(e.target.value || null)}
          >
            <option value="">Todas</option>
            {ETIQUETAS.map((tag) => (
              <option key={tag} value={tag} style={{ textTransform: "capitalize" }}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.chipsGroup}>
          <button
            type="button"
            className={`${styles.chip} ${filtroEtiqueta === "importante" ? styles.chipActive : ""}`}
            onClick={() => onCambiarEtiqueta(filtroEtiqueta === "importante" ? null : "importante")}
          >
            <Icon name="check" size={13} />
            <span>Mis tareas</span>
          </button>

          <button
            type="button"
            className={`${styles.chip} ${filtroEtiqueta === "urgente" ? styles.chipActive : ""}`}
            onClick={() => onCambiarEtiqueta(filtroEtiqueta === "urgente" ? null : "urgente")}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "var(--color-danger)",
              }}
              aria-hidden="true"
            />
            <span>Alta prioridad</span>
          </button>

          <button
            type="button"
            className={`${styles.chip} ${filtroEtiqueta === "desarrollo" ? styles.chipActive : ""}`}
            onClick={() => onCambiarEtiqueta(filtroEtiqueta === "desarrollo" ? null : "desarrollo")}
          >
            <span>Sprint actual</span>
          </button>

          {hayFiltrosActivos && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={onLimpiar}
              aria-label="Limpiar todos los filtros"
            >
              Limpiar
            </button>
          )}

          {onNuevaTarea && (
            <button
              type="button"
              className={styles.newCardBtn}
              onClick={onNuevaTarea}
              aria-label="Crear nueva tarea"
            >
              <Icon name="add" size={14} />
              <span>Tarea</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
