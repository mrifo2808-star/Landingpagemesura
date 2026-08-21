# Validar — pasada del 21 de agosto de 2026: jerarquía visual, un bug de móvil, y un recorte de contenido

Rama: `claude/jerarquia-visual-20260821`, sobre `main`. Tres commits de sustancia, cada uno
separado a propósito para que se puedan revisar y desplegar por separado si quieres:

1. `e32905e` — reorganiza la jerarquía visual (reubica, no borra) y corrige el margen del ritmo,
   que ya estaba obsoleto.
2. `be2acd9` — el bug de móvil del selector de moneda. **Commit aparte, listo para desplegarse
   solo**, porque ya estaba en producción cuando lo encontraste.
3. `24eb341` — el recorte de contenido según el criterio de un analista de mercado, después de
   que corrigieras el encargo: reubicar no alcanzaba, había que cortar.

No se hizo merge, no se desplegó, no se tocó ningún secreto. **Esto reemplaza la versión anterior
de `VALIDAR.md`** — queda en `git log` si la necesitas.

---

## 0. Cómo llegamos aquí, en orden

Pediste una revisión profesional de por qué la landing "quedaba con mucho texto". Hice esa
revisión y apliqué reubicación —agrupar avisos en listas, como ya hacía bien la sección 04— sin
borrar nada. Corregiste el encargo: reubicar no alcanzaba, sobraba información de verdad, había
que cortar, y pediste que el criterio de corte fuera de un analista de mercado, no mi intuición.
Mientras tanto probaste la landing en tu teléfono y encontraste que el selector de moneda no
cambiaba — eso se diagnosticó y se arregló aparte, con prioridad, porque ya estaba en producción.
Este documento cubre las tres cosas, en el orden en que pasaron.

---

## 1. La revisión de jerarquía visual (primera pasada, sin cortar nada)

### 1.1 El diagnóstico

La landing no tenía exceso de craft tipográfico — tenía bloques de advertencias apiladas con el
mismo peso visual: tres `.callout` seguidos en la sección 02, dos en la 05, cuatro afirmaciones en
`<br><br>` dentro de una sola caja en la 01. El propio proyecto ya lo había predicho por escrito
sin aplicarlo: *"nada de esta evaluación sobrevive a una maquetación que ponga la sección 02 en
letra grande"* (`landing-v3/evaluacion/METODO.md §5.5`). La cura que la página ya usaba bien en la
sección 04 (lista con filete, no cajas apiladas) se extendió a las secciones 01, 02 y 05, sin
tocar una palabra en 01 y 05 — pura reorganización de marcado.

### 1.2 Lo que corrigió, de paso

El párrafo del "margen de $500 / 0,4%" del ritmo describía una constante retirada de las dos apps
la noche del 20 al 21 de agosto (verificado en vivo contra `Mesura-app-source` y `Mesura-mobile`,
no sólo confiado en el doc de consolidación): hoy es 10% relativo, no un monto fijo. Encontré el
mismo bug en el motor JS del ejemplo interactivo (`assets/js/mesura-datos.js`, `PACE_TOLERANCE =
500` hardcodeado) y lo arreglé ahí también — nadie lo había visto porque no está en ningún texto,
sólo en código. También corregí la instrucción de presupuesto de la sección 02 para reflejar la
casilla de gasto fijo que la web ya tiene completa (`db/schema.ts:49`,
`migrations/0025_naive_deathstrike.sql`, `MovementFormSheet.tsx:342`,
`home-context.ts:148 expectedSpendToDateFor`) — la nativa todavía no la tiene
(`Mesura-mobile/app/edit-budget.tsx:175`), así que esta instrucción describe la web, que es el
sitio que existe hoy.

También arreglé `Mesura-lanzamiento/landing-v3/ejemplo/verificar.js` (repositorio hermano, no
éste): su comprobación 7 buscaba literalmente la constante retirada; ahora valida la invariante
real, que las dos apps usan el mismo umbral relativo.

---

## 2. El bug de móvil del selector de moneda — encontrado, diagnosticado y arreglado aparte

**Síntoma que reportaste:** elegir una moneda y tocar "Ver" en el teléfono no actualizaba nada, y
volvía a pesos chilenos.

