# Panel de cajones — 21 de agosto de 2026 (segunda ronda: minimalismo real)

Ocho agentes independientes, cada uno sin contexto de los demás ni de esta conversación,
aplicando una sola pregunta por elemento —**¿qué pasa si esto no está?**— sobre la
landing tal como quedó después de la pasada anterior (rama `claude/upgrade-real-20260821`).
Tres cajones: **1) se queda** (alguien se va o se siente engañado sin esto), **2) sale de
la landing, con destino** (sorpresa después, no ahora — se dice en el registro o el primer
uso), **3) se borra** (sin esto no pasa nada). Informes pegados sin editar.

---

## 1. Cajones — Hero y ejemplo interactivo

# Cajones — Hero y ejemplo interactivo

Nota metodológica: agrupé las 4 entradas de "Últimos movimientos" y las 4 categorías de "En qué se ha ido" en una fila cada una porque son estructuralmente idénticas (label + monto + meta) y comparten el mismo veredicto — desagregarlas en 8 filas no cambiaba el análisis, solo lo inflaba. Excluí de la cuenta final 3 elementos que no son contenido visible para el visitante (un live-region de accesibilidad x2 y un comentario HTML de desarrollador sobre scroll móvil) — los marco N/A porque la pregunta "¿qué pasa si esto no está?" no aplica a algo que nadie ve.

| Elemento (cita corta) | Ubicación | Cajón | Qué se pierde y quién, o por qué no se pierde nada |
|---|---|---|---|
| "Hoy sólo se entra con invitación" (eyebrow) | L177 | 1 | Sin esto, alguien pide acceso esperando entrar de inmediato y se siente frenado al descubrir la lista de espera recién en el formulario. Cambia la decisión de seguir. |
| H1 "Tu mes, antes de que se te vaya." | L178 | 1 | No es una "verdad divulgada", es el gancho central. Sin headline no hay razón para seguir leyendo — se queda por defecto, no por el criterio de esta tarea. |
| "Anotas un gasto: el monto, la categoría, guardar." | L182 | 1 | Fija la expectativa de fricción mínima (3 pasos). Sin esto, alguien puede asumir que hay que armar presupuesto o categorías antes de poder anotar algo. |
| "Mesura te dice cuánto te queda por día para llegar a fin de mes..." | L182-184 | 1 | Es la propuesta de valor central de todo el producto. Sin esto no hay hero. |
| "Y lleva sola el saldo de lo que pagas a medias... hasta que queda en cero." | L184-186 | **3** | La sección 01 "Lo compartido" (L391-452) explica esto mismo con más detalle y ejemplos dos pantallas más abajo. Nadie pierde la información, solo se evita adelantarla aquí. |
| Botón "Probar con un gasto" (`hidden`) | L189-191 | **3** | Ya tiene el atributo `hidden`: hoy no se renderiza para ningún visitante. No hay nada que perder porque ya no se ve — es código muerto, se borra sin condiciones. |
| "En pesos chilenos" (token de moneda en el callout) | L197 | 1 | Ancla el ejemplo que sigue. Sin esto, las cifras del demo no tienen unidad hasta que el visitante infiere por contexto. |
| "Sin publicidad ni venta de datos" | L197-198 | **3** | Está repetido casi textual en la sección 04 ("Nadie paga por verte", L580-583), con más detalle y sin costo de espacio en el hero. Nadie llega a esa sección sin haber visto ya el hero completo. |
| "sin conectar tu banco... funciona igual si cobras en efectivo o no tienes cuenta bancaria" | L198-200 | 1 | Esto sí cambia una decisión: alguien sin cuenta bancaria o que cobra en efectivo puede asumir por defecto que una app de finanzas "no es para él". Borrarlo del hero deja a ese segmento sin la señal de que aplica, hasta que llegue (si llega) a la sección 04. |
| Selector de moneda del ejemplo (form) | L203-216 | 1 | Es funcional: sin él, alguien fuera de Chile ve cifras en pesos chilenos sin poder traducirlas mentalmente a su propia moneda. |
| "Cambia el ejemplo de esta página. Tu cuenta la eliges al crearla." | L217 | 1 | Sin esto, alguien que usa el selector puede creer que acaba de fijar la moneda de su futura cuenta. Evita una confusión real, no hipotética. |
| "Esto es la pantalla de Inicio de Mesura, con datos inventados." | L221-222 | 1 | Sin esto, alguien puede pensar que está viendo datos reales de otro usuario, o no entender qué es esa tarjeta. |
| "Escribe un monto abajo... funciona de verdad, sin guardar nada ni pedirte cuenta." | L222-223 | 1 | Primera y más visible garantía de "no te comprometes a nada". Es la que realmente baja la fricción para que alguien se anime a tocar el formulario. |
| "Agosto · día 18 de 31" | L230 | 1 | Es el dato que hace que el cálculo de Ritmo tenga sentido (día 18 de 31). Sin esto, las cifras de abajo no se pueden verificar mentalmente. |
| Badge "Ejemplo · nada de esto se guarda" | L232 | 1 | Es un rótulo compacto y persistente sobre la tarjeta (tipo watermark), no una frase de venta. Costo bajo, cubre un caso que el párrafo anterior no cubre. |
| Figura "Te queda" | L237-243 | 1 | Es el número principal que demuestra la promesa del producto. Sin esto no hay demo. |
| Figura "Van gastados" | L246-250 | 1 | Mismo argumento: es sustancia del ejemplo interactivo, no relleno. |
| Figura "Ritmo" | L253-264 | 1 | Es la función que el hero está demostrando literalmente. |
| "Últimos movimientos" + 4 entradas | L270-292 | 1 | Demuestra una función real, no es decoración. |
| "En qué se ha ido" (accordion, 4 categorías) | L299-337 | 1 | Muestra otra función real. Ya está colapsado por defecto. |
| Campo "Monto del gasto" | L344-350 | 1 | Es el control que hace el demo interactivo. |
| Chips de categoría | L354-366 | 1 | Es la mecánica del demo, no texto persuasivo. |
| Botón "Anotar gasto" | L368 | 1 | Funcional, dispara el demo. |
| "Ejemplo simplificado y sin guardar nada:" | L372-373 | **3** | Tercera vez que se dice "no se guarda nada". No cambia ninguna decisión a esta altura. |
| "ningún movimiento está marcado como gasto fijo" | L373-375 | **3** | Detalle de implementación del demo, no del producto. Ya está explicado en las preguntas frecuentes. |
| "el ritmo aparece recién desde tu quinto movimiento del mes, igual que en la app" | L374-376 | **2** | Dato real del producto; su ausencia genera confusión post-registro. Destino: mensaje contextual/empty-state en la app real cuando hay menos de 5 movimientos. |
| Botón "Volver al ejemplo original" | L377-379 | 1 | Funcional. |
| CTA final "Pedir una invitación →" | L385-387 | 1 | Patrón estándar de CTA-tras-engagement. |

