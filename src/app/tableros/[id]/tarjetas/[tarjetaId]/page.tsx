import Link from "next/link";
import { TarjetaDetalleContenido } from "@/components/TarjetaDetalle/TarjetaDetalleContenido";
import type { Tarjeta, Columna } from "@/schemas/tarjeta.schema";
import { Icon } from "@/components/Icon/Icon";
import styles from "./tarjeta-detalle.module.css";

interface PageProps {
  params: Promise<{ id: string; tarjetaId: string }>;
}

export default async function TarjetaDetallePage({ params }: PageProps) {
  const { id: tableroId, tarjetaId } = await params;

  // Tarjeta mock con datos enriquecidos de Stitch LIN-1042 o con el ID de la URL
  const tarjetaMock: Tarjeta = {
    id: tarjetaId,
    titulo:
      tarjetaId === "LIN-1042" || tarjetaId.includes("1042")
        ? "Refactorizar arquitectura de clúster Kubernetes para auto-escalado horizontal"
        : `Refactorizar pipeline y optimización (${tarjetaId})`,
    descripcion:
      "Implementar réplicas multi-región y configurar HPA basado en métricas de Prometheus. Reducir latencia de respuesta en endpoints críticos un 40% durante cargas pico.",
    columnaId: "col-en-curso",
    posicion: 1000,
    etiquetas: ["Infra", "Kubernetes", "Alta Prioridad"],
    vence: "2026-11-20",
    creadoEn: "2026-11-15T10:00:00.000Z",
  };

  const columnasMock: Columna[] = [
    { id: "col-por-hacer", nombre: "Por hacer", limiteWip: 10 },
    { id: "col-en-curso", nombre: "En progreso", limiteWip: 3 },
    { id: "col-revision", nombre: "Revisión", limiteWip: 5 },
    { id: "col-hecho", nombre: "Completado", limiteWip: 50 },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.subBar}>
        <div className={styles.subBarLeft}>
          <Link href={`/tableros/${tableroId}`} className={styles.backLink}>
            <Icon name="arrow_back" size={16} />
            <span>Volver al tablero</span>
          </Link>
        </div>
        <div className={styles.statusPill}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "var(--color-primary)",
            }}
          ></span>
          <span>En progreso</span>
        </div>
      </header>

      <main className={styles.contentCard} aria-labelledby="detalle-tarjeta-titulo">
        <TarjetaDetalleContenido
          tarjeta={tarjetaMock}
          columnas={columnasMock}
          tableroNombre={`Sprint 24 · Tablero ${tableroId}`}
        />
      </main>

      {/* Dock de acciones fijo al fondo estilo Stitch */}
      <footer className={styles.bottomActionDock} aria-label="Acciones de la tarjeta">
        <div className={styles.dockContainer}>
          <Link href={`/tableros/${tableroId}`} className={styles.secondaryAction}>
            <Icon name="close" size={16} />
            <span>Cerrar</span>
          </Link>
          <Link href={`/tableros/${tableroId}`} className={styles.primaryAction}>
            <Icon name="check_circle" size={16} />
            <span>Mover a Revisión</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
