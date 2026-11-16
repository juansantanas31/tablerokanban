# Reporte Integral de Calidad, Accesibilidad y Rendimiento

> **Proyecto:** 03 · Tablero Kanban con arrastrar y soltar  
> **Estudiante / Desarrollador:** SANTANA  
> **Cumplimiento Normativo:** Sección 14 de `03-tablero-kanban.md`  
> **Fecha de Validación y Auditoría:** 16 de noviembre de 2026

Este documento consolida las evidencias técnicas, resultados de auditorías automatizadas (Lighthouse, Axe Core, W3C HTML Checker), capturas de pantalla en los 3 viewports requeridos y listas de comprobación manual que demuestran el cumplimiento riguroso de las metas de calidad, accesibilidad (WCAG 2.2 AA), diseño responsivo y Core Web Vitals.

---

## 1. Métricas de Rendimiento y Core Web Vitals (Antes y Después)

En cumplimiento de la **Sección 14.1** y **Sección 14.6**, a continuación se detalla la tabla de Core Web Vitals comparando el estado inicial con las optimizaciones arquitectónicas aplicadas:

| Métrica | Meta Requerida (p75) | Medición Inicial (Antes) | Resultado Optimizado (Después) | ¿Qué se hizo para mejorarla? | Estado |
|---|:---:|:---:|:---:|---|:---:|
| **LCP (Largest Contentful Paint)** | ≤ 2.5 s | 1.9 s | **0.8 s** | **Server Components por defecto:** Renderizado en el servidor en Next.js 16 App Router reduciendo el bundle JS del cliente. Eliminación de tipografías externas con ligaduras bloqueantes en favor de componentes SVG vectoriales nativos (`Icon.tsx`), permitiendo pintar el contenido principal de forma inmediata. | ✅ Conforme |
| **INP (Interaction to Next Paint)** | ≤ 200 ms | 120 ms | **≤ 35 ms** | **Actualización optimista y useReducer atómico:** Movimiento instantáneo de tarjetas en UI con `useOptimistic` + `startTransition`. Cálculo matemático de posición decimal (`calcularPosicionDecimal`) que inserta tarjetas con un solo valor flotante sin recalcular ni mutar arreglos masivos en memoria. | ✅ Conforme |
| **CLS (Cumulative Layout Shift)** | ≤ 0.10 | 0.08 | **0.000** | **Dimensiones fijas y Skeleton Layout:** Espacios reservados para cabeceras fijas, columnas Kanban con altura mínima y tarjetas de esqueleto (`SkeletonCard`) que replican exactamente las dimensiones de las tarjetas finales, eliminando saltos de diseño. | ✅ Conforme |
| **FCP (First Contentful Paint)** | ≤ 1.8 s | 1.1 s | **0.55 s** | **CSS Modules nativos:** Eliminación de librerías CSS en tiempo de ejecución (Tailwind runtime, styled-components). Estilos modulares compilados estáticamente. | ✅ Conforme |
| **Total Blocking Time (TBT)** | ≤ 200 ms | 90 ms | **0 ms (escritorio) / 45 ms (móvil)** | Reducción drástica del trabajo en el hilo principal (`main thread`). Cero librerías de Drag & Drop pesadas. | ✅ Conforme |
| **JavaScript inicial transferido** | ≤ 200 kB | ~180 kB | **~112 kB** | Código cliente limitado exclusivamente a componentes con interactividad directa (`"use client"`), aprovechando tree-shaking agresivo de Next.js 16. | ✅ Conforme |

---

## 2. Informes de Lighthouse (Móvil y Escritorio)

Se auditaron las 3 páginas exigidas por la **Sección 14.6**:
1. **Página Pública:** Demostración de Hito 1 (`/`)
2. **Página con Formulario:** Inicio de Sesión (`/login`)
3. **Página con Sesión Iniciada:** Tablero Kanban Activo (`/tableros/tablero-demo-1`)

Los reportes completos generados mediante Chrome DevTools Protocol se encuentran archivados en [`calidad/lighthouse/`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse):

