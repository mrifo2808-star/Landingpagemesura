# Informe de QA — ritmo vertical y diagramación

19 de agosto de 2026. Rama `claude/landing-layout-rhythm-20260819`, sobre
`main` @ `049ffc1`.

Estado: **implementado y probado en local. No mezclado a `main`. No desplegado.**

Alcance deliberadamente acotado: orden narrativo, ritmo vertical, espaciado,
aprovechamiento del ancho en escritorio, diagramación responsive, alineación y
reducción de desplazamiento innecesario. **No** es un rediseño de marca: la
dirección de arte de `ART_DIRECTION.md` se mantiene íntegra, no se agregó ni se
quitó ninguna afirmación, y ningún texto cambió de significado.

Las pruebas se ejecutaron contra un servidor local que replica el comportamiento
de Cloudflare Pages —gzip, los headers reales de `_headers` con la CSP incluida,
caché diferenciada de `/assets/*` y el 301 de `/docs/*`— con un **mock local de
`/api/waitlist`**. En ningún momento se escribió en el KV de producción ni se
disparó un correo.

---

## 1. Diagnóstico previo, comprobado contra la página real

Todas las mediciones del encargo se confirmaron antes de tocar nada, midiendo
`049ffc1` en Chrome 151.

| Afirmación del encargo | Medido | Veredicto |
|---|---|---|
| Alto de escritorio ≈ 6.510 px | 6.513 px @1366, 6.519 px @1440 | **confirmado** |
| `--step` ≈ 95 px en un viewport de 1.363 px | 1363 × 7 % = 95,4 px | **confirmado** |
| Separaciones de ~190 px entre secciones | 192 px en las siete fronteras internas | **confirmado** |
| Hero ≈ 1.147 px | 1.148 px | **confirmado** |
| «Un mes real» ≈ 1.278 px | 1.279 px | **confirmado** |
| «Beta fundadora» ≈ 618 px, contenido a la izquierda | 619 px; `.beta__intro` ocupaba **42,4 %** del contenedor | **confirmado** |
| «Preguntas» ≈ 607 px, gran zona derecha vacía | 608 px; el acordeón ocupaba **61,3 %** | **confirmado** |
| Contenedor de 1.240 px y cabecera funcionan bien | `.wrap` correcto en los nueve anchos probados | **confirmado — no se alteraron** |

Dato que ordena todo lo demás: **el padding vertical de sección sumaba 1.536 px
de los 6.519 px de la página, un 23,6 % de aire vacío de sección.**

### Hallazgos que el diagnóstico no traía

1. **`--measure: 62ch` era un token muerto**: cero usos en todo el repositorio.
   Eliminado.
2. **`.section__head .lead` era una regla muerta**: ningún `.lead` es hijo de un
   `.section__head`. Eliminada.
3. **Los enlaces de navegación medían 17 px de alto** y `.link-quiet` 20,6 px.
   No llegaban ni al mínimo de 24 px de WCAG 2.5.8, no solo al objetivo de 44.
4. **`.figures` usaba `1.25fr 1fr 1.35fr` sin `minmax(0, …)`.** Como `demo.js`
   acepta montos de ocho dígitos, una columna podía estirarse y aplastar a las
   otras dos.
5. **Cinco textos corrían muy largos**: `.jot__note` a 149 caracteres por línea,
   `.source` a 95, `.qa__body` a 72, `.signup__consent` a 72 y la nota al margen
   de la calculadora a 68.
6. **`body { overflow-x: hidden }` enmascaraba cualquier desborde.** Se comprobó
   desactivándolo: **no hay ningún desborde real** en 320–1440 px. El único
   elemento fuera del viewport es el honeypot en `left: -9999px`, que es
   justamente la razón por la que esa línea debe quedarse. Se conserva, ahora
   con evidencia.

---

## 2. Orden final

