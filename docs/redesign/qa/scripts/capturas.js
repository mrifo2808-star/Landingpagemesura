/**
 * Capturas antes/despues del arreglo de anclas.
 *
 * "Antes" no es una carpeta vieja: es la hoja de estilos de `main` servida por
 * el mismo servidor, con el mismo HTML y el mismo navegador. Lo unico que
 * cambia entre las dos tandas es landing.css, asi que la diferencia que se ve
 * es la del cambio y nada mas.
 *
 * Dos precauciones que vienen de QA_RITMO 11.4, donde siete capturas salieron
 * de una seccion equivocada:
 *  - `scroll-behavior: smooth` se desactiva; si no, el disparo sale a medio
 *    camino de la animacion.
 *  - antes de disparar se comprueba que el ancla quedo dentro del viewport, y
 *    el script avisa si no lo logra.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { levantar, RAIZ } from "../lib/server.js";
import { abrir, pagina } from "../lib/navegador.js";

const DESTINO = path.join(RAIZ, "docs/redesign/screenshots/mejoras-2026-08-20");
mkdirSync(DESTINO, { recursive: true });

// La hoja de `main`, tal cual, sin tocar el árbol de trabajo.
const cssMain = execFileSync("git", ["show", "main:assets/css/landing.css"], {
  cwd: RAIZ, encoding: "utf8", maxBuffer: 10 * 1024 * 1024,
});

const VISTAS = [
  { vp: { nombre: "390x844", width: 390, height: 844, isMobile: true }, temas: ["light", "dark"] },
  { vp: { nombre: "1440x900", width: 1440, height: 900 }, temas: ["light", "dark"] },
];
const ANCLAS = ["#acceso", "#como-funciona", "#preguntas"];

const browser = await abrir();
const avisos = [];
const informe = [];
/* Cuando el "después" sale byte a byte igual al "antes", no se escribe el
   archivo: doce PNG duplicados no son evidencia, son ruido. Que un par salga
   idéntico ES el resultado —significa que el cambio no movió nada a la vista— y
   queda anotado en medidas.json. */
const antes = new Map();

for (const tanda of ["antes", "despues"]) {
  const s = await levantar(tanda === "antes" ? { sustituir: { "/assets/css/landing.css": cssMain } } : {});

  for (const { vp, temas } of VISTAS) {
    for (const tema of temas) {
      const page = await pagina(browser, vp, tema);
      await page.goto(s.url + "/", { waitUntil: "networkidle0" });
      await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });

      for (const ancla of ANCLAS) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.evaluate((a) => { window.location.hash = ""; window.location.hash = a; }, ancla);
        await new Promise((r) => setTimeout(r, 150));

        const estado = await page.evaluate((a) => {
          const d = document.querySelector(a);
          const barra = document.querySelector(".masthead").getBoundingClientRect();
          const t = d.querySelector("h1, h2, h3") || d.closest("section, main").querySelector("h1, h2, h3");
          const c = t.getBoundingClientRect();
          return {
            enViewport: c.top >= 0 && c.top < window.innerHeight,
            holgura: Math.round(c.top - barra.bottom),
            titulo: t.textContent.trim().replace(/\s+/g, " ").slice(0, 50),
          };
        }, ancla);

        if (!estado.enViewport) avisos.push(`${tanda} ${vp.nombre} ${tema} ${ancla}: el título quedó fuera del viewport`);

        const clave = `${vp.nombre}-${tema}-${ancla.slice(1)}`;
        const nombre = `${tanda}-${clave}.png`;
        const imagen = Buffer.from(await page.screenshot());

        const igualAlAntes = tanda === "despues" && antes.get(clave)?.equals(imagen);
        if (tanda === "antes") antes.set(clave, imagen);
        if (!igualAlAntes) writeFileSync(path.join(DESTINO, nombre), imagen);

        informe.push({
          tanda, viewport: vp.nombre, tema, ancla,
          holgura: estado.holgura, titulo: estado.titulo,
          archivo: igualAlAntes ? null : nombre,
          identicaAlAntes: igualAlAntes || undefined,
        });
        console.log(
          `  ${nombre.padEnd(44)} holgura del título bajo la cabecera: ${String(estado.holgura).padStart(4)} px` +
          (igualAlAntes ? "  · idéntica al antes, no se escribe" : "")
        );
      }
      await page.close();
    }
  }
  s.servidor.close();
}

await browser.close();

writeFileSync(path.join(DESTINO, "medidas.json"), JSON.stringify(informe, null, 2));
const escritas = informe.filter((f) => f.archivo).length;
const iguales = informe.filter((f) => f.identicaAlAntes).length;
console.log(
  `\n${informe.length} vistas comparadas · ${escritas} archivos escritos en ` +
  `docs/redesign/screenshots/mejoras-2026-08-20/` +
  (iguales ? `\n${iguales} pares salieron byte a byte idénticos: el cambio no movió nada a la vista.` : "")
);
if (avisos.length) {
  console.log("AVISOS:");
  for (const a of avisos) console.log("  · " + a);
}
process.exitCode = avisos.length ? 1 : 0;
