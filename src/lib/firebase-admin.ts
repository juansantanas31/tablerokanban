import crypto from "node:crypto";
import { createRequire } from "node:module";
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

declare global {
  var __kanban_firebase_cert_activo__: boolean | undefined;
  var __kanban_firebase_web_api_key__: string | undefined;
  var __kanban_google_oauth_token__: { token: string; expiraEn: number } | undefined;
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

async function obtenerTokenOAuthGoogle(
  clientEmail: string,
  privateKey: string
): Promise<string> {
  const ahoraMs = Date.now();
  if (
    globalThis.__kanban_google_oauth_token__ &&
    globalThis.__kanban_google_oauth_token__.expiraEn > ahoraMs + 60_000
  ) {
    return globalThis.__kanban_google_oauth_token__.token;
  }

  const now = Math.floor(ahoraMs / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      sub: clientEmail,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope:
        "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit",
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
    throw new Error(`Fallo al obtener token OAuth2 de Google (HTTP ${tokenRes.status})`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string; expires_in?: number };
  globalThis.__kanban_google_oauth_token__ = {
    token: tokenData.access_token,
    expiraEn: ahoraMs + (tokenData.expires_in ?? 3500) * 1000,
  };
  return tokenData.access_token;
}

type FirestoreRestValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreRestValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreRestValue> } };

function toFirestoreValue(val: unknown): FirestoreRestValue {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === "object") {
    return { mapValue: { fields: toFirestoreFields(val as Record<string, unknown>) } };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj: Record<string, unknown>): Record<string, FirestoreRestValue> {
  const fields: Record<string, FirestoreRestValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      fields[k] = toFirestoreValue(v);
    }
  }
  return fields;
}

function fromFirestoreValue(v: FirestoreRestValue): unknown {
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return Boolean(v.booleanValue);
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("stringValue" in v) return String(v.stringValue);
  if ("arrayValue" in v) {
    return (v.arrayValue.values || []).map(fromFirestoreValue);
  }
  if ("mapValue" in v) {
    return fromFirestoreFields(v.mapValue.fields || {});
  }
  return null;
}

function fromFirestoreFields(
  fields: Record<string, FirestoreRestValue>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    result[k] = fromFirestoreValue(v);
  }
  return result;
}

/**
 * Adaptador de Firestore sobre Google Cloud REST API v1.
 * Garantiza persistencia real en Firestore dentro de funciones Serverless de Vercel
 * sin depender de binarios gRPC ni enlaces simbólicos de Turbopack.
 */
