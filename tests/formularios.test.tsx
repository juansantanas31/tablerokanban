import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CrearTarjetaForm } from "@/components/Formularios/CrearTarjetaForm";
import { Columna } from "@/schemas/tarjeta.schema";

const columnasMock: Columna[] = [
  { id: "col-1", nombre: "Por hacer" },
  { id: "col-2", nombre: "En curso" },
];

describe("Formulario controlado de creación de tarjetas (RF-01 y Sección 8)", () => {
  it("muestra error accesible si se intenta enviar con título vacío", async () => {
    const handleCrear = vi.fn();
    const user = userEvent.setup();

    render(
      <CrearTarjetaForm
        columnas={columnasMock}
        onCrear={handleCrear}
        onCancelar={vi.fn()}
      />
    );

    const botonCrear = screen.getByRole("button", { name: "Crear Tarjeta" });
    await user.click(botonCrear);

    expect(handleCrear).not.toHaveBeenCalled();
    const errorMsg = screen.getByRole("alert");
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg).toHaveTextContent(/al menos 1 caracter/i);
  });

  it("permite diligenciar y enviar el formulario con datos válidos", async () => {
    const handleCrear = vi.fn();
    const user = userEvent.setup();

    render(
      <CrearTarjetaForm
        columnas={columnasMock}
        onCrear={handleCrear}
        onCancelar={vi.fn()}
      />
    );

    const inputTitulo = screen.getByLabelText(/Título de la tarjeta/i);
    await user.type(inputTitulo, "Nueva tarea con Zod");

    const inputDesc = screen.getByLabelText(/Descripción \(opcional\)/i);
    await user.type(inputDesc, "Detalle importante");

    const checkboxUrgente = screen.getByRole("checkbox", { name: /urgente/i });
    await user.click(checkboxUrgente);

    const botonCrear = screen.getByRole("button", { name: "Crear Tarjeta" });
    await user.click(botonCrear);

    expect(handleCrear).toHaveBeenCalledTimes(1);
    const tarjetaCreada = handleCrear.mock.calls[0][0];
    expect(tarjetaCreada.titulo).toBe("Nueva tarea con Zod");
    expect(tarjetaCreada.descripcion).toBe("Detalle importante");
    expect(tarjetaCreada.etiquetas).toContain("urgente");
  });
});
