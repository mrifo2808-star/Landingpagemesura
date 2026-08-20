/* =========================================================================
   Comportamiento general: formulario de lista de espera y plan de medición.
   El contrato con el backend no cambia: POST /api/waitlist con { email,
   website } — mismo endpoint, misma Pages Function, mismo honeypot.
   ========================================================================= */
(function () {
  "use strict";

  /* ---- Plan de medición ------------------------------------------------
     No hay ninguna plataforma de analítica externa cargada, a propósito: la
     página promete que no envía datos a terceros y eso incluye la propia
     landing. Los eventos se emiten como CustomEvent en el documento, de modo
     que conectar una herramienta más adelante sea un solo listener y una
     decisión consciente — no algo que ya está pasando sin avisar.
     Eventos: hero_demo_started · demo_expense_added · calculator_completed
              waitlist_started · waitlist_submitted
     Ver docs/redesign/MEASUREMENT_PLAN.md */
  function track(name, data) {
    document.dispatchEvent(new CustomEvent("mesura:event", {
      detail: Object.assign({ name: name }, data || {})
    }));
  }

  /* ---- Lista de espera -------------------------------------------------- */
  var form = document.getElementById("waitlist-form");
  if (!form) return;

  var email = document.getElementById("waitlist-email");
  var msg = document.getElementById("waitlist-msg");
  var submit = form.querySelector('button[type="submit"]');
  var sending = false;
  var started = false;

  email.addEventListener("input", function () {
    if (!started) { started = true; track("waitlist_started"); }
    if (email.getAttribute("aria-invalid")) {
      email.removeAttribute("aria-invalid");
      msg.textContent = "";
      msg.removeAttribute("data-kind");
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    /* Guardia de doble envío: cubre el doble clic y también el Enter repetido
       mientras la petición sigue en vuelo. */
    if (sending) return;

    var value = email.value.trim();
    if (!value || !email.checkValidity()) {
      email.setAttribute("aria-invalid", "true");
      msg.setAttribute("data-kind", "error");
      msg.textContent = "Ese correo no está completo. Revísalo y vuelve a enviarlo.";
      email.focus();
      return;
    }

    sending = true;
    submit.disabled = true;
    var label = submit.textContent;
    submit.textContent = "Enviando…";
    msg.removeAttribute("data-kind");
    msg.textContent = "";

    var honeypot = form.querySelector('input[name="website"]');

    fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value, website: honeypot ? honeypot.value : "" })
    }).then(function (res) {
      if (!res.ok) throw new Error("waitlist " + res.status);
      return res.json().catch(function () { return {}; });
    }).then(function () {
      form.hidden = true;
      msg.setAttribute("data-kind", "ok");
      msg.textContent = "Listo. Te escribimos apenas se abra un cupo de la beta. " +
                        "Si no llega nada, revisa la carpeta de correo no deseado.";
      msg.focus();
      track("waitlist_submitted");
    }).catch(function () {
      sending = false;
      submit.disabled = false;
      submit.textContent = label;
      msg.setAttribute("data-kind", "error");
      msg.textContent = "No pudimos guardar tu correo — puede ser la conexión. " +
                        "Inténtalo otra vez en un momento; tu correo sigue escrito arriba.";
    });
  });
})();
