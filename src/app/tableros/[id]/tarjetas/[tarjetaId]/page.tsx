import Link from "next/link";
import styles from "./tarjeta-detalle.module.css";

interface PageProps {
  params: Promise<{ id: string; tarjetaId: string }>;
}

export default async function TarjetaDetallePage({ params }: PageProps) {
  const { id: tableroId, tarjetaId } = await params;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href={`/tableros/${tableroId}`} className={styles.backLink}>
          ← Volver al tablero
        </Link>
        <span className={styles.badge}>Detalle de Tarjeta</span>
      </header>

      <main className={styles.contentCard} aria-labelledby="detalle-tarjeta-titulo">
        <h1 id="detalle-tarjeta-titulo" className={styles.title}>
          Tarjeta #{tarjetaId}
        </h1>

        <p className={styles.description}>
          Visualización individual de tarjeta accesible por URL directa. En la interfaz interactiva,
          este detalle también se abre mediante un modal accesible con foco atrapado implementado con la
          API de &lt;dialog&gt; nativo.
        </p>

        <div className={styles.metaBox}>
          <p>
            <strong>ID de Tablero:</strong> {tableroId}
          </p>
          <p>
            <strong>ID de Tarjeta:</strong> {tarjetaId}
          </p>
        </div>

        <div className={styles.actions}>
          <Link href={`/tableros/${tableroId}`} className={styles.primaryLink}>
            Regresar al Tablero
          </Link>
        </div>
      </main>
    </div>
  );
}
