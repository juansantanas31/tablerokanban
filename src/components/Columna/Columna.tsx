"use client";

import { useState } from "react";
import { Columna as ColumnaTipo, Tarjeta as TarjetaTipo } from "@/schemas/tarjeta.schema";
import { Tarjeta } from "../Tarjeta/Tarjeta";
import { Icon } from "../Icon/Icon";
import styles from "./Columna.module.css";

export type EstadoColumna = "cargando" | "vacio" | "error" | "exito";

interface ColumnaProps {
  columna: ColumnaTipo;
  tarjetas: TarjetaTipo[];
  estado: EstadoColumna;
  columnasDisponibles?: ColumnaTipo[];
  tableroId?: string;
  mensajeError?: string;
  onReintentar?: () => void;
  onVerDetalle?: (id: string) => void;
  onMoverTeclado?: (tarjetaId: string, columnaDestinoId: string) => void;
  onDropTarjeta?: (tarjetaId: string, columnaDestinoId: string) => void;
  onAgregarTarjeta?: (columnaId: string) => void;
}

export function Columna({
  columna,
  tarjetas,
  estado,
  columnasDisponibles = [],
  tableroId,
  mensajeError = "No se pudieron cargar las tareas.",
  onReintentar,
  onVerDetalle,
  onMoverTeclado,
  onDropTarjeta,
  onAgregarTarjeta,
}: ColumnaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const columnaIdTitulo = `columna-titulo-${columna.id}`;

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const tarjetaId = e.dataTransfer.getData("text/plain");
    if (tarjetaId && onDropTarjeta) {
      onDropTarjeta(tarjetaId, columna.id);
    }
  };

  const excedeWip = columna.limiteWip ? tarjetas.length >= columna.limiteWip : false;

  return (
    <section
      className={`${styles.column} ${isDragOver ? styles.columnDragOver : ""}`}
      aria-labelledby={columnaIdTitulo}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.statusDot} aria-hidden="true" />
          <h2 id={columnaIdTitulo} className={styles.title}>
            {columna.nombre}
          </h2>
          <span
            className={`${styles.countBadge} ${excedeWip ? styles.countBadgeWarning : ""}`}
            aria-label={`${tarjetas.length} tareas de ${columna.limiteWip || 50} permitidas`}
          >
            {tarjetas.length}
            {columna.limiteWip && ` / ${columna.limiteWip}`}
          </span>
        </div>

        {onAgregarTarjeta && (
          <button
            type="button"
            className={styles.addCardButton}
            onClick={() => onAgregarTarjeta(columna.id)}
            aria-label={`Agregar nueva tarea a columna ${columna.nombre}`}
          >
            <Icon name="add" size={14} />
            <span>Tarea</span>
          </button>
        )}
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
          <span className="sr-only">Cargando tareas...</span>
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
              <Icon name="refresh" size={15} />
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Estado: Vacío */}
      {estado === "vacio" && (
        <div className={styles.emptyState}>
          <Icon name="inbox" size={32} style={{ color: "var(--text-muted)" }} />
          <p className={styles.emptyText}>Sin tarjetas en esta columna</p>
          <p className={styles.emptyHelp}>
            Agrega una nueva tarea o arrástrala desde otra columna.
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
              columnasDisponibles={columnasDisponibles}
              tableroId={tableroId}
              onMoverTeclado={onMoverTeclado}
              onVerDetalle={onVerDetalle}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