## Conteo
- **Cajón 1 (se queda):** 23 elementos
- **Cajón 2 (sale, con destino):** 1 elemento
- **Cajón 3 (se borra sin destino):** 5 elementos

Ahorro estimado: ~45-50 palabras de prosa redundante + 3 líneas de markup muerto + 1 frase trasladada fuera de la landing.

---

## 2. Cajones — Lo compartido y El ritmo del mes

# Cajones — Lo compartido y El ritmo del mes

**Hallazgo aparte de la tabla:** la nota marginal de "para quién no sirve el ritmo" (línea 486) promete "el detalle de cada uno está en las preguntas", pero no existe ninguna entrada del FAQ sobre quincena/diario/temporada/ingreso no discrecional. Ese enlace apunta a la nada.

| Elemento (cita corta) | Línea | Cajón | Qué se pierde y quién / por qué no |
|---|---|---|---|
| Tag "Cuando el gasto no es sólo tuyo" | 395 | 1 | Orientación de sección, fuera de alcance. |
| H2 "Lo que pagaste tú, lo que puso el otro..." | 396 | 1 | Titular central. |
| Lead "Anotas el gasto una vez... Cuando llega a cero, se cierra." | 399-403 | 1 | Comprensión mínima del mecanismo. |
| Jotting "Cuenta de la luz $33.478 / A medias → te deben $16.739" | 405-408 | 1 | Primer cálculo 50/50 con números reales; base del ejemplo 60/40 después. |
| Marginal "Puedes juntar varias cuentas en un grupo de hasta veinte personas..." | 410-413 | **3** | Extra positivo, no limitación. Se descubre con gusto al usar la app. |
| "La otra persona necesita una cuenta en Mesura." | 415-416 | 1 | Cambia la decisión de pedir invitación. |
| "Si no la tiene, le mandamos una invitación... El detalle... está en las preguntas." | 416-420 | **2** | El mecanismo completo ya vive en el FAQ #7. Redundante aquí. |
| Details 1, párrafo mecanismo % / monto exacto | 426-430 | 1 | Responde la pregunta del acordeón. |
| Details 1, ejemplo 60/40 con montos | 431-435 | **3** | El mecanismo ya quedó explicado en palabras; el ejemplo numérico no agrega regla nueva. |
| Details 2, lista de qué ve/no ve la otra persona | 441-446 | 1 | Disclosure de privacidad crítico. |
| Details 2, "Como el título viaja... escríbelo pensando" | 447 | **2** | Mejor como hint in-app en el momento de escribir el título. |
| Tag "A mitad de mes" | 458 | 1 | Orientación, fuera de alcance. |
| H2 "¿Voy muy rápido?" | 459 | 1 | Titular central. |
| Lead "Le dices a Mesura cuánto quieres que te dure el mes..." | 462-467 | 1 | Explica el mecanismo central de la función más vendida. |
| Jotting "Al día 18 de 31 correspondería $282.948..." | 469-473 | **3** | Repite cifra por cifra el mismo ejemplo ya interactivo en el hero. |
| "Si tienes pagos fijos... márcalos como tal..." | 475-479 | 1 | Previene desconfianza en el número insignia de la app. |
| Marginal ingreso no mensual (quincena/diario/temporada) | 481-484 | 1 | Población real que recibe un número roto sin aviso si falta. |
| "...el detalle de cada uno está en las preguntas." | 486 | **3** | Apunta a un FAQ que no existe — promesa rota, se borra la frase. |

