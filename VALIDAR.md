# Validar — reparación real del 21 de agosto: qué estaba roto, por qué la batería no lo vio, y las categorías de vuelta

Rama: `claude/reparacion-real-20260821`, sobre `main` (que ya tenía mergeada la pasada de
correcciones anterior, `56f4b00`). Dos commits:

1. `0ad369f` — el arreglo real de la calculadora/selector: renombrar los archivos a `.v2`.
2. `6517de2` — las categorías de vuelta, siempre visibles, más el arreglo del cuadro vacío
   y la prueba de comportamiento nueva.

No se hizo merge, no se desplegó, no se tocó ningún secreto.

---

## 1. Qué estaba realmente roto en la calculadora — el diagnóstico que pediste

**No era un error de código.** El `demo.js` que vive en el repo, en cada commit reciente,
está bien. El problema era que **tu navegador (y el mío, en este mismo entorno) no estaba
ejecutando ese código** — estaba ejecutando una copia mucho más vieja que quedó atascada en
caché.

### Cómo lo confirmé (no lo asumí)

`curl` contra producción devolvía el archivo *correcto* — idéntico al del repo. Eso me
despistó al principio: si el servidor sirve el archivo bueno, ¿por qué el navegador se
comporta como si tuviera el malo? La respuesta estaba en que `curl` nunca pasa por la
caché del navegador — así que estaba comparando la fuente equivocada.

Usé la lectura directa del *response body* que el navegador ya tenía en memoria para esa
petición (no una petición nueva). Ahí apareció una versión de `demo.js` mucho más larga,
con un `el.cats = document.getElementById("demo-cats")` y un `renderCats()` completo que
la versión actual del repo ya no tiene — porque en la ronda anterior se había borrado
`#demo-cats` del HTML. Esa versión vieja, al ejecutarse contra el HTML nuevo, hacía
`el.cats.innerHTML = ""` sobre `null` y tiraba abajo el resto del script — de ahí el
`TypeError` en consola y la calculadora/selector "sin responder".

### La causa raíz

`_headers` servía `/assets/*` (incluidos JS y CSS) con:

```
Cache-Control: public, max-age=31536000, immutable
```

`immutable` le dice al navegador: *ni siquiera preguntes* si hay una versión nueva,
durante un año. Cualquiera que haya visitado la página una sola vez antes de un cambio de
contenido se queda con esa copia para siempre — un refresh normal no alcanza, porque
`immutable` ya le dijo al navegador que no vale la pena ni intentarlo.

La ronda anterior (`4d307d5`) ya había corregido el `Cache-Control` para JS/CSS *a
futuro* (`max-age=0, must-revalidate`). Ese cambio es correcto, pero **no es
retroactivo**: no hace nada por un navegador que ya tenía el archivo viejo guardado bajo
la promesa de `immutable`. Por eso "se arregló" y volvió a "romperse" sin que hubiera una
regresión real de por medio — el código nunca volvió a fallar, el navegador nunca llegó a
pedirlo de nuevo.

### La corrección de esta ronda

Renombré los cinco archivos mutables (`landing.css`, `demo.js`, `mesura-datos.js`,
`calculator.js`, `landing.js`) a `*.v2.*` vía `git mv` (conserva la historia) y actualicé
cada referencia: `index.html`, los imports entre módulos, `functions/_middleware.js`, y
los scripts de QA que leen esos archivos por ruta. Un cambio de URL es la única forma de
forzar a un navegador que ya cacheó "para siempre" a pedir el archivo de nuevo — no es un
esquema de versionado que haya que mantener a partir de ahora, es un puente de una sola
vez. El `Cache-Control` corregido de la ronda anterior ya se encarga de que esto no vuelva
a pasar con el próximo cambio de contenido.

---

## 2. Por qué la batería decía 7/7 con esto roto — y qué le hice

Revisé el arnés (`docs/redesign/qa/lib/navegador.js`) antes de tocar nada, porque tu
crítica era específica: ¿el problema es que no capturamos errores, o que probamos
presencia y no comportamiento? Ninguna de las dos, en realidad — es algo más estructural:

- El arnés **sí** captura excepciones no atrapadas (`page.on("pageerror")`), no sólo
  `console.log`. Si el `TypeError` de `el.cats.innerHTML` hubiera ocurrido dentro de una
  corrida de la batería, la habría marcado en rojo.
- La mayoría de las 27 pruebas de `funcional.js` **ya** verifican comportamiento, no
  presencia: hacen clic real, escriben en campos reales, y comprueban el resultado (ej.
  "anotar un gasto recalcula saldo y ritmo, y lo inserta arriba" dispara el submit de
  verdad y lee el DOM resultante).