### 2.1 Diagnóstico, con la causa real encontrada en el código

Descarté por evidencia, no por suposición, los sospechosos obvios:

- **La Function de país** (`functions/_middleware.js`): probado con `curl` contra el servidor real
  — `?m=PEN` resuelve a `PEN` incluso con un `CF-IPCountry` en conflicto. No es esto.
- **Pérdida del `?m=` en una navegación real**: probado navegando directo a `/?m=PEN` en un
  viewport móvil emulado — se ve correctamente en soles, con el `<select>` ya en "soles". No es
  esto.
- **El envío nativo del formulario sin JS**: probado llamando `form.submit()` nativo (que no
  dispara el evento `submit`, exactamente como si el JS no hubiera cargado a tiempo) — también
  resuelve bien. No es esto.

**La causa real estaba en `assets/js/demo.js`, en dos líneas separadas.** El módulo depende de
otro (`mesura-datos.js`) — dos viajes de red antes de ejecutar una sola línea — así que hay una
ventana real, más ancha en una conexión lenta, entre "el HTML ya pintó y el `<select>` nativo
responde al picker del teléfono" y "el módulo terminó de cargar y enganchó su listener de
`change`". Si alguien elegía una moneda **en esa ventana**, dos líneas del arranque del script —
`selector.value = codigoActual`, una al enganchar el listener y otra al final del archivo —
**pisaban esa elección en silencio** con el valor que había resuelto el servidor. Por eso "elijo
soles, toco Ver, y vuelve a pesos chilenos": el `<select>` ya había vuelto a pesos chilenos antes
de que el dedo llegara al botón. **No era un bug del botón.**

### 2.2 Qué se cambió

- `demo.js` ya no pisa el `<select>` a ciegas al arrancar: si el valor ya es distinto del que
  resolvió el servidor, respeta esa elección y la aplica con la misma función que ya usaba el
  `change` (`aplicarMoneda`).
- El botón "Ver" deja de hacer falta en el flujo con JS — el cambio ya se aplicaba solo al elegir,
  eso nunca fue el bug — y sigue existiendo sólo como respaldo sin JavaScript, verificado con
  `curl` contra la Function real.
- `<link rel="modulepreload">` para los dos módulos, para acortar la ventana en conexiones lentas
  — no la cierra del todo (la corrección de arriba es la que la cierra), pero ayuda.
- Aviso `aria-live` para quien usa lector de pantalla, ya que el cambio ya no pasa por un botón con
  foco propio.
- **Prueba de regresión** en `docs/redesign/qa/scripts/funcional.js`: estrangula la red con CDP y
  fija el `<select>` antes de que exista el listener, tal como el picker nativo. Corrida limpia
  3/3 veces seguidas antes de confiar en ella.

**Comando para verificarlo tú, en tu teléfono real, contra la Function real:**

```
cd Mesura-landing
npx wrangler pages dev . --compatibility-date=2026-08-01
```

Abre la URL que imprima desde el teléfono (misma red Wi-Fi que el computador, o con `--ip 0.0.0.0`
si hace falta), elige una moneda, y confirma que cambia sin tocar "Ver" — el botón ya no debería
ni aparecer.

---

## 3. El recorte de contenido — el criterio es de un analista de mercado, no mío

### 3.1 Por qué existe esta sección, y las reglas que seguí

Dijiste: reubicar no alcanza, sobra información de verdad, y el criterio de qué cortar tiene que
ser de un analista de mercado, escrito, no mi intuición. Convoqué un agente sin ningún contexto
previo de esta conversación, con un solo encargo: leer la página como un consultor de conversión
externo, y aplicar una sola pregunta a cada bloque — **¿un visitante nuevo necesita ESTO, en ESTA
página, para decidir que quiere probar la app?** No evaluar si es verdad, ni si está bien escrito
— eso no era su trabajo. Le di el dato duro que tú mismo diste: la landing anterior convertía al
doble de la tasa a la que el producto retenía (68,6% vs 31,8%), así que el sesgo debía ser cortar,
no defender cada frase.

