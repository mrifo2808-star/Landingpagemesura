# Informe de QA — mejoras integrales

20 de agosto de 2026. Rama `claude/landing-mejoras-integrales-20260820`, sobre
`main` @ `c9bca5b`.

Estado: **implementado y probado en local. No mezclado a `main`. No desplegado.**

Alcance: el salto de ancla bajo la cabecera fija, los dos controles que
`QA_RITMO.md` §9 dejó pendientes —Lighthouse y minificación de CSS—, la fluidez
del scroll, dos metadatos que faltaban, endurecimiento del endpoint de la lista
de espera, y el arnés de QA versionado que el propio repositorio venía pidiendo
desde hace dos pasadas.

**No se tocó una sola línea de copy.** El contenido pasó por auditoría de
afirmaciones en `CLAIM_INVENTORY.md` y nada de este encargo obligaba a
cambiarlo.

Todo se midió contra un servidor local que replica el comportamiento de
Cloudflare Pages —gzip, los headers reales de `_headers` con la CSP incluida,
caché diferenciada de `/assets/*`, el 301 de `/docs/*`— y con un **mock local de
`/api/waitlist`**. En ningún momento se escribió en el KV de producción ni se
disparó un correo.

---

## 0. Un cambio se apartó del diagnóstico del encargo

El encargo describe A1 como que «ningún destino de ancla tiene
`scroll-margin-top`» y que por eso el título queda tapado por la cabecera.
**Medido antes de tocar nada, eso no es lo que pasa en Chrome.**

`main` sí tiene un offset: `html { scroll-padding-top: 68px }`, con un override
de `110px` bajo 720px. Los **60 aterrizajes** de la matriz —seis anclas × cinco
anchos × dos temas— caían correctos, con el título entero bajo la barra.

Lo que sí era cierto es el problema de fondo, y por eso el arreglo se hizo igual:

| | `main` | Esta rama |
|---|---|---|
| De dónde sale el offset | dos números literales, en la base de la hoja y en un `@media` a 300 líneas del masthead | `--masthead-h`, declarada junto a las reglas del masthead |
| Holgura del título bajo la barra | 5 px en móvil, 8–9 px en escritorio | **14–15 px en todos los anchos** |
| Mecanismo | `scroll-padding-top` en el contenedor | `scroll-margin-top` en cada destino |

Las tres cosas importan. El número literal **ya se desfasó una vez**: quedó en
92 px contra una barra de 60 y cada salto regalaba 32 px muertos, hasta que
`QA_RITMO.md` §12.2b lo encontró. La holgura de 5 px deja el título pegado al
filete de la cabecera, por debajo del respiro de 12–16 px que pide el encargo. Y
`scroll-padding` en el contenedor tiene soporte más irregular fuera de Blink
para la navegación por fragmento, que es la explicación más plausible de lo que
el encargo reporta haber visto en producción — **este proyecto sigue sin probar
Firefox** (`QA_REPORT.md` §6).

**Las dos vías no se combinan a propósito: se suman**, y el ancla caería al
doble de distancia de la cabecera. Por eso `scroll-padding-top` se retiró al
mover el offset a los destinos.

Se dice acá porque el encargo pide verificar, y verificar incluye informar
cuando el diagnóstico de partida no calza con lo medido.

---

## A. El salto de ancla

### A1. `--masthead-h` en vez de números escritos a mano

```css
/* junto a las reglas del masthead, donde se decide el alto */
:root { --masthead-h: 105px; --anchor-gap: 14px; }
@media (min-width: 720px) { :root { --masthead-h: 60px; } }

#contenido, #como-funciona, #calculadora, #datos, #preguntas, #acceso {
  scroll-margin-top: calc(var(--masthead-h) + var(--anchor-gap));
}
```

Los dos valores de `--masthead-h` son el alto medido de la cabecera, no una
estimación: 60 px en escritorio y 105 px bajo 720 px, donde aparece
`.masthead__strip` y la barra pasa a dos filas. Barrido de 320 a 1920 px: el
salto está exactamente en 720, que es el breakpoint que ya usaba la hoja.

### Resultado — holgura del título bajo el canto de la cabecera

