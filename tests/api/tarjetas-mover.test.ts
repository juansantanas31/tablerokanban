import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "@/app/api/tableros/[id]/tarjetas/[tarjetaId]/mover/route";
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
    actualizar: vi.fn(),
  },
}));

import { adminAuth } from "@/lib/firebase-admin";
import { TableroRepository } from "@/repositories/tablero.repository";
import { TarjetaRepository } from "@/repositories/tarjeta.repository";

describe("API /api/tableros/:id/tarjetas/:tid/mover — Endpoint de Movimiento y Posición Decimal", () => {
  const tokenValido = {
    uid: "usr-autorizado",
    email: "docente@tdea.edu.co",
    rol: "usuario",
  } as unknown as DecodedIdToken;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminAuth.verifyIdToken).mockResolvedValue(tokenValido);

    vi.mocked(TableroRepository.obtenerPorId).mockResolvedValue({
      id: "tablero-1",
      nombre: "Sprint 3",
      columnas: [
        { id: "col-1", nombre: "Por hacer" },
        { id: "col-2", nombre: "En curso" },
      ],
      creadoEn: "2026-11-15T10:00:00.000Z",
    });

    vi.mocked(TarjetaRepository.obtenerPorId).mockResolvedValue({
      id: "tarjeta-1",
      titulo: "Construir Route Handlers",
      descripcion: "",
      columnaId: "col-1",
      posicion: 1000,
      etiquetas: [],
      vence: null,
      creadoEn: "2026-11-15T10:00:00.000Z",
    });

    vi.mocked(TarjetaRepository.listarPorTablero).mockResolvedValue([
      {
        id: "tarjeta-2",
        titulo: "Tarjeta en columna destino",
        descripcion: "",
        columnaId: "col-2",
        posicion: 2000,
        etiquetas: [],
        vence: null,
        creadoEn: "2026-11-15T10:00:00.000Z",
      },
    ]);
  });

  it("mueve la tarjeta y recalcula la posición decimal correctamente", async () => {
    const request = new Request(
      "http://localhost:3000/api/tableros/tablero-1/tarjetas/tarjeta-1/mover",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token_valido",
        },
        body: JSON.stringify({
          columnaId: "col-2",
          posicion: 3000,
        }),
      }
    );

    const context = {
      params: Promise.resolve({ id: "tablero-1", tarjetaId: "tarjeta-1" }),
    };

    const response = await PATCH(request, context);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.tarjeta.columnaId).toBe("col-2");
    expect(json.tarjeta.posicion).toBe(3000);

    expect(TarjetaRepository.actualizar).toHaveBeenCalledWith(
      "usr-autorizado",
      "tablero-1",
      "tarjeta-1",
      { columnaId: "col-2", posicion: 3000 }
    );
  });
});
