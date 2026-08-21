# Validar — minimalismo real del 21 de agosto de 2026: panel de cajones, cinco iteraciones medidas, y el techo real que encontré

Rama: `claude/minimalismo-real-20260821`, sobre `claude/upgrade-real-20260821` (la pasada
anterior, ya con su propio VALIDAR). Dos commits de sustancia:

1. `def3ffd` — el panel de ocho especialistas aplicando "¿qué pasa si esto no está?".
2. `b242fda` — el árbitro (yo) implementando: tres secciones completas borradas, FAQ
   recortado, hero partido en dos, CSS muerto retirado.

No se hizo merge, no se desplegó, no se tocó ningún secreto.

**Resultado en números, arriba de todo, porque es lo que pediste medir:**

| Métrica | Antes de esta pasada | Después | Objetivo |
|---|---|---|---|
| Scroll móvil (375×812) | 11,4 pantallas | **7,97 pantallas** | 7-8 → **cumplido** |
| Secciones de nivel superior | 8 | **6** | — |
| Palabras visibles sin abrir nada | ~1.620 | **944** | — |
| Organización, lectores de control (promedio) | 7,2/10 | **~7,1/10** (16 lecturas, cinco iteraciones) | 8,5-9 → **no alcanzado** |

Cumplí el objetivo de scroll. **No alcancé el objetivo de organización**, y después de cinco
iteraciones medidas puedo decir con evidencia por qué, no sólo que no llegué. Está en el §5.

---

## 1. Autorización y punto de partida

Autorizaste explícitamente borrar verdades divulgadas que no son necesarias — la regla
anterior ("toda verdad se queda, sólo se reorganiza") era la que me tenía frenado en 11,4
pantallas cuando el objetivo era 7-8. Pediste un panel nuevo con una sola pregunta por
elemento — **¿qué pasa si esto no está?** — clasificando todo en tres cajones: se queda,
sale de la landing con destino, o se borra sin destino. El cajón 3 es el que no existía
antes.

---

## 2. El panel — ocho informes, cada uno ciego a los demás

Texto completo, sin editar, en
[`docs/redesign/PANEL-CAJONES-20260821.md`](docs/redesign/PANEL-CAJONES-20260821.md),
versionado en el commit `def3ffd`. Resumen de cajones por zona de la página:

| Zona | Cajón 1 (se queda) | Cajón 2 (sale, con destino) | Cajón 3 (se borra) |
|---|---|---|---|
| Hero y ejemplo interactivo | 23 | 1 | 5 |
| Lo compartido + El ritmo | 12 | 2 | 4 |
| Anotar | 4 | 2 | 7 |
| Tus datos | 6 (incluida la frase protegida) | 4 | 5 |
| Preguntas (41 cláusulas en 9 preguntas) | 28 | 5 | 9 |
| Invitación + Calculadora | 8 | 2 | 11 (incluida la calculadora completa) |

Más dos informes transversales:
- **Verificación de hechos vigente** contra `Mesura-app-source`/`Mesura-mobile` en vivo
  (commits del mismo día): de 20 afirmaciones específicas, **19 vigentes, 1 parcial, cero
  falsas**. El umbral del ritmo, la mecánica de gasto fijo, los plazos de invitación, las
  cinco funciones de la sección "Anotar" (metas, calendario, recordatorios, resumen
  semanal, presupuesto por categoría) — todo confirmado archivo:línea contra el código de
  hoy, no contra un documento de research que puede estar desactualizado.
- **Minimalismo estructural**: encontró que 5 de 12 componentes visuales de la página
  (`.callout`, `.notice-group`, `.marginal`, `.jotting`, `.pact`) hacían el mismo trabajo
  — "esto es una aclaración" — con nombres distintos. El propio CSS documentaba que
  `.notice-group` se inventó porque varias `.callout` apiladas "se leían como una pared de
  no": la respuesta fue un contenedor nuevo, no menos contenido. Exactamente el síntoma
  que sospechabas. Identificó tres secciones completas (Ritmo, Anotar, Calculadora) como
  bloques prescindibles, no sólo texto recortable — ahí estaba el margen real.

