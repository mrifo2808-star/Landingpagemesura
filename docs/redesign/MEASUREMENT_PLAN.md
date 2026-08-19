# Plan de medición

Rediseño «El mes a la vista», 19 de agosto de 2026.

## Por qué no hay analítica instalada

La landing declara que no usa cookies de seguimiento y que no envía datos a
terceros. Instalar Google Analytics, Plausible o PostHog para medir esa misma
página sería contradecirla en la primera línea de código.

Además, la página **no hace ninguna petición a un tercero** (las tipografías son
locales), lo que permitió declarar una CSP estricta en `_headers`. Agregar una
plataforma de analítica obligaría a abrir `script-src` y `connect-src`.

Por eso la instrumentación existe, pero está **desacoplada**: los eventos se
emiten como `CustomEvent` en `document`, sin destino. Conectar una herramienta
es un `addEventListener` y una decisión consciente de alguien — no algo que ya
está ocurriendo sin que nadie lo haya decidido.

## Eventos emitidos hoy

| Evento | Cuándo se dispara | Dónde | Detalle adicional |
|---|---|---|---|
| `hero_demo_started` | Alguien pulsa «Probar con un gasto» | `assets/js/demo.js` | — |
| `demo_expense_added` | Se anota un gasto en la demostración | `assets/js/demo.js` | `categoria` |
| `calculator_completed` | La calculadora entrega un resultado válido | `assets/js/calculator.js` | `nivel` (`bajo-mediana` / `warn` / `high`) |
| `waitlist_started` | Primera pulsación en el campo de correo | `assets/js/landing.js` | — |
| `waitlist_submitted` | El endpoint responde 200 | `assets/js/landing.js` | — |

Ninguno lleva datos personales: ni el correo, ni los montos escritos, ni el
resultado numérico de la calculadora.

## Cómo conectarlos, si algún día se decide

```js
document.addEventListener("mesura:event", function (e) {
  // e.detail = { name: "demo_expense_added", categoria: "super" }
});
```

Antes de hacerlo hay que resolver tres cosas, en este orden:

1. **Qué se le va a decir al visitante.** La sección «Tus datos» afirma que no
   hay cookies de seguimiento. Si se instala analítica, esa línea cambia.
2. **Qué herramienta.** Una que no ponga cookies ni exija banner de consentimiento
   es lo único coherente con el resto de la página.
3. **Qué se abre en la CSP.** Hoy es `default-src 'self'` sin excepciones.

## Preguntas que estos eventos deberían responder

1. ¿Cuánta gente interactúa con el estado del mes? Es la apuesta central del
   rediseño: si nadie anota un gasto de prueba, la hoja no está funcionando como
   demostración y hay que revisar el CTA, no la hoja.
2. ¿La calculadora convierte o solo entretiene? Comparar
   `calculator_completed` → `waitlist_submitted` contra el camino directo.
3. ¿Desde dónde se pide acceso? Hay tres puntos de entrada (hero, resultado de la
   calculadora, sección final). Saber cuál pesa dice qué argumento convence.
4. ¿Dónde se cae el formulario? `waitlist_started` sin `waitlist_submitted`
   distingue «no le interesó» de «algo falló».

## Lo que ya se puede medir sin instrumentar nada

El KV `mesura-waitlist` tiene la fecha de inscripción de cada correo. Antes y
después del rediseño, con el mismo tráfico, esa serie es la única métrica que
realmente importa.
