import crypto from "node:crypto";
import { createRequire } from "node:module";
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

declare global {
  var __kanban_firebase_cert_activo__: boolean | undefined;
  var __kanban_firebase_web_api_key__: string | undefined;
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

export function tieneCredencialesGoogleConfiguradas(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawPrivateKey) return false;
  return normalizarYValidarPrivateKey(rawPrivateKey) !== null;
}

async function obtenerWebApiKeyDelProyecto(): Promise<string> {
  const envKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (
    envKey &&
    !envKey.includes("demo") &&
    !envKey.includes("placeholder") &&
    !envKey.startsWith("AIzaSy_") &&
    envKey.length >= 35
  ) {
    return envKey.trim();
  }

  if (globalThis.__kanban_firebase_web_api_key__) {
    return globalThis.__kanban_firebase_web_api_key__;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^["']|["',]+$/g, "");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^["']|["',]+$/g, "");
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawPrivateKey ? normalizarYValidarPrivateKey(rawPrivateKey) : null;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Credenciales de servicio de Firebase no configuradas.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      sub: clientEmail,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope:
        "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/identitytoolkit",
    })
  ).toString("base64url");

  const signature = crypto
    .createSign("RSA-SHA256")
    .update(`${header}.${payload}`)
    .sign(privateKey, "base64url");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${header}.${payload}.${signature}`,
  });

  if (!tokenRes.ok) {
    throw new Error("No se pudo obtener token OAuth2 de Google Cloud.");
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };
  const cfgRes = await fetch(
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`,
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    }
  );

  if (!cfgRes.ok) {
    throw new Error("No se pudo consultar la configuración de Identity Toolkit.");
  }

  const cfgData = (await cfgRes.json()) as { client?: { apiKey?: string } };
  const apiKey = cfgData.client?.apiKey;
  if (!apiKey) {
    throw new Error("El proyecto de Firebase no tiene una API Key web activa.");
  }

  globalThis.__kanban_firebase_web_api_key__ = apiKey;
  return apiKey;
}

/**
 * Autentica correo y contraseña directamente contra Firebase Authentication (Google Identity Toolkit).
 * Solo permite el acceso a usuarios registrados oficialmente en la consola de Firebase.
 */
export async function autenticarCredencialesEnFirebase(
  correo: string,
  contrasena: string
): Promise<{ uid: string; correo: string; idToken: string }> {
  const apiKey = await obtenerWebApiKeyDelProyecto();

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: correo.trim(),
        password: contrasena,
        returnSecureToken: true,
      }),
    }
  );

  const data = (await res.json()) as {
    localId?: string;
    email?: string;
    idToken?: string;
    error?: { message?: string };
  };

  if (!res.ok || !data.localId || !data.idToken) {
    const code = data.error?.message || "INVALID_LOGIN_CREDENTIALS";
    if (code.includes("TOO_MANY_ATTEMPTS")) {
      throw new Error(
        "Demasiados intentos fallidos. Por seguridad, intenta nuevamente más tarde."
      );
    }
    if (code.includes("USER_DISABLED")) {
      throw new Error("Esta cuenta de usuario ha sido deshabilitada en Firebase.");
    }
    throw new Error(
      "Credenciales inválidas: el correo no está registrado en Firebase o la contraseña es incorrecta."
    );
  }

  return {
    uid: data.localId,
    correo: data.email || correo.trim(),
    idToken: data.idToken,
  };
}

export const esCertificadoActivo = (): boolean =>
  globalThis.__kanban_firebase_cert_activo__ === true;
export const adminAuth: Auth = authInstance;
export const adminDb: Firestore = dbInstance;
export default appInstance;