Los seis destinos, en los cinco anchos, en claro y oscuro: **60/60 antes y
60/60 después.** Lo que cambia es la holgura.

| Ancho | Cabecera | `main` | Esta rama |
|---|---|---|---|
| 360 px | 105 px | 5 px | **14 px** |
| 390 px | 105 px | 5–6 px | **14 px** |
| 768 px | 60 px | 9 px | **15 px** |
| 1.024 px | 60 px | 8–9 px | **14–15 px** |
| 1.440 px | 60 px | 8–9 px | **14–15 px** |

Idéntico en los dos temas: el tema no cambia la geometría.

`#contenido` es el único que aterriza con holgura 0, y está bien: es el destino
del enlace de salto y del logotipo, apunta al inicio del documento y ahí no hay
scroll que dar. `#acceso` en 768 y 1.440 px aterriza más abajo de lo pedido
porque la página **ya llegó al fondo**; el script lo distingue y no lo cuenta
como fallo.

### Capturas

En `docs/redesign/screenshots/mejoras-2026-08-20/`, 24 imágenes: tres anclas
(`#acceso`, `#como-funciona`, `#preguntas`) × dos anchos (390, 1440) × dos temas
× antes/después, más `medidas.json` con la holgura de cada una.

El **«antes» no es una carpeta vieja**: es la hoja de estilos de `main` servida
por el mismo servidor, con el mismo HTML y el mismo navegador. Lo único que
cambia entre las dos tandas es `landing.css`.

Dos precauciones vienen de `QA_RITMO.md` §11.4, donde siete capturas salieron de
una sección equivocada: `scroll-behavior: smooth` se desactiva antes de
disparar, y el script comprueba que el ancla quedó dentro del viewport y avisa
si no. **La tanda final salió sin avisos.**

---

## B. Rendimiento

### B1. Lighthouse — el control que faltaba

`QA_RITMO.md` §9.1 lo dejó como el único pendiente del encargo anterior. Corrido
contra el servidor local que replica los headers reales, **dos corridas por
perfil, mediana**: una sola corrida en un equipo con otras cosas abiertas varía
varios puntos en Rendimiento, y publicar la primera cifra que salga es el mismo
error que §11.5 documenta.

| | Móvil | Escritorio | Meta del encargo |
|---|---|---|---|
| **Rendimiento** | **99** | **100** | ≥ 95 |
| **Accesibilidad** | **100** | **100** | 100 |
| **Buenas prácticas** | **100** | **100** | 100 |
| **SEO** | **100** | **100** | 100 |

Las cuatro metas se cumplen. Las dos corridas de cada perfil dieron el mismo
número en las ocho celdas, así que la mediana no está tapando dispersión.

| Métrica | Móvil | Escritorio |
|---|---|---|
| First Contentful Paint | 1.081 ms | 303 ms |
| Largest Contentful Paint | 1.970 ms | 449 ms |
| Total Blocking Time | **0 ms** | **0 ms** |
| **Cumulative Layout Shift** | **0** | **0** |
| Speed Index | 1.081 ms | 306 ms |

CLS en 0 sigue sin ser casualidad: todas las cifras usan
`font-variant-numeric: tabular-nums`, así que ningún número mueve el layout al
actualizarse. Nada de esta rama lo tocó.

**Comparación con `QA_REPORT.md` §8 bis**, que midió contra producción real:
móvil sube de 95 a 99 y escritorio se queda en 100. La diferencia no es mérito
de esta rama — es que aquello se midió contra la red real y esto contra
localhost. **Las dos cifras no son comparables**, y conviene volver a medir
contra producción después de desplegar.

Auditorías que no sacan nota perfecta, con lo que son:

- `first-contentful-paint`, `largest-contentful-paint`, `interactive` en móvil:
  puntúan por debajo de 1 sin bajar la categoría de 99. Es el throttling
  simulado de Lighthouse sobre una página que ya carga tres `.woff2`.
- `render-blocking-resources` / `render-blocking-insight`: el CSS y las
  tipografías. Quitar el bloqueo exigiría CSS crítico en línea — imposible sin
  build y sin relajar la CSP.
- `unminified-css`: es B2, abajo, con números.
- `network-dependency-tree-insight`: informativa.

