import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errores";

/**
 * Envoltorio común para Route Handlers (Sección 9.2).
 * Atrapa errores de validación Zod, errores de dominio (AppError) y excepciones generales,
 * produciendo siempre el formato { "error": "...", "detalles"?: [...] } y cabeceras de no-store.
 */
export function manejar<T = unknown>(
  handler: (request: Request, context: T) => Promise<NextResponse | Response>
) {
  return async (request: Request, context?: unknown) => {
    try {
      const response = await handler(request, context as T);

      // Asegurar cabeceras de seguridad y no-store en rutas de la API
      response.headers.set("Cache-Control", "no-store");
      response.headers.set("X-Content-Type-Options", "nosniff");
      return response;
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const detalles = error.issues.map((issue) => ({
          campo: issue.path.join(".") || "cuerpo",
          mensaje: issue.message,
        }));

        return NextResponse.json(
          {
            error: "Error de validación en la solicitud",
            detalles,
          },
          { status: 400, headers: { "Cache-Control": "no-store" } }
        );
      }

      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: error.message,
            ...(error.detalles ? { detalles: error.detalles } : {}),
          },
          { status: error.statusCode, headers: { "Cache-Control": "no-store" } }
        );
      }

      console.error("[API_ERROR_NO_CONTROLADO]", error);

      return NextResponse.json(
        {
          error: "Error interno del servidor",
        },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }
  };
}
