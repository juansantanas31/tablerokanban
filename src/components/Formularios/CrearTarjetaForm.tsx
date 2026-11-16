"use client";

import { useState } from "react";
import { Columna, Tarjeta, CrearTarjetaSchema } from "@/schemas/tarjeta.schema";
import styles from "./CrearTarjetaForm.module.css";

interface CrearTarjetaFormProps {
  columnas: Columna[];
  columnaInicialId?: string;
  onCrear: (tarjeta: Tarjeta) => void;
  onCancelar: () => void;
}

const ETIQUETAS_DISPONIBLES = [
  "urgente",
  "importante",
  "diseño",
  "desarrollo",
  "pruebas",
  "documentacion",
];

export function CrearTarjetaForm({
  columnas,
  columnaInicialId,
  onCrear,
  onCancelar,
}: CrearTarjetaFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [columnaId, setColumnaId] = useState(columnaInicialId || columnas[0]?.id || "");
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [vence, setVence] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  const handleTagToggle = (tag: string) => {
    setEtiquetas((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({});

    const datosInput = {
      titulo,
      descripcion,
      columnaId,
      posicion: Date.now(), // Posición temporal inicial
      etiquetas,
      vence: vence ? vence : null,
    };

    const resultado = CrearTarjetaSchema.safeParse(datosInput);

    if (!resultado.success) {
      const fieldErrors: Record<string, string> = {};
      resultado.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrores(fieldErrors);
      return;
    }

    const nuevaTarjeta: Tarjeta = {
      id: `tarjeta-${Date.now()}`,
      titulo: resultado.data.titulo,
      descripcion: resultado.data.descripcion,
      columnaId: resultado.data.columnaId,
      posicion: resultado.data.posicion ?? Date.now(),
      etiquetas: resultado.data.etiquetas,
      vence: resultado.data.vence ?? null,
      creadoEn: new Date().toISOString(),
    };

    onCrear(nuevaTarjeta);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.fieldGroup}>
        <label htmlFor="titulo-tarjeta" className={styles.label}>
          Título de la tarjeta <span className={styles.required}>*</span>
        </label>
        <input
          id="titulo-tarjeta"
          type="text"
          className={`${styles.input} ${errores.titulo ? styles.inputError : ""}`}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          aria-required="true"
          aria-invalid={!!errores.titulo}
          aria-describedby={errores.titulo ? "error-titulo" : undefined}
          maxLength={100}
          placeholder="Ej: Implementar autenticación"
        />
        {errores.titulo && (
          <span id="error-titulo" className={styles.errorText} role="alert">
            {errores.titulo}
          </span>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="descripcion-tarjeta" className={styles.label}>
          Descripción (opcional)
        </label>
        <textarea
          id="descripcion-tarjeta"
          className={styles.textarea}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={500}
          placeholder="Detalles adicionales sobre la tarea..."
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="columna-select" className={styles.label}>
          Columna de destino <span className={styles.required}>*</span>
        </label>
        <select
          id="columna-select"
          className={styles.select}
          value={columnaId}
          onChange={(e) => setColumnaId(e.target.value)}
          aria-required="true"
        >
          {columnas.map((col) => (
            <option key={col.id} value={col.id}>
              {col.nombre}
            </option>
          ))}
        </select>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Etiquetas de color</legend>
        <div className={styles.tagOptions}>
          {ETIQUETAS_DISPONIBLES.map((tag) => (
            <label key={tag} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={etiquetas.includes(tag)}
                onChange={() => handleTagToggle(tag)}
              />
              <span style={{ textTransform: "capitalize" }}>{tag}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.fieldGroup}>
        <label htmlFor="fecha-vence" className={styles.label}>
          Fecha de vencimiento (opcional)
        </label>
        <input
          id="fecha-vence"
          type="date"
          className={styles.input}
          value={vence}
          onChange={(e) => setVence(e.target.value)}
        />
      </div>

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancelar}
        >
          Cancelar
        </button>
        <button type="submit" className={styles.submitButton}>
          Crear Tarjeta
        </button>
      </div>
    </form>
  );
}