### B2. Minificar el CSS — medido, y descartado con la cifra a la vista

`QA_REPORT.md` §8 lo dejó pendiente estimando «~3 KB». **La estimación estaba
corta**: el ahorro real, con gzip, es del doble.

| Variante | Crudo | gzip | Δ gzip |
|---|---|---|---|
| Fuente (la de hoy) | 43.946 B | 11.922 B | — |
| Sin comentarios | 31.452 B | 6.484 B | **−5.438 B** |
| Minificado | 25.247 B | 5.870 B | **−6.052 B** |

Seis kilobytes con gzip, un 51 % menos. Con ese número el pendiente parecía
justificado. Así que se midió lo único que importa: **si se nota.**

Lighthouse móvil, dos corridas por variante, mismo servidor y mismos headers:

| Variante | Rendimiento | FCP | LCP |
|---|---|---|---|
| Fuente | **99** | 1.088 ms | 1.976 ms |
| Sin comentarios | **99** | 1.084 ms | 1.972 ms |
| Minificado | **99** | 1.074 ms | 1.966 ms |

**No se nota.** El puntaje no se mueve, FCP baja 14 ms y LCP 10 ms — dentro del
ruido de dos corridas. La razón es que el CSS es una petición del mismo origen
sobre una conexión ya abierta: seis kilobytes no cambian el número de idas y
vueltas, que es lo que domina.

Contra eso, el costo es concreto. El proyecto **no tiene build**, así que
`landing.min.css` sería un archivo generado y versionado al lado de su fuente:
la primera vez que alguien edite `landing.css` y olvide regenerar, producción
sirve CSS viejo sin que nada avise. Eso es una regresión silenciosa a cambio de
cero milisegundos medibles.

**Decisión: no se minifica.** No por preferir la legibilidad en abstracto, sino
porque se midió y el beneficio es nulo.

Queda versionado `npm run minificar`, que rehace esta medición completa. El
transformador que usa recorre el CSS carácter a carácter respetando cadenas,
`url()` y los operadores de `calc()` —donde quitar los espacios alrededor del
`+` produce CSS inválido— y **se verificó que la variante minificada renderiza
idéntica**: mismo alto de documento, mismas cajas de `.wrap`, `.sheet` e
`.invite`, mismo `padding-top` de sección y mismo `scroll-margin-top`. Si alguna
vez el cálculo cambia, la herramienta ya está y el resultado es confiable.

### B3. Fluidez del scroll — era un artefacto de la herramienta

La revisión externa reportó repintados en blanco y congelamientos intermitentes
al hacer scroll programático con Chrome/CDP. Se perfiló con una traza de
DevTools Performance durante un recorrido completo de la página, en dos anchos:

| | 390 × 844 | 1.440 × 900 |
|---|---|---|
| Tareas del hilo principal | 2.069 | 1.236 |
| **Tareas largas (> 50 ms)** | **0** | **0** |
| Peor tarea | 8,6 ms | 8,8 ms |
| **Eventos `Paint` del hilo principal** | **0** | **0** |
| Cuadros medidos | 70 | 49 |
| Intervalo mediano entre cuadros | 8,3 ms | 8,3 ms |
| p95 | 8,5 ms | 8,5 ms |
| Peor cuadro | 8,6 ms | 8,8 ms |
| Cuadros por sobre 50 ms | **0** | **0** |

Cero eventos `Paint` durante todo el recorrido significa que **el scroll lo
resuelve el compositor**: el hilo principal no repinta nada al bajar. No hay
repintado masivo que observar, porque no hay repintado.

Revisión estática, que confirma lo mismo por el otro lado: **cero
`addEventListener("scroll")`** en los tres archivos de JavaScript, y **un solo
`@keyframes`** en toda la hoja.

**Conclusión: era un artefacto de la captura, como sospechaba el encargo.** Un
scroll conducido desde CDP fuerza cuadros que el navegador no habría pintado en
ese orden, y la herramienta ve tirones que un usuario no ve.

---

## C. SEO y metadatos

### C1. `apple-touch-icon`

