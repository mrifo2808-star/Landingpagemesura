# Validar — pasada de jerarquía visual, 21 de agosto de 2026

Rama: `claude/jerarquia-visual-20260821`, sobre `main` (que ya tenía fusionada
`claude/estudio-usuarios-capa1-20260820`). No se hizo merge, no se desplegó, no se tocó ningún
secreto. **Esto reemplaza la versión anterior de `VALIDAR.md`** — su contenido sigue siendo
historia correcta de la pasada anterior; queda en `git log` si hace falta releerlo.

**El encargo:** dijiste que la landing "quedó con mucho texto" y que "confunde", y pediste una
revisión profesional y justificada, aplicar mejoras, y verificar que la mejora es real — sin
borrar ninguna verdad declarada. Esto es esa revisión, lo que se aplicó, y la evaluación.

---

## 1. La revisión profesional

### 1.1 El diagnóstico correcto, y por qué no es "sobra texto"

Tu lectura es acertada, pero la causa no es el volumen de palabras — es la **jerarquía dentro de
cada sección**. La página tiene una escala tipográfica cuidada, una medida de línea consistente
(46–64 caracteres en casi todo el cuerpo, dentro del rango profesional), cifras siempre
monoespaciadas y un solo acento de color. Ese trabajo ya estaba hecho y no había que rehacerlo.
Lo que fallaba era otra cosa, y el propio proyecto ya lo había anticipado por escrito sin
notarlo: `landing-v3/evaluacion/METODO.md` §5.5, escrito por la sesión que evaluó el TEXTO, no la
maqueta, cierra con esta frase — *"nada de lo que dice esta evaluación sobrevive a una
maquetación que ponga la sección 02 en letra grande y el escaparate abajo."* Once días después,
la maqueta llegó y nadie volvió a leer esa frase contra ella. La sección 02 es, en efecto, la que
peor estaba.

### 1.2 El síntoma exacto: bloques de igual peso, en fila

Conté los bloques con borde y fondo propio —`.callout`, la unidad que usa la página para marcar
"esto es una salvedad importante"— por sección, antes de esta pasada:

| Sección | Bloques `.callout` seguidos | Qué contenían |
|---|---|---|
| 00 · Hero | 1 (+1 dentro de la hoja, +1 nota aparte) | Límites del producto — aceptable, es uno solo, no en fila |
| 01 · Compartido | 1, con **cuatro** afirmaciones distintas unidas por `<br><br>` dentro de la misma caja | Mecánica completa de la invitación |
| 02 · El ritmo | **3 callouts seguidos** + 1 párrafo de más de 60 palabras entre medio | Instrucción de presupuesto, margen del aviso, bug del primer mes |
| 05 · Antes de dejar tu correo | **2 callouts `--warn` seguidos**, cada uno de 3–5 oraciones | Sin importación, moneda |

Sección 02 es el caso de libro: tres cajas del mismo color, del mismo grosor de borde, la misma
tipografía, una debajo de otra, sin que ninguna señale "ésta importa más". Es exactamente lo que
`RESULTADO.md` §3.1 ya había nombrado en el texto, con la cita de Andrés (contador, corpus
anterior): *"Si yo revelo cinco contingencias verdaderas, cada una bien medida, en un párrafo
seguido, el que lee concluye que la empresa se está cayendo aunque ninguna sola lo diga. (…)
Ustedes pusieron todo en fila."* Ese arreglo se hizo en el TEXTO en la ronda pasada. No se hizo
en la MAQUETA, porque en agosto la maqueta todavía no existía como para someterla a la misma
prueba. Ahora existe, y falla la misma prueba por la misma razón, un nivel más abajo: ya no es el
texto el que va en fila, es la caja.

### 1.3 El barrido de cinco segundos: lo que YA funciona y no hay que tocar

El titular (`t-display`, hasta 84px) más la bajada inmediata —"anotas un gasto: el monto, la
categoría, guardar... cuánto te queda por día"— **ya es el mensaje de tres segundos**, y está
donde tiene que estar: lo primero que se lee, en el tamaño más grande de la página, sin
competencia. No lo toqué. Es el activo más fuerte de la página y cualquier intervención que lo
opacara habría sido un error, por buena que fuera la intención.

