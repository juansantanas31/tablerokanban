# Bitácora de Uso y Configuración de IA

> **Proyecto:** 03 · Tablero Kanban con arrastrar y soltar  
> **Estudiante / Desarrollador:** SANTANA  
> **Cumplimiento:** Sección 15 y Hito 1 de `03-tablero-kanban.md`

Esta bitácora documenta de manera transparente y auditable cada intervención del asistente de IA en el desarrollo del proyecto, especificando el propósito, la evidencia generada, la validación humana realizada y la decisión técnica tomada.

---

## Registro de Sesiones

### Sesión 01: Auditoría de Requisitos, Corrección de Repositorio y Configuración de IA (Hito 1 - Primer Commit)
- **Fecha:** 2026-11-15
- **Propósito:** 
  1. Auditar el estado inicial del proyecto respecto a los requerimientos de `03-tablero-kanban.md`.
  2. Detectar anomalías en el entorno de versionamiento y dependencias.
  3. Establecer las reglas de IA, restricciones de seguridad y configuración de pruebas previo al primer commit del repositorio.
- **Interacción / Prompt:**
  - *"verifica como esta el flujo de creacion de este proyecto y si esta cumpliendo con los requerimientos especificados en el archivo 03-tablero-kanban.md"*
  - *"procedamos"*
- **Evidencia Generada:**
  - Diagnóstico que identificó que Git estaba inicializado en `C:\Users\SANTANA` en lugar de la raíz del proyecto.
  - Inicialización limpia de Git con rama principal `main` en `c:\Users\SANTANA\Desktop\tablero Kamban`.
  - Archivo `AGENTS.md` con las reglas de proyecto, restricciones de seguridad e instrucciones de arquitectura.
  - Archivo `.cursorrules` para sincronizar agentes basados en Cursor / VS Code.
  - Archivo `vitest.config.ts` y `tests/setup.ts` para pruebas unitarias.
  - Documento de pruebas de restricciones `ia/PRUEBAS_RESTRICCIONES.md` y script de validación `ia/verificar-seguridad-ia.mjs`.
- **Validación Humana:**
  - Revisión del árbol de archivos, confirmación de que `.gitignore` excluye `.env*`, y verificación de que `npm run lint` pasa sin errores.
- **Decisión Técnica:**
  - Versionar la configuración de IA como el **primer commit** del repositorio para dar cumplimiento estricto a las secciones 15 y 16.


### Sesión 02: Implementación de Hito 1 (Columna Kanban Accesible, Esquemas Zod y Pruebas)
- **Fecha:** 2026-11-15
- **Propósito:**
  1. Construir la columna Kanban con tarjetas fijas según las especificaciones del Hito 1 (Semana 4).
  2. Implementar esquemas Zod (`src/schemas/tarjeta.schema.ts`) para validación estricta de datos (Sección 8).
  3. Asegurar HTML semántico (`<header>`, `<nav>`, `<main>`, `<footer>`), `lang="es"`, enlace de salto de accesibilidad y soporte para lectores de pantalla (`aria-live`).
  4. Gestionar los 4 estados de interfaz: Carga (esqueleto animado), Vacío, Error (con reintento) y Éxito.
  5. Crear controles de simulación en vivo para sustentar los estados de interfaz ante el docente.
  6. Escribir y validar pruebas unitarias y de accesibilidad con Vitest y React Testing Library.
- **Interacción / Prompt:**
  - *"procedamos"*
- **Evidencia Generada:**
  - `src/schemas/tarjeta.schema.ts`: Esquemas Zod para Tarjeta, Columna y Tablero.
  - `public/datos-ejemplo/tablero-ejemplo.json`: Archivo de datos de ejemplo estructurado según la Sección 9.4.
  - `src/app/globals.css`: Sistema de diseño accesible con contraste WCAG 2.2 AA, foco visible y soporte para temas claro/oscuro y reducción de movimiento.
  - `src/components/Header/`: Landmark `<header>` y `<nav>` semánticos.
  - `src/components/Footer/`: Landmark `<footer>` accesible.
  - `src/components/Tarjeta/`: Componente de tarjeta accesible con etiquetas de alto contraste y fecha semántica `<time>`.
  - `src/components/Columna/`: Columna Kanban con gestión de los estados de carga, vacío, error y éxito.
  - `src/components/AriaLive/`: Región en vivo para anuncios a tecnologías asistivas.
  - `src/app/page.tsx`: Vista interactiva con panel de control para demostración en vivo.
  - `tests/schemas.test.ts` y `tests/columna.test.tsx`: 9 pruebas unitarias aprobadas.
- **Validación Humana:**
  - Ejecución de `npm run check` con 0 errores de ESLint, 0 errores de TypeScript y 100% de pruebas aprobadas en Vitest.
  - Verificación de seguridad con `node ia/verificar-seguridad-ia.mjs`.
- **Decisión Técnica:**
  - Cumplir el 100% de los criterios del Hito 1 y preparar el commit correspondiente con historial atómico.