**El gasto real es otro**: la batería levanta un servidor local que sirve el árbol de
archivos *actual* del repo, y abre un navegador *nuevo* contra él. Ese navegador nunca ha
visitado la página antes — nunca puede tener una versión vieja cacheada. Es decir: el
arnés prueba, con total consistencia, "¿el código de hoy funciona contra el HTML de hoy?"
— y la respuesta a esa pregunta siempre fue sí. La pregunta que rompió la calculadora era
otra: "¿un navegador que visitó una versión *anterior* del sitio, sigue funcionando hoy?"
— y ningún test que arranca desde cero, contra un único deploy, puede simular eso.

**Lo que sí arreglé**: agregué la prueba que exige comportamiento, no presencia, para el
caso concreto de esta ronda — "«en qué se ha ido» se ve sin tocar nada, sin JavaScript"
en `funcional.js`, que falla si el bloque vuelve a depender de un `<details>` o de JS para
mostrarse.

**Lo que no puedo arreglar con una prueba local**: el gap de caché entre deploys. Un test
que corre en un navegador fresco, contra un único punto en el tiempo, no puede probar la
transición entre dos deploys distintos. Las dos formas reales de cerrar esto son: (a) la
que ya se hizo — que el nombre de archivo cambie cuando cambia el contenido, así no hay
"navegador viejo" que servir, o (b) una prueba de humo contra la URL de producción real,
después de cada deploy, con una sesión de navegador que no se limpia entre corridas —
que es exactamente la clase de prueba que **la verificación manual** de este mensaje
reemplaza por ahora. Así que, como pediste: si la batería no puede cubrir esto sola, lo
digo, y la verificación manual (hecha en la sección 5) pasa a ser obligatoria antes de
cada entrega mientras no exista ese smoke test de producción.

---

## 3. Las categorías — corregiste tu propio feedback, y tenías razón en corregirlo

En la ronda anterior entendí "las categorías no aportaban" y las convertí en un
desplegable colapsado, y en la ronda antes de esa, en directamente borrarlas. Dijiste:

> "Aquí me equivoqué yo al transmitirte su feedback. Le entendí que las categorías no
> aportaban; lo que le molestaba era que fueran un desplegable. Textual: 'las categorias
> me gustaban, no me gustaba que fueran desplegables'."

Las restauré verbatim desde el primer commit del proyecto (`5bb1506`), **siempre
visibles, sin `<details>` ni ningún otro envoltorio que las oculte por defecto**: el
bloque `.sheet__aside` con las cuatro categorías (Supermercado, Transporte, Salidas, Casa)
vuelve tal como estaba antes de cualquiera de las dos pasadas de recorte.

---

## 4. El cuadro vacío — verificado mirando, no asumido

Tu sospecha era correcta: al borrar las categorías, `.sheet__body` se había dejado en una
sola columna, pero el fix de layout de la ronda pasada (para "Lo compartido") no tocó esta
sección — así que no había ningún hueco *nuevo*, sino que la corrección de esta ronda
(traer las categorías de vuelta) creaba uno si no le devolvía su columna.

Medí con `getBoundingClientRect()` sobre la página cargada de verdad, en los dos tamaños:

| Viewport | `.sheet__body` | `.sheet__ledger` | `.sheet__aside` | ¿Hueco? |
|---|---|---|---|---|
| 1440×900 | 1236px de ancho | 742px | 494px | No — 742+494=1236, llena el contenedor exacto |
| 375×812 | 335px de ancho, apilado | 353px de alto | 298px de alto, justo debajo | No — el borde inferior de `ledger` (1667px) coincide con el borde superior de `aside` (1667px), sin salto |

No quedó ningún cuadro vacío en ninguno de los dos tamaños.

---

## 5. La presentación de la zona — decisión tomada, no sólo "devolver donde estaba"

Dijiste que no bastaba con devolver las categorías al mismo lugar — había que decidir qué
muestra ese bloque y en qué orden, ahora que la sección cambió de forma. Mi decisión: dejé
el orden original (movimientos recientes a la izquierda, categorías a la derecha) porque
es una separación que ya tenía sentido — **temporal** (qué pasó y cuándo) vs.
**categórico** (en qué se fue, sin importar cuándo) — y es la misma separación mental que
alguien hace cuando mira su propio estado de cuenta. No inventé un tercer bloque ni
reordené el contenido interno de las categorías (siguen en el mismo orden de gasto:
Supermercado, Casa, Salidas, Transporte). Si querés otro criterio de orden (por ejemplo,
de mayor a menor gasto en vez de la categoría fija), es un cambio de una línea de datos,
no de estructura — decímelo y lo hago en un commit aparte.

