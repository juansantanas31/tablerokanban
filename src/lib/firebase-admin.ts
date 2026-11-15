import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

function obtenerAppAdmin(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Normalizar saltos de línea literales \n provenientes de variables de entorno de Vercel/sistema
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // Inicialización de respaldo para entornos de prueba o desarrollo local antes de configurar credenciales
  return initializeApp({
    projectId: projectId || "demo-03-tablero-kanban",
  });
}

const app: App = obtenerAppAdmin();

export const adminAuth: Auth = getAuth(app);
export const adminDb: Firestore = getFirestore(app);
export default app;
