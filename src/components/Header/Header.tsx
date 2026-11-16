"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "@/components/Icon/Icon";
import { cerrarSesion } from "@/lib/firebase-client";
import styles from "./Header.module.css";

interface UsuarioSesion {
  uid: string;
  correo: string;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
    let activo = true;
    fetch("/api/auth/yo")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (activo) {
          setUsuario(data?.usuario ?? null);
        }
      })
      .catch(() => {
        if (activo) setUsuario(null);
      });

    return () => {
      activo = false;
    };
  }, [pathname]);

  const handleCerrarSesion = async () => {
    if (cerrando) return;
    setCerrando(true);
    try {
      await cerrarSesion();
      setUsuario(null);
      router.push("/login");
      router.refresh();
    } catch {
      // Ignorar errores transitorios de cierre
    } finally {
      setCerrando(false);
    }
  };

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

          {usuario ? (
            <button
              type="button"
              className={styles.iconButton}
              onClick={handleCerrarSesion}
              disabled={cerrando}
              title={`Cerrar sesión (${usuario.correo})`}
              aria-label="Cerrar sesión"
            >
              <Icon name="logout" size={18} />
            </button>
          ) : (
            <Link
              href="/login"
              className={styles.iconButton}
              title="Iniciar Sesión"
              aria-label="Iniciar Sesión"
            >
              <Icon name="login" size={18} />
            </Link>
          )}

          <div
            className={styles.avatar}
            aria-hidden="true"
            title={usuario ? usuario.correo : "Invitado"}
          >
            <Icon name="person" size={16} />
          </div>
        </nav>
      </div>
    </header>
  );
}