## Conteo
- **Cajón 1:** 12 — **Cajón 2:** 2 — **Cajón 3:** 4

Ahorro estimado: ~14-16 líneas de HTML, ~110-130 palabras (20-25% de estas dos secciones).

---

## 3. Cajones — Anotar

| # | Elemento | Línea | Cajón | Qué se pierde / por qué no |
|---|---|---|---|---|
| 1 | Tag "En el momento" | 495 | 1 | Estructural. |
| 2 | H2 "Mesura no te pide armar un presupuesto para empezar." | 496 | 1 | Promesa central de la sección. |
| 3 | "Anotas un gasto y ya sirve..." | 500-501 | 1 | Evidencia que sostiene la promesa. |
| 4 | "El presupuesto puedes ponerlo después, o nunca..." | 501-503 | 1 | Contracara honesta del H2. |
| 5 | "¿Qué fue?" campo opcional + ejemplo | 507-509 | **3** | Se descubre solo al abrir el formulario real. |
| 6 | "y si compartes ese gasto, la otra persona lo lee." | 509-510 | **2** | Destino: aviso in-app al marcar el gasto como compartido, o política de privacidad. |
| 7 | "Lo que compras siempre, guardado." (favoritos) | 513-515 | **2** | Destino: primer uso / estado vacío en la app. |
| 8 | Detalle de monto guardado o en blanco | 515-517 | **3** | Se descubre al toque, cero riesgo de sorpresa. |
| 9-13 | Lista marginal: metas de ahorro, calendario, presupuesto por categoría, recordatorios, resumen semanal | 519-522 | **3** (cada uno) | Nombres sueltos sin promesa verificable; se descubren navegando la app. |

## Conteo
- **Cajón 1:** 4 — **Cajón 2:** 2 — **Cajón 3:** 7

Estimación: de ~170 palabras / 34 líneas a ~55 palabras / 16 líneas (recorte de ~68% en palabras).

**Nota del árbitro:** esta sección terminó eliminándose completa como bloque (ver §"Minimalismo estructural" y la decisión de arbitraje) — su único punto cajón-1 (H2 + lead) se fundió como una frase en el hero.

---

## 4. Cajones — Tus datos

**Excepción no negociable, respetada:** "quien opera Mesura puede leerlos" es cajón 1 por medición directa (6 de 13 lectores del estudio original la citaron como la frase que más generó confianza). No se cuestionó ni se marcó para mover.