**Su informe completo, sin editar una palabra, queda abajo en el §6 (apéndice) para que puedas
auditar el criterio contra el resultado.**

Regla que me puse yo, porque sigue en pie de tu instrucción anterior: **ninguna verdad
desaparece sin destino.** Para cada corte decidí dónde va — la sección 06 de Preguntas (dentro de
este mismo repositorio, así que sí lo pude construir) o "se corta sin reubicar" con el argumento
de por qué ningún hallazgo del estudio de usuarios lo sostiene. Cuando el analista recomendaba
mover algo a "el flujo de registro" o "un tooltip dentro de la app" —cosas que viven en
`Mesura-app-source`/`Mesura-mobile`, fuera de este repositorio— **no pude construir ese destino
yo**; lo dejo anotado como pendiente de ingeniería en el §5.

### 3.2 Dónde fue cada cosa que se sacó del cuerpo visible

| Qué se cortó | A dónde fue | Por qué esto y no borrarlo a la nada |
|---|---|---|
| "Necesita conexión, no vas a poder anotar" (hero) | Pregunta nueva: "¿Necesito internet…?" | Rosa (control, `landing-v3/evaluacion`) lo llamó "un muro" — es un límite real que alguien necesita poder encontrar |
| Mecánica completa de la invitación (4 párrafos: cuenta, una vez, vence a 7 días, si nunca acepta) | Pregunta nueva: "¿Cómo funciona la invitación…?" | Bruno y Diego, en el estudio, dijeron que el vencimiento "a medio contar" olía a que "no lo pensaron" — hace falta que exista completo en algún lado |
| "El saldo sólo está bien si lo anotan los dos" | Pregunta nueva: "¿Qué pasa si la otra persona no anota…?" | Es el hallazgo de Fernanda/Andrea ("somos una usuaria y media") — uno de los pocos hallazgos con evidencia de ambas partes de una relación compartida en todo el corpus |
| Detalle de la casilla de gasto fijo + "si no marcas nada" + "no distingue no gasté de no anoté" | Pregunta nueva: "¿Cómo marco un gasto fijo…?" | El hallazgo más validado de todo el estudio de la app (18 de 18 con gastos fijos tuvieron el falso positivo) — se acorta en portada a una frase, pero el mecanismo completo tiene que seguir existiendo en algún lado |
| Los cuatro casos donde el ritmo no sirve (quincena, variable, temporada, no discrecional) + la nota de doble moneda | Pregunta nueva, una sola, con los cuatro casos | Ver §3.3 — es el corte más discutible de esta pasada, con un hallazgo propio en la evaluación |
| "¿Y si más adelante cortamos el vínculo?" (mini-acordeón de la sección 01) | Se queda donde estaba — no se movió | El analista lo marcó como opcional de mover, no obligatorio; ya era progresivo (`<details>`), bajo costo, no valía la pena el cambio |
| Enumeración de las cuatro situaciones exactas en que "quien opera Mesura" lee tus datos, y el detalle de qué manda cada proveedor | Política de privacidad (ya enlazada en el pie de la sección) | Es contenido de política de privacidad por naturaleza; **la frase que sí se queda intacta** está en la fila de abajo |
| Nada — se preservó a propósito | — | **"Quien opera Mesura puede leerlos"**: en el estudio de trece lectores fue la frase que más compró credibilidad, 6 de 13. El analista recomendaba comprimir toda la sección de datos; la sobreescribí ahí porque hay evidencia específica y medida de que es un activo de conversión, no un pasivo — exactamente el criterio que el propio analista pidió aplicar |
| Duplicado del presupuesto por categoría bajo el ejemplo del hero | Se cortó a la nada | Ya está en las Preguntas; era un duplicado puro, sin hallazgo que lo sostenga |
| "Una hoja de cálculo también te lo puede decir…" (el párrafo que argumenta contra Excel) | Se cortó a la nada | Nadie en el estudio pidió que la página se defendiera de Excel; es una objeción que la propia página se inventaba y respondía |

### 3.3 La única decisión que quedó incómoda, y te la dejo a ti

