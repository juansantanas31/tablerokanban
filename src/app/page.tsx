"use client";

import { useEffect, useState } from "react";
import { Tarjeta, TarjetaSchema, Columna as ColumnaTipo } from "@/schemas/tarjeta.schema";
import { Columna, EstadoColumna } from "@/components/Columna/Columna";
import { AriaLiveAnnouncer } from "@/components/AriaLive/AriaLiveAnnouncer";
import styles from "./page.module.css";

export default function HomePage() {
  const [columna, setColumna] = useState<ColumnaTipo>({
    id: "col-por-hacer",
    nombre: "Por hacer",
    limiteWip: 10,
  });
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [estado, setEstado] = useState<EstadoColumna>("cargando");
  const [mensajeError, setMensajeError] = useState<string>("");
  const [anuncioAccesible, setAnuncioAccesible] = useState<string>("Iniciando carga de tarjetas");
  const [recargarTrigger, setRecargarTrigger] = useState<number>(0);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const response = await fetch("/datos-ejemplo/tablero-ejemplo.json");
        if (!response.ok) {
          throw new Error(`Error en el servidor al cargar datos (HTTP ${response.status})`);
        }

        const json = await response.json();

        // Validación estricta con Zod
        const parseResult = TarjetaSchema.array().safeParse(json.tarjetas);
        if (!parseResult.success) {
          throw new Error("Los datos recibidos no cumplen con el esquema de validación Zod.");
        }

        if (!ignore) {
          if (json.tablero?.columnas?.[0]) {
            setColumna(json.tablero.columnas[0]);
          }

          setTarjetas(parseResult.data);
          if (parseResult.data.length === 0) {
            setEstado("vacio");
            setAnuncioAccesible("La columna está vacía. No hay tarjetas.");
          } else {
            setEstado("exito");
            setAnuncioAccesible(`Se cargaron ${parseResult.data.length} tarjetas en la columna.`);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Error desconocido al procesar tarjetas";
          setMensajeError(msg);
          setEstado("error");
          setAnuncioAccesible(`Error al cargar tarjetas: ${msg}`);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [recargarTrigger]);

  const recargar = () => {
    setEstado("cargando");
    setAnuncioAccesible("Recargando tarjetas...");
    setRecargarTrigger((prev) => prev + 1);
  };

  // Controles de demostración para la sustentación
  const forzarEstado = (nuevoEstado: EstadoColumna) => {
    if (nuevoEstado === "cargando") {
      setEstado("cargando");
      setAnuncioAccesible("Mostrando estado de carga.");
    } else if (nuevoEstado === "vacio") {
      setTarjetas([]);
      setEstado("vacio");
      setAnuncioAccesible("Mostrando estado vacío.");
    } else if (nuevoEstado === "error") {
      setMensajeError("Simulación de fallo de red o validación (Demostración)");
      setEstado("error");
      setAnuncioAccesible("Mostrando estado de error con opción de reintento.");
    } else if (nuevoEstado === "exito") {
      recargar();
    }
  };

  return (
    <div className={styles.pageContainer}>
      <AriaLiveAnnouncer mensaje={anuncioAccesible} />

      <section className={styles.introSection}>
        <h1 className={styles.heading1}>Tablero Kanban — Hito 1</h1>
        <p className={styles.description}>
          Columna accesible con tarjetas fijas basada en HTML semántico, diseño mobile-first y
          gestión integral de estados de carga, vacío y error.
        </p>
      </section>

      {/* Controles para evaluación y sustentación en vivo */}
      <fieldset className={styles.controlsPanel}>
        <legend className={styles.controlsLegend}>
          Demostración en vivo de Estados de Interfaz (Hito 1 / Sección 4):
        </legend>
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={`${styles.demoButton} ${estado === "exito" ? styles.demoButtonActive : ""}`}
            onClick={() => forzarEstado("exito")}
            aria-pressed={estado === "exito"}
          >
            Estado Éxito (Tarjetas Reales)
          </button>
          <button
            type="button"
            className={`${styles.demoButton} ${estado === "cargando" ? styles.demoButtonActive : ""}`}
            onClick={() => forzarEstado("cargando")}
            aria-pressed={estado === "cargando"}
          >
            Simular Carga (Esqueleto)
          </button>
          <button
            type="button"
            className={`${styles.demoButton} ${estado === "vacio" ? styles.demoButtonActive : ""}`}
            onClick={() => forzarEstado("vacio")}
            aria-pressed={estado === "vacio"}
          >
            Simular Columna Vacía
          </button>
          <button
            type="button"
            className={`${styles.demoButton} ${estado === "error" ? styles.demoButtonActive : ""}`}
            onClick={() => forzarEstado("error")}
            aria-pressed={estado === "error"}
          >
            Simular Error y Reintento
          </button>
        </div>
      </fieldset>

      <div className={styles.boardArea}>
        <Columna
          columna={columna}
          tarjetas={tarjetas}
          estado={estado}
          mensajeError={mensajeError}
          onReintentar={recargar}
          onVerDetalle={(id) => {
            alert(`Detalle de tarjeta: ${id}`);
          }}
        />
      </div>
    </div>
  );
}
