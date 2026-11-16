"use client";

import { useState } from "react";
import type { Tarjeta, Columna } from "@/schemas/tarjeta.schema";
import styles from "./TarjetaDetalleContenido.module.css";

interface Subtarea {
  id: string;
  texto: string;
  completada: boolean;
}

interface Comentario {
  id: string;
  autor: string;
  iniciales: string;
  tiempo: string;
  texto: string;
}

interface TarjetaDetalleContenidoProps {
  tarjeta: Tarjeta;
  columnas?: Columna[];
  tableroNombre?: string;
}

export function TarjetaDetalleContenido({
  tarjeta,
  columnas = [],
  tableroNombre = "Tablero Kanban Minimalista",
}: TarjetaDetalleContenidoProps) {
  const columna = columnas.find((c) => c.id === tarjeta.columnaId);
  const estadoTexto = columna ? columna.nombre : "En Progreso";

  // Subtareas interactivas
  const [subtareas, setSubtareas] = useState<Subtarea[]>([
    {
      id: "sub-1",
      texto: "Definir Custom Resource Definition (CRD) para PrometheusAdapter",
      completada: true,
    },
    {
      id: "sub-2",
      texto: "Ajustar CPU and Memory resource limits en pods de alta concurrencia",
      completada: true,
    },
    {
      id: "sub-3",
      texto: "Configurar targetAverageUtilization a 70% en HPA manifest",
      completada: true,
    },
    {
      id: "sub-4",
      texto: "Ejecutar pruebas de carga sintética simulando picos de 15k req/s",
      completada: false,
    },
    {
      id: "sub-5",
      texto: "Validar métricas de cooldown y escala hacia abajo (scaleDown window)",
      completada: false,
    },
  ]);

  // Comentarios iniciales
  const [comentarios, setComentarios] = useState<Comentario[]>([
    {
      id: "com-1",
      autor: "David Morales · DevOps",
      iniciales: "DM",
      tiempo: "hace 2 horas",
      texto:
        "Los manifests base de KEDA quedaron testeados en el clúster staging. Listos para validar métricas.",
    },
  ]);

  const [nuevoComentario, setNuevoComentario] = useState("");

  const toggleSubtarea = (id: string) => {
    setSubtareas((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completada: !s.completada } : s))
    );
  };

  const agregarComentario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    setComentarios((prev) => [
      ...prev,
      {
        id: `com-${Date.now()}`,
        autor: "Tú · Desarrollador",
        iniciales: "TÚ",
        tiempo: "ahora mismo",
        texto: nuevoComentario.trim(),
      },
    ]);
    setNuevoComentario("");
  };

  const subtareasCompletadas = subtareas.filter((s) => s.completada).length;
  const porcentaje = subtareas.length > 0 ? Math.round((subtareasCompletadas / subtareas.length) * 100) : 0;

  // Código mono estilo Linear LIN-XXXX
  const codigoLinear = tarjeta.id.toUpperCase().startsWith("LIN-")
    ? tarjeta.id.toUpperCase()
    : `LIN-${tarjeta.id.replace(/\D/g, "") || "1042"}`;

  return (
    <div className={styles.container}>
      {/* Barra superior / Status */}
      <div className={styles.subBar}>
        <div className={styles.subBarLeft}>
          <span className={styles.codeBadge}>{codigoLinear}</span>
          <span className={styles.breadcrumb} title={tableroNombre}>
            {tableroNombre}
          </span>
        </div>
        <div className={styles.statusPill}>
          <span className={styles.statusDot}></span>
          <span>{estadoTexto}</span>
        </div>
      </div>

      {/* Título y Descripción */}
      <div>
        <h2 className={styles.title}>{tarjeta.titulo}</h2>
        {tarjeta.descripcion && (
          <p className={styles.description} style={{ marginTop: "0.5rem" }}>
            {tarjeta.descripcion}
          </p>
        )}
      </div>

      {/* Bento Metadata Grid */}
      <section className={styles.bentoGrid} aria-label="Metadatos de la tarea">
        <div className={styles.bentoRow}>
          <span className={styles.bentoLabel}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              person
            </span>
            Asignado
          </span>
          <span className={styles.bentoValue}>
            <span className={styles.avatarMini}>SC</span>
            <span>Sofía Castro</span>
          </span>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.bentoRow}>
          <span className={styles.bentoLabel}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              flag
            </span>
            Prioridad
          </span>
          <span className={styles.bentoValue}>
            <span className={styles.priorityBadge}>
              <span className={styles.priorityDot}></span>
              <span>Alta</span>
            </span>
          </span>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.bentoRow}>
          <span className={styles.bentoLabel}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              calendar_today
            </span>
            Fecha Límite
          </span>
          <span className={styles.bentoValue}>
            {tarjeta.vence || "2026-11-20"}
          </span>
        </div>

        <div className={styles.bentoSplit}>
          <div className={styles.bentoMiniCard}>
            <span className={styles.bentoMiniLabel}>Sprint</span>
            <span className={styles.bentoMiniValue}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                cycle
              </span>
              Sprint 24 · Q3
            </span>
          </div>

          <div className={styles.bentoMiniCard}>
            <span className={styles.bentoMiniLabel}>Estimación</span>
            <span className={styles.bentoMiniValue}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                monitoring
              </span>
              8 Puntos (Fibonacci)
            </span>
          </div>
        </div>

        {tarjeta.etiquetas && tarjeta.etiquetas.length > 0 && (
          <>
            <div className={styles.divider}></div>
            <div className={styles.bentoRow}>
              <span className={styles.bentoLabel}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  label
                </span>
                Etiquetas
              </span>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {tarjeta.etiquetas.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--bg-surface-subtle)",
                      color: "var(--color-primary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Subtareas con Checklist interactivo */}
      <section className={styles.subtasksSection} aria-label="Subtareas de la tarea">
        <div className={styles.subtasksTitleRow}>
          <h3 className={styles.subtasksHeader}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
              checklist
            </span>
            Subtareas
          </h3>
          <span className={styles.subtaskPill}>
            {subtareasCompletadas} de {subtareas.length} ({porcentaje}%)
          </span>
        </div>

        {/* Barra de progreso accesible */}
        <div
          className={styles.progressBarContainer}
          role="progressbar"
          aria-valuenow={porcentaje}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso de subtareas: ${porcentaje}%`}
        >
          <div
            className={styles.progressBarFill}
            style={{ width: `${porcentaje}%` }}
          ></div>
        </div>

        <ul className={styles.subtasksList}>
          {subtareas.map((sub) => (
            <li
              key={sub.id}
              className={styles.subtaskItem}
              onClick={() => toggleSubtarea(sub.id)}
            >
              <input
                type="checkbox"
                checked={sub.completada}
                onChange={() => toggleSubtarea(sub.id)}
                className={styles.subtaskCheckbox}
                aria-label={sub.texto}
                onClick={(e) => e.stopPropagation()}
              />
              <span className={sub.completada ? styles.subtaskTextCompleted : undefined}>
                {sub.texto}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Comentarios y Timeline */}
      <section className={styles.commentsSection} aria-label="Historial y comentarios">
        <h3 className={styles.commentsHeader}>
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
            forum
          </span>
          Actividad y Discusión
        </h3>

        <div className={styles.commentsList}>
          {comentarios.map((c) => (
            <div key={c.id} className={styles.commentItem}>
              <div className={styles.commentAvatar}>{c.iniciales}</div>
              <div className={styles.commentBubble}>
                <div className={styles.commentAuthorRow}>
                  <span className={styles.commentAuthor}>{c.autor}</span>
                  <span className={styles.commentTime}>{c.tiempo}</span>
                </div>
                <p style={{ margin: 0 }}>{c.texto}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={agregarComentario} className={styles.commentInputForm}>
          <input
            type="text"
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            placeholder="Añadir una actualización o comentario..."
            className={styles.commentInput}
            aria-label="Nuevo comentario"
          />
          <button type="submit" className={styles.commentSubmitBtn}>
            Enviar
          </button>
        </form>
      </section>
    </div>
  );
}
