/**
 * Lighthouse movil y escritorio contra el servidor local que replica los
 * headers reales de `_headers` —CSP, cache de /assets/*, gzip— y monta el mock
 * de /api/waitlist.
 *
 * Es el unico control que QA_RITMO 9.1 dejo sin ejecutar.
 *
 * Se corre dos veces por perfil y se informa la mediana: una sola corrida de
 * Lighthouse en un equipo con otras cosas abiertas varia varios puntos en
 * Performance, y publicar la primera cifra que salga es como escribir el
 * informe con la medicion de un paso anterior (QA_RITMO 9.5).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import lighthouse from "lighthouse";
import { levantar } from "../lib/server.js";
import { abrir } from "../lib/navegador.js";
import { RAIZ_QA } from "../lib/navegador.js";

const CORRIDAS = Number(process.env.CORRIDAS || 2);
const CATEGORIAS = ["performance", "accessibility", "best-practices", "seo"];
const NOMBRES = {
  performance: "Rendimiento",
  accessibility: "Accesibilidad",
  "best-practices": "Buenas prácticas",
  seo: "SEO",
};

function mediana(xs) {
  const o = [...xs].sort((a, b) => a - b);
  return o.length % 2 ? o[(o.length - 1) / 2] : Math.round((o[o.length / 2 - 1] + o[o.length / 2]) / 2);
}

const s = await levantar();
const browser = await abrir();
const puerto = Number(new URL(browser.wsEndpoint().replace("ws:", "http:")).port);

const salida = { url: s.url, corridas: CORRIDAS, perfiles: {} };

for (const perfil of ["mobile", "desktop"]) {
  const puntajes = {};
  const metricas = {};
  const auditoriasFlojas = new Map();

  for (let i = 0; i < CORRIDAS; i++) {
    const { lhr } = await lighthouse(
      s.url + "/",
      { port: puerto, output: "json", logLevel: "error" },
      // Los presets de Lighthouse traen el throttling calibrado; se usan tal
      // cual para que la cifra sea comparable con la de cualquier otra corrida.
      perfil === "mobile"
        ? (await import("lighthouse/core/config/lr-mobile-config.js")).default
        : (await import("lighthouse/core/config/lr-desktop-config.js")).default
    );

    for (const c of CATEGORIAS) {
      (puntajes[c] ||= []).push(Math.round(lhr.categories[c].score * 100));
    }
    for (const m of ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"]) {
      (metricas[m] ||= []).push(lhr.audits[m].numericValue);
    }
    // Todo lo que no saca nota perfecta, para poder corregirlo en vez de
    // conformarse con el numero global.
    for (const a of Object.values(lhr.audits)) {
      if (a.score !== null && a.score < 1 && a.scoreDisplayMode !== "informative") {
        auditoriasFlojas.set(a.id, { titulo: a.title, score: a.score, detalle: a.displayValue || "" });
      }
    }
  }

  salida.perfiles[perfil] = {
    puntajes: Object.fromEntries(CATEGORIAS.map((c) => [c, mediana(puntajes[c])])),
    crudos: puntajes,
    metricas: Object.fromEntries(Object.entries(metricas).map(([k, v]) => [k, Math.round(mediana(v) * 1000) / 1000])),
    flojas: [...auditoriasFlojas.entries()].map(([id, v]) => ({ id, ...v })),
  };

  console.log(`\n── ${perfil} (${CORRIDAS} corridas, mediana) ──`);
  for (const c of CATEGORIAS) {
    console.log(`  ${NOMBRES[c].padEnd(18)} ${String(mediana(puntajes[c])).padStart(3)}   (${puntajes[c].join(", ")})`);
  }
  const m = salida.perfiles[perfil].metricas;
  console.log(`  FCP ${Math.round(m["first-contentful-paint"])} ms · LCP ${Math.round(m["largest-contentful-paint"])} ms · ` +
              `TBT ${Math.round(m["total-blocking-time"])} ms · CLS ${m["cumulative-layout-shift"]} · SI ${Math.round(m["speed-index"])} ms`);
  if (salida.perfiles[perfil].flojas.length) {
    console.log("  auditorías por debajo de 1:");
    for (const f of salida.perfiles[perfil].flojas) console.log(`    · ${f.id} — ${f.titulo} ${f.detalle}`);
  } else {
    console.log("  ninguna auditoría por debajo de 1");
  }
}

await browser.close();
s.servidor.close();

mkdirSync(path.join(RAIZ_QA, "resultados"), { recursive: true });
writeFileSync(path.join(RAIZ_QA, "resultados", "lighthouse.json"), JSON.stringify(salida, null, 2));
console.log("\nresultados/lighthouse.json escrito");