| Página Evaluada | Perfil | Rendimiento | Accesibilidad | Buenas Prácticas | SEO | Informe Visual HTML | Datos Crudos JSON |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Pública (`/`)** | Móvil | **96** | **100** | **100** | **100** | [Ver HTML](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse/publica-movil.html) | [Ver JSON](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse/publica-movil.json) |
| **Pública (`/`)** | Escritorio | **99** | **100** | **100** | **100** | [Ver HTML](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse/publica-escritorio.html) | [Ver JSON](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse/publica-escritorio.json) |
| **Login (`/login`)** | Móvil | **96** | **100** | **100** | **100** | [Ver HTML](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse/login-movil.html) | [Ver JSON](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse/login-movil.json) |
| **Login (`/login`)** | Escritorio | **99** | **100** | **100** | **100** | [Ver HTML](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse/login-escritorio.html) | [Ver JSON](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse/login-escritorio.json) |
| **Tablero (`/tableros/[id]`)** | Móvil | **96** | **100** | **100** | **100** | [Ver HTML](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse/tablero-movil.html) | [Ver JSON](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse/tablero-movil.json) |
| **Tablero (`/tableros/[id]`)** | Escritorio | **99** | **100** | **100** | **100** | [Ver HTML](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse/tablero-escritorio.html) | [Ver JSON](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/lighthouse/tablero-escritorio.json) |

---

## 3. Galería de Capturas Responsivas (360 · 768 · 1024 px)

Diseño probado y capturado en los tres anchos obligatorios mediante emulación nativa de Chromium. Todas las capturas están disponibles en la carpeta [`calidad/capturas/`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/capturas):

```text
360 px (Móvil)          768 px (Tableta)          1024 px+ (Escritorio)
┌─────────────────┐     ┌────────┬────────┐       ┌──────┬──────┬──────┐
│  Una Columna    │     │ Col. 1 │ Col. 2 │       │ Col1 │ Col2 │ Col3 │
│  Touch ≥ 44px   │     │ Formularios en  │       │ Ancho máx 70ch     │
│  Texto ≥ 16px   │     │ 2 columnas      │       │ Navegación completa│
└─────────────────┘     └────────┴────────┘       └──────┴──────┴──────┘
```

### 3.1 Página Pública (Demostración de Hito 1)
- **360 px (Móvil):** [Ver captura `publica-360.png`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/capturas/publica-360.png) — Una sola columna vertical, touch targets de botones de estado ≥ 44×44 px, textos legibles sin scroll horizontal.
- **768 px (Tableta):** [Ver captura `publica-768.png`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/capturas/publica-768.png) — Disposición balanceada de controles de prueba y contenedor de tarjeta centrado.
- **1024 px (Escritorio):** [Ver captura `publica-1024.png`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/capturas/publica-1024.png) — Vista desktop con cabecera fija, navegación completa y ancho de lectura controlado.

### 3.2 Página de Inicio de Sesión (`/login`)
- **360 px (Móvil):** [Ver captura `login-360.png`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/capturas/login-360.png) — Formulario vertical completo, campos con altura mínima de 44 px, botón de envío accesible y legible.
- **768 px (Tableta):** [Ver captura `login-768.png`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/capturas/login-768.png) — Tarjeta de autenticación centrada con márgenes ergonómicos.
- **1024 px (Escritorio):** [Ver captura `login-1024.png`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/capturas/login-1024.png) — Interfaz de login con micro-animaciones, foco visible en inputs y soporte de gestores de contraseñas.

### 3.3 Tablero Kanban Activo (`/tableros/[id]`)
- **360 px (Móvil):** [Ver captura `tablero-360.png`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/capturas/tablero-360.png) — Columnas apilables verticalmente, botones de mover accesibles por teclado sin depender de arrastre táctil, cero scroll horizontal en el viewport principal.
- **768 px (Tableta):** [Ver captura `tablero-768.png`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/capturas/tablero-768.png) — Distribución fluida de columnas con selectores de mover visibles y barra de filtros accesible.
- **1024 px (Escritorio):** [Ver captura `tablero-1024.png`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/capturas/tablero-1024.png) — Tablero Kanban completo con columnas paralelas («Por hacer», «En progreso», «Revisión», «Completado»), Drag & Drop visual fluido, chips de filtro rápido y botón de nueva tarjeta.

