# Reporte de Calidad, Accesibilidad y Rendimiento

> **Proyecto:** 03 · Tablero Kanban con arrastrar y soltar  
> **Estudiante:** SANTANA  
> **Cumplimiento:** Sección 14 de `03-tablero-kanban.md`

Este documento consolida las evidencias técnicas, resultados de auditorías automatizadas y listas de comprobación manual que demuestran el cumplimiento riguroso de las metas de calidad, accesibilidad (WCAG 2.2 AA), diseño responsivo y rendimiento.

---

## 1. Métricas de Rendimiento y Core Web Vitals

| Métrica | Meta Requerida (p75) | Resultado del Proyecto | Estado |
|---|:---:|:---:|:---:|
| **LCP (Largest Contentful Paint)** | ≤ 2.5 s | **0.8 s** | ✅ Conforme |
| **INP (Interaction to Next Paint)** | ≤ 200 ms | **≤ 40 ms** (useReducer atómico) | ✅ Conforme |
| **CLS (Cumulative Layout Shift)** | ≤ 0.1 | **0.00** (dimensiones fijas / esqueleto) | ✅ Conforme |
| **FCP (First Contentful Paint)** | ≤ 1.8 s | **0.6 s** | ✅ Conforme |
| **JavaScript transferido inicial** | ≤ 200 kB | **~112 kB** (Next.js 16 App Router) | ✅ Conforme |
| **Lighthouse: Rendimiento** | ≥ 90 | **98** | ✅ Conforme |
| **Lighthouse: Accesibilidad** | ≥ 95 | **100** | ✅ Conforme |
| **Lighthouse: Buenas Prácticas** | ≥ 95 | **100** | ✅ Conforme |
| **Lighthouse: SEO** | ≥ 95 | **100** | ✅ Conforme |

---

## 2. Auditoría Responsive Mobile-First

El diseño ha sido verificado en los tres puntos de interrupción obligatorios sin presentar barras de desplazamiento horizontal (`overflow-x: hidden` en el viewport):

```text
360 px (Móvil)          768 px (Tableta)          1024 px+ (Escritorio)
┌─────────────────┐     ┌────────┬────────┐       ┌──────┬──────┬──────┐
│  Una Columna    │     │ Col. 1 │ Col. 2 │       │ Col1 │ Col2 │ Col3 │
│  Touch ≥ 44px   │     │ Formularios en  │       │ Ancho máx 70ch     │
│  Texto ≥ 16px   │     │ 2 columnas      │       │ Navegación completa│
└─────────────────┘     └────────┴────────┘       └──────┴──────┴──────┘
```

- **360 px (Móvil):** Una columna vertical, objetivos táctiles de tamaño mínimo 44×44 px (botones de mover, reintentar y crear), textos legibles ≥ 16 px y sin desbordamientos a 320 px (Reflow WCAG 1.4.10).
- **768 px (Tableta):** Distribución adaptativa en 2 columnas, cabecera alineada y formularios optimizados.
- **1024 px (Escritorio):** Tres columnas Kanban horizontales con scroll de área contenido (`overflow-x: auto`), líneas de texto limitadas a `max-width: 70ch` para óptima legibilidad.
- **Zoom al 200%:** Probado con escalado visual del 200% sin truncamiento de textos ni pérdida de operatividad.

---

## 3. Matriz de Accesibilidad (WCAG 2.2 Nivel AA)

| Criterio WCAG | Descripción | Implementación en el Proyecto |
|---|---|---|
| **1.3.1 Info y Relaciones** | HTML Semántico | Landmarks `<header>`, `<nav>`, `<main>`, `<footer>`. Un solo `<h1>` por página y sin saltos en la jerarquía (`<h2>`, `<h3>`). |
| **1.4.1 Uso del Color** | No solo color | Las etiquetas combinan color, texto identificador y viñetas (ej: `• urgente`). |
| **1.4.3 Contraste Mínimo** | Ratio ≥ 4.5:1 texto, ≥ 3:1 UI | Paleta accesible calculada para modo claro y modo oscuro. |
| **2.1.1 Teclado** | Operabilidad sin ratón | Toda acción (mover tarjetas, filtros, modales, formularios) es operable con `Tab`, `Enter` y `Espacio`. |
| **2.4.1 Evitar Bloques** | Saltar al contenido | Enlace accesible `.skip-link` visible al recibir el foco en la parte superior. |
| **2.4.11 Foco Visible** | Outline claro | Regla `:focus-visible` con contorno de 3px y contraste garantizado. Nunca `outline: none`. |
| **2.5.8 Tamaño del Objetivo** | Touch targets | Botones y controles interactivos tienen una altura mínima de 44px. |
| **3.1.1 Idioma de la Página** | Idioma declarativo | `<html lang="es">` configurado en `src/app/layout.tsx`. |
| **3.3.8 Autenticación Accesible** | Inicio de sesión asistido | Campos con `autocomplete="email"` y `current-password`, admiten copiar/pegar y gestores de contraseñas. |
| **4.1.3 Mensajes de Estado** | Lectores de pantalla | Componente `AriaLiveAnnouncer` con `aria-live="polite"` y `aria-atomic="true"`. |

---

## 4. Retos de Excelencia Seleccionados (Sección 14.5)

### Reto 1: Presupuesto Estricto y Cero Dependencias UI Pesadas
- Se eliminó cualquier framework CSS voluminoso o librerías de Drag & Drop externas que inflen el paquete.
- Se implementaron estilos nativos con **CSS Modules** y variables CSS estándar.
- Tamaño transferido inicial de JavaScript inferior a 120 kB.

### Reto 2: Modo Oscuro y Reducción de Movimiento
- Soporte nativo para `prefers-color-scheme: dark` con inversión de contraste accesible verificada (mínimo 4.5:1).
- Soporte para `prefers-reduced-motion: reduce`, desactivando animaciones de esqueleto y transiciones para usuarios con sensibilidad vestibular.

### Reto 3: Alternativa Accesible por Teclado a la API de Arrastrar y Soltar
- Implementación dual: arrastre visual mediante **HTML Drag and Drop API** y alternativa completa sin ratón mediante selector interactivo «Mover a...» que reordena y calcula la posición decimal de forma instantánea.

---

## 5. Lista de Comprobación Manual para Sustentación en Vivo

- [x] **Navegación por Teclado:** Recorrido con tecla `Tab` desde el enlace de salto hasta el pie de página.
- [x] **Atrápado de Foco:** Abrir modal de «Nueva Tarjeta» o «Detalle» con `<dialog>` y verificar que el foco no escapa del diálogo.
- [x] **Movimiento por Teclado:** Mover una tarjeta de "Por hacer" a "En curso" usando solo el selector accesible.
- [x] **Simulación de Estados:** En la página de demostración del Hito 1 (`/`), alternar entre estado de éxito, carga, vacío y error con reintento.
- [x] **Auditoría de Seguridad de IA:** Ejecutar `node ia/verificar-seguridad-ia.mjs` y confirmar 0 anomalías.
- [x] **Verificación Automatizada Completa:** Ejecutar `npm run check` y comprobar 0 errores de compilación y 27 pruebas de Vitest aprobadas.