`assets/img/apple-touch-icon.png`, 180 × 180, 1.249 bytes, declarado en el
`<head>`. iOS no lee el favicon SVG, y la FAQ visible dice que Mesura «se agrega
a la pantalla de inicio desde el menú del propio navegador, en iPhone, Android o
computador» — o sea, ese es exactamente el caso que quedaba sin icono: en
iPhone salía una captura de la página en vez de la marca.

Es la misma M del favicon sobre el mismo verde ácido, a sangre completa porque
iOS recorta las esquinas por su cuenta. Lo genera
`docs/redesign/qa/scripts/icono.js`, que **lee `--acid` y `--on-acid` de
`landing.css`** en lugar de copiar los valores: el icono no se puede desfasar de
la marca sin que alguien lo decida.

### C2. `SoftwareApplication` en el JSON-LD

Al `@graph` que ya tenía `WebSite` y `FAQPage` se le agrega:

```json
{
  "@type": "SoftwareApplication",
  "name": "Mesura",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "inLanguage": "es-CL",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CLP",
              "availability": "https://schema.org/LimitedAvailability" }
}
```

**`QA_REPORT.md` §7 había descartado esto**, con el argumento de que «fijar un
precio en datos estructurados es una afirmación comercial, y hoy no hay plan de
pago que declarar». El argumento es correcto para un precio inventado, y no
aplica a este: la FAQ visible dice literalmente «Nada. Hoy Mesura no tiene
ningún cobro: sin planes de pago, sin compras dentro de la app, sin tarjeta», y
el cierre dice «Acceso por invitación» y «los cupos se abren de a poco» — que es
justo lo que significa `LimitedAvailability`.

El bloque **no afirma nada que la página no diga**; lo pone en un formato que
los buscadores leen. Sin `aggregateRating`, sin `Organization`, sin `review`.

El JSON-LD parsea y el `@graph` queda con tres entidades.

### C3. `sitemap.xml`

`<lastmod>` a `2026-08-20`.

---

## D. Endurecimiento del backend

### D1. `functions/api/waitlist.js`

El contrato **no cambió**: `POST { email, website }`, honeypot, idempotencia por
correo, respuestas `{ ok }` o `{ error }` con el mensaje en español, y cero IP y
cero user-agent guardados. Esto último es promesa escrita de la sección «El
trato con tus datos», no un descuido que convenga «mejorar»; queda dicho en el
comentario de cabecera del archivo para que la próxima pasada no lo lea como
omisión.

Lo que se agrega:

| Caso | `main` | Ahora |
|---|---|---|
| `GET`, `PUT`, `DELETE`, `OPTIONS`, `PATCH` | caía en el comodín de Pages y devolvía **la landing entera con 200** | **405** con `Allow: POST` |
| `Content-Type` que no es JSON | se parseaba igual | **415**, antes de leer el cuerpo |
| Cuerpo de más de 1 KB | se leía y parseaba entero | **413** |
| Cuerpo `null`, `3`, `"hola"`, `[1,2]` | **reventaba** en `body.website` | **400** |

El 415 cierra además el envío desde un formulario de otro origen, que es lo
único que `form-action 'self'` no alcanza a cubrir. El 413 mira
`Content-Length` como filtro barato y **vuelve a comprobar el largo real tras
leer**, porque ese header puede faltar o mentir.

El caso del cuerpo `null` es un **defecto que ya estaba en `main`**: un POST con
ese cuerpo lanzaba un error sin capturar. Salió a la luz al escribir las
pruebas.

**Verificación: 17/17**, con un KV falso y sin tocar el endpoint real. El mismo
arnés contra la versión de `main` da **9/17**: fallan las ocho pruebas nuevas y
pasan las seis del contrato. Eso es exactamente lo que tenía que ocurrir, y es
la prueba de que el contrato no se movió y de que las pruebas nuevas fallan
cuando deben fallar.

### D2. `_headers`

**Aplicado: `Cross-Origin-Opener-Policy: same-origin`.** La landing no abre
ventanas ni depende de `window.opener`, así que aislar el grupo de contexto no
le quita nada. Va en el bloque `/*`, que no declara `Cache-Control`: la
concatenación de reglas de Pages sigue sin riesgo y los assets conservan su año
de caché — verificado, el HTML sale sin `Cache-Control` y `/assets/*` con
`public, max-age=31536000, immutable`.

