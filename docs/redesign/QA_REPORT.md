# Informe de QA — rediseño «El mes a la vista»

19 de agosto de 2026. Rama `claude/landing-distinctive-redesign-20260819`.

Estado: **mezclado a `main` y desplegado a producción el 19-ago-2026**, con
verificación posterior contra el sitio real (§8 bis).

Las pruebas previas al despliegue se ejecutaron contra un servidor local que **replica el
comportamiento de Cloudflare Pages**: compresión gzip, los headers reales de
`_headers` (CSP incluida) y caché diferenciada para `/assets/*`. El endpoint
`/api/waitlist` se sirvió con un **mock local**, de modo que en ningún momento
del QA se escribió en el KV real ni se disparó un correo a nadie.

---

## 1. Baseline registrado antes de tocar nada

Versión publicada `https://mesura-landing.pages.dev`, SHA `6788aab`:

| Viewport | Alto de página | Scroll horizontal | Errores de consola |
|---|---|---|---|
| 360×800 | 7.528 px | no | 0 |
| 390×844 | 7.107 px | no | 0 |
| 768×1024 | 5.575 px | no | 0 |
| 1024×768 | 4.616 px | no | 0 |
| 1440×900 | 4.533 px | no | 0 |
| 1920×1080 | 4.533 px | no | 0 |

Comportamiento funcional del baseline: la demo del teléfono abría, sumaba y
mostraba sobregiro; la calculadora daba 11,9% con 800.000 / 95.000; el formulario
enviaba.

Carencias detectadas en el baseline, todas resueltas en esta rama:

- Sin `canonical`, sin `og:image`, sin datos estructurados.
- Sin `aria-live` en el resultado de la calculadora.
- Sin forma de restablecer la demostración.
- Jerarquía de encabezados rota: un `<h3>` con el saldo del teléfono (`$342.500`)
  aparecía antes del primer `<h2>` de la página.
- La duplicación de `btn.disabled = true` mencionada en el encargo **ya no
  existía** en `6788aab`; el JS actual reescribe ese bloque completo y añade
  además una guarda de estado (`sending`) que cubre el Enter repetido, no solo
  el doble clic.

---

## 2. Matriz de viewports — resultado

| Viewport | Alto | Scroll horizontal | Consola | Nav |
|---|---|---|---|---|
| 360×800 | 9.764 px | **no** | limpia | banda compacta, sin hamburguesa |
| 390×844 | 9.385 px | **no** | limpia | banda compacta |
| 768×1024 | 8.114 px | **no** | limpia | banda compacta |
| 1024×768 | 6.754 px | **no** | limpia | horizontal completa |
| 1440×900 | 7.063 px | **no** | limpia | horizontal completa |
| 1920×1080 | 7.063 px | **no** | limpia | horizontal completa |

Verificado en claro y en oscuro en los seis tamaños (12 capturas).

**Sobre el alto:** la página es más larga que la anterior. Es intencional y no es
relleno: la hoja del estado del mes ocupa el ancho completo en vez de caber en un
teléfono dibujado, la sección «Tus datos» volvió, y el acuerdo de datos y la
lista de la beta dicen cosas que antes no se decían. Lo que se acortó es lo que
importa: la propuesta se entiende en el primer pantallazo, sin scroll.

---

## 3. Pruebas funcionales — 48/48

Ejecutadas con Puppeteer sobre Chrome. Todas pasan.

**Demostración del estado del mes (17)**
Arranque correcto · saldo inicial coherente con la suma de categorías · formato
CLP en vivo al escribir · saldo recalculado · ritmo recalculado · categoría
acumulada · movimiento insertado arriba · `aria-live` anunciando el resultado ·
botón de restablecer que aparece al usar · foco devuelto al campo · monto vacío
rechazado con mensaje · `aria-invalid` marcado · restablecer devuelve el ejemplo
completo (montos **y** categoría) · restablecer se oculta · sobregiro en rojo ·
barra saturada en 100% sin desbordar · sin errores de consola.

