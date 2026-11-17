"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tablero, Tarjeta } from "@/schemas/tarjeta.schema";
import { AriaLiveAnnouncer } from "@/components/AriaLive/AriaLiveAnnouncer";
import { Icon } from "@/components/Icon/Icon";
import styles from "./page.module.css";

interface TableroConResumen {
  tablero: Tablero;
  tarjetas: Tarjeta[];
}

interface TarjetaConContexto {
  tarjeta: Tarjeta;
  tableroId: string;
  tableroNombre: string;
  columnaNombre: string;
}

export default function HomePage() {
  const [cargando, setCargando] = useState(true);
  const [usuarioCorreo, setUsuarioCorreo] = useState<string | null>(null);
  const [tablerosResumen, setTablerosResumen] = useState<TableroConResumen[]>([]);
  const [anuncio, setAnuncio] = useState("Cargando inicio...");

  useEffect(() => {
    let cancelado = false;

    async function cargarResumenUsuario() {
      try {
        const resYo = await fetch("/api/auth/yo", { cache: "no-store" });
        if (!resYo.ok) {
          if (!cancelado) {
            setUsuarioCorreo(null);
            setAnuncio("Bienvenido al Tablero Kanban.");
          }
          return;
        }

        const dataYo = (await resYo.json()) as { usuario?: { correo?: string } };
        const correo = dataYo.usuario?.correo || "Usuario";

        const resTableros = await fetch("/api/tableros", { cache: "no-store" });
        if (!resTableros.ok) {
          if (!cancelado) {
            setUsuarioCorreo(correo);
          }
          return;
        }

        const dataTableros = (await resTableros.json()) as { items?: Tablero[] };
        const lista = dataTableros.items || [];

        const detalles = await Promise.all(
          lista.map(async (tab) => {
            try {
              const r = await fetch(`/api/tableros/${tab.id}`, { cache: "no-store" });
              if (r.ok) {
                const d = (await r.json()) as { tablero: Tablero; tarjetas: Tarjeta[] };
                return { tablero: d.tablero || tab, tarjetas: d.tarjetas || [] };
              }
            } catch {
              // Ignorar fallo individual y devolver tablero sin tarjetas
            }
            return { tablero: tab, tarjetas: [] };
          })
        );

        if (!cancelado) {
          setUsuarioCorreo(correo);
          setTablerosResumen(detalles);
          setAnuncio(`Resumen cargado con ${detalles.length} tableros.`);
        }
      } catch {
        if (!cancelado) {
          setUsuarioCorreo(null);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarResumenUsuario();
    return () => {
      cancelado = true;
    };
  }, []);

  // Calcular métricas reales a partir de los tableros y tarjetas del usuario
  const totalTableros = tablerosResumen.length;
  const todasLasTarjetas: TarjetaConContexto[] = [];

  let enProgreso = 0;
  let completadas = 0;

  for (const item of tablerosResumen) {
    for (const t of item.tarjetas) {
      const col = item.tablero.columnas.find((c) => c.id === t.columnaId);
      const colNombre = col?.nombre || t.columnaId;
      const colLower = colNombre.toLowerCase();

      if (colLower.includes("progreso") || colLower.includes("curso") || colLower.includes("revis")) {
        enProgreso++;
      } else if (colLower.includes("hecho") || colLower.includes("completad")) {
        completadas++;
      }

      todasLasTarjetas.push({
        tarjeta: t,
        tableroId: item.tablero.id,
        tableroNombre: item.tablero.nombre,
        columnaNombre: colNombre,
      });
    }
  }

  // Tarjetas prioritarias (urgentes/importantes o con fecha de vencimiento próxima)
  const tarjetasDestacadas = [...todasLasTarjetas]
    .sort((a, b) => {
      const aUrg = a.tarjeta.etiquetas.includes("urgente") ? 0 : 1;
      const bUrg = b.tarjeta.etiquetas.includes("urgente") ? 0 : 1;
      if (aUrg !== bUrg) return aUrg - bUrg;
      const aVence = a.tarjeta.vence || "9999-12-31";
      const bVence = b.tarjeta.vence || "9999-12-31";
      return aVence.localeCompare(bVence);
    })
    .slice(0, 6);

  if (cargando) {
    return (
      <div className={styles.pageContainer}>
        <AriaLiveAnnouncer mensaje="Cargando resumen del espacio de trabajo..." />
        <div className={styles.heroSection}>
          <div className={styles.heroText}>
            <h1 className={styles.heading1}>Tablero Kanban — Espacio de Trabajo</h1>
            <p className={styles.description}>Cargando tu resumen de tableros y tarjetas...</p>
          </div>
        </div>
      </div>
    );
  }

  // Vista para usuario autenticado: información real de sus tableros y tarjetas
  if (usuarioCorreo) {
    return (
      <div className={styles.pageContainer}>
        <AriaLiveAnnouncer mensaje={anuncio} />

        <section className={styles.heroSection} aria-labelledby="inicio-titulo">
          <div className={styles.heroText}>
            <h1 id="inicio-titulo" className={styles.heading1}>
              Resumen de tus Tableros y Tarjetas
            </h1>
            <p className={styles.description}>
              Sesión activa como <strong>{usuarioCorreo}</strong>. Consulta el estado general de tus
              proyectos y accede rápidamente a tus tareas pendientes.
            </p>
          </div>

          <div className={styles.heroActions}>
            <Link href="/tableros" className={styles.primaryButton}>
              <Icon name="view_kanban" size={18} />
              <span>Ir a Mis Tableros</span>
            </Link>
          </div>
        </section>

        {/* Métricas reales */}
        <section className={styles.statsGrid} aria-label="Métricas de progreso">
          <article className={styles.statCard}>
            <span className={styles.statLabel}>
              <Icon name="view_kanban" size={15} />
              Tableros activos
            </span>
            <strong className={styles.statValue}>{totalTableros}</strong>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statLabel}>
              <Icon name="format_list_bulleted" size={15} />
              Total de tarjetas
            </span>
            <strong className={styles.statValue}>{todasLasTarjetas.length}</strong>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statLabel}>
              <Icon name="cycle" size={15} />
              En progreso / Revisión
            </span>
            <strong className={styles.statValue}>{enProgreso}</strong>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statLabel}>
              <Icon name="check_circle" size={15} />
              Completadas
            </span>
            <strong className={styles.statValue}>{completadas}</strong>
          </article>
        </section>

        {/* Tus Tableros */}
        <section className={styles.sectionBlock} aria-labelledby="titulo-mis-tableros">
          <div className={styles.sectionHeader}>
            <h2 id="titulo-mis-tableros" className={styles.sectionTitle}>
              Tus Tableros
            </h2>
            <Link href="/tableros" className={styles.sectionLink}>
              Administrar o crear tableros →
            </Link>
          </div>

          {tablerosResumen.length === 0 ? (
            <div className={styles.emptyCard}>
              Aún no tienes tableros creados. Ve a{" "}
              <Link href="/tableros" style={{ color: "var(--color-primary)" }}>
                Mis Tableros
              </Link>{" "}
              para crear el primero.
            </div>
          ) : (
            <ul className={styles.cardsGrid}>
              {tablerosResumen.map(({ tablero, tarjetas }) => (
                <li key={tablero.id}>
                  <article className={styles.boardSummaryCard}>
                    <h3 className={styles.boardName}>{tablero.nombre}</h3>
                    <div className={styles.boardMetaRow}>
                      <span>{tablero.columnas.length} columnas</span>
                      <span>·</span>
                      <span>{tarjetas.length} tarjetas</span>
                    </div>
                    <div className={styles.pillList}>
                      {tablero.columnas.map((col) => {
                        const count = tarjetas.filter((t) => t.columnaId === col.id).length;
                        return (
                          <span key={col.id} className={styles.pill}>
                            {col.nombre}: {count}
                          </span>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                      <Link
                        href={`/tableros/${tablero.id}`}
                        className={styles.primaryButton}
                        style={{ width: "100%", padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                      >
                        Abrir Tablero
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Tarjetas prioritarias o próximas a vencer */}
        <section className={styles.sectionBlock} aria-labelledby="titulo-tarjetas-destacadas">
          <div className={styles.sectionHeader}>
            <h2 id="titulo-tarjetas-destacadas" className={styles.sectionTitle}>
              Tarjetas Destacadas y Próximos Vencimientos
            </h2>
          </div>

          {tarjetasDestacadas.length === 0 ? (
            <div className={styles.emptyCard}>
              No tienes tarjetas registradas todavía en tus tableros.
            </div>
          ) : (
            <ul className={styles.taskList}>
              {tarjetasDestacadas.map(({ tarjeta, tableroId, tableroNombre, columnaNombre }) => (
                <li key={tarjeta.id} className={styles.taskRow}>
                  <div className={styles.taskRowMain}>
                    <span className={styles.taskRowTitle}>{tarjeta.titulo}</span>
                    <div className={styles.taskRowMeta}>
                      <span>{tableroNombre}</span>
                      <span>·</span>
                      <span>{columnaNombre}</span>
                      {tarjeta.etiquetas.includes("urgente") && (
                        <span className={styles.urgentTag}>Urgente</span>
                      )}
                      {tarjeta.vence && (
                        <>
                          <span>·</span>
                          <span>Vence: {tarjeta.vence}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/tableros/${tableroId}/tarjetas/${tarjeta.id}`}
                    className={styles.secondaryButton}
                    style={{ padding: "0.45rem 0.85rem", fontSize: "0.8125rem", minHeight: "38px" }}
                  >
                    <Icon name="open_in_new" size={14} />
                    <span>Ver tarjeta</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  // Vista pública cuando no hay sesión iniciada
  return (
    <div className={styles.pageContainer}>
      <AriaLiveAnnouncer mensaje={anuncio} />

      <section className={styles.heroSection} aria-labelledby="inicio-publico-titulo">
        <div className={styles.heroText}>
          <h1 id="inicio-publico-titulo" className={styles.heading1}>
            Tablero Kanban — Espacio de Trabajo
          </h1>
          <p className={styles.description}>
            Organiza tus proyectos por tableros, gestiona tareas en columnas con límites WIP y
            sincroniza tu progreso en la nube con Firebase.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href="/login" className={styles.primaryButton}>
            <Icon name="login" size={18} />
            <span>Iniciar Sesión</span>
          </Link>
          <Link href="/tableros" className={styles.secondaryButton}>
            <Icon name="view_kanban" size={18} />
            <span>Mis Tableros</span>
          </Link>
        </div>
      </section>

      <section className={styles.featuresGrid} aria-label="Capacidades principales">
        <article className={styles.featureCard}>
          <h2 className={styles.featureTitle}>
            <Icon name="view_kanban" size={20} style={{ color: "var(--color-primary)" }} />
            <span>Tableros Personalizados</span>
          </h2>
          <p className={styles.featureDesc}>
            Crea, administra y elimina tus propios tableros de trabajo independientes, con columnas
            configuradas para cada etapa de tu proyecto.
          </p>
        </article>

        <article className={styles.featureCard}>
          <h2 className={styles.featureTitle}>
            <Icon name="checklist" size={20} style={{ color: "var(--color-primary)" }} />
            <span>Tarjetas, Etiquetas y Arrastre</span>
          </h2>
          <p className={styles.featureDesc}>
            Crea o elimina tarjetas con fechas límite y prioridades, muévelas con el puntero o por
            teclado y filtra al instante.
          </p>
        </article>

        <article className={styles.featureCard}>
          <h2 className={styles.featureTitle}>
            <Icon name="cloud_sync" size={20} style={{ color: "var(--color-primary)" }} />
            <span>Sincronización en Firebase</span>
          </h2>
          <p className={styles.featureDesc}>
            Acceso exclusivo para usuarios registrados en Firebase Authentication con persistencia
            segura y aislada en Firestore.
          </p>
        </article>
      </section>
    </div>
  );
}