**No aplicado: separar `style-src 'self'` de `style-src-attr 'unsafe-inline'`.**
Se midió con `npm run csp`, sirviendo la página con las tres políticas:

| Política | `style=` aplica | Violaciones de CSP en consola |
|---|---|---|
| Hoy: `style-src 'self' 'unsafe-inline'` | sí | 0 |
| Propuesta, en un motor con soporte | sí | 0 |
| **Fallback: motor sin `style-src-attr`** | **con JS sí, sin JS no** | **18 por carga** |

El fallback es el caso que decide. Los motores que no implementan
`style-src-attr` ignoran la directiva y caen a `style-src`, que ahí ya no trae
`'unsafe-inline'`. Servida así y **sin JavaScript** —la degradación que el
README promete— la hoja del mes se rompe:

| | Correcto | Con la CSP propuesta, sin JS |
|---|---|---|
| Barra de ritmo | 277 px (67 %) | **414 px (se pinta al 100 %)** |
| Marca del día esperado | +241 px | **+1 px** |
| Segmento de categoría | 177 px, naranja | **446 px, sin color** |

Con JavaScript la demo se recupera, porque escribe por CSSOM y la CSP no
gobierna eso — pero la consola acumula 18 violaciones por carga igual.

Hoy los motores sin soporte son Gecko y WebKit, y **Firefox sigue sin probarse
en este proyecto** (`QA_REPORT.md` §6). No hay forma de garantizar el fallback,
así que no se aplica. La decisión y su evidencia quedan escritas en el propio
`_headers`, donde las va a leer quien vuelva a tener la idea.

---

## E. El QA institucionalizado

### E1. `docs/redesign/qa/`

`QA_RITMO.md` §10 lo pide con nombre y apellido: los scripts se reconstruyeron
dos veces por no estar versionados. Ahora viven en el repositorio, con
`package.json` propio y aislado. **La landing sigue sin build, sin `npm` y sin
dependencias**, y `.assetsignore` ya excluye `docs` del despliegue, así que nada
de esto llega a producción.

```
cd docs/redesign/qa && npm install && npm test
```

Node 20+ y el Chrome del equipo. `puppeteer-core` no descarga navegador;
`CHROME_PATH` lo apunta si está en otra ruta.

| Bloque de `npm test` | Resultado |
|---|---|
| `waitlist` — contrato del endpoint contra un KV falso | **17/17** |
| `viewports` — alto, desborde y consola, 5 anchos × 2 temas | **10/10** |
| `anclas` — los seis destinos bajo la cabecera | **60/60** |
| `red` — peticiones a terceros y cabeceras de seguridad | **0 terceros · 6/6 cabeceras** |
| `axe` — axe-core en 10 configuraciones | **0 violaciones · 46 reglas superadas** |
| `funcional` — demo, calculadora, formulario, teclado, tema, movimiento | **24/24** |
| `perf` — fluidez del scroll | **0 tareas largas · 0 `Paint`** |

Fuera de `npm test` porque tardan o escriben archivos: `lighthouse`, `capturas`,
`minificar`, `csp`, `icono`, `serve`.

Tres decisiones del arnés que vale la pena conocer:

- **`/api/waitlist` es siempre un mock en memoria.** Nunca el endpoint real.
- **El servidor lee `_headers` del repositorio y concatena las reglas que
  coinciden**, igual que Pages. Si vuelve a colarse un `Cache-Control` duplicado
  —el problema de `QA_REPORT.md` §8 bis, que caducó los assets en cinco minutos
  en vez de un año— se ve acá y no en producción.
- **`axe` se inyecta como fuente evaluada por CDP**, no como `<script src>`: la
  CSP es `script-src 'self'` y bloquearía la etiqueta. Se evalúa en vez de
  desactivar la CSP, para auditar la página tal como se sirve.

Los puntos ciegos del propio arnés están escritos en su `README.md`, incluido el
que dejó pasar la regresión de `QA_RITMO.md` §11.1: **las pruebas de `[hidden]`
miran el renderizado, no el atributo.**

### E2. Este informe

Es E2.

---

## F. Matriz de viewports, antes y después

Cinco anchos × dos temas. `main` y esta rama, mismo servidor, mismo navegador.

