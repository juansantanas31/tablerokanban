import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/auth/yo/route";
import type { DecodedIdToken } from "firebase-admin/auth";

vi.mock("@/lib/firebase-admin", () => ({
  adminAuth: {
    verifySessionCookie: vi.fn(),
    verifyIdToken: vi.fn(),
  },
  adminDb: {},
}));

import { adminAuth } from "@/lib/firebase-admin";

describe("API /api/auth/yo — Autenticación y Verificación de Sesión", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("responde 401 si no se envía cookie de sesión ni encabezado Bearer", async () => {
    const request = new Request("http://localhost:3000/api/auth/yo");
    const response = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("Se requiere autenticación");
  });

  it("responde 200 con los datos del usuario si el Bearer token es válido", async () => {
    const mockToken = {
      uid: "usr-test-123",
      email: "estudiante@tdea.edu.co",
      rol: "estudiante",
    } as unknown as DecodedIdToken;

    vi.mocked(adminAuth.verifyIdToken).mockResolvedValueOnce(mockToken);

    const request = new Request("http://localhost:3000/api/auth/yo", {
      headers: {
        Authorization: "Bearer token_valido_simulado",
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.usuario).toEqual({
      uid: "usr-test-123",
      correo: "estudiante@tdea.edu.co",
      rol: "estudiante",
    });
  });
});
