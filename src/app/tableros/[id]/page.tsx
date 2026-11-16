"use client";

import { use, useEffect, useState, useMemo, useOptimistic, useTransition, useCallback, useReducer } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Columna } from "@/components/Columna/Columna";
import { FiltrosBar } from "@/components/Filtros/FiltrosBar";
import { ModalDialog } from "@/components/Modal/ModalDialog";
import { CrearTarjetaForm } from "@/components/Formularios/CrearTarjetaForm";
import { TarjetaDetalleContenido } from "@/components/TarjetaDetalle/TarjetaDetalleContenido";
import { Icon } from "@/components/Icon/Icon";
import { AriaLiveAnnouncer } from "@/components/AriaLive/AriaLiveAnnouncer";
import { Tarjeta, Tablero } from "@/schemas/tarjeta.schema";
import { apiCliente, ApiError } from "@/lib/api-cliente";
import {
  tableroReducer,
  estadoInicialTablero,
  calcularPosicionDecimal,
} from "@/reducers/tablero.reducer";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import styles from "./tablero-detalle.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface MovimientoOptimista {
  tarjetaId: string;
  columnaDestinoId: string;
  nuevaPosicion: number;
}

export default function TableroDetallePage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const tableroId = resolvedParams.id;

  // Técnica 1 (Sección 6): useReducer para el estado centralizado del tablero
  const [state, dispatch] = useReducer(tableroReducer, estadoInicialTablero);

  const [estadoCarga, setEstadoCarga] = useState<"cargando" | "error" | "exito">("cargando");
  const [mensajeErrorCarga, setMensajeErrorCarga] = useState<string | null>(null);
  const [avisoError, setAvisoError] = useState<string | null>(null);
  const [anuncioAccesible, setAnuncioAccesible] = useState("Cargando tablero...");

  // localStorage: solo guarda el último tablero visitado y el filtro (Sección 5)
  const [, setUltimoTableroId] = useLocalStorage<string | null>("kanban_ultimo_tablero", null);
  const [filtroTexto, setFiltroTexto] = useLocalStorage<string>("kanban_filtro_texto", "");
  const [filtroEtiqueta, setFiltroEtiqueta] = useLocalStorage<string | null>(
    "kanban_filtro_etiqueta",
    null
  );

  // Técnica 2 (Sección 6): useOptimistic para mover tarjetas al instante con reversión automática
  const [tarjetasOptimistas, setTarjetasOptimistas] = useOptimistic(
    state.tarjetas,
    (estadoActual: Tarjeta[], movimiento: MovimientoOptimista) => {
      return estadoActual.map((t) =>
        t.id === movimiento.tarjetaId
          ? {
              ...t,
              columnaId: movimiento.columnaDestinoId,
              posicion: movimiento.nuevaPosicion,
            }
          : t
      );
    }
  );

  const [, startTransition] = useTransition();

  const [isModalCrearOpen, setIsModalCrearOpen] = useState(false);
  const [columnaSeleccionadaId, setColumnaSeleccionadaId] = useState<string>("");
  const [tarjetaDetalleFallback, setTarjetaDetalleFallback] = useState<Tarjeta | null>(null);
  const [columnaTabSeleccionada, setColumnaTabSeleccionada] = useState<string | null>(null);

  // Cargar datos reales desde GET /api/tableros/:id
  const cargarTablero = useCallback(async () => {
    setEstadoCarga("cargando");
    setMensajeErrorCarga(null);
    setUltimoTableroId(tableroId);

    try {
      const data = await apiCliente.get<{ tablero: Tablero; tarjetas: Tarjeta[] }>(
        `/api/tableros/${tableroId}`
      );
      if (data.tablero) {
        dispatch({
          type: "CARGAR_TABLERO",
          payload: { tablero: data.tablero, tarjetas: data.tarjetas || [] },
        });
      }
      setEstadoCarga("exito");
      setAnuncioAccesible(`Tablero "${data.tablero?.nombre}" cargado exitosamente.`);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setAnuncioAccesible("Sesión expirada. Redirigiendo a inicio de sesión...");
        router.push("/login");
        return;
      }
      const mensaje =
        err instanceof ApiError ? err.message : "Error al cargar el tablero";
      setMensajeErrorCarga(mensaje);
      setEstadoCarga("error");
      setAnuncioAccesible(`Error al cargar el tablero: ${mensaje}`);
    }
  }, [tableroId, router, setUltimoTableroId]);

  useEffect(() => {
    let cancelado = false;

    apiCliente
      .get<{ tablero: Tablero; tarjetas: Tarjeta[] }>(`/api/tableros/${tableroId}`)
      .then((data) => {
        if (cancelado) return;
        if (data.tablero) {
          dispatch({
            type: "CARGAR_TABLERO",
            payload: { tablero: data.tablero, tarjetas: data.tarjetas || [] },
          });
        }
        setEstadoCarga("exito");
        setUltimoTableroId(tableroId);
        setAnuncioAccesible(`Tablero "${data.tablero?.nombre}" cargado exitosamente.`);
      })
      .catch((err: unknown) => {
        if (cancelado) return;
        if (err instanceof ApiError && err.status === 401) {
          setAnuncioAccesible("Sesión expirada. Redirigiendo a inicio de sesión...");
          router.push("/login");
          return;
        }
        const mensaje =
          err instanceof ApiError ? err.message : "Error al cargar el tablero";
        setMensajeErrorCarga(mensaje);
        setEstadoCarga("error");
        setAnuncioAccesible(`Error al cargar el tablero: ${mensaje}`);
      });

    return () => {
      cancelado = true;
    };
  }, [tableroId, router, setUltimoTableroId]);

  // Filtrado de tarjetas en memoria
  const tarjetasFiltradas = useMemo(() => {
    return tarjetasOptimistas.filter((tarjeta) => {
      const coincideTexto =
        filtroTexto === "" ||
        tarjeta.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        tarjeta.descripcion.toLowerCase().includes(filtroTexto.toLowerCase());

      const coincideEtiqueta =
        filtroEtiqueta === null ||
        tarjeta.etiquetas.some(
          (tag) => tag.toLowerCase() === filtroEtiqueta.toLowerCase()
        );

      return coincideTexto && coincideEtiqueta;
    });
  }, [tarjetasOptimistas, filtroTexto, filtroEtiqueta]);

  // Mover tarjeta con useOptimistic, startTransition y PATCH /api/tableros/:id/tarjetas/:tid/mover
  const moverTarjetaAColumna = (tarjetaId: string, columnaDestinoId: string) => {
    const tarjeta = tarjetasOptimistas.find((t) => t.id === tarjetaId);
    if (!tarjeta) return;
    if (tarjeta.columnaId === columnaDestinoId) return;

    const columnaDestino = state.tablero?.columnas.find((c) => c.id === columnaDestinoId);
    const tarjetasEnColumnaDestino = tarjetasOptimistas.filter(
      (t) => t.columnaId === columnaDestinoId && t.id !== tarjetaId
    );

    const nuevaPosicion = calcularPosicionDecimal(
      tarjetasEnColumnaDestino,
      tarjetasEnColumnaDestino.length
    );

    setAvisoError(null);

    startTransition(async () => {
      setTarjetasOptimistas({ tarjetaId, columnaDestinoId, nuevaPosicion });
      setAnuncioAccesible(
        `Tarjeta "${tarjeta.titulo}" movida a la columna "${columnaDestino?.nombre || columnaDestinoId}".`
      );

      try {
        await apiCliente.patch<{ tarjeta: Tarjeta }>(
          `/api/tableros/${tableroId}/tarjetas/${tarjetaId}/mover`,
          { columnaId: columnaDestinoId, posicion: nuevaPosicion }
        );

        // Si el servidor confirma el movimiento, actualizamos el estado con useReducer
        dispatch({
          type: "MOVER_TARJETA",
          payload: {
            tarjetaId,
            columnaDestinoId,
            nuevaPosicion,
            nombreColumnaDestino: columnaDestino?.nombre,
          },
        });
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) {
          router.push("/login");
          return;
        }

        const mensaje =
          err instanceof ApiError ? err.message : "Error al mover la tarjeta en el servidor";

        // Aviso visible con role="alert" y anuncio accesible
        setAvisoError(mensaje);
        setAnuncioAccesible(
          `No se pudo mover la tarjeta: ${mensaje}. La tarjeta regresó a su columna original.`
        );

        // Al no modificar state.tarjetas con dispatch, useOptimistic revierte automáticamente
      }
    });
  };

  // Crear tarjeta con POST /api/tableros/:id/tarjetas
  const handleCrearTarjeta = async (nuevaTarjeta: Tarjeta) => {
    const columnaDestino = state.tablero?.columnas.find((c) => c.id === nuevaTarjeta.columnaId);
    const tarjetasEnColumna = state.tarjetas.filter(
      (t) => t.columnaId === nuevaTarjeta.columnaId
    );
    const posicionCalculada = calcularPosicionDecimal(
      tarjetasEnColumna,
      tarjetasEnColumna.length
    );

    try {
      const res = await apiCliente.post<{ tarjeta: Tarjeta }>(
        `/api/tableros/${tableroId}/tarjetas`,
        {
          titulo: nuevaTarjeta.titulo,
          descripcion: nuevaTarjeta.descripcion,
          columnaId: nuevaTarjeta.columnaId,
          posicion: posicionCalculada,
          etiquetas: nuevaTarjeta.etiquetas,
          vence: nuevaTarjeta.vence,
        }
      );

      dispatch({ type: "CREAR_TARJETA", payload: res.tarjeta });
      setAnuncioAccesible(
        `Tarjeta "${res.tarjeta.titulo}" creada en columna "${columnaDestino?.nombre || ""}".`
      );
      setIsModalCrearOpen(false);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      const mensaje =
        err instanceof ApiError ? err.message : "Error al crear la tarjeta.";
      setAvisoError(mensaje);
      setAnuncioAccesible(`Error al crear tarjeta: ${mensaje}`);
    }
  };

  const abrirModalCrear = (columnaId?: string) => {
    setColumnaSeleccionadaId(columnaId || state.tablero?.columnas[0]?.id || "");
    setIsModalCrearOpen(true);
  };

  if (estadoCarga === "cargando") {
    return (
      <div className={styles.container}>
        <AriaLiveAnnouncer mensaje="Cargando tablero..." />
        <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>Cargando tablero...</p>
      </div>
    );
  }

  if (estadoCarga === "error" || !state.tablero) {
    return (
      <div className={styles.container}>
        <AriaLiveAnnouncer mensaje={`Error: ${mensajeErrorCarga}`} />
        <div
          className={styles.alertaError}
          role="alert"
          style={{ maxWidth: "600px", margin: "2rem auto", flexDirection: "column", alignItems: "flex-start" }}
        >
          <div className={styles.alertaErrorContent}>
            <Icon name="error" size={24} />
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>No se pudo cargar el tablero</h2>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
                {mensajeErrorCarga || "El tablero no existe o no tienes acceso."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={cargarTablero}
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "0.5rem 1rem",
              fontWeight: 700,
              cursor: "pointer",
              minHeight: "44px",
              marginTop: "0.5rem",
            }}
          >
            Reintentar
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/tableros" className={styles.backLink} style={{ display: "inline-flex" }}>
            <Icon name="arrow_back" size={15} />
            <span>Volver a mis tableros</span>
          </Link>
        </div>
      </div>
    );
  }

  const columnaActivaId = columnaTabSeleccionada || state.tablero.columnas[0]?.id || "";

  return (
    <div className={styles.container}>
      <AriaLiveAnnouncer mensaje={anuncioAccesible} />

      {/* Aviso de error al mover o crear tarjeta (role="alert" para reversión y fallos) */}
      {avisoError && (
        <div role="alert" className={styles.alertaError}>
          <div className={styles.alertaErrorContent}>
            <Icon name="error" size={18} />
            <span>{avisoError}</span>
          </div>
          <button
            type="button"
            className={styles.alertaErrorClose}
            onClick={() => setAvisoError(null)}
            aria-label="Cerrar aviso de error"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      <header className={styles.headerSection}>
        <div className={styles.titleRow}>
          <div className={styles.titleLeft}>
            <Link href="/tableros" className={styles.backLink} aria-label="Volver a lista de tableros">
              <Icon name="arrow_back" size={15} />
              <span>Tableros</span>
            </Link>
            <h1 className={styles.boardTitle}>{state.tablero.nombre}</h1>
          </div>

          <button
            type="button"
            className={styles.backLink}
            onClick={() => abrirModalCrear()}
            aria-haspopup="dialog"
            style={{ fontWeight: 600, color: "var(--color-primary)" }}
          >
            <Icon name="add" size={15} />
            <span>Nueva Tarjeta</span>
          </button>
        </div>

        {/* Carrusel/stepper de columnas para pantallas estrechas y móviles */}
        <div className={styles.columnStepper} role="tablist" aria-label="Pestañas de columnas">
          {state.tablero.columnas.map((col) => {
            const count = tarjetasOptimistas.filter((t) => t.columnaId === col.id).length;
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
          filtroTexto={filtroTexto}
          onCambiarTexto={(texto) => setFiltroTexto(texto)}
          filtroEtiqueta={filtroEtiqueta}
          onCambiarEtiqueta={(tag) => setFiltroEtiqueta(tag)}
          onLimpiar={() => {
            setFiltroTexto("");
            setFiltroEtiqueta(null);
          }}
          onNuevaTarea={() => abrirModalCrear(state.tablero?.columnas[0]?.id)}
        />
      </header>

      {/* Región de Columnas del Tablero Kanban (sin <main> anidado) */}
      <section className={styles.columnsWrapper} aria-label="Columnas del tablero">
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
              tableroId={tableroId}
              onMoverTeclado={moverTarjetaAColumna}
              onDropTarjeta={moverTarjetaAColumna}
              onAgregarTarjeta={abrirModalCrear}
              onVerDetalle={(id) => {
                const tarjeta = tarjetasOptimistas.find((t) => t.id === id);
                if (tarjeta) setTarjetaDetalleFallback(tarjeta);
              }}
            />
          );
        })}
      </section>

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

      {/* Modal de respaldo cuando no se usa navegación por ruta */}
      {tarjetaDetalleFallback && (
        <ModalDialog
          isOpen={!!tarjetaDetalleFallback}
          onClose={() => setTarjetaDetalleFallback(null)}
          titulo="Detalle de Tarea"
        >
          <TarjetaDetalleContenido
            tarjeta={tarjetaDetalleFallback}
            columnas={state.tablero?.columnas}
            tableroNombre={state.tablero?.nombre || "Sprint 24"}
          />
        </ModalDialog>
      )}
    </div>
  );
}
