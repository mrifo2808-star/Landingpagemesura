/**
 * Pruebas funcionales de la demo, la calculadora y el formulario, reconstruidas
 * a partir de la descripcion prueba por prueba de QA_REPORT 3 y QA_RITMO 7.1.
 *
 * El formulario corre SIEMPRE contra el mock de lib/server.js. Nunca contra
 * /api/waitlist de produccion: escribir en el KV dispara un correo al dueno.
 *
 * Las pruebas de [hidden] comprueban `display: none` Y altura cero, no solo el
 * atributo. Comprobar el atributo fue el punto ciego que dejo pasar la
 * regresion de QA_RITMO 11.1.
 */
import { levantar } from "../lib/server.js";
import { abrir, pagina } from "../lib/navegador.js";

const s = await levantar();
const browser = await abrir();

const casos = [];
const prueba = (grupo, nombre, fn) => casos.push({ grupo, nombre, fn });

function afirmar(cond, detalle) {
  if (!cond) throw new Error(detalle || "no se cumplió");
}
const igual = (a, b, nota) => afirmar(a === b, `esperaba ${JSON.stringify(b)}, llegó ${JSON.stringify(a)}${nota ? ` — ${nota}` : ""}`);

/** Estado renderizado de un elemento: lo que ve la persona, no el atributo. */
const visible = (page, sel) =>
  page.evaluate((q) => {
    const e = document.querySelector(q);
    if (!e) return { existe: false };
    const c = getComputedStyle(e);
    const r = e.getBoundingClientRect();
    return { existe: true, display: c.display, alto: Math.round(r.height), visible: c.display !== "none" && r.height > 0 };
  }, sel);

async function conPagina(fn, opciones = {}) {
  const page = await pagina(browser, opciones.viewport || { width: 1440, height: 900 }, opciones.tema || "light");
  if (opciones.sinJs) await page.setJavaScriptEnabled(false);
  // Algunas pruebas provocan un error de red a propósito; ese error SÍ debe
  // llegar a la consola y no cuenta como consola sucia.
  const ruidoEsperado = opciones.ruidoEsperado || [];
  await page.goto(s.url + "/", { waitUntil: "networkidle0" });
  try {
    await fn(page);
    const sucio = page.consola.filter((l) => !ruidoEsperado.some((re) => re.test(l)));
    afirmar(sucio.length === 0, `consola: ${sucio.join(" | ")}`);
  } finally {
    await page.close();
  }
}

const texto = (page, sel) => page.$eval(sel, (e) => e.textContent.trim());

/* ═══════════ Demostración del estado del mes ═══════════ */

prueba("demo", "arranca marcada como lista y con los controles a la vista", () =>
  conPagina(async (page) => {
    igual(await page.$eval("#estado-mes", (e) => e.hasAttribute("data-ready")), true);
    afirmar((await visible(page, ".jot")).visible, "el formulario de anotar gasto debería verse con JS");
  }));

prueba("demo", "sin JavaScript no se pinta ningún control muerto", () =>
  conPagina(async (page) => {
    igual(await page.$eval("#estado-mes", (e) => e.hasAttribute("data-ready")), false);
    const jot = await visible(page, ".jot");
    igual(jot.visible, false, "la .jot no debe verse sin JS");
    // Y la hoja tiene que seguir mostrando sus cifras.
    igual(await texto(page, "#demo-available"), "$156.325");
    // Pasada del 21 de agosto (correcciones tras revisión de Matías): 2 en
    // "01 · Lo compartido" + 5 en "06 · Preguntas" (bajó de 9: se sacaron las
    // preguntas que sólo catalogaban vacíos de la app — "necesito internet",
    // "me sirve el ritmo si..." — la landing deja de ser el lugar donde se
    // enumeran las carencias) + 1 en la calculadora, que volvió ("algo
    // aportaba ese apartado"). "En qué se ha ido" (categorías del ejemplo)
    // se borró del todo, sin acordeón de reemplazo — "se ve molesto y no
    // aporta". Ese mismo día, más tarde, la calculadora pasó a ser el último
    // <details> de "06 · Preguntas" en vez de tener su propia sección: el
    // total sigue en 8, sólo cambió cuál de los cinco bloques la contiene.
    igual((await page.$$("details")).length, 8);
  }, { sinJs: true }));

prueba("demo", "el monto se formatea en CLP mientras se escribe", () =>
  conPagina(async (page) => {
    await page.click("#demo-amount");
    await page.type("#demo-amount", "23400");
    const v = await page.$eval("#demo-amount", (e) => e.value);
    afirmar(/^\$?23\.400$/.test(v), `valor formateado inesperado: ${v}`);
  }));

