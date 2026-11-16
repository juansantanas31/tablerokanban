"use client";

import { useState } from "react";
import type { Tarjeta, Columna } from "@/schemas/tarjeta.schema";
import { Icon } from "@/components/Icon/Icon";
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
  onCerrar?: () => void;
}

export function TarjetaDetalleContenido({
  tarjeta,
  columnas = [],
  tableroNombre = "Tablero Kanban Minimalista",
}: TarjetaDetalleContenidoProps) {
  const columna = columnas.find((c) => c.id === tarjeta.columnaId);
  const estadoInicial = columna ? columna.nombre : "En progreso";

  const [estadoActual, setEstadoActual] = useState(estadoInicial);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subtareas interactivas (Stitch LIN-1042)
  const [subtareas, setSubtareas] = useState<Subtarea[]>([
    {
      id: "sub-1",
      texto: "Configurar runners distribuidos en GCP",
      completada: true,
    },
    {
      id: "sub-2",
      texto: "Migrar scripts de Bash a Github Actions reusable workflows",
      completada: true,
    },
    {
      id: "sub-3",
      texto: "Implementar rollback automático con canary testing",
      completada: true,
    },
    {
      id: "sub-4",
      texto: "Configurar alertas en PagerDuty",
      completada: false,
    },
    {
      id: "sub-5",
      texto: "Documentar guía de incidentes en Notion",
      completada: false,
    },
  ]);

  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState("");

  // Timeline de actividad (Stitch LIN-1042)
  const [comentarios, setComentarios] = useState<Comentario[]>([
    {
      id: "com-1",
      autor: "Mateo Ruiz · SRE",
      iniciales: "MR",
      tiempo: "hace 2 horas",
      texto:
        "Los runners en la región europe-west3 ya pasaron la prueba de estrés de 40 compilaciones concurrentes sin timeouts.",
    },
    {
      id: "com-2",
      autor: "Elena Morales · DevOps",
      iniciales: "EM",
      tiempo: "hace 45 min",
      texto:
        "Excelente. Procedo con la validación de rollback canary antes de conectar las alertas de PagerDuty.",
    },
  ]);

  const [nuevoComentario, setNuevoComentario] = useState("");
  const [isMovedToReview, setIsMovedToReview] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleSelectStatus = (nuevoEstado: string) => {
    setEstadoActual(nuevoEstado);
    setIsStatusMenuOpen(false);
    showToast(`Estado cambiado a: ${nuevoEstado}`);
  };

  const toggleSubtarea = (id: string) => {
    setSubtareas((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, completada: !s.completada } : s));
      const allCompleted = next.every((s) => s.completada);
      if (allCompleted) {
        showToast("¡Todas las subtareas completadas!");
      }
      return next;
    });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;

    setSubtareas((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        texto: newSubtaskText.trim(),
        completada: false,
      },
    ]);
    setNewSubtaskText("");
    setIsAddingSubtask(false);
    showToast("Subtarea añadida");
  };

  const agregarComentario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    setComentarios((prev) => [
      ...prev,
      {
        id: `com-${Date.now()}`,
        autor: "Tú · Dev Lead",
        iniciales: "TÚ",
        tiempo: "justo ahora",
        texto: nuevoComentario.trim(),
      },
    ]);
    setNuevoComentario("");
    showToast("Comentario publicado");
  };

  const handleMoveToReview = () => {
    setEstadoActual("En revisión");
    setIsMovedToReview(true);
    showToast("Tarea movida a Revisión");
  };

  const subtareasCompletadas = subtareas.filter((s) => s.completada).length;
  const porcentaje = subtareas.length > 0 ? Math.round((subtareasCompletadas / subtareas.length) * 100) : 0;

  const codigoLinear = tarjeta.id.toUpperCase().startsWith("LIN-")
    ? tarjeta.id.toUpperCase()
    : `LIN-${tarjeta.id.replace(/\D/g, "") || "1042"}`;

  return (
    <div className={styles.container}>
      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className={styles.toast} role="status" aria-live="polite">
          <Icon name="check_circle" size={16} style={{ color: "#34d399" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barra superior / Status */}
      <div className={styles.subBar}>
        <div className={styles.subBarLeft}>
          <span className={styles.codeBadge}>{codigoLinear}</span>
          <span className={styles.breadcrumb} title={tableroNombre}>
            {tableroNombre}
          </span>
        </div>

        <div className={styles.subBarRight}>
          {/* Status selector pill dropdown */}
          <div className={styles.statusDropdownContainer}>
            <button
              type="button"
              className={styles.statusPillBtn}
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              aria-expanded={isStatusMenuOpen}
              aria-label={`Estado actual: ${estadoActual}. Cambiar estado`}
            >
              <span className={styles.statusDot}></span>
              <span>{estadoActual}</span>
              <Icon name="expand_more" size={14} />
            </button>

            {isStatusMenuOpen && (
              <div className={styles.statusDropdownMenu} role="menu">
                {["Por hacer", "En progreso", "En revisión", "Completado"].map((est) => (
                  <button
                    key={est}
                    type="button"
                    className={styles.statusMenuItem}
                    onClick={() => handleSelectStatus(est)}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor:
                          est === "Completado"
                            ? "#34d399"
                            : est === "En revisión"
                            ? "#38bdf8"
                            : est === "En progreso"
                            ? "#638fff"
                            : "#64748b",
                      }}
                    ></span>
                    {est}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action dots popover trigger */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className={styles.menuToggleBtn}
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
              aria-label="Más acciones de la tarea"
              aria-expanded={isActionMenuOpen}
            >
              <Icon name="more_vert" size={18} />
            </button>

            {isActionMenuOpen && (
              <div className={styles.actionPopover} role="menu">
                <button
                  type="button"
                  className={styles.actionMenuItem}
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    showToast("Enlace copiado al portapapeles");
                  }}
                >
                  <Icon name="share" size={15} />
                  Compartir
                </button>
                <button
                  type="button"
                  className={styles.actionMenuItem}
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    showToast("Tarea archivada");
                  }}
                >
                  <Icon name="archive" size={15} />
                  Archivar
                </button>
                <button
                  type="button"
                  className={styles.actionMenuItem}
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    showToast("Vista previa duplicada");
                  }}
                >
                  <Icon name="content_copy" size={15} />
                  Duplicar
                </button>
              </div>
            )}
          </div>
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
            <Icon name="person" size={16} />
            Asignado a
          </span>
          <span className={styles.bentoValue}>
            <span className={styles.avatarMini}>EM</span>
            <span>Elena Morales <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(DevOps)</span></span>
          </span>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.bentoRow}>
          <span className={styles.bentoLabel}>
            <Icon name="signal_cellular_alt" size={16} />
            Prioridad
          </span>
          <span className={styles.bentoValue}>
            <span className={styles.priorityBadge}>
              <Icon name="keyboard_double_arrow_up" size={12} />
              <span>Alta</span>
            </span>
          </span>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.bentoRow}>
          <span className={styles.bentoLabel}>
            <Icon name="cycle" size={16} />
            Sprint
          </span>
          <span className={styles.bentoValue}>
            Sprint 42 <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Q2 Core)</span>
          </span>
        </div>

        <div className={styles.bentoSplit}>
          <div className={styles.bentoMiniCard}>
            <span className={styles.bentoMiniLabel}>Estimación</span>
            <span className={styles.bentoMiniValue}>
              <Icon name="analytics" size={14} />
              5 story points
            </span>
          </div>

          <div className={styles.bentoMiniCard}>
            <span className={styles.bentoMiniLabel}>Fecha límite</span>
            <span className={styles.bentoMiniValue}>
              <Icon name="calendar_today" size={14} />
              {tarjeta.vence || "18 de Octubre"}
            </span>
          </div>
        </div>

        {tarjeta.etiquetas && tarjeta.etiquetas.length > 0 && (
          <>
            <div className={styles.divider}></div>
            <div className={styles.bentoRow}>
              <span className={styles.bentoLabel}>
                <span style={{ fontSize: 13 }}>🏷️</span>
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

      {/* Visual Architecture Context Tile */}
      <section className={styles.architectureTile} aria-label="Topología de Despliegue">
        <div className={styles.archHeader}>
          <span className={styles.archTitle}>Topología de Despliegue</span>
          <span className={styles.archBadge}>
            <Icon name="cloud_sync" size={14} />
            GCP Multi-Zone
          </span>
        </div>
        <div className={styles.archCanvas}>
          <div className={styles.archTag}>
            <span className={styles.archTagDot}></span>
            <span>3 clústeres sincronizados (us-east / europe-west)</span>
          </div>
        </div>
      </section>

      {/* Subtareas interactuables con checkboxes */}
      <section className={styles.subtasksSection} aria-label="Subtareas de la tarea">
        <div className={styles.subtasksTitleRow}>
          <h3 className={styles.subtasksHeader}>
            <Icon name="checklist" size={17} />
            Subtareas
          </h3>
          <span className={styles.subtaskPill}>
            {subtareasCompletadas} de {subtareas.length} completadas ({porcentaje}%)
          </span>
        </div>

        {/* Barra de progreso lineal */}
        <div
          className={styles.progressBarContainer}
          role="progressbar"
          aria-valuenow={porcentaje}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso de subtareas: ${porcentaje}%`}
        >
          <div className={styles.progressBarFill} style={{ width: `${porcentaje}%` }}></div>
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

        {isAddingSubtask ? (
          <form onSubmit={handleAddSubtask} className={styles.addSubtaskRow}>
            <input
              type="text"
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              placeholder="Escribe el nombre de la subtarea..."
              className={styles.addSubtaskInput}
              autoFocus
            />
            <button type="submit" className={styles.saveSubtaskBtn}>
              Guardar
            </button>
            <button
              type="button"
              className={styles.addSubtaskBtn}
              onClick={() => setIsAddingSubtask(false)}
            >
              Cancelar
            </button>
          </form>
        ) : (
          <button
            type="button"
            className={styles.addSubtaskBtn}
            onClick={() => setIsAddingSubtask(true)}
          >
            <Icon name="add" size={15} />
            Añadir subtarea
          </button>
        )}
      </section>

      {/* Actividad Reciente & Comentarios */}
      <section className={styles.commentsSection} aria-label="Historial y comentarios">
        <h3 className={styles.commentsHeader}>
          <Icon name="forum" size={17} />
          Actividad y Discusión ({comentarios.length})
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
            placeholder="Escribe una actualización o nota técnica..."
            className={styles.commentInput}
            aria-label="Nuevo comentario"
          />
          <button type="submit" className={styles.commentSubmitBtn}>
            Comentar
          </button>
        </form>
      </section>

      {/* Quick Move Action Trigger */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <button
          type="button"
          onClick={handleMoveToReview}
          style={{
            flex: 1,
            backgroundColor: isMovedToReview ? "rgba(52, 211, 153, 0.2)" : "var(--color-primary-muted)",
            color: isMovedToReview ? "#34d399" : "var(--color-primary)",
            border: `1px solid ${isMovedToReview ? "rgba(52, 211, 153, 0.4)" : "var(--color-primary)"}`,
            borderRadius: "var(--radius-sm)",
            padding: "0.6rem 1rem",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            minHeight: "42px",
            transition: "all 0.2s ease",
          }}
        >
          <Icon name={isMovedToReview ? "check_circle" : "rate_review"} size={16} />
          {isMovedToReview ? "Enviado a Revisión" : "Mover a Revisión"}
        </button>
      </div>
    </div>
  );
}
