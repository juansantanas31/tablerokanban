import { TarjetaRepository } from "@/repositories/tarjeta.repository";
import { TableroRepository } from "@/repositories/tablero.repository";
import { Tarjeta, CrearTarjetaInput, TarjetaSchema } from "@/schemas/tarjeta.schema";
import { ErrorNoEncontrado, ErrorConflicto } from "@/lib/errores";
import { calcularPosicionDecimal } from "@/reducers/tablero.reducer";

export const TarjetaService = {
  async crearTarjeta(
    uid: string,
    tableroId: string,
    datos: CrearTarjetaInput
  ): Promise<Tarjeta> {
    const tablero = await TableroRepository.obtenerPorId(uid, tableroId);
    if (!tablero) {
      throw new ErrorNoEncontrado(`El tablero "${tableroId}" no existe`);
    }

    let columnaDestinoId = datos.columnaId;
    let columnaExiste = tablero.columnas.some((col) => col.id === columnaDestinoId);

    if (!columnaExiste) {
      const prefijoMatch = columnaDestinoId.match(/^(col-por-hacer|col-en-curso|col-hecho)-\d+$/);
      if (prefijoMatch) {
        const colEquivalente = tablero.columnas.find((col) =>
          col.id.startsWith(prefijoMatch[1])
        );
        if (colEquivalente) {
          columnaDestinoId = colEquivalente.id;
          columnaExiste = true;
        }
      }
    }

    if (!columnaExiste) {
      throw new ErrorNoEncontrado(`La columna "${datos.columnaId}" no existe en este tablero`);
    }

    // Regla de negocio Sección 8: máximo 50 tarjetas por columna
    const todasLasTarjetas = await TarjetaRepository.listarPorTablero(uid, tableroId);
    const tarjetasEnColumna = todasLasTarjetas.filter((t) => t.columnaId === columnaDestinoId);
    if (tarjetasEnColumna.length >= 50) {
      throw new ErrorConflicto(
        `La columna ha alcanzado el límite máximo permitido de 50 tarjetas (Sección 8)`
      );
    }

    const posicionCalculada =
      datos.posicion ||
      calcularPosicionDecimal(tarjetasEnColumna, tarjetasEnColumna.length);

    const nuevaTarjeta: Tarjeta = {
      id: `tarjeta-${Date.now()}`,
      titulo: datos.titulo,
      descripcion: datos.descripcion || "",
      columnaId: columnaDestinoId,
      posicion: posicionCalculada,
      etiquetas: datos.etiquetas || [],
      vence: datos.vence || null,
      creadoEn: new Date().toISOString(),
    };

    const validacion = TarjetaSchema.safeParse(nuevaTarjeta);
    if (!validacion.success) {
      throw new Error("Datos inválidos al crear la tarjeta");
    }

    await TarjetaRepository.crear(uid, tableroId, validacion.data);
    return validacion.data;
  },

  async moverTarjeta(
    uid: string,
    tableroId: string,
    tarjetaId: string,
    columnaDestinoId: string,
    posicion?: number
  ): Promise<Tarjeta> {
    const tablero = await TableroRepository.obtenerPorId(uid, tableroId);
    if (!tablero) {
      throw new ErrorNoEncontrado(`El tablero "${tableroId}" no existe`);
    }

    const columnaDestino = tablero.columnas.find((col) => col.id === columnaDestinoId);
    if (!columnaDestino) {
      throw new ErrorNoEncontrado(`La columna de destino "${columnaDestinoId}" no existe`);
    }

    const tarjeta = await TarjetaRepository.obtenerPorId(uid, tableroId, tarjetaId);
    if (!tarjeta) {
      throw new ErrorNoEncontrado(`La tarjeta "${tarjetaId}" no existe`);
    }

    // Si no se pasó una posición explícita, calcularla al final de la columna destino
    const todasLasTarjetas = await TarjetaRepository.listarPorTablero(uid, tableroId);
    const enDestino = todasLasTarjetas.filter(
      (t) => t.columnaId === columnaDestinoId && t.id !== tarjetaId
    );

    if (tarjeta.columnaId !== columnaDestinoId && enDestino.length >= 50) {
      throw new ErrorConflicto(
        "La columna de destino ha alcanzado el límite máximo de 50 tarjetas (Sección 8)"
      );
    }

    let posicionFinal = posicion;
    if (posicionFinal === undefined || posicionFinal === null) {
      posicionFinal = calcularPosicionDecimal(enDestino, enDestino.length);
    }

    await TarjetaRepository.actualizar(uid, tableroId, tarjetaId, {
      columnaId: columnaDestinoId,
      posicion: posicionFinal,
    });

    return {
      ...tarjeta,
      columnaId: columnaDestinoId,
      posicion: posicionFinal,
    };
  },

  async editarTarjeta(
    uid: string,
    tableroId: string,
    tarjetaId: string,
    datos: Partial<Omit<CrearTarjetaInput, "columnaId">>
  ): Promise<Tarjeta> {
    const tarjeta = await TarjetaRepository.obtenerPorId(uid, tableroId, tarjetaId);
    if (!tarjeta) {
      throw new ErrorNoEncontrado(`La tarjeta "${tarjetaId}" no existe`);
    }

    const datosActualizados = {
      ...(datos.titulo !== undefined ? { titulo: datos.titulo } : {}),
      ...(datos.descripcion !== undefined ? { descripcion: datos.descripcion } : {}),
      ...(datos.etiquetas !== undefined ? { etiquetas: datos.etiquetas } : {}),
      ...(datos.vence !== undefined ? { vence: datos.vence } : {}),
    };

    await TarjetaRepository.actualizar(uid, tableroId, tarjetaId, datosActualizados);

    return {
      ...tarjeta,
      ...datosActualizados,
    };
  },

  async eliminarTarjeta(
    uid: string,
    tableroId: string,
    tarjetaId: string
  ): Promise<void> {
    const tarjeta = await TarjetaRepository.obtenerPorId(uid, tableroId, tarjetaId);
    if (!tarjeta) {
      throw new ErrorNoEncontrado(`La tarjeta "${tarjetaId}" no existe`);
    }

    await TarjetaRepository.eliminar(uid, tableroId, tarjetaId);
  },
};
