<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas del Asistente de IA — Proyecto 03-tablero-kanban

Este documento define la configuración obligatoria de IA para el proyecto **Tablero Kanban con arrastrar y soltar** según las especificaciones de la **Sección 15** de `03-tablero-kanban.md`. Todos los agentes y asistentes de IA (Cursor, Antigravity, Copilot, etc.) deben acatar estas reglas sin excepción.

---

## 1. Stack Tecnológico y Comandos Oficiales

- **Framework:** Next.js 16 (App Router) con TypeScript.
- **Librería UI:** React 19. Componentes de servidor por defecto (`"use client"` solo cuando haya hooks, estado o eventos de cliente).
- **Estilos:** CSS Modules / CSS nativo accesible, diseño responsive mobile-first (360px, 768px, 1024px).
- **Validación:** Zod (esquemas compartidos en `src/schemas/`).
- **Autenticación y Persistencia:**
  - Firebase Web SDK (`firebase/auth`) exclusivamente en el cliente para login con correo/contraseña.
  - Cookie de sesión HttpOnly gestionada por el servidor (`POST /api/auth/sesion`).
  - Firebase Admin SDK (`firebase-admin`) **únicamente en el servidor**. El cliente NUNCA importa `firebase/firestore`.
- **Testing:** Vitest + React Testing Library + jsdom.
- **Comandos estándar:**
  - `npm run dev`: Inicia el servidor de desarrollo local.
  - `npm run lint`: Ejecuta el análisis estático de ESLint.
  - `npm run test`: Ejecuta las pruebas automatizadas con Vitest.
  - `npm run check`: Ejecuta lint + chequeo de tipos (`tsc --noEmit`) + pruebas.

---

## 2. Restricciones de Seguridad para la IA (Inviolables)

1. **Aislamiento del Directorio:**
   - La IA tiene prohibido leer, escribir o navegar fuera del directorio raíz de este proyecto (`c:\Users\SANTANA\Desktop\tablero Kamban`).
   - Ningún comando o script ejecutado por la IA puede referenciar rutas superiores (`../..`) o del sistema del usuario.
2. **Protección Absoluta de Secretos y `.env`:**
   - La IA **NO puede leer**, imprimir ni exponer archivos `.env`, `.env.local`, `.env*.local` ni certificados o claves de cuentas de servicio.
   - En respuestas al usuario, la IA nunca debe incluir tokens reales, claves privadas (`FIREBASE_PRIVATE_KEY`), correos de servicio ni contraseñas.
3. **Acciones con Efecto Externo:**
   - Despliegues (`vercel`), creación de ramas remotas o push a repositorios remotos requieren confirmación explícita del usuario.
4. **Frontera Cliente/Servidor:**
   - Firestore solo se toca desde repositorios en el servidor (`src/repositories/`).
   - Las reglas de seguridad de Firestore deben ser siempre `allow read, write: if false;`.

---

## 3. Reglas de Calidad y Arquitectura del Código

1. **Arquitectura por Capas:**
   - `src/schemas/`: Esquemas Zod que definen contratos y validaciones estrictas.
   - `src/repositories/`: Único punto de contacto con Firestore vía Admin SDK.
   - `src/services/`: Lógica de negocio pura y testeable sin acoplamiento HTTP.
   - `src/app/api/`: Route Handlers que reciben la petición, validan con Zod, delegan al servicio y responden con JSON estandarizado.
   - `src/components/`: Componentes accesibles y semánticos.
2. **Accesibilidad (WCAG 2.2 AA) y HTML Semántico:**
   - Idioma `lang="es"` en `html`.
   - Landmarks semánticos: `<header>`, `<nav>`, `<main>`, `<footer`.
   - Enlace accesible «Saltar al contenido».
   - Foco visible garantizado en todo elemento interactivo.
   - Alternativa por teclado completa para el arrastre de tarjetas (Drag & Drop con botones de mover accesibles).
   - Anuncios para lectores de pantalla mediante `aria-live`.
   - Cero `<div onClick>`: use elementos interactivos nativos (`<button>`, `<a>`).
3. **Verificación Automatizada Obligatoria:**
   - Todo código generado por la IA debe compilar (`tsc --noEmit`), pasar `npm run lint` y aprobar `npm run test`.
