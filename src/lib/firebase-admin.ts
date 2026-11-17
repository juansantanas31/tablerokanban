import crypto from "node:crypto";
import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

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

function obtenerAppAdmin(): App | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (getApps().length > 0) {
    return getApp();
  }

  if (projectId && clientEmail && rawPrivateKey) {
    const privateKeyValida = normalizarYValidarPrivateKey(rawPrivateKey);
    if (privateKeyValida) {
      try {
        const appInstancia = initializeApp({
          credential: cert({
            projectId: projectId.trim().replace(/^["']|["',]+$/g, ""),
            clientEmail: clientEmail.trim().replace(/^["']|["',]+$/g, ""),
            privateKey: privateKeyValida,
          }),
        });
        globalThis.__kanban_firebase_cert_activo__ = true;
        return appInstancia;
      } catch (err: unknown) {
        console.warn(
          "[firebase-admin] Error inicializando credencial de Firebase Admin:",
          err instanceof Error ? err.message : err
        );
      }
    } else {
      console.warn(
        "[firebase-admin] FIREBASE_PRIVATE_KEY ausente, incompleta o inválida en el entorno. Usando modo DemoStore."
      );
    }
  }

  globalThis.__kanban_firebase_cert_activo__ = false;
  return null;
}

const appInstance: App | null = obtenerAppAdmin();

let authInstance: Auth = {} as Auth;
let dbInstance: Firestore = {} as Firestore;

if (appInstance && globalThis.__kanban_firebase_cert_activo__ === true) {
  try {
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
  } catch {
    globalThis.__kanban_firebase_cert_activo__ = false;
  }
}

export const esCertificadoActivo = (): boolean =>
  globalThis.__kanban_firebase_cert_activo__ === true;
export const adminAuth: Auth = authInstance;
export const adminDb: Firestore = dbInstance;
export default appInstance;