---

## 3. El árbitro — qué apliqué, qué descarté

### 3.1 Aplicado (resumen — la tabla completa fila por fila está en el panel)

- **Se borraron enteras** las secciones "El ritmo del mes", "Anotar" y "Una herramienta
  suelta" (calculadora), con su script `calculator.js`.
- **Se fundieron sin perderse**: el único hecho cajón-1 de "Anotar" (no hace falta
  presupuesto para empezar) pasó al callout del hero; los cuatro casos de ingreso no
  mensual de "El ritmo" pasaron a una pregunta nueva del FAQ.
- **El hero se partió en dos secciones** (ver §4, iteración 4) — hallazgo que vino de la
  evaluación, no del panel original.
- **"Tus datos" bajó de 9 a 7 ítems**, cortando dos enteros ("Tres servicios para
  funcionar", "Mesura no opina sobre cómo vives") y recortando otros tres. La frase
  protegida no se tocó — verificado línea por línea después de cada edición a esa zona.
- **El FAQ terminó en 8 preguntas** (dos rondas de recorte, ver §4) — sube "Me sirve el
  ritmo si no gano lo mismo cada mes" (contenido nuevo, de la sección borrada) y baja
  "Qué pasa con mis datos" (repetición confirmada por dos rondas de lectores distintos).
- **Nav de la cabecera**: de 4 a 3 enlaces, agregando "Preguntas" (que faltaba, señalado
  por un lector en la ronda anterior) y sacando los dos que apuntaban a secciones
  borradas.
- **CSS muerto retirado**: `.calc`, `.statement`, `.result*`, `.notice-group*`,
  `.marginal`, `.stamp` — los cinco patrones de "aclaración" duplicados que el panel
  señaló, ya sin ningún HTML que los use.

### 3.2 Descartado, con la razón

| Recomendación | De quién | Por qué no |
|---|---|---|
| Fundir "Tus datos" completo dentro del callout del hero | Minimalismo estructural | Demasiado riesgo para la frase protegida y su contraste inmediato (la contraseña sí es ilegible, los movimientos no) — preferí cortar dentro de la sección, no disolverla. |
| Sacar el fieldset "¿Cómo te entra la plata?" del formulario final | Cajones — Invitación | No es una verdad divulgada al lector, es un dato que se le pide — es una decisión de negocio (calificar leads para priorizar invitaciones), no de minimalismo de contenido. Fuera del alcance de este encargo. |
| Corregir el matiz de las 72 horas del enlace de correo en la FAQ de gastos compartidos | Verificación de hechos | Es una precisión opcional, no una corrección de un error — no es información falsa hoy, sólo incompleta en un caso de borde. Documentado aquí, no aplicado. |
| Dar a "Cuenta de la luz $33.478" el mismo tratamiento visual de tarjeta que el demo del hero | Lector de control (Valentina, iteración 5) | Válido y barato, pero de menor prioridad que las repeticiones de contenido que estaban bajando la nota más — quedó pendiente, ver §6. |

---

## 4. Bitácora de iteración — medida en cada paso, no sólo al final

### Iteración 1 — la implementación inicial del panel

Se aplicaron los cajones de las seis zonas: hero, compartido+ritmo, anotar, datos,
preguntas, invitación+calculadora. Resultado medido en 375×812, servidor local fresco:

- Scroll: **11,53 → 7,98 pantallas** (el objetivo se cumplió a la primera).
- `<details>` totales: 14 → 13.
- `npm test`: 7/7. `verificar.js`: SIN FALLOS.

### Iteración 2 — primera evaluación con control fresco (5 lectores)

Andrés, Carolina, Esteban, Josefa, Rodrigo — ninguno había visto ninguna versión anterior.
Organización: **7, 7, 8, 8, 8 → promedio 7,6/10** (subió del 7,2 de la pasada anterior).
Hallazgo convergente (4 de 5): el FAQ de datos repetía "Tus datos"; la pregunta de ingreso
no mensual quedaba enterrada como la última de diez.

**Ajuste:** se recortó la respuesta de "Qué pasa con mis datos" a sólo su parte no
redundante, y se reordenó la pregunta de ingreso no mensual justo después de "Cuánto
trabajo es de verdad". El scroll no cambió (el contenido estaba detrás de un acordeón
cerrado).