En la evaluación de esta pasada (§4 abajo), **Nicolás fue la única persona de las nueve cuya
intención de dejar el correo bajó**, y dio la razón exacta: su caso (ingreso por temporada) tenía
antes un párrafo propio dentro del cuerpo visible, y ahora es una palabra dentro de una frase con
link a las Preguntas. Es el mismo Nicolás que, en el estudio original, midió con su propio caso
que declararlo *sube* la conversión — *"callarse no te ahorra un usuario, te cuesta un
recomendador"*. El criterio del analista optimiza para el visitante genérico, que es la mayoría; el
hallazgo de Nicolás es evidencia específica de que ese mismo corte cuesta algo con el público de
ingreso no mensual, que es exactamente el público que esos cuatro casos existían para no perder.

**No lo resolví en silencio ni para un lado ni para el otro. Recomendación: déjalo como está** —
un caso contra ocho que mejoran o se mantienen es una relación razonable, y el detalle completo
sigue existiendo a un clic. **Alternativa reversible, si prefieres protegerlo:** nombrar los cuatro
casos en negrita dentro de la misma frase corta, sin volver a la elaboración completa de cada uno.
Es un cambio de una línea en `index.html`, sección "Para quién el ritmo no sirve todavía".

### 3.4 Qué queda pendiente de ingeniería fuera de este repositorio

Estas recomendaciones del analista apuntaban a `Mesura-app-source`/`Mesura-mobile`, que no son
parte de esta pasada — sólo pude acortar el texto de la landing, no construir el destino:

- La mecánica del checkbox "Es un gasto fijo" —qué hace exactamente— sería mejor como un tooltip
  al marcar la casilla por primera vez en la app, no sólo en el FAQ de la landing.
- El detalle de re-expresión de moneda (irreversible sin decimales) sería mejor como una
  advertencia inline junto al selector de moneda en el formulario de registro real, en el momento
  exacto de la decisión — hoy vive en la landing, antes del registro, porque no hay otro lugar que
  pueda construir desde aquí.
- "Se empieza de cero" (sin importación) — mismo caso: mejor en el flujo de creación de cuenta que
  antes del correo.

---

## 4. La evaluación — dos rondas, y qué dijeron

### 4.1 Primera ronda (sólo jerarquía, antes de cortar nada)

`docs/redesign/EVALUACION-JERARQUIA-20260821.md`. Nueve lectores simulados (5 anclados con
objeción registrada sobre "todo en fila", 4 de control nuevo). Confirmó que la reorganización sin
borrar se sentía menos apilada, y expuso dos cosas reales que se dejaron escritas: el ejemplo no
demuestra la casilla de gasto fijo (sigue sin demostrarla — ver §3.4), y una asimetría de peso
visual en la sección 02 que se corrigió en la misma pasada.

### 4.2 Segunda ronda (después de cortar, midiendo lo que pediste: tiempo y el barrido de tres segundos)

`docs/redesign/EVALUACION-RECORTE-20260821.md`. Mismos cinco anclados (tercera lectura del día) +
**cuatro personas de control completamente nuevas** — las cuatro de la ronda anterior ya estaban
"gastadas" porque ya habían leído una versión de la página hoy mismo, y el propio proyecto tiene
evidencia de que un control ya expuesto deja de medir lo mismo (`landing-v3/evaluacion/RESULTADO.md
§2`).

**Lo medido, con número:**

| Métrica | Resultado |
|---|---|
| Palabras forzadas (fuera de cualquier `<details>`) | 2.909 → **1.674** — **42% menos**, ~14,5 → ~8,4 min a 200 ppm |
| Palabras totales (con las Preguntas incluidas) | 3.526 → **2.769** — 21% menos |
| Lectura del barrido de 3 segundos (control nuevo, 4/4) | Los cuatro describieron el mismo mensaje: anotar un gasto, saber cuánto queda por día |
| ¿Cortar se sintió como esconder? (control nuevo) | Ninguno lo dijo — con la condición explícita de Esteban: el link a "Preguntas" tiene que existir y las respuestas tienen que estar completas cuando se abren |
| Intención de correo, grupo A (anclados) | 4 de 5 subió o se mantuvo; Nicolás bajó — ver §3.3 |
| Intención de correo, grupo B (control nuevo) | 55–72%, más bajo que el grupo anclado y más creíble como línea base, según el propio documento |