Tampoco moví el primer `.callout` del hero (límites: no banco, necesita conexión) más abajo, aun
sabiendo que es lo primero con borde que el ojo encuentra después del titular. La razón la dio la
propia evaluación de trece lectores, y la cito porque contradice la intuición de "lo negativo va
después de que el lector ya esté convencido": Priscila, *"lo que asusta no es el 'no', es el 'no'
cuando todavía te estabas ilusionando."* Un límite dicho temprano se lee como información; el
mismo límite dicho tarde se lee como decepción. Moverlo habría sido la corrección equivocada.

### 1.4 Qué se puede plegar sin esconder, y qué no

Revisé cada bloque candidato a `<details>`. Casi ninguno calificó: son hechos que cambian la
decisión de crear la cuenta (moneda, importación) o el cálculo central (ritmo, gastos fijos), y
esconderlos detrás de un clic —aunque siga siendo "no borrar"— es la misma falta que la re-lectura
del texto ya corrigió una vez (§3.2 de `RESULTADO.md`: seis de trece "no" que Camila saltó a
propósito por estar en una lista plegable, y que ella misma pidió que quedaran plegados). La única
pieza que sí es candidata legítima —"cómo se arma este ejemplo" en el hero— decidí NO plegarla:
explica el presupuesto que el lector está mirando en ese momento, y ocultarla detrás de un clic
mientras el número queda a la vista sería mostrar la cifra sin su condición, que es justo el tipo
de "asterisco a mitad de camino" que el estudio castigó. Se queda visible, más corta.

### 1.5 El único mensaje de tres segundos, por sección — auditoría

| Sección | ¿Hay un único mensaje claro? |
|---|---|
| 00 Hero | Sí — el titular + bajada. No tocado. |
| 01 Compartido | Sí — "anotas una vez, Mesura lleva el saldo". La mecánica de invitación es soporte, ahora en lista, no compite con el mensaje. |
| 02 Ritmo | Antes no: tres cajas competían por ser "la" advertencia. Ahora sí — "pon todo, marca lo fijo" es la única caja; el resto es nota al margen. |
| 03 Anotar | Sí — no tocada, ya tenía un solo callout. |
| 04 Datos | Sí — el mejor ejemplo de la página: lista de dos columnas con signo +/–, nunca prosa corrida. No tocada; es el patrón que repliqué en 01 y 05. |
| 05 Antes de correo | Antes no: dos cajas del mismo peso. Ahora sí — una sola caja con dos filas. |
| 06 Preguntas | Sí — acordeón, ya era progresivo. No tocada. |

### 1.6 Veredicto

La craft tipográfica de la página es sólida y no era el problema. El problema era de
**arquitectura de la información dentro de la sección**: varias advertencias independientes,
cada una legítima, puestas en cajas idénticas, una tras otra, sin que ninguna se subordinara a
otra. La cura que ya usa la propia página en la sección 04 —lista con filete, negrita como
encabezado de fila, cuerpo más chico debajo— es la que faltaba extender a las secciones 01, 02 y
05. Es la misma cura que Andrés pidió para el texto en agosto, aplicada ahora al layout.

---

## 2. Qué se cambió, y por qué

### 2.1 Componente nuevo: `.notice-group` (`assets/css/landing.css`)

Una caja con borde, lista de filas separadas por filete horizontal, negrita como encabezado de
cada fila. Mismo lenguaje visual que `.pact` (sección 04). Se usa donde antes había un `.callout`
con `<br><br>` simulando una lista que en realidad ya era una lista semánticamente.

### 2.2 Sección 01 — la mecánica de la invitación, de párrafo a lista

Las cuatro afirmaciones («necesita una cuenta», «es una sola vez», «vence a los siete días», «si
nunca acepta») pasaron de un `.callout` con `<br><br>` a un `.notice-group` de cuatro filas.
**Ninguna palabra cambió.** Es restructuración pura de marcado.

### 2.3 Sección 05 — dos advertencias, una caja

Los dos `.callout--warn` («se empieza de cero», «la moneda se elige…») se fusionaron en un
`.notice-group--warn` de dos filas. **Ninguna palabra cambió.**

