import { adminDb } from "@/lib/firebase-admin";
import { Tarjeta } from "@/schemas/tarjeta.schema";
import { esModoDemo, DemoStore } from "./memoria-demo.store";

export const TarjetaRepository = {
  async listarPorTablero(uid: string, tableroId: string): Promise<Tarjeta[]> {
    if (esModoDemo()) {
      return DemoStore.listarTarjetas(uid, tableroId);
    }

    try {
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
    } catch (err) {
      console.warn("[TarjetaRepository] Fallo en Firestore al listar, usando respaldo:", err);
      return DemoStore.listarTarjetas(uid, tableroId);
    }
  },

  async obtenerPorId(
    uid: string,
    tableroId: string,
    tarjetaId: string
  ): Promise<Tarjeta | null> {
    if (esModoDemo()) {
      return DemoStore.obtenerTarjeta(uid, tableroId, tarjetaId);
    }

    try {
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
    } catch (err) {
      console.warn("[TarjetaRepository] Fallo en Firestore al obtener, usando respaldo:", err);
      return DemoStore.obtenerTarjeta(uid, tableroId, tarjetaId);
    }
  },

  async crear(uid: string, tableroId: string, tarjeta: Tarjeta): Promise<void> {
    if (esModoDemo()) {
      return DemoStore.crearTarjeta(uid, tableroId, tarjeta);
    }

    try {
      const { id, ...datos } = tarjeta;
      await adminDb
        .collection("usuarios")
        .doc(uid)
        .collection("tableros")
        .doc(tableroId)
        .collection("tarjetas")
        .doc(id)
        .set(datos);
    } catch (err) {
      console.warn("[TarjetaRepository] Fallo en Firestore al crear, usando respaldo:", err);
      await DemoStore.crearTarjeta(uid, tableroId, tarjeta);
    }
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

    try {
      await adminDb
        .collection("usuarios")
        .doc(uid)
        .collection("tableros")
        .doc(tableroId)
        .collection("tarjetas")
        .doc(tarjetaId)
        .update(datos);
    } catch (err) {
      console.warn("[TarjetaRepository] Fallo en Firestore al actualizar, usando respaldo:", err);
      await DemoStore.actualizarTarjeta(uid, tableroId, tarjetaId, datos);
    }
  },

  async eliminar(uid: string, tableroId: string, tarjetaId: string): Promise<void> {
    if (esModoDemo()) {
      return DemoStore.eliminarTarjeta(uid, tableroId, tarjetaId);
    }

    try {
      await adminDb
        .collection("usuarios")
        .doc(uid)
        .collection("tableros")
        .doc(tableroId)
        .collection("tarjetas")
        .doc(tarjetaId)
        .delete();
    } catch (err) {
      console.warn("[TarjetaRepository] Fallo en Firestore al eliminar, usando respaldo:", err);
      await DemoStore.eliminarTarjeta(uid, tableroId, tarjetaId);
    }
  },
};
