export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { manejar } from "@/lib/http";
import { requerirUsuario, comprobarOrigen } from "@/lib/auth";
import { TarjetaService } from "@/services/tarjeta.service";

interface RouteParams {
  params: Promise<{ id: string; tarjetaId: string }>;
}

const MoverTarjetaInputSchema = z.object({
  columnaId: z.string().min(1, "El ID de columna de destino es obligatorio"),
  posicion: z.number().positive().optional(),
});

export const PATCH = manejar(async (request: Request, context: RouteParams) => {
  comprobarOrigen(request);
  const usuario = await requerirUsuario(request);
  const { id: tableroId, tarjetaId } = await context.params;

  const body = await request.json();
  const { columnaId, posicion } = MoverTarjetaInputSchema.parse(body);

  const tarjetaActualizada = await TarjetaService.moverTarjeta(
    usuario.uid,
    tableroId,
    tarjetaId,
    columnaId,
    posicion
  );

  return NextResponse.json({ tarjeta: tarjetaActualizada }, { status: 200 });
});
