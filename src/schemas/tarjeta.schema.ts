import { z } from "zod";

/**
 * Esquema de validación para etiquetas de tarjeta Kanban
 */
export const EtiquetaColorSchema = z.enum([
  "urgente",
  "importante",
  "diseño",
  "desarrollo",
  "pruebas",
  "documentacion",
]);

export type EtiquetaColor = z.infer<typeof EtiquetaColorSchema>;

/**
 * Esquema de validación estricto para Tarjeta (Sección 8 y 9.4)
 */
export const TarjetaSchema = z.object({
  id: z.string().min(1, "El ID de la tarjeta es obligatorio"),
  titulo: z
    .string()
    .trim()
    .min(1, "El título debe tener al menos 1 caracter")
    .max(100, "El título no puede superar los 100 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .default(""),
  columnaId: z.string().min(1, "El ID de la columna es obligatorio"),
  posicion: z.number().positive("La posición debe ser un número positivo"),
  etiquetas: z.array(z.string()).default([]),
  vence: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de fecha debe ser YYYY-MM-DD")
    .nullable(),
  creadoEn: z.string().datetime({ message: "Fecha de creación ISO 8601 requerida" }),
});

export type Tarjeta = z.infer<typeof TarjetaSchema>;

/**
 * Esquema para crear una nueva tarjeta
 */
export const CrearTarjetaSchema = TarjetaSchema.omit({
  id: true,
  creadoEn: true,
});

export type CrearTarjetaInput = z.infer<typeof CrearTarjetaSchema>;

/**
 * Esquema de validación para Columna
 */
export const ColumnaSchema = z.object({
  id: z.string().min(1, "El ID de columna es requerido"),
  nombre: z.string().trim().min(1, "El nombre de la columna es obligatorio").max(50),
  limiteWip: z.number().int().positive().max(50).optional(),
});

export type Columna = z.infer<typeof ColumnaSchema>;

/**
 * Esquema de validación para Tablero
 */
export const TableroSchema = z.object({
  id: z.string().min(1, "El ID de tablero es requerido"),
  nombre: z.string().trim().min(1, "El nombre del tablero es obligatorio").max(100),
  columnas: z.array(ColumnaSchema).min(1, "Debe tener al menos una columna"),
  creadoEn: z.string().datetime(),
});

export type Tablero = z.infer<typeof TableroSchema>;
