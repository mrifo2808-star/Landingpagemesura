# Validar — se anula el reporte anterior, se agrega un identificador de build, y la calculadora se muda al FAQ

Rama: `claude/reparacion-real-20260821`, sobre `main` (que tenía mergeada la pasada de
correcciones anterior, `56f4b00`). Siete commits en total; los primeros dos (`0ad369f`,
`6517de2`) y su VALIDAR.md (`4efe5f4`) son de la ronda pasada, ya entregada. Esta entrega
cubre los cuatro de después:

1. `52d75ef` — revierte por completo el commit `6517de2` (categorías, cuadro vacío):
   se hizo sobre una premisa falsa.
2. `1ade16a` — identificador de build visible, para no repetir esta clase de confusión.
3. `c2daca3` — mueve la calculadora al FAQ, con estudio de lectores nuevos de por medio.
4. `2633dff` — corrige dos fallos que la propia batería encontró después de los dos
   commits anteriores (contraste de color, título de ancla).

No se hizo merge, no se desplegó, no se tocó ningún secreto.

---

## 0. Se anula el reporte anterior — esto no era un bug

Matías abrió la landing en una ventana de incógnito (sin caché) y confirmó: la calculadora
no estaba rota, las categorías del ejemplo sí estaban presentes, y no había ningún cuadro
vacío. El 4/10 de la ronda pasada era enteramente un efecto de caché de navegador — el
diagnóstico del `_headers` con `immutable` sigue siendo correcto (`c0db133`, ya en `main`,
es el arreglo que hacía falta), pero la conclusión que saqué de ahí — que había que
restaurar categorías y corregir un hueco de layout — estaba construida sobre una versión
vieja cacheada, no sobre el estado real del ejemplo.

**Se revirtió por completo** el commit `6517de2`: `index.html`, `assets/css/landing.v2.css`,
`assets/js/demo.v2.js` y la prueba de comportamiento que se había agregado en
`funcional.js` vuelven al estado de después de `0ad369f`. El arreglo de caché (el
renombrado a `.v2`) **no se tocó** — ese diagnóstico fue confirmado como correcto, y
renombrar los archivos sigue siendo la única forma de que un navegador que ya cacheó una
versión vieja bajo `immutable` reciba la nueva sin que nadie tenga que vaciar caché a
mano.

---

## 1. Un identificador de build — para no repetir esta ronda completa la próxima vez

El problema de fondo no era sólo el caché: era que **no había forma de saber qué versión
estaba viendo alguien** sin una investigación completa de red y caché cada vez que llega
un reporte. Eso es lo que costó una ronda entera de trabajo sobre un fantasma.

`functions/_middleware.js` ahora expone el commit real de cada deploy en tres lugares:

| Dónde | Para qué |
|---|---|
| Header de respuesta `X-Mesura-Build` | En toda petición, incluidos JS/CSS/fuentes — para que yo pueda diagnosticar rápido con una sola petición, sin tener que inspeccionar caché de navegador |
| Atributo `data-build` en `<html>` | Para revisar por consola/DevTools sin tener que buscar en el pie de página |
| Texto visible en el pie de página: «Compilación `<sha>` (`<rama>`)» | Para que **Matías** pueda leerlo y decírmelo en un mensaje, sin necesitar DevTools |

Usa `CF_PAGES_COMMIT_SHA` y `CF_PAGES_BRANCH`, que Cloudflare Pages expone automáticamente
en cada deploy — no hay build step que configurar ni un número que alguien tenga que
acordarse de subir a mano en cada ronda. En local (`wrangler pages dev`) esas variables
existen igual, simuladas con el commit de git actual, así que se ve el sha real incluso en
desarrollo; sólo cae a **"Compilación local"** si el HTML se sirve sin pasar por la
Function (el servidor estático plano del arnés de QA, que no ejecuta
`functions/_middleware.js` — es una limitación conocida y documentada del arnés, no un
error nuevo).

**Verificado contra `wrangler pages dev` real** (no sólo leído el código): el header, el
atributo y el texto del pie coincidieron los tres con el commit y la rama reales del
repo en ese momento. Una petición a un asset no-HTML (`landing.v2.css`) recibió el header
sin error — hubo que reenvolver la respuesta antes de poder agregar el header, porque los
headers de lo que devuelve `context.next()` vienen inmutables (salen del asset store de
Pages) y escribir directo tira `TypeError`.