### 2.4 Sección 02 — esto sí cambió contenido, y es lo que más justifica revisar antes de aprobar

Aquí no sólo reorganicé: corregí tres afirmaciones que dejaron de ser ciertas la noche del 20 al
21 de agosto, cuando las dos apps reemplazaron el umbral fijo del ritmo por uno relativo. Lo
verifiqué de nuevo contra el código, en vivo, antes de tocar nada — no confié en que el hallazgo
de `Mesura-lanzamiento/LEEME-PRIMERO-21-agosto.md` siguiera vigente sólo porque estaba escrito:

- **`app/lib/home-context.ts:53`** (Mesura-app-source): `PACE_ESCALATION_RATIO = 0.1` — 10% de lo
  esperado a la fecha, no un monto fijo. La constante vieja, `PACE_TOLERANCE = 500`, ya no existe
  en el archivo.
- **`lib/home-state.ts:97`** (Mesura-mobile): el mismo `0.1`, con el mismo nombre.
- El comentario de `home-context.ts:29-52` documenta el motivo: con un umbral fijo, "vas por
  delante" se encendía el 97% de los días del mes para cualquier presupuesto, sin importar su
  tamaño.

**Los tres cambios de texto:**

1. **Se borró el párrafo del margen** («por debajo de $500... no llega al 0,4%»). Con el ejemplo
   propio de la página (presupuesto $487.300, día 18/31), el margen real hoy es **$28.295**, el
   **5,8%** del presupuesto — no $500 ni 0,4%. No lo reescribí con el número nuevo: seguí la
   recomendación de `LEEME-PRIMERO-21-agosto.md` de borrar el bloque entero, porque con un umbral
   relativo ya no hay una "banda fija" que valga la pena confesarle al lector con ese detalle.
2. **Se borró el párrafo del bug del primer mes** («si entras a mitad de mes... te va a decir que
   vas holgado»). Verifiqué que el arreglo (`firstTrackedDayInMonth` / `paceWindowFor`) está en
   las dos apps, con el mismo mecanismo. El hecho que sí seguía siendo cierto —"Mesura no
   distingue un día sin gasto de un día sin anotar"— se conservó, ahora como nota breve.
3. **Se reescribió la instrucción del presupuesto.** Verifiqué que la web ya tiene completa la
   casilla de gasto fijo: esquema (`db/schema.ts:49`), migración (`0025_naive_deathstrike.sql`),
   API (`app/api/expenses/route.ts:93`), el checkbox en el formulario
   (`MovementFormSheet.tsx:342`, texto literal **«Es un gasto fijo (arriendo, cuentas)»**, citado
   palabra por palabra en la página) y su uso en el cálculo (`expectedSpendToDateFor`,
   `home-context.ts:148`). La instrucción vieja («deja fuera la vivienda») describía un producto
   que ya no existe: hoy la instrucción correcta es la contraria — anota todo, marca lo fijo. **La
   nativa todavía no tiene esta casilla** (`Mesura-mobile/app/edit-budget.tsx:175` sigue con el
   texto viejo); no es un problema para esta página porque describe la web, que es el sitio que
   existe hoy. Deja de serlo el día que la nativa se publique — ver §3.

**Consecuencia de bloques, no sólo de verdad:** la sección pasó de 3 cajas `.callout` + 1 párrafo
suelto a **1 caja + 1 nota al margen + 1 línea de texto corrido subordinada**. Menos bloques,
menos peso, y de paso, correcto.

### 2.5 El bug que encontré en el propio motor del ejemplo interactivo

`assets/js/mesura-datos.js` tenía, hasta esta pasada, la MISMA constante obsoleta
(`PACE_TOLERANCE = 500`) gobernando el ejemplo interactivo de la hoja — el que corre en el
navegador de cualquier visitante cuando escribe un monto de prueba. Si alguien escribía un gasto
que dejara el desvío entre $500 y el umbral real (hoy ~$28.295 en pesos chilenos, escala con el
presupuesto en las seis monedas), el ejemplo le habría mostrado un veredicto que la app real no
daría — el error exacto contra el que existe la regla del escaparate. Se reemplazó por el cálculo
relativo (`tolerancia = Math.round(Math.abs(esperado) * PACE_ESCALATION_RATIO)`), que alimenta
tanto el render inicial como `demo.js` (que ya leía el campo `tolerancia` sin cambios propios).
**Esto no es un cambio de "jerarquía visual" — es una corrección de exactitud que apareció
mientras verificaba la de al lado**, y quedó arreglada en la misma pasada porque dejarla habría
significado publicar el mismo error que acabo de sacar del texto, sólo que en JavaScript.

