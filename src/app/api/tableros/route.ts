export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { manejar } from "@/lib/http";
import { requerirUsuario, comprobarOrigen } from "@/lib/auth";
import { TableroService } from "@/services/tablero.service";

const CrearTableroSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre del tablero no puede estar vacío")
    .max(100, "El nombre no puede exceder 100 caracteres"),
});

export const GET = manejar(async (request: Request) => {
  const usuario = await requerirUsuario(request);
  const tableros = await TableroService.listarTableros(usuario.uid);
  return NextResponse.json({ items: tableros }, { status: 200 });
});

export const POST = manejar(async (request: Request) => {
  comprobarOrigen(request);
  const usuario = await requerirUsuario(request);
  const body = await request.json();
  const { nombre } = CrearTableroSchema.parse(body);

  const tableroCreado = await TableroService.crearTablero(usuario.uid, nombre);
  return NextResponse.json({ tablero: tableroCreado }, { status: 201 });
});
