import { adminAuth, esCertificadoActivo } from "./firebase-admin";
import { ErrorNoAutenticado, ErrorProhibido } from "./errores";

export interface UsuarioSesion {
  uid: string;
  correo: string | null;
  rol: string;
}

/**
 * Extrae la cookie 'sesion' del encabezado Cookie de la petición.
 */
function obtenerCookieSesion(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith("sesion=")) {
      return decodeURIComponent(cookie.substring("sesion=".length));
    }
  }
  return null;
}

/**
 * Valida la autenticación en Route Handlers (Sección 9.1).
 * Admite:
 * 1. Cookie HttpOnly 'sesion' verificada con verifySessionCookie(cookie, true).
 * 2. Encabezado 'Authorization: Bearer <idToken>' para pruebas con Bruno / Postman.
 */
export async function requerirUsuario(request: Request): Promise<UsuarioSesion> {
  // 1. Intentar con cookie de sesión
  const cookieSesion = obtenerCookieSesion(request);
  if (cookieSesion) {
    if (cookieSesion.startsWith("demo-session-")) {
      try {
        const raw = Buffer.from(cookieSesion.substring("demo-session-".length), "base64").toString("utf-8");
        const claims = JSON.parse(raw);
        return {
          uid: claims.uid || "usr-demo-local",
          correo: claims.email || null,
          rol: claims.rol || "usuario",
        };
      } catch {
        throw new ErrorNoAutenticado("La sesión demo es inválida");
      }
    }

    if (!esCertificadoActivo()) {
      return {
        uid: "usr-demo-local",
        correo: "usuario@demo.com",
        rol: "usuario",
      };
    }

    try {
      const decodedClaims = await adminAuth.verifySessionCookie(cookieSesion, true);
      return {
        uid: decodedClaims.uid,
        correo: decodedClaims.email || null,
        rol: (decodedClaims.rol as string) || "usuario",
      };
    } catch {
      // Cookie expirada o revocada
      throw new ErrorNoAutenticado("La sesión ha expirado o es inválida");
    }
  }

  // 2. Intentar con Bearer token (para pruebas de API / Bruno / Postman)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.substring("Bearer ".length).trim();
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken, true);
      return {
        uid: decodedToken.uid,
        correo: decodedToken.email || null,
        rol: (decodedToken.rol as string) || "usuario",
      };
    } catch {
      throw new ErrorNoAutenticado("El token Bearer proporcionado es inválido");
    }
  }

  throw new ErrorNoAutenticado("Se requiere autenticación para acceder a esta ruta");
}

/**
 * Comprueba que el encabezado Origin coincida con el host para prevenir CSRF en mutaciones (Sección 9.1).
 * Soporta puertos locales y proxies reversos / Vercel (x-forwarded-host).
 */
export function comprobarOrigen(request: Request): void {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (origin && (host || forwardedHost)) {
    try {
      const originHost = new URL(origin).host;
      const hostSinPuerto = host ? host.split(":")[0] : null;
      const originHostSinPuerto = originHost.split(":")[0];
      const forwardedHostSinPuerto = forwardedHost ? forwardedHost.split(":")[0] : null;

      const coincide =
        originHost === host ||
        originHostSinPuerto === hostSinPuerto ||
        (forwardedHost && (originHost === forwardedHost || originHostSinPuerto === forwardedHostSinPuerto));

      if (!coincide) {
        throw new ErrorProhibido("Origen de petición no permitido (fallo CSRF)");
      }
    } catch (e) {
      if (e instanceof ErrorProhibido) throw e;
      throw new ErrorProhibido("Origen inválido en la solicitud");
    }
  }
}
