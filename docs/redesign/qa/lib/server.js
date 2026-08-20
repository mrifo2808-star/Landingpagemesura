/**
 * Servidor estatico que replica el comportamiento de Cloudflare Pages sobre la
 * raiz del proyecto: gzip, los headers reales de `_headers` —CSP incluida—, la
 * cache larga de /assets/*, el 301 de /docs/* y el comodin a /index.html.
 *
 * `/api/waitlist` NO va contra el endpoint real: se responde con un mock en
 * memoria. Escribir en el KV de produccion dispara un correo al dueno.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const RAIZ = path.resolve(AQUI, "../../../..");

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

const COMPRIMIBLES = new Set([".html", ".css", ".js", ".json", ".svg", ".txt", ".xml", ".webmanifest"]);

/**
 * Lee `_headers` y devuelve las reglas en el orden del archivo. Pages
 * CONCATENA las reglas que coinciden, no las sobrescribe: el servidor hace lo
 * mismo para que un Cache-Control duplicado se note aca y no en produccion.
 */
export async function leerHeaders(raiz = RAIZ) {
  const texto = await readFile(path.join(raiz, "_headers"), "utf8");
  const reglas = [];
  let actual = null;
  for (const linea of texto.split(/\r?\n/)) {
    const limpia = linea.replace(/\s+$/, "");
    if (!limpia.trim() || limpia.trim().startsWith("#")) continue;
    if (!/^\s/.test(limpia)) {
      actual = { patron: limpia.trim(), headers: [] };
      reglas.push(actual);
      continue;
    }
    const i = limpia.indexOf(":");
    if (i > 0 && actual) actual.headers.push([limpia.slice(0, i).trim(), limpia.slice(i + 1).trim()]);
  }
  return reglas;
}

function coincide(patron, ruta) {
  if (patron === "/*") return true;
  if (patron.endsWith("/*")) return ruta.startsWith(patron.slice(0, -1));
  return patron === ruta;
}

/** Devuelve { servidor, url, peticiones } ya escuchando. */
export async function levantar({ raiz = RAIZ, puerto = 0, mockWaitlist = true, sustituir = {} } = {}) {
  const reglas = await leerHeaders(raiz);
  const peticiones = [];        // registro de lo que vio el servidor
  const correos = new Map();    // KV falso, en memoria

  const servidor = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const ruta = decodeURIComponent(url.pathname);
    peticiones.push({ metodo: req.method, ruta });

    if (mockWaitlist && ruta === "/api/waitlist") return mock(req, res, correos);

    // El 301 de /docs/* de _redirects: la documentacion interna no se sirve.
    if (ruta.startsWith("/docs/")) {
      res.writeHead(301, { Location: "/" });
      return res.end();
    }

    let archivo = path.join(raiz, ruta === "/" ? "index.html" : ruta.replace(/^\/+/, ""));
    let info = await stat(archivo).catch(() => null);
    if (info?.isDirectory()) {
      archivo = path.join(archivo, "index.html");
      info = await stat(archivo).catch(() => null);
    }
    // Comodin de _redirects: cualquier ruta desconocida entrega la landing.
    if (!info) archivo = path.join(raiz, "index.html");

    const ext = path.extname(archivo).toLowerCase();
    let cuerpo;
    // `sustituir` permite servir otro contenido para una ruta sin tocar el
    // repositorio: lo usa el experimento de minificación de CSS.
    if (Object.prototype.hasOwnProperty.call(sustituir, ruta)) {
      cuerpo = Buffer.from(sustituir[ruta]);
    } else {
      try {
        cuerpo = await readFile(archivo);
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("404");
      }
    }

    const cabeceras = { "Content-Type": TIPOS[ext] || "application/octet-stream" };
    for (const regla of reglas) {
      if (!coincide(regla.patron, ruta)) continue;
      for (const [k, v] of regla.headers) {
        cabeceras[k] = cabeceras[k] ? `${cabeceras[k]}, ${v}` : v; // Pages concatena
      }
    }

    const aceptaGzip = /\bgzip\b/.test(req.headers["accept-encoding"] || "");
    if (aceptaGzip && COMPRIMIBLES.has(ext)) {
      cuerpo = gzipSync(cuerpo);
      cabeceras["Content-Encoding"] = "gzip";
      cabeceras.Vary = "Accept-Encoding";
    }
    cabeceras["Content-Length"] = cuerpo.length;
    res.writeHead(200, cabeceras);
    res.end(req.method === "HEAD" ? undefined : cuerpo);
  });

  await new Promise((ok) => servidor.listen(puerto, "127.0.0.1", ok));
  return { servidor, url: `http://127.0.0.1:${servidor.address().port}`, peticiones, correos };
}

/**
 * Mock de /api/waitlist. Reproduce el contrato real —incluido el
 * endurecimiento de esta rama— sin tocar el KV: 405 con Allow para metodos que
 * no son POST, 415 si el Content-Type no es JSON, 413 si el cuerpo pasa de 1 KB,
 * honeypot silencioso e idempotencia por correo.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function responder(res, datos, estado = 200, extra = {}) {
  const cuerpo = JSON.stringify(datos);
  res.writeHead(estado, { "Content-Type": "application/json", ...extra });
  res.end(cuerpo);
}

function mock(req, res, correos) {
  if (req.method !== "POST") return responder(res, { error: "Método no permitido" }, 405, { Allow: "POST" });

  const tipo = (req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
  if (tipo !== "application/json") return responder(res, { error: "Formato no admitido" }, 415);

  const largo = Number(req.headers["content-length"] || 0);
  if (largo > 1024) return responder(res, { error: "Cuerpo demasiado grande" }, 413);

  let crudo = "";
  req.on("data", (t) => {
    crudo += t;
    if (crudo.length > 1024) { responder(res, { error: "Cuerpo demasiado grande" }, 413); req.destroy(); }
  });
  req.on("end", () => {
    if (res.writableEnded) return;
    let cuerpo;
    try { cuerpo = JSON.parse(crudo); } catch { return responder(res, { error: "Cuerpo inválido" }, 400); }
    if (cuerpo.website) return responder(res, { ok: true });          // honeypot
    const email = String(cuerpo.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) return responder(res, { error: "Correo inválido" }, 400);
    correos.set("email:" + email, { at: new Date().toISOString() });
    responder(res, { ok: true });
  });
}
