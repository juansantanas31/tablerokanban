import { adminDb } from "@/lib/firebase-admin";
import { Tablero, Tarjeta } from "@/schemas/tarjeta.schema";
import datosEjemplo from "../../public/datos-ejemplo/tablero-ejemplo.json";
import { esModoDemo, DemoStore } from "./memoria-demo.store";

async function asegurarSemillaInicialFirestore(uid: string): Promise<void> {
  const userRef = adminDb.collection("usuarios").doc(uid);
  const userDoc = await userRef.get();
  if (userDoc.exists) return;

  const tableroInicial = datosEjemplo.tablero as Tablero;
  const tarjetasIniciales = datosEjemplo.tarjetas as Tarjeta[];

  const batch = adminDb.batch();
  batch.set(userRef, { inicializadoEn: new Date().toISOString() });

  const { id: tableroId, ...datosTablero } = tableroInicial;
  const tableroRef = userRef.collection("tableros").doc(tableroId);
  batch.set(tableroRef, datosTablero);

  for (const tarjeta of tarjetasIniciales) {
    const { id: tarjetaId, ...datosTarjeta } = tarjeta;
    const tarjetaRef = tableroRef.collection("tarjetas").doc(tarjetaId);
    batch.set(tarjetaRef, datosTarjeta);
  }

  await batch.commit();
}

export const TableroRepository = {
  async listarPorUsuario(uid: string): Promise<Tablero[]> {
    if (esModoDemo()) {
      return DemoStore.listarTableros(uid);
    }

    try {
      await asegurarSemillaInicialFirestore(uid);

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
    } catch (err) {
      console.warn("[TableroRepository] Fallo en Firestore al listar, usando respaldo:", err);
      return DemoStore.listarTableros(uid);
    }
  },

  async obtenerPorId(uid: string, tableroId: string): Promise<Tablero | null> {
    if (esModoDemo()) {
      return DemoStore.obtenerTablero(uid, tableroId);
    }

    try {
      if (tableroId === "tablero-demo-1") {
        await asegurarSemillaInicialFirestore(uid);
      }

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
    } catch (err) {
      console.warn("[TableroRepository] Fallo en Firestore al obtener, usando respaldo:", err);
      return DemoStore.obtenerTablero(uid, tableroId);
    }
  },

  async crear(uid: string, tablero: Tablero): Promise<void> {
    if (esModoDemo()) {
      return DemoStore.crearTablero(uid, tablero);
    }

    try {
      const { id, ...datos } = tablero;
      await adminDb
        .collection("usuarios")
        .doc(uid)
        .collection("tableros")
        .doc(id)
        .set(datos);
    } catch (err) {
      console.warn("[TableroRepository] Fallo en Firestore al crear, usando respaldo:", err);
      await DemoStore.crearTablero(uid, tablero);
    }
  },

  async eliminar(uid: string, tableroId: string): Promise<void> {
    if (esModoDemo()) {
      return DemoStore.eliminarTablero(uid, tableroId);
    }

    try {
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
    } catch (err) {
      console.warn("[TableroRepository] Fallo en Firestore al eliminar, usando respaldo:", err);
      await DemoStore.eliminarTablero(uid, tableroId);
    }
  },
};
