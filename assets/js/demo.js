/* =========================================================================
   Demo "Estado del mes" — la pieza que explica Mesura usándola.
   Corre entera en el navegador: no llama al backend, no persiste nada, no
   necesita cuenta. Los números son un ejemplo, no datos de nadie.
   ========================================================================= */
(function () {
  "use strict";

  var root = document.getElementById("estado-mes");
  if (!root) return;

  var CLP = new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0
  });
  var NUM = new Intl.NumberFormat("es-CL");

  /* El ejemplo: un mes cualquiera, a mitad de camino. El día 18 de 31 hace
     que el "ritmo" tenga algo que decir desde el primer segundo. */
  var REFERENCE = 620000;
  var DAY = 18;
  var DAYS_IN_MONTH = 31;

  var CATEGORIES = [
    { id: "super",      label: "Supermercado", color: "#ff5c00" },
    { id: "transporte", label: "Transporte",   color: "#1f4fd8" },
    { id: "carrete",    label: "Salidas",      color: "#8a5cf6" },
    { id: "casa",       label: "Casa",         color: "#0f9d58" }
  ];

  var SEED = {
    cats: { super: 164900, transporte: 58400, carrete: 74200, casa: 118500 },
    entries: [
      { label: "Feria de la Vega",     meta: "Supermercado · sáb 16", amount: 23400, cat: "super" },
      { label: "Bencina",              meta: "Transporte · vie 15",   amount: 32000, cat: "transporte" },
      { label: "Cumpleaños de la Javi", meta: "Salidas · jue 14",     amount: 18500, cat: "carrete" },
      { label: "Cuenta de la luz",     meta: "Casa · mié 13",         amount: 41200, cat: "casa" }
    ]
  };

  var state = null;

  /* ---- Elementos ------------------------------------------------------- */
  var el = {
    available:  document.getElementById("demo-available"),
    availableSub: document.getElementById("demo-available-sub"),
    spent:      document.getElementById("demo-spent"),
    verdict:    document.getElementById("demo-verdict"),
    fill:       document.getElementById("demo-fill"),
    tick:       document.getElementById("demo-tick"),
    expected:   document.getElementById("demo-expected"),
    entries:    document.getElementById("demo-entries"),
    cats:       document.getElementById("demo-cats"),
    form:       document.getElementById("demo-form"),
    amount:     document.getElementById("demo-amount"),
    error:      document.getElementById("demo-error"),
    live:       document.getElementById("demo-live"),
    reset:      document.getElementById("demo-reset")
  };

  function clone(seed) {
    return {
      cats: Object.assign({}, seed.cats),
      entries: seed.entries.map(function (e) { return Object.assign({}, e); })
    };
  }

  function totalSpent() {
    return CATEGORIES.reduce(function (sum, c) { return sum + (state.cats[c.id] || 0); }, 0);
  }

  function catById(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i];
    return CATEGORIES[0];
  }

  /* ---- Ritmo ------------------------------------------------------------
     El dato no es "cuánto llevas gastado", es "cuánto llevas gastado
     comparado con lo que corresponde al día del mes en que vas". Esa
     diferencia es la única razón por la que alguien mira la app un martes. */
  function pace(spent) {
    var expected = Math.round(REFERENCE * (DAY / DAYS_IN_MONTH));
    var ratio = expected > 0 ? spent / expected : 0;
    var deltaPct = Math.round((ratio - 1) * 100);
    var stateName = deltaPct > 25 ? "way-over" : deltaPct > 4 ? "over" : "";
    var text;
    if (spent > REFERENCE) {
      text = "Ya pasaste el presupuesto del mes.";
    } else if (deltaPct > 4) {
      text = "Vas " + deltaPct + "% por sobre el ritmo del mes.";
    } else if (deltaPct < -4) {
      text = "Vas " + Math.abs(deltaPct) + "% por debajo del ritmo del mes.";
    } else {
      text = "Vas justo en el ritmo del mes.";
    }
    return { expected: expected, deltaPct: deltaPct, state: stateName, text: text };
  }

  /* ---- Render ---------------------------------------------------------- */
  function renderFigures() {
    var spent = totalSpent();
    var available = REFERENCE - spent;
    var p = pace(spent);

    el.available.textContent = CLP.format(available);
    el.available.classList.toggle("fig-amount--negative", available < 0);
    el.availableSub.textContent = available < 0
      ? "Pasaste el presupuesto de " + CLP.format(REFERENCE) + " del mes."
      : "De un presupuesto de " + CLP.format(REFERENCE) + " para el mes.";

    el.spent.textContent = CLP.format(spent);

    el.verdict.textContent = p.text;
    if (p.state) el.verdict.setAttribute("data-state", p.state);
    else el.verdict.removeAttribute("data-state");

    /* El eje va de 0 al monto de referencia; sobre-gasto se satura en 100%
       y se marca por color, no estirando la barra fuera de la caja. */
    var fillPct = Math.max(0, Math.min(100, (spent / REFERENCE) * 100));
    el.fill.style.width = fillPct.toFixed(1) + "%";
    if (p.state) el.fill.setAttribute("data-state", p.state);
    else el.fill.removeAttribute("data-state");

    var tickPct = Math.min(100, (p.expected / REFERENCE) * 100);
    el.tick.style.left = tickPct.toFixed(1) + "%";
    el.expected.textContent = "Esperado al día " + DAY + ": " + CLP.format(p.expected);
  }

  function renderEntries(freshIndex) {
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
      amount.textContent = "−" + CLP.format(entry.amount);

      li.appendChild(label);
      li.appendChild(amount);
      li.appendChild(meta);
      el.entries.appendChild(li);
    });
  }

  function renderCats() {
    var spent = totalSpent();
    el.cats.innerHTML = "";
    CATEGORIES.forEach(function (c) {
      var value = state.cats[c.id] || 0;
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
      name.appendChild(document.createTextNode(c.label));

      var amount = document.createElement("span");
      amount.className = "cats__amount";
      amount.textContent = CLP.format(value);

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
  }

  /* ---- Entrada de montos en CLP ---------------------------------------- */
  function parseCLP(value) {
    var digits = String(value == null ? "" : value).replace(/\D/g, "");
    return digits ? parseInt(digits.slice(0, 8), 10) : 0;
  }

  el.amount.addEventListener("input", function () {
    var n = parseCLP(el.amount.value);
    el.amount.value = n ? NUM.format(n) : "";
    if (el.error.textContent) {
      el.error.textContent = "";
      el.amount.removeAttribute("aria-invalid");
    }
  });

  /* ---- Anotar un gasto -------------------------------------------------- */
  el.form.addEventListener("submit", function (e) {
    e.preventDefault();

    var amount = parseCLP(el.amount.value);
    if (amount <= 0) {
      el.error.textContent = "Escribe un monto para anotarlo.";
      el.amount.setAttribute("aria-invalid", "true");
      el.amount.focus();
      return;
    }
    el.error.textContent = "";
    el.amount.removeAttribute("aria-invalid");

    var checked = el.form.querySelector('input[name="demo-cat"]:checked');
    var cat = catById(checked ? checked.value : CATEGORIES[0].id);

    state.cats[cat.id] = (state.cats[cat.id] || 0) + amount;
    state.entries.unshift({
      label: "Gasto de prueba",
      meta: cat.label + " · hoy",
      amount: amount,
      cat: cat.id
    });

    renderAll(0);

    var spent = totalSpent();
    var available = REFERENCE - spent;
    var p = pace(spent);
    el.live.textContent =
      "Anotado " + CLP.format(amount) + " en " + cat.label + ". " +
      "Disponible: " + CLP.format(available) + ". " + p.text;

    el.amount.value = "";
    el.amount.focus();
    el.reset.hidden = false;

    document.dispatchEvent(new CustomEvent("mesura:event", {
      detail: { name: "demo_expense_added", categoria: cat.id }
    }));
  });

  /* Foco al control: lo que hace el CTA "Probar con un gasto". */
  function focusJot() {
    el.amount.focus({ preventScroll: true });
    el.amount.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    document.dispatchEvent(new CustomEvent("mesura:event", { detail: { name: "hero_demo_started" } }));
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  document.querySelectorAll("[data-demo-focus]").forEach(function (btn) {
    btn.hidden = false;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      focusJot();
    });
  });

  el.reset.addEventListener("click", function () {
    state = clone(SEED);
    renderAll(-1);
    el.amount.value = "";
    el.error.textContent = "";
    el.amount.removeAttribute("aria-invalid");
    /* "Volver al ejemplo original" significa el ejemplo entero: también la
       categoría vuelve a la que estaba marcada al cargar la página. */
    var first = el.form.querySelector('input[name="demo-cat"]');
    if (first) first.checked = true;
    el.reset.hidden = true;
    el.live.textContent = "Ejemplo restablecido a su estado original.";
    el.amount.focus();
  });

  /* ---- Arranque --------------------------------------------------------- */
  state = clone(SEED);
  renderAll(-1);
  el.reset.hidden = true;
  root.setAttribute("data-ready", "true");
})();
