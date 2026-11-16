import Link from "next/link";
import { Icon } from "@/components/Icon/Icon";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brandGroup}>
          <Link href="/tableros" className={styles.brandButton} aria-label="Ir a tableros">
            <span className={styles.brandSub}>Linear Core</span>
            <span className={styles.brandTitle}>
              Tablero Kanban
              <Icon name="unfold_more" size={15} style={{ color: "var(--text-muted)", marginLeft: 2 }} />
            </span>
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Navegación principal">
          <Link
            href="/"
            className={styles.iconButton}
            title="Inicio / Hito 1"
            aria-label="Inicio y Demostración"
          >
            <Icon name="home" size={18} />
          </Link>
          <Link
            href="/tableros"
            className={styles.iconButton}
            title="Mis Tableros"
            aria-label="Mis Tableros"
          >
            <Icon name="view_kanban" size={18} />
          </Link>
          <Link
            href="/login"
            className={styles.iconButton}
            title="Iniciar Sesión"
            aria-label="Iniciar Sesión"
          >
            <Icon name="login" size={18} />
          </Link>
          <div className={styles.avatar} aria-hidden="true" title="Usuario">
            <Icon name="person" size={16} />
          </div>
        </nav>
      </div>
    </header>
  );
}