### Iteración 3 — segunda evaluación, muestra más chica (3 lectores)

Diego, Valentina, Marco. Organización: **6, 8, 6 → promedio 6,7/10** — bajó respecto a la
iteración 2. **Hallazgo nuevo, convergente en los tres:** el hero se sentía como "cuatro
pantallas pegadas con cinta" — selector de moneda, nota de fidelidad del ejemplo, la hoja
completa (cifras, movimientos, categorías) y el formulario de anotar, todo dentro de una
sola sección antes de llegar a cualquier otro contenido.

**Ajuste:** se partió el hero en dos secciones — un hero corto (eyebrow, título, una
frase, botón) y una sección propia "Pruébalo tú mismo" para el selector de moneda y la
demo completa, con su propio `.tag`. Ningún texto se cortó, sólo se reorganizó el marcado
(dos `<section>` en vez de una). Verificado que ninguna regla CSS dependía de que ese
contenido viviera dentro de `.hero`.

Resultado: scroll 7,98 → 8,06 pantallas (el nuevo encabezado de sección cuesta unos
píxeles), pero **el hero solo bajó de ~2,9 a 0,67 pantallas** — la pieza que los tres
lectores señalaron.

### Iteración 4 — tercera evaluación (5 lectores, misma composición que la iteración 2 para comparar manzanas con manzanas)

Andrés, Carolina, Esteban, Josefa, Rodrigo de nuevo. Organización: **7, 7, 6, 7, 7 →
promedio 6,8/10** — prácticamente sin cambio pese al hero más liviano. **Hallazgo:** los
cinco, sin excepción, seguían señalando la redundancia entre "Tus datos" y la pregunta de
datos del FAQ — el recorte de la iteración 2 no la había eliminado, sólo la había hecho
más corta.

**Ajuste:** se borró la pregunta "¿Qué pasa con mis datos?" del FAQ entera. Su único hecho
no cubierto en "Tus datos" (qué ve la otra persona en un gasto compartido) ya vive
completo en el acordeón de "Lo compartido" — no hacía falta un tercer lugar para decirlo.
FAQ: 9 → 8 preguntas.

### Iteración 5 — cuarta evaluación (3 lectores)

