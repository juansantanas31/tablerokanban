"use client";

import { use, useEffect, useReducer, useState, useMemo } from "react";
import Link from "next/link";
import {
  tableroReducer,
  estadoInicialTablero,
  calcularPosicionDecimal,
} from "@/reducers/tablero.reducer";
import { Columna } from "@/components/Columna/Columna";
import { FiltrosBar } from "@/components/Filtros/FiltrosBar";
import { ModalDialog } from "@/components/Modal/ModalDialog";
import { CrearTarjetaForm } from "@/components/Formularios/CrearTarjetaForm";
import { TarjetaDetalleContenido } from "@/components/TarjetaDetalle/TarjetaDetalleContenido";
import { AriaLiveAnnouncer } from "@/components/AriaLive/AriaLiveAnnouncer";
import { Tarjeta, Tablero } from "@/schemas/tarjeta.schema";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import styles from "./tablero-detalle.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TableroDetallePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tableroId = resolvedParams.id;

  const [state, dispatch] = useReducer(tableroReducer, estadoInicialTablero);
  const [tablerosGuardados] = useLocalStorage<Tablero[]>("kanban_tableros", []);
  const [, setUltimoTableroId] = useLocalStorage<string | null>("kanban_ultimo_tablero", null);
  const [tarjetasStorage, setTarjetasStorage] = useLocalStorage<Tarjeta[]>(
    `kanban_tarjetas_${tableroId}`,
    []
  );

  const [isModalCrearOpen, setIsModalCrearOpen] = useState(false);
  const [columnaSeleccionadaId, setColumnaSeleccionadaId] = useState<string>("");
  const [tarjetaDetalle, setTarjetaDetalle] = useState<Tarjeta | null>(null);
  const [columnaTabSeleccionada, setColumnaTabSeleccionada] = useState<string | null>(null);

  // Cargar datos del tablero
  useEffect(() => {
    setUltimoTableroId(tableroId);

    // Buscar el tablero en tableros guardados o usar mock por defecto
    const tableroEncontrado = tablerosGuardados.find((t) => t.id === tableroId) || {
      id: tableroId,
      nombre: "Sprint 1 - Tablero de Organización",
      columnas: [
        { id: "col-por-hacer", nombre: "Por hacer", limiteWip: 10 },
        { id: "col-en-curso", nombre: "En curso", limiteWip: 3 },
        { id: "col-hecho", nombre: "Hecho", limiteWip: 50 },
      ],
      creadoEn: new Date().toISOString(),
    };

    // Si hay tarjetas en storage local para este tablero, usarlas; si no, buscar las de ejemplo
    if (tarjetasStorage && tarjetasStorage.length > 0) {
      dispatch({
        type: "CARGAR_TABLERO",
        payload: { tablero: tableroEncontrado, tarjetas: tarjetasStorage },
      });
    } else {
      fetch("/datos-ejemplo/tablero-ejemplo.json")
        .then((res) => res.json())
        .then((data) => {
          const cards: Tarjeta[] = data.tarjetas || [];
          dispatch({
            type: "CARGAR_TABLERO",
            payload: { tablero: tableroEncontrado, tarjetas: cards },
          });
          setTarjetasStorage(cards);
        })
        .catch(() => {
          dispatch({
            type: "CARGAR_TABLERO",
            payload: { tablero: tableroEncontrado, tarjetas: [] },
          });
        });
    }
  }, [tableroId, tablerosGuardados, setUltimoTableroId, tarjetasStorage, setTarjetasStorage]);

  // Sincronizar tarjetas modificadas con localStorage (RF-06)
  useEffect(() => {
    if (state.tarjetas.length > 0) {
      setTarjetasStorage(state.tarjetas);
    }
  }, [state.tarjetas, setTarjetasStorage]);

  // Filtrado de tarjetas (RF-05)
  const tarjetasFiltradas = useMemo(() => {
    return state.tarjetas.filter((tarjeta) => {
      // Filtro por texto
      const coincideTexto =
        state.filtroTexto === "" ||
        tarjeta.titulo.toLowerCase().includes(state.filtroTexto.toLowerCase()) ||
        tarjeta.descripcion.toLowerCase().includes(state.filtroTexto.toLowerCase());

      // Filtro por etiqueta
      const coincideEtiqueta =
        state.filtroEtiqueta === null ||
        tarjeta.etiquetas.some(
          (tag) => tag.toLowerCase() === state.filtroEtiqueta?.toLowerCase()
        );

      return coincideTexto && coincideEtiqueta;
    });
  }, [state.tarjetas, state.filtroTexto, state.filtroEtiqueta]);

  // Mover tarjeta (Drag and Drop o Teclado) calculando posición decimal
  const moverTarjetaAColumna = (tarjetaId: string, columnaDestinoId: string) => {
    const columnaDestino = state.tablero?.columnas.find((c) => c.id === columnaDestinoId);
    const tarjetasEnColumnaDestino = state.tarjetas.filter(
      (t) => t.columnaId === columnaDestinoId && t.id !== tarjetaId
    );

    // Calcular posición decimal al final de la columna destino
    const nuevaPosicion = calcularPosicionDecimal(
      tarjetasEnColumnaDestino,
      tarjetasEnColumnaDestino.length
    );

    dispatch({
      type: "MOVER_TARJETA",
      payload: {
        tarjetaId,
        columnaDestinoId,
        nuevaPosicion,
        nombreColumnaDestino: columnaDestino?.nombre,
      },
    });
  };

  const handleCrearTarjeta = (nuevaTarjeta: Tarjeta) => {
    // Calcular posición inicial adecuada en la columna seleccionada
    const tarjetasEnColumna = state.tarjetas.filter(
      (t) => t.columnaId === nuevaTarjeta.columnaId
    );
    const posicionCalculada = calcularPosicionDecimal(
      tarjetasEnColumna,
      tarjetasEnColumna.length
    );

    const tarjetaConPosicion = {
      ...nuevaTarjeta,
      posicion: posicionCalculada,
    };

    dispatch({ type: "CREAR_TARJETA", payload: tarjetaConPosicion });
    setIsModalCrearOpen(false);
  };

  const abrirModalCrear = (columnaId?: string) => {
    setColumnaSeleccionadaId(columnaId || state.tablero?.columnas[0]?.id || "");
    setIsModalCrearOpen(true);
  };

  if (!state.tablero) {
    return (
      <div className={styles.container}>
        <p>Cargando tablero...</p>
      </div>
    );
  }

  const columnaActivaId = columnaTabSeleccionada || state.tablero.columnas[0]?.id || "";

  return (
    <div className={styles.container}>
      <AriaLiveAnnouncer mensaje={state.anuncioAccesible} />

      <header className={styles.headerSection}>
        <div className={styles.titleRow}>
          <div className={styles.titleLeft}>
            <Link href="/tableros" className={styles.backLink} aria-label="Volver a lista de tableros">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              <span>Tableros</span>
            </Link>
            <h1 className={styles.boardTitle}>
              {state.tablero.nombre}
            </h1>
          </div>

          <button
            type="button"
            className={styles.backLink}
            onClick={() => abrirModalCrear()}
            aria-haspopup="dialog"
            style={{ fontWeight: 600, color: "var(--color-primary)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            <span>Nueva Tarjeta</span>
          </button>
        </div>

        {/* Column Segmented Carousel / Horizontal Stepper (Stitch Screen 1) */}
        <div className={styles.columnStepper} role="tablist" aria-label="Pestañas de columnas">
          {state.tablero.columnas.map((col) => {
            const count = state.tarjetas.filter((t) => t.columnaId === col.id).length;
            const esActiva = (columnaActivaId || state.tablero?.columnas[0]?.id) === col.id;
            return (
              <button
                key={col.id}
                role="tab"
                aria-selected={esActiva}
                type="button"
                className={`${styles.columnTab} ${esActiva ? styles.columnTabActive : ""}`}
                onClick={() => setColumnaTabSeleccionada(col.id)}
              >
                <span>{col.nombre}</span>
                <span className={styles.tabBadge}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Barra de Búsqueda y Filtros (RF-05) */}
        <FiltrosBar
          filtroTexto={state.filtroTexto}
          onCambiarTexto={(texto) =>
            dispatch({ type: "SET_FILTRO_TEXTO", payload: texto })
          }
          filtroEtiqueta={state.filtroEtiqueta}
          onCambiarEtiqueta={(tag) =>
            dispatch({ type: "SET_FILTRO_ETIQUETA", payload: tag })
          }
          onLimpiar={() => {
            dispatch({ type: "SET_FILTRO_TEXTO", payload: "" });
            dispatch({ type: "SET_FILTRO_ETIQUETA", payload: null });
          }}
          onNuevaTarea={() => abrirModalCrear(state.tablero?.columnas[0]?.id)}
        />
      </header>

      {/* Columnas del Tablero Kanban */}
      <main className={styles.columnsWrapper} aria-label="Columnas del tablero">
        {state.tablero.columnas.map((col) => {
          const tarjetasColumna = tarjetasFiltradas
            .filter((t) => t.columnaId === col.id)
            .sort((a, b) => a.posicion - b.posicion);

          return (
            <Columna
              key={col.id}
              columna={col}
              tarjetas={tarjetasColumna}
              estado={tarjetasColumna.length > 0 ? "exito" : "vacio"}
              columnasDisponibles={state.tablero?.columnas}
              onMoverTeclado={moverTarjetaAColumna}
              onDropTarjeta={moverTarjetaAColumna}
              onAgregarTarjeta={abrirModalCrear}
              onVerDetalle={(id) => {
                const tarjeta = state.tarjetas.find((t) => t.id === id);
                if (tarjeta) setTarjetaDetalle(tarjeta);
              }}
            />
          );
        })}
      </main>

      {/* Modal para Crear Tarjeta */}
      <ModalDialog
        isOpen={isModalCrearOpen}
        onClose={() => setIsModalCrearOpen(false)}
        titulo="Nueva Tarjeta"
      >
        <CrearTarjetaForm
          columnas={state.tablero.columnas}
          columnaInicialId={columnaSeleccionadaId}
          onCrear={handleCrearTarjeta}
          onCancelar={() => setIsModalCrearOpen(false)}
        />
      </ModalDialog>

      {/* Modal accesible para Detalle de Tarjeta (<dialog>) */}
      {tarjetaDetalle && (
        <ModalDialog
          isOpen={!!tarjetaDetalle}
          onClose={() => setTarjetaDetalle(null)}
          titulo="Detalle de Tarea"
        >
          <TarjetaDetalleContenido
            tarjeta={tarjetaDetalle}
            columnas={state.tablero?.columnas}
            tableroNombre={state.tablero?.nombre || "Sprint 24"}
          />
        </ModalDialog>
      )}
    </div>
  );
}
