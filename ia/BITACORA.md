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


### Sesión 05: Implementación de Hito 4 (Integración Final, Reglas Firestore, proxy.ts, CALIDAD.md y README)
- **Fecha:** 2026-11-15
- **Propósito:**
  1. Completar la integración del Hito 4 (Semana 15 - Entrega Final) según las especificaciones de `03-tablero-kanban.md`.
  2. Implementar `firestore.rules` con la regla de oro: `allow read, write: if false;` garantizando que el navegador nunca hable con Firestore.
  3. Configurar cabeceras estrictas de seguridad (CSP, X-Content-Type-Options, Referrer-Policy, Frame-Options) en `next.config.ts`.
  4. Crear `proxy.ts` para Next.js 16 (redirección a `/login` si falta la cookie en rutas protegidas).
  5. Implementar el cliente Firebase Web SDK (`src/lib/firebase-client.ts`) para login de usuario e intercambio de token por cookie de sesión HttpOnly.
  6. Redactar el informe de calidad `CALIDAD.md` y generar `calidad/auditoria-accesibilidad.json` con las evidencias de Core Web Vitals, accesibilidad WCAG 2.2 AA y retos de excelencia.
  7. Actualizar el `README.md` con la guía integral de arquitectura, comandos, endpoints y checklist de seguridad.
- **Interacción / Prompt:**
  - *"procedamos con el 4"*
- **Evidencia Generada:**
  - `firestore.rules`: Reglas de seguridad estrictas que bloquean acceso directo de cliente a Firestore.
  - `next.config.ts`: Cabeceras de seguridad HTTP configuradas.
  - `proxy.ts`: Middleware proxy para Next.js 16.
  - `src/lib/firebase-client.ts`: Integración cliente con Firebase Auth.
  - `CALIDAD.md` y `calidad/auditoria-accesibilidad.json`: Reporte formal de evidencias de calidad.
  - `README.md`: Documentación completa del proyecto.
  - 27 pruebas automatizadas aprobadas en Vitest.
- **Validación Humana:**
  - Ejecución de `npm run check` con 0 errores de ESLint, 0 errores de TypeScript y 27 pruebas aprobadas.
  - Ejecución de `node ia/verificar-seguridad-ia.mjs` con 0 anomalías.
- **Decisión Técnica:**
  - Realizar el commit del Hito 4 para consolidar la entrega final del proyecto en el historial de Git (hash `a5efdd5`).


