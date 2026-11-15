import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p>
          <strong>03 · Tablero Kanban</strong> — Proyecto accesible construido con Next.js 16 y React 19.
        </p>
        <ul className={styles.standards} aria-label="Estándares de calidad">
          <li>WCAG 2.2 Nivel AA</li>
          <li>HTML Semántico</li>
          <li>Mobile-First</li>
        </ul>
      </div>
    </footer>
  );
}
