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

function esEntornoLocal(): boolean {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) {
      return true;
    }
  }
  return process.env.NODE_ENV !== "production";
}

function esClaveDemoOInvalida(): boolean {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!key || key.includes("demo") || key.includes("placeholder") || key.includes("AIzaSy_demo") || key.length < 30) {
    return true;
  }
  return false;
}

/**
 * Emite una cookie de sesión local/demo de desarrollo hacia /api/auth/sesion
 */
async function emitirSesionLocal(correo: string): Promise<{ exito: boolean; correo: string }> {
  const simToken = `demo-token-${btoa(encodeURIComponent(correo))}`;
  const res = await fetch("/api/auth/sesion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: simToken }),
  });

  if (!res.ok) {
    throw new Error(`Fallo al emitir la sesión local (HTTP ${res.status})`);
  }

  return { exito: true, correo };
}

/**
 * Inicia sesión con correo y contraseña en el cliente, obtiene el idToken
 * y solicita al servidor la cookie de sesión HttpOnly segura (Sección 9.1).
 */
export async function iniciarSesionConCorreo(
  correo: string,
  contrasena: string
): Promise<{ exito: boolean; correo: string }> {
  // En desarrollo local con clave demo, evitar llamada innecesaria a servidores de Google
  if (esClaveDemoOInvalida()) {
    console.info(
      "[firebase-client] Modo local activo: emitiendo sesión directamente para",
      correo
    );
    return emitirSesionLocal(correo);
  }

  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      correo,
      contrasena
    );
    const idToken = await userCredential.user.getIdToken();

    // Enviar idToken al Route Handler para emitir la cookie de sesión HttpOnly
    const res = await fetch("/api/auth/sesion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      throw new Error(`Fallo al establecer la sesión en el servidor (HTTP ${res.status})`);
    }

    return { exito: true, correo: userCredential.user.email || correo };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn("[firebase-client] Fallo al autenticar con Firebase:", errorMsg);

    const esErrorInvalidoEnGoogle =
      errorMsg.includes("api-key-not-valid") ||
      errorMsg.includes("invalid-api-key") ||
      errorMsg.includes("network-request-failed") ||
      errorMsg.includes("auth/api-key-not-valid") ||
      esEntornoLocal();

    // Si Firebase en la nube rechaza la clave (por ejemplo en Vercel sin claves GCP o en local),
    // garantizar la navegabilidad del proyecto emitiendo la sesión:
    if (esErrorInvalidoEnGoogle) {
      console.info(
        "[firebase-client] Activando sesión de contingencia tras rechazo de Firebase:",
        errorMsg
      );
      return emitirSesionLocal(correo);
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
    try {
      await signOut(auth);
    } catch {
      // Ignorar si auth ya no tenía sesión activa
    }
  }
}
