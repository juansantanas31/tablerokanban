import Link from "next/link";
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
              <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--text-muted)" }}>
                unfold_more
              </span>
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
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              home
            </span>
          </Link>
          <Link
            href="/tableros"
            className={styles.iconButton}
            title="Mis Tableros"
            aria-label="Mis Tableros"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              view_kanban
            </span>
          </Link>
          <Link
            href="/login"
            className={styles.iconButton}
            title="Iniciar Sesión"
            aria-label="Iniciar Sesión"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              login
            </span>
          </Link>
          <div className={styles.avatar} aria-hidden="true">
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              person
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}
