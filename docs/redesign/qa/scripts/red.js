/**
 * Cero peticiones a terceros. Es la promesa mas literal de la pagina —"sin
 * publicidad ni venta de datos"— y la unica que se puede comprobar mirando la
 * pestana Network.
 *
 * Se registra TODA peticion que sale del navegador, incluidas las que dispara
 * el JavaScript despues de cargar, y se compara el origen contra el propio.
 * De paso se listan los headers de seguridad que llegan al documento.
 */
import { levantar } from "../lib/server.js";
import { abrir, pagina } from "../lib/navegador.js";

const s = await levantar();
const propio = new URL(s.url).origin;
const browser = await abrir();
const page = await pagina(browser, { width: 1440, height: 900 });

const peticiones = [];
page.on("request", (r) => peticiones.push({ url: r.url(), tipo: r.resourceType() }));

let cabeceras = {};
page.on("response", (r) => {
  if (r.url() === s.url + "/") cabeceras = r.headers();
});

await page.goto(s.url + "/", { waitUntil: "networkidle0" });
// Se usa la página como la usaría alguien, para que el JS tenga ocasión de
// pedir algo: se abren las preguntas y se recorre entera.
await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
await page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(r));
  }
});
await new Promise((r) => setTimeout(r, 500));

const terceros = peticiones.filter((p) => !p.url.startsWith(propio) && !p.url.startsWith("data:"));

console.log(`Peticiones totales: ${peticiones.length}`);
for (const p of peticiones) console.log(`  ${p.tipo.padEnd(10)} ${p.url.replace(propio, "")}`);
console.log(`\nA terceros: ${terceros.length}`);
for (const p of terceros) console.log(`  ${p.tipo.padEnd(10)} ${p.url}`);

console.log("\nCabeceras de seguridad del documento:");
for (const k of ["content-security-policy", "cross-origin-opener-policy", "x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy"]) {
  console.log(`  ${k}: ${cabeceras[k] ?? "— AUSENTE —"}`);
}

const faltantes = ["content-security-policy", "cross-origin-opener-policy", "x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy"]
  .filter((k) => !cabeceras[k]);

await browser.close();
s.servidor.close();

console.log(`\nRed: ${terceros.length} peticiones a terceros · ${faltantes.length} cabeceras ausentes`);
process.exitCode = terceros.length || faltantes.length ? 1 : 0;