---

## 4. Resultados de Auditorías Automatizadas (Axe Core y Validador HTML)

### 4.1 Auditoría Axe Core (WCAG 2.2 Nivel AA)
- **Archivo de Evidencia:** [`calidad/axe-report.json`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/axe-report.json)
- **Total de Violaciones Críticas:** **0**
- **Total de Violaciones Serias:** **0**
- **Reglas Validadas con Éxito (100% Pass):**
  - `button-name`: Todo botón interactivo contiene texto explícito o `aria-label` descriptivo.
  - `link-name`: Todo enlace (`<a>`) posee nombre legible para lectores de pantalla.
  - `label`: Todos los campos `<input>`, `<select>` y `<textarea>` poseen `<label for="...">` asociado.
  - `heading-order`: Jerarquía de encabezados secuencial iniciando con un único `<h1>` por página.
  - `landmark-one-main`: Un solo `<main id="contenido-principal">` sin anidamientos duplicados.
  - `color-contrast`: Ratios de contraste calculados superiores a 4.5:1 en modo claro y modo oscuro.
  - `html-has-lang`: Declaración obligatoria `<html lang="es">`.
  - `target-size`: Objetivos táctiles mínimos de 44×44 px en dispositivos móviles.

### 4.2 Validador W3C HTML5
- **Archivo de Evidencia:** [`calidad/validador-html.json`](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/calidad/validador-html.json)
- **Errores Sintácticos:** **0**
- **Advertencias:** **0**
- **Verificaciones Estrictas:**
  - `<!DOCTYPE html>` estándar.
  - Cero `<div onClick>`: Todos los eventos de clic residen en elementos interactivos nativos (`<button>`, `<a>`).
  - Uso semántico de `<time dateTime="...">`, `<dialog>`, `<fieldset>`, `<legend>`, `<header>`, `<nav>`, `<main>`, `<footer>`.

---

## 5. Lista de Comprobación Manual (Sustentación en Vivo)

Auditada y verificada el **16 de noviembre de 2026**:

| Prueba Manual | Procedimiento de Comprobación | Resultado Obtenido | Estado |
|---|---|---|:---:|
| **Navegación Exclusiva por Teclado** | Desconectar el ratón y presionar `Tab` sucesivamente desde el inicio de la página. | El enlace «Saltar al contenido» aparece al primer `Tab`. El foco recorre el Header, la barra de filtros, los botones de tarjetas y el footer en orden lógico sin trampas de foco. | ✅ Verificado |
| **Foco Visible Inconfundible** | Navegar con teclado sobre botones, inputs, enlaces y selectores. | Todo elemento enfocado exhibe un contorno visible (`outline`) de 2px con color de acento contrastante (`var(--accent-primary)`). Nunca se utiliza `outline: none` sin sustituto. | ✅ Verificado |
| **Atrapado de Foco en `<dialog>`** | Presionar «Detalle» en una tarjeta o «Nuevo Tablero». Presionar `Tab` dentro del modal. | El foco queda estrictamente contenido dentro del `<dialog>`. Al presionar `Escape`, el modal se cierra y el foco regresa al botón que lo abrió. | ✅ Verificado |
| **Movimiento de Tarjeta por Teclado** | En cualquier tarjeta, abrir el selector «Mover a...» y seleccionar otra columna con `Enter`. | La tarjeta cambia de columna al instante sin requerir ratón y `AriaLiveAnnouncer` anuncia verbalmente a tecnologías asistivas: «Tarjeta [nombre] movida a la columna [destino]». | ✅ Verificado |
| **Zoom al 200 % (WCAG 1.4.4)** | Aplicar zoom al 200 % en el navegador (`Ctrl + +`). | Los textos escalan con unidades relativas (`rem` / `clamp()`), las columnas se reorganizan fluidamente y no se produce desplazamiento horizontal en 320 px (Reflow WCAG 1.4.10). | ✅ Verificado |
| **Pasada con Lector de Pantalla** | Probar la aplicación con NVDA (Windows) o VoiceOver. | Se verbaliza correctamente el `lang="es"`, el landmark de contenido principal, los estados de carga y error, y los cambios de columna en tiempo real mediante regiones en vivo con `aria-live="polite"`. | ✅ Verificado |

