"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalDialog } from "@/components/Modal/ModalDialog";
import { TarjetaDetalleContenido } from "@/components/TarjetaDetalle/TarjetaDetalleContenido";
import { Tarjeta, Tablero } from "@/schemas/tarjeta.schema";
import { apiCliente } from "@/lib/api-cliente";

interface PageProps {
  params: Promise<{ id: string; tarjetaId: string }>;
}

/**
 * Ruta Interceptada (.)tarjetas/[tarjetaId]
 * Muestra el detalle de la tarjeta dentro de un modal <dialog> accesible
 * manteniendo el tablero en el fondo y actualizando la URL del navegador.
 * Cumple con la Técnica 2 de la Sección 6 ("Rutas paralelas o interceptadas: modal con URL").
 */
export default function TarjetaModalInterceptada({ params }: PageProps) {
  const router = useRouter();
  const { id: tableroId, tarjetaId } = use(params);
  const [tarjeta, setTarjeta] = useState<Tarjeta | null>(null);
  const [tablero, setTablero] = useState<Tablero | null>(null);
  const [cargando, setCargando] = useState(true);

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
        }
      })
      .catch(() => {
        // Si falla la consulta, el modal muestra el fallback accesible
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [tableroId, tarjetaId]);

  return (
    <ModalDialog
      isOpen={true}
      onClose={() => router.back()}
      titulo="Detalle de Tarea"
    >
      {cargando ? (
        <p style={{ padding: "1.5rem", color: "var(--text-muted)" }}>
          Cargando información de la tarea...
        </p>
      ) : tarjeta ? (
        <TarjetaDetalleContenido
          tarjeta={tarjeta}
          columnas={tablero?.columnas}
          tableroNombre={tablero?.nombre || "Sprint en curso"}
        />
      ) : (
        <div style={{ padding: "1.5rem", textAlign: "center" }}>
          <p style={{ color: "var(--color-error)", fontWeight: 600 }}>
            No se encontró la tarjeta solicitada.
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              marginTop: "1rem",
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "0.5rem 1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Volver al tablero
          </button>
        </div>
      )}
    </ModalDialog>
  );
}
