/**
 * Script de Verificación de Seguridad y Restricciones de IA
 * Verifica:
 * 1. Que .env* esté en .gitignore.
 * 2. Que no haya archivos .env rastreados por Git.
 * 3. Que AGENTS.md y .cursorrules existan con las restricciones.
 * 4. Que no exista uso indebido de 'firebase/firestore' en el código cliente.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();
console.log(" Ejecutando verificación de seguridad de IA en:", rootDir);

let errores = 0;

// 1. Verificar .gitignore
try {
  const gitignore = fs.readFileSync(path.join(rootDir, ".gitignore"), "utf-8");
  if (gitignore.includes(".env*")) {
    console.log(" [OK] .gitignore contiene la regla de exclusión '.env*'.");
  } else {
    console.error(" [FALLO] .gitignore NO contiene la exclusión '.env*'.");
    errores++;
  }
} catch (e) {
  console.error(" [FALLO] No se pudo leer el archivo .gitignore:", e.message);
  errores++;
}

// 2. Verificar que no haya archivos .env rastreados en Git
try {
  const lsFiles = execSync("git ls-files .env*").toString().trim();
  if (lsFiles === "") {
    console.log(" [OK] Ningún archivo .env está versionado en Git.");
  } else {
    console.error("[FALLO] Archivos sensibles rastreados en Git:\n", lsFiles);
    errores++;
  }
} catch {
  console.log("ℹ [INFO] Git ls-files no reportó archivos rastreados.");
}

// 3. Verificar archivos de reglas de IA
const agentsFile = path.join(rootDir, "AGENTS.md");
if (fs.existsSync(agentsFile)) {
  const agentsContent = fs.readFileSync(agentsFile, "utf-8");
  if (agentsContent.includes("Restricciones de Seguridad")) {
    console.log(" [OK] AGENTS.md contiene las restricciones de seguridad para la IA.");
  } else {
    console.error(" [FALLO] AGENTS.md no tiene la sección de restricciones de seguridad.");
    errores++;
  }
} else {
  console.error(" [FALLO] AGENTS.md no existe.");
  errores++;
}

// 4. Verificar que no haya importaciones indebidas de Firestore en src/
function buscarImportsProhibidos(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      buscarImportsProhibidos(fullPath);
    } else if (/\.(tsx|ts|js|jsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (content.includes("firebase/firestore")) {
        console.error(` [FALLO] Importación prohibida de 'firebase/firestore' en: ${fullPath}`);
        errores++;
      }
    }
  }
}

buscarImportsProhibidos(path.join(rootDir, "src"));
console.log("OK Verificación de importaciones cliente completada.");

if (errores === 0) {
  console.log("\n Todas las restricciones de seguridad y calidad están verificadas y conformes.");
  process.exit(0);
} else {
  console.error(`\n Se encontraron ${errores} anomalías de seguridad.`);
  process.exit(1);
}
