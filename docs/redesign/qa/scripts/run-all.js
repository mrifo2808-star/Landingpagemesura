/**
 * `npm test`. Corre la bateria completa en orden, cada script en su propio
 * proceso, e informa el resultado de cada uno.
 *
 * Lighthouse y las capturas NO entran aqui: el primero tarda varios minutos y
 * el segundo escribe archivos en el repositorio. Se corren aparte con
 * `npm run lighthouse` y `npm run capturas`.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));

const BATERIA = [
  ["waitlist", "Contrato de /api/waitlist contra un KV falso"],
  ["viewports", "Matriz de viewports: alto, desborde y consola"],
  ["anclas", "Los seis destinos de ancla bajo la cabecera fija"],
  ["red", "Cero peticiones a terceros y cabeceras de seguridad"],
  ["axe", "axe-core en la matriz, claro y oscuro"],
  ["funcional", "Demo, calculadora, formulario, teclado, tema"],
  ["perf", "Fluidez del scroll"],
];

const correr = (guion) =>
  new Promise((ok) => {
    const p = spawn(process.execPath, [path.join(AQUI, `${guion}.js`)], { stdio: "inherit" });
    p.on("exit", (codigo) => ok(codigo ?? 1));
  });

const resultados = [];
for (const [guion, titulo] of BATERIA) {
  console.log(`\n${"═".repeat(72)}\n  ${titulo}  (${guion})\n${"═".repeat(72)}`);
  resultados.push([guion, await correr(guion)]);
}

console.log(`\n${"═".repeat(72)}\n  Resumen\n${"═".repeat(72)}`);
for (const [guion, codigo] of resultados) {
  console.log(`  ${codigo === 0 ? "ok   " : "FALLA"} ${guion}`);
}

const fallos = resultados.filter(([, c]) => c !== 0).length;
console.log(`\n${resultados.length - fallos}/${resultados.length} bloques en verde`);
process.exitCode = fallos ? 1 : 0;
