/**
 * axe-core sobre la matriz, en claro y oscuro, con todos los <details>
 * abiertos: cerrados, el contenido de las respuestas no se audita.
 *
 * Mismas reglas que los informes anteriores para que las cifras se puedan
 * comparar: wcag2a + wcag2aa + wcag21a + wcag21aa + best-practice.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { levantar } from "../lib/server.js";
import { abrir, pagina, MATRIZ, TEMAS } from "../lib/navegador.js";

const require = createRequire(import.meta.url);
/* axe se inyecta como fuente evaluada por CDP y no como <script src>: la CSP
   de la página es `script-src 'self'` y bloquearía la etiqueta. Se evalúa en
   vez de desactivar la CSP con setBypassCSP, para auditar la página tal como
   se sirve. */
const FUENTE_AXE = readFileSync(require.resolve("axe-core"), "utf8");

const ETIQUETAS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"];

const s = await levantar();
const browser = await abrir();

let violacionesTotales = 0;
console.log("Viewport    tema     violaciones  reglas superadas  incompletas");

for (const vp of MATRIZ) {
  for (const tema of TEMAS) {
    const page = await pagina(browser, vp, tema);
    await page.goto(s.url + "/", { waitUntil: "networkidle0" });
    await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
    await page.evaluate(FUENTE_AXE);

    const r = await page.evaluate(async (etiquetas) => {
      const res = await window.axe.run(document, { runOnly: { type: "tag", values: etiquetas } });
      return {
        violaciones: res.violations.map((v) => ({
          id: v.id, impacto: v.impact, nodos: v.nodes.length,
          ejemplo: v.nodes[0] ? v.nodes[0].html.slice(0, 120) : "",
        })),
        pasadas: res.passes.length,
        incompletas: res.incomplete.length,
      };
    }, ETIQUETAS);

    violacionesTotales += r.violaciones.length;
    console.log(
      `${r.violaciones.length ? "FALLA" : "  ok "} ${vp.nombre.padEnd(10)} ${tema.padEnd(7)} ` +
      `${String(r.violaciones.length).padStart(11)}  ${String(r.pasadas).padStart(16)}  ${String(r.incompletas).padStart(11)}`
    );
    for (const v of r.violaciones) console.log(`      · ${v.id} (${v.impacto}, ${v.nodos} nodos) ${v.ejemplo}`);
    await page.close();
  }
}

await browser.close();
s.servidor.close();
console.log(`\naxe-core: ${violacionesTotales} violaciones en ${MATRIZ.length * TEMAS.length} configuraciones`);
process.exitCode = violacionesTotales ? 1 : 0;
