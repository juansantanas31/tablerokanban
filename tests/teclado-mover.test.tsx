import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tarjeta } from "@/components/Tarjeta/Tarjeta";
import { Tarjeta as TarjetaTipo, Columna as ColumnaTipo } from "@/schemas/tarjeta.schema";

const tarjetaMock: TarjetaTipo = {
  id: "tarjeta-teclado-1",
  titulo: "Revisar accesibilidad de teclado",
  descripcion: "Probar tabulación y foco",
  columnaId: "col-1",
  posicion: 1000,
  etiquetas: ["accesibilidad"],
  vence: "2026-11-30",
  creadoEn: "2026-11-15T12:00:00.000Z",
};

const columnasDisponibles: ColumnaTipo[] = [
  { id: "col-1", nombre: "Por hacer" },
  { id: "col-2", nombre: "En curso" },
  { id: "col-3", nombre: "Hecho" },
];

describe("Movimiento accesible por teclado (RF-03 & Criterio de Aceptación 1)", () => {
  it("muestra el selector accesible 'Mover a...' con las otras columnas disponibles", () => {
    render(
      <Tarjeta
        tarjeta={tarjetaMock}
        columnasDisponibles={columnasDisponibles}
        onMoverTeclado={vi.fn()}
      />
    );

    const selectMover = screen.getByRole("combobox", {
      name: /Mover tarjeta "Revisar accesibilidad de teclado" a otra columna/i,
    });

    expect(selectMover).toBeInTheDocument();
    // Debe excluir la columna actual ("Por hacer") y mostrar las demás
    expect(screen.getByRole("option", { name: "En curso" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Hecho" })).toBeInTheDocument();
  });

  it("invoca onMoverTeclado al seleccionar una columna de destino", async () => {
    const handleMoverTeclado = vi.fn();
    const user = userEvent.setup();

    render(
      <Tarjeta
        tarjeta={tarjetaMock}
        columnasDisponibles={columnasDisponibles}
        onMoverTeclado={handleMoverTeclado}
      />
    );

    const selectMover = screen.getByRole("combobox", {
      name: /Mover tarjeta "Revisar accesibilidad de teclado" a otra columna/i,
    });

    await user.selectOptions(selectMover, "col-2");

    expect(handleMoverTeclado).toHaveBeenCalledWith("tarjeta-teclado-1", "col-2");
  });
});