| Viewport | Alto en `main` | Alto ahora | Desborde | Desborde sin máscara | Consola |
|---|---|---|---|---|---|
| 360 × 800 | 8.432 px | 8.432 px | 0 | 0 | 0 |
| 390 × 844 | 7.959 px | 7.959 px | 0 | 0 | 0 |
| 768 × 1.024 | 6.603 px | 6.603 px | 0 | 0 | 0 |
| 1.024 × 768 | 4.979 px | 4.979 px | 0 | 0 | 0 |
| 1.440 × 900 | 5.234 px | 5.234 px | 0 | 0 | 0 |

**Ninguna altura cambió, y así debía ser**: `scroll-margin-top` no ocupa
espacio, solo desplaza el aterrizaje del ancla. Que la tabla sea plana es el
resultado correcto, no una tabla de relleno.

El desborde se mide dos veces: como lo ve el usuario y con
`body { overflow-x }` desactivado, excluyendo el honeypot en `left: -9999px`,
que es desborde deliberado. Sin esa segunda medición cualquier regresión de
ancho quedaría enmascarada (`QA_RITMO.md` §1.6).

Idéntico en claro y oscuro en las diez configuraciones.

---

## G. Accesibilidad

**axe-core**, reglas `wcag2a` + `wcag2aa` + `wcag21a` + `wcag21aa` +
`best-practice`, con todos los `<details>` abiertos:

| Configuración | Violaciones | Reglas superadas | Incompletas |
|---|---|---|---|
| 360 × 800, claro y oscuro | **0** | 46 | 0 |
| 390 × 844, claro y oscuro | **0** | 46 | 0 |
| 768 × 1.024, claro y oscuro | **0** | 46 | 0 |
| 1.024 × 768, claro y oscuro | **0** | 46 | 0 |
| 1.440 × 900, claro y oscuro | **0** | 46 | 0 |

Idéntico a los dos informes anteriores. Lighthouse coincide: Accesibilidad 100
en móvil y escritorio.

Lo conquistado sigue en pie, comprobado por las pruebas funcionales: el
recorrido de teclado completo **sin un solo elemento sin foco visible**, los
`aria-live` de demo, calculadora y formulario respondiendo, `prefers-reduced-
motion` llevando las transiciones a 0,001 s, el modo oscuro pintando
`rgb(27, 25, 20)`, y **sin JavaScript no se pinta ningún control muerto** —el
CTA de la demo y la `.jot` siguen con `display: none` y altura cero, que es la
regresión que §11.1 encontró y que esta prueba defiende.

---

## H. Archivos modificados

| Archivo | Qué cambió |
|---|---|
| `assets/css/landing.css` | `--masthead-h` y `--anchor-gap` junto al masthead; `scroll-margin-top` en los seis destinos; se retiran los dos `scroll-padding-top` literales |
| `index.html` | `<link rel="apple-touch-icon">`; entidad `SoftwareApplication` en el `@graph` |
| `assets/img/apple-touch-icon.png` | Nuevo, 180 × 180, generado desde los tokens de `landing.css` |
| `sitemap.xml` | `<lastmod>` |
| `functions/api/waitlist.js` | 405 con `Allow`, 415, 413, 400 para cuerpo no-objeto; contrato intacto |
| `_headers` | `Cross-Origin-Opener-Policy`; la decisión sobre `style-src-attr`, documentada |
| `docs/redesign/qa/` | El arnés completo |
| `docs/redesign/screenshots/mejoras-2026-08-20/` | 24 capturas antes/después y `medidas.json` |
| `docs/redesign/QA_MEJORAS.md` | Este informe |
| `README.md`, `docs/redesign/QA_REPORT.md`, `docs/redesign/QA_RITMO.md` | Remisiones a este informe y a los pendientes ya cerrados |

**No se tocaron**: `assets/js/*.js`, `_redirects`, `robots.txt`,
`wrangler.jsonc`, `.assetsignore`, las tipografías, ni una sola línea de texto
visible de la página.

---

## I. Riesgos y pendientes

### Abiertos por esta rama

1. **Lighthouse se midió contra localhost, no contra producción.** Móvil 99 y
   escritorio 100 no son comparables con el 95 / 100 de `QA_REPORT.md` §8 bis,
   que sí midió contra la red real. **Conviene volver a medir después de
   desplegar**, y comparar con esa tabla, no con esta.