### 2.6 Consistencia: la nota del ejemplo, en el hero

El hero explicaba el presupuesto del ejemplo diciendo que "no incluye vivienda", con la razón
apuntando a la sección 02 — razón que ya no es la que la sección 02 da. Se reescribió para decir
lo que es cierto hoy: el ejemplo no tiene ningún movimiento marcado como gasto fijo, así que no
demuestra ese cálculo, y la sección 02 explica cómo cambiaría si lo tuviera. Es una limitación
real y declarada del ejemplo, no un error — ver §3.

### 2.7 El script de verificación externo, en el repo hermano

`Mesura-lanzamiento/landing-v3/ejemplo/verificar.js` fallaba con `1 FALLO(S)` porque su
comprobación 7 buscaba literalmente `PACE_TOLERANCE` en `home-context.ts` — el mismo hallazgo que
`LEEME-PRIMERO-21-agosto.md` ya había anotado, con la misma recomendación (actualizar la
comprobación, no el código). Apliqué esa única línea de cambio, simétrica a la que el script ya
hacía para la nativa: ahora valida `PACE_ESCALATION_RATIO` en la web también, que es la
invariante que de verdad importa —que las dos apps usan el mismo umbral relativo— no el nombre de
una constante retirada. **No toqué nada más de ese repositorio.** `node verificar.js
--contra-repo ...` corre hoy `SIN FALLOS`.

---

## 3. Lo que necesita tu decisión — con mi recomendación ya tomada

1. **La instrucción de gastos fijos describe la web, no la nativa, que todavía no la tiene.** Es
   tolerable hoy porque la landing describe el sitio que existe. Deja de serlo el día que se
   publique la app nativa con esta función atrasada. *Recomendación: cuando planifiques ese
   lanzamiento, revisa esta sección de nuevo antes de nada más — es una búsqueda de "gasto fijo"
   en `index.html`.*
2. **El ejemplo interactivo no demuestra la casilla de gasto fijo.** Dos de nueve lectores
   simulados (Teresa, Renata — ver `docs/redesign/EVALUACION-JERARQUIA-20260821.md` §4.3) se
   quedaron con la pregunta de qué pasaría si la marcaran. La nota ya lo declara (no oculta el
   límite), pero no lo resuelve. *Recomendación: si esto sigue generando dudas en uso real, es
   trabajo de ingeniería —agregar la casilla al formulario de la hoja de ejemplo— no de texto ni
   de maqueta, y queda para una pasada aparte. Alternativa reversible: nada que hacer hoy, es una
   limitación declarada, no un error.*
3. **El og-image y el JSON-LD no se tocaron en esta pasada** — no citan el margen ni el bug del
   primer mes, así que no quedaron con nada falso, pero tampoco se revisaron línea por línea de
   nuevo. *Recomendación: no urgente, ninguna cifra que citen cambió.*

---

## 4. Cómo se verificó — todo lo que corrí, con resultado

| Comprobación | Resultado |
|---|---|
| `cd docs/redesign/qa && npm test` | **7/7 bloques en verde**, incluido `funcional: 26/26` y `axe-core: 0 violaciones en 10 configuraciones` |
| `node verificar.js --contra-repo Mesura-app-source Mesura-mobile` (desde `landing-v3/ejemplo`) | **SIN FALLOS** · 3 avisos preexistentes, no relacionados (montos citados a mano en archivos de evaluación) |
| `npx wrangler pages dev .` + `curl` sin cabecera | `data-moneda="CLP"` |
| ídem con `CF-IPCountry: PE` | `data-moneda="PEN"` |
| ídem con `?m=USD` (moneda no elegible) | cae a `data-moneda="CLP"`, sin error |
| ídem con `?m=xx` (basura) | cae a `data-moneda="CLP"`, sin error |
| Selector de moneda, cambio manual, teclado, formulario, calculadora, tema oscuro | Cubierto por el `funcional: 26/26` de arriba — no hay regresión |
| Evaluación con lectores simulados, 5 anclados + 4 control nuevo | `docs/redesign/EVALUACION-JERARQUIA-20260821.md` — resultado en §5 abajo |