---

## 6. Retos de Excelencia Seleccionados y Evidencia para Sustentación

En cumplimiento de la **Sección 14.5**, se seleccionaron y justificaron 4 retos de excelencia técnica:

### Reto 1: Presupuesto Estricto y Cero Dependencias UI Voluminosas
- **Justificación:** Se prescindió de frameworks pesados (Bootstrap, Material UI, Tailwind runtime, react-beautiful-dnd de 150 kB).
- **Evidencia:** Todo el diseño fue implementado con **CSS Modules nativos** y la API estándar de **HTML Drag and Drop**.
- **Tamaño transferido:** JavaScript inicial inferior a **112 kB** (presupuesto exigido: ≤ 200 kB).

### Reto 2: Modo Oscuro Ergonómico y Reducción de Movimiento
- **Justificación:** Cumplimiento de WCAG 2.2 para usuarios con fotofobia y trastornos vestibulares.
- **Evidencia:** 
  - Soporte nativo de `prefers-color-scheme: dark` con variables CSS tokens `#0d0e12`, `#14171f`, `#222735` y contrastes de texto superiores a 6.8:1.
  - Regla `@media (prefers-reduced-motion: reduce)` en `globals.css` que desactiva transiciones bruscas y pulsos de esqueleto.

### Reto 3: Alternativa Completa sin Ratón al Arrastrar y Soltar (RF-03 & Criterio 1)
- **Justificación:** La HTML Drag and Drop API es inaccesible para usuarios con movilidad reducida o lectores de pantalla.
- **Evidencia:**
  - Cada tarjeta incluye un selector semántico `<select aria-label="Mover a otra columna">` con las columnas destino disponibles.
  - Al seleccionar una opción, el reductor calcula matemáticamente la posición decimal y actualiza el estado de forma optimista.

### Reto 4: Rutas Interceptadas con Modal y URL Compartible (Sección 6)
- **Justificación:** Modal con sincronización de estado en el historial del navegador.
- **Evidencia:**
  - Implementado mediante App Router Parallel & Intercepted Routes (`@modal/(.)tarjetas/[tarjetaId]`).
  - Al hacer clic en una tarjeta, se abre el modal sobre el tablero Kanban y la URL del navegador se actualiza a `/tableros/[id]/tarjetas/[tarjetaId]`.
  - Si el usuario recarga la página o comparte el enlace, Next.js renderiza la vista completa accesible sin romper el flujo.

---

## 7. Instrucciones para Demostrar las Evidencias en Vivo ante el Docente

Durante la sustentación, el estudiante puede reproducir y comprobar cada una de estas evidencias ejecutando los siguientes comandos en la terminal del proyecto:

1. **Demostración de Verificación Automatizada (Lint, TypeScript y Tests):**
   ```powershell
   npm run check
   ```
   *Resultado esperado:* 0 errores de ESLint, 0 errores de compilación TypeScript y 31/31 pruebas aprobadas en Vitest.

2. **Demostración de Seguridad de IA y Aislamiento:**
   ```powershell
   node ia/verificar-seguridad-ia.mjs
   ```
   *Resultado esperado:* Confirmación de exclusión estricta de variables `.env*` y cumplimiento de reglas de `AGENTS.md`.

3. **Demostración de Generación de Capturas e Informes de Calidad:**
   ```powershell
   node scripts/generar-evidencias-calidad.mjs
   ```
   *Resultado esperado:* Re-generación automática de las 9 capturas PNG en `calidad/capturas/` y de los reportes en `calidad/lighthouse/`.

4. **Demostración Interactiva en Navegador:**
   - Abrir `http://localhost:3000/` y alternar entre los estados de Carga, Vacío, Error y Éxito usando el panel de demostración del Hito 1.
   - Navegar a `http://localhost:3000/tableros`, iniciar sesión, abrir un tablero, mover una tarjeta con el teclado o ratón y abrir su detalle en modal interceptado con URL.
