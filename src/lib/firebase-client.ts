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

/**
 * Inicia sesión con correo y contraseña en el cliente, obtiene el idToken
 * y solicita al servidor la cookie de sesión HttpOnly segura (Sección 9.1).
 */
export async function iniciarSesionConCorreo(
  correo: string,
  contrasena: string
): Promise<{ exito: boolean; correo: string }> {
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
    // Si no hay conexión con Firebase en local (claves demo), simular login para desarrollo
    if (
      process.env.NODE_ENV !== "production" &&
      (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("demo"))
    ) {
      console.warn(
        "[firebase-client] Modo simulación de desarrollo local activo (sin claves reales)."
      );
      return { exito: true, correo };
    }

    const mensaje = error instanceof Error ? error.message : "Error al iniciar sesión";
    throw new Error(mensaje);
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
