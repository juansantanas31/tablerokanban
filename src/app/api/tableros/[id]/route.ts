import { NextResponse } from "next/server";
import { manejar } from "@/lib/http";
import { requerirUsuario, comprobarOrigen } from "@/lib/auth";
import { TableroService } from "@/services/tablero.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = manejar(async (request: Request, context: RouteParams) => {
  const usuario = await requerirUsuario(request);
  const { id: tableroId } = await context.params;

  const resultado = await TableroService.obtenerTableroConTarjetas(usuario.uid, tableroId);
  return NextResponse.json(resultado, { status: 200 });
});

export const DELETE = manejar(async (request: Request, context: RouteParams) => {
  comprobarOrigen(request);
  const usuario = await requerirUsuario(request);
  const { id: tableroId } = await context.params;

  await TableroService.eliminarTablero(usuario.uid, tableroId);
  return new NextResponse(null, { status: 204 });
});
