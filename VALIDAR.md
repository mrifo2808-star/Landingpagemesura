# Validar — correcciones del 21 de agosto de 2026: el bug del selector, la calculadora vuelve, y el criterio nuevo del FAQ

Rama: `claude/correcciones-21-agosto-v2`, sobre `main` (que ya tenía mergeada la pasada de
minimalismo real). Dos commits, como pediste:

1. `c0db133` — el arreglo del selector de moneda, solo.
2. `4d307d5` — el resto de la lista: calculadora de vuelta, cortes de contenido, FAQ
   reescrito, corrección de la demo, layout de escritorio.

No se hizo merge, no se desplegó, no se tocó ningún secreto.

---

## 1. El selector de moneda — diagnosticado a fondo, no parcheado a ciegas

Reportaste que no cambiaba nada al elegir moneda ni al apretar "Ver", y que el botón "Ver"
seguía apareciendo cuando debería haber desaparecido. Antes de tocar una línea, probé
contra el **sitio real desplegado**, no contra una copia local:

| Comprobación | Resultado |
|---|---|
| `demo.js` en producción, línea por línea | El fix de `be2acd9` está intacto — la protección contra el pisado de la elección del usuario sigue ahí |
| `functions/_middleware.js` vía curl directo a `mesura-landing.pages.dev` | `?m=PEN` resuelve a PEN, `?m=USD` (basura) cae a CLP, ambos correctos |
| Disparar `change` a mano sobre el `<select>` real de producción | La hoja se recalcula a soles sin problema — el código responde bien |
| Estado del botón "Ver" en producción, con JS activo | `display:none`, oculto correctamente |

**El código estaba bien. La causa era otra**, y la encontré en `_headers`:

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

El propio comentario de esa línea decía la condición bajo la cual es segura: *"mientras
los nombres no se reciclen con otro contenido"*. Esa condición nunca se cumplió en este
proyecto — `demo.js`, `mesura-datos.js` y `landing.css` cambian de contenido bajo el mismo
nombre de archivo en casi cada pasada. `immutable` le dice al navegador que **ni siquiera
revalide con el servidor**: quien haya visitado la página antes de un deploy se queda con
el JS viejo cacheado, sin que un refresh normal alcance a pedir la versión nueva.

**Esto explica por qué "vuelve a pasar" sin que sea una regresión real**: no es que el
código se rompiera dos veces — es que tu navegador nunca llegó a pedir el código
corregido después de la primera vez que lo viste.

### La corrección

Separé la política de caché por tipo de archivo en `_headers`:

- **Fuentes e imágenes** (contenido que de verdad no cambia una vez publicado): se quedan
  con `immutable` y un año de caché.
- **JS y CSS** (cambian de contenido bajo el mismo nombre cada pasada): pasan a
  `max-age=0, must-revalidate`. Como ya se sirve un `ETag`, esto es un `304` casi gratis
  cuando el archivo no cambió, y contenido nuevo de inmediato cuando sí — sin que nadie
  tenga que limpiar caché a mano.

**No toqué ninguna línea de `assets/js/demo.js`**: no hacía falta, el código ya estaba
correcto. Para que veas el cambio surta efecto en tu propio teléfono ahora mismo, antes de
que este fix se despliegue, necesitas un refresh que ignore caché (mantener presionado el
botón de recargar y elegir "vaciar caché y recargar", o cerrar y volver a abrir en una
pestaña de incógnito) — un refresh normal no alcanza porque `immutable` le dijo a tu
navegador que ni siquiera pregunte.

### Sobre el campo de monto sin control

No pude reproducir "dice ingresa un monto, pero no está la opción de ingresarlo" en el
sitio real (probé en escritorio y en móvil, con una sesión sin caché previa: el campo
existe, mide lo que debe medir, y se ve). Por la misma explicación de arriba, es
consistente con el mismo origen — una versión de HTML/CSS/JS cacheados por separado y
desincronizados entre sí puede producir exactamente este tipo de síntoma (una etiqueta de
un lado, un control roto del otro). Con el fix de caché, esta clase de bug no debería
volver a aparecer. Si después de vaciar caché lo sigues viendo, avísame con el modelo de
teléfono y navegador exactos — a esta altura sería un bug genuinamente nuevo, no el mismo.

---

## 2. Contenido retirado, tal como pediste

| Qué se sacó | Tu razón |
|---|---|
| El desplegable "En qué se ha ido" (categorías del ejemplo) | "se ve molesto y no aporta" |
| El párrafo del footer sobre español neutro / hecha por una persona sola | "me parece gratuito, no expliques que confundes" |
| "Ninguna aplicación puede prometer seguridad absoluta, y ésta no lo hace..." | Reemplazado por tu propuesta: "Los términos de uso y la política de privacidad están disponibles para leerse." Nada más. |
| La pregunta "¿Cómo te entra la plata?" del formulario final | "se lee mal" |

