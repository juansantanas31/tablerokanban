import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Columna } from "@/components/Columna/Columna";
import { Tarjeta as TarjetaTipo } from "@/schemas/tarjeta.schema";

const columnaMock = {
  id: "col-test",
  nombre: "Por hacer",
  limiteWip: 5,
};

const tarjetasMock: TarjetaTipo[] = [
  {
    id: "tarjeta-1",
    titulo: "Configurar entorno de desarrollo",
    descripcion: "Instalar dependencias necesarias",
    columnaId: "col-test",
    posicion: 1000,
    etiquetas: ["urgente"],
    vence: "2026-11-20",
    creadoEn: "2026-11-15T09:00:00.000Z",
  },
  {
    id: "tarjeta-2",
    titulo: "Escribir pruebas accesibles",
    descripcion: "",
    columnaId: "col-test",
    posicion: 2000,
    etiquetas: ["pruebas"],
    vence: null,
    creadoEn: "2026-11-15T10:00:00.000Z",
  },
];

describe("Componente Columna y Tarjetas (Accesibilidad y Estados)", () => {
  it("renderiza la columna con tarjetas en estado de éxito", () => {
    render(
      <Columna
        columna={columnaMock}
        tarjetas={tarjetasMock}
        estado="exito"
      />
    );

    // Consulta por rol y nombre accesible
    expect(
      screen.getByRole("heading", { name: "Por hacer", level: 2 })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Configurar entorno de desarrollo",
        level: 3,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Escribir pruebas accesibles",
        level: 3,
      })
    ).toBeInTheDocument();
  });

  it("muestra el indicador de carga accesible en estado cargando", () => {
    render(
      <Columna
        columna={columnaMock}
        tarjetas={[]}
        estado="cargando"
      />
    );

    const loader = screen.getByRole("status", {
      name: /Cargando tarjetas de la columna Por hacer/i,
    });
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute("aria-busy", "true");
  });

  it("muestra el mensaje de vacío cuando no hay tarjetas", () => {
    render(
      <Columna
        columna={columnaMock}
        tarjetas={[]}
        estado="vacio"
      />
    );

    expect(
      screen.getByText("Sin tarjetas en esta columna")
    ).toBeInTheDocument();
  });

  it("muestra el mensaje de error con botón de reintento funcional en estado error", async () => {
    const handleReintentar = vi.fn();
    const user = userEvent.setup();

    render(
      <Columna
        columna={columnaMock}
        tarjetas={[]}
        estado="error"
        mensajeError="Fallo de conexión"
        onReintentar={handleReintentar}
      />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Fallo de conexión")).toBeInTheDocument();

    const botonReintentar = screen.getByRole("button", {
      name: /Reintentar carga de tarjetas en columna Por hacer/i,
    });
    expect(botonReintentar).toBeInTheDocument();

    await user.click(botonReintentar);
    expect(handleReintentar).toHaveBeenCalledTimes(1);
  });
});
