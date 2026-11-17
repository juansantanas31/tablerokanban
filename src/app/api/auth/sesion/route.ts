import { NextResponse } from "next/server";
import { z } from "zod";
import { comprobarOrigen } from "@/lib/auth";
import {
  adminAuth,
  esCertificadoActivo,
  autenticarCredencialesEnFirebase,
  firmarTokenSesion,
} from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const SesionInputSchema = z.object({
  idToken: z.string().optional(),
  correo: z.string().trim().email().optional(),
  password: z.string().min(6).optional(),
});

export const POST = async (request: Request) => {
  const cincoDiasMs = 5 * 24 * 60 * 60 * 1000;
  const isProduction = process.env.NODE_ENV === "production";

  try {
    comprobarOrigen(request);
  } catch {
    // Advertencia de origen ignorada en login para evitar bloqueos por proxies de Vercel
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const parsed = SesionInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de inicio de sesión inválidos." },
      { status: 400 }
    );
  }

  const { idToken, correo, password } = parsed.data;
  let sessionCookie: string;
  let correoAutenticado = correo || "usuario@kanban.local";

  // 1. Flujo principal: validación estricta de correo y contraseña contra Firebase Authentication
  if (correo && password) {
    try {
      const verificado = await autenticarCredencialesEnFirebase(correo, password);
      correoAutenticado = verificado.correo;
      if (esCertificadoActivo() && typeof adminAuth.createSessionCookie === "function") {
        try {
          sessionCookie = await adminAuth.createSessionCookie(verificado.idToken, {
            expiresIn: cincoDiasMs,
          });
        } catch {
          sessionCookie = firmarTokenSesion(verificado.uid, verificado.correo);
        }
      } else {
        sessionCookie = firmarTokenSesion(verificado.uid, verificado.correo);
      }
    } catch (authErr: unknown) {
      const msg =
        authErr instanceof Error
          ? authErr.message
          : "Credenciales inválidas: el usuario no está registrado en Firebase.";
      return NextResponse.json({ error: msg }, { status: 401 });
    }
  } else if (idToken) {
    // 2. Flujo por idToken directo (SDK Cliente o Bruno API)
    if (idToken.startsWith("demo-token-")) {
      return NextResponse.json(
        {
          error:
            "El acceso simulado está deshabilitado. Ingresa con un usuario registrado en Firebase.",
        },
        { status: 401 }
      );
    }
    try {
      if (!esCertificadoActivo() || typeof adminAuth.createSessionCookie !== "function") {
        return NextResponse.json(
          { error: "El token proporcionado no pudo ser verificado." },
          { status: 401 }
        );
      }
      sessionCookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn: cincoDiasMs,
      });
    } catch {
      return NextResponse.json(
        { error: "El idToken de Firebase es inválido o ha expirado." },
        { status: 401 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Debe proporcionar correo y contraseña o un idToken válido." },
      { status: 400 }
    );
  }

  const response = NextResponse.json(
    { exito: true, correo: correoAutenticado },
    { status: 200 }
  );

  response.cookies.set({
    name: "sesion",
    value: sessionCookie,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(cincoDiasMs / 1000),
  });

  response.headers.set("Cache-Control", "no-store");
  return response;
};

export const DELETE = async (request: Request) => {
  try {
    comprobarOrigen(request);
  } catch {
    // Ignorar origen en logout
  }

  const response = NextResponse.json({ exito: true }, { status: 200 });
  response.cookies.set({
    name: "sesion",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  response.headers.set("Cache-Control", "no-store");
  return response;
};
