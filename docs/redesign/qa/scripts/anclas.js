/**
 * Anclas contra la cabecera fija.
 *
 * Para cada uno de los seis destinos: se navega como lo haria una persona
 * —clic en el enlace real, no scrollTo— y se comprueba que el destino y su
 * primer titulo queden COMPLETOS por debajo del canto inferior del masthead.
 *
 * `scroll-behavior: smooth` se desactiva durante la medicion: si no, la lectura
 * sale a medio camino de la animacion. Es el mismo motivo por el que salieron
 * mal siete capturas en QA_RITMO §11.4.
 */
import { levantar } from "../lib/server.js";
import { abrir, pagina, MATRIZ, TEMAS, ANCLAS } from "../lib/navegador.js";

export async function medirAnclas({ url, browser, vp, tema }) {
  const page = await pagina(browser, vp, tema);
  await page.goto(url + "/", { waitUntil: "networkidle0" });
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });

  const filas = [];
  for (const ancla of ANCLAS) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate((a) => { window.location.hash = ""; window.location.hash = a; }, ancla);
    await new Promise((r) => setTimeout(r, 120));

    filas.push(await page.evaluate((a) => {
      const destino = document.querySelector(a);
      const barra = document.querySelector(".masthead");
      const cajaBarra = barra.getBoundingClientRect();
      const caja = destino.getBoundingClientRect();

      // El titulo que la persona espera ver: el primer encabezado dentro del
      // destino, o el del contenedor si el destino no trae uno propio.
      const titulo = destino.querySelector("h1, h2, h3") ||
                     destino.closest("section, main")?.querySelector("h1, h2, h3");
      const cajaTitulo = titulo ? titulo.getBoundingClientRect() : null;

      return {
        ancla: a,
        altoBarra: Math.round(cajaBarra.height),
        cantoBarra: Math.round(cajaBarra.bottom),
        topDestino: Math.round(caja.top),
        holguraDestino: Math.round(caja.top - cajaBarra.bottom),
        titulo: titulo ? titulo.textContent.trim().replace(/\s+/g, " ").slice(0, 46) : null,
        topTitulo: cajaTitulo ? Math.round(cajaTitulo.top) : null,
        holguraTitulo: cajaTitulo ? Math.round(cajaTitulo.top - cajaBarra.bottom) : null,
        scrollPadding: getComputedStyle(document.documentElement).scrollPaddingTop,
        // Si la pagina ya llego al fondo, el ancla no puede subir mas: no es
        // un fallo del offset sino el limite del documento.
        tocaFondo: Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 1,
      };
    }, ancla));
  }
  const consola = page.consola.slice();
  await page.close();
  return { filas, consola };
}

async function principal() {
  const s = await levantar();
  const browser = await abrir();
  let fallos = 0, total = 0;
  console.log("Ancla                  barra  scroll-pad  top destino  holgura  título                        holgura título");
  for (const vp of MATRIZ) {
    for (const tema of TEMAS) {
      const { filas } = await medirAnclas({ url: s.url, browser, vp, tema });
      console.log(`\n── ${vp.nombre} · ${tema} ──`);
      for (const f of filas) {
        total++;
        // El titulo debe quedar entero bajo la barra. Se toleran los destinos
        // que ya tocan el fondo del documento: ahi no hay scroll que dar.
        const ok = f.holguraTitulo === null || f.holguraTitulo >= 0 || f.tocaFondo;
        if (!ok) fallos++;
        console.log(
          `${ok ? "  ok " : "FALLA"} ${f.ancla.padEnd(15)} ${String(f.altoBarra).padStart(4)}  ` +
          `${f.scrollPadding.padStart(7)}  ${String(f.topDestino).padStart(6)}  ` +
          `${String(f.holguraDestino).padStart(6)}  ${(f.titulo || "—").padEnd(46)} ${String(f.holguraTitulo).padStart(5)}` +
          (f.tocaFondo ? "  (fondo del documento)" : "")
        );
      }
    }
  }
  await browser.close();
  s.servidor.close();
  console.log(`\nAnclas: ${total - fallos}/${total}`);
  process.exitCode = fallos ? 1 : 0;
}

principal();
