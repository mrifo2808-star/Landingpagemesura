/* =========================================================================
   Demo "Estado del mes" — la pieza que explica Mesura usándola.
   Corre entera en el navegador: no llama al backend, no persiste nada, no
   necesita cuenta. Los números son un ejemplo, no datos de nadie.

   También es el controlador de moneda de toda la página: resuelve qué
   moneda mostrar (URL → data-moneda del <html>, que puso
   functions/_middleware.js por país → CLP), la deja en document.documentElement
   y actualiza cada [data-tok] del documento cuando el lector la cambia con el
   selector. assets/js/calculator.js escucha el evento "mesura:moneda-changed"
   para formatear con la misma moneda.
   ========================================================================= */
import { MONEDAS, SIMBOLOS, calcular, resolverMoneda } from "./mesura-datos.js";

document.documentElement.classList.add("js");

var root = document.getElementById("estado-mes");

/* ---- Resolver la moneda inicial ----------------------------------------
   El servidor (functions/_middleware.js) ya puso data-moneda según
   CF-IPCountry antes de que este script corriera; eso evita el parpadeo. Si
   no hay Function delante (desarrollo local sin wrangler), se resuelve con
   el parámetro ?m= de la URL y, si tampoco hay, cae en CLP. */
var url = new URL(window.location.href);
var delServidor = document.documentElement.getAttribute("data-moneda");
var resuelto = delServidor && MONEDAS[delServidor]
  ? { codigo: delServidor, origen: "servidor" }
  : resolverMoneda({ eleccion: url.searchParams.get("m") });

var codigoActual = resuelto.codigo;
var e = calcular(codigoActual);
var state = null;

function seedFromCalculo(calc) {
  return {
    cats: Object.fromEntries(calc.cats.map(function (c) { return [c.clave, c.monto]; })),
    entries: calc.movs.map(function (m) {
      return {
        label: m.titulo,
        meta: m.categoria + " · " + m.nombreDia + " " + m.dia,
        amount: m.monto,
        cat: m.clave,
      };
    }),
  };
}

function clone(seed) {
  return {
    cats: Object.assign({}, seed.cats),
    entries: seed.entries.map(function (x) { return Object.assign({}, x); }),
  };
}

function catById(id) {
  return e.cats.find(function (c) { return c.clave === id; }) || e.cats[0];
}

function totalSpent() {
  return e.cats.reduce(function (sum, c) { return sum + (state.cats[c.clave] || 0); }, 0);
}

/* ---- Elementos ----------------------------------------------------------
   Si estado-mes no existe (no debería pasar en esta página) el resto del
   módulo igual corre, porque fillTokens() actualiza cosas fuera de la hoja
   (sección 01, 02, 09) y el selector de moneda vive fuera de <article>. */
var el = root ? {
  available: document.getElementById("demo-available"),
  availableSub: document.getElementById("demo-available-sub"),
  spent: document.getElementById("demo-spent"),
  verdict: document.getElementById("demo-verdict"),
  fill: document.getElementById("demo-fill"),
  tick: document.getElementById("demo-tick"),
  detail: document.getElementById("demo-detail"),
  entries: document.getElementById("demo-entries"),
  cats: document.getElementById("demo-cats"),
  form: document.getElementById("demo-form"),
  amount: document.getElementById("demo-amount"),
  error: document.getElementById("demo-error"),
  live: document.getElementById("demo-live"),
  reset: document.getElementById("demo-reset"),
} : null;

/* ---- Tokens en toda la página --------------------------------------------
   Un solo punto de configuración: cualquier <span data-tok="clave"> del
   documento —esté dentro de la hoja o en las secciones 01, 02 o 09— se
   actualiza desde aquí. Añadir un token nuevo en el HTML no requiere tocar
   este archivo dos veces. */