**Costo de scroll móvil, tal como pediste que lo reportara**: subió a **7,53 pantallas de
812px** (antes de esta ronda, con las categorías colapsadas/ausentes, era menor). Es el
costo directo de que sean siempre visibles. Como dijiste explícitamente que la instrucción
del dueño manda sobre el número de pantallas, lo dejé así — pero quedó medido y declarado,
no escondido.

---

## 6. Verificación manual — cada elemento interactivo, con las manos, en los dos tamaños

Antes de tocar código, y de nuevo después de corregir, abrí la página en un navegador real
(`wrangler pages dev` local) y usé cada control con clics e inputs de verdad (no sólo
comprobando que existe en el DOM):

| Elemento | Cómo se probó | Resultado |
|---|---|---|
| Selector de moneda | Cambiado a soles con un evento `change` real | Recalcula toda la hoja, incluidas las categorías restauradas |
| Monto + categoría + enviar (demo) | Clic y `dispatchEvent` reales sobre input y radios | Agrega el movimiento, recalcula saldo/ritmo, aparece el aviso `aria-live`, aparece "Restablecer" |
| Restablecer | Clic real | Vuelve todo al estado inicial y se oculta de nuevo |
| Las 5 preguntas del FAQ | Clic real en cada `<summary>` | Las 5 abren, cada una con contenido no vacío |
| Los 2 acordeones de "Lo compartido" | Clic real | Ambos abren correctamente |
| Calculadora | Clic para abrir, inputs reales (800.000 / 95.000), clic en calcular | Da 11,9% y "te quedan $705.000"; "Limpiar" vacía y oculta el resultado |
| Formulario de correo (waitlist) | Input real + submit real, contra el KV local | Envía una sola petición, oculta el formulario, foco al mensaje de éxito |
| Consola del navegador | Revisada después de cada interacción de la lista de arriba | Sin errores, en ningún punto |
| Enlaces de navegación (masthead, franja, footer) | Cada `href` comprobado contra `document.querySelector` en la página cargada | Los 4 anclas internas (`#compartido`, `#datos`, `#preguntas`, `#acceso`) resuelven; los 3 enlaces de footer son URLs externas (términos, privacidad, login), ninguno apunta a una sección borrada |

---

## 7. Verificación automatizada — obligatoria, pero ya no suficiente por sí sola

| Comprobación | Resultado |
|---|---|
| `cd docs/redesign/qa && npm test` | **7/7** — funcional 27/27 (incluye la prueba nueva de comportamiento de las categorías) |
| `node verificar.js --contra-repo Mesura-app-source Mesura-mobile` (desde `Mesura-lanzamiento/landing-v3/ejemplo`) | **SIN FALLOS** · 3 avisos preexistentes en documentos históricos (montos escritos a mano en informes de evaluación viejos), no relacionados con este cambio |
| axe-core, 10 configuraciones (5 viewports × claro/oscuro) | 0 violaciones |
| Cero peticiones a terceros, cabeceras de seguridad | Sin cambios, siguen completas |

---

## 8. Lo que necesita tu decisión

1. **El orden interno de las categorías** — lo dejé por gasto (Supermercado, Casa,
   Salidas, Transporte, igual que en el commit original). Si preferís otro criterio,
   decímelo.
2. **El costo de scroll móvil (7,53 pantallas)** — ya lo asumiste al pedir que las
   categorías fueran siempre visibles, pero quedó medido acá para que la decisión sea
   informada si en algún momento pesa más que el beneficio.
3. **El smoke test de producción post-deploy** (sección 2) — no existe hoy. Si querés que
   lo arme (un script que golpee la URL real después de cada deploy, con axe + verificación
   de que los assets que carga son los que el HTML actual referencia), es trabajo aparte;
   mientras no exista, la verificación manual de la sección 6 es el sustituto y debería
   repetirse antes de cada entrega, no sólo en ésta.

---

## 9. Comandos — listos para copiar, **no ejecutados**

### Ver la página localmente antes de aprobar

```bash
cd Mesura-landing
npx wrangler pages dev . --compatibility-date=2026-08-01
```

Probá en una pestaña sin caché previa del puerto local: el selector de moneda, la
calculadora, "En qué se ha ido" siempre visible junto a "Últimos movimientos", y que no
haya ningún cuadro vacío en escritorio ancho.

### Revisar el diff antes de decidir

```bash
git -C Mesura-landing log main..claude/reparacion-real-20260821 --oneline
git -C Mesura-landing diff main...claude/reparacion-real-20260821
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

Importante después de este deploy en particular: cualquiera que haya visitado la página
antes seguirá teniendo los archivos viejos en caché hasta que sus navegadores procesen las
nuevas URLs `.v2` — que es justamente lo que este cambio fuerza a que pase en la primera
visita posterior al deploy, sin que nadie tenga que vaciar caché a mano.

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
