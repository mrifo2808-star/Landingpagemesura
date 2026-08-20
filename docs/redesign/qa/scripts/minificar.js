/**
 * Mide cuanto se gana minificando landing.css, y con que riesgo.
 *
 * No escribe nada en la landing: genera las variantes en memoria, las sirve y
 * corre Lighthouse contra cada una. La decision de aplicar o no vive en
 * QA_MEJORAS.md, con estos numeros al lado.
 *
 * Dos variantes:
 *  - "sin comentarios": quita solo los bloques de comentario, respetando
 *    cadenas y url(). Es una transformacion que se puede leer y verificar.
 *  - "minificado": ademas colapsa espacios. Es donde aparecen los bordes
 *    filosos —calc(a + b) no admite que se le quiten los espacios alrededor
 *    del +, y un separador de selector dentro de una cadena no es un
 *    separador— asi que el colapso se hace con un recorrido caracter a
 *    caracter, no con expresiones regulares sobre el texto entero.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import lighthouse from "lighthouse";
import { abrir } from "../lib/navegador.js";
import { RAIZ, levantar } from "../lib/server.js";
import { RAIZ_QA } from "../lib/navegador.js";

const ORIGEN = path.join(RAIZ, "assets/css/landing.css");
const css = readFileSync(ORIGEN, "utf8");

/**
 * Recorre el CSS carácter a carácter llevando la cuenta de si vamos dentro de
 * una cadena, de un url() o de un comentario. Devuelve el texto sin
 * comentarios y, si `colapsar`, con los espacios reducidos al mínimo seguro.
 */
function transformar(fuente, { colapsar = false } = {}) {
  let salida = "";
  let i = 0;
  const n = fuente.length;
  const esEspacio = (c) => c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f";
  // Alrededor de estos el espacio nunca hace falta. `+`, `-`, `*` y `/` NO
  // están: dentro de calc() son operadores que exigen espacio.
  const pegables = new Set(["{", "}", ";", ":", ",", ">", "~"]);

  while (i < n) {
    const c = fuente[i];

    // Comentario /* … */
    if (c === "/" && fuente[i + 1] === "*") {
      const fin = fuente.indexOf("*/", i + 2);
      i = fin < 0 ? n : fin + 2;
      // Un comentario separaba dos tokens: se deja un espacio en su lugar.
      if (!esEspacio(salida[salida.length - 1] || " ")) salida += " ";
      continue;
    }

    // Cadena: se copia entera, con sus escapes.
    if (c === '"' || c === "'") {
      const cierre = c;
      salida += c;
      i++;
      while (i < n) {
        if (fuente[i] === "\\") { salida += fuente.slice(i, i + 2); i += 2; continue; }
        salida += fuente[i];
        if (fuente[i] === cierre) { i++; break; }
        i++;
      }
      continue;
    }

    // url(...) sin comillas: su contenido no se toca.
    if ((c === "u" || c === "U") && /^url\(/i.test(fuente.slice(i, i + 4))) {
      const fin = fuente.indexOf(")", i);
      salida += fuente.slice(i, fin < 0 ? n : fin + 1);
      i = fin < 0 ? n : fin + 1;
      continue;
    }

    if (esEspacio(c)) {
      let j = i;
      while (j < n && esEspacio(fuente[j])) j++;
      if (colapsar) {
        const antes = salida[salida.length - 1];
        const despues = fuente[j];
        // El espacio se borra solo si a algún lado hay un carácter que no lo
        // necesita. En cualquier otro caso —incluido calc(1px + 2px)— queda.
        if (pegables.has(antes) || pegables.has(despues) || antes === undefined || despues === undefined) {
          i = j;
          continue;
        }
        salida += " ";
      } else {
        salida += fuente.slice(i, j);
      }
      i = j;
      continue;
    }

    if (colapsar && pegables.has(c)) {
      // Quita el espacio que ya se hubiera escrito antes del separador.
      while (esEspacio(salida[salida.length - 1])) salida = salida.slice(0, -1);
      salida += c;
      i++;
      // …y el que venga después.
      while (i < n && esEspacio(fuente[i])) i++;
      continue;
    }

    salida += c;
    i++;
  }

  return colapsar ? salida.replace(/;}/g, "}").trim() : salida.replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

const variantes = {
  fuente: css,
  "sin comentarios": transformar(css),
  minificado: transformar(css, { colapsar: true }),
};

const gz = (s) => gzipSync(Buffer.from(s), { level: 9 }).length;

console.log("Variante          crudo    gzip    Δ gzip");
for (const [nombre, texto] of Object.entries(variantes)) {
  console.log(`${nombre.padEnd(16)} ${String(texto.length).padStart(6)}  ${String(gz(texto)).padStart(6)}  ${String(gz(texto) - gz(css)).padStart(7)}`);
}

/* ---- ¿Se nota en Lighthouse? ------------------------------------------- */

// Se reutiliza el servidor del arnés —headers reales, gzip, mock— y solo se
// sustituye el CSS: así la única variable entre corridas es la hoja.
const servir = (cssTexto) => levantar({ sustituir: { "/assets/css/landing.css": cssTexto } });

const browser = await abrir();
const puerto = Number(new URL(browser.wsEndpoint().replace("ws:", "http:")).port);
const cfgMovil = (await import("lighthouse/core/config/lr-mobile-config.js")).default;

const resultados = {};
console.log("\nLighthouse móvil (2 corridas, mediana)");
for (const [nombre, texto] of Object.entries(variantes)) {
  const { servidor, url } = await servir(texto);
  const puntos = [], fcps = [], lcps = [];
  for (let i = 0; i < 2; i++) {
    const { lhr } = await lighthouse(url + "/", { port: puerto, output: "json", logLevel: "error" }, cfgMovil);
    puntos.push(Math.round(lhr.categories.performance.score * 100));
    fcps.push(Math.round(lhr.audits["first-contentful-paint"].numericValue));
    lcps.push(Math.round(lhr.audits["largest-contentful-paint"].numericValue));
  }
  const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
  resultados[nombre] = { crudo: texto.length, gzip: gz(texto), performance: med(puntos), fcp: med(fcps), lcp: med(lcps), corridas: puntos };
  console.log(`  ${nombre.padEnd(16)} Rendimiento ${med(puntos)} (${puntos.join(", ")}) · FCP ${med(fcps)} ms · LCP ${med(lcps)} ms`);
  servidor.close();
}

await browser.close();

mkdirSync(path.join(RAIZ_QA, "resultados"), { recursive: true });
writeFileSync(path.join(RAIZ_QA, "resultados", "minificacion.json"), JSON.stringify(resultados, null, 2));
console.log("\nresultados/minificacion.json escrito");

if (process.argv.includes("--escribir")) {
  const destino = path.join(RAIZ_QA, "resultados", "landing.min.css");
  writeFileSync(destino, variantes.minificado);
  console.log(`variante minificada escrita en ${destino} (NO se instala en la landing)`);
}
