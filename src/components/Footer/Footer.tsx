import Link from "next/link";
import { Icon } from "@/components/Icon/Icon";
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
          <Icon name="view_kanban" size={20} />
          <span>Boards</span>
        </Link>
        <Link href="/tableros" className={styles.navItem}>
          <Icon name="format_list_bulleted" size={20} />
          <span>Backlog</span>
        </Link>
        <Link href="/tableros" className={styles.navItem}>
          <Icon name="history" size={20} />
          <span>Activity</span>
        </Link>
        <Link href="/tableros" className={styles.navItem}>
          <Icon name="settings" size={20} />
          <span>Settings</span>
        </Link>
      </nav>
    </>
  );
}