2. **`Cross-Origin-Opener-Policy` no se probó en producción.** En local es
   inofensiva y la página no abre ventanas, pero COOP solo se honra en contexto
   seguro y hay una interacción conocida con `window.open` que aquí no aplica
   porque no hay ninguno. Vale una mirada a la consola tras el despliegue.
3. **El endurecimiento del endpoint se probó con un KV falso, no con
   Wrangler.** Las 17 pruebas ejercen el módulo tal cual, pero el enrutamiento
   real de Pages —cómo convive el `onRequest` exportado con `onRequestPost` para
   un POST— no se puede reproducir sin levantar el runtime. El código está
   escrito para que las dos rutas posibles den el mismo resultado: si Pages
   entrega el POST a `onRequest`, delega en `onRequestPost` con el mismo
   contexto; si lo entrega directo a `onRequestPost`, tampoco cambia nada.
   **Aun así, el primer POST después del despliegue conviene mirarlo** — sin
   enviar un correo real: basta comprobar que un `GET /api/waitlist` devuelve
   405 y no la landing.
4. **`--masthead-h` es un valor medido, no calculado.** Si alguien cambia el
   `padding` o el tamaño de fuente de la cabecera, hay que actualizarlo — pero
   ahora está a cinco líneas de lo que lo determina, y `npm run anclas` lo
   detecta. Antes estaba a 300 líneas y no lo detectaba nadie.

### Heredados, que siguen abiertos

5. **Firefox sin probar.** Es el mismo pendiente de `QA_REPORT.md` §6 y
   `QA_RITMO.md` §7.6, y esta rama lo vuelve más relevante: es justamente el
   motor donde `scroll-padding-top` en el contenedor tenía peor soporte, y donde
   habría fallado la CSP con `style-src-attr`. El arnés corre solo en Chrome.
   **Vale una pasada manual.**
6. **Las cifras tienen fecha de vencimiento.** El 11,9 % de la CMF corresponde a
   datos de junio de 2025; la 13ª versión saldría en enero de 2027. El estudio
   CPP UC tiene terreno de diciembre de 2024. Conviene revisarlas una vez al
   año. Sin cambios en esta rama.
7. **Dos inexactitudes en la política de privacidad del producto**, que viven en
   el repositorio de la app (`mesurapp`) y no en este:
   `app/privacidad/page.tsx:60` dice que Google interviene solo si conectas
   Drive —falso: interviene en todo correo— y `:31` dice que la hoja se comparte
   «como lectora/editora» cuando el código solo agrega lector. Detalle en
   `CLAIM_INVENTORY.md` §6. **Fuera del alcance de esta rama.**
8. **«En pesos chilenos» y la línea de Cloudflare/Google en «Lo que Mesura
   usa».** Pendientes conocidos que dependen de verificar el repositorio de la
   app. El encargo los excluye expresamente y no se tocaron.
9. **El plan Pro sigue vivo en `docs/ESTRATEGIA.md`.** Correcto como documento
   interno; depende de que `/docs/*` siga cerrado, cosa que `QA_REPORT.md` §9.1
   ya verificó tras el despliegue.
10. **`.moment h3` sigue en 22ch.** Señalado en `QA_RITMO.md` §9.4 y no
    corregido; sigue igual.
11. **Reordenar `.sheet` en móvil con `order`** sigue evaluado y descartado
    (`QA_RITMO.md` §9.3). Es decisión del dueño, no técnica, y esta rama no la
    tocó.
12. **El plan de medición por `CustomEvent`** (`mesura:event`) queda como está.
    No se agregó analítica de ningún tipo.

---

## J. Cómo reproducir todo esto

```
cd docs/redesign/qa
npm install
npm test              # los siete bloques
npm run lighthouse    # tarda unos minutos
npm run capturas      # regenera las 24 imágenes antes/después
npm run minificar     # rehace la medición de B2
npm run csp           # rehace el experimento de D2
```

El detalle de cada script, sus supuestos y sus puntos ciegos están en
[`docs/redesign/qa/README.md`](qa/README.md).
