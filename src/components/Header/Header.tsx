import Link from "next/link";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logoIcon} aria-hidden="true">
            K
          </div>
          <span className={styles.title}>Kanban Atómico</span>
          <span className={styles.badge}>Hito 1</span>
        </div>

        <nav className={styles.nav} aria-label="Navegación principal">
          <Link href="/" className={styles.navLink}>
            Inicio
          </Link>
          <Link href="/tableros" className={styles.navLink}>
            Mis Tableros
          </Link>
          <Link href="/login" className={styles.navLink}>
            Iniciar Sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}
