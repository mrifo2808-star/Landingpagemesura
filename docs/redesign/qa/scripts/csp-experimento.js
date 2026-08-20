/**
 * Experimento de CSP para decidir si conviene separar
 * `style-src 'self'` + `style-src-attr 'unsafe-inline'`.
 *
 * Sirve la landing con tres politicas y mide si los `style=` del HTML —los
 * anchos de las barras de la demo y de la calculadora— siguen aplicando.
 * El caso "fallback" simula lo que ve un navegador SIN soporte de
 * style-src-attr: la directiva se ignora y manda style-src.
 *
 * No modifica _headers. Solo mide.
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { abrir, pagina } from "../lib/navegador.js";
import { RAIZ } from "../lib/server.js";

const POLITICAS = {
  "hoy — style-src 'self' 'unsafe-inline'":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'",
  "propuesta — style-src 'self' + style-src-attr 'unsafe-inline'":
    "default-src 'self'; script-src 'self'; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'",
  "fallback — motor sin style-src-attr (ignora la directiva)":
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'",
};

const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png" };

function servir(csp) {
  return new Promise((ok) => {
    const s = createServer((req, res) => {
      const ruta = new URL(req.url, "http://x").pathname;
      const archivo = path.join(RAIZ, ruta === "/" ? "index.html" : ruta.slice(1));
      let cuerpo;
      try { cuerpo = readFileSync(archivo); } catch { res.writeHead(404); return res.end(); }
      res.writeHead(200, {
        "Content-Type": TIPOS[path.extname(archivo)] || "application/octet-stream",
        "Content-Security-Policy": csp,
      });
      res.end(cuerpo);
    });
    s.listen(0, "127.0.0.1", () => ok({ s, url: `http://127.0.0.1:${s.address().port}` }));
  });
}

const SIN_JS = process.argv.includes("--sin-js");
const browser = await abrir();
console.log(SIN_JS ? "SIN JavaScript" : "CON JavaScript");
console.log("Política                                                        style= aplica   violaciones CSP");

for (const [nombre, csp] of Object.entries(POLITICAS)) {
  const { s, url } = await servir(csp);
  const page = await pagina(browser, { width: 1440, height: 900 });
  if (SIN_JS) await page.setJavaScriptEnabled(false);
  const violaciones = [];
  page.on("console", (m) => { if (/Content Security Policy/i.test(m.text())) violaciones.push(m.text()); });
  await page.goto(url + "/", { waitUntil: "networkidle0" });

  const r = await page.evaluate(() => {
    // Los `style=` del HTML: si la CSP los bloquea, el ancho cae a 0.
    const barra = document.getElementById("demo-fill");
    const marca = document.getElementById("demo-tick");
    const seg = document.querySelector(".cats__bar > span");
    const ancho = (el) => (el ? el.getBoundingClientRect().width : -1);
    return {
      fill: Math.round(ancho(barra)),
      tick: Math.round(marca ? marca.getBoundingClientRect().left - marca.parentElement.getBoundingClientRect().left : -1),
      seg: Math.round(ancho(seg)),
      color: seg ? getComputedStyle(seg).backgroundColor : "—",
    };
  });

  const aplica = r.fill > 0 && r.tick > 0 && r.seg > 0;
  console.log(
    `${nombre.padEnd(62)} ${(aplica ? "sí" : "NO").padEnd(15)} ${violaciones.length}` +
    `\n    fill ${r.fill}px · tick +${r.tick}px · segmento ${r.seg}px ${r.color}`
  );
  await page.close();
  s.close();
}

await browser.close();
