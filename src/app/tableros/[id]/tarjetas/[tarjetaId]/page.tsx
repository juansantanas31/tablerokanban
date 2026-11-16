"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TarjetaDetalleContenido } from "@/components/TarjetaDetalle/TarjetaDetalleContenido";
import type { Tarjeta, Tablero } from "@/schemas/tarjeta.schema";
import { Icon } from "@/components/Icon/Icon";
import { apiCliente, ApiError } from "@/lib/api-cliente";
import styles from "./tarjeta-detalle.module.css";

interface PageProps {
  params: Promise<{ id: string; tarjetaId: string }>;
}

/**
 * Página individual de detalle de tarjeta (Ruta directa /tableros/:id/tarjetas/:tarjetaId).
 * Carga exclusivamente datos reales desde el backend (GET /api/tableros/:id).
 * Sin datos mock ni extras no especificados.
 */
export default function TarjetaDetallePage({ params }: PageProps) {
  const router = useRouter();
  const { id: tableroId, tarjetaId } = use(params);

  const [tablero, setTablero] = useState<Tablero | null>(null);
  const [tarjeta, setTarjeta] = useState<Tarjeta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    apiCliente
      .get<{ tablero: Tablero; tarjetas: Tarjeta[] }>(`/api/tableros/${tableroId}`)
      .then((data) => {
        if (cancelado) return;
        setTablero(data.tablero);
        const encontrada = data.tarjetas.find((t) => t.id === tarjetaId);
        if (encontrada) {
          setTarjeta(encontrada);
        } else {
          setError(`No se encontró ninguna tarjeta con el identificador "${tarjetaId}".`);
        }
      })
      .catch((err: unknown) => {
        if (cancelado) return;
        if (err instanceof ApiError && err.status === 401) {
          router.push("/login");
          return;
        }
        const msg = err instanceof ApiError ? err.message : "Error al cargar la tarjeta";
        setError(msg);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [tableroId, tarjetaId, router]);

  if (cargando) {
    return (
      <div className={styles.container}>
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
          Cargando detalle de la tarjeta...
        </div>
      </div>
    );
  }

  if (error || !tarjeta || !tablero) {
    return (
      <div className={styles.container}>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", color: "var(--color-error)", marginBottom: "0.5rem" }}>
            Tarjeta no encontrada
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {error || "La tarjeta solicitada no existe o no tienes permisos para verla."}
          </p>
          <Link href={`/tableros/${tableroId}`} className={styles.backLink} style={{ display: "inline-flex" }}>
            <Icon name="arrow_back" size={16} />
            <span>Volver al tablero</span>
          </Link>
        </div>
      </div>
    );
  }

  const columnaActual = tablero.columnas.find((c) => c.id === tarjeta.columnaId);

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
          />
          <span>{columnaActual?.nombre || tarjeta.columnaId}</span>
        </div>
      </header>

      <section className={styles.contentCard} aria-labelledby="detalle-tarjeta-titulo">
        <TarjetaDetalleContenido
          tarjeta={tarjeta}
          columnas={tablero.columnas}
          tableroNombre={tablero.nombre}
        />
      </section>

      {/* Dock de navegación fijo al fondo */}
      <footer className={styles.bottomActionDock} aria-label="Navegación de la tarjeta">
        <div className={styles.dockContainer}>
          <Link href={`/tableros/${tableroId}`} className={styles.secondaryAction}>
            <Icon name="close" size={16} />
            <span>Volver al tablero</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
