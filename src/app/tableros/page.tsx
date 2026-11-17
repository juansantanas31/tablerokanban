"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tablero } from "@/schemas/tarjeta.schema";
import { ModalDialog } from "@/components/Modal/ModalDialog";
import { AriaLiveAnnouncer } from "@/components/AriaLive/AriaLiveAnnouncer";
import { Icon } from "@/components/Icon/Icon";
import { apiCliente, ApiError } from "@/lib/api-cliente";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import styles from "./tableros.module.css";

export default function TablerosPage() {
  const router = useRouter();
  const [tableros, setTableros] = useState<Tablero[]>([]);
  const [estado, setEstado] = useState<"carga" | "error" | "vacio" | "exito">("carga");
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [ultimoTableroId, setUltimoTableroId] = useLocalStorage<string | null>(
    "kanban_ultimo_tablero",
    null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const [tableroAEliminar, setTableroAEliminar] = useState<Tablero | null>(null);
  const [eliminandoTablero, setEliminandoTablero] = useState(false);
  const [anuncio, setAnuncio] = useState("Cargando lista de tableros...");

  const cargarTableros = useCallback(async () => {
    setEstado("carga");
    setMensajeError(null);
    setAnuncio("Cargando tableros desde el servidor...");

    try {
      const data = await apiCliente.get<{ items: Tablero[] }>("/api/tableros");
      const items = data.items || [];
      setTableros(items);

      if (items.length === 0) {
        setEstado("vacio");
        setAnuncio("No tienes tableros creados aún.");
      } else {
        setEstado("exito");
        setAnuncio(`Se cargaron ${items.length} tableros exitosamente.`);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setAnuncio("Sesión no válida o expirada. Redirigiendo a inicio de sesión...");
        router.push("/login");
        return;
      }

      const mensaje =
        err instanceof ApiError ? err.message : "Error al conectar con el servidor.";
      setMensajeError(mensaje);
      setEstado("error");
      setAnuncio(`Error al cargar tableros: ${mensaje}`);
    }
  }, [router]);

  useEffect(() => {
    let cancelado = false;

    apiCliente
      .get<{ items: Tablero[] }>("/api/tableros")
      .then((data) => {
        if (cancelado) return;
        const items = data.items || [];
        setTableros(items);

        if (items.length === 0) {
          setEstado("vacio");
          setAnuncio("No tienes tableros creados aún.");
        } else {
          setEstado("exito");
          setAnuncio(`Se cargaron ${items.length} tableros exitosamente.`);
        }
      })
      .catch((err: unknown) => {
        if (cancelado) return;
        if (err instanceof ApiError && err.status === 401) {
          router.push("/login");
          return;
        }

        const mensaje =
          err instanceof ApiError ? err.message : "Error al conectar con el servidor.";
        setMensajeError(mensaje);
        setEstado("error");
        setAnuncio(`Error al cargar tableros: ${mensaje}`);
      });

    return () => {
      cancelado = true;
    };
  }, [router]);

  const handleCrearTablero = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNombre("");

    const nombreLimpio = nuevoNombre.trim();
    if (nombreLimpio.length < 1 || nombreLimpio.length > 100) {
      setErrorNombre("El nombre del tablero debe tener entre 1 y 100 caracteres.");
      return;
    }

    setCreando(true);
    try {
      const res = await apiCliente.post<{ tablero: Tablero }>("/api/tableros", {
        nombre: nombreLimpio,
      });

      const nuevoTablero = res.tablero;
      setTableros((prev) => [nuevoTablero, ...prev]);
      setUltimoTableroId(nuevoTablero.id);
      setEstado("exito");
      setAnuncio(`Tablero "${nuevoTablero.nombre}" creado exitosamente.`);
      setIsModalOpen(false);
      setNuevoNombre("");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      const mensaje =
        err instanceof ApiError ? err.message : "No se pudo crear el tablero.";
      setErrorNombre(mensaje);
      setAnuncio(`Error al crear tablero: ${mensaje}`);
    } finally {
      setCreando(false);
    }
  };

  const handleConfirmarEliminarTablero = async () => {
    if (!tableroAEliminar || eliminandoTablero) return;
    setEliminandoTablero(true);
    const target = tableroAEliminar;

    try {
      await apiCliente.delete(`/api/tableros/${target.id}`);
      setTableros((prev) => {
        const restantes = prev.filter((item) => item.id !== target.id);
        if (restantes.length === 0) {
          setEstado("vacio");
        }
        return restantes;
      });
      if (ultimoTableroId === target.id) {
        setUltimoTableroId(null);
      }
      setAnuncio(`Tablero "${target.nombre}" eliminado exitosamente.`);
      setTableroAEliminar(null);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      const mensaje =
        err instanceof ApiError ? err.message : "No se pudo eliminar el tablero.";
      setMensajeError(mensaje);
      setAnuncio(`Error al eliminar tablero: ${mensaje}`);
      setTableroAEliminar(null);
    } finally {
      setEliminandoTablero(false);
    }
  };

  return (
    <div className={styles.container}>
      <AriaLiveAnnouncer mensaje={anuncio} />

      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Mis Tableros</h1>
          {ultimoTableroId && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Último tablero visitado:{" "}
              <strong>
                {tableros.find((t) => t.id === ultimoTableroId)?.nombre || ultimoTableroId}
              </strong>
            </p>
          )}
        </div>

        <button
          type="button"
          className={styles.createButton}
          onClick={() => setIsModalOpen(true)}
          aria-haspopup="dialog"
        >
          + Nuevo Tablero
        </button>
      </div>

      {/* Estado de Carga con Esqueleto */}
      {estado === "carga" && (
        <div className={styles.boardsGrid} aria-label="Cargando tableros" aria-busy="true">
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      )}

      {/* Estado de Error con Reintento */}
      {estado === "error" && (
        <div className={styles.errorState} role="alert">
          <Icon name="error" size={32} />
          <p style={{ fontWeight: 600 }}>{mensajeError || "Ocurrió un error al cargar los tableros."}</p>
          <button type="button" className={styles.retryButton} onClick={cargarTableros}>
            Reintentar
          </button>
        </div>
      )}

      {/* Estado Vacío */}
      {estado === "vacio" && (
        <div className={styles.emptyState}>
          <Icon name="inbox" size={36} />
          <p style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--text-primary)" }}>
            No tienes tableros disponibles
          </p>
          <p style={{ fontSize: "0.875rem" }}>
            Crea tu primer tablero para comenzar a organizar tus tareas por columnas.
          </p>
          <button
            type="button"
            className={styles.createButton}
            onClick={() => setIsModalOpen(true)}
            style={{ marginTop: "0.5rem" }}
          >
            Crear mi primer tablero
          </button>
        </div>
      )}

      {/* Estado de Éxito: Lista de Tableros */}
      {estado === "exito" && (
        <ul className={styles.boardsGrid} aria-label="Lista de tableros">
          {tableros.map((t) => (
            <li key={t.id}>
              <article className={styles.boardCard}>
                <h2 className={styles.boardTitle}>{t.nombre}</h2>
                <div className={styles.boardMeta}>
                  <span>Columnas: {t.columnas.length}</span>
                </div>
                <div className={styles.columnsPreview}>
                  {t.columnas.map((col) => (
                    <span key={col.id} className={styles.columnPill}>
                      {col.nombre}
                    </span>
                  ))}
                </div>
                <div className={styles.boardActions}>
                  <Link
                    href={`/tableros/${t.id}`}
                    className={styles.openLink}
                    onClick={() => setUltimoTableroId(t.id)}
                  >
                    Abrir Tablero
                  </Link>
                  <button
                    type="button"
                    className={styles.deleteBoardButton}
                    onClick={() => setTableroAEliminar(t)}
                    aria-label={`Eliminar tablero: ${t.nombre}`}
                    title="Eliminar tablero"
                  >
                    <Icon name="delete" size={16} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {/* Modal para crear tablero con <dialog> */}
      <ModalDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        titulo="Crear Nuevo Tablero"
      >
        <form
          onSubmit={handleCrearTablero}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label htmlFor="nombre-tablero" style={{ fontWeight: 700, fontSize: "0.875rem" }}>
              Nombre del Tablero *
            </label>
            <input
              id="nombre-tablero"
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Ej: Sprint 1 - Organización"
              maxLength={100}
              required
              disabled={creando}
              aria-invalid={!!errorNombre}
              aria-describedby={errorNombre ? "error-nombre-tablero" : undefined}
              style={{
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                fontSize: "1rem",
                minHeight: "44px",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-primary)",
              }}
            />
            {errorNombre && (
              <span
                id="error-nombre-tablero"
                role="alert"
                style={{ color: "var(--color-error)", fontSize: "0.8125rem" }}
              >
                {errorNombre}
              </span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1rem",
            }}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={creando}
              style={{
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                minHeight: "44px",
                color: "var(--text-secondary)",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creando}
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 1.25rem",
                fontWeight: 700,
                cursor: "pointer",
                minHeight: "44px",
              }}
            >
              {creando ? "Creando..." : "Crear Tablero"}
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Modal de confirmación para eliminar tablero */}
      <ModalDialog
        isOpen={!!tableroAEliminar}
        onClose={() => {
          if (!eliminandoTablero) setTableroAEliminar(null);
        }}
        titulo="Eliminar Tablero"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", margin: 0 }}>
            ¿Estás seguro de que deseas eliminar el tablero{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {tableroAEliminar?.nombre}
            </strong>
            ? Se eliminarán también todas sus tarjetas de forma permanente.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setTableroAEliminar(null)}
              disabled={eliminandoTablero}
              style={{
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                minHeight: "44px",
                color: "var(--text-secondary)",
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmarEliminarTablero}
              disabled={eliminandoTablero}
              style={{
                backgroundColor: "var(--color-danger)",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 1.25rem",
                fontWeight: 700,
                cursor: "pointer",
                minHeight: "44px",
              }}
            >
              {eliminandoTablero ? "Eliminando..." : "Eliminar Tablero"}
            </button>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}
