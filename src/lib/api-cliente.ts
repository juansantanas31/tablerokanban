/**
 * Cliente HTTP unificado para el consumo de la API REST interna (/api).
 * Centraliza el manejo de cabeceras, serialización y captura de respuestas de error.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly detalles?: Array<{ campo: string; mensaje: string }>;

  constructor(
    status: number,
    message: string,
    detalles?: Array<{ campo: string; mensaje: string }>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detalles = detalles;
  }
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let mensaje = `Error HTTP ${response.status}`;
    let detalles: Array<{ campo: string; mensaje: string }> | undefined;

    try {
      const data = await response.json();
      if (data?.error) {
        mensaje = data.error;
      }
      if (data?.detalles) {
        detalles = data.detalles;
      }
    } catch {
      // Respuesta sin cuerpo JSON
    }

    throw new ApiError(response.status, mensaje, detalles);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export const apiCliente = {
  get: <T>(url: string, init?: RequestInit) => apiFetch<T>(url, { ...init, method: "GET" }),
  post: <T>(url: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(url, {
      ...init,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(url: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(url, {
      ...init,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(url: string, init?: RequestInit) => apiFetch<T>(url, { ...init, method: "DELETE" }),
};