La brecha entre el 42% (forzado) y el 21% (total) es la prueba numérica de que esto fue
reubicación real, no sólo borrado disfrazado: la información sigue en el sitio, en una capa que el
lector elige abrir.

---

## 5. Lo que necesita tu decisión — con mi recomendación ya tomada

1. **El caso de Nicolás (§3.3).** Recomendación: dejarlo como está. Alternativa reversible:
   nombrar los cuatro casos en negrita dentro de la frase corta de "Para quién el ritmo no sirve
   todavía", sin volver a la elaboración completa.
2. **El ejemplo interactivo sigue sin demostrar la casilla de gasto fijo** (arrastrado de la
   primera ronda, confirmado otra vez por Teresa en la segunda). Recomendación: si esto sigue
   generando dudas en uso real, es trabajo de ingeniería sobre `assets/js/demo.js` y
   `mesura-datos.js` — agregar la casilla al formulario del ejemplo —, no de texto, y queda para
   una pasada aparte.
3. **Tres piezas de contenido que ahora son más cortas en la landing pero cuyo detalle completo
   viviría mejor dentro de la app misma** (§3.4): la casilla de gasto fijo, la re-expresión de
   moneda, y la ausencia de importación. Hoy viven en el FAQ de esta página porque es el único
   destino que pude construir desde este repositorio. Recomendación: cuando planifiques trabajo en
   `Mesura-app-source`/`Mesura-mobile`, revisa si vale la pena moverlas a un tooltip en el momento
   exacto de la decisión — no bloquea nada de lo publicado hoy.
4. **La instrucción de gastos fijos describe la web, no la nativa**, que todavía no tiene la
   casilla. Sigue siendo tolerable porque la landing describe el sitio que existe; deja de serlo
   el día que se publique la nativa con esta función atrasada.

---

## 6. Cómo se verificó — todo lo que corrí, con resultado

| Comprobación | Resultado |
|---|---|
| `cd docs/redesign/qa && npm test` | **7/7 bloques en verde**, `funcional: 27/27` (se agregó la prueba de regresión del bug de móvil y se corrigió un conteo de `<details>` desactualizado por el recorte, de 10 a 14) |
| `node verificar.js --contra-repo Mesura-app-source Mesura-mobile` | **SIN FALLOS** · 3 avisos preexistentes, no relacionados |
| `npx wrangler pages dev .` + `curl` sin cabecera / con `CF-IPCountry: PE` / con `?m=USD` basura | `CLP` / `PEN` / `CLP` — los tres correctos |
| `npx wrangler pages dev .` + `curl "?m=PEN"` directo | `PEN` — confirma que la Function nunca fue la causa del bug de móvil |
| La prueba de regresión del selector de moneda, corrida sola 3 veces seguidas | 3/3 en verde, sin parpadeos |
| Word count forzado vs total, antes y después del recorte | Ver tabla en §4.2 |
| Evaluación con lectores simulados, dos rondas, con grupo de control nuevo en cada una | `docs/redesign/EVALUACION-JERARQUIA-20260821.md` y `docs/redesign/EVALUACION-RECORTE-20260821.md` |

**Lo que no pude hacer:** capturas de pantalla reales del navegador — el Browser pane de esta
sesión no compositó frames en ningún intento. Verifiqué estructura, accesibilidad (axe-core real
en Chrome headless, 10 combinaciones de viewport y tema) y comportamiento por `get_page_text` y
`read_page`, pero **nadie —yo ni tú— vio esta versión con los ojos todavía.** Antes de mergear:

```
cd Mesura-landing
npx wrangler pages dev . --compatibility-date=2026-08-01
```

y mira al menos la sección 02 (la más recortada) y el selector de moneda en tu teléfono real.

---

## 7. Comandos — listos para copiar, **no ejecutados**

### Revisar el diff antes de decidir

```
git -C Mesura-landing log main..claude/jerarquia-visual-20260821 --oneline
git -C Mesura-landing diff main...claude/jerarquia-visual-20260821
```

### Ver la página localmente antes de aprobar

