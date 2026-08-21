# Validar — upgrade real del 21 de agosto de 2026: panel de once especialistas, árbitro único, y una verdad que ya era falsa

Rama: `claude/upgrade-real-20260821`, sobre `main` (arriba de `5bb1506`, el merge de la
pasada anterior). Dos commits de sustancia:

1. `8bd2900` — el ejemplo del ritmo mostraba una nota falsa. La app real invirtió su
   jerarquía el 19-20 de agosto; el ejemplo seguía mostrando la vieja.
2. `53f520e` — el upgrade real: recorte de scroll móvil (13,6 → 11,4 pantallas), FAQ de
   12 a 9 preguntas, jerarquía de CTA corregida, accesibilidad, sin borrar ningún hecho
   divulgado.

No se hizo merge, no se desplegó, no se tocó ningún secreto.

Le pusiste 3/10 a la página después de dos rondas seguidas de corrección — esa nota, y
el pedido explícito de convocar especialistas y "hacer un upgrade real", son el punto de
partida de todo este documento. **No traté el 3/10 como una exageración**: convoqué el
panel, y el especialista que evaluó exactamente lo mismo que tú mirabas — el teléfono —
llegó, sin saber tu nota, al mismo número: 3/10.

---

## 0. La hipótesis que pediste verificar primero, y lo que confirmó

Medí la página en un viewport real de teléfono (375×812) **antes de convocar a nadie**:

| Métrica (375×812, antes de este pase) | Valor |
|---|---|
| Altura total de la página | 11.027px → **13,6 pantallas completas de scroll** |
| Sólo el hero + el ejemplo interactivo | 2.723px → **3,35 pantallas**, antes de la primera sección de contenido |
| Elementos visuales (imagen/foto/ilustración) en toda la página | **Cero** — el "ejemplo" es una tarjeta interactiva de verdad (funciona), pero visualmente es sólo texto y números |
| Palabras visibles sin abrir ningún acordeón | 1.850 |

La hipótesis era correcta: el problema dominante era el teléfono, no el escritorio. Las
dos rondas anteriores habían medido principalmente en escritorio.

---

## 1. El panel — once informes, cada uno ciego a los demás

Cada especialista corrió como un agente separado, **sin contexto de esta conversación y
sin saber qué opinaron los demás**, leyendo la página real (`index.html`, `landing.css`,
`demo.js`, y donde correspondía, `Mesura-app-source`/`Mesura-mobile`/`Mesura-lanzamiento`
directamente). El texto completo de los once, sin editar, está en
[`docs/redesign/PANEL-20260821.md`](docs/redesign/PANEL-20260821.md), versionado en el
commit `8bd2900`. Se reproduce íntegro en el §7 (apéndice) de este documento para que el
criterio quede auditable sin salir de aquí.

| # | Especialista | Nota |
|---|---|---|
| 1 | FAQ — cantidad, forma y contenido de las preguntas | 4/10 |
| 2 | Cantidad de texto y densidad de descripciones | 4/10 |
| 3 | Mercado A — posicionamiento competitivo | 6/10 |
| 4 | Lector simulado — primera impresión, 3 segundos en teléfono | 7/10 |
| 5 | Conversión (CRO) — fricción entre llegada y correo | 5/10 |
| 6 | **UX móvil** (todo evaluado en viewport de teléfono) | **3/10 — misma nota que tú** |
| 7 | Diseño de interfaz — retícula y jerarquía visual | 7/10 |
| 8 | Mercado B — adquisición y crecimiento invite-only | 5/10 |
| 9 | Estructura y sistema tipográfico | 6/10 |
| 10 | Accesibilidad (WCAG) | 7/10 |
| 11 | Auditoría de coherencia: landing vs. app real | 7/10 |

**Promedio: 5,7/10.** El patrón que emergió, sin que yo lo dirigiera: retícula, sistema
de espaciado y uso del color puntuaron alto (7/10) — ese trabajo de las dos rondas
anteriores no estaba mal hecho. El problema estaba concentrado en volumen de contenido,
estructura móvil, y una jerarquía de CTA invertida — exactamente donde apuntaste tú.

