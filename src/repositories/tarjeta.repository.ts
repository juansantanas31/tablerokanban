import { adminDb } from "@/lib/firebase-admin";
import { Tarjeta } from "@/schemas/tarjeta.schema";

export const TarjetaRepository = {
  async listarPorTablero(uid: string, tableroId: string): Promise<Tarjeta[]> {
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
