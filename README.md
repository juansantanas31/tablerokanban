# 03 · Tablero Kanban con Arrastrar y Soltar

> **Proyecto:** Tablero Kanban atómico, accesible y reactivo.  
> **Estudiante:** SANTANA  
> **Tecnologías:** Next.js 16 (App Router) · React 19 · TypeScript · Firebase Web & Admin SDK · Zod · Vitest

---

## 1. Descripción del Proyecto

Aplicación web de organización de tareas basada en la metodología Kanban con tres columnas principales (*Por hacer*, *En curso*, *Hecho*). Las tarjetas se pueden reordenar e intercambiar de columna tanto visualmente mediante la **API nativa de arrastrar y soltar (Drag & Drop)** como mediante una **alternativa accesible por teclado**, garantizando el cumplimiento riguroso de las pautas de accesibilidad **WCAG 2.2 Nivel AA**.

---

## 2. Arquitectura del Sistema

```text
[ Navegador ]  Next.js 16 (App Router) · React 19 · TypeScript
   │  Firebase Auth (Web SDK en cliente) → cookie de sesión HttpOnly
   │  fetch a la API propia (mismo origen)
   ▼
[ API REST ]  Route Handlers de Next.js (app/api/**)
   │  rutas → servicios → repositorios · validación estricta Zod
   └──────▶ [ Firebase ]  Authentication + Firestore (solo vía Admin SDK)
```

- **Frontera estricta de persistencia:** El navegador **nunca** importa `firebase/firestore`. Todo el acceso a datos se realiza a través de la API en el servidor mediante el Firebase Admin SDK.
- **Reglas de seguridad de Firestore:** `allow read, write: if false;` en [firestore.rules](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/firestore.rules).
- **Posición decimal:** Al mover o reordenar tarjetas, se calcula el punto medio decimal entre tarjetas vecinas sin reescribir toda la columna en base de datos.

---

## 3. Estructura de Carpetas

```text
app/
├── layout.tsx               # Landmarks semánticos, tema y lang="es"
├── loading.tsx · error.tsx · not-found.tsx
├── tableros/page.tsx        # Mis tableros
├── tableros/[id]/page.tsx   # Tablero Kanban interactivo
├── tableros/[id]/tarjetas/[tarjetaId]/page.tsx # Detalle con URL
├── login/page.tsx           # Inicio de sesión accesible
└── api/                     # Route Handlers (API REST por capas)
    ├── auth/sesion/route.ts
    ├── auth/yo/route.ts
    └── tableros/…/route.ts
proxy.ts                     # Redirección amigable a /login si falta la cookie
src/
├── components/              # Componentes accesibles (Tarjeta, Columna, Modal, Filtros)
├── hooks/                   # useLocalStorage con mejora progresiva
├── reducers/                # tableroReducer y cálculo de posición decimal
├── schemas/                 # Esquemas Zod compartidos
├── services/                # Reglas de negocio puras y testeables
├── repositories/            # Acceso a Firestore vía Admin SDK
└── lib/                     # Firebase (admin y client), auth, errores y http
bruno/                       # Colección de solicitudes HTTP (9 archivos .bru)
calidad/                     # Evidencias y auditoría de accesibilidad y CWV
ia/                          # Configuración de IA: bitácora y pruebas de restricciones
tests/                       # Pruebas unitarias y de integración con Vitest
openapi.yaml                 # Documentación formal de la API (OpenAPI 3.0)
```

---

## 4. Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js versión 20 o superior.
- Gestor de paquetes `npm`.

### Comandos Oficiales
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo local
npm run dev

# 3. Ejecutar la suite de pruebas unitarias
npm run test

# 4. Chequeo integral de calidad (Linter + TypeScript + Pruebas)
npm run check
```

### Variables de Entorno (`.env.local` — NUNCA en Git)
```env
# Variables públicas para el cliente (Firebase Web SDK)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy_demo_api_key_publica
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-03-tablero-kanban.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-03-tablero-kanban
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456

# Variables privadas exclusivas del servidor (Firebase Admin SDK)
FIREBASE_PROJECT_ID=demo-03-tablero-kanban
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@demo-03-tablero-kanban.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

---

## 5. Auditoría de Calidad y Restricciones de IA

- **Evidencias de Accesibilidad y Calidad:** Consulte [CALIDAD.md](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/CALIDAD.md).
- **Bitácora de IA:** Consulte [ia/BITACORA.md](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/ia/BITACORA.md).
- **Pruebas de Seguridad y Restricciones de IA:** Consulte [ia/PRUEBAS_RESTRICCIONES.md](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/ia/PRUEBAS_RESTRICCIONES.md).
- **Validador Automático de Seguridad:** Ejecutar `node ia/verificar-seguridad-ia.mjs`.

---

## 6. Lista de Verificación de Seguridad y Entregables

- [x] Primer commit con la configuración de IA del proyecto ([Sección 15](file:///c:/Users/SANTANA/Desktop/tablero%20Kamban/03-tablero-kanban.md#L288-L298)).
- [x] Ningún secreto en Git ni en variables `NEXT_PUBLIC_*` (`.env*` en `.gitignore`).
- [x] Reglas de Firestore: `allow read, write: if false;` en `firestore.rules`.
- [x] Cada ruta privada verifica la sesión y la autorización por objeto (respondiendo 404 ante objetos ajenos).
- [x] Entradas validadas estrictamente con Zod en cliente y servidor.
- [x] Cookie de sesión `HttpOnly`, `SameSite=Lax`, comprobación de `Origin` contra CSRF.
- [x] `proxy.ts` configurado para Next.js 16.
- [x] Especificación `openapi.yaml` y colección Bruno completas.
- [x] Suite de 27 pruebas unitarias y de integración pasando con 100% de éxito.