function tokensFor(calc) {
  var mon = calc.mon;
  return {
    presupuesto: calc.f(calc.B),
    disponible: calc.f(calc.queda),
    gastado: calc.f(totalSpentFrom(calc)),
    esperado: calc.f(calc.esperado),
    desvio: calc.f(Math.abs(calc.desvio)),
    diario: calc.f(calc.diario),
    dia: String(calc.dia),
    dias: String(calc.DIAS),
    restan: String(calc.RESTAN),
    tolerancia: calc.f(calc.tolerancia),
    mov4_titulo: calc.movs[3].titulo,
    mov4_monto: calc.f(calc.movs[3].monto),
    mitad: calc.f(calc.mitad),
    sesenta: calc.f(calc.sesenta),
    cuarenta: calc.f(calc.cuarenta),
    simbolo: SIMBOLOS[calc.codigo] || "$",
    monedaNombre: mon.nombre,
    // La sección "El ritmo del mes" explica la COMPARACIÓN (ese es su tema),
    // no la división diaria — que ya es el titular de la hoja, arriba.
    fraseRitmo: calc.paceComparison,
  };
}

function totalSpentFrom(calc) {
  return calc.cats.reduce(function (s, c) { return s + c.monto; }, 0);
}

function fillTokens() {
  var toks = tokensFor(e);
  document.querySelectorAll("[data-tok]").forEach(function (node) {
    var key = node.getAttribute("data-tok");
    if (Object.prototype.hasOwnProperty.call(toks, key)) node.textContent = toks[key];
  });
}

/* ---- Render de la hoja interactiva ----------------------------------------
   Misma jerarquía que app/finance-app.tsx en Mesura-app-source (verificado en
   vivo el 21-08-2026, no sólo confiado en un comentario): el titular es la
   división diaria —"$X al día · N días más"—, no el juicio de valor. La
   comparación contra el ritmo esperado baja a detalle, con la redacción real
   de la app ("$X más/menos de lo esperado"), no "vas por delante/por
   debajo" — esa frase ya no vive en Inicio, sólo en el correo semanal. */
function renderFigures() {
  if (!el) return;
  var spent = totalSpent();
  var available = e.B - spent;
  var expected = e.esperado;
  var diff = spent - expected;
  var state_ = diff > e.tolerancia ? "over" : diff < -e.tolerancia ? "under" : "";
  var restan = e.RESTAN;
  // Igual que app/finance-app.tsx: si ya se pasó todo el presupuesto del mes,
  // no tiene sentido dividir lo que queda entre los días que faltan — el
  // titular pasa a decir eso, no una cifra diaria negativa.
  var headline = available < 0
    ? "Ya pasaste tu presupuesto del mes"
    : restan > 0
      ? e.f(Math.floor(available / restan)) + " al día · " + restan + (restan === 1 ? " día más" : " días más")
      : "Hoy es el último día del mes";
  var detail = state_ === "over"
    ? e.f(diff) + " más de lo esperado a esta altura del mes"
    : state_ === "under"
      ? e.f(Math.abs(diff)) + " menos de lo esperado a esta altura del mes"
      : "Justo en lo esperado a esta altura del mes";

  el.available.textContent = e.f(available);
  el.available.classList.toggle("fig-amount--negative", available < 0);
  el.availableSub.textContent = available < 0
    ? "Pasaste el presupuesto de " + e.f(e.B) + " del mes."
    : "De un presupuesto de " + e.f(e.B) + " para el mes.";

  el.spent.textContent = e.f(spent);

  el.verdict.textContent = headline;
  if (state_) el.verdict.setAttribute("data-state", state_); else el.verdict.removeAttribute("data-state");

  var fillPct = Math.max(0, Math.min(100, (spent / e.B) * 100));
  el.fill.style.width = fillPct.toFixed(1) + "%";
  if (state_) el.fill.setAttribute("data-state", state_); else el.fill.removeAttribute("data-state");

  var tickPct = Math.min(100, (expected / e.B) * 100);
  el.tick.style.left = tickPct.toFixed(1) + "%";
  el.detail.textContent = detail;
}

function renderEntries(freshIndex) {
  if (!el) return;
  el.entries.innerHTML = "";
  state.entries.slice(0, 5).forEach(function (entry, i) {
    var li = document.createElement("li");
    if (i === freshIndex) li.setAttribute("data-fresh", "true");

    var label = document.createElement("span");
    label.className = "entries__label";
    label.textContent = entry.label;

    var meta = document.createElement("span");
    meta.className = "entries__meta";
    meta.textContent = entry.meta;

    var amount = document.createElement("span");
    amount.className = "entries__amount";
    amount.textContent = "−" + e.f(entry.amount);

    li.appendChild(label);
    li.appendChild(amount);
    li.appendChild(meta);
    el.entries.appendChild(li);
  });
}

