"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  Auth,
  UserCredential,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSy_demo_api_key_publica",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-03-tablero-kanban.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-03-tablero-kanban",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

let clientApp: FirebaseApp;
if (getApps().length > 0) {
  clientApp = getApp();
} else {
  clientApp = initializeApp(firebaseConfig);
}

export const auth: Auth = getAuth(clientApp);

function esClaveDemoOInvalida(): boolean {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (
    !key ||
    key.includes("demo") ||
    key.includes("placeholder") ||
    key.includes("AIzaSy_demo") ||
    key.startsWith("AIzaSy_") ||
    key.length < 35
  ) {
    return true;
  }
  return false;
}

/**
 * Solicita al servidor validar las credenciales (correo y contraseña) contra Firebase Authentication
 * y emitir la cookie de sesión HttpOnly solo si el usuario existe y la contraseña es correcta.
 */
async function autenticarMedianteServidor(
  correo: string,
  contrasena: string
): Promise<{ exito: boolean; correo: string }> {
  const res = await fetch("/api/auth/sesion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, password: contrasena }),
  });

  if (!res.ok) {
    let mensaje = "Credenciales inválidas: el correo no está registrado en Firebase o la contraseña es incorrecta.";
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) {
        mensaje = data.error;
      }
    } catch {
      // Conservar mensaje predeterminado
    }
    throw new Error(mensaje);
  }

  return { exito: true, correo };
}

/**
 * Inicia sesión con correo y contraseña validando estrictamente que el usuario
 * esté registrado en Firebase Authentication (Sección 9.1).
 */
export async function iniciarSesionConCorreo(
  correo: string,
  contrasena: string
): Promise<{ exito: boolean; correo: string }> {
  if (esClaveDemoOInvalida()) {
    return autenticarMedianteServidor(correo, contrasena);
  }

  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      correo,
      contrasena
    );
    const idToken = await userCredential.user.getIdToken();

    const res = await fetch("/api/auth/sesion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, correo, password: contrasena }),
    });

    if (!res.ok) {
      let mensaje = `Fallo al establecer la sesión en el servidor (HTTP ${res.status})`;
      try {
        const data = (await res.json()) as { error?: string };
        if (data?.error) mensaje = data.error;
      } catch {
        // Ignorar
      }
      throw new Error(mensaje);
    }

    return { exito: true, correo: userCredential.user.email || correo };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    // Si el error es de credenciales o usuario inexistente en Firebase, rechazar inmediatamente
    if (
      errorMsg.includes("invalid-credential") ||
      errorMsg.includes("user-not-found") ||
      errorMsg.includes("wrong-password") ||
      errorMsg.includes("invalid-email") ||
      errorMsg.includes("too-many-requests") ||
      errorMsg.includes("user-disabled")
    ) {
      throw new Error(
        "Credenciales inválidas: el correo no está registrado en Firebase o la contraseña es incorrecta."
      );
    }

    // Si solo falló la API key pública del navegador, validar correo y contraseña en el servidor contra Firebase
    if (errorMsg.includes("api-key")) {
      return autenticarMedianteServidor(correo, contrasena);
    }

    throw new Error(errorMsg);
  }
}

/**
 * Cierra la sesión en el cliente y destruye la cookie HttpOnly en el servidor.
 */
export async function cerrarSesion(): Promise<void> {
  try {
    await fetch("/api/auth/sesion", { method: "DELETE" });
  } finally {
    if (typeof document !== "undefined") {
      document.cookie =
        "sesion=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
    try {
      await signOut(auth);
    } catch {
      // Ignorar si auth ya no tenía sesión activa
    }
  }
}
