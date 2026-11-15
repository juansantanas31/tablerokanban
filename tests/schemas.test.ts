import { describe, it, expect } from "vitest";
import { TarjetaSchema } from "@/schemas/tarjeta.schema";

describe("Validación de Esquema Zod - TarjetaSchema", () => {
  it("debe validar correctamente una tarjeta con datos válidos", () => {
    const tarjetaValida = {
      id: "t-1",
      titulo: "Diseñar wireframes",
      descripcion: "Diseño para móvil y escritorio",
      columnaId: "col-1",
      posicion: 1000,
      etiquetas: ["diseño", "urgente"],
      vence: "2026-12-01",
      creadoEn: "2026-11-15T12:00:00.000Z",
    };

    const resultado = TarjetaSchema.safeParse(tarjetaValida);
    expect(resultado.success).toBe(true);
  });

  it("debe rechazar tarjetas con título vacío", () => {
    const tarjetaInvalida = {
      id: "t-2",
      titulo: "   ",
      columnaId: "col-1",
      posicion: 1000,
      etiquetas: [],
      vence: null,
      creadoEn: "2026-11-15T12:00:00.000Z",
    };

    const resultado = TarjetaSchema.safeParse(tarjetaInvalida);
    expect(resultado.success).toBe(false);
  });

  it("debe rechazar tarjetas con título mayor a 100 caracteres", () => {
    const tarjetaLarga = {
      id: "t-3",
      titulo: "A".repeat(101),
      columnaId: "col-1",
      posicion: 1000,
      etiquetas: [],
      vence: null,
      creadoEn: "2026-11-15T12:00:00.000Z",
    };

    const resultado = TarjetaSchema.safeParse(tarjetaLarga);
    expect(resultado.success).toBe(false);
  });

  it("debe rechazar fechas de vencimiento con formato distinto a YYYY-MM-DD", () => {
    const tarjetaFechaInvalida = {
      id: "t-4",
      titulo: "Fecha inválida",
      columnaId: "col-1",
      posicion: 1000,
      etiquetas: [],
      vence: "15-11-2026", // Formato incorrecto
      creadoEn: "2026-11-15T12:00:00.000Z",
    };

    const resultado = TarjetaSchema.safeParse(tarjetaFechaInvalida);
    expect(resultado.success).toBe(false);
  });
});