**Calculadora (12)**
Cálculo normal 11,9% · el texto dice «mediana» · formato CLP · **ingreso cero**
con error visible y resultado oculto · **deuda cero** con mensaje propio ·
**deuda mayor que el ingreso** (225,0%) con mensaje que deriva a orientación
formal · barra saturada · **valores enormes** (12 dígitos) sin romper · el caso
exacto 11,9% no se contradice a sí mismo · `aria-live="polite"` · limpiar oculta
y vacía · sin errores de consola.

**Formulario de lista de espera (8)**
Correo inválido con mensaje y `aria-invalid` · **doble envío bloqueado**
(verificado contando peticiones POST: exactamente 1 con dos clics) · éxito con
mensaje y formulario oculto · **error de red** con mensaje recuperable, botón
reactivado y el correo conservado en el campo.

**Teclado (5)**
El CTA «Probar con un gasto» mueve el foco al campo de monto · Tab llega al grupo
de categorías · **las flechas cambian la categoría** (son radios nativos, no
divs con ARIA) · Tab y Enter completan el registro · foco visible de 3px.

**Tema, movimiento y degradación (6)**
Oscuro no es negro puro (`rgb(27,25,20)`) y sin errores · `prefers-reduced-motion`
lleva las transiciones a 0,001 s · **sin JavaScript**: la hoja muestra los mismos
valores, los controles interactivos no aparecen (en vez de aparecer muertos) y
las cuatro preguntas siguen ahí.

---

## 4. Accesibilidad

**axe-core, reglas wcag2a + wcag2aa + wcag21a + wcag21aa + best-practice**, con
todos los `<details>` abiertos para auditar también su contenido:

| Configuración | Violaciones | Reglas superadas |
|---|---|---|
| Escritorio claro 1440×900 | **0** | 46 |
| Móvil claro 390×844 | **0** | 46 |
| Escritorio oscuro 1440×900 | **0** | 46 |
| Móvil oscuro 360×800 | **0** | 46 |

**Contraste — corregido, no estimado.** La primera pasada arrojó 29 nodos con
contraste insuficiente. Se calcularon los valores en vez de ajustarlos a ojo:

| Token | Antes | Después | Ratio peor caso (sobre `--paper-2`) |
|---|---|---|---|
| `--muted` | `#6b675d` | `#635f55` | 4,29 → **4,84** |
| Naranja de texto | `#ff5c00` | `#a83a00` (`--orange-ink`) | 2,35 → **4,88** |
| `--red` | `#cf2c1c` | `#c02718` | 4,42 → **5,03** |

Se introdujo `--orange-ink` en vez de oscurecer `--orange`: así la barra de ritmo
conserva el naranja de la marca (es un relleno delimitado por un borde de tinta)
y todo naranja que sea **texto** cumple AA.

**Bug de especificidad corregido:** `.masthead__nav a` (0,1,1) le estaba imponiendo
su color de texto al botón `.masthead__cta` (0,1,0), dejándolo en 1,66:1 en claro
y 1,49:1 en oscuro — prácticamente ilegible. Ahora el selector va calificado.

**Otras propiedades verificadas:** un solo `<h1>`, jerarquía de encabezados
correcta, enlace de salto al contenido, `lang="es-CL"`, todos los controles con
etiqueta asociada, foco visible en todo elemento interactivo, la demostración y
la calculadora anunciando por `aria-live`, y el grupo de categorías construido
con radios nativos dentro de un `<fieldset>` con `<legend>` — el lector de
pantalla anuncia «opción N de 4» sin ARIA inventado.

---

## 5. Rendimiento — Lighthouse

| | Móvil | Escritorio | Objetivo |
|---|---|---|---|
| **Rendimiento** | **97–98** | **100** | ≥ 90 |
| **Accesibilidad** | **100** | **100** | ≥ 95 |
| **Buenas prácticas** | **100** | **100** | ≥ 95 |
| **SEO** | **100** | **100** | ≥ 95 |

| Métrica | Móvil | Escritorio |
|---|---|---|
| First Contentful Paint | 1,7 s | 0,4 s |
| Largest Contentful Paint | 2,0 s | 0,5 s |
| Total Blocking Time | 150 ms | 0 ms |
| **Cumulative Layout Shift** | **0** | **0** |
| Speed Index | 1,8 s | 0,6 s |

