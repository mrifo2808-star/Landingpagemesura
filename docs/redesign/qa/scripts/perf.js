/**
 * Fluidez del scroll (B3 del encargo).
 *
 * Una revision externa con Chrome/CDP reporto repintados en blanco y
 * congelamientos intermitentes al hacer scroll programatico. La landing no
 * tiene animaciones de reveal ni un solo listener de scroll, asi que la
 * hipotesis era que fuera un artefacto de la herramienta de captura. Esto lo
 * comprueba en vez de suponerlo, por tres vias:
 *
 *  1. Traza de DevTools Performance durante un recorrido completo: tareas
 *     largas (>50 ms) y eventos Paint. Si el scroll va por el compositor, no
 *     hay repintado que valga.
 *  2. Intervalos entre cuadros medidos con requestAnimationFrame mientras la
 *     pagina baja sola. Es lo que se percibe: un cuadro de 100 ms es un
 *     tiron, aunque la traza no muestre nada raro.
 *  3. Revision estatica: cuantos listeners de scroll y cuantos @keyframes hay
 *     realmente en el codigo.
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { levantar, RAIZ } from "../lib/server.js";
import { abrir, pagina, MATRIZ, RAIZ_QA } from "../lib/navegador.js";

const s = await levantar();
const browser = await abrir();
const salida = {};

for (const vp of [MATRIZ.find((v) => v.nombre === "390x844"), MATRIZ.find((v) => v.nombre === "1440x900")]) {
  const page = await pagina(browser, vp);
  await page.goto(s.url + "/", { waitUntil: "networkidle0" });

  await page.tracing.start({
    categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "disabled-by-default-devtools.timeline.frame"],
  });

  // Recorrido completo, un tercio de pantalla por paso y esperando el cuadro:
  // es como baja una persona, no un salto instantáneo al final. De paso se
  // registran los intervalos entre cuadros, que es lo que se percibe.
  const cuadros = await page.evaluate(async () => {
    const marcas = [];
    let corriendo = true;
    const tic = (t) => { marcas.push(t); if (corriendo) requestAnimationFrame(tic); };
    requestAnimationFrame(tic);

    const paso = Math.round(window.innerHeight / 3);
    for (let y = 0; y <= document.documentElement.scrollHeight; y += paso) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 100));
    corriendo = false;

    const intervalos = marcas.slice(1).map((t, i) => t - marcas[i]).sort((a, b) => a - b);
    const pct = (p) => intervalos[Math.min(intervalos.length - 1, Math.floor(intervalos.length * p))] || 0;
    return {
      cuadros: marcas.length,
      medianaMs: Math.round(pct(0.5) * 10) / 10,
      p95Ms: Math.round(pct(0.95) * 10) / 10,
      peorMs: Math.round((intervalos[intervalos.length - 1] || 0) * 10) / 10,
      sobre50ms: intervalos.filter((d) => d > 50).length,
    };
  });

  const traza = JSON.parse(Buffer.from(await page.tracing.stop()).toString("utf8"));
  const cuenta = (n) => traza.traceEvents.filter((e) => e.name === n).length;
  const tareas = traza.traceEvents.filter((e) => e.name === "RunTask" && e.dur);
  const largas = tareas.filter((e) => e.dur / 1000 > 50);

  const r = {
    tareas: tareas.length,
    tareasLargas: largas.length,
    peorTareaMs: Math.round(Math.max(0, ...tareas.map((e) => e.dur / 1000)) * 10) / 10,
    // Sin eventos Paint, el scroll lo resolvió el compositor: no hubo repintado
    // del hilo principal, que es justo lo que la revisión externa describía.
    paint: cuenta("Paint"),
    updateLayer: cuenta("UpdateLayer"),
    cuadros,
  };
  salida[vp.nombre] = r;

  console.log(`\n── ${vp.nombre} ──`);
  console.log(`  tareas ${r.tareas} · largas (>50 ms) ${r.tareasLargas} · peor ${r.peorTareaMs} ms`);
  console.log(`  eventos Paint del hilo principal: ${r.paint} · UpdateLayer: ${r.updateLayer}`);
  console.log(`  cuadros ${cuadros.cuadros} · mediana ${cuadros.medianaMs} ms · p95 ${cuadros.p95Ms} ms · peor ${cuadros.peorMs} ms · por sobre 50 ms: ${cuadros.sobre50ms}`);

  await page.close();
}

await browser.close();
s.servidor.close();

// La otra mitad de la hipótesis: si no hay listeners de scroll ni animaciones
// de reveal, no hay nada en el código que pueda congelar el scroll.
const fuentes = ["demo.js", "calculator.js", "landing.js"].map((f) =>
  readFileSync(path.join(RAIZ, "assets/js", f), "utf8"));
const conScroll = fuentes.filter((t) => t.includes('addEventListener("scroll') || t.includes("addEventListener('scroll")).length;
const css = readFileSync(path.join(RAIZ, "assets/css/landing.css"), "utf8");
salida.listenersDeScroll = conScroll;
salida.animacionesCss = (css.match(/@keyframes/g) || []).length;
console.log(`\nlisteners de scroll en el JS: ${conScroll} · @keyframes en el CSS: ${salida.animacionesCss}`);

mkdirSync(path.join(RAIZ_QA, "resultados"), { recursive: true });
writeFileSync(path.join(RAIZ_QA, "resultados", "scroll.json"), JSON.stringify(salida, null, 2));
console.log("\nresultados/scroll.json escrito");

const malo = Object.values(salida).some((r) => r?.tareasLargas > 0 || r?.cuadros?.sobre50ms > 2);
process.exitCode = malo ? 1 : 0;
