import { TableroRepository } from "@/repositories/tablero.repository";
import { TarjetaRepository } from "@/repositories/tarjeta.repository";
import { Tablero, Tarjeta, TableroSchema } from "@/schemas/tarjeta.schema";
import { ErrorNoEncontrado } from "@/lib/errores";

export const TableroService = {
  async listarTableros(uid: string): Promise<Tablero[]> {
    return TableroRepository.listarPorUsuario(uid);
  },

  /**
   * Obtiene un tablero y todas sus tarjetas en una sola respuesta (Sección 9.4).
   * Si no existe o es ajeno, responde 404 (Sección 10, Criterio 3).
   */
  async obtenerTableroConTarjetas(
    uid: string,
    tableroId: string
  ): Promise<{ tablero: Tablero; tarjetas: Tarjeta[] }> {
    const tablero = await TableroRepository.obtenerPorId(uid, tableroId);
    if (!tablero) {
      throw new ErrorNoEncontrado(`El tablero con ID "${tableroId}" no fue encontrado`);
    }

    const tarjetas = await TarjetaRepository.listarPorTablero(uid, tableroId);
    return { tablero, tarjetas };
  },

  async crearTablero(uid: string, nombre: string): Promise<Tablero> {
    const ts = Date.now();
    const id = `tablero-${ts}`;
    const nuevoTablero: Tablero = {
      id,
      nombre: nombre.trim(),
      columnas: [
        { id: `col-por-hacer-${ts}`, nombre: "Por hacer", limiteWip: 10 },
        { id: `col-en-curso-${ts}`, nombre: "En curso", limiteWip: 3 },
        { id: `col-hecho-${ts}`, nombre: "Hecho" },
      ],
      creadoEn: new Date().toISOString(),
    };

    const validacion = TableroSchema.safeParse(nuevoTablero);
    if (!validacion.success) {
      throw new Error("Datos inválidos para crear el tablero");
    }

    await TableroRepository.crear(uid, validacion.data);
    return validacion.data;
  },

  async eliminarTablero(uid: string, tableroId: string): Promise<void> {
    const tablero = await TableroRepository.obtenerPorId(uid, tableroId);
    if (!tablero) {
      throw new ErrorNoEncontrado(`El tablero con ID "${tableroId}" no fue encontrado`);
    }

    await TableroRepository.eliminar(uid, tableroId);
  },
};