CLS en 0 no es casualidad: todas las cifras usan `font-variant-numeric:
tabular-nums`, así que ningún número mueve el layout al actualizarse.

**Peso.** HTML 8,6 KB comprimido. Tipografías 144 KB en tres `.woff2` de
subconjunto latino, auto-alojadas. Cero dependencias, cero framework, cero
peticiones a terceros.

**Única auditoría pendiente:** «Minify CSS» (~3 KB estimados). No se aplicó a
propósito. El CSS está comentado porque documenta decisiones de diseño, y
minificarlo exigiría introducir un paso de compilación en un proyecto que el
encargo pide mantener sin herramientas de build. 3 KB antes de gzip, con
Rendimiento en 97–98 móvil, no justifica ese costo.

---

## 6. Cross-browser

| Motor | Estado | Resultado |
|---|---|---|
| **Chromium** (Blink) | Probado | **17/17** |
| **WebKit** (Safari) | Probado | **17/17** |
| **Firefox** (Gecko) | **No se pudo ejecutar** | ver abajo |

En ambos motores probados: carga, tipografías auto-alojadas resueltas, demo
completa, chip de categoría pintado (`input:checked + label`), calculadora,
formulario, `<details>` nativos, cero errores de consola y cero scroll horizontal
a 360px.

**Limitación — Firefox.** El binario de Firefox de Playwright está bloqueado por
el sistema en este equipo: falla al lanzarse con `spawn UNKNOWN`, y ejecutarlo
directamente devuelve `Permission denied`. No es un problema del código y no se
intentó rodear la restricción.

Comprobación equivalente realizada: revisión de las features CSS/JS empleadas
contra su soporte en Gecko. `:has()` **no se usa** (el chip usa
`input:checked + label`, con soporte universal). `text-wrap: balance` degrada sin
consecuencias. `font-stretch` en porcentaje sobre eje `wdth`, `clip-path:
polygon`, `box-decoration-break`, `<details>`, `inputmode` y `Intl.NumberFormat`
tienen soporte en Firefox desde hace varias versiones. **Aun así, conviene una
pasada manual en Firefox antes de desplegar.**

---

## 7. SEO y metadatos

Verificado: `canonical` · `og:title/description/image/url/type/locale/site_name` ·
`og:image:width/height/alt` · `twitter:card summary_large_image` · imagen social
**original** de 1200×630 generada para este rediseño (`assets/img/og-mesura.png`,
63 KB) · JSON-LD con `WebSite` + `FAQPage` cuyo contenido **coincide literalmente**
con la FAQ visible · `theme-color` por esquema · favicon SVG propio · `lang="es-CL"`.

No se declaró `SoftwareApplication` con `offers`: fijar un precio en datos
estructurados es una afirmación comercial, y hoy no hay plan de pago que declarar.
No se inventaron `aggregateRating` ni `Organization`.

---

## 8. Seguridad y cabeceras

`_headers` ahora incluye, además de lo que ya había:

- **`Content-Security-Policy`** estricta: `default-src 'self'` sin excepciones de
  terceros. Fue posible porque la página no carga **nada** externo. `'unsafe-inline'`
  queda solo en `style-src`, por los atributos `style=` y los anchos que la demo
  calcula; **no hay ningún `<script>` inline** — el toggle de «no-js» se eliminó y
  se reemplazó por un gate en CSS (`#estado-mes:not([data-ready]) .jot`), que
  además es más robusto: los controles solo aparecen si el JS efectivamente arrancó.
- **`Permissions-Policy`** cerrando geolocalización, micrófono, cámara y pagos.
- **Caché de un año con `immutable`** para `/assets/*`.

**Las 48 pruebas funcionales se volvieron a ejecutar con la CSP activa**: 48/48,
sin una sola violación en consola.

---

## 8 bis. Verificación contra producción (post-deploy)

Mezclado a `main` y desplegado el 19-ago-2026 con aprobación de Matías.
Verificación **contra `https://mesura-landing.pages.dev` real**, sin enviar el
formulario en ningún momento (solo se comprobó que exista, que el honeypot esté
presente y que el endpoint no cambió), para no escribir en el KV de producción
ni disparar correos.

