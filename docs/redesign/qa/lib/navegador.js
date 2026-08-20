/**
 * Puppeteer contra el Chrome ya instalado en el equipo. No se descarga un
 * navegador aparte: `puppeteer-core` no trae binario y el equipo ya tiene uno.
 * Si tu Chrome esta en otra ruta, exporta CHROME_PATH.
 */
import puppeteer from "puppeteer-core";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));

const CANDIDATOS = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

export function rutaChrome() {
  for (const c of CANDIDATOS) {
    try { readFileSync(c, { flag: "r" }); return c; } catch { /* siguiente */ }
  }
  throw new Error("No se encontró Chrome. Exporta CHROME_PATH con la ruta al ejecutable.");
}

export async function abrir({ headless = true } = {}) {
  return puppeteer.launch({
    executablePath: rutaChrome(),
    headless,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
  });
}

/** La matriz de anchos del encargo, mas los que heredan los informes previos. */
export const MATRIZ = [
  { nombre: "360x800", width: 360, height: 800, isMobile: true },
  { nombre: "390x844", width: 390, height: 844, isMobile: true },
  { nombre: "768x1024", width: 768, height: 1024, isMobile: false },
  { nombre: "1024x768", width: 1024, height: 768, isMobile: false },
  { nombre: "1440x900", width: 1440, height: 900, isMobile: false },
];

export const TEMAS = ["light", "dark"];

/** Abre una pestana ya configurada: viewport, tema y consola registrada. */
export async function pagina(browser, { width, height, isMobile = false }, tema = "light") {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile, hasTouch: isMobile });
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: tema }]);
  const consola = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") consola.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => consola.push(`pageerror: ${e.message}`));
  page.consola = consola;
  return page;
}

/** Los seis destinos de ancla que la cabecera y los CTA usan. */
export const ANCLAS = ["#contenido", "#como-funciona", "#calculadora", "#datos", "#preguntas", "#acceso"];

export const RAIZ_QA = path.resolve(AQUI, "..");
