import { adminDb } from "@/lib/firebase-admin";
import { Tarjeta } from "@/schemas/tarjeta.schema";
import { esModoDemo, DemoStore } from "./memoria-demo.store";

export const TarjetaRepository = {
  async listarPorTablero(uid: string, tableroId: string): Promise<Tarjeta[]> {
    if (esModoDemo()) {
      return DemoStore.listarTarjetas(uid, tableroId);
    }

    const snapshot = await adminDb
      .collection("usuarios")
      .doc(uid)
      .collection("tableros")
      .doc(tableroId)
      .collection("tarjetas")
      .orderBy("posicion", "asc")
      .get();

    return snapshot.docs.map((doc) => ({
      ...(doc.data() as Omit<Tarjeta, "id">),
      id: doc.id,
    }));
  },

  async obtenerPorId(
    uid: string,
    tableroId: string,
    tarjetaId: string
  ): Promise<Tarjeta | null> {
    if (esModoDemo()) {
      return DemoStore.obtenerTarjeta(uid, tableroId, tarjetaId);
    }

    const doc = await adminDb
      .collection("usuarios")
      .doc(uid)
      .collection("tableros")
      .doc(tableroId)
      .collection("tarjetas")
      .doc(tarjetaId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return {
      ...(doc.data() as Omit<Tarjeta, "id">),
      id: doc.id,
    };
  },

  async crear(uid: string, tableroId: string, tarjeta: Tarjeta): Promise<void> {
    if (esModoDemo()) {
      return DemoStore.crearTarjeta(uid, tableroId, tarjeta);
    }

    const { id, ...datos } = tarjeta;
    await adminDb
      .collection("usuarios")
      .doc(uid)
      .collection("tableros")
      .doc(tableroId)
      .collection("tarjetas")
      .doc(id)
      .set(datos);
  },

  async actualizar(
    uid: string,
    tableroId: string,
    tarjetaId: string,
    datos: Partial<Omit<Tarjeta, "id">>
  ): Promise<void> {
    if (esModoDemo()) {
      return DemoStore.actualizarTarjeta(uid, tableroId, tarjetaId, datos);
    }

    await adminDb
      .collection("usuarios")
      .doc(uid)
      .collection("tableros")
      .doc(tableroId)
      .collection("tarjetas")
      .doc(tarjetaId)
      .update(datos);
  },

  async eliminar(uid: string, tableroId: string, tarjetaId: string): Promise<void> {
    if (esModoDemo()) {
      return DemoStore.eliminarTarjeta(uid, tableroId, tarjetaId);
    }

    await adminDb
      .collection("usuarios")
      .doc(uid)
      .collection("tableros")
      .doc(tableroId)
      .collection("tarjetas")
      .doc(tarjetaId)
      .delete();
  },
};
