"use client";

import styles from "./FiltrosBar.module.css";

interface FiltrosBarProps {
  filtroTexto: string;
  onCambiarTexto: (texto: string) => void;
  filtroEtiqueta: string | null;
  onCambiarEtiqueta: (etiqueta: string | null) => void;
  onLimpiar: () => void;
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
}: FiltrosBarProps) {
  const hayFiltrosActivos = filtroTexto.trim() !== "" || filtroEtiqueta !== null;

  return (
    <section role="search" className={styles.filtersContainer} aria-label="Búsqueda y filtros de tarjetas">
      <div className={styles.inputsGroup}>
        <div className={styles.fieldGroup}>
          <label htmlFor="buscar-tarjetas" className={styles.label}>
            Buscar por título o descripción
          </label>
          <input
            id="buscar-tarjetas"
            type="search"
            className={styles.input}
            placeholder="Ej: diseño, pruebas, configurar..."
            value={filtroTexto}
            onChange={(e) => onCambiarTexto(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="filtrar-etiqueta" className={styles.label}>
            Filtrar por etiqueta
          </label>
          <select
            id="filtrar-etiqueta"
            className={styles.select}
            value={filtroEtiqueta || ""}
            onChange={(e) => onCambiarEtiqueta(e.target.value || null)}
          >
            <option value="">Todas las etiquetas</option>
            {ETIQUETAS.map((tag) => (
              <option key={tag} value={tag} style={{ textTransform: "capitalize" }}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hayFiltrosActivos && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={onLimpiar}
          aria-label="Limpiar todos los filtros"
        >
          Limpiar filtros
        </button>
      )}
    </section>
  );
}