**Una verificación que NO pude hacer:** capturas de pantalla reales. El Browser pane de esta
sesión no compositó frames (`screenshot failed: the Browser pane is not displayed`) pese a varios
intentos con la página cargada y confirmada por `get_page_text` y el árbol de accesibilidad
(`read_page`), que sí mostraron el marcado nuevo renderizando sin errores de consola. Verifiqué
estructura y accesibilidad por esa vía más el axe-core del arnés automático (que sí corre en
Chrome headless real, con 10 combinaciones de viewport y tema), pero **nadie —yo ni tú— vio esta
versión con los ojos todavía.** Antes de mergear, ábrela: `npx wrangler pages dev .` y mira al
menos la sección 02 y la 01, que son las que más cambiaron de forma.

---

## 5. La evaluación — resumen

Documento completo: `docs/redesign/EVALUACION-JERARQUIA-20260821.md`. Nueve lectores simulados,
cinco que ya habían objetado específicamente "todo en fila" o "conté ocho no" en la ronda de
agosto, cuatro de control nuevo, sin haber visto ninguna versión.

**Sostiene la pasada:** las dos personas cuya objeción original era literalmente la acumulación
—Andrés (contador, la metáfora de las notas contables) y Camila (la metáfora del restorán)—
dijeron que la sección 01 ya no se siente "en fila". Nicolás, que pidió contar los "no" por
función, confirmó que la sección 02 bajó de bloque de siete a bloque de tres — no sólo se ve más
liviana, lo es.

**Expuso dos cosas reales, y las dos quedan escritas en vez de escondidas:**

1. **El ejemplo no demuestra la casilla de gasto fijo** (Teresa, Renata) — limitación declarada,
   no resuelta; ver §3.2 arriba.
2. **Una asimetría de peso visual dentro de la sección 02**, que Valeria (la única lectora con
   oficio de diseño del grupo) encontró y que **si se corrigió** en esta misma pasada: la nota
   "no distingue no gasté de no anoté" tenía el mismo peso que la nota principal de al lado; bajó
   a texto corrido subordinado.

**Límite del ejercicio, dicho una vez más porque importa:** el control tiene cuatro personas, no
cinco, y ya se demostró una vez —con la ronda anterior— que el tamaño del control puede invertir
una conclusión. Nadie usó la página real. Quien escribió las nueve respuestas es quien hizo los
cambios que evalúa. Detalle completo en el documento, sección 5.

---

## 6. Comandos — listos para copiar, **no ejecutados**

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

### Mergear a `main`

```
git -C Mesura-landing checkout main
git -C Mesura-landing merge --no-ff claude/jerarquia-visual-20260821
git -C Mesura-landing push origin main
```

### Desplegar

```
cd Mesura-landing
npx wrangler pages deploy . --project-name=mesura-landing
```

### El fix del script hermano — decidir si se comitea aparte

`Mesura-lanzamiento/landing-v3/ejemplo/verificar.js` se modificó (§2.7) pero es un repositorio
distinto, sin relación de submódulo con éste. Si ese repositorio lleva su propio control de
versiones:

```
git -C Mesura-lanzamiento status
git -C Mesura-lanzamiento diff -- landing-v3/ejemplo/verificar.js
```

y decide ahí si comitear ese cambio; no forma parte de este merge.

### Revertir, si algo no calza

Si **ya mergeaste y pusheaste**:

```
git -C Mesura-landing revert -m 1 <sha-del-commit-de-merge>
git -C Mesura-landing push origin main
```

Si **todavía no mergeaste** (el estado de ahora mismo):

```
git -C Mesura-landing checkout main
git -C Mesura-landing branch -D claude/jerarquia-visual-20260821
```

Si **ya desplegaste**: Cloudflare Pages guarda cada deploy — `mesura-landing` → pestaña
Deployments → "Rollback to this deployment" sobre el anterior a éste, sin tocar git.
