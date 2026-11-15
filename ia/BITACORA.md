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
