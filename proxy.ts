import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * proxy.ts (Next.js 16 - Sección 3 y 9.1)
 * Redirige a /login si falta la cookie 'sesion' en rutas protegidas (/tableros).
 * AVISO: No es una frontera de seguridad; la verificación real se realiza
 * en cada Route Handler y Server Component con verifySessionCookie.
 */
export function proxy(request: NextRequest) {
  const tieneSesion = request.cookies.has("sesion");
  const esRutaProtegida = request.nextUrl.pathname.startsWith("/tableros");

  if (esRutaProtegida && !tieneSesion) {
    const urlLogin = new URL("/login", request.url);
    urlLogin.searchParams.set("redirigir", request.nextUrl.pathname);
    return NextResponse.redirect(urlLogin);
  }

  return NextResponse.next();
}

// Compatibilidad con middleware estándar de Next.js
export const middleware = proxy;

export const config = {
  matcher: ["/tableros/:path*"],
};