function crearFirestoreRestAdapter(
  projectId: string,
  clientEmail: string,
  privateKey: string
): Firestore {
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  const makeDocRef = (docPath: string) => {
    const id = docPath.split("/").pop() || "";
    const docRef = {
      id,
      path: docPath,
      collection: (subName: string) => makeColRef(`${docPath}/${subName}`),
      get: async () => {
        const token = await obtenerTokenOAuthGoogle(clientEmail, privateKey);
        const res = await fetch(`${baseUrl}/${docPath}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.status === 404) {
          return { exists: false, id, ref: docRef, data: () => undefined };
        }
        if (!res.ok) {
          throw new Error(`Firestore GET ${docPath} falló con HTTP ${res.status}`);
        }
        const docJson = (await res.json()) as {
          fields?: Record<string, FirestoreRestValue>;
        };
        const parsed = fromFirestoreFields(docJson.fields || {});
        return { exists: true, id, ref: docRef, data: () => parsed };
      },
      set: async (datos: Record<string, unknown>) => {
        const token = await obtenerTokenOAuthGoogle(clientEmail, privateKey);
        const res = await fetch(`${baseUrl}/${docPath}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields: toFirestoreFields(datos) }),
        });
        if (!res.ok) {
          throw new Error(`Firestore SET ${docPath} falló con HTTP ${res.status}`);
        }
      },
      update: async (datos: Record<string, unknown>) => {
        const keys = Object.keys(datos).filter((k) => datos[k] !== undefined);
        if (keys.length === 0) return;
        const mask = keys
          .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
          .join("&");
        const token = await obtenerTokenOAuthGoogle(clientEmail, privateKey);
        const res = await fetch(`${baseUrl}/${docPath}?${mask}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields: toFirestoreFields(datos) }),
        });
        if (!res.ok) {
          throw new Error(`Firestore UPDATE ${docPath} falló con HTTP ${res.status}`);
        }
      },
      delete: async () => {
        const token = await obtenerTokenOAuthGoogle(clientEmail, privateKey);
        const res = await fetch(`${baseUrl}/${docPath}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok && res.status !== 404) {
          throw new Error(`Firestore DELETE ${docPath} falló con HTTP ${res.status}`);
        }
      },
    };
    return docRef;
  };

  const makeColRef = (colPath: string) => {
    const fetchDocs = async () => {
      const token = await obtenerTokenOAuthGoogle(clientEmail, privateKey);
      const res = await fetch(`${baseUrl}/${colPath}?pageSize=200`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.status === 404) return [];
      if (!res.ok) {
        throw new Error(`Firestore LIST ${colPath} falló con HTTP ${res.status}`);
      }
      const json = (await res.json()) as {
        documents?: Array<{
          name: string;
          fields?: Record<string, FirestoreRestValue>;
        }>;
      };
      return (json.documents || []).map((d) => {
        const docId = d.name.split("/").pop() || "";
        const parsed = fromFirestoreFields(d.fields || {});
        const ref = makeDocRef(`${colPath}/${docId}`);
        return {
          id: docId,
          exists: true,
          ref,
          data: () => parsed,
        };
      });
    };

    return {
      doc: (docId: string) => makeDocRef(`${colPath}/${docId}`),
      get: async () => {
        const docs = await fetchDocs();
        return { docs, empty: docs.length === 0, size: docs.length };
      },
      orderBy: (campo: string, direccion: "asc" | "desc" = "asc") => ({
        get: async () => {
          const docs = await fetchDocs();
          docs.sort((a, b) => {
            const va = a.data()[campo];
            const vb = b.data()[campo];
            if (typeof va === "number" && typeof vb === "number") {
              return direccion === "asc" ? va - vb : vb - va;
            }
            const sa = String(va ?? "");
            const sb = String(vb ?? "");
            return direccion === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
          });
          return { docs, empty: docs.length === 0, size: docs.length };
        },
      }),
    };
  };

  const adapter = {
    collection: (name: string) => makeColRef(name),
    batch: () => {
      const ops: Array<() => Promise<void>> = [];
      return {
        set: (ref: { set: (d: Record<string, unknown>) => Promise<void> }, datos: Record<string, unknown>) => {
          ops.push(() => ref.set(datos));
        },
        delete: (ref: { delete: () => Promise<void> }) => {
          ops.push(() => ref.delete());
        },
        commit: async () => {
          await Promise.all(ops.map((fn) => fn()));
        },
      };
    },
  };

  return adapter as unknown as Firestore;
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

  const cleanProjectId = projectId.trim().replace(/^["']|["',]+$/g, "");
  const cleanClientEmail = clientEmail.trim().replace(/^["']|["',]+$/g, "");

  // Inicializar siempre el adaptador REST de Firestore (compatible al 100% con Vercel Serverless)
  dbInstance = crearFirestoreRestAdapter(cleanProjectId, cleanClientEmail, privateKeyValida);
  globalThis.__kanban_firebase_cert_activo__ = true;

  try {
    const req = createRequire(import.meta.url);
    const pkg = ["firebase", "admin"].join("-");
    const adminApp = req(`${pkg}/app`) as typeof import("firebase-admin/app");
    const adminAuthMod = req(`${pkg}/auth`) as typeof import("firebase-admin/auth");

    if (adminApp.getApps().length > 0) {
      appInstance = adminApp.getApp();
    } else {
      appInstance = adminApp.initializeApp({
        credential: adminApp.cert({
          projectId: cleanProjectId,
          clientEmail: cleanClientEmail,
          privateKey: privateKeyValida,
        }),
      });
    }

    authInstance = adminAuthMod.getAuth(appInstance);
  } catch {
    // En Vercel Serverless si el paquete firebase-admin no está enlazado,
    // dbInstance (REST Adapter) y autenticarCredencialesEnFirebase siguen funcionando al 100%.
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

function obtenerSecretoFirma(): string {
  const base =
    process.env.FIREBASE_PRIVATE_KEY ||
    process.env.FIREBASE_PROJECT_ID ||
    "kanban-test-secret";
  return crypto.createHash("sha256").update(base).digest("hex");
}

export function firmarTokenSesion(uid: string, correo: string): string {
  const rol = correo.includes("docente") || correo.includes("admin") ? "admin" : "usuario";
  const payload = {
    uid,
    email: correo,
    rol,
    exp: Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", obtenerSecretoFirma())
    .update(payloadB64)
    .digest("base64url");
  return `fb-session-${payloadB64}.${sig}`;
}

export function verificarTokenSesionFirmado(
  cookieVal: string
): { uid: string; correo: string | null; rol: string } | null {
  if (!cookieVal.startsWith("fb-session-")) return null;
  const raw = cookieVal.substring("fb-session-".length);
  const parts = raw.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sig] = parts;
  const expectedSig = crypto
    .createHmac("sha256", obtenerSecretoFirma())
    .update(payloadB64)
    .digest("base64url");

  if (sig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const claims = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8")) as {
      uid?: string;
      email?: string;
      rol?: string;
      exp?: number;
    };
    if (!claims.uid || (claims.exp && claims.exp < Math.floor(Date.now() / 1000))) {
      return null;
    }
    return {
      uid: claims.uid,
      correo: claims.email || null,
      rol: claims.rol || "usuario",
    };
  } catch {
    return null;
  }
}

export const esCertificadoActivo = (): boolean =>
  globalThis.__kanban_firebase_cert_activo__ === true;
export const adminAuth: Auth = authInstance;
export const adminDb: Firestore = dbInstance;
export default appInstance;