| # | Sección | `.tag` | id | Fondo | Cambio |
|---|---|---|---|---|---|
| 0 | Hero + hoja del estado del mes | — | `#estado-mes` | papel | sin cambios |
| 1 | Un mes real | `01` | `#como-funciona` | papel | sin cambios |
| 2 | Entre planificar y cumplir (71 % / 31 %) | `02` | — | banda | sin cambios |
| 3 | Antes de empezar el mes (calculadora) | `03` | `#calculadora` | papel | sin cambios |
| 4 | El trato con tus datos | `04` | `#datos` | banda | sin cambios |
| 5 | Preguntas | `05` *(era 06)* | `#preguntas` | papel *(era banda)* | sube antes del cierre |
| 6 | **Beta fundadora + invitación** | `06` *(era 05)* | `#acceso` sobre `.invite` | banda *(era papel)* | fusión |

**Lo que se corrigió.** La secuencia era `Beta fundadora → FAQ → volver a pedir
acceso`. La sección «Beta fundadora» era la única de la página que despertaba la
intención de pedir acceso **sin ofrecer ningún control**: ni botón, ni enlace, ni
campo. Después venían 78 líneas de preguntas y recién entonces el formulario, que
tenía que volver a enunciar la oferta. Ahora las objeciones se resuelven antes y
el cierre es uno solo.

**El intercambio de banda no es estético, es obligatorio.** Al subir las
preguntas, `#datos` (banda) y `#preguntas` (banda) quedaban contiguas y se
habrían fundido en un solo bloque de `--paper-2` de ~1.400 px. Con el
intercambio la alternancia queda limpia: papel · papel · banda · papel · banda ·
papel · banda.

**El ancla `#acceso` vive en `.invite`, no en la `<section>`.** Los tres CTA de
la página —cabecera, hero y resultado de la calculadora— deben aterrizar en el
campo de correo, no encima del encuadre. Verificado: en 390, 768 y 1440 px el
ancla cae por debajo de la barra fija y el formulario queda visible.

Se conservan el CTA del hero y el de la cabecera, como pedía el encargo.

---

## 3. Sistema de espaciado

Había **31 valores verticales distintos** escritos a mano, más cinco
`style="margin-top:…"` sueltos en el HTML. Ahora hay una escala de once tokens en
`:root`, derivada del ritmo real de la página —el bloque de línea del cuerpo es
17 px × 1,55 = 26,35 px y el de mono 17 px— con base de 4 px.

| Token | Papel | 390 px | 1440 px |
|---|---|---|---|
| `--space-hair` | mínimo, dentro de un mismo objeto | 4 | 4 |
| `--space-tight` | elementos pegados (`dt`→`dd`, etiqueta→campo) | 8 | 8 |
| `--space-near` | elementos relacionados | 12 | 12 |
| `--space-item` | título→bajada, párrafo→párrafo | 16 | 16 |
| `--space-group` | bloques relacionados en una columna | 24 | 24 |
| `--space-block` | encabezado→contenido | 24 | 34 |
| `--space-moment` | fila de registro (`.moment`) | 22 | 32 |
| `--space-hero` | respiro superior del hero | 32 | 52 |
| `--space-after-band` | tras una banda de color | 40 | 63 |
| `--space-band` | inset interno de una banda | 44 | 69 |
| `--space-section` | sección a sección | 48 | 75 |

### El colapso entre secciones

`.section` llevaba `padding-block: var(--step)` arriba **y** abajo, así que entre
dos secciones el hueco era el doble. Ahora la separación vive en un solo lado:

```css
.section        { padding-block: var(--space-section) 0; }
.section--band  { padding-block: var(--space-band);
                  margin-top: var(--space-after-band); }
.section--band + .section:not(.section--band) { padding-top: var(--space-after-band); }
.section--band + .section--band { margin-top: 0; padding-top: 0; }
main > .section:last-child      { padding-bottom: var(--space-section); }
main > .section--band:last-child{ padding-bottom: var(--space-band); }
```

Una sección sin fondo no necesita padding inferior: el superior de la siguiente
ya es la separación. Una banda sí lo lleva en ambos lados, porque ahí el padding
no separa nada: es el margen interior del color. La separación *con lo anterior*
la pone el `margin-top`, que sí es papel — sin él, el canto del color quedaría
pegado al último renglón de la sección previa.

