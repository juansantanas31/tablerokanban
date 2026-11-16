import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p>
          <strong style={{ color: "var(--text-primary)" }}>Tablero Kanban Minimalista</strong> · Linear Core Mode
        </p>
        <ul className={styles.standards} aria-label="Estándares de calidad">
          <li>WCAG 2.2 AA</li>
          <li>Next.js 16</li>
          <li>Dark Pro</li>
        </ul>
      </div>
    </footer>
  );
}
