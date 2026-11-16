import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <>
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

      {/* Mobile Bottom Navigation Bar (Stitch Linear Core) */}
      <nav className={styles.bottomNav} aria-label="Navegación móvil">
        <Link href="/tableros" className={`${styles.navItem} ${styles.navItemActive}`} aria-current="page">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            view_kanban
          </span>
          <span>Boards</span>
        </Link>
        <Link href="/tableros" className={styles.navItem}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            format_list_bulleted
          </span>
          <span>Backlog</span>
        </Link>
        <Link href="/tableros" className={styles.navItem}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            history
          </span>
          <span>Activity</span>
        </Link>
        <Link href="/tableros" className={styles.navItem}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            settings
          </span>
          <span>Settings</span>
        </Link>
      </nav>
    </>
  );
}
