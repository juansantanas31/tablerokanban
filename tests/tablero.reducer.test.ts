import { describe, it, expect } from "vitest";
import {
  tableroReducer,
  calcularPosicionDecimal,
  TableroState,
} from "@/reducers/tablero.reducer";
import { Tarjeta, Tablero } from "@/schemas/tarjeta.schema";

const tableroMock: Tablero = {
  id: "tablero-1",
  nombre: "Tablero de Pruebas",
  columnas: [
    { id: "col-1", nombre: "Por hacer" },
    { id: "col-2", nombre: "En curso" },
    { id: "col-3", nombre: "Hecho" },
  ],
  creadoEn: "2026-11-15T10:00:00.000Z",
};

const tarjetasMock: Tarjeta[] = [
  {
    id: "t-1",
    titulo: "Tarjeta 1",
    descripcion: "",
    columnaId: "col-1",
    posicion: 1000,
    etiquetas: ["urgente"],
    vence: null,
    creadoEn: "2026-11-15T10:00:00.000Z",
  },
  {
    id: "t-2",
    titulo: "Tarjeta 2",
    descripcion: "",
    columnaId: "col-1",
    posicion: 2000,
    etiquetas: [],
    vence: null,
    creadoEn: "2026-11-15T10:00:00.000Z",
  },
  {
    id: "t-3",
    titulo: "Tarjeta 3",
    descripcion: "",
    columnaId: "col-1",
    posicion: 3000,
    etiquetas: [],
    vence: null,
    creadoEn: "2026-11-15T10:00:00.000Z",
  },
];

describe("Reductor del Tablero y Posicionamiento Decimal (Sección 11 - 5 casos)", () => {
  const estadoBase: TableroState = {
    tablero: tableroMock,
    tarjetas: tarjetasMock,
    filtroTexto: "",
    filtroEtiqueta: null,
    anuncioAccesible: "",
  };

  it("Caso 1: Mover tarjeta a una columna vacía (asigna posición base 1000)", () => {
    const tarjetasColumnaVacia: Tarjeta[] = [];
    const nuevaPos = calcularPosicionDecimal(tarjetasColumnaVacia, 0);

    expect(nuevaPos).toBe(1000);

    const estadoFinal = tableroReducer(estadoBase, {
      type: "MOVER_TARJETA",
      payload: {
        tarjetaId: "t-1",
        columnaDestinoId: "col-2",
        nuevaPosicion: nuevaPos,
        nombreColumnaDestino: "En curso",
      },
    });

    const tarjetaMovida = estadoFinal.tarjetas.find((t) => t.id === "t-1");
    expect(tarjetaMovida?.columnaId).toBe("col-2");
    expect(tarjetaMovida?.posicion).toBe(1000);
    expect(estadoFinal.anuncioAccesible).toContain('movida a la columna "En curso"');
  });

  it("Caso 2: Mover al principio de una columna (punto previo o mitad)", () => {
    const nuevaPos = calcularPosicionDecimal(tarjetasMock, 0);

    // Primera tarjeta tiene 1000, la mitad es 500
    expect(nuevaPos).toBe(500);

    const estadoFinal = tableroReducer(estadoBase, {
      type: "MOVER_TARJETA",
      payload: {
        tarjetaId: "t-3",
        columnaDestinoId: "col-1",
        nuevaPosicion: nuevaPos,
      },
    });

    const tarjetaMovida = estadoFinal.tarjetas.find((t) => t.id === "t-3");
    expect(tarjetaMovida?.posicion).toBe(500);
  });

  it("Caso 3: Mover al final de una columna (suma 1000 a la última)", () => {
    const nuevaPos = calcularPosicionDecimal(tarjetasMock, tarjetasMock.length);

    // Última tarjeta tiene 3000, más 1000 es 4000
    expect(nuevaPos).toBe(4000);

    const estadoFinal = tableroReducer(estadoBase, {
      type: "MOVER_TARJETA",
      payload: {
        tarjetaId: "t-1",
        columnaDestinoId: "col-1",
        nuevaPosicion: nuevaPos,
      },
    });

    const tarjetaMovida = estadoFinal.tarjetas.find((t) => t.id === "t-1");
    expect(tarjetaMovida?.posicion).toBe(4000);
  });

  it("Caso 4: Mover entre dos tarjetas vecinas (calcula el punto medio exacto)", () => {
    // Intercalar entre índice 0 (pos 1000) e índice 1 (pos 2000)
    const nuevaPos = calcularPosicionDecimal(tarjetasMock, 1);

    expect(nuevaPos).toBe(1500);

    const estadoFinal = tableroReducer(estadoBase, {
      type: "MOVER_TARJETA",
      payload: {
        tarjetaId: "t-3",
        columnaDestinoId: "col-1",
        nuevaPosicion: nuevaPos,
      },
    });

    const tarjetaMovida = estadoFinal.tarjetas.find((t) => t.id === "t-3");
    expect(tarjetaMovida?.posicion).toBe(1500);
  });

  it("Caso 5: Conservar inmutabilidad y los datos de las demás tarjetas al mover", () => {
    const estadoFinal = tableroReducer(estadoBase, {
      type: "MOVER_TARJETA",
      payload: {
        tarjetaId: "t-2",
        columnaDestinoId: "col-3",
        nuevaPosicion: 1000,
      },
    });

    expect(estadoFinal.tarjetas.length).toBe(3);
    const t1 = estadoFinal.tarjetas.find((t) => t.id === "t-1");
    const t3 = estadoFinal.tarjetas.find((t) => t.id === "t-3");
    expect(t1?.columnaId).toBe("col-1");
    expect(t1?.posicion).toBe(1000);
    expect(t3?.columnaId).toBe("col-1");
    expect(t3?.posicion).toBe(3000);
  });
});
