/**
 * Matriz de viewports: alto de pagina, scroll horizontal y consola limpia, en
 * claro y oscuro.
 *
 * El desborde se mide DOS veces: como lo ve el usuario y con
 * `body { overflow-x }` desactivado. La landing enmascara el desborde a
 * proposito —el honeypot vive en left:-9999px— y sin desactivarlo cualquier
 * regresion de ancho quedaria tapada (QA_RITMO 1.6).
 */
import { levantar } from "../lib/server.js";
import { abrir, pagina, MATRIZ, TEMAS } from "../lib/navegador.js";

const s = await levantar();
const browser = await abrir();

let fallos = 0;
const filas = [];

console.log("Viewport    tema     alto    desborde  desborde sin máscara  consola");
for (const vp of MATRIZ) {
  for (const tema of TEMAS) {
    const page = await pagina(browser, vp, tema);
    await page.goto(s.url + "/", { waitUntil: "networkidle0" });

    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const conMascara = Math.max(0, de.scrollWidth - de.clientWidth);
      const previo = document.body.style.overflowX;
      document.body.style.overflowX = "visible";
      // El honeypot en left:-9999px es desborde legítimo y deliberado: se
      // excluye de la medición sin máscara para no contarlo como regresión.
      const honey = document.querySelector(".honey");
      const visHoney = honey ? honey.style.display : null;
      if (honey) honey.style.display = "none";
      void de.offsetWidth;
      const sinMascara = Math.max(0, de.scrollWidth - de.clientWidth);
      if (honey) honey.style.display = visHoney;
      document.body.style.overflowX = previo;
      return { alto: de.scrollHeight, conMascara, sinMascara };
    });

    const consola = page.consola.length;
    const ok = r.conMascara === 0 && r.sinMascara === 0 && consola === 0;
    if (!ok) fallos++;
    filas.push({ viewport: vp.nombre, tema, ...r, consola });
    console.log(
      `${ok ? "  ok " : "FALLA"} ${vp.nombre.padEnd(10)} ${tema.padEnd(7)} ${String(r.alto).padStart(5)}  ` +
      `${String(r.conMascara).padStart(8)}  ${String(r.sinMascara).padStart(20)}  ${consola}` +
      (consola ? "  → " + page.consola.join(" | ") : "")
    );
    await page.close();
  }
}

await browser.close();
s.servidor.close();
console.log(`\nViewports: ${filas.length - fallos}/${filas.length}`);
process.exitCode = fallos ? 1 : 0;