```
cd Mesura-landing
npx wrangler pages dev . --compatibility-date=2026-08-01
```

### Desplegar SÓLO el arreglo del bug de móvil, sin esperar al resto

Si quieres el fix de moneda en producción ya, sin el recorte de contenido ni la reorganización
visual:

```
cd Mesura-landing
git checkout main
git cherry-pick be2acd9
git push origin main
npx wrangler pages deploy . --project-name=mesura-landing
```

### Mergear todo

```
git -C Mesura-landing checkout main
git -C Mesura-landing merge --no-ff claude/jerarquia-visual-20260821
git -C Mesura-landing push origin main
```

### Desplegar todo

```
cd Mesura-landing
npx wrangler pages deploy . --project-name=mesura-landing
```

### El fix del script hermano — decidir si se comitea aparte

`Mesura-lanzamiento/landing-v3/ejemplo/verificar.js` se modificó pero es un repositorio distinto:

```
git -C Mesura-lanzamiento status
git -C Mesura-lanzamiento diff -- landing-v3/ejemplo/verificar.js
```

### Revertir, si algo no calza

Si **ya mergeaste y pusheaste**:

```
git -C Mesura-landing revert -m 1 <sha-del-merge>
git -C Mesura-landing push origin main
```

Si **todavía no mergeaste**:

```
git -C Mesura-landing checkout main
git -C Mesura-landing branch -D claude/jerarquia-visual-20260821
```

Si **sólo quieres deshacer el recorte de contenido** y quedarte con la jerarquía + el fix de
móvil:

```
git -C Mesura-landing revert --no-commit 24eb341
git -C Mesura-landing commit
```

Si **ya desplegaste**: Cloudflare Pages guarda cada deploy — `mesura-landing` → Deployments →
"Rollback to this deployment".

---

## 8. Apéndice — el informe completo del analista de mercado, sin editar

Corrió como un agente separado, sin ningún contexto previo de esta conversación, con las
instrucciones descritas en §3.1. Se pega íntegro para que el criterio de corte quede escrito y
auditable, como pediste — no resumido por mí.

