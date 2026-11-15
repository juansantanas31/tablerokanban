import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FiltrosBar } from "@/components/Filtros/FiltrosBar";

describe("Barra de Filtros y Búsqueda (RF-05)", () => {
  it("permite escribir en el campo de búsqueda por texto", async () => {
    const handleCambiarTexto = vi.fn();
    const user = userEvent.setup();

    render(
      <FiltrosBar
        filtroTexto=""
        onCambiarTexto={handleCambiarTexto}
        filtroEtiqueta={null}
        onCambiarEtiqueta={vi.fn()}
        onLimpiar={vi.fn()}
      />
    );

    const inputBuscar = screen.getByRole("searchbox", {
      name: /Buscar por título o descripción/i,
    });

    await user.type(inputBuscar, "pruebas");
    expect(handleCambiarTexto).toHaveBeenCalled();
  });

  it("permite seleccionar una etiqueta de filtro", async () => {
    const handleCambiarEtiqueta = vi.fn();
    const user = userEvent.setup();

    render(
      <FiltrosBar
        filtroTexto=""
        onCambiarTexto={vi.fn()}
        filtroEtiqueta={null}
        onCambiarEtiqueta={handleCambiarEtiqueta}
        onLimpiar={vi.fn()}
      />
    );

    const selectEtiqueta = screen.getByRole("combobox", {
      name: /Filtrar por etiqueta/i,
    });

    await user.selectOptions(selectEtiqueta, "urgente");
    expect(handleCambiarEtiqueta).toHaveBeenCalledWith("urgente");
  });

  it("muestra el botón de limpiar filtros cuando hay filtros activos y lo invoca al hacer clic", async () => {
    const handleLimpiar = vi.fn();
    const user = userEvent.setup();

    render(
      <FiltrosBar
        filtroTexto="sprint"
        onCambiarTexto={vi.fn()}
        filtroEtiqueta="urgente"
        onCambiarEtiqueta={vi.fn()}
        onLimpiar={handleLimpiar}
      />
    );

    const botonLimpiar = screen.getByRole("button", {
      name: /Limpiar todos los filtros/i,
    });
    expect(botonLimpiar).toBeInTheDocument();

    await user.click(botonLimpiar);
    expect(handleLimpiar).toHaveBeenCalledTimes(1);
  });
});
