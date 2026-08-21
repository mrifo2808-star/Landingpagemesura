/* =========================================================================
   Cuánto de lo que entra ya está comprometido.
   Todo el cálculo ocurre en este archivo, en el navegador. No hay fetch, no
   hay almacenamiento, no sale un solo byte del equipo de quien la usa.

   Formatea con la moneda que el lector eligió en el ejemplo de más arriba
   (assets/js/demo.js): escucha "mesura:moneda-changed" para no quedarse
   fijo en pesos chilenos cuando alguien elige soles. Sin ese evento —si esta
   sección se usara sola, sin demo.js— cae en CLP.
   ========================================================================= */
import { MONEDAS, SIMBOLOS } from "./mesura-datos.js";

var form = document.getElementById("calc-form");
if (form) {
  var moneda = document.documentElement.getAttribute("data-moneda") || "CLP";
  if (!MONEDAS[moneda]) moneda = "CLP";

  document.addEventListener("mesura:moneda-changed", function (ev) {
    moneda = ev.detail && MONEDAS[ev.detail.codigo] ? ev.detail.codigo : "CLP";
    reformatearCampos();
  });

  var income = document.getElementById("calc-income");
  var debt = document.getElementById("calc-debt");
  var incomeError = document.getElementById("calc-income-error");
  var result = document.getElementById("calc-result");
  var pct = document.getElementById("calc-pct");
  var text = document.getElementById("calc-text");
  var reset = document.getElementById("calc-reset");

  function numFmt() { return new Intl.NumberFormat(MONEDAS[moneda].locale); }
  function moneyFmt() {
    var m = MONEDAS[moneda];
    var f = new Intl.NumberFormat(m.locale, { style: "currency", currency: moneda, maximumFractionDigits: m.exp, minimumFractionDigits: m.exp });
    return function (x) { return f.format(x).replace("Bs.S", "Bs."); };
  }

  function parseMonto(value) {
    var digits = String(value == null ? "" : value).replace(/\D/g, "");
    return digits ? parseInt(digits.slice(0, 12), 10) : 0;
  }

  function formatField(input) {
    var caretAtEnd = input.selectionStart === input.value.length;
    var n = parseMonto(input.value);
    input.value = n ? numFmt().format(n) : "";
    if (caretAtEnd) {
      try { input.setSelectionRange(input.value.length, input.value.length); } catch (err) { /* noop */ }
    }
  }

  function reformatearCampos() {
    [income, debt].forEach(function (input) { if (input.value) formatField(input); });
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

  function decimal(n) { return n.toFixed(1).replace(".", ","); }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();

    var inc = parseMonto(income.value);
    var deb = parseMonto(debt.value);

    if (inc <= 0) {
      incomeError.textContent = "Escribe cuánto te llega al mes para poder calcular el porcentaje.";
      income.setAttribute("aria-invalid", "true");
      income.focus();
      result.hidden = true;
      return;
    }
    incomeError.textContent = "";
    income.removeAttribute("aria-invalid");

    var value = Math.round((deb / inc) * 1000) / 10;
    var f = moneyFmt();

    pct.textContent = decimal(value) + "%";
    text.textContent = value > 100
      ? "Tus cuotas (" + f(deb) + ") superan lo que te llega (" + f(inc) + "). Antes de mirar el resto del mes, conviene revisar esas cifras."
      : "Te quedan " + f(inc - deb) + " para todo lo demás.";

    result.hidden = false;
    reset.hidden = false;

    document.dispatchEvent(new CustomEvent("mesura:event", {
      detail: { name: "calculator_completed", moneda: moneda },
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
}
