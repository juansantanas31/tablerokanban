import { adminDb } from "@/lib/firebase-admin";
import { Tablero } from "@/schemas/tarjeta.schema";

export const TableroRepository = {
  async listarPorUsuario(uid: string): Promise<Tablero[]> {
    const snapshot = await adminDb
      .collection("usuarios")
      .doc(uid)
      .collection("tableros")
      .orderBy("creadoEn", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      ...(doc.data() as Omit<Tablero, "id">),
      id: doc.id,
    }));
  },

  async obtenerPorId(uid: string, tableroId: string): Promise<Tablero | null> {
    const doc = await adminDb
      .collection("usuarios")
      .doc(uid)
      .collection("tableros")
      .doc(tableroId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return {
      ...(doc.data() as Omit<Tablero, "id">),
      id: doc.id,
    };
  },

  async crear(uid: string, tablero: Tablero): Promise<void> {
    const { id, ...datos } = tablero;
    await adminDb
      .collection("usuarios")
      .doc(uid)
      .collection("tableros")
      .doc(id)
      .set(datos);
  },

  async eliminar(uid: string, tableroId: string): Promise<void> {
    const tableroRef = adminDb
      .collection("usuarios")
      .doc(uid)
      .collection("tableros")
      .doc(tableroId);

    // Eliminar también las tarjetas en subcolección
    const tarjetasSnapshot = await tableroRef.collection("tarjetas").get();
    const batch = adminDb.batch();

    tarjetasSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(tableroRef);
    await batch.commit();
  },
};
