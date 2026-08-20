/* =========================================================================
   Calculadora de carga financiera.
   Todo el cálculo ocurre en este archivo, en el navegador. No hay fetch, no
   hay almacenamiento, no sale un solo byte del equipo de quien la usa.

   Referencia: mediana de carga financiera de los deudores bancarios en Chile
   = 11,9% del ingreso mensual. CMF, Informe de Endeudamiento, datos a junio
   de 2025 (publicado enero de 2026). Es una referencia estadística sobre
   deudores bancarios, no un diagnóstico ni una recomendación.
   ========================================================================= */
(function () {
  "use strict";

  var form = document.getElementById("calc-form");
  if (!form) return;

  var NUM = new Intl.NumberFormat("es-CL");
  var CLP = new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0
  });

  var CMF_MEDIAN = 11.9;
  var AXIS_MAX = 40;   // escala visual del eje: 0–40% del ingreso

  var income = document.getElementById("calc-income");
  var debt = document.getElementById("calc-debt");
  var incomeError = document.getElementById("calc-income-error");
  var result = document.getElementById("calc-result");
  var pct = document.getElementById("calc-pct");
  var fill = document.getElementById("calc-fill");
  var ref = document.getElementById("calc-ref");
  var text = document.getElementById("calc-text");
  var reset = document.getElementById("calc-reset");

  function parseCLP(value) {
    var digits = String(value == null ? "" : value).replace(/\D/g, "");
    return digits ? parseInt(digits.slice(0, 12), 10) : 0;
  }

  function formatField(input) {
    var caretAtEnd = input.selectionStart === input.value.length;
    var n = parseCLP(input.value);
    input.value = n ? NUM.format(n) : "";
    if (caretAtEnd) {
      try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) { /* noop */ }
    }
  }

  [income, debt].forEach(function (input) {
    input.addEventListener("input", function () {
      formatField(input);
      if (input === income && incomeError.textContent) {
        incomeError.textContent = "";
        income.removeAttribute("aria-invalid");
      }
    });
  });

  function decimal(n) {
    return n.toFixed(1).replace(".", ",");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var inc = parseCLP(income.value);
    var deb = parseCLP(debt.value);

    if (inc <= 0) {
      incomeError.textContent = "Escribe cuánto te llega al mes para poder calcular el porcentaje.";
      income.setAttribute("aria-invalid", "true");
      income.focus();
      result.hidden = true;
      return;
    }
    incomeError.textContent = "";
    income.removeAttribute("aria-invalid");

    /* Se redondea a un decimal ANTES de comparar, para que nunca aparezca
       "11,9%" junto a "estás bajo la referencia de 11,9%". */
    var value = Math.round((deb / inc) * 1000) / 10;
    var label = decimal(value) + "%";
    var level = value < CMF_MEDIAN ? "" : value <= 25 ? "warn" : "high";

    pct.textContent = label;
    if (level) { pct.setAttribute("data-level", level); fill.setAttribute("data-level", level); }
    else { pct.removeAttribute("data-level"); fill.removeAttribute("data-level"); }

    fill.style.width = Math.min(100, (value / AXIS_MAX) * 100).toFixed(1) + "%";
    ref.style.left = ((CMF_MEDIAN / AXIS_MAX) * 100).toFixed(1) + "%";

    var median = decimal(CMF_MEDIAN);
    var body;

    if (deb <= 0) {
      body = "Hoy no destinas nada de tu ingreso a pagar deudas. El resto de tu sueldo — " +
             CLP.format(inc) + " — se reparte entre gastos del mes y lo que alcances a guardar. " +
             "Saber en qué se reparte es justamente lo que hace Mesura.";
    } else if (value > 100) {
      body = "Tus cuotas mensuales (" + CLP.format(deb) + ") superan el ingreso que escribiste (" +
             CLP.format(inc) + "). Revisa las cifras: si son correctas, conviene buscar orientación " +
             "más allá de cualquier app — en Chile, el SERNAC o la institución donde tomaste el " +
             "crédito; fuera de Chile, el organismo que defiende al consumidor en tu país.";
    } else if (value === CMF_MEDIAN) {
      body = "Tu carga financiera coincide con la mediana de " + median + "% de los deudores " +
             "bancarios en Chile. " +
             "El otro " + decimal(100 - value) + "% de tu ingreso es el que se reparte mes a mes " +
             "sin que casi nadie lo mire de cerca.";
    } else if (value < CMF_MEDIAN) {
      body = "Está por debajo de la mediana de " + median + "% de los deudores bancarios en Chile. " +
             "Con ese margen, la pregunta útil ya no son las cuotas: es en qué se va el resto del mes.";
    } else if (value <= 25) {
      body = "Está por sobre la mediana de " + median + "% de los deudores bancarios en Chile. " +
             "No es un veredicto — depende de tu situación —, pero sí significa que te queda menos " +
             "margen para imprevistos, y por lo mismo ver el mes a tiempo pesa más.";
    } else {
      body = "Está bastante por sobre la mediana de " + median + "% de los deudores bancarios en Chile. " +
             "Un registro claro de cuotas y gastos ayuda a ver el mapa completo, aunque una carga así " +
             "suele necesitar más que una app: vale la pena buscar orientación formal.";
    }

    text.textContent = body;
    result.hidden = false;
    reset.hidden = false;

    document.dispatchEvent(new CustomEvent("mesura:event", {
      detail: { name: "calculator_completed", nivel: level || "bajo-mediana" }
    }));
  });

  reset.addEventListener("click", function () {
    income.value = "";
    debt.value = "";
    incomeError.textContent = "";
    income.removeAttribute("aria-invalid");
    result.hidden = true;
    reset.hidden = true;
    income.focus();
  });

  reset.hidden = true;
})();
