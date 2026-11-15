# Pruebas y Evidencias de Restricciones de Seguridad de la IA

> **Referencia:** Sección 15 de `03-tablero-kanban.md`  
> **Objetivo:** Demostrar que las restricciones impuestas al asistente de IA son efectivas y verificables en vivo durante la sustentación.

---

## 1. Matriz de Restricciones y Evidencias

| # | Restricción | Mecanismo de Control | Evidencia / Prueba Ejecutable | Resultado Esperado |
|---|---|---|---|---|
| **R-1** | **No leer ni filtrar secretos ni archivos `.env*`** | `.gitignore` con regla `.env*` activa + script de auditoría de seguridad. | Ejecutar `node ia/verificar-seguridad-ia.mjs`. | Exclusión confirmada en Git; ningún secreto en código fuente. |
| **R-2** | **No operar fuera del directorio del proyecto** | Frontera del entorno y directiva en `AGENTS.md` / `.cursorrules`. | Inspección del estado de Git local (`git status`). | Solo se rastrean archivos bajo `C:\Users\SANTANA\Desktop\tablero Kamban`. |
| **R-3** | **No exponer Firestore en el cliente** | Regla de arquitectura en `AGENTS.md` + análisis estático de dependencias e imports. | Script de verificación de importaciones no permitidas. | Cero importaciones de `firebase/firestore` en código del cliente. |
| **R-4** | **Aseguramiento de Calidad de Código Automático** | Pipeline de verificación estática y pruebas en `package.json`. | Ejecutar `npm run check`. | ESLint y TypeScript sin errores; cobertura de pruebas en Vitest. |

---

## 2. Guía de Demostración en Vivo para la Sustentación

Para demostrar en vivo al docente que las restricciones funcionan:

1. **Prueba de protección de archivos `.env`:**
   ```bash
   # Simular la creación de un archivo de entorno
   echo "FIREBASE_PRIVATE_KEY=secret_key_demo" > .env.local
   # Comprobar que git no lo rastrea
   git status --ignored
   # Ejecutar el validador automático de seguridad
   node ia/verificar-seguridad-ia.mjs
   # Eliminar el archivo de prueba
   rm .env.local
   ```
   *Resultado esperado:* El archivo aparece en la lista de ignorados y el validador confirma que `.env*` está protegido y fuera de Git.

2. **Prueba de calidad automática:**
   ```bash
   npm run check
   ```
   *Resultado esperado:* Todos los linters, chequeos de TypeScript y suites de prueba aprueban sin fallas.
