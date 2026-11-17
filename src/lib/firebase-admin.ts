import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

declare global {
  var __kanban_firebase_cert_activo__: boolean | undefined;
}

function limpiarPrivateKey(rawKey: string): string {
  let key = rawKey.trim();
  // Eliminar comillas envolventes simples o dobles que se hayan copiado desde el JSON o Vercel
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  // Normalizar saltos de línea literales \n o \r\n a saltos reales
  key = key.replace(/\\n/g, "\n").replace(/\\r/g, "");
  if (!key.endsWith("\n")) {
    key += "\n";
  }
  return key;
}

function obtenerAppAdmin(): App {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (getApps().length > 0) {
    if (globalThis.__kanban_firebase_cert_activo__ === undefined) {
      globalThis.__kanban_firebase_cert_activo__ = Boolean(
        projectId &&
          clientEmail &&
          rawPrivateKey &&
          !rawPrivateKey.includes("DEMO") &&
          rawPrivateKey.length >= 50
      );
    }
    return getApp();
  }

  if (projectId && clientEmail && rawPrivateKey) {
    try {
      const privateKey = limpiarPrivateKey(rawPrivateKey);
      const appInstancia = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      globalThis.__kanban_firebase_cert_activo__ = true;
      return appInstancia;
    } catch (err: unknown) {
      console.warn(
        "[firebase-admin] Formato de clave privada no soportado por OpenSSL o inválido. Activando modo evaluación:",
        err instanceof Error ? err.message : err
      );
      globalThis.__kanban_firebase_cert_activo__ = false;
    }
  } else {
    globalThis.__kanban_firebase_cert_activo__ = false;
  }

  // Inicialización de respaldo para entornos de prueba o compilación de Next.js
  return initializeApp({
    projectId: projectId || "demo-03-tablero-kanban",
  });
}

let appInstance: App;
try {
  appInstance = obtenerAppAdmin();
} catch (e) {
  console.warn("[firebase-admin] Fallo al inicializar App Admin, usando fallback:", e);
  globalThis.__kanban_firebase_cert_activo__ = false;
  appInstance = initializeApp({ projectId: "demo-03-tablero-kanban" }, "fallback-kanban-app");
}

let authInstance: Auth;
try {
  authInstance = getAuth(appInstance);
} catch {
  authInstance = {} as Auth;
}

let dbInstance: Firestore;
try {
  dbInstance = getFirestore(appInstance);
} catch {
  dbInstance = {} as Firestore;
}

export const esCertificadoActivo = (): boolean =>
  globalThis.__kanban_firebase_cert_activo__ === true;
export const adminAuth: Auth = authInstance;
export const adminDb: Firestore = dbInstance;
export default appInstance;