Al sacar "En qué se ha ido" limpié también el código que quedaba sin usar: la función
`renderCats()` completa en `demo.js`, las clases `.cats*` en `landing.css`. Al sacar el
fieldset de ingreso, verifiqué que `functions/api/waitlist.js` ya trataba ese campo como
opcional — hay un test existente, `"sin ingreso deberia guardarse null, no inventado"`, que
ya cubría este caso — así que no hizo falta tocar el backend.

---

## 3. El FAQ — no sólo se acortó, cambió de criterio

Dijiste algo importante que no es sólo "menos preguntas": **la landing deja de ser el
lugar donde se enumeran las carencias.** Si una limitación importa, va en el registro o
en el primer uso de la app, no en el escaparate — lo que no se puede es afirmar lo
contrario de lo que es cierto.

Con ese criterio, de las 9 preguntas que había, saqué dos que existían específicamente
para catalogar un vacío de la app:

- **"¿Necesito internet para usar Mesura?"** — tu propio ejemplo de lo que ya no debe
  estar.
- **"¿Me sirve el ritmo si no gano lo mismo cada mes?"** — misma categoría: es una
  limitación real (el ritmo no calza bien con ingreso irregular), pero su lugar ya no es
  la landing. **No se pierde silenciosamente**: la app real sigue comportándose igual
  (verificado contra `Mesura-app-source` en la pasada anterior), y el destino natural de
  esta información es el momento en que alguien configura su ingreso dentro de la app, no
  antes de dejar el correo.

Las cinco que quedaron se recortaron también, quitando la capa de justificación/disculpa
que traían (ej. "¿cuánto trabajo es de verdad?" se sacó entera — era la pregunta que más
explícitamente hablaba de abandono y reconstrucción de datos atrasados).

**Título**: cambió de "Lo que la gente pregunta antes de dejar su correo" (tu comentario:
"redactado de forma rara") a **"Tus dudas."**

**Google Play**: se queda, como pediste, pero deja de insinuar que ya se puede descargar:

> "Está en proceso: hoy se está preparando el envío a testing cerrado, como parte de esta
> beta. Mientras tanto, Mesura se abre en el navegador..."

Este texto refleja exactamente lo que me dijiste como estado real de hoy. Si esto cambia
(se envía, lo aceptan, lo rechazan), esta frase queda desactualizada y hay que volver a
tocarla — no es un estado que se mantenga solo.

**Las cinco preguntas finales**: en pruebas, cuánto cuesta, instalación/Google Play,
gastos compartidos, gasto fijo.

---

## 4. La calculadora vuelve

Restaurada completa desde el commit anterior a que se borrara (`def3ffd^`): el HTML, el
CSS (`.calc`, `.statement*`, `.result*`) y `assets/js/calculator.js`. Sigue exactamente
donde estaba — colapsada detrás de su propio acordeón, al final de la página, sin competir
con la demo principal ni con el formulario de invitación. Probada de punta a punta
(800.000 de ingreso, 95.000 de deuda → 11,9%, "Te quedan $705.000") con las cinco pruebas
automatizadas que tenía antes, también restauradas.

---

## 5. La demo dejó de decir algo que no es cierto

Tenías razón: la tarjeta interactiva del hero no es la pantalla de Inicio de Mesura, es un
ejemplo de cómo funciona. Corregido en dos lugares — el texto visible de la sección
"Pruébalo tú mismo", y el `og:image:alt` del `<head>`, que hacía la misma afirmación para
quien comparte el link en redes. La descripción de paso se acortó de dos párrafos a una
frase: **"Ejemplo funcional, con datos inventados. Escribe un monto abajo y mira cómo se
mueve."** — la demo en sí no cambió, seguís teniéndola tal como te gusta.

---

## 6. Layout de escritorio

### 6.1 El caso concreto que reportaste

"Lo que pagaste tú, lo que puso el otro" no tenía ningún límite de ancho propio a nivel de
sección — cada párrafo tenía su propio `max-width` en caracteres, pero nada agrupaba el
contenido dentro del ancho real de 1240px del contenedor. El resultado en escritorio: una
sola columna angosta pegada a la izquierda, con todo el resto del ancho vacío a la
derecha — exactamente lo que describiste.

**Corrección**: reestructuré la sección en dos columnas a partir de 900px de ancho,
reusando `.evidence` — una clase que ya estaba definida en el CSS de una iteración
anterior pero que ningún HTML usaba. Columna izquierda: el texto y el ejemplo de la
cuenta de la luz. Columna derecha: las dos preguntas del acordeón. En móvil sigue
apilado en el mismo orden que antes, sin ningún cambio.