**26/26 comprobaciones**, en Chromium y WebKit: demo completa, calculadora,
formulario presente e intacto, **cero peticiones a terceros**, tipografías
auto-alojadas resueltas, sin errores de consola, sin scroll horizontal a 360px, y
**cero violaciones de axe** en claro y oscuro.

| Lighthouse contra producción | Móvil | Escritorio |
|---|---|---|
| Rendimiento | **95** | **100** |
| Accesibilidad | **100** | **100** |
| Buenas prácticas | **100** | **100** |
| SEO | **100** | **100** |
| CLS | **0** | **0** |

Rendimiento móvil baja de 97–98 (local) a 95 (producción) por la latencia real
de red sumada al throttling simulado de Lighthouse. Sigue sobre el objetivo.

**Dos problemas que solo aparecieron al medir contra producción, ya corregidos y
redesplegados:**

1. **Cloudflare Pages concatena las reglas de `_headers` en vez de
   sobrescribirlas.** Con `Cache-Control` declarado en `/*` y en `/assets/*`, el
   header servido quedaba `public, max-age=300, public, max-age=31536000,
   immutable`: el navegador toma el primer valor y los assets caducaban en 5
   minutos en lugar de un año. Se quitó el `Cache-Control` global; el HTML queda
   con el valor por omisión de Pages (`max-age=0, must-revalidate`), que es lo
   correcto para un documento que cambia. Verificado: los assets ahora sirven el
   año completo.
2. **`/robots.txt` devolvía la página HTML con 200**, por la regla comodín
   `/* /index.html 200`. Los rastreadores —y Lighthouse, que bajaba SEO de 100 a
   92— la parseaban como robots.txt: 687 errores de sintaxis. Problema
   preexistente. Se agregaron un `robots.txt` real (que además excluye `/docs/` y
   `/api/`) y un `sitemap.xml`. SEO vuelve a 100.

---

## 9. Riesgos y pendientes

1. ~~**Los documentos internos están públicos en producción.**~~ **RESUELTO Y
   VERIFICADO.** Antes del despliegue,
   `https://mesura-landing.pages.dev/docs/ESTRATEGIA.md` devolvía **200** con el
   texto completo — incluido el precio candidato del plan Pro ($1.990/mes), los
   benchmarks de competencia y las reglas internas de monetización.
   Tras el deploy, `/docs/ESTRATEGIA.md`, `/docs/ANALISIS-MERCADO.md` y
   `/docs/redesign/QA_REPORT.md` devuelven **301 hacia `/`**, y seguir la
   redirección entrega la landing, no el documento. El `robots.txt` además
   excluye `/docs/` del rastreo.
2. **Firefox sin probar** (§6).
3. **Dos inexactitudes en la política de privacidad del producto**, en el otro
   repositorio y por lo tanto fuera del alcance de esta rama:
   `mesurapp/app/privacidad/page.tsx:60` dice que Google interviene solo si
   conectas Drive (falso: interviene en todo correo), y `:31` dice que la hoja se
   comparte «como lectora/editora» cuando el código solo agrega lector. Detalle
   en `CLAIM_INVENTORY.md` §6.
4. **El plan Pro sigue vivo en `docs/ESTRATEGIA.md`.** Es correcto que viva ahí
   como documento interno, pero depende del punto 1 para no seguir siendo público.
5. **Las cifras tienen fecha de vencimiento.** El 11,9% de la CMF corresponde a
   datos de junio de 2025 y se publicó en enero de 2026; la 13ª versión saldría
   en enero de 2027. El estudio CPP UC tiene terreno de diciembre de 2024. Conviene
   revisarlas una vez al año.

---

## 10. Cómo reproducir estas pruebas

Los scripts quedaron en el directorio temporal de la sesión, no en el repositorio
(no corresponde versionar herramientas de un solo uso en una landing sin build).
Para repetirlas basta un servidor estático sobre la raíz del proyecto **con un
mock de `/api/waitlist`** — nunca contra el endpoint real, para no escribir en el
KV de producción ni disparar correos.