function renderCats() {
  if (!el) return;
  var spent = totalSpent();
  el.cats.innerHTML = "";
  e.cats.forEach(function (c) {
    var value = state.cats[c.clave] || 0;
    var share = spent > 0 ? (value / spent) * 100 : 0;

    var li = document.createElement("li");
    var row = document.createElement("div");
    row.className = "cats__row";

    var name = document.createElement("span");
    name.className = "cats__name";
    var dot = document.createElement("i");
    dot.className = "cats__dot";
    dot.style.background = c.color;
    name.appendChild(dot);
    name.appendChild(document.createTextNode(c.etiqueta));

    var amount = document.createElement("span");
    amount.className = "cats__amount";
    amount.textContent = e.f(value);

    row.appendChild(name);
    row.appendChild(amount);

    var bar = document.createElement("div");
    bar.className = "cats__bar";
    var seg = document.createElement("span");
    seg.style.width = share.toFixed(1) + "%";
    seg.style.background = c.color;
    bar.appendChild(seg);

    li.appendChild(row);
    li.appendChild(bar);
    el.cats.appendChild(li);
  });
}

function renderAll(freshIndex) {
  renderFigures();
  renderEntries(freshIndex);
  renderCats();
  fillTokens();
}

/* ---- Entrada de montos: unidades MAYORES de la moneda elegida ------------
   "150" en soles significa S/150, no 150 céntimos. Se multiplica por
   10**exponente para guardarlo en unidades mínimas, igual que el resto del
   ejemplo. Sin decimales: mismo criterio que la versión anterior en pesos. */
function parseMonto(value) {
  var digits = String(value == null ? "" : value).replace(/\D/g, "");
  var major = digits ? parseInt(digits.slice(0, 12), 10) : 0;
  return major * Math.pow(10, e.mon.exp);
}

function numberFormatter() {
  return new Intl.NumberFormat(e.mon.locale);
}

if (el) {
  el.amount.addEventListener("input", function () {
    var NUM = numberFormatter();
    var digits = el.amount.value.replace(/\D/g, "");
    var n = digits ? parseInt(digits.slice(0, 12), 10) : 0;
    el.amount.value = n ? NUM.format(n) : "";
    if (el.error.textContent) {
      el.error.textContent = "";
      el.amount.removeAttribute("aria-invalid");
    }
  });

  el.form.addEventListener("submit", function (ev) {
    ev.preventDefault();

    var amount = parseMonto(el.amount.value);
    if (amount <= 0) {
      el.error.textContent = "Escribe un monto para anotarlo.";
      el.amount.setAttribute("aria-invalid", "true");
      el.amount.focus();
      return;
    }
    el.error.textContent = "";
    el.amount.removeAttribute("aria-invalid");

    var checked = el.form.querySelector('input[name="demo-cat"]:checked');
    var cat = catById(checked ? checked.value : e.cats[0].clave);

    state.cats[cat.clave] = (state.cats[cat.clave] || 0) + amount;
    state.entries.unshift({
      label: "Gasto de prueba",
      meta: cat.etiqueta + " · hoy",
      amount: amount,
      cat: cat.clave,
    });

    renderAll(0);

    var spent = totalSpent();
    var available = e.B - spent;
    el.live.textContent =
      "Anotado " + e.f(amount) + " en " + cat.etiqueta + ". " +
      "Disponible: " + e.f(available) + ". " + el.verdict.textContent;

    el.amount.value = "";
    el.amount.focus();
    el.reset.hidden = false;

    document.dispatchEvent(new CustomEvent("mesura:event", {
      detail: { name: "demo_expense_added", categoria: cat.clave, moneda: codigoActual },
    }));
  });

  el.reset.addEventListener("click", function () {
    state = clone(seedFromCalculo(e));
    renderAll(-1);
    el.amount.value = "";
    el.error.textContent = "";
    el.amount.removeAttribute("aria-invalid");
    var first = el.form.querySelector('input[name="demo-cat"]');
    if (first) first.checked = true;
    el.reset.hidden = true;
    el.live.textContent = "Volvimos al ejemplo original.";
    el.amount.focus();
  });
}