Medido en 1440px: antes, el bloque de texto ocupaba 345px de un contenedor de 1240px
(895px vacíos a la derecha). Después, dos columnas de 536px y 656px que llenan el
contenedor completo, con 48px de aire entre ambas — no vacío perdido.

### 6.2 Lo que encontré revisando el resto, como pediste

Al sacar "En qué se ha ido" (§2), la demo del hero se quedó con el mismo defecto: su grid
de dos columnas (`sheet__body`) reservaba una segunda columna para las categorías que ya
no existen, dejando exactamente el mismo hueco vacío a la derecha en escritorio. Lo
corregí a una sola columna en el mismo commit — antes de que llegara a mostrarse.

No encontré otros huecos equivalentes revisando el resto de las secciones (Tus datos,
Preguntas, la invitación) — todas usan grids de dos columnas donde ambos lados tienen
contenido real, sin columnas fantasma.

---

## 7. Verificación — todo lo que corrí, con resultado

| Comprobación | Resultado |
|---|---|
| `cd docs/redesign/qa && npm test` | **7/7** — funcional 25/25 (la calculadora recupera sus 5 pruebas, el conteo de `<details>` baja a 8: 2 en "Lo compartido" + 5 en "Preguntas" + 1 en la calculadora) |
| `node verificar.js --contra-repo Mesura-app-source Mesura-mobile` | **SIN FALLOS** · 3 avisos preexistentes, no relacionados |
| Selector de moneda, en el sitio real desplegado | Diagnóstico completo en §1 — el código funciona, la causa era caché |
| Selector de moneda, calculadora, layout de "Lo compartido", local, escritorio (1440px) y móvil (375px) | Todo verificado con interacción real (no sólo lectura de HTML): cambiar a ARS recalcula toda la hoja; la calculadora da 11,9% con los números de prueba; "Lo compartido" llena las dos columnas sin hueco |
| Scroll móvil (375×812) | **7,17 pantallas** — bajó desde 7,97 pese a que la calculadora volvió, porque los otros cortes (categorías, descripción de la demo) pesaron más |
| Consola del navegador, en cada prueba | Sin errores |
| Búsqueda de otro contenido en el mismo patrón (§2 de tu encargo) | Sólo quedó una frase con "todavía no" — es del formulario de invitación ("te escribimos, aunque sea para decirte que todavía no"), sobre el proceso de invitación, no sobre una carencia de la app; la dejé porque cumple una función distinta (evita quejas de "dejé mi correo y nunca supe más") |

---

## 8. Lo que necesita tu decisión

1. **La frase de Google Play** ("se está preparando el envío a testing cerrado") describe
   un estado de hoy que vas a cambiar pronto. Cuando eso pase, hay que volver a esta línea
   — no se actualiza sola.
2. **Si el bug del selector/monto reaparece después de que despliegues el fix de caché**,
   con caché ya vaciado de tu lado, es un bug genuinamente nuevo y hay que diagnosticarlo
   de cero — dime el teléfono/navegador exacto.
3. **La calculadora restaurada** vive exactamente donde estaba antes de borrarse. Si
   prefieres otra ubicación (la pediste de vuelta pero no dijiste dónde), es un cambio de
   una sección, no de contenido.

---

## 9. Comandos — listos para copiar, **no ejecutados**

### Ver la página localmente antes de aprobar

```bash
cd Mesura-landing
npx wrangler pages dev . --compatibility-date=2026-08-01
```

Prueba especialmente: el selector de moneda (con una pestaña nueva, sin caché previa
del puerto local), la calculadora al final de la página, "Lo compartido" en una ventana
ancha, y el FAQ con 5 preguntas bajo el título "Tus dudas."

### Revisar el diff antes de decidir

```bash
git -C Mesura-landing log main..claude/correcciones-21-agosto-v2 --oneline
git -C Mesura-landing diff main...claude/correcciones-21-agosto-v2
```

### Mergear todo

```bash
git -C Mesura-landing checkout main
git -C Mesura-landing merge --no-ff claude/correcciones-21-agosto-v2
git -C Mesura-landing push origin main
```

### Desplegar sólo el fix de caché, sin esperar al resto

Si quieres el arreglo del selector en producción ya, sin esperar los cortes de contenido:

```bash
cd Mesura-landing
git checkout main
git cherry-pick c0db133
git push origin main
npx wrangler pages deploy . --project-name=mesura-landing
```

### Desplegar todo

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
git -C Mesura-landing branch -D claude/correcciones-21-agosto-v2
```

Si **ya desplegaste**: Cloudflare Pages guarda cada deploy — `mesura-landing` →
Deployments → "Rollback to this deployment".
