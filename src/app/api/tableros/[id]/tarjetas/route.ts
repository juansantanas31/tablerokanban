import { NextResponse } from "next/server";
import { manejar } from "@/lib/http";
import { requerirUsuario, comprobarOrigen } from "@/lib/auth";
import { TarjetaService } from "@/services/tarjeta.service";
import { CrearTarjetaSchema } from "@/schemas/tarjeta.schema";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const POST = manejar(async (request: Request, context: RouteParams) => {
  comprobarOrigen(request);
  const usuario = await requerirUsuario(request);
  const { id: tableroId } = await context.params;

  const body = await request.json();
  const inputValidado = CrearTarjetaSchema.parse(body);

  const tarjetaCreada = await TarjetaService.crearTarjeta(
    usuario.uid,
    tableroId,
    inputValidado
  );

  return NextResponse.json({ tarjeta: tarjetaCreada }, { status: 201 });
});