**Añadí cuatro especialistas** más allá de los que pediste explícitamente (texto, FAQ,
estructura/tipografía, dos de mercado), porque el encargo los necesitaba:
diseño de interfaz (retícula/aire — para separar "hay mucho texto" de "está mal
maquetado"), UX móvil dedicado (tu hipótesis principal necesitaba su propio especialista,
no una mención de pasada), conversión/CRO (la fricción entre llegar y dejar el correo es
un problema distinto al de posicionamiento de mercado), accesibilidad (nadie lo había
auditado más allá de lo automático), y el que compara contra la app real (pediste
literalmente "revisa cada interfaz de la app").

### 1.1 El hallazgo que mandó sobre todos los demás

El especialista #11 (landing vs. app real) encontró algo que verifiqué yo mismo, en vivo,
antes de aceptarlo — no me fié del hallazgo de un agente sin contrastarlo:

> La landing decía, al lado del número más grande del hero: **"Esta división la hacemos
> aquí; la app todavía no la muestra."** Eso dejó de ser cierto. `Mesura-app-source`
> rediseñó el hero de Inicio el 19-20 de agosto (`app/finance-app.tsx:2974-2989`,
> `app/lib/home-context.ts:267-271`): hoy la app **lidera** con la división diaria
> ("$X al día · N días más") y baja el juicio de valor ("vas por delante de tu ritmo") a
> detalle secundario, con otra redacción ("$X más/menos de lo esperado a esta altura del
> mes").

Confirmé con `grep` directo contra `Mesura-app-source/app/finance-app.tsx` (líneas
2974-2989) y `app/lib/home-context.ts` (líneas 113-131, 267-271) antes de tocar una línea
de código — está en la transcripción de esta sesión. Era cierto y estaba vigente.

**Esto no era un matiz de redacción: la nota de la landing pasó de honesta a falsa entre
el 20 y el 21 de agosto**, sin que nadie lo hubiera notado porque no estaba en ningún
texto de research previo, sólo en el código de un repositorio hermano que cambia todos
los días. El commit `8bd2900` lo corrige.

---

## 2. El árbitro — qué apliqué, qué descarté, y por qué

Actué yo mismo como árbitro único después del panel. Regla que seguí en cada decisión:
**ninguna verdad divulgada desaparece sin un destino documentado**, salvo que tú mismo
hayas autorizado lo contrario por escrito en este encargo (autorizaste explícitamente
retirar la numeración `01…09` si hacía que la página se leyera como documento — lo hice).

### 2.1 Aplicado

| Recomendación | De quién | Qué se hizo | Destino de lo que se movió |
|---|---|---|---|
| Corregir la nota falsa del ritmo | #11, verificado por mí | `mesura-datos.js`/`demo.js` ahora replican la jerarquía real de la app: división diaria primero, comparación como detalle | No aplica — es una corrección de exactitud, no un recorte |
| Bajar de 12 a 9 preguntas en el FAQ | #1 | Fusioné Q9+Q10 (invitación) y Q5+Q6 (presupuesto/fin de mes); subí "qué pasa con mis datos" a la posición 3 | — |
| Cortar la pregunta de seis casos borde | #1, #6 | Los cuatro casos de ingreso (quincena/diario/temporada/no discrecional) ahora viven en una nota marginal **visible sin acordeón** dentro de "El ritmo del mes" — más visibles que antes, no menos. El caso de moneda que pierde valor se agregó al aviso de moneda ya existente en la sección de invitación | Sección "El ritmo del mes" (marginal) + aviso de moneda en la sección de invitación |
| Corregir el plazo de la invitación (7 días vs. 72 horas) | #11, verificado por mí | El FAQ fusionado ahora distingue el caso de cuenta nueva (7 días, con reenvío) del caso de vincular a alguien que ya tiene cuenta (no vence, sin función de reenvío hoy) | — |
| Colapsar el desglose de categorías del ejemplo | #6 | `<details>` colapsado por defecto, contenido intacto | Sigue en la misma sección, a un toque |
| Colapsar la calculadora | #6 | `<details>` colapsado, con el título de la sección siempre visible (para no romper el ancla `#calculadora`) | Sigue en la misma sección, a un toque |
| Fusionar la sección "para quién el ritmo no sirve" dentro de "El ritmo del mes" | #6, #10 (accesibilidad — esa sección no tenía encabezado real) | Ahora es una nota marginal dentro de la sección 02, sin su propio bloque de sección | Mismo lugar, sin el padding de sección completo |
| Fusionar "Dos cosas que cambian la decisión" dentro de la sección de invitación | #6, #10 | Igual que el punto anterior | Mismo lugar |
| Retirar la numeración `01…09` | Tú, en el encargo; #9 la respaldó (tenía huecos reales: sin 05, sin 07/08) | Todas las etiquetas `.tag` perdieron su número | — |
| Invertir la jerarquía de los botones del hero | #5 | "Pedir una invitación" es ahora el botón primario; "Probar con un gasto" es el secundario | — |
| CTA justo después del ejemplo interactivo | #5 | Nuevo botón, en el punto de mayor intención medido | — |
| Restaurar el CTA de invitación en la cabecera móvil | #8 (encontró que desaparecía entero bajo 720px) | Movido fuera del `<nav>` que se oculta en móvil, dentro del mismo contenedor de la cabecera | — |
| Objetivo táctil de 44px en el selector de moneda | #6 | `min-height: 44px` en el `<select>` y el botón "Ver" | — |
| Skip-link visible al tabular | #10 | `a.sr-only:focus` ya no queda recortado | — |
| Espaciado entre secciones más ajustado en móvil | #6 (objetivo de pantallas) | Nueva media query bajo 720px que reduce el piso de `--space-section`/`--space-band`/`--space-block`/`--space-hero` — puro espacio, ninguna palabra tocada | — |
| CSS muerto retirado | #9 (ya lo había señalado como patrón) | `.cifra-diaria` y `.showcase-note`, que dejaron de usarse | — |

### 2.2 Descartado, y por qué

| Recomendación | De quién | Por qué no se aplicó esta vez |
|---|---|---|
| Argumento comparativo explícito contra hojas de cálculo / apps de banco | #3, confirmado por Esteban en el control fresco | Es trabajo de copywriting persuasivo nuevo, no una reorganización — me pareció más responsable dejarlo para una pasada dedicada a mensaje, con tu revisión, que improvisarlo dentro de un pase que ya tocó estructura, FAQ, CTA y accesibilidad a la vez |
| Prueba social / contador de anotados / loop de referidos | #8 | Requiere una decisión de producto (¿cuántos hay anotados de verdad? ¿existe ya un número real que se pueda mostrar sin inventarlo?) que no me correspondía tomar por mi cuenta — inventar un contador falso habría violado la regla de "nada falso" |
| Recortar agresivamente los nueve `<small>` de la sección "Tus datos" | #2 | Esa sección contiene la frase protegida ("quien opera Mesura puede leerlos") y su contexto inmediato. Preferí no tocar nada alrededor de la frase que más conversión midió el estudio, para no arriesgarla por apurar el recorte. La dejé intacta a propósito — ver §2.3 |
| Crear un h3 tipográfico intermedio entre el h2 de sección y las etiquetas mono | #9 | Es un cambio de sistema de diseño, no de contenido/estructura — me pareció mejor que lo decidas tú viendo la página, no que lo decida yo dentro de este mismo pase |
| Tokenizar los dos colores de categoría sueltos del ejemplo | #7 | Cosmético, bajo impacto, no tocaba ninguno de los problemas que reportaste |
| Enunciado comparativo + subir "cuánto trabajo es de verdad" a posición temprana en toda la página (no sólo en el FAQ) | #3 | Mismo criterio que la fila 1: es copy nuevo, no reorganización — pendiente de una pasada de mensaje |

### 2.3 La frase protegida — intacta, verificado

`quien opera Mesura puede leerlos` sigue exactamente donde estaba, en la sección "Tus
datos" (`index.html`, columna "Lo que Mesura usa"). No la toqué, no la acorté, no cambié
nada a su alrededor. Verificado con `grep` después de cada edit a esa zona del archivo.

### 2.4 Lo que resolví de paso: el pendiente de Nicolás

La ronda anterior dejó un caso abierto: Nicolás (ingreso por temporada) fue el único
lector cuya intención de dejar el correo bajó, porque su caso pasó de tener un párrafo
propio a ser "una palabra dentro de una frase con link a las Preguntas". Al fusionar la
sección "Para quién el ritmo no sirve todavía" dentro de "El ritmo del mes" como nota
marginal, **los cuatro casos —incluida "por temporada"— quedaron nombrados explícitamente
en texto forzado, visible sin abrir ningún acordeón**, en vez de detrás de un link. Esto
resuelve el caso de Nicolás como efecto secundario de la reestructuración, no como un
apaño puntual — la alternativa reversible que la ronda anterior había dejado propuesta
("nombrar los cuatro casos en negrita dentro de la frase corta") es, en la práctica, lo
que terminó pasando.

---

## 3. Verificación — todo lo que corrí, con resultado

| Comprobación | Resultado |
|---|---|
| `cd docs/redesign/qa && npm test` | **7/7 bloques en verde** — `anclas: 80/80`, `funcional: 27/27`, `axe: 0 violaciones en 10 configuraciones`, `red: 0 peticiones a terceros` |
| `node verificar.js --contra-repo Mesura-app-source Mesura-mobile` (desde `Mesura-lanzamiento/landing-v3/ejemplo`) | **SIN FALLOS** · 3 avisos preexistentes, no relacionados con esta pasada |
| Scroll móvil, 375×812, medido en vivo antes y después | **13,6 → 11,4 pantallas** (−16%); hero+ejemplo **3,35 → 2,91 pantallas** |
| `<details>` totales | 14 → 13 (2 en "Lo compartido", 9 en Preguntas, 1 en categorías del ejemplo, 1 en la calculadora) — actualizado en `funcional.js` |
| Evaluación con lectores simulados, grupo de control 100% nuevo (nunca vieron ninguna versión anterior) | Ver §4 |

### 3.1 Sobre el objetivo de 7-9 pantallas — no lo alcancé, y te digo por qué

El especialista de UX móvil proyectó que se podía llegar a 7-9 pantallas **sin borrar una
palabra**, con cinco cambios concretos. Apliqué los cinco. El resultado medido fue 11,4,
no 7-9. La brecha no es un error de ejecución — es que su proyección subestimó cuánto
pesan dos bloques que **decidí no tocar a propósito**:

- **El ejemplo interactivo mismo** (2,91 pantallas): es la pieza que el lector simulado y
  el especialista de conversión señalaron como lo mejor de la página — "no es una
  promesa sin evidencia, es evidencia funcionando". Comprimirlo más allá de lo que ya
  hice (colapsar categorías, fundir texto explicativo, quitar el bloque redundante de
  cifra diaria) significaría mostrar menos movimientos, menos cifras, o una demo menos
  convincente — el mismo riesgo que el análisis de posicionamiento identificó como el
  activo más fuerte de la página.
- **La sección "Tus datos"** (~1,4 pantallas): contiene la frase protegida. La dejé
  intacta por la regla del §2.3.

**Si quieres bajar de 11,4 a un número más cercano a 7-9, hay dos caminos reales, y
ninguno de los dos es una edición de texto — te los dejo como decisión tuya, no los tomé
por mi cuenta:**

1. Rediseñar el ejemplo interactivo para que sea visualmente más compacto en móvil (por
   ejemplo, una tira horizontal de cifras en vez de tres tarjetas apiladas) — es trabajo
   de diseño/ingeniería, no de esta pasada.
2. Colapsar parte de "Tus datos" detrás de un acordeón — pero eso significa decidir
   activamente mover contenido alrededor de la frase que más convierte, y quiero que esa
   decisión la tomes tú, no que la tome yo dentro de un pase que ya cambió mucho.

---

## 4. La evaluación — grupo de control 100% nuevo, midiendo lo que pediste

Cinco lectores simulados, cada uno un agente separado, **ninguno con contexto de esta
conversación ni de ningún research previo del proyecto** — el control más limpio posible,
porque ninguno había visto ninguna versión anterior de la página. Cada uno con un perfil
distinto (arrienda compartido, ingreso irregular, usuario de Excel escéptico, primera vez
con una app de plata, pareja que comparte gastos en Sheets), leyendo la página real en
`index.html`, simulando el teléfono.

Los ocho puntos que se les pidió responder a todos son los mismos que tú planteaste como
criterio: qué entienden en 3 segundos, si se ve organizada, si sobra texto, y la
probabilidad de dejar el correo. Texto íntegro de los cinco, sin editar, en el §8
(apéndice).

| Lector | Perfil | Organización /10 | Probabilidad de correo /10 |
|---|---|---|---|
| Andrés | Comparte arriendo, usa sólo la app del banco | 7 | 6 |
| Carolina | Freelancer, ingreso irregular, ya abandonó 3 apps de presupuesto | 7 | 5 |
| Esteban | Dueño de pyme, usa Excel, escéptico | 7 | 4 |
| Josefa | 24 años, primera vez con una app de plata | 7 | 5 |
| Rodrigo | Comparte gastos con su pareja en Google Sheets | 8 | 6 |
| **Promedio** | | **7,2/10** | **5,2/10** |

**Comparado contra el panel de especialistas (antes de este pase): el especialista de UX
móvil había puntuado la organización en 3/10; el promedio del panel completo era 5,7/10.
El grupo de control, después del pase, promedia 7,2/10 en la misma pregunta.** Es una
mejora real y medida, no una afirmación mía.

### 4.1 Lo que los cinco confirmaron de forma independiente — y que no toqué

Sin coordinación entre ellos (cada uno es un agente ciego a los demás), **cuatro de los
cinco** señalaron el mismo patrón: el mecanismo de gasto fijo y el de gastos compartidos
se sienten "explicados dos veces" — una vez en el cuerpo de la sección, otra vez en el
FAQ. Esto es honesto de reportar: es el resultado esperado del patrón de "avance en el
cuerpo + detalle completo en el FAQ" (divulgación progresiva), no un error de esta
pasada — ya reduje la superposición en el body de la sección "El ritmo del mes" (corté el
párrafo aritmético completo, dejé sólo una línea con link) y fusioné las preguntas
redundantes del FAQ, pero el patrón de fondo (una frase-avance + un FAQ que la
desarrolla) sigue generando esa sensación en un lector que lee todo seguido, en vez de
saltar. **No lo resolví más a fondo esta vez** porque hacerlo significaría o cortar la
frase-avance del cuerpo (dejando la función sin explicar hasta que alguien abra el FAQ) o
cortar la respuesta del FAQ (quitándole detalle a quien sí lo busca) — es un trade-off de
diseño de contenido que te dejo para decidir, no algo que resolví por decisión unilateral.

Josefa notó, además, que la calculadora —al final de la página, después del formulario de
invitación— se siente "pegada con cola", fuera del argumento principal. Es una
observación real sobre el orden de las secciones que ya existía antes de esta pasada (no
lo introduje yo) y que no alcancé a resolver: moverla exigiría decidir un nuevo lugar en
la página, que es una decisión editorial, no un ajuste de scroll.

### 4.2 Metodología, con sus límites declarados

Cinco lectores es un grupo de control más grande que el n=1 que en un estudio anterior
del proyecto invirtió la conclusión principal (ver `landing-v3/evaluacion/RESULTADO.md
§2`), pero sigue siendo pequeño. Los perfiles se eligieron para cubrir los ángulos que
tú mismo nombraste en el research previo (ingreso irregular, gasto compartido con pareja,
escéptico de Excel) más uno neutro (primera vez con una app de plata) — no es una muestra
aleatoria, es una muestra dirigida a las objeciones que ya sabíamos que existían.

---

## 5. Lo que necesita tu decisión

1. **¿Vale la pena bajar de 11,4 a 7-9 pantallas?** Ver §3.1 — los dos caminos reales
   (rediseñar el ejemplo interactivo, o tocar la sección de datos) no los tomé por mi
   cuenta porque el primero es una pasada de diseño/ingeniería aparte y el segundo toca
   el área de la frase protegida.
2. **El argumento comparativo contra hojas de cálculo / apps de banco** (§2.2, primera
   fila): Esteban en el control fresco confirmó exactamente el hallazgo del analista de
   mercado — "nunca me dice por qué cambiarme". Es la pieza de copy persuasivo que más
   claramente falta, y preferí dejarla para una pasada dedicada al mensaje en vez de
   improvisarla dentro de esta.
3. **La sensación de "explicado dos veces"** (§4.1): es un trade-off real entre
   avance-en-cuerpo y detalle-en-FAQ, no algo que se resuelva cortando más sin perder
   información en algún lado.
4. **Mover la calculadora** (§4.1, Josefa): hoy vive al final, después del formulario de
   invitación. Es una decisión de orden editorial, no técnica.

Ninguna de las cuatro bloquea lo publicado en esta rama — son decisiones para la próxima
pasada, no pendientes de esta.

---

## 6. Comandos — listos para copiar, **no ejecutados**

### Ver la página localmente antes de aprobar

```bash
cd Mesura-landing
npx wrangler pages dev . --compatibility-date=2026-08-01
```

Abre la URL que imprima desde tu teléfono real (misma red Wi-Fi, o `--ip 0.0.0.0` si
hace falta) y mira: el hero (más corto que antes), el selector de moneda (con más
superficie táctil), la sección "El ritmo del mes" (con los cuatro casos ahora visibles
sin abrir nada), el FAQ (9 preguntas en vez de 12), y el botón "Pedir una invitación"
como primario en el hero.

### Revisar el diff antes de decidir

```bash
git -C Mesura-landing log main..claude/upgrade-real-20260821 --oneline
git -C Mesura-landing diff main...claude/upgrade-real-20260821
```

### Mergear todo

```bash
git -C Mesura-landing checkout main
git -C Mesura-landing merge --no-ff claude/upgrade-real-20260821
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
git -C Mesura-landing branch -D claude/upgrade-real-20260821
```

Si **sólo quieres deshacer el fix de la nota falsa del ritmo** (dejar el recorte de
scroll/FAQ/CTA, revertir sólo la corrección de jerarquía del ejemplo):

```bash
git -C Mesura-landing revert --no-commit 8bd2900
git -C Mesura-landing commit
```

Si **ya desplegaste**: Cloudflare Pages guarda cada deploy — `mesura-landing` →
Deployments → "Rollback to this deployment".

---

## 7. Apéndice — los once informes del panel, íntegros

Ver [`docs/redesign/PANEL-20260821.md`](docs/redesign/PANEL-20260821.md) — se deja como
archivo aparte en vez de duplicado aquí porque son ~35.000 palabras entre los once
informes; el archivo está versionado en el mismo commit (`8bd2900`) que el resto de esta
pasada, así que es la misma fuente, no un resumen.

---

## 8. Apéndice — los cinco lectores de control, íntegros

### Control fresco — Andrés (comparte arriendo, usa sólo la app del banco)

**Parte 1 — Los primeros 3 segundos (solo el hero)**

**1. ¿Qué entendí que hace?**
Es una app para anotar los gastos del mes y que te diga cuánto te queda por día para no quedar en la ruina antes de fin de mes. También lleva la cuenta de plata que compartes con alguien (el arriendo con mi compañero, por ejemplo). Entendí eso rápido, sin tener que pensarlo dos veces — el título "Tu mes, antes de que se te vaya" y el párrafo de abajo lo dejan claro.

**2. ¿Organizada o desordenada?**
A primera vista, organizada. Hay un titular grande, un párrafo corto, dos botones, y después una "hoja" con números concretos ($156.325, $330.975) que se ve como una pantalla real de app, no como una promesa vacía de marketing. En el teléfono se ve apretado — hay bastante para digerir en un solo scroll antes de llegar al ejemplo interactivo (eyebrow, título, párrafo, botones, aviso de moneda, selector de moneda, nota, label del showcase, y recién ahí la tarjeta) — pero no se siente caótico, se siente denso.

**3. ¿Seguiría mirando o cerraría?**
Seguiría mirando. Lo que me engancha es que dice "esto es de verdad, prueba escribiendo un monto" — eso es distinto a otras landings que solo muestran una captura de pantalla estática. Como uso la app del banco y nada más, probar algo interactivo sin crear cuenta me da curiosidad, no desconfianza.

**Parte 2 — Después de leer todo**

**4. ¿Sobra texto o es razonable?**
Sobra, pero no de forma escandalosa. Hay secciones que se sienten redundantes: el ritmo del mes se explica en el hero, se vuelve a explicar en la sección "El ritmo del mes", y se vuelve a tocar en las preguntas frecuentes. Para una app de plata entiendo que quieran ser bien explícitos con la letra chica, y agradezco que no me escondan cosas incómodas (que necesita internet, que no hay import de otras apps, que si te atrasas el ritmo miente). Pero como lector en el celular, de pie, es mucho scroll.

**5. ¿Se sintió como documento en vez de página web?**
Sí, en un par de momentos. Hay bloques de texto muy parecidos en estructura ("Lo que Mesura usa" / "Lo que Mesura decidió no hacer") que se sienten más a "términos y condiciones organizados en tarjetitas" que a landing. El FAQ con nueve preguntas desplegables también pesa. Si me preguntas si en algún tramo dejé de sentir que "navegaba" y empecé a sentir que "estudiaba", la respuesta es sí, en el bloque de "Tus datos" + las preguntas.

**6. Del 1 al 10, ¿qué tan organizada?**
7. Hay una jerarquía clara, los títulos de sección ayudan a saber dónde estoy, y el tono es consistente. Le bajo puntos porque hay mucha repetición de ideas entre secciones y porque el volumen total en el teléfono se siente pesado.

**7. Del 1 al 10, ¿qué tan probable es que deje mi correo?**
6. Lo que me convence: el ejemplo interactivo es honesto y funciona, y son brutalmente transparentes con las limitaciones. Lo que me frena: es "solo con invitación" y "se empieza de cero" — tengo que escribir todo a mano si quiero mi historial.

**8. Resumen en una frase:**
"Es como un cuaderno de gastos bien hecho que te avisa si vas gastando muy rápido para el mes, y que también te lleva la cuenta de lo que se comparte con el compañero de depto — pero todavía es beta, hay que pedir invitación, y tienes que anotar todo a mano porque no se conecta al banco."

---

### Control fresco — Carolina (freelancer, ingreso irregular, abandonó 3 apps de presupuesto)

**Parte 1 — Los primeros 3 segundos**

**1. ¿Qué entendiste que hace?**
Es una app para anotar lo que gasto y que me diga cuánto me queda por día hasta fin de mes, y aparte lleva la cuenta de lo que divido con otra persona.

**2. ¿Organizada o desordenada?**
Organizada, sí, pero densa para ser lo primero que veo parada con el celular en la mano. Es mucho antes de llegar al primer número real.

**3. ¿Seguirías mirando?**
Seguiría mirando, pero por poco. Lo que me retiene es que el "$156.325" y el ritmo se ven concretos, no es puro discurso de marketing.

**Parte 2 — Después de leer todo**

**4. ¿Sobra texto?**
Sobra, y no un poco. El patrón se repite demasiado: párrafo principal, aclaración en negrita, marginal, y encima un acordeón de preguntas con las mismas respuestas otra vez. A mitad de la sección "Anotar" ya estaba haciendo scroll más rápido y leyendo menos.

**5. ¿Encontraste tu caso (ingreso irregular)?**
Sí, pero tarde y en un lugar secundario: en la sección "El ritmo del mes", en un párrafo marginal. Es honesto — me dice de frente que el ritmo no me va a servir bien — pero es la única mención real de mi caso en toda la página hasta ahí. El otro lugar es el chip "¿Cómo te entra la plata?" del formulario final, donde sí me sentí vista, pero llega al final de todo.

**6. Organización: 7/10.** Buena estructura, pero la jerarquía visual no siempre coincide con la jerarquía de importancia para mí.

**7. Probabilidad de correo: 5/10.** La demo funciona de verdad y la sección de datos es inusualmente honesta. Pero ya probé tres apps que asumían ingreso mensual fijo, y esta misma admite que su función estrella no es para mi caso.

**8. Resumen:**
"Es una app chilena de plata, hecha por una sola persona, que te dice cuánto te queda por día para no quedar en pelotas a fin de mes — pero ojo, ella misma avisa que esa parte no funciona bien si cobras por proyecto como nosotras, así que capaz sirve más para lo de dividir gastos que para el presupuesto en sí."

---

### Control fresco — Esteban (dueño de pyme, usa Excel, escéptico)

**Parte 1 — Los primeros 3 segundos**

**1. ¿Qué entendí que hace?**
Una app para anotar gastos que te dice cuánto plata te queda por día hasta fin de mes, y que además lleva la cuenta de lo que compartes con alguien.

**2. ¿Organizada o desordenada?**
A primera vista, ordenada. Lo que sí me hizo ruido: antes de llegar al ejemplo hay un selector de moneda con seis países y un botón "Ver" que por un segundo no supe si era parte del producto o un widget de traducción.

**3. ¿Seguiría mirando?**
Seguiría mirando un poco más, principalmente por el bloque interactivo. Si no hubiera estado ese ejemplo tocable, probablemente cerraba después del hero.

**Parte 2 — Después de leer todo**

**4. ¿Sobra texto?**
Sobra, para ser sincero. No es texto de relleno vacío, pero es mucho para el teléfono, de pie. En el celular real yo no leo la mitad de esto.

**5. ¿Argumento contra Excel?**
Acá la página se queda corta. En ningún momento dice "esto hace algo que Excel no puede". Todo lo que describe yo lo puedo armar en una hoja con tres columnas y una resta. La sección de "cuánto trabajo es de verdad" casi me convence de lo contrario: tengo que ser tan disciplinado como con Excel, si no más.

**6. Organización: 7/10.** Cada sección está prolija, pero la organización de flujo completo es floja: demasiadas secciones secundarias antes de pedirme el correo.

**7. Probabilidad de correo: 4/10.** La transparencia me genera respeto, pero también dudas sobre si vale la pena migrar a algo que hoy es una beta manejada por una sola persona.

**8. Resumen:**
"Es una especie de Excel de gastos personales hecho por un solo tipo en Chile, bien honesto sobre sus limitaciones, pero todavía no te dice por qué dejar tu planilla actual."

---

### Control fresco — Josefa (24 años, primera vez con una app de plata)

**Parte 1 — Los primeros 3 segundos**

**1. ¿Qué entendí que hace?**
Es una app para anotar en qué gasto la plata y que te diga cuánto te queda por día hasta que llegue el sueldo de nuevo, y también sirve para llevar la cuenta de lo que te deben o le debes a alguien.

**2. ¿Organizada o desordenada?**
Se ve prolija, no caótica. Pero es MUCHO para lo primero que veo: apenas entro ya me tiran varios números, un selector de moneda, un formulario para "probar". Se siente como que me sentaron en la sala de máquinas antes de decirme para qué sirve el auto.

**3. ¿Seguiría mirando?**
Seguiría mirando, pero con un poquito de esa ansiedad que ya traigo con la plata.

**Parte 2 — Después de leer todo**

**4. ¿Sobra texto?**
Sobra, y no poquito. La sección de datos tiene columnas larguísimas. Las Preguntas frecuentes repiten casi palabra por palabra cosas que ya había leído más arriba.

**5. ¿Algún momento de sentirte perdida?**
Cuando llegué a la calculadora, al final, después de ya haber pasado por el formulario — pensé "¿esto era antes y me lo perdí?". Y el menú de arriba no incluye ni las Preguntas ni el formulario ni la calculadora.

**6. Organización: 7/10.**

**7. Probabilidad de correo: 5/10.** Lo que me frena no es desconfianza — es que suena a que hay que ser bien disciplinada: anotar todos los días, marcar bien los gastos fijos o el cálculo se rompe.

**8. Resumen:**
"Es como un diario de gastos que te avisa cuánto te queda por día para no llegar seca a fin de mes y te cuadra solo lo que se deben con alguien más — pero es re nueva, sólo entras si te invitan, y hay que anotar TODOS los días o se te hace bola."

---

### Control fresco — Rodrigo (comparte gastos con su pareja en Google Sheets)

**Parte 1 — Los primeros 3 segundos**

**1. ¿Qué entendiste que hace?**
Es una app de plata donde anotas gastos y te dice cuánto te queda por día para no quedarte pelado antes de fin de mes, y aparte lleva la cuenta de lo que compartes con otra persona sin que tengas que andar recalculando quién debe qué.

**2. ¿Organizada o desordenada?**
Organizada, sorprendentemente. El titular es corto, hay un ejemplo interactivo de verdad — puedo escribir un monto y ver que se mueve.

**3. ¿Seguirías mirando?**
Seguiría mirando. La combinación de "puedo tocar esto ahora mismo" + "compartido con mi pareja" en el primer scroll me engancha, porque es literalmente mi problema.

**Parte 2 — Después de leer todo**

**4. ¿Sobra texto?**
Es harto texto, pero no sobra — es "money app". Lo que sí noté es redundancia: varias ideas se repiten en distintas secciones.

**5. ¿Te convenció de dejar el Sheets?**
Parcialmente. A favor: el saldo automático es exactamente mi dolor de cabeza. En contra: "se empieza de cero" (tengo años de historial ahí), el aviso de que si uno anota y el otro no el saldo miente (el mismo problema que ya tengo con el Sheets), y que necesita internet siempre.

**6. Organización: 8/10.** Estructura clara, acordeones bien usados. Le bajo puntos por la repetición de contenido entre secciones.

**7. Probabilidad de correo: 6/10.** No es un "no" pero tampoco un "sí" inmediato — el problema real es migrar mi historial.

**8. Resumen:**
"Es como reemplazar el Sheets de gastos compartidos por algo que hace las cuentas solo y te avisa si te estás pasando antes de fin de mes — pero ojo, hay que anotar todos los días y arrancas de cero, sin el historial viejo."