> ### Mesura landing page — conversion audit (section-by-section)
>
> Read the full file top to bottom, body only (hero → invitation), applying one test per block:
> *does a first-time visitor need this, on this page, to decide they want to try the app?*
> Findings below, then a formatting pass, then the verdict.
>
> **00 · Hero**
>
> **"Y hoy necesita conexión: si estás en la calle sin señal..."** — Fails (b), a "we don't do X"
> limitation stacked onto an already-crowded trust paragraph, in the single most valuable real
> estate on the page. Belongs: cut from hero; FAQ at most.
>
> **"Dos cosas para que el ejemplo no prometa de más."** — Fails (a), meta-commentary about the
> demo's own fidelity. Belongs: cut with no relocation.
>
> **"Y si quieres, cada categoría puede llevar su propio presupuesto..."** — Fails (a), duplicate
> of the FAQ answer. Belongs: cut, the FAQ already owns this.
>
> **"Esta división la hacemos aquí... La app todavía no la muestra."** — Fails (b), the worst
> placement on the page: directly beneath the flagship number, disclosing the product can't
> currently show it. Belongs: cut with no relocation, or a FAQ answer at most.
>
> **01 · Compartido**
>
> **"Puedes juntar varias cuentas en un grupo... veinte personas"** — Fails (d), minority use case
> stated as a limit before the visitor has tried splitting with one person. Belongs: in-app, when
> creating a group.
>
> **Entire "Cómo funciona la invitación" notice-group** — Fails (a)+(b)+(d) collectively: four
> consecutive paragraphs of internal invite-flow mechanics before the visitor has decided to try
> anything. Belongs: collapse to one sentence on the landing; expiry/never-accepted mechanics as
> in-app messaging or FAQ.
>
> **"El saldo sólo está bien si lo anotan los dos."** — Fails (d), an accuracy caveat right after
> the core pitch. Belongs: in-app tooltip when linking, not the landing page.
>
> **02 · El ritmo del mes**
>
> **"Pon como presupuesto... marca la casilla «Es un gasto fijo»"** — Fails (a), names an exact UI
> checkbox label and its internal effect. Belongs: first-time-use tooltip on the budget screen.
>
> **"Si no marcas nada..."** — Fails (d), troubleshooting for a mistake not yet made. Belongs:
> in-app warning or FAQ.
>
> **"Mesura no distingue un día en que no gastaste de uno en que no anotaste."** — Fails (a)/(d).
> Belongs: FAQ.
>
> **"Una hoja de cálculo también te lo puede decir..."** — Fails (e), self-undermining
> objection-handling that introduces a competing option nobody asked about. Belongs: cut, no
> relocation.
>
> **02b · Cuatro casos (entire section)** — All four items fail (d): minority-segment limitations
> that, stacked, read as "this product has more caveats than benefits." Belongs: one acknowledgment
> line survives; detailed workarounds to FAQ/in-app help.
>
> **"Si tu dinero pierde valor... o vives entre dos monedas."** — Fails (d) hard and (c): dense,
> abstract, ends in a sentence that needs a second read even for a native speaker. Belongs: cut
> from the landing flow, FAQ for the segment it affects.
>
> **03 · Anotar**
>
> **"¿Qué fue?" field mechanics** — Fails (a), plus a duplicate of the section-01 shared-visibility
> caveat. Belongs: in-app tooltip; drop the duplicate.
>
> **"Alrededor de eso hay metas de ahorro..."** — Fails (a)+(b), five tertiary features each
> immediately qualified with what it doesn't do — the "muchas cosas que no hacemos" pattern in
> concentrated form. Belongs: bare feature list, zero elaboration, or cut entirely.
>
> **04 · Tus datos**
>
> **"Tus movimientos, que sí se pueden leer..."** — Fails (a) decisively: explains the absence of
> end-to-end encryption, enumerates four internal-access scenarios verbatim from the privacy
> policy, names the individual who can read the data. This is privacy-policy content. Belongs:
> compress to one sentence; full enumeration to the privacy policy.
>
> **"Tres servicios para funcionar"** — Fails (a), sub-processor disclosure is textbook
> privacy-policy material. Belongs: privacy policy.
>
> **"Irte es un botón"** retained-balance clause — Fails (d) partially; keep the deletion mechanic,
> cut the edge case. Everything else in this section (banking, ads, AI, no rachas) **passes** —
> these are the actual trust promises the hook depends on.
>
> **05 · Antes de dejar tu correo**
>
> **"Se empieza de cero..."** — Borderline pass on content, doesn't need to be pre-email-capture.
> Belongs: account-creation flow.
>
> **"La moneda se elige al crear la cuenta... sí se puede cambiar después."** — Fails (a)+(c) hard:
> five sentences of currency-re-expression mechanics, exactly the kind of "concepto técnico difícil"
> flagged. Belongs: cut from the landing; inline warning next to the currency selector in the real
> account-creation form.
>
> **06 · Preguntas (FAQ)** — Largely passes as-is; opt-in disclosure, several answers already
> duplicated in forced-visible paragraphs upstream — that duplication is itself evidence the
> natural home exists and is underused. Expect it to absorb the trimmed content.
>
> **07 · Invitación** — Passes cleanly, no changes recommended.
>
> **Wall-of-text flags (by shape alone):** the hero callout (5 sentences, 4 jobs), the showcase
> note, the cifra-diaria paragraph, the section-01 notice-group, the section-02 callout, the
> section-02b currency callout, the "¿Qué fue?" callout, the section-03 features marginal, the
> section-04 "tus movimientos" small, the section-05 currency item.
>
> **Overall verdict:** if this page has to shrink to half its length, the organizing principle
> should be: keep only what proves the three core promises (log a spend in seconds, know your
> daily pace, split fairly with one person) are real and trustworthy to a skeptical-but-interested
> reader — and move every "here's exactly how it works internally," every "here's who this doesn't
> work for," and every "here's what we don't do" past the second instance, to a layer the visitor
> reaches only if they choose to: the FAQ, the account-creation flow, or in-app tooltips at first
> use. Given the predecessor page already over-converted relative to what the product retains,
> none of this cutting reduces informed consent in any way that matters.