**Se usa el combinador `+` y no `:has()` a propósito.** La hoja no usa `:has()`
en ninguna parte y Firefox quedó sin probar (`QA_REPORT.md` §6); `+` tiene
soporte universal y no introduce deuda de compatibilidad.

### Fronteras entre secciones, antes y después (1440 px)

| Frontera | Antes | Después |
|---|---|---|
| cabecera → hero | 64 | 52 |
| hero → 01 | 192 | 75 |
| 01 → banda 02 | 192 | 63 + 69 de inset |
| banda 02 → 03 | 192 | 69 de inset + 63 |
| 03 → banda 04 | 192 | 63 + 69 |
| banda 04 → 05 preguntas | 192 | 69 + 63 |
| 05 → banda 06 cierre | 192 | 63 + 69 |
| cierre → pie | 128 | 97 |

---

## 4. Diagramación de escritorio

### Preguntas frecuentes

`.qa` estaba clavado en `max-width: 78ch` (729 px reales), de modo que desde
~793 px de viewport en adelante el acordeón se quedaba quieto mientras `.wrap`
crecía hasta 1.240 px: **511 px muertos, el 41 % de la pantalla.**

Ahora el encabezado va en una columna y el acordeón en otra
(`minmax(0, .62fr) minmax(0, 1.38fr)` desde 900 px). Es la misma figura
asimétrica que ya usan `.evidence`, `.calc` y la hoja del hero: texto de
encuadre a un lado, objeto operable al otro. **No** se convirtieron en tarjetas:
siguen siendo `<details>` nativos sobre filetes, que es lo que hace que
funcionen sin JavaScript.

### Beta fundadora + invitación

`.beta__intro` estaba en `max-width: 54ch` (505 px) dentro de una sección de
619 px: **735 px muertos, el 59 % del ancho.**

Ahora el cierre es una sola composición de dos columnas
(`minmax(0, .82fr) minmax(0, 1.18fr)`): el encuadre de la beta —timbre, titular,
bajada y nota al margen— a la izquierda, y el bloque de conversión a la derecha.
`.invite` deja de partirse en dos columnas propias y fluye en vertical, porque
ahora *es* una columna.

**El encuadre se quedó sobre papel a propósito.** Meterlo dentro del bloque
tinta habría obligado a anular tres colores (`--ink-2`, `--muted` y
`--orange-ink` son tokens de papel y sobre `#12110e` dan entre 1,4:1 y 2,6:1) y
habría introducido violaciones de contraste nuevas. Dejándolo fuera, los tokens
siguen valiendo y el timbre rotado conserva su 4,88:1 sobre `--paper-2`, que ya
estaba verificado.

**No se inventó nada.** Ningún texto nuevo, ninguna función, ningún beneficio,
ninguna cifra. Los cuatro elementos del encuadre son los mismos cuatro que había,
en el mismo orden.

### Uso del ancho a 1440 px

| Bloque | Antes | Después |
|---|---|---|
| `.qa-layout` (sección de preguntas) | — | **100 %** |
| `.qa` (el acordeón) | 61,3 % | 66,1 % *(dentro de su columna)* |
| `.closing` (sección de cierre) | — | **100 %** |
| `.beta__intro` | 42,4 % *(de la sección entera)* | 37,7 % *(de una fila de dos columnas)* |
| `.invite` | 100 % | 56,5 % *(columna derecha del cierre)* |
| `.signup` | 42,9 % | 49,8 % |
| `.sheet`, `.moments`, `.evidence`, `.calc`, `.pact`, `.hero__top` | 100 % | 100 % |

### Secciones de dos columnas

- **Filete al contenedor.** `.evidence` y `.calc` tenían el filete de 2 px en una
  sola de sus columnas —`.gap-figure` a la izquierda en una, `.statement` a la
  derecha en la otra—, así que las dos columnas arrancaban en líneas distintas y
  el gesto estaba espejado sin razón. Ahora el filete cruza ambas, como ya hacía
  `.pact`.
- **`.pact` cierra con su propio filete inferior.** Las dos columnas tienen
  distinta cantidad de `<small>`, y la más corta dejaba el divisor vertical
  colgando por debajo de su último renglón.
