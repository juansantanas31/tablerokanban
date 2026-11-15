export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth } from "@/lib/firebase-admin";
import { manejar } from "@/lib/http";
import { comprobarOrigen } from "@/lib/auth";

const SesionInputSchema = z.object({
  idToken: z.string().min(1, "El idToken es obligatorio"),
});

export const POST = manejar(async (request: Request) => {
  comprobarOrigen(request);
  const body = await request.json();
  const { idToken } = SesionInputSchema.parse(body);

  // 5 días de duración de la cookie de sesión (Sección 9.1)
  const cincoDiasMs = 5 * 24 * 60 * 60 * 1000;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: cincoDiasMs,
  });

  const isProduction = process.env.NODE_ENV === "production";
  const cookieValue = `sesion=${sessionCookie}; HttpOnly; ${
    isProduction ? "Secure; " : ""
  }SameSite=Lax; Path=/; Max-Age=${cincoDiasMs / 1000}`;

  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Set-Cookie", cookieValue);
  return response;
});

export const DELETE = manejar(async (request: Request) => {
  comprobarOrigen(request);
  const response = new NextResponse(null, { status: 204 });
  response.headers.set(
    "Set-Cookie",
    "sesion=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );
  return response;
});
