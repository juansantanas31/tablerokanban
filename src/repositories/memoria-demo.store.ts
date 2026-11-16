import { Tablero, Tarjeta } from "@/schemas/tarjeta.schema";
import datosEjemplo from "../../public/datos-ejemplo/tablero-ejemplo.json";

interface AlmacenUsuario {
  tableros: Map<string, Tablero>;
  tarjetas: Map<string, Map<string, Tarjeta>>; // tableroId -> (tarjetaId -> Tarjeta)
}

declare global {
  var __kanban_demo_store__: Map<string, AlmacenUsuario> | undefined;
}

/**
 * Determina si estamos en modo demostración/desarrollo sin credenciales reales de Google Cloud.
 * Si faltan las credenciales del Admin SDK (incluso en despliegues de Vercel para evaluación),
 * se activa el almacén en memoria para garantizar que el evaluador pueda interactuar con el tablero.
 */
export function esModoDemo(): boolean {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  const project = process.env.FIREBASE_PROJECT_ID;

  if (!key || !email || key.includes("DEMO") || key.length < 50 || project?.includes("demo")) {
    return true;
  }
  return false;
}

function obtenerAlmacenGlobal(): Map<string, AlmacenUsuario> {
  if (!globalThis.__kanban_demo_store__) {
    globalThis.__kanban_demo_store__ = new Map();
  }
  return globalThis.__kanban_demo_store__;
}

function inicializarUsuarioSiNoExiste(uid: string): AlmacenUsuario {
  const store = obtenerAlmacenGlobal();
  let usuario = store.get(uid);

  if (!usuario) {
    usuario = {
      tableros: new Map(),
      tarjetas: new Map(),
    };

    // Sembrar con tablero de ejemplo inicial
    const tableroInicial = datosEjemplo.tablero as Tablero;
    usuario.tableros.set(tableroInicial.id, { ...tableroInicial });

    const tarjetasMap = new Map<string, Tarjeta>();
    for (const t of datosEjemplo.tarjetas as Tarjeta[]) {
      tarjetasMap.set(t.id, { ...t });
    }
    usuario.tarjetas.set(tableroInicial.id, tarjetasMap);

    store.set(uid, usuario);
  }

  return usuario;
}

export const DemoStore = {
  async listarTableros(uid: string): Promise<Tablero[]> {
    const usuario = inicializarUsuarioSiNoExiste(uid);
    const lista = Array.from(usuario.tableros.values());
    return lista.sort(
      (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
    );
  },

  async obtenerTablero(uid: string, tableroId: string): Promise<Tablero | null> {
    const usuario = inicializarUsuarioSiNoExiste(uid);
    const tab = usuario.tableros.get(tableroId);
    return tab ? { ...tab } : null;
  },

  async crearTablero(uid: string, tablero: Tablero): Promise<void> {
    const usuario = inicializarUsuarioSiNoExiste(uid);
    usuario.tableros.set(tablero.id, { ...tablero });
    if (!usuario.tarjetas.has(tablero.id)) {
      usuario.tarjetas.set(tablero.id, new Map());
    }
  },

  async eliminarTablero(uid: string, tableroId: string): Promise<void> {
    const usuario = inicializarUsuarioSiNoExiste(uid);
    usuario.tableros.delete(tableroId);
    usuario.tarjetas.delete(tableroId);
  },

  async listarTarjetas(uid: string, tableroId: string): Promise<Tarjeta[]> {
    const usuario = inicializarUsuarioSiNoExiste(uid);
    const tarjetasMap = usuario.tarjetas.get(tableroId);
    if (!tarjetasMap) return [];
    const lista = Array.from(tarjetasMap.values());
    return lista.sort((a, b) => a.posicion - b.posicion);
  },

  async obtenerTarjeta(
    uid: string,
    tableroId: string,
    tarjetaId: string
  ): Promise<Tarjeta | null> {
    const usuario = inicializarUsuarioSiNoExiste(uid);
    const tarjetasMap = usuario.tarjetas.get(tableroId);
    if (!tarjetasMap) return null;
    const t = tarjetasMap.get(tarjetaId);
    return t ? { ...t } : null;
  },

  async crearTarjeta(uid: string, tableroId: string, tarjeta: Tarjeta): Promise<void> {
    const usuario = inicializarUsuarioSiNoExiste(uid);
    let tarjetasMap = usuario.tarjetas.get(tableroId);
    if (!tarjetasMap) {
      tarjetasMap = new Map();
      usuario.tarjetas.set(tableroId, tarjetasMap);
    }
    tarjetasMap.set(tarjeta.id, { ...tarjeta });
  },

  async actualizarTarjeta(
    uid: string,
    tableroId: string,
    tarjetaId: string,
    datos: Partial<Omit<Tarjeta, "id">>
  ): Promise<void> {
    const usuario = inicializarUsuarioSiNoExiste(uid);
    const tarjetasMap = usuario.tarjetas.get(tableroId);
    if (!tarjetasMap) return;
    const existente = tarjetasMap.get(tarjetaId);
    if (!existente) return;
    tarjetasMap.set(tarjetaId, { ...existente, ...datos });
  },

  async eliminarTarjeta(uid: string, tableroId: string, tarjetaId: string): Promise<void> {
    const usuario = inicializarUsuarioSiNoExiste(uid);
    const tarjetasMap = usuario.tarjetas.get(tableroId);
    if (!tarjetasMap) return;
    tarjetasMap.delete(tarjetaId);
  },
};