- **`minmax(0, …)` donde faltaba**: `.figures`, `.sheet__body`, `.pact` y
  `.jot__grid`.
- **Longitudes de lectura**: `.section__head .t-h2` 20ch → 18ch, `.qa__body`
  62ch → 54ch, `.foot__note` 76ch → 64ch, y `max-width` nuevo en `.jot__note`
  (58ch), `.source` (62ch), `.signup__consent` (56ch) y `.marginal` (56ch).

### Breakpoints

De ocho `min-width` distintos —620, 760, 820, 860, 880, 900, 960— a **tres:
640 / 768 / 900**, más `max-width: 719.98px` para la cabecera, que se conserva
como excepción documentada porque `QA_REPORT.md` §2 verificó el comportamiento de
la banda compacta entre 720 y 767 px.

Efecto colateral: `.calc` y `.jot__grid` adelantan su versión de dos y tres
columnas, lo que explica buena parte de la caída de 7.462 a 6.650 px en 768 px.

---

## 5. Diagramación móvil

La versión móvil **no es una reducción literal del escritorio**:

- **El número de cada momento conserva su riel** en vez de apilarse encima del
  título. El riel se estrecha con `clamp(26px, 8vw, 34px)` para no robarle ancho
  de lectura en las pantallas más angostas. Ahorra ~26 px por momento.
- **Se conserva el orden de lectura del DOM.** Se evaluó subir el formulario de
  «anotar gasto» por encima de las dos listas de la hoja con `order`, y **se
  descartó**: el encargo pide explícitamente mantener el orden de lectura en
  móvil, y `order` desacopla el orden visual del orden del lector de pantalla.
  Queda anotado en §9 como propuesta, no aplicado.
- **Sin scroll horizontal en ningún ancho**, comprobado además con el
  enmascarado desactivado.
- `.pace__scale` y `.jotting b` reciben `flex-wrap`: eran flex sin envoltura y a
  320 px se estrechaban por debajo de su contenido.
- Botones y campos siguen cómodos; la barra fija y el salto a anclas funcionan en
  los nueve anchos probados.

**Por qué la reducción es menor en móvil.** Los dos problemas que este trabajo
corrige eran de escritorio: el hueco doble entre secciones valía 192 px a 1440 px
y solo 96 px a 390 px, y las medias pantallas vacías no existen cuando todo está
apilado en una columna. Además, el arreglo de objetivos táctiles —que el encargo
pide— **añade ~90 px en móvil**: la banda de navegación, los enlaces del pie, las
fichas de categoría y «Volver al ejemplo original» pasan de 17–20 px a 44 px. Es
altura que se gana a cambio de que los controles se puedan tocar.

Lo que sí bajó en móvil es lo que importa: la distancia hasta el formulario, de
7.598 px a 7.464 px, y el primer viewport, que ahora muestra el titular, la
bajada, los dos botones y el arranque de la hoja sin scroll.

---

## 6. Medidas antes / después

### Alto total

| Viewport | Antes | Después | Δ |
|---|---|---|---|
| 320 × 720 | 9.023 px | 8.938 px | −0,9 % |
| 360 × 800 | 8.611 px | 8.463 px | −1,7 % |
| 390 × 844 | 8.294 px | 8.007 px | −3,5 % |
| 430 × 932 | 8.044 px | 7.721 px | −4,0 % |
| 768 × 1.024 | 7.462 px | 6.650 px | **−10,9 %** |
| 1.024 × 768 | 6.129 px | 5.120 px | **−16,5 %** |
| 1.366 × 768 | 6.513 px | 5.445 px | **−16,4 %** |
| 1.440 × 900 | 6.519 px | 5.499 px | **−15,6 %** |
| 1.920 × 1.080 | 6.519 px | 5.509 px | **−15,5 %** |

El objetivo del 12–20 % se cumple de 1.024 px en adelante, que es donde estaba el
problema descrito.

### Alto por sección y padding vertical calculado — 1.440 × 900

