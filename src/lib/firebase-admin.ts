import crypto from "node:crypto";
import { createRequire } from "node:module";
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

declare global {
  var __kanban_firebase_cert_activo__: boolean | undefined;
}

/**
 * Reconstruye y valida una clave privada PEM en formato estándar PKCS#8
 * incluso si fue pegada en Vercel con comillas, comas finales, espacios o \\n.
 */
function normalizarYValidarPrivateKey(rawKey: string): string | null {
  let key = rawKey.trim();

  // Reemplazar secuencias literales \n y \r
  key = key.replace(/\\n/g, "\n").replace(/\\r/g, "");

  // Extraer el cuerpo base64 entre los encabezados PEM si están presentes
  const match = key.match(
    /-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/
  );
  if (!match || !match[1]) {
    return null;
  }

  // Limpiar cualquier espacio, salto de línea, comilla o punto suspensivo inválido
  const base64Body = match[1].replace(/[\s"',]/g, "");
  if (base64Body.length < 500 || base64Body.includes(".")) {
    return null;
  }

  const lines = base64Body.match(/.{1,64}/g) || [];
  const pemReconstruido = `-----BEGIN PRIVATE KEY-----\n${lines.join("\n")}\n-----END PRIVATE KEY-----\n`;

  try {
    // Verificar con OpenSSL antes de pasar a firebase-admin
    crypto.createPrivateKey(pemReconstruido);
    return pemReconstruido;
  } catch {
    return null;
  }
}

let authInstance: Auth = {} as Auth;
let dbInstance: Firestore = {} as Firestore;
let appInstance: App | null = null;

function inicializarFirebaseAdminSeguro(): void {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    globalThis.__kanban_firebase_cert_activo__ = false;
    return;
  }

  const privateKeyValida = normalizarYValidarPrivateKey(rawPrivateKey);
  if (!privateKeyValida) {
    console.warn(
      "[firebase-admin] FIREBASE_PRIVATE_KEY ausente, incompleta o inválida. Usando DemoStore."
    );
    globalThis.__kanban_firebase_cert_activo__ = false;
    return;
  }

  try {
    const req = createRequire(import.meta.url);
    let adminApp: typeof import("firebase-admin/app");
    let adminAuthMod: typeof import("firebase-admin/auth");
    let adminFirestoreMod: typeof import("firebase-admin/firestore");

    try {
      adminApp = req("firebase-admin/app");
      adminAuthMod = req("firebase-admin/auth");
      adminFirestoreMod = req("firebase-admin/firestore");
    } catch {
      const pkg = ["firebase", "admin"].join("-");
      adminApp = req(`${pkg}/app`);
      adminAuthMod = req(`${pkg}/auth`);
      adminFirestoreMod = req(`${pkg}/firestore`);
    }

    if (adminApp.getApps().length > 0) {
      appInstance = adminApp.getApp();
    } else {
      appInstance = adminApp.initializeApp({
        credential: adminApp.cert({
          projectId: projectId.trim().replace(/^["']|["',]+$/g, ""),
          clientEmail: clientEmail.trim().replace(/^["']|["',]+$/g, ""),
          privateKey: privateKeyValida,
        }),
      });
    }

    authInstance = adminAuthMod.getAuth(appInstance);
    dbInstance = adminFirestoreMod.getFirestore(appInstance);
    globalThis.__kanban_firebase_cert_activo__ = true;
  } catch (err: unknown) {
    console.warn(
      "[firebase-admin] No se pudo cargar firebase-admin en este entorno Serverless; activando DemoStore:",
      err instanceof Error ? err.message : err
    );
    globalThis.__kanban_firebase_cert_activo__ = false;
  }
}

inicializarFirebaseAdminSeguro();

export const esCertificadoActivo = (): boolean =>
  globalThis.__kanban_firebase_cert_activo__ === true;
export const adminAuth: Auth = authInstance;
export const adminDb: Firestore = dbInstance;
export default appInstance;