### Sesión 06: Integración del Diseño UI Stitch (Tablero Kanban Minimalista y Detalle de Tarea LIN-1042)
- **Fecha:** 2026-11-15
- **Propósito:**
  1. Integrar el diseño exportado de Google Stitch (Proyecto: *Tablero Kanban Minimalista*, ID: `4185160347418965793`) respetando Next.js 16 (App Router), React 19, TypeScript, CSS Modules nativo y accesibilidad WCAG 2.2 AA.
  2. Implementar los tokens de diseño dark mode (#0d0e12, #12141a, #181a22, #1e212b, #252834, #638fff) y fuentes Inter + Google Material Symbols en `src/app/globals.css` y `src/app/layout.tsx`.
  3. Rediseñar el `Header` con el selector de espacio "Linear Core / Boards", barra de acciones y perfil.
  4. Rediseñar el `Footer` con el status chip y links semánticos accesibles.
  5. Rediseñar las tarjetas Kanban (`Tarjeta.tsx` y `Tarjeta.module.css`) con identificador mono (ej. `LIN-3042`), barra de subtareas completadas, etiqueta de prioridad, avatar con iniciales y botón accesible de teclado.
  6. Rediseñar las columnas (`Columna.tsx` y `Columna.module.css`) con punto indicador de status, contador badge mono y botón rápido de añadir tarea.
  7. Rediseñar la barra superior de filtros (`FiltrosBar.tsx` y `FiltrosBar.module.css`) con indicador de velocidad de Sprint ("Sprint 24 · Q3"), chips de filtro rápido y botón de nueva tarea.
  8. Desarrollar el componente completo de Detalle de Tarea (`TarjetaDetalleContenido.tsx` y su módulo CSS) reflejando la Pantalla 2 (Detalle de Tarea LIN-1042):
     - Barra superior con código mono `LIN-1042` y badge de estado.
     - Título y descripción con contexto de arquitectura.
     - Bento Metadata Grid (Asignado con avatar circular, Prioridad Alta con indicador rojo, Sprint, Estimación con Story Points y fecha límite).
     - Lista interactiva de subtareas con checkboxes funcionales y barra de progreso animada con porcentaje (`aria-valuenow`).
     - Sección de actividad y discusión con historial de comentarios y formulario de respuesta.
  9. Integrar el nuevo detalle tanto en el modal nativo `<dialog>` de `src/app/tableros/[id]/page.tsx` como en la ruta individual `src/app/tableros/[id]/tarjetas/[tarjetaId]/page.tsx` con dock de acciones fijo al fondo.
- **Interacción / Prompt:**
  - *"usa eata interfaz para el proyecto [...] el codigo que te pase lo usas segun los requrimientos del proyecto en el lenguaje requerido"*
- **Evidencia Generada:**
  - `src/app/globals.css`, `src/app/layout.tsx`: Tokens de diseño y fuentes Material Symbols/Inter.
  - `src/components/Header/`: Componente y estilos actualizados.
  - `src/components/Footer/`: Componente y estilos actualizados.
  - `src/components/Tarjeta/`: Tarjeta tipo Linear con identificador y subtasks bar.
  - `src/components/Columna/`: Columna moderna con badges y puntos de estado.
  - `src/components/Filtros/`: Barra de sprint health e indicadores de filtro.
  - `src/components/TarjetaDetalle/`: Componente `TarjetaDetalleContenido.tsx` y `TarjetaDetalleContenido.module.css`.
  - `src/app/tableros/[id]/page.tsx`: Modal integrado con el diseño de detalle.
  - `src/app/tableros/[id]/tarjetas/[tarjetaId]/page.tsx`: Vista completa accesible por URL directa.
  - `src/components/Modal/ModalDialog.module.css`: Modal ampliado con backdrop desenfocado.
- **Validación Humana:**
  - `npm run check`: 0 errores ESLint, 0 errores TypeScript, 27/27 pruebas de Vitest aprobadas.
  - `node ia/verificar-seguridad-ia.mjs`: Todas las restricciones de seguridad y aislamiento verificadas y conformes.
- **Decisión Técnica:**
  - Consolidar la integración del diseño Stitch en Git con un commit atómico.


### Sesión 07: Diagnóstico y Resolución de Superposición Visual de Textos (Iconos SVG Nativos y CSP)
- **Fecha:** 2026-11-16
- **Propósito:**
  1. Diagnosticar la causa de la superposición de textos en la interfaz (captura de pantalla enviada por el usuario).
  2. Identificar el fallo de carga de fuentes por ligaduras de `Material Symbols Outlined` provocado por la estricta Content Security Policy (CSP) en `next.config.ts`.
  3. Reemplazar completamente las ligaduras de texto por un componente SVG nativo e independiente (`Icon.tsx`) para garantizar 100% de fiabilidad visual sin dependencia de red.
  4. Ajustar los layouts de `Header`, `FiltrosBar`, `Tarjeta`, `Columna` y `Footer` para evitar desbordamientos y colisiones tipográficas.
- **Interacción / Prompt:**
  - *"la informacion sigue mostrandose mal hay palabras encima de otras"* (con captura adjunta).
- **Evidencia Generada:**
  - `src/components/Icon/Icon.tsx`: Componente SVG nativo con 36 trazados vectoriales vectorizados con `aria-hidden="true"`, `focusable="false"` y tamaño paramétrico.
  - `next.config.ts`: Ampliación de CSP para permitir `https://fonts.googleapis.com` en `style-src` y `https://fonts.gstatic.com` en `font-src`.
  - Reemplazo sistemático de las clases `.material-symbols-outlined` en todos los componentes del cliente y servidor por `<Icon name="..." />`.
  - Corrección de `Tarjeta.module.css` y `Header.module.css` para contener las filas de badges con `flex-wrap`, `gap` estructurado y protección de desbordamiento.
  - Commits `98fe8f5` y `b386f2d`.
- **Validación Humana:**
  - `npm run check`: 0 errores ESLint, 0 errores TypeScript, 27/27 pruebas de Vitest aprobadas.
  - `node ia/verificar-seguridad-ia.mjs`: Conforme.
- **Decisión Técnica:**
  - Eliminar las ligaduras tipográficas web externas en favor de componentes SVG vectoriales nativos para evitar roturas visuales por políticas de seguridad o latencia de red.


### Sesión 08: Integración de Cliente API, useOptimistic, Manejo de Conflicto 409 y Ajustes de Schemas
- **Fecha:** 2026-11-16
- **Propósito:**
  1. Implementar cliente HTTP unificado `src/lib/api-cliente.ts` con clase `ApiError` tipada.
  2. Integrar consumo real de endpoints `/api/tableros` y `/api/tableros/:id` eliminando mocks de `localStorage` y redundancia en landmarks.
  3. Incorporar `useOptimistic` y `startTransition` en `src/app/tableros/[id]/page.tsx` para movimiento instantáneo de tarjetas con reversión automática en caso de rechazo del servidor (`409` por límite de 50 tarjetas por columna o fallo de red).
  4. Corregir `CrearTarjetaSchema` para aceptar campos opcionales `posicion` y `vence` evitando el error `400` en creación de tarjetas.
  5. Asegurar cálculo no negativo en inserción inicial del reductor `calcularPosicionDecimal`.
  6. Documentar respuesta `409` en `openapi.yaml` y añadir pruebas unitarias correspondientes en `tests/schemas.test.ts` y `tests/api/tarjetas-mover.test.ts`.
- **Interacción / Prompt:**
  - *"Preparé tres archivos nuevos y te dejo abajo los cuatro cambios pequeños en archivos existentes. No pude ejecutar nada, así que corre `npm run check` al terminar."*
- **Evidencia Generada:**
  - `src/lib/api-cliente.ts`: Cliente `fetch` tipado con captura de `ApiError` y códigos HTTP.
  - `src/app/tableros/page.tsx`: Lista y creación vía API con estados de carga (esqueleto), vacío y error con reintento.
  - `src/app/tableros/[id]/page.tsx`: Actualización optimista (`useOptimistic`), alerta visible `role="alert"` y reversión funcional ante `409`.
  - `src/schemas/tarjeta.schema.ts`, `CrearTarjetaForm.tsx`, `tablero.reducer.ts`, `tarjeta.service.ts`: Correcciones aplicadas.
  - `openapi.yaml`: Respuesta `409` documentada en `/mover`.
  - `tests/schemas.test.ts`: Prueba para creación sin posición/vence aprobada.
  - `tests/api/tarjetas-mover.test.ts`: Prueba de respuesta `409` al alcanzar 50 tarjetas aprobada.
- **Validación Humana:**
  - `npm run check`: 0 errores ESLint, 0 errores TypeScript, 29/29 pruebas de Vitest aprobadas.
  - `node ia/verificar-seguridad-ia.mjs`: Todas las reglas de seguridad de IA verificadas.
- **Decisión Técnica:**
  - Desacoplar el estado visual optimista de la persistencia base y respaldar la reversión sin recargas manuales.


### Sesión 09: Resolución de Redirección proxy.ts, Cierre de Sesión en Header, Purga de Datos Falsos y Técnicas Sección 6
- **Fecha:** 2026-11-16
- **Propósito:**
  1. Resolver el bucle infinito de redirección `/login` provocado por `proxy.ts` cuando se corre en modo simulación local sin claves GCP reales.
  2. Implementar botón de cierre de sesión («Cerrar Sesión») en el `Header` conectado a `DELETE /api/auth/sesion` y `signOut(auth)`.
  3. Purgar datos hardcodeados y elementos mockeados no previstos en el alcance de `03-tablero-kanban.md` (subtareas ficticias 3/5, comentarios falsos, barra de sprint ficticia).
  4. Completar las tres técnicas requeridas de la Sección 6: `useReducer`, `useOptimistic` y modal con URL por ruta interceptada/paralela (`@modal/(.)tarjetas/[tarjetaId]`).
  5. Crear el almacén en memoria para desarrollo local (`src/repositories/memoria-demo.store.ts`) permitiendo navegación completa e interactiva en desarrollo sin configurar credenciales externas.
  6. Añadir pruebas de integración para el endpoint `POST /api/tableros/:id/tarjetas` con payloads mínimos sin posición ni fecha de vencimiento (`bruno/08-tarjeta-crear-exito.bru`).
  7. Mantener el código verificado localmente con Git sin realizar push remoto según la directriz explícita del usuario.
- **Interacción / Prompt:**
  - *"Conectar la UI a la API...", "Técnicas de la sección 6...", "El detalle de tarjeta es falso...", "Bug en POST .../tarjetas...", "Login simulado + proxy.ts..."*
- **Evidencia Generada:**
  - `src/lib/firebase-client.ts`, `src/app/api/auth/sesion/route.ts`, `src/lib/auth.ts`: Emisión de cookie de sesión `sesion=demo-session-*` para que `proxy.ts` permita navegación protegida en desarrollo local.
  - `src/components/Header/Header.tsx`: Componente cliente interactivo con detección de sesión activa (`GET /api/auth/yo`) y botón accesible con icono de logout para cerrar sesión (`DELETE /api/auth/sesion`).
  - `src/components/TarjetaDetalle/TarjetaDetalleContenido.tsx`, `src/components/Tarjeta/Tarjeta.tsx`, `src/components/Filtros/FiltrosBar.tsx`: Eliminados todos los mocks hardcodeados (3/5 subtareas, Sprint ficticio 68%, comentarios mock).
  - `src/app/tableros/[id]/layout.tsx`, `src/app/tableros/[id]/@modal/(.)tarjetas/[tarjetaId]/page.tsx`: Modal con URL interceptada nativo de Next.js 16.
  - `src/repositories/memoria-demo.store.ts`: Almacén local seguro en `globalThis` que preserva el estado en vivo de tableros y tarjetas durante el desarrollo sin credenciales GCP.
  - `tests/api/tarjetas-crear.test.ts`: Pruebas de creación con validación de contrato OpenAPI 201.
  - `npm run check`: 11 suites de prueba, 31/31 pruebas unitarias aprobadas.
- **Validación Humana:**
  - `npm run check`: 0 errores ESLint, 0 errores TypeScript, 31 pruebas aprobadas en Vitest.
  - `node ia/verificar-seguridad-ia.mjs`: Conforme.
- **Decisión Técnica:**
  - Preservar la estricta frontera cliente/servidor, cumplir al 100% las restricciones de seguridad y mantener los cambios en commits locales sin ejecutar push remoto.