| Sección | Antes | Después | pt | pb |
|---|---|---|---|---|
| Cabecera | 65 | 60 | 0 | 0 |
| Hero | 1.148 | 1.043 | 52 | 0 |
| 01 Un mes real | 1.279 | 1.152 | 75 | 0 |
| 02 Entre planificar y cumplir | 595 | 581 | 69 | 69 |
| 03 Calculadora | 624 | 524 | 63 | 0 |
| 04 Tus datos | 779 | 709 | 69 | 69 |
| 05 Preguntas | 608 | 337 | 63 | 0 |
| 06 Beta fundadora + invitación | 619 + 609 | **713** | 69 | 69 |
| Pie | 193 | 191 | 28 | 36 |

### Alto por sección — 390 × 844

| Sección | Antes | Después |
|---|---|---|
| Cabecera | 94 | 105 *(objetivos táctiles)* |
| Hero | 1.934 | 1.910 |
| 01 Un mes real | 1.579 | 1.446 |
| 02 Entre planificar y cumplir | 715 | 721 |
| 03 Calculadora | 928 | 894 |
| 04 Tus datos | 1.103 | 1.062 |
| 05 Preguntas | 459 | 401 |
| 06 Beta fundadora + invitación | 478 + 687 | **981** |
| Pie | 317 | 335 *(objetivos táctiles)* |

### Profundidad de scroll

| Viewport | Primera cifra | Primer control | Formulario final |
|---|---|---|---|
| 390 × 844 | 594 → **591** | 1.631 → **1.624** | 7.598 → **7.464** |
| 768 × 1.024 | 511 → **487** | 1.360 → **1.390** | 6.854 → **6.276** |
| 1.366 × 768 | 472 → **444** | 988 → **956** | 5.895 → **4.946** |
| 1.440 × 900 | 472 → **447** | 988 → **958** | 5.901 → **4.996** |

### Secciones que dejaron de tener espacio sin función

- **Beta fundadora**: 735 px muertos a la derecha → 0.
- **Preguntas**: 511 px muertos a la derecha → 0.
- **Siete fronteras** de 192 px de aire vacío → 63–75 px, o 63 + inset de banda.

---

## 7. Pruebas ejecutadas

### 7.1 Las 48 pruebas funcionales — 48/48

Los scripts de la sesión anterior no se versionaron (`QA_REPORT.md` §10), así que
se reconstruyeron a partir de la descripción prueba por prueba de `QA_REPORT.md`
§3 y se ejecutaron con Puppeteer sobre el Chrome del sistema (151.0.7922.138).
**Se ejecutaron primero contra `049ffc1` para validar el arnés: 48/48 en la línea
base**, y después contra esta rama: 48/48.

- **Demostración del estado del mes (17)** — arranque, saldo inicial coherente
  con la suma de categorías, formato CLP en vivo, saldo y ritmo recalculados,
  categoría acumulada, movimiento insertado arriba, `aria-live`, botón de
  restablecer que aparece al usar, foco devuelto al campo, monto vacío rechazado,
  `aria-invalid`, restablecer devuelve montos **y** categoría, restablecer se
  oculta, sobregiro en rojo, barra saturada al 100 % sin desbordar, consola
  limpia.
- **Calculadora (12)** — 11,9 % con 800.000 / 95.000, el texto dice «mediana»,
  formato CLP, ingreso cero con error y resultado oculto, deuda cero con mensaje
  propio, deuda mayor que el ingreso (225,0 %) derivando a orientación formal,
  barra saturada, doce dígitos sin romper, el caso exacto 11,9 % sin
  contradecirse, `aria-live="polite"`, limpiar oculta y vacía, consola limpia.
- **Formulario de lista de espera (8)** — correo inválido con mensaje y
  `aria-invalid`, doble envío bloqueado (contando peticiones POST: exactamente 1
  con dos clics, confirmado también en el servidor), éxito con mensaje y
  formulario oculto, error de red con mensaje recuperable, botón reactivado y el
  correo conservado.
- **Teclado (5)** — el CTA «Probar con un gasto» mueve el foco al campo, Tab
  llega al grupo de categorías, las flechas cambian la categoría, Tab y Enter
  completan el registro, foco visible de 3 px.
