/**
 * Genera assets/img/apple-touch-icon.png (180x180) a partir de la misma figura
 * del favicon: la M de Mesura sobre el verde acido de la marca.
 *
 * Se rasteriza con el Chrome del equipo —el mismo que ya usa el resto del
 * arnes— para no meter una dependencia de imagen en un proyecto sin build.
 * Los colores salen leidos de landing.css, no copiados a mano: si --acid
 * cambia, basta volver a correr este script.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { abrir } from "../lib/navegador.js";
import { RAIZ } from "../lib/server.js";

const CSS = readFileSync(path.join(RAIZ, "assets/css/landing.css"), "utf8");

/** Lee el primer color hexadecimal declarado para un token de :root. */
function token(nombre) {
  const i = CSS.indexOf(`--${nombre}:`);
  if (i < 0) throw new Error(`No se encontró el token --${nombre} en landing.css`);
  const m = CSS.slice(i, i + 80).match(/#[0-9a-fA-F]{3,8}/);
  if (!m) throw new Error(`--${nombre} no declara un color hexadecimal`);
  return m[0];
}

const acid = token("acid");
const tinta = token("on-acid");

/* Misma geometría que favicon.svg, escalada de la grilla de 64 a 180: iOS
   recorta las esquinas del icono, así que el fondo va a sangre completa y la M
   conserva su margen proporcional. */
const k = 180 / 64;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="${acid}"/>
  <path d="M${12 * k} ${48 * k}V${16 * k}l${20 * k} ${20 * k} ${20 * k}-${20 * k}v${32 * k}"
        fill="none" stroke="${tinta}" stroke-width="${8 * k}"
        stroke-linecap="square" stroke-linejoin="miter"/>
</svg>`;

const browser = await abrir();
const page = await browser.newPage();
await page.setViewport({ width: 180, height: 180, deviceScaleFactor: 1 });
await page.setContent(
  `<style>html,body{margin:0;padding:0;width:180px;height:180px;overflow:hidden}svg{display:block}</style>${svg}`,
  { waitUntil: "load" }
);
const png = await page.screenshot({ type: "png", omitBackground: false });
await browser.close();

const destino = path.join(RAIZ, "assets/img/apple-touch-icon.png");
writeFileSync(destino, png);
console.log(`apple-touch-icon.png · 180x180 · ${png.length} bytes · fondo ${acid} · trazo ${tinta}`);
