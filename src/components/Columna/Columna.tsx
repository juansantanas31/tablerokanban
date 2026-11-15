import { Columna as ColumnaTipo, Tarjeta as TarjetaTipo } from "@/schemas/tarjeta.schema";
import { Tarjeta } from "../Tarjeta/Tarjeta";
import styles from "./Columna.module.css";

export type EstadoColumna = "cargando" | "vacio" | "error" | "exito";

interface ColumnaProps {
  columna: ColumnaTipo;
  tarjetas: TarjetaTipo[];
  estado: EstadoColumna;
  mensajeError?: string;
  onReintentar?: () => void;
  onVerDetalle?: (id: string) => void;
}

export function Columna({
  columna,
  tarjetas,
  estado,
  mensajeError = "No se pudieron cargar las tarjetas.",
  onReintentar,
  onVerDetalle,
}: ColumnaProps) {
  const columnaIdTitulo = `columna-titulo-${columna.id}`;

  return (
    <section
      className={styles.column}
      aria-labelledby={columnaIdTitulo}
    >
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 id={columnaIdTitulo} className={styles.title}>
            {columna.nombre}
          </h2>
          <span
            className={styles.countBadge}
            aria-label={`${tarjetas.length} tarjetas en esta columna`}
          >
            {tarjetas.length}
          </span>
        </div>
      </header>

      {/* Estado: Cargando */}
      {estado === "cargando" && (
        <div
          role="status"
          aria-busy="true"
          aria-label={`Cargando tarjetas de la columna ${columna.nombre}`}
          className={styles.cardsList}
        >
          <div className={styles.skeletonCard} aria-hidden="true" />
          <div className={styles.skeletonCard} aria-hidden="true" />
          <div className={styles.skeletonCard} aria-hidden="true" />
          <span className="sr-only">Cargando tarjetas...</span>
        </div>
      )}

      {/* Estado: Error */}
      {estado === "error" && (
        <div role="alert" className={styles.errorState}>
          <p className={styles.errorMessage}>{mensajeError}</p>
          {onReintentar && (
            <button
              type="button"
              className={styles.retryButton}
              onClick={onReintentar}
              aria-label={`Reintentar carga de tarjetas en columna ${columna.nombre}`}
            >
              <span aria-hidden="true">🔄</span>
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Estado: Vacío */}
      {estado === "vacio" && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">
            📂
          </span>
          <p className={styles.emptyText}>Sin tarjetas en esta columna</p>
          <p className={styles.emptyHelp}>
            Agrega una nueva tarjeta o arrástrala desde otra columna.
          </p>
        </div>
      )}

      {/* Estado: Éxito con tarjetas */}
      {estado === "exito" && tarjetas.length > 0 && (
        <ul
          className={styles.cardsList}
          aria-label={`Lista de tarjetas en ${columna.nombre}`}
        >
          {tarjetas.map((tarjeta) => (
            <Tarjeta
              key={tarjeta.id}
              tarjeta={tarjeta}
              onVerDetalle={onVerDetalle}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
