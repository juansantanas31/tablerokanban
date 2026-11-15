"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { AriaLiveAnnouncer } from "@/components/AriaLive/AriaLiveAnnouncer";
import { iniciarSesionConCorreo } from "@/lib/firebase-client";
import styles from "./login.module.css";

const LoginSchema = z.object({
  correo: z.string().trim().email("Ingrese un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [anuncio, setAnuncio] = useState("Formulario de inicio de sesión listo");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({});
    setMensajeEstado(null);

    const resultado = LoginSchema.safeParse({ correo, password });

    if (!resultado.success) {
      const fieldErrors: Record<string, string> = {};
      resultado.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrores(fieldErrors);
      setAnuncio("Error en la validación del formulario de inicio de sesión.");
      return;
    }

    setCargando(true);
    setAnuncio("Iniciando sesión...");

    try {
      const res = await iniciarSesionConCorreo(correo, password);
      setMensajeEstado(`Sesión iniciada exitosamente para ${res.correo}. Redirigiendo...`);
      setAnuncio("Inicio de sesión exitoso. Redirigiendo a tus tableros.");
      setTimeout(() => {
        router.push("/tableros");
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      setErrores({ auth: msg });
      setAnuncio(`Fallo de autenticación: ${msg}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <AriaLiveAnnouncer mensaje={anuncio} />

      <h1 className={styles.heading}>Iniciar Sesión</h1>
      <p className={styles.subheading}>
        Accede a tus tableros Kanban organizados y sincronizados.
      </p>

      {mensajeEstado && (
        <div
          role="status"
          className={`${styles.statusMessage} ${styles.statusSuccess}`}
        >
          {mensajeEstado}
        </div>
      )}

      {errores.auth && (
        <div
          role="alert"
          style={{
            backgroundColor: "var(--color-error-bg)",
            color: "var(--color-error)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "1rem",
            border: "1px solid var(--color-error)",
          }}
        >
          {errores.auth}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldGroup}>
          <label htmlFor="correo-input" className={styles.label}>
            Correo electrónico
          </label>
          <input
            id="correo-input"
            type="email"
            name="email"
            autoComplete="email"
            className={`${styles.input} ${errores.correo ? styles.inputError : ""}`}
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            aria-required="true"
            aria-invalid={!!errores.correo}
            aria-describedby={errores.correo ? "error-correo" : undefined}
            placeholder="usuario@ejemplo.com"
            disabled={cargando}
          />
          {errores.correo && (
            <span id="error-correo" className={styles.errorText} role="alert">
              {errores.correo}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="password-input" className={styles.label}>
            Contraseña
          </label>
          <input
            id="password-input"
            type="password"
            name="password"
            autoComplete="current-password"
            className={`${styles.input} ${errores.password ? styles.inputError : ""}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-required="true"
            aria-invalid={!!errores.password}
            aria-describedby={errores.password ? "error-password" : undefined}
            placeholder="••••••••"
            disabled={cargando}
          />
          {errores.password && (
            <span id="error-password" className={styles.errorText} role="alert">
              {errores.password}
            </span>
          )}
        </div>

        <button type="submit" className={styles.submitButton} disabled={cargando}>
          {cargando ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
