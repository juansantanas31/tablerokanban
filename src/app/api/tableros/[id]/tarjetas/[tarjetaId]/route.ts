import { NextResponse } from "next/server";
import { z } from "zod";
import { manejar } from "@/lib/http";
import { requerirUsuario, comprobarOrigen } from "@/lib/auth";
import { TarjetaService } from "@/services/tarjeta.service";

interface RouteParams {
  params: Promise<{ id: string; tarjetaId: string }>;
}

const EditarTarjetaSchema = z.object({
  titulo: z.string().trim().min(1).max(100).optional(),
  descripcion: z.string().max(500).optional(),
  etiquetas: z.array(z.string()).optional(),
  vence: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export const PATCH = manejar(async (request: Request, context: RouteParams) => {
  comprobarOrigen(request);
  const usuario = await requerirUsuario(request);
  const { id: tableroId, tarjetaId } = await context.params;

  const body = await request.json();
  const inputValidado = EditarTarjetaSchema.parse(body);

  const tarjetaActualizada = await TarjetaService.editarTarjeta(
    usuario.uid,
    tableroId,
    tarjetaId,
    inputValidado
  );

  return NextResponse.json({ tarjeta: tarjetaActualizada }, { status: 200 });
});

export const DELETE = manejar(async (request: Request, context: RouteParams) => {
  comprobarOrigen(request);
  const usuario = await requerirUsuario(request);
  const { id: tableroId, tarjetaId } = await context.params;

  await TarjetaService.eliminarTarjeta(usuario.uid, tableroId, tarjetaId);
  return new NextResponse(null, { status: 204 });
});
