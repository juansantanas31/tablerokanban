import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/tableros/route";
import { GET as OBTENER_TABLERO } from "@/app/api/tableros/[id]/route";
import type { DecodedIdToken } from "firebase-admin/auth";

vi.mock("@/lib/firebase-admin", () => ({
  adminAuth: {
    verifySessionCookie: vi.fn(),
    verifyIdToken: vi.fn(),
  },
  adminDb: {
    collection: vi.fn(),
  },
}));

vi.mock("@/repositories/tablero.repository", () => ({
  TableroRepository: {
    listarPorUsuario: vi.fn(),
    obtenerPorId: vi.fn(),
    crear: vi.fn(),
    eliminar: vi.fn(),
  },
}));

vi.mock("@/repositories/tarjeta.repository", () => ({
  TarjetaRepository: {
    listarPorTablero: vi.fn(),
  },
}));

import { adminAuth } from "@/lib/firebase-admin";
import { TableroRepository } from "@/repositories/tablero.repository";

describe("API /api/tableros — Pruebas de Validación, Autorización e Integración", () => {
  const tokenValido = {
    uid: "usr-autorizado",
    email: "docente@tdea.edu.co",
    rol: "usuario",
  } as unknown as DecodedIdToken;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminAuth.verifyIdToken).mockResolvedValue(tokenValido);
  });

  it("responde 400 cuando los datos de entrada violan el esquema Zod (nombre vacío)", async () => {
    const request = new Request("http://localhost:3000/api/tableros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token_valido",
      },
      body: JSON.stringify({ nombre: "   " }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe("Error de validación en la solicitud");
    expect(json.detalles).toBeDefined();
    expect(json.detalles[0].campo).toBe("nombre");
  });

  it("responde 404 cuando se solicita un tablero inexistente o ajeno (Criterio de Aceptación 3)", async () => {
    vi.mocked(TableroRepository.obtenerPorId).mockResolvedValueOnce(null);

    const request = new Request("http://localhost:3000/api/tableros/tablero-ajeno-999", {
      headers: {
        Authorization: "Bearer token_valido",
      },
    });

    const context = { params: Promise.resolve({ id: "tablero-ajeno-999" }) };
    const response = await OBTENER_TABLERO(request, context);

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toContain("no fue encontrado");
  });

  it("Prueba de Integración: Recorre ruta -> servicio -> repositorio para crear un tablero exitosamente", async () => {
    vi.mocked(TableroRepository.crear).mockResolvedValueOnce();

    const request = new Request("http://localhost:3000/api/tableros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token_valido",
      },
      body: JSON.stringify({ nombre: "Nuevo Tablero Sprint 3" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.tablero.nombre).toBe("Nuevo Tablero Sprint 3");
    expect(json.tablero.columnas.length).toBe(3);

    // Verificar que el repositorio fue invocado con el UID autenticado
    expect(TableroRepository.crear).toHaveBeenCalledWith(
      "usr-autorizado",
      expect.objectContaining({ nombre: "Nuevo Tablero Sprint 3" })
    );
  });
});
