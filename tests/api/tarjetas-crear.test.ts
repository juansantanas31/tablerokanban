import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/tableros/[id]/tarjetas/route";
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
    obtenerPorId: vi.fn(),
  },
}));

vi.mock("@/repositories/tarjeta.repository", () => ({
  TarjetaRepository: {
    obtenerPorId: vi.fn(),
    listarPorTablero: vi.fn(),
    crear: vi.fn(),
  },
}));

import { adminAuth } from "@/lib/firebase-admin";
import { TableroRepository } from "@/repositories/tablero.repository";
import { TarjetaRepository } from "@/repositories/tarjeta.repository";

describe("API POST /api/tableros/:id/tarjetas — Creación de Tarjetas y Opcionalidad de Posición (08-tarjeta-crear-exito.bru)", () => {
  const tokenValido = {
    uid: "usr-autorizado",
    email: "docente@tdea.edu.co",
    rol: "usuario",
  } as unknown as DecodedIdToken;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminAuth.verifyIdToken).mockResolvedValue(tokenValido);

    vi.mocked(TableroRepository.obtenerPorId).mockResolvedValue({
      id: "tablero-demo-1",
      nombre: "Sprint 1",
      columnas: [
        { id: "col-por-hacer", nombre: "Por hacer" },
        { id: "col-en-curso", nombre: "En curso" },
      ],
      creadoEn: "2026-11-15T10:00:00.000Z",
    });

    vi.mocked(TarjetaRepository.listarPorTablero).mockResolvedValue([]);
    vi.mocked(TarjetaRepository.crear).mockResolvedValue();
  });

  it("responde 201 exitosamente cuando no se envía 'posicion' (solicitud 08-tarjeta-crear-exito.bru)", async () => {
    // Payload idéntico al archivo bruno/08-tarjeta-crear-exito.bru
    const payloadBruno = {
      titulo: "Implementar pruebas de integración de la API",
      descripcion: "Verificar capas Route Handler -> Servicio -> Repositorio",
      columnaId: "col-por-hacer",
      etiquetas: ["desarrollo", "pruebas"],
      vence: "2026-11-30",
    };

    const request = new Request(
      "http://localhost:3000/api/tableros/tablero-demo-1/tarjetas",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token_valido",
        },
        body: JSON.stringify(payloadBruno),
      }
    );

    const context = { params: Promise.resolve({ id: "tablero-demo-1" }) };

    const response = await POST(request, context);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.tarjeta.titulo).toBe(payloadBruno.titulo);
    expect(json.tarjeta.columnaId).toBe("col-por-hacer");
    expect(json.tarjeta.posicion).toBeDefined();
    expect(json.tarjeta.posicion).toBeGreaterThan(0);
    expect(json.tarjeta.vence).toBe("2026-11-30");
  });

  it("responde 201 exitosamente cuando tampoco se envía 'vence'", async () => {
    const payloadMinimo = {
      titulo: "Tarjeta mínima requerida",
      columnaId: "col-por-hacer",
    };

    const request = new Request(
      "http://localhost:3000/api/tableros/tablero-demo-1/tarjetas",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token_valido",
        },
        body: JSON.stringify(payloadMinimo),
      }
    );

    const context = { params: Promise.resolve({ id: "tablero-demo-1" }) };

    const response = await POST(request, context);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.tarjeta.titulo).toBe("Tarjeta mínima requerida");
    expect(json.tarjeta.vence).toBeNull();
  });
});