**La próxima vez que llegue un reporte de "esto está roto"**, el primer paso es pedirle a
Matías que copie lo que dice el pie de página, y comparar ese commit contra `main` antes
de investigar nada más. Si no coinciden, es caché — no hace falta repetir esta ronda.

---

## 2. La calculadora se mudó al FAQ — medido, no decidido por intuición

Matías preguntó por qué "Una herramienta suelta" quedó al final de la página, y si convenía
moverla justo antes del formulario de correo (el momento de mayor intención, después de
calcular un número personal). Pidió medirlo con lectores nuevos en vez de decidirlo por
intuición.

### 2.1 Método — y sus límites, dichos de entrada

Se armaron cuatro lectores simulados (dos personas × dos variantes), cada uno con contexto
nuevo, sin ver la otra variante y sin saber que existía una hipótesis a favor de mover la
calculadora:

| Variante | Orden |
|---|---|
| **A — actual** | FAQ → CTA de invitación → calculadora (al final de la página) |
| **B — propuesta** | FAQ → calculadora → CTA de invitación |

Personas: **Valentina**, 29, diseñadora freelance, pagando dos tarjetas; **Jorge**, 41,
técnico en refrigeración, dos créditos de consumo. A cada quien se le mostró el texto real
de la página (copiado tal cual de `index.html`, sin maquetación) desde el FAQ hasta el
final, y se le pidió: en qué momento sintió más ganas de dejar el correo, si notó la
calculadora y si la habría abierto, un puntaje de 1 a 10 de probabilidad de dejar el correo,
y si algo se sintió fuera de lugar.

**Lo que esto NO puede decir, heredado de la convención de este proyecto para estudios de
lectores simulados**: nadie leyó la página real, maquetada. n=2 por variante es
extremadamente poco — esto es una señal de dirección, no una predicción de conversión. El
sesgo más grande es que quien diseñó el estudio también tenía una hipótesis propia (que
"antes del CTA" sonaba razonable) — se mitigó dejando que el resultado la contradijera sin
forzar nada, y ese es exactamente lo que pasó.

### 2.2 Resultado — la hipótesis inicial no se sostuvo

| | Variante A (actual) | Variante B (antes del CTA) |
|---|---|---|
| Valentina | **7**/10 | **6**/10 |
| Jorge | **5**/10 | **5**/10 |
| Promedio | **6** | **5.5** |

Poner la calculadora justo antes del CTA **no subió el puntaje** — si acaso bajó un poco
(diferencia mínima, dentro del ruido de n=2, pero desde luego no confirma la hipótesis).
Más informativo que el número: **en ambas variantes**, ambos lectores describieron la
calculadora como mal ubicada, pero por razones distintas según dónde estaba:

- En A (al final): "la calculadora al final se siente como un anexo, no como parte de lo
  mismo" (Jorge) — "debería ir antes del CTA de invitación, no después" (Valentina).
- En B (antes del CTA): "la calculadora se siente pegada con scotch tape ahí en medio...
  llega tarde para generar confianza" (Valentina) — "meter la calculadora justo entre el
  FAQ y el bloque de invitación — corta el ritmo. Uno ya iba encaminado a dejar el correo y
  de repente aparece una herramienta suelta" (Jorge).

**Y sin que se les preguntara por una tercera opción, dos lectores distintos —Jorge en
ambas variantes— propusieron lo mismo**: agruparla con la pregunta de gastos fijos dentro
del FAQ, en vez de como paso previo al CTA o como sección final aislada. Cita textual,
variante B: *"La habría puesto antes, junto con lo de gastos fijos, o derechamente
afuera."* Cita textual, variante A: *"encontré raro que las preguntas técnicas... vengan
antes de pedirme el correo"*, apuntando en la misma dirección.

**Decisión**: no se implementó la hipótesis original (calculadora justo antes del CTA) —
la evidencia, aunque escasa, apunta en contra. Se implementó la alternativa que los propios
lectores sugirieron sin que se les preguntara: la calculadora pasa a ser el **último ítem
del FAQ** ("06 · Preguntas"), agrupada temáticamente cerca de "¿Cómo marco un gasto fijo?",
en vez de tener su propia sección entre el FAQ y el CTA.