- **Tema, movimiento y degradación (6)** — oscuro `rgb(27, 25, 20)` y sin
  errores, `prefers-reduced-motion` lleva las transiciones a 0,001 s, sin
  JavaScript la hoja muestra los mismos valores, los controles no aparecen y las
  cuatro preguntas siguen ahí.

### 7.2 Accesibilidad

**axe-core, reglas `wcag2a` + `wcag2aa` + `wcag21a` + `wcag21aa` +
`best-practice`**, con todos los `<details>` abiertos:

| Configuración | Violaciones | Reglas superadas |
|---|---|---|
| Escritorio claro 1.440 × 900 | **0** | 46 |
| Móvil claro 390 × 844 | **0** | 46 |
| Escritorio oscuro 1.440 × 900 | **0** | 46 |
| Móvil oscuro 360 × 800 | **0** | 46 |

Idéntico a la línea base. La fusión del cierre no introdujo ninguna violación
porque el encuadre se quedó sobre papel (§4).

### 7.3 Teclado

Recorrido completo: **32 paradas** (eran 30; suman el botón de la demo y el
enlace de restablecer, ahora con caja propia). **Cero elementos sin foco
visible.**

### 7.4 Objetivos táctiles

| Control | Antes | Después |
|---|---|---|
| Enlaces de la cabecera | 17,8 px | **44 px** |
| Banda de navegación móvil | 17,0 px | **44 px** |
| CTA «Pedir acceso» de la cabecera | 37,8 px | **44 px** |
| Fichas de categoría | 40,9 px | **44 px** |
| `.link-quiet` (restablecer / limpiar) | 20,6 px | **44 px** |
| Enlaces del pie | 18,6 px | **44 px** |
| Marca | 32,5 px | **44 px** |
| `.btn`, `<summary>`, campos de texto | ya ≥ 44 px | sin cambios |

Lo que sigue por debajo de 44 px son elementos que no son objetivos táctiles: el
enlace de salto oculto, las etiquetas `<label>` (cuyo campo asociado mide 49–54
px), los radios nativos ocultos tras las fichas, el honeypot y los enlaces en
línea dentro de un párrafo, que WCAG 2.5.8 exceptúa expresamente.

El filete de `.link-quiet` pasó de ser el borde de su caja a ser un subrayado:
de otro modo, al crecer la caja a 44 px la línea se habría despegado del texto.

### 7.5 Otros

- **Consola**: 0 errores en los nueve anchos, en claro y en oscuro.
- **Enlaces**: 21 en total, 12 anclas internas, **0 rotas**. Los cinco externos
  (CPP UC, CMF, términos, privacidad, login) sin cambios.
- **Scroll horizontal**: ninguno en 320, 360, 390, 430, 768, 1.024, 1.366 y
  1.440 px, comprobado también con `overflow-x` desactivado.
- **Anclas y barra fija**: `#contenido`, `#como-funciona`, `#datos`,
  `#preguntas` y `#acceso` aterrizan por debajo de la cabecera en 390, 768 y
  1.440 px. `scroll-padding-top` ajustado a la cabecera real (92 px en
  escritorio, 112 px en móvil).
- **CSP**: la página sigue sin `<script>` inline. Los `style=` que quedan son
  datos —anchos calculados y colores de categoría, que `demo.js` reescribe—, no
  espaciado. Los cinco `style="margin-top:…"` desaparecieron.
- **Sin peticiones a terceros**, sin dependencias nuevas, sin frameworks.

### 7.6 Lo que no se pudo ejecutar

**Lighthouse no se ejecutó**: no hay CLI instalada en el equipo y el encargo
prohíbe agregar dependencias al proyecto. Los indicadores que Lighthouse habría
mirado se comprobaron por separado: 0 violaciones de axe, 0 errores de consola,
0 peticiones a terceros, mismos assets y mismo peso de CSS (±1 KB), y el CLS
sigue dependiendo de `font-variant-numeric: tabular-nums`, que no se tocó. **No
hay regresión conocida, pero tampoco hay un número de Lighthouse comparable.**

**Firefox y Safari siguen sin probar**, igual que en el informe anterior. El
único selector nuevo con algún riesgo de compatibilidad es el combinador `+`,
que tiene soporte universal; no se introdujo `:has()` precisamente por esto.