prueba("demo", "anotar un gasto recalcula saldo y ritmo, y lo inserta arriba", () =>
  conPagina(async (page) => {
    const antes = await texto(page, "#demo-available");
    await page.click("#demo-amount");
    await page.type("#demo-amount", "15000");
    await page.click("#demo-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 120));
    const despues = await texto(page, "#demo-available");
    afirmar(antes !== despues, "el saldo no cambió");
    const num = (t) => Number(t.replace(/[^0-9-]/g, ""));
    igual(num(despues), num(antes) - 15000);
    const primero = await page.$eval("#demo-entries li .entries__amount", (e) => e.textContent);
    afirmar(primero.includes("15.000"), `el movimiento nuevo no quedó primero: ${primero}`);
  }));

prueba("demo", "el aviso de aria-live se actualiza al anotar", () =>
  conPagina(async (page) => {
    igual(await texto(page, "#demo-live"), "");
    await page.click("#demo-amount");
    await page.type("#demo-amount", "9000");
    await page.click("#demo-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 120));
    afirmar((await texto(page, "#demo-live")).length > 0, "#demo-live quedó vacío");
    igual(await page.$eval("#demo-live", (e) => e.getAttribute("aria-live")), "polite");
  }));

prueba("demo", "monto vacío se rechaza con mensaje y aria-invalid", () =>
  conPagina(async (page) => {
    await page.click("#demo-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 80));
    igual(await page.$eval("#demo-amount", (e) => e.getAttribute("aria-invalid")), "true");
    afirmar((await texto(page, "#demo-error")).length > 0, "sin mensaje de error");
  }));

prueba("demo", "restablecer aparece al usar, devuelve todo y se vuelve a ocultar", () =>
  conPagina(async (page) => {
    const inicial = await visible(page, "#demo-reset");
    igual(inicial.display, "none", "restablecer no debería verse al cargar");
    igual(inicial.alto, 0);

    const saldo0 = await texto(page, "#demo-available");
    await page.click("#demo-cat-carrete");
    await page.click("#demo-amount");
    await page.type("#demo-amount", "12000");
    await page.click("#demo-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 120));
    afirmar((await visible(page, "#demo-reset")).visible, "restablecer debería verse tras anotar");

    await page.click("#demo-reset");
    await new Promise((r) => setTimeout(r, 120));
    igual(await texto(page, "#demo-available"), saldo0, "el saldo no volvió al original");
    igual(await page.$eval("#demo-cat-super", (e) => e.checked), true, "la categoría no volvió a la primera");
    igual((await visible(page, "#demo-reset")).display, "none", "restablecer debería volver a ocultarse");
  }));

prueba("demo", "la barra de ritmo se satura al 100% y no desborda", () =>
  conPagina(async (page) => {
    for (let i = 0; i < 6; i++) {
      await page.click("#demo-amount", { clickCount: 3 });
      await page.type("#demo-amount", "150000");
      await page.click("#demo-form button[type=submit]");
      await new Promise((r) => setTimeout(r, 60));
    }
    const r = await page.evaluate(() => {
      const fill = document.getElementById("demo-fill");
      return { pct: fill.style.width, ancho: fill.getBoundingClientRect().width, riel: fill.parentElement.getBoundingClientRect().width };
    });
    // El CSSOM normaliza "100.0%" a "100%": se compara el número, no la cadena.
    igual(parseFloat(r.pct), 100);
    afirmar(r.ancho <= r.riel + 1, `la barra desborda su riel: ${r.ancho} > ${r.riel}`);
  }));

prueba("demo", "el sobregiro se marca en rojo", () =>
  conPagina(async (page) => {
    for (let i = 0; i < 6; i++) {
      await page.click("#demo-amount", { clickCount: 3 });
      await page.type("#demo-amount", "150000");
      await page.click("#demo-form button[type=submit]");
      await new Promise((r) => setTimeout(r, 60));
    }
    // demo.js replica home-context.ts: sólo hay "over" (diff > 500 unidades
    // mínimas), no un segundo umbral — la app real tampoco lo tiene.
    const estado = await page.$eval("#demo-verdict", (e) => e.dataset.state);
    igual(estado, "over");
    // No se clava el hexadecimal: el tono cambia entre claro y oscuro. Lo que
    // la prueba defiende es que sea un naranja/rojizo de aviso, no el tinte
    // por defecto.
    const rgb = await page.$eval("#demo-verdict", (e) =>
      getComputedStyle(e).color.match(/[0-9]+/g).map(Number));
    afirmar(rgb[0] > 150 && rgb[0] > rgb[1] * 2 && rgb[0] > rgb[2] * 2,
      `el veredicto no está en tono de aviso: rgb(${rgb.join(", ")})`);
  }));

/* ═══════════ Selector de moneda — un solo sitio, una sola fuente ═══════════ */

prueba("moneda", "cambiar el selector recalcula la hoja y actualiza la URL", () =>
  conPagina(async (page) => {
    await page.select("#moneda-select", "PEN");
    await new Promise((r) => setTimeout(r, 120));
    igual(await page.$eval("html", (e) => e.getAttribute("data-moneda")), "PEN");
    afirmar((await texto(page, "#demo-available")).startsWith("S/"), "la hoja no cambió a soles");
    afirmar((await texto(page, "#demo-verdict")).startsWith("S/"), "el veredicto no cambió a soles");
    igual(await page.evaluate(() => new URL(location.href).searchParams.get("m")), "PEN");
    // El símbolo del campo de monto del ejemplo tiene que seguir a la misma
    // moneda: es el mismo token, un solo punto de configuración.
    igual(await page.$eval('[data-tok="simbolo"]', (e) => e.textContent), "S/");
  }));

prueba("moneda", "una entrada basura en ?m= no deja la página sin ejemplo", () =>
  conPagina(async (page) => {
    await page.goto(s.url + "/?m=USD", { waitUntil: "networkidle0" });
    igual(await page.$eval("html", (e) => e.getAttribute("data-moneda")), "CLP");
    afirmar((await texto(page, "#demo-available")).startsWith("$"), "no cayó al valor por defecto");
  }));

// Regresión del bug de móvil del 21 de agosto: demo.js depende de otro módulo
// (mesura-datos.js), así que hay una ventana real, más ancha en una conexión
// lenta, entre "el HTML ya pintó y el <select> nativo responde al picker" y
// "demo.js terminó de cargar y enganchó su listener de 'change'". Si alguien
// elegía una moneda AHÍ, el arranque del script pisaba esa elección en
// silencio con el valor que había resuelto el servidor — "elijo soles, toco
// Ver, y vuelve a pesos chilenos", sin que el botón tuviera nada que ver.
// Esta prueba estrangula la red a propósito para abrir esa misma ventana y
// fija el <select> por fuera, antes de que la clase "js" aparezca en <html>
// —la señal de que demo.js ya corrió su primera línea—, tal como lo haría el
// picker nativo de un teléfono sin que ningún listener estuviera escuchando.
prueba("moneda", "una eleccion hecha antes de que demo.js cargue no se pierde", async () => {
  const page = await pagina(browser, { width: 390, height: 844 }, "light");
  try {
    const cliente = await page.target().createCDPSession();
    await cliente.send("Network.enable");
    await cliente.send("Network.emulateNetworkConditions", {
      offline: false, latency: 300,
      downloadThroughput: (60 * 1024) / 8, uploadThroughput: (20 * 1024) / 8,
    });

    const navegacion = page.goto(s.url + "/", { waitUntil: "load" });

    let fijado = false;
    for (let i = 0; i < 200 && !fijado; i++) {
      try {
        const puedeFijar = await page.evaluate(() => {
          var sel = document.getElementById("moneda-select");
          var yaEnganchado = document.documentElement.classList.contains("js");
          if (sel && !yaEnganchado) { sel.value = "PEN"; return true; }
          return false;
        });
        if (puedeFijar) fijado = true;
      } catch (_) { /* el documento todavía no existe — reintenta */ }
      if (!fijado) await new Promise((r) => setTimeout(r, 5));
    }
    afirmar(fijado, "la ventana se cerró antes de poder fijar el <select> — sube el estrangulamiento de red");

    await navegacion;
    await page.waitForSelector("#estado-mes[data-ready]", { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 100));

    igual(await page.$eval("html", (e) => e.getAttribute("data-moneda")), "PEN",
      "el arranque de demo.js pisó la elección hecha antes de que cargara");
    afirmar((await texto(page, "#demo-available")).startsWith("S/"), "la hoja volvió a pesos chilenos");
    igual(await page.evaluate(() => new URL(location.href).searchParams.get("m")), "PEN",
      "la URL no quedó reflejando la elección");
  } finally {
    await page.close();
  }
});

/* ═══════════ Calculadora ═══════════
   Restaurada el 21 de agosto: Matías pidió que volviera tras haberse
   borrado en la pasada de minimalismo real ("algo aportaba ese apartado").
   Se movió al final del FAQ el mismo día, como su último ítem (un estudio
   rápido con lectores nuevos mostró que ponerla justo antes del CTA de
   invitación cortaba el ritmo en vez de ayudarlo). El propio <details>
   lleva el id "calculadora" — ya no hay un contenedor aparte. Hay que
   abrirlo antes de que Puppeteer pueda hacer clic en sus campos, que si no
   cuentan como no visibles. */
const abrirCalculadora = (page) =>
  page.evaluate(() => { document.querySelector("#calculadora").open = true; });

prueba("calculadora", "800.000 / 95.000 da 11,9% y dice cuánto queda", () =>
  conPagina(async (page) => {
    await abrirCalculadora(page);
    await page.click("#calc-income");
    await page.type("#calc-income", "800000");
    await page.click("#calc-debt");
    await page.type("#calc-debt", "95000");
    await page.click("#calc-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 120));
    igual(await texto(page, "#calc-pct"), "11,9%");
    afirmar((await texto(page, "#calc-text")).includes("Te quedan"), "el texto no dice cuánto queda");
    afirmar((await texto(page, "#calc-text")).includes("705.000"), "el resto no cuadra con 800.000 − 95.000");
    igual(await page.$eval("#calc-result", (e) => e.getAttribute("aria-live")), "polite");
  }));

prueba("calculadora", "ingreso en cero da error y no muestra resultado", () =>
  conPagina(async (page) => {
    await abrirCalculadora(page);
    await page.click("#calc-income");
    await page.type("#calc-income", "0");
    await page.click("#calc-debt");
    await page.type("#calc-debt", "95000");
    await page.click("#calc-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 120));
    afirmar((await texto(page, "#calc-income-error")).length > 0, "sin mensaje de error");
    igual((await visible(page, "#calc-result")).visible, false, "el resultado no debería verse");
  }));

prueba("calculadora", "deuda mayor que el ingreso no promete un 'te queda' negativo", () =>
  conPagina(async (page) => {
    await abrirCalculadora(page);
    await page.click("#calc-income");
    await page.type("#calc-income", "400000");
    await page.click("#calc-debt");
    await page.type("#calc-debt", "900000");
    await page.click("#calc-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 120));
    igual(await texto(page, "#calc-pct"), "225,0%");
    afirmar((await texto(page, "#calc-text")).includes("superan"), "no avisa que las cuotas superan el ingreso");
    afirmar(!(await texto(page, "#calc-text")).includes("-$"), "no debería mostrar un 'te queda' negativo");
  }));

prueba("calculadora", "doce dígitos no rompen el formato", () =>
  conPagina(async (page) => {
    await abrirCalculadora(page);
    await page.click("#calc-income");
    await page.type("#calc-income", "999999999999");
    await page.click("#calc-debt");
    await page.type("#calc-debt", "1000");
    await page.click("#calc-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 120));
    afirmar((await texto(page, "#calc-pct")).includes("%"), "el porcentaje se rompió");
  }));

prueba("calculadora", "limpiar oculta el resultado y vacía los campos", () =>
  conPagina(async (page) => {
    await abrirCalculadora(page);
    igual((await visible(page, "#calc-reset")).display, "none", "limpiar no debería verse al cargar");
    await page.click("#calc-income");
    await page.type("#calc-income", "800000");
    await page.click("#calc-debt");
    await page.type("#calc-debt", "95000");
    await page.click("#calc-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 120));
    await page.click("#calc-reset");
    await new Promise((r) => setTimeout(r, 120));
    igual((await visible(page, "#calc-result")).visible, false);
    igual(await page.$eval("#calc-income", (e) => e.value), "");
    igual(await page.$eval("#calc-debt", (e) => e.value), "");
  }));

/* ═══════════ Formulario de lista de espera (contra el mock) ═══════════ */

prueba("formulario", "correo inválido: mensaje, aria-invalid y ninguna petición", () =>
  conPagina(async (page) => {
    const posts = [];
    page.on("request", (r) => { if (r.method() === "POST") posts.push(r.url()); });
    await page.click("#waitlist-email");
    await page.type("#waitlist-email", "no-es-correo");
    await page.click("#waitlist-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 200));
    igual(await page.$eval("#waitlist-email", (e) => e.getAttribute("aria-invalid")), "true");
    afirmar((await texto(page, "#waitlist-msg")).length > 0, "sin mensaje");
    igual(posts.length, 0, "no debería haber salido ninguna petición");
  }));

prueba("formulario", "envío correcto: una sola petición, formulario oculto, foco al mensaje", () =>
  conPagina(async (page) => {
    const posts = [];
    page.on("request", (r) => { if (r.method() === "POST") posts.push(r.url()); });
    await page.click("#waitlist-email");
    await page.type("#waitlist-email", "ana@ejemplo.cl");
    await page.click("#waitlist-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 400));
    igual(posts.length, 1);
    afirmar(posts[0].endsWith("/api/waitlist"), `endpoint inesperado: ${posts[0]}`);
    igual((await visible(page, "#waitlist-form")).visible, false, "el formulario debería ocultarse");
    igual(await page.$eval("#waitlist-msg", (e) => e.dataset.kind), "ok");
    igual(await page.evaluate(() => document.activeElement.id), "waitlist-msg");
  }));

prueba("formulario", "doble clic dispara UNA sola petición", () =>
  conPagina(async (page) => {
    const posts = [];
    page.on("request", (r) => { if (r.method() === "POST") posts.push(r.url()); });
    await page.click("#waitlist-email");
    await page.type("#waitlist-email", "ana@ejemplo.cl");
    const boton = await page.$("#waitlist-form button[type=submit]");
    await boton.click();
    await boton.click().catch(() => {});
    await new Promise((r) => setTimeout(r, 500));
    igual(posts.length, 1, "la guardia de doble envío no funcionó");
  }));

prueba("formulario", "el honeypot viaja vacío y sigue fuera del recorrido de teclado", () =>
  conPagina(async (page) => {
    let cuerpo = null;
    page.on("request", (r) => { if (r.method() === "POST") cuerpo = r.postData(); });
    igual(await page.$eval(".honey", (e) => e.getAttribute("tabindex")), "-1");
    await page.click("#waitlist-email");
    await page.type("#waitlist-email", "ana@ejemplo.cl");
    await page.click("#waitlist-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 400));
    igual(JSON.parse(cuerpo).website, "");
    igual(JSON.parse(cuerpo).email, "ana@ejemplo.cl");
  }));

prueba("formulario", "error de red: mensaje recuperable, botón reactivado y correo conservado", () =>
  conPagina(async (page) => {
    await page.setRequestInterception(true);
    page.on("request", (r) => (r.url().endsWith("/api/waitlist") ? r.abort() : r.continue()));
    await page.click("#waitlist-email");
    await page.type("#waitlist-email", "ana@ejemplo.cl");
    await page.click("#waitlist-form button[type=submit]");
    await new Promise((r) => setTimeout(r, 400));
    igual(await page.$eval("#waitlist-msg", (e) => e.dataset.kind), "error");
    igual(await page.$eval("#waitlist-form button[type=submit]", (e) => e.disabled), false);
    igual(await page.$eval("#waitlist-email", (e) => e.value), "ana@ejemplo.cl");
    igual((await visible(page, "#waitlist-form")).visible, true, "el formulario debe seguir a la vista");
  }, { ruidoEsperado: [/ERR_FAILED/, /Failed to load resource/] }));

/* ═══════════ Teclado, tema y movimiento ═══════════ */

prueba("teclado", "todo el recorrido tiene foco visible", () =>
  conPagina(async (page) => {
    const sinFoco = [];
    let paradas = 0;
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("Tab");
      const r = await page.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body) return null;
        const c = getComputedStyle(e);
        return { id: e.id || e.className || e.tagName, outline: c.outlineWidth, sombra: c.boxShadow };
      });
      if (!r) break;
      paradas++;
      if (r.outline === "0px" && r.sombra === "none") sinFoco.push(r.id);
    }
    afirmar(paradas > 20, `solo ${paradas} paradas de teclado`);
    igual(sinFoco.length, 0, `sin foco visible: ${sinFoco.join(", ")}`);
  }));

prueba("tema", "el modo oscuro pinta el papel oscuro y no rompe nada", () =>
  conPagina(async (page) => {
    igual(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), "rgb(27, 25, 20)");
  }, { tema: "dark" }));

prueba("movimiento", "prefers-reduced-motion apaga las transiciones", () =>
  conPagina(async (page) => {
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    const d = await page.evaluate(() => getComputedStyle(document.querySelector(".btn")).transitionDuration);
    afirmar(parseFloat(d) <= 0.001, `duración de transición: ${d}`);
  }));

/* ═══════════ Arnés ═══════════ */

let ok = 0;
let grupoActual = "";
for (const c of casos) {
  if (c.grupo !== grupoActual) { grupoActual = c.grupo; console.log(`\n── ${grupoActual} ──`); }
  try {
    await c.fn();
    ok++;
    console.log(`  ok    ${c.nombre}`);
  } catch (e) {
    console.log(`  FALLA ${c.nombre}\n        ${e.message}`);
  }
}

await browser.close();
s.servidor.close();
console.log(`\nFuncionales: ${ok}/${casos.length}`);
process.exitCode = ok === casos.length ? 0 : 1;