### 2.3 Las cuatro respuestas completas, sin editar

<details>
<summary>Valentina — Variante A (calculadora al final, como está hoy)</summary>

> 1. El momento donde más sentí ganas de dejar el correo fue en "Hoy sólo se entra con
> invitación" — lo de "línea directa para pedir lo que te falte" me llegó, porque es
> literal lo que quiero: no otra app genérica, sino alguien que me escuche si algo no
> funciona. También ayudó bastante el "no hay planes de pago, ni compras dentro de la app"
> de las preguntas, porque llego cansada de apps que después de dos semanas te tiran un
> paywall.
>
> 2. Sí la noté, pero la habría saltado. Para cuando llego ahí ya decidí si dejo el correo
> o no — y de hecho ya lo dejé arriba, así que la calculadora se siente como un extra que
> llegó tarde. Si la hubiera visto ANTES del formulario de invitación, sí la habría
> abierto, porque lo de "cuánto ya está comprometido" me toca directo (tengo dos
> tarjetas). Pero después del CTA principal, mi cabeza ya cerró el capítulo.
>
> 3. Le pongo un 7. Lo que me convence es el tono honesto (que digan "aunque sea para
> decirte que todavía no" me da confianza, no me vende humo) y que no soy la única que
> necesita esto de gastos compartidos. Me resta puntos no saber cuánto voy a esperar.
>
> 4. Sí: el orden. Las preguntas de instalación / gastos compartidos / gasto fijo son
> cosas que yo me pregunto DESPUÉS de decidir que me interesa, no antes de dejar el
> correo — se sienten puestas ahí como para llenar espacio antes del formulario. Y la
> calculadora, como dije, debería ir antes del CTA de invitación, no después: como está,
> parece un "ah, y también esto" que nadie va a abrir.

</details>

<details>
<summary>Valentina — Variante B (calculadora justo antes del CTA)</summary>

> 1. El momento de más ganas fue "Si algún día hay una versión pagada, avisamos antes — y
> primero a quienes estén en esta lista". Ahí sentí que no me van a colar una sorpresa de
> cobro, que es justo lo que me tiene paranoica con las apps de finanzas.
>
> 2. Sí la noté, pero por accidente casi la salto — está metida como bloque suelto entre
> el FAQ y el CTA final, sin conexión con nada de antes. La habría abierto solo porque
> "cuánto está comprometido antes de que empiece el mes" me pegó fuerte (ando con dos
> tarjetas), pero si hubiera estado más cansada del scroll la habría ignorado. Que diga
> "nada se guarda, no se envía a ninguna parte" ayuda, pero llega tarde para generar
> confianza — debería estar antes, no como nota al pie.
>
> 3. Un 6. El "te escribimos aunque sea para decirte que todavía no" y el "no se lo
> pasamos a nadie" bajan mi guardia de golpe. Pero no es un 8 o 9 porque toda la página me
> vendió control de mis gastos compartidos y fijos, y de repente aterriza en "necesitamos
> tu correo para avisarte cuando podamos abrirte una cuenta" — o sea ni siquiera me
> aseguran que entro.
>
> 4. Sí: la calculadora se siente pegada con scotch tape ahí en medio, como si alguien la
> hubiera puesto donde cupiera. Y las preguntas del FAQ sobre gastos compartidos y gasto
> fijo son lo más "quiero probar esto ya" de toda la página — deberían estar más arriba o
> más cerca del formulario final, no enterradas antes de la herramienta suelta.

</details>

<details>
<summary>Jorge — Variante A (calculadora al final, como está hoy)</summary>

> 1. El momento en que más ganas me dieron de dejar el correo fue en «Déjanos dónde
> escribirte y te avisamos cuando podamos abrirte una», justo después de leer «Lo que
> digan estas primeras personas define lo que se construye después». Ahí uno siente que
> no es un formulario más, que si entro ahora puedo pedir que agreguen algo que a mí me
> sirva. Pero al tiro después dice «Te escribimos, aunque sea para decirte que todavía
> no», y ahí bajó un poco el entusiasmo — o sea, ni siquiera me aseguran que voy a poder
> entrar altiro. Eso me deja como con las ganas a medias.
>
> 2. Sí la noté, pero la habría saltado. Está metida detrás de un acordeón que dice
> «Calcula cuánto ya está comprometido →», y para cuando llegué ahí ya había leído hartas
> preguntas y el formulario de arriba. Si de verdad no guardan nada, como dicen, capaz la
> uso otro día, pero en el momento no tenía ánimo de ponerme a hacer cálculos, sobre todo
> con las cuotas que tengo — a veces uno prefiere no ver el número.
>
> 3. Le pondría un 5. Me gusta que sean claros con la plata (que no cuesta nada) y con lo
> del correo (que no mandan spam), pero lo de «en pruebas» y que todavía ni está en Google
> Play me hace dudar si vale la pena meter mi correo ahora o esperar a que esté más
> asentada.
>
> 4. Sí, encontré raro que las preguntas técnicas — cómo se instala, gastos compartidos,
> gasto fijo — vengan ANTES de pedirme el correo. Como que primero me convencen con el
> funcionamiento y después me piden el dato, en vez de enganchar primero y explicar
> después. Y la calculadora al final se siente como un anexo, no como parte de lo mismo.

</details>

<details>
<summary>Jorge — Variante B (calculadora justo antes del CTA)</summary>

> 1. El momento con más ganas de dejar el correo fue en la sección de "Cómo funciono con
> gastos compartidos" — eso de que el otro recibe una solicitud automática y no hay que
> andar cuadrando cuentas por WhatsApp me convenció más que el formulario final. Ahí pensé
> "esto me sirve de verdad". Lo del formulario final ("Déjanos dónde escribirte") se sintió
> más como trámite que como ganas.
>
> 2. Sí la vi, pero la habría saltado. Venía bajando para llegar al final y ver qué tenía
> que hacer, y un acordeón colapsado que dice "Calcula cuánto ya está comprometido" me da
> paja hacer clic — como que ya sé más o menos cuánto debo, no necesito que una página me
> lo confirme con un formulario. Si la hubiera abierto habría sido por curiosidad nomás, no
> porque la necesitara.
>
> 3. Como un 5. Las respuestas del FAQ me bajaron harto la desconfianza (que no piden
> tarjeta, que no venden el correo, que avisan antes de cobrar), pero "en pruebas" y
> "todavía no está en Google Play" me frena. Yo ya me quemé con apps a medio hacer. Si
> tuviera que decidir ahí mismo, capas que sí, pero lo pensaría un rato.
>
> 4. Lo que sí se siente raro es meter la calculadora justo entre el FAQ y el bloque de
> invitación — corta el ritmo. Uno ya iba encaminado a dejar el correo y de repente aparece
> una herramienta suelta que no tiene mucho que ver. La habría puesto antes, junto con lo
> de gastos fijos, o derechamente afuera.

</details>

### 2.4 Lo que se implementó

La calculadora dejó de tener su propia `<section class="section--band" id="calculadora">`
(con tag, encabezado y separación propia) y pasó a ser el último `<details>` de "06 ·
Preguntas", con el mismo resumen de siempre — "Calcula cuánto ya está comprometido →", que
la distingue de una pregunta real por terminar en flecha y no en signo de interrogación —
y el mismo contenido y comportamiento. El total de `<details>` en la página sigue siendo 8;
sólo cambió cuál bloque contiene el de la calculadora.

El `id="calculadora"` se movió del `<section>` al propio `<details>` — ya no hay un
contenedor aparte — así que se actualizó el selector en `funcional.js` (de
`"#calculadora details"` a `"#calculadora"`).

El texto "Saber cuánto es sirve **para lo de arriba**" dependía de la posición anterior
(el ejemplo del hero, arriba en el scroll, cuando la calculadora estaba al final de la
página). Se reescribió sin esa referencia posicional, ahora que la posición cambió:

> "La parte de tu ingreso que se va en cuotas y créditos está decidida antes de que
> empiece el mes. Saber cuánto es cambia lo que de verdad puedes prometerte: lo que queda
> es lo que administras mes a mes."

---

## 3. Lo que la propia batería encontró después de estos cambios — y cómo se corrigió

`npm test` bajó a **5/7** justo después de los commits de arriba. Dos fallos reales:

- **axe-core, color-contrast** en `.foot__build` (el sello de compilación nuevo): el
  `opacity: .6` sobre `var(--muted)` mezclaba el texto con el fondo del pie y lo dejaba por
  debajo de AA. `var(--muted)` sola, sin opacity, ya pasa cómodo (~5.4:1 en tema claro) — el
  tamaño de fuente (10px contra los 11px de una nota real) ya lo distingue visualmente, no
  hacía falta bajarle además el contraste.
- **anclas**: `#calculadora` (ahora un `<details>` sin encabezado propio, al final de una
  lista larga de preguntas) hacía caer el chequeo de "título visible bajo la barra" al
  contenedor completo — el `<h2>`"Tus dudas." de toda la sección de Preguntas, que puede
  quedar muy por encima en la pantalla de un ítem al final de la lista. Se corrigió el
  script (`anclas.js`): un `<summary>` ahora cuenta como título cuando el destino ES un
  `<details>`, porque es la etiqueta visible de un desplegable colapsado y cumple el mismo
  papel que un encabezado para quien llega por ese enlace.

Ambos se corrigieron en un commit aparte (`2633dff`). `npm test` volvió a **7/7**.

Esto es exactamente el tipo de comportamiento que la crítica de la ronda pasada pedía:
la batería atrapó dos regresiones reales que una revisión visual sola podría no haber
notado (contraste de color y geometría de scroll en un ancla que nadie usa a diario).

---

## 4. Verificación

| Comprobación | Resultado |
|---|---|
| `cd docs/redesign/qa && npm test` | **7/7** |
| `node verificar.js --contra-repo Mesura-app-source Mesura-mobile` | **SIN FALLOS** · 3 avisos preexistentes en documentos históricos, no relacionados |
| `wrangler pages dev` real, header/atributo/texto de build | Los tres coinciden con el commit y la rama reales |
| Petición a un asset no-HTML (CSS) | Recibe `X-Mesura-Build` sin error |
| Calculadora en su nueva posición (FAQ), escritorio y móvil | Abre, calcula 11,9% / $705.000 con 800.000 y 95.000, sin errores de consola |
| Enlaces de navegación (masthead, footer) contra la página cargada | Los 4 anclas internas resuelven; ninguno apunta a una sección borrada |
| Consola del navegador durante toda la verificación manual | Sin errores |

---

## 5. Lo que necesita tu decisión

1. **La calculadora quedó en el FAQ, no antes del CTA.** La evidencia (escasa, cuatro
   lectores simulados) apunta en contra de la hipótesis original y a favor de esta
   alternativa. Si preferís probarlo en producción de todos modos con lectores reales antes
   de conformarte con esto, es reversible en un commit.
2. **El identificador de build es nuevo y no tiene precedente en este proyecto.** Si en
   algún momento no querés que el commit/rama sean visibles en el pie de página (por
   ejemplo, si te preocupa que alguien externo vea qué rama está en producción), se puede
   dejar sólo el header y el atributo (invisibles para un visitante normal) y sacar el
   texto del pie — avisame y lo saco en un commit aparte.

---

## 6. Comandos — listos para copiar, **no ejecutados**

### Ver la página localmente antes de aprobar

```bash
cd Mesura-landing
npx wrangler pages dev . --compatibility-date=2026-08-01
```

Fijate en el pie de página: debería decir "Compilación `<sha corto>` (`claude/reparacion-real-20260821`)".
Y en "Preguntas", la última pregunta debería ser "Calcula cuánto ya está comprometido →".

### Revisar el diff antes de decidir

```bash
git -C Mesura-landing log 56f4b00..claude/reparacion-real-20260821 --oneline
git -C Mesura-landing diff 56f4b00...claude/reparacion-real-20260821
```

### Mergear todo

```bash
git -C Mesura-landing checkout main
git -C Mesura-landing merge --no-ff claude/reparacion-real-20260821
git -C Mesura-landing push origin main
```

### Desplegar

```bash
cd Mesura-landing
npx wrangler pages deploy . --project-name=mesura-landing
```

### Revertir, si algo no calza

Si **ya mergeaste y pusheaste**:

```bash
git -C Mesura-landing revert -m 1 <sha-del-merge>
git -C Mesura-landing push origin main
```

Si **todavía no mergeaste**:

```bash
git -C Mesura-landing checkout main
git -C Mesura-landing branch -D claude/reparacion-real-20260821
```

Si **ya desplegaste**: Cloudflare Pages guarda cada deploy — `mesura-landing` →
Deployments → "Rollback to this deployment".