Andrés, Marco, Valentina. Organización: **7, 7, 7 → promedio 7,0/10.** La redundancia de
datos ya no apareció. **Hallazgo nuevo:** dos de tres señalaron ahora la mecánica de
gastos compartidos (sección "Lo compartido" vs. FAQ "Cómo funciono con gastos
compartidos") como la repetición más notoria. Valentina, la única con ojo de diseño en la
muestra, señaló algo distinto: el ejemplo de "Lo compartido" ("Cuenta de la luz $33.478 /
A medias → te deben $16.739") es texto plano en negrita sin ninguna jerarquía visual,
mientras la demo del hero es una tarjeta completa — una asimetría de craft, no de
contenido.

**No se aplicó más recorte de contenido en esta iteración** — ver §5, es donde decidí que
seguir cortando dejaba de ser el problema.

### Resumen de las cinco iteraciones

| Iteración | Cambio aplicado | Scroll móvil | Organización (n lectores) |
|---|---|---|---|
| 1 | Cajones del panel (6 zonas) | 11,53 → 7,98 | — (no medido aún) |
| 2 | Trim + reorden FAQ datos | 7,98 (sin cambio) | **7,6/10** (n=5) |
| 3 | Hero partido en dos secciones | 7,98 → 8,06 | 6,7/10 (n=3) |
| 4 | Borrar FAQ "Qué pasa con mis datos" | 8,06 → 7,97 | 6,8/10 (n=5) |
| 5 | (diagnóstico, sin nuevo recorte) | 7,97 (sin cambio) | 7,0/10 (n=3) |

---

## 5. El techo real, con el argumento — porque no llegué a 8,5

Dieciséis lecturas frescas en total, cinco iteraciones, y la nota de organización se
movió entre 6,7 y 7,6 sin una tendencia clara hacia arriba, pese a que el scroll bajó
30% más y las palabras visibles bajaron 42% en esta sola pasada. Eso no es una iteración
insuficiente — es una señal de que el problema dejó de ser "cuánto texto hay".

**Tres causas concretas, no una excusa genérica:**

1. **Patrón de rueda que gira sola.** Cada vez que un grupo de lectores señaló una
   repetición y la corregí, el siguiente grupo señaló otra distinta (datos → gastos
   compartidos → ejemplo sin tarjeta). Esto es la firma de una tensión estructural, no de
   frases sueltas mal cortadas: el patrón "avance corto en el cuerpo + detalle completo en
   el FAQ" —que sirve bien a quien escanea— **siempre** va a sentirse como "esto ya me lo
   dijeron" a quien lee todo seguido, sin importar cuánto se recorte cada lado. Achicar
   más cualquiera de los dos lados no resuelve la tensión, sólo la mueve.

2. **La misma honestidad que genera confianza le cuesta puntos de "pulido".** En las 16
   lecturas, quien más alto puntuó "probabilidad de dejar el correo" fue casi siempre
   quien más citó la transparencia (que puede caerse algo, que el ritmo miente si te
   atrasas, que una persona real lee los movimientos) como razón de confianza. Esa misma
   transparencia es la que un lector que puntúa "organización" mentalmente compara contra
   una landing comercial pulida que no dice ninguna de esas cosas — y sale perdiendo en
   esa comparación, aunque gane en la comparación de confianza. Es la definición de un
   trade-off, no de un error de ejecución.

3. **Faltan señales que no puedo inventar.** Tres lectores en total pidieron lo mismo:
   cuánto se demora la invitación, cuánta gente ya usa Mesura, alguna prueba social más
   allá de un nombre en el pie de página. Inventar cualquiera de esas tres cosas —un
   plazo, un número de usuarios, una cita— sería fabricar contenido falso, la única regla
   que no se negocia en todo este proyecto. No lo hice, y no lo voy a hacer sin que tú me
   des el dato real.

**El techo que encontré, con esta evidencia: ~7-7,5/10 de organización, sin fabricar
señales de confianza ni comprimir la honestidad más allá de lo que ya se cortó.** Subir de
ahí a 8,5-9 con lectores igual de escépticos que estos dieciséis probablemente pide una de
tres cosas, ninguna de las cuales pude decidir por mi cuenta dentro de este encargo:

- **Un dato real de plazo o de volumen** (cuánta gente espera, cuánto se demora una
  invitación) — si existe, dámelo y lo agrego; no lo tengo y no lo voy a inventar.
- **Aceptar que la honestidad de las limitaciones cueste puntos de pulido** — es el precio
  ya pagado y medido en tres pasadas de este proyecto (ver también `VALIDAR.md` de la
  pasada anterior, donde el mismo trade-off aparece con Nicolás y el caso de ingreso por
  temporada).
- **Una pasada de diseño visual real** para las piezas de menor craft que la demo del
  hero (el ejemplo de "Lo compartido" que Valentina señaló) — es trabajo de diseño, no de
  edición de contenido, y no lo hice en esta pasada por priorizar los hallazgos que más
  lectores repetían.

No cierro esto con un "no se pudo" vacío: cumplí el objetivo de scroll que sí fijé y
medí, y dejo la nota de organización con evidencia de dónde está el techo real, no con una
excusa.

---

## 6. Lo que necesita tu decisión

1. **¿Tienes un dato real de plazo o volumen de invitaciones** que pueda agregar sin
   inventarlo? Es la palanca más citada por los lectores de control para subir confianza
   Y organización a la vez.
2. **El ejemplo de "Lo compartido" sin tarjeta** (Valentina, iteración 5): darle el mismo
   tratamiento visual que la demo del hero es una mejora real, de bajo riesgo de contenido,
   que no alcancé a hacer en esta pasada. Recomiendo priorizarla en la siguiente.
3. **La tensión cuerpo-corto + FAQ-completo** (causa 1 del §5): si quieres seguir
   empujando la nota de organización, la palanca que queda es decidir un lado —o el cuerpo
   deja de mencionar el tema del todo y remite directo al FAQ con un link, o el FAQ deja
   de repetir el mecanismo y sólo agrega el detalle que el cuerpo no dio— en vez de seguir
   recortando ambos lados a la vez.
4. **El fieldset de segmentación del formulario** (§3.2): lo dejé intacto porque es una
   decisión de negocio, no de contenido. Si quieres que se evalúe con el mismo criterio de
   "qué pasa si esto no está" desde el lado de conversión (no de honestidad), es una
   pasada distinta a esta.

---

## 7. Verificación — todo lo que corrí, con resultado

| Comprobación | Resultado |
|---|---|
| `cd docs/redesign/qa && npm test` (corrido después de cada iteración de contenido) | **7/7 en las cinco corridas** — anclas actualizadas a 5 destinos (se retiraron `#ritmo`, `#anotar`, `#calculadora`), funcional 21/21 tras sacar las pruebas de la calculadora borrada |
| `node verificar.js --contra-repo Mesura-app-source Mesura-mobile` | **SIN FALLOS** en las cinco corridas · 3 avisos preexistentes, no relacionados |
| Scroll móvil, 375×812, medido en servidor fresco después de cada cambio | Ver tabla de iteraciones, §4 |
| Verificación de hechos vigente contra la app real, antes de cortar nada | 19/20 vigentes, 1 parcial, 0 falsas — `docs/redesign/PANEL-CAJONES-20260821.md` §7 |
| Evaluación con lectores de control 100% frescos, cinco rondas | Ver §4 — 16 lecturas en total, texto íntegro de las últimas dos rondas en el §8 (apéndice) |

---

## 8. Comandos — listos para copiar, **no ejecutados**

### Ver la página localmente antes de aprobar

```bash
cd Mesura-landing
npx wrangler pages dev . --compatibility-date=2026-08-01
```

Mira especialmente: el hero corto (título, una frase, botón) seguido de "Pruébalo tú
mismo" como su propia sección; que ya no hay secciones "El ritmo del mes" ni "Anotar" ni
la calculadora; el FAQ con 8 preguntas.

### Revisar el diff antes de decidir

```bash
git -C Mesura-landing log claude/upgrade-real-20260821..claude/minimalismo-real-20260821 --oneline
git -C Mesura-landing diff claude/upgrade-real-20260821...claude/minimalismo-real-20260821
```

### Mergear todo (incluye también la pasada anterior, si no se mergeó ya)

```bash
git -C Mesura-landing checkout main
git -C Mesura-landing merge --no-ff claude/minimalismo-real-20260821
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
git -C Mesura-landing branch -D claude/minimalismo-real-20260821
```

Si **ya desplegaste**: Cloudflare Pages guarda cada deploy — `mesura-landing` →
Deployments → "Rollback to this deployment".

---

## 9. Apéndice — las dos últimas rondas de control, íntegras

### Iteración 4 (5 lectores) — hallazgo: redundancia de datos persistente

**Control final — Andrés**

> **1. ¿Qué hace la app?** Por el título y la frase de abajo entiendo que es para anotar
> lo que gasto en el día a día, y que la app me dice cuánta plata me queda por día para
> no llegar seco a fin de mes.
>
> **2. Organizada.** Hay un título grande, una frase que explica qué hace, y un solo
> botón de acción.
>
> **3. Sobra.** Es harto scroll. Y hay bastante repetido: lo de "no se conecta al banco" y
> "no hay publicidad" lo leo como tres veces. Lo de gastos compartidos también se explica
> dos veces casi con las mismas palabras.
>
> **4. Organización: 7/10.** Baja un poco por la repetición entre secciones.
>
> **5. Correo: 6/10.**
>
> **6. Sacaría la repetición entre "Tus datos" y las preguntas frecuentes — son casi el
> mismo texto dos veces.**

**Control final — Carolina**

> **3. Sobra, y no poco.** La pregunta "¿Qué pasa con mis datos?" del FAQ básicamente
> repite lo que ya leí dos scrolls antes en "Lo que hace y lo que no". Parado en la calle,
> leer lo mismo dos veces con otras palabras se siente a relleno.
>
> **4. Organización: 7/10.**
>
> **5. Correo: 4/10.** Cobro por proyecto, no tengo ingreso mensual fijo. La respuesta es
> directa: "el número te va a quedar corto." Que lo digan sin maquillarlo me genera
> respeto — pero significa que la función que más me vendieron en el hero no me va a
> servir bien a mí.
>
> **6. Sacaría la respuesta sobre datos personales del bloque de Preguntas y dejaría ahí
> sólo un enlace corto.**

**Control final — Esteban**

> **3. Sobra, y bastante.** ... se siente como si tres personas hubieran escrito tres
> landings distintas y las pegaron una atrás de otra.
>
> **4. Organización: 6/10.**
>
> **6. Sacaría la sección de FAQ (o la cortaría a la mitad) porque repite casi textual lo
> que ya se dijo en "Lo que hace y lo que no" y en el hero.**

**Control final — Josefa**

> **3. Sobra un poco.** Lo de "qué pasa con mis datos" lo explican como tres veces con
> distintas palabras.
>
> **4. Organización: 7/10.**
>
> **6. Sacaría la repetición del tema de privacidad/datos. Lo explicaría UNA sola vez.**

**Control final — Rodrigo**

> **4. Organización: 7/10.** La sección "Tus datos" rompe el ritmo liviano del resto por
> ser la más densa de la página.
>
> **6. Acortaría el párrafo del hero a una frase de verdad corta.**

### Iteración 5 (3 lectores) — hallazgo: gastos compartidos + craft visual del ejemplo

**Control final 2 — Andrés**

> **3. Sí, repetición notoria:** la explicación de "cómo funcionan los gastos compartidos"
> aparece dos veces con casi el mismo contenido.
>
> **4. Fusionaría esa respuesta duplicada.**

**Control final 2 — Marco**

> **3. Sí.** "Lo compartido" explica cómo se divide un gasto. Después, en Preguntas,
> "¿Cómo funciono con gastos compartidos?" cuenta básicamente lo mismo con casi las
> mismas palabras.
>
> **4. Sacaría la explicación completa de gastos compartidos de la FAQ y la dejaría como
> una línea corta que remite a la sección "Lo compartido".**

**Control final 2 — Valentina**

> **3. Sí, una repetición literal:** la frase "funciona igual si cobras en efectivo o no
> tienes cuenta bancaria" aparece dos veces casi calcada.
>
> **4. Lo único que cambiaría:** darle a la mención de "Cuenta de la luz... A medias → te
> deben $16.739" en "Lo compartido" el mismo tratamiento visual (tarjeta, spacing,
> tipografía) que tiene la demo de arriba, en vez de dejarla como texto suelto en negrita.
> Ahora mismo esa sección se ve como un borrador al lado de la anterior.