| # | Elemento | Línea | Cajón | Qué se pierde / por qué no |
|---|---|---|---|---|
| 1 | "La contraseña se guarda de forma que no se puede leer..." | 540-542 | **1** | Contraste necesario para la frase protegida. |
| 2a | "...quien opera Mesura puede leerlos" | 547-548 | **1 (protegida)** | No se evalúa. |
| 2b | "— nunca para desarrollo, pruebas ni demostraciones..." | 548-549 | **2** → política de privacidad | Ya declara que el detalle vive ahí. |
| 2c | "Quien puede leerlos es una persona, no un equipo: Matías Rifo..." | 549-551 | **3** | Inferible del footer + correo de contacto ya visibles. |
| 3a | "Cloudflare aloja la app, Google manda los correos" | 555-556 | **2** → política de privacidad | Disclosure de subprocesadores. |
| 3b | "Anthropic sólo aparece si enciendes el comentario con IA..." | 556-557 | **3** | Redundante con el ítem 7. |
| 4a | "Tu respaldo, cuando lo pidas..." (título) | 561 | **1** | Atiende el miedo a quedar encerrado. |
| 4b | Detalle de formato de archivo (Excel/archivo) | 562-564 | **2** → primer uso | No cambia la decisión de registrarse. |
| 4c | "Te vuelve a pedir la contraseña..." | 564-566 | **3** | UX estándar, no sorprende a nadie. |
| 5 | "Tu banco es tuyo" + detalle | 574-577 | **1** | Precisa el miedo específico + suma público informal/efectivo. |
| 6a | "No hay publicidad, no se venden tus datos" | 580-582 | **3** | Tercera repetición en la página. |
| 6b | "no hay cookies que te sigan" | 582 | **2** → política de privacidad | Detalle de tracking. |
| 7 | "Tus cuentas las hace la aritmética, no un modelo" + detalle | 585-589 | **1** | Cambia la decisión de un usuario desconfiado de IA. |
| 8 | "Mesura no opina sobre cómo vives" | 592-595 | **3** | Tono de producto, no dato sobre datos. |
| 9 | "Irte es un botón" | 598-600 | **1** | Derecho de salida real; se repite en el FAQ, reforzando que importa. |

## Conteo
- **Cajón 1:** 6 — **Cajón 2:** 4 — **Cajón 3:** 5

Ahorro estimado: ~25-28 líneas de HTML, ~165-170 palabras (~mitad del contenido de las dos columnas), sin tocar la frase protegida.

---

## 5. Cajones — Preguntas frecuentes

Metodología: usé el JSON-LD `FAQPage` del `<head>` como testigo — cuando omite una cláusula que sí está en el HTML visible, es señal externa de que ya se consideró prescindible una vez.

De las ~41 cláusulas identificadas en las nueve preguntas: **28 cajón 1**, **5 cajón 2** (mecánica de producto: dónde se configura algo, tip de contingencia — nunca riesgo financiero o de privacidad), **9 cajón 3** (editorializaciones de tono, admisiones de abandono sin función accionable, duplicados literales, detalles que el propio JSON-LD ya omite).

**Ninguna de las nueve preguntas se vació entera** — cada una conservó al menos una cláusula que pasa la prueba real. Q3 (datos) y Q4 (instalación) sobreviven casi enteras; Q1, Q2, Q5, Q6, Q8, Q9 se acortan notoriamente; Q7 (presupuesto) es la que más se acorta, de cinco cláusulas a dos.

**Nota del árbitro:** dos rondas de control post-implementación encontraron que Q3 ("¿Qué pasa con mis datos?"), aun trimeada, seguía sintiéndose 100% redundante con la sección "Tus datos" — su único hecho no cubierto ahí (qué ve la otra persona) ya vive completo en el acordeón de "Lo compartido". Se terminó borrando entera en la iteración final (ver bitácora de iteración).

---

## 6. Cajones — Invitación y calculadora

| # | Elemento | Línea | Cajón | Qué se pierde / por qué no |
|---|---|---|---|---|
| 1 | "Se empieza de cero..." | 784-787 | **2** | Destino: pantalla de bienvenida/primer login. |
| 2 | "La moneda se elige al crear la cuenta..." | 788-795 | **2** | Destino: junto al selector de moneda en el formulario real de creación de cuenta. |
| 3 | Stamp "Acceso por invitación" | 800 | **3** | Repite el eyebrow del hero y el tag de la misma sección. |
| 4 | H2 "Mesura está creciendo despacio, y a propósito." | 801 | **1** | Única frase que justifica el acceso restringido como decisión, no traba. |
| 5 | "Entrar ahora significa... define lo que se construye después." | 802-806 | **1** | Único argumento de co-creación para el early-adopter. |
| 6 | Marginal "No hay tarjeta, no hay período de prueba..." | 807-810 | **3** | Repite casi palabra por palabra la FAQ de costo, leída minutos antes. |
| 7-12 | H2 formulario, campo correo, botón, texto legal | 817-849 | **1** | Funcional / base de consentimiento. |
| 9-10 | Fieldset "¿Cómo te entra la plata?" + consent | 827-838 | **3** | No es una verdad divulgada al usuario, es segmentación interna — **fuera del alcance de este ejercicio** (ver nota del árbitro). |
| 13-21 | Calculadora completa | 861-933 | **3** | Ver veredicto explícito abajo. |

