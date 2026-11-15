import { Tarjeta as TarjetaTipo } from "@/schemas/tarjeta.schema";
import styles from "./Tarjeta.module.css";

interface TarjetaProps {
  tarjeta: TarjetaTipo;
  onVerDetalle?: (id: string) => void;
}

export function Tarjeta({ tarjeta, onVerDetalle }: TarjetaProps) {
  const getTagClass = (tag: string) => {
    const normalizada = tag.toLowerCase().trim();
    switch (normalizada) {
      case "urgente":
        return styles.tagUrgente;
      case "importante":
        return styles.tagImportante;
      case "diseño":
        return styles.tagDiseno;
      case "desarrollo":
        return styles.tagDesarrollo;
      case "pruebas":
        return styles.tagPruebas;
      case "documentacion":
      case "documentación":
        return styles.tagDocumentacion;
      default:
        return styles.tagDefault;
    }
  };

  return (
    <li className={styles.cardItem}>
      <article
        className={styles.card}
        aria-labelledby={`tarjeta-titulo-${tarjeta.id}`}
      >
        {tarjeta.etiquetas.length > 0 && (
          <div
            className={styles.tagsContainer}
            aria-label={`Etiquetas de la tarjeta: ${tarjeta.etiquetas.join(", ")}`}
          >
            {tarjeta.etiquetas.map((tag) => (
              <span
                key={tag}
                className={`${styles.tag} ${getTagClass(tag)}`}
              >
                <span aria-hidden="true">•</span>
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 id={`tarjeta-titulo-${tarjeta.id}`} className={styles.title}>
          {tarjeta.titulo}
        </h3>

        {tarjeta.descripcion && (
          <p className={styles.description}>{tarjeta.descripcion}</p>
        )}

        <div className={styles.metaRow}>
          {tarjeta.vence ? (
            <span className={styles.dueDate}>
              <span aria-hidden="true">📅</span>
              <time dateTime={tarjeta.vence}>
                Vence: {tarjeta.vence}
              </time>
            </span>
          ) : (
            <span className={styles.dueDate}>Sin fecha límite</span>
          )}

          <button
            type="button"
            className={styles.actionButton}
            onClick={() => onVerDetalle?.(tarjeta.id)}
            aria-label={`Ver detalles de tarjeta: ${tarjeta.titulo}`}
          >
            Detalles
          </button>
        </div>
      </article>
    </li>
  );
}
