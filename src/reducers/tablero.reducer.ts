import { Tarjeta, Tablero } from "@/schemas/tarjeta.schema";

export interface TableroState {
  tablero: Tablero | null;
  tarjetas: Tarjeta[];
  filtroTexto: string;
  filtroEtiqueta: string | null;
  anuncioAccesible: string;
}

export type TableroAction =
  | { type: "CARGAR_TABLERO"; payload: { tablero: Tablero; tarjetas: Tarjeta[] } }
  | {
      type: "MOVER_TARJETA";
      payload: {
        tarjetaId: string;
        columnaDestinoId: string;
        nuevaPosicion: number;
        nombreColumnaDestino?: string;
      };
    }
  | { type: "CREAR_TARJETA"; payload: Tarjeta }
  | { type: "EDITAR_TARJETA"; payload: Tarjeta }
  | { type: "ELIMINAR_TARJETA"; payload: { tarjetaId: string } }
  | { type: "SET_FILTRO_TEXTO"; payload: string }
  | { type: "SET_FILTRO_ETIQUETA"; payload: string | null }
  | { type: "SET_ANUNCIO"; payload: string };

/**
 * Calcula la posición decimal para intercalar una tarjeta entre dos vecinas o al final/inicio.
 * Evita tener que reescribir las posiciones de toda la columna (Sección 8).
 */
export function calcularPosicionDecimal(
  tarjetasEnColumna: Tarjeta[],
  indiceDestino: number
): number {
  const tarjetasOrdenadas = [...tarjetasEnColumna].sort((a, b) => a.posicion - b.posicion);

  if (tarjetasOrdenadas.length === 0) {
    return 1000;
  }

  // Insertar al principio
  if (indiceDestino <= 0) {
    const primeraPos = tarjetasOrdenadas[0].posicion;
    return primeraPos > 1 ? primeraPos / 2 : primeraPos - 1000;
  }

  // Insertar al final
  if (indiceDestino >= tarjetasOrdenadas.length) {
    const ultimaPos = tarjetasOrdenadas[tarjetasOrdenadas.length - 1].posicion;
    return ultimaPos + 1000;
  }

  // Insertar entre dos tarjetas (punto medio)
  const prevPos = tarjetasOrdenadas[indiceDestino - 1].posicion;
  const nextPos = tarjetasOrdenadas[indiceDestino].posicion;
  return (prevPos + nextPos) / 2;
}

export const estadoInicialTablero: TableroState = {
  tablero: null,
  tarjetas: [],
  filtroTexto: "",
  filtroEtiqueta: null,
  anuncioAccesible: "",
};

export function tableroReducer(state: TableroState, action: TableroAction): TableroState {
  switch (action.type) {
    case "CARGAR_TABLERO": {
      return {
        ...state,
        tablero: action.payload.tablero,
        tarjetas: action.payload.tarjetas,
        anuncioAccesible: `Tablero "${action.payload.tablero.nombre}" cargado con ${action.payload.tarjetas.length} tarjetas.`,
      };
    }

    case "MOVER_TARJETA": {
      const { tarjetaId, columnaDestinoId, nuevaPosicion, nombreColumnaDestino } = action.payload;
      const tarjetaActual = state.tarjetas.find((t) => t.id === tarjetaId);

      if (!tarjetaActual) return state;

      const tarjetasActualizadas = state.tarjetas.map((t) => {
        if (t.id === tarjetaId) {
          return {
            ...t,
            columnaId: columnaDestinoId,
            posicion: nuevaPosicion,
          };
        }
        return t;
      });

      const destino = nombreColumnaDestino || columnaDestinoId;
      const anuncio = `Tarjeta "${tarjetaActual.titulo}" movida a la columna "${destino}" en posición ${nuevaPosicion}.`;

      return {
        ...state,
        tarjetas: tarjetasActualizadas,
        anuncioAccesible: anuncio,
      };
    }

    case "CREAR_TARJETA": {
      const nuevaTarjeta = action.payload;
      return {
        ...state,
        tarjetas: [...state.tarjetas, nuevaTarjeta],
        anuncioAccesible: `Tarjeta "${nuevaTarjeta.titulo}" creada exitosamente.`,
      };
    }

    case "EDITAR_TARJETA": {
      const tarjetaEditada = action.payload;
      return {
        ...state,
        tarjetas: state.tarjetas.map((t) => (t.id === tarjetaEditada.id ? tarjetaEditada : t)),
        anuncioAccesible: `Tarjeta "${tarjetaEditada.titulo}" actualizada.`,
      };
    }

    case "ELIMINAR_TARJETA": {
      const { tarjetaId } = action.payload;
      const tarjeta = state.tarjetas.find((t) => t.id === tarjetaId);
      return {
        ...state,
        tarjetas: state.tarjetas.filter((t) => t.id !== tarjetaId),
        anuncioAccesible: tarjeta
          ? `Tarjeta "${tarjeta.titulo}" eliminada.`
          : "Tarjeta eliminada.",
      };
    }

    case "SET_FILTRO_TEXTO": {
      return {
        ...state,
        filtroTexto: action.payload,
      };
    }

    case "SET_FILTRO_ETIQUETA": {
      return {
        ...state,
        filtroEtiqueta: action.payload,
      };
    }

    case "SET_ANUNCIO": {
      return {
        ...state,
        anuncioAccesible: action.payload,
      };
    }

    default:
      return state;
  }
}
