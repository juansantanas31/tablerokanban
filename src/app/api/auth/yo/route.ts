export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { manejar } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

export const GET = manejar(async (request: Request) => {
  const usuario = await requerirUsuario(request);
  return NextResponse.json({ usuario }, { status: 200 });
});
