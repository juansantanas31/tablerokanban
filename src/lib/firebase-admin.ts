import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let certificadoValido = false;

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
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

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
      certificadoValido = true;
      return appInstancia;
    } catch (err: unknown) {
      console.warn(
        "[firebase-admin] Formato de clave privada no soportado por OpenSSL o inválido. Activando modo evaluación:",
        err instanceof Error ? err.message : err
      );
      certificadoValido = false;
    }
  }

  // Inicialización de respaldo para entornos de prueba o compilación de Next.js
  return initializeApp({
    projectId: projectId || "demo-03-tablero-kanban",
  });
}

const app: App = obtenerAppAdmin();

export const esCertificadoActivo = (): boolean => certificadoValido;
export const adminAuth: Auth = getAuth(app);
export const adminDb: Firestore = getFirestore(app);
export default app;