---

## 8. Archivos modificados

| Archivo | Qué cambió |
|---|---|
| `index.html` | Fusión del cierre, preguntas antes del cierre, `.qa-layout`, `.closing`, `#acceso` sobre `.invite`, renumeración 05 ↔ 06, cinco `style="margin-top:…"` retirados |
| `assets/css/landing.css` | Escala de espaciado, ritmo entre secciones, `.qa-layout`, `.closing`, `.invite` en una columna, objetivos táctiles, `minmax(0, …)`, filetes al contenedor, longitudes de lectura, breakpoints consolidados, riel móvil de `.moment` |
| `docs/redesign/QA_RITMO.md` | Este informe |
| `docs/redesign/screenshots/ritmo-2026-08-19/` | Evidencia visual antes/después |
| `README.md`, `docs/redesign/ART_DIRECTION.md`, `docs/redesign/CONTENT_AUDIT.md`, `docs/redesign/QA_REPORT.md` | Referencias al nuevo orden y a este informe |

**No se tocaron**: `assets/js/*.js`, `functions/api/waitlist.js`, `_headers`,
`_redirects`, `robots.txt`, `sitemap.xml`, `wrangler.jsonc`, `.assetsignore`,
las tipografías ni el backend de la lista de espera.

---

## 9. Riesgos y pendientes reales

1. **Lighthouse sin medir** (§7.6). Es el único control del encargo que no se
   pudo ejecutar. Conviene correrlo una vez desde el navegador antes de aceptar
   la rama.
2. **La reducción en móvil es pequeña** (−0,9 % a −4,0 % entre 320 y 430 px).
   Está explicado en §5 y es honesto: el problema era de escritorio y el arreglo
   de objetivos táctiles cuesta altura. Si se quisiera bajar más, la única
   palanca grande sería la hoja del estado del mes, que son 1.910 px de los 8.007
   en 390 px — y es la demostración del producto.
3. **Propuesta evaluada y no aplicada**: reordenar los hijos de `.sheet` en móvil
   con `order` para que el formulario de «anotar gasto» quede antes de las dos
   listas, subiendo la primera interacción de ~1.624 px a ~800 px. Se descartó
   porque el encargo pide mantener el orden de lectura en móvil y `order`
   desacopla el orden visual del que oye un lector de pantalla. Es una decisión
   de producto, no técnica: si el dueño la quiere, es un cambio de seis líneas.
4. **`.moment h3` sigue en 22ch (~27 caracteres por línea)**, por encima del
   rango de 18–22 que pide el encargo. No se ajustó porque es un subtítulo de
   23 px, no un titular de display, y estrecharlo añadía una tercera línea a los
   tres momentos. Queda señalado, no corregido.
5. **La tabla de alturas de `QA_REPORT.md` §2 quedó obsoleta.** Se anotó una
   remisión a este informe en vez de reescribir un documento que describe otro
   conjunto de cambios.
6. **Riesgos heredados que siguen abiertos**: Firefox sin probar, las dos
   inexactitudes de la política de privacidad del producto (otro repositorio), el
   plan Pro en `docs/ESTRATEGIA.md` y la fecha de vencimiento de las cifras
   (CMF junio 2025, CPP UC diciembre 2024). Ninguno cambia con esta rama.

---

## 10. Cómo reproducir estas pruebas

Hace falta un servidor estático sobre la raíz del proyecto **con un mock de
`/api/waitlist`** —nunca contra el endpoint real, para no escribir en el KV de
producción ni disparar correos— y Puppeteer apuntando al Chrome ya instalado en
el equipo, sin descargar un navegador aparte:

```js
puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
});
```

El arnés de esta sesión son cinco scripts —servidor con los headers reales,
medición, las 48 funcionales, axe y capturas— y vive fuera del repositorio, igual
que el de la sesión anterior. **Que no estén versionados es la razón por la que
hubo que reconstruirlos**: si el próximo cambio de layout va a medirse igual,
vale la pena guardarlos en `docs/redesign/qa/` con un `package.json` propio, que
no afecta a la landing porque no tiene build.