### Veredicto explícito sobre la calculadora
**Recomendación: borrar la sección `id="calculadora"` entera.** Vive después del CTA principal, ya viene marcada por quien la construyó como "una herramienta suelta" y colapsada por defecto porque "la mayoría no la abre", no demuestra ninguna función real de Mesura (cualquiera encuentra el mismo cálculo en un blog financiero), y su vínculo con el argumento central es una sola frase de enganche.

## Conteo
- **Cajón 1:** 8 — **Cajón 2:** 2 — **Cajón 3:** 11 (incluida la calculadora completa)

Ahorro estimado: ~124 líneas de HTML (~13% del archivo), ~450-500 palabras.

**Nota del árbitro sobre el fieldset de segmentación (ítem 9-10):** no es una "verdad" en el sentido del encargo — es un campo que le pide un dato al usuario, no una afirmación que la página le hace. Decidí no tocarlo: es una decisión de negocio (calificar leads), no de minimalismo de contenido.

---

## 7. Verificación de hechos vigente contra la app real

Verificado en vivo el 21-08-2026 contra `Mesura-app-source` (commit `3f1f51b`) y `Mesura-mobile` (commit `054b7e9`), ambos con commits del mismo día que la landing.

**Hallazgo relevante:** el propio código de `home-context.ts` documenta que una sesión anterior que auditaba la landing encontró el umbral del ritmo mal (absoluto, no relativo) y lo corrigió en la app real ese mismo día — la landing iba adelantada y la app se ajustó para alcanzarla.

De 20 afirmaciones específicas revisadas contra el código real de hoy: **19 vigentes tal cual, 1 parcial** (la invitación a alguien que ya tiene cuenta "no vence" es cierto para la solicitud en sí, pero omite que el enlace de un clic del correo caduca a las 72 horas — no es un error, es una precisión opcional). **No se encontró ninguna afirmación falsa.**

Corrección opcional sugerida (no aplicada, no era obligatoria): una frase en el FAQ de gastos compartidos aclarando el matiz de las 72 horas del enlace de correo.

---

## 8. Minimalismo estructural — qué bloques completos pueden dejar de existir

**Inventario:** 8 secciones de nivel superior, 12 tipos de componente reutilizados — de los cuales 5 (`.callout`, `.notice-group`, `.marginal`, `.jotting`, `.pact`) hacían el mismo trabajo ("este texto pesa distinto") con nombres distintos. El propio CSS documenta que `.notice-group` se inventó porque varias `.callout` apiladas "se leen como una pared de no" — la solución fue un contenedor nuevo, no menos contenido. Exactamente el síntoma que Matías sospechaba.

**Candidatas a desaparecer como sección completa:**
1. **`#calculadora`** — la propia página la llama "una herramienta suelta"; no participa del ciclo anotas→ves cuánto queda→compartes. Ahorro estimado: ~0.6 pantallas.
2. **`#ritmo`** como sección independiente — repite en prosa lo que el `article.sheet` del hero ya muestra en vivo. Ahorro estimado: ~1 pantalla.
3. **`#anotar`** — elaboración de conveniencia, no una de las tres afirmaciones centrales. Ahorro estimado: ~1 pantalla.

Los tres combinados: ~2.5 pantallas antes de tocar `#datos` o el ledger del demo.

**Sobre el patrón `<details>` (categorías del demo, calculadora):** es "un cajón encima", no minimalismo real — el HTML/CSS/JS sigue pesando lo mismo, sólo se pospone. Excepción legítima: el acordeón de Preguntas, donde el contenido es genuinamente paralelo y opcional.

**Si hubiera que dejar la mitad de las secciones:** sobreviven Hero (recortado), Lo compartido, Preguntas, La invitación. Se funden o cortan: Ritmo (→ frase en el hero), Anotar (→ línea suelta), Datos (de sección completa a expansión del callout — **el árbitro descartó esta última idea específica**, ver bitácora), Calculadora (fuera).

---

*(Fin del panel. La bitácora de iteración, el arbitraje completo y el resultado de la evaluación con lectores de control están en `VALIDAR.md`.)*