/* Foco al control: lo que hace el CTA "Probar con un gasto". */
function focusJot() {
  if (!el) return;
  el.amount.focus({ preventScroll: true });
  el.amount.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  document.dispatchEvent(new CustomEvent("mesura:event", { detail: { name: "hero_demo_started" } }));
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

document.querySelectorAll("[data-demo-focus]").forEach(function (btn) {
  btn.hidden = false;
  btn.addEventListener("click", function (ev) {
    ev.preventDefault();
    focusJot();
  });
});

/* ---- Selector de moneda ---------------------------------------------------
   Cambiar el selector recalcula el ejemplo entero, actualiza la URL sin
   recargar (para que un link compartido muestre lo que esa persona vio) y
   avisa a calculator.js. No toca el servidor ni guarda nada del lector. */
var selectorForm = document.getElementById("moneda-form");
var selector = document.getElementById("moneda-select");
var selectorLive = document.getElementById("moneda-live");

function aplicarMoneda(codigo, origen) {
  if (!MONEDAS[codigo]) codigo = "CLP";
  codigoActual = codigo;
  e = calcular(codigo);
  state = clone(seedFromCalculo(e));
  document.documentElement.setAttribute("data-moneda", codigo);
  if (selector) selector.value = codigo;
  renderAll(-1);
  if (el) { el.reset.hidden = true; el.amount.value = ""; }
  // El cambio ya no depende de un clic en "Ver": pasa solo al elegir. Sin
  // este aviso, quien usa lector de pantalla no tendría cómo enterarse de
  // que la página entera acaba de recalcularse.
  if (selectorLive) selectorLive.textContent = "Ejemplo mostrado en " + (MONEDAS[codigo] ? MONEDAS[codigo].nombre : codigo) + ".";

  if (origen === "eleccion" || origen === "manual") {
    var u = new URL(window.location.href);
    u.searchParams.set("m", codigo);
    window.history.replaceState(null, "", u.toString());
  }

  document.dispatchEvent(new CustomEvent("mesura:moneda-changed", { detail: { codigo: codigo } }));
}

if (selector) {
  // OJO: no se hace `selector.value = codigoActual` aquí. Hacerlo era la
  // otra mitad del bug de móvil (ver el comentario largo en "Arranque", más
  // abajo): esta línea corría ANTES que esa sección, así que pisaba la
  // elección nativa del lector todavía más temprano. El valor correcto del
  // <select> se resuelve una sola vez, al final del archivo.
  selector.addEventListener("change", function () {
    aplicarMoneda(selector.value, "manual");
    document.dispatchEvent(new CustomEvent("mesura:event", {
      detail: { name: "moneda_cambiada", moneda: selector.value },
    }));
  });
}
if (selectorForm) {
  // Con JS el cambio ya es instantáneo por el listener de arriba; el envío
  // del formulario (el botón "Ver") sólo hace falta sin JS.
  selectorForm.addEventListener("submit", function (ev) { ev.preventDefault(); });
}

/* ---- Arranque -----------------------------------------------------------
   EL BUG DE MÓVIL (2026-08-21): este módulo depende de otro (mesura-datos.js)
   — dos viajes de red antes de que corra la primera línea, y con eso el HTML
   ya está pintado e interactivo mientras el JS todavía carga. En una conexión
   lenta hay una ventana real en la que el <select> nativo ya responde al
   picker del teléfono pero ningún listener de este archivo existe todavía
   para escucharlo. Si la persona elegía una moneda AHÍ, esta línea —tal como
   estaba— hacía `selector.value = codigoActual` con el valor que resolvió el
   servidor y LE BORRABA LA ELECCIÓN EN SILENCIO: por eso "elijo soles, toco
   Ver, y vuelve a pesos chilenos" — el <select> ya había vuelto a pesos
   chilenos antes de que el dedo llegara al botón. No era un bug del botón:
   el botón sólo hacía visible un valor que este arranque ya había pisado.
   La corrección: si el <select> muestra algo distinto de lo que resolvió el
   servidor, es que la persona ya actuó — se respeta eso en vez de pisarlo. */
if (selector && MONEDAS[selector.value] && selector.value !== codigoActual) {
  aplicarMoneda(selector.value, "manual");
} else {
  state = clone(seedFromCalculo(e));
  renderAll(-1);
  if (selector) selector.value = codigoActual;
}
if (el) el.reset.hidden = true;
if (root) root.setAttribute("data-ready", "true");
