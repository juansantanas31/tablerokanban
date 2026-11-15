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


### Sesión 03: Implementación de Hito 2 (Navegación Modular, useReducer, Drag & Drop, Filtros y Pruebas Críticas)
- **Fecha:** 2026-11-15
- **Propósito:**
  1. Desarrollar la aplicación modular y navegable con App Router (`/tableros`, `/tableros/[id]`, `/tableros/[id]/tarjetas/[tarjetaId]`, `/login`).
  2. Implementar el reductor de estado del tablero (`src/reducers/tablero.reducer.ts`) con el cálculo de posición decimal de tarjetas para inserción sin reescritura.
  3. Integrar las APIs de navegador obligatorias (Sección 5): HTML Drag & Drop API, `localStorage` con fallback seguro (`useLocalStorage`), y `<dialog>` nativo para modales con foco atrapado.
  4. Proveer alternativa completa por teclado para el movimiento de tarjetas (RF-03, Criterio de Aceptación 1) con anuncios dinámicos vía `AriaLiveAnnouncer`.
  5. Crear la barra de filtros por texto y etiquetas (RF-05).
  6. Implementar formularios controlados y validados con Zod (`CrearTarjetaForm`, `CrearTableroModal`, login).
  7. Escribir pruebas unitarias de los 5 casos críticos del reductor, movimiento por teclado, filtros y validación de formularios con Vitest y RTL.
- **Interacción / Prompt:**
  - *"procedamso con el 2 siguiendo las pautas del documento 03-tablero-kanban.md"*
- **Evidencia Generada:**
  - `src/reducers/tablero.reducer.ts`: Reductor con lógica pura y `calcularPosicionDecimal`.
  - `src/hooks/useLocalStorage.ts`: Hook con mejora progresiva y manejo seguro de errores.
  - `src/components/Modal/ModalDialog.tsx`: Modal nativo con la API de `<dialog>`, atrapa y devuelve el foco.
  - `src/components/Formularios/CrearTarjetaForm.tsx`: Formulario controlado con validación Zod.
  - `src/components/Filtros/FiltrosBar.tsx`: Barra de búsqueda y filtrado de etiquetas accesible.
  - `src/components/Tarjeta/`: Soporte para Drag & Drop nativo y selector de teclado «Mover a...».
  - `src/components/Columna/`: Soporte para soltar tarjetas (drop targets) y alerta visual de límite WIP.
  - Rutas del App Router: `/tableros`, `/tableros/[id]`, `/tableros/[id]/tarjetas/[tarjetaId]`, `/login`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
  - Suites de prueba en `tests/`: 7 archivos y 21 pruebas unitarias aprobadas al 100%.
- **Validación Humana:**
  - Ejecución de `npm run check` con 0 errores de ESLint, 0 errores de TypeScript y 21 pruebas aprobadas en Vitest.
  - Ejecución de `node ia/verificar-seguridad-ia.mjs` con 0 anomalías.
- **Decisión Técnica:**
  - Consolidar el Hito 2 en el historial Git del proyecto con commit atómico.


### Sesión 04: Implementación de Hito 3 (API REST por Capas, Firebase Admin, openapi.yaml, Bruno y Pruebas de API)
- **Fecha:** 2026-11-15
- **Propósito:**
  1. Construir la API REST por capas en `src/app/api/**` cumpliendo con la Sección 9 de `03-tablero-kanban.md`.
  2. Implementar repositorios de Firestore (`src/repositories/`) exclusivamente mediante Firebase Admin SDK (`firebase-admin`).
  3. Desarrollar la capa de servicios (`src/services/`) con lógica de negocio pura y testeable.
  4. Implementar manejo uniforme de errores (`src/lib/errores.ts` y `src/lib/http.ts`) y autenticación de sesión con cookie HttpOnly y Bearer token (`src/lib/auth.ts`).
  5. Crear los endpoints oficiales: `POST /api/auth/sesion`, `DELETE /api/auth/sesion`, `GET /api/auth/yo`, `GET /api/tableros`, `POST /api/tableros`, `GET /api/tableros/:id`, `DELETE /api/tableros/:id`, `POST /api/tableros/:id/tarjetas`, `PATCH /api/tableros/:id/tarjetas/:tid/mover`, `PATCH /api/tableros/:id/tarjetas/:tid`, `DELETE /api/tableros/:id/tarjetas/:tid`.
  6. Redactar la especificación completa OpenAPI 3.0 en `openapi.yaml`.
  7. Crear la colección oficial de solicitudes en `bruno/` con 9 archivos `.bru` (casos exitosos, 400, 401 y 404).
  8. Desarrollar suites de pruebas automatizadas de la API con `vi.mock` simulando Firebase Admin y prueba de integración (ruta -> servicio -> repositorio).
- **Interacción / Prompt:**
  - *"continuemos"*
- **Evidencia Generada:**
  - `src/lib/`: `errores.ts`, `http.ts`, `firebase-admin.ts`, `auth.ts`.
  - `src/repositories/`: `tablero.repository.ts`, `tarjeta.repository.ts`.
  - `src/services/`: `tablero.service.ts`, `tarjeta.service.ts`.
  - `src/app/api/`: Route Handlers para autenticación, tableros y tarjetas.
  - `openapi.yaml`: Documentación OpenAPI 3.0.3 con esquemas, rutas y respuestas.
  - `bruno/`: Colección Bruno versionable con 9 solicitudes HTTP probando casos normales y de error.
  - `tests/api/`: `auth.test.ts`, `tableros.test.ts` (integración y 404), `tarjetas-mover.test.ts`. Total: 27 pruebas unitarias aprobadas.
- **Validación Humana:**
  - Ejecución de `npm run check`: 0 errores ESLint, 0 errores TypeScript, 27 pruebas aprobadas en Vitest.
  - Ejecución de `node ia/verificar-seguridad-ia.mjs`: 0 anomalías.
- **Decisión Técnica:**
  - Consolidar el Hito 3 en el historial Git del repositorio con commit atómico.
