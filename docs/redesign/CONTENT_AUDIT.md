# Auditoría de contenido y posicionamiento

Rediseño «El mes a la vista», 19 de agosto de 2026.
Complemento operativo de `CLAIM_INVENTORY.md`, que es donde vive la evidencia.

---

## 1. El problema de fondo del contenido anterior

La landing anterior prometía, en una sola página: registro de gastos,
presupuestos, ritmo de gasto, metas de ahorro, deudas compartidas, calendario,
favoritos, pagos recurrentes, resumen semanal, análisis con IA, privacidad,
exportación a Excel, respaldo en Drive, plan gratuito, plan Pro y educación
financiera con cifras nacionales.

Todo eso es cierto o casi cierto. El problema es que **una promesa dividida en
quince es cero promesas**. Un visitante que llega, escanea diez segundos y se
va, no se lleva nada: no hay una frase que pueda repetirle a otra persona.

Además, dos de esas quince promesas no resistían verificación (Drive, plan Pro)
y una tercera estaba invertida (el resumen semanal se presentaba como algo que
eliges activar, cuando viene activado).

## 2. La promesa única

> **Ver cómo va el mes antes de que termine.**

Titular publicado: **«Tu mes, antes de que se te vaya.»**

Bajada: *«Anota lo que pasa, mira si vas al ritmo y ordena lo que compartes. En
pesos chilenos, sin anuncios y sin conectarte al banco.»*

Los tres verbos de la bajada son las tres cosas que Mesura hace y que el
visitante va a usar de verdad: **anotar**, **mirar el ritmo**, **ordenar lo
compartido**. Todo lo demás (metas, calendario, favoritos, recurrentes) es
soporte, y aparece una vez, en una nota al margen y en la lista de la beta.

El diferenciador está en la segunda frase y es verificable en tres segundos:
**pesos chilenos, sin anuncios, sin conectarse al banco**. Ninguna de las tres
la puede decir Monefy, Wallet ni Fintonic sin mentir en al menos una.

## 3. Público objetivo

Personas de 25 a 44 años en Chile, asalariadas o independientes, con ingresos
regulares o semi-regulares, que usan varios medios de pago y terminan el mes sin
saber bien en qué se les fue.

**Lo que quieren:** registrar rápido, saber cuánto queda, saber si van muy
rápido, ordenar lo que comparten. En pesos. Sin entregar claves bancarias.

**Lo que no quieren:** armar una planilla, aprender un método, estudiar finanzas.

**Cómo se aplicó al tono.** Chileno, directo, adulto y tranquilo. Nada de culpa
(«¿sabes en qué se te va la plata? La mayoría no» era una acusación disfrazada de
dato), nada de lenguaje bancario, nada de modismos forzados. Los únicos giros
locales son los que un chileno usaría sin pensarlo: «la Feria de la Vega», «la
cuenta de la luz», «el cumpleaños de la Javi», «se te vaya». No hay «cachai», no
hay «bacán», no hay emojis.

**Lo que Mesura no es**, y la página lo respeta: no es un banco, no es inversión,
no es cripto, no es para empresas, no es asesoría financiera, no sincroniza con
el banco y no toma decisiones por nadie. Está dicho literalmente en el pie.

## 4. Qué se eliminó, qué se conservó, qué se reformuló

| Bloque anterior | Decisión | Por qué |
|---|---|---|
| Hero con mockup de teléfono y sticker «DEMO FUNCIONAL» | **Eliminado** | Un teléfono dibujado es la imagen más genérica de la categoría. Peor: había que ponerle un sticker para avisar que era interactivo, lo que confesaba que no se notaba. La hoja de ancho completo se lee como demostración sin necesidad de un cartel |
| Tres tarjetas con 48% / 57% / 89% | **Eliminado** | Ninguna de las tres cifras resistió la verificación (`CLAIM_INVENTORY.md` §1) |
| Cuatro tarjetas de características | **Reformulado** | Convertidas en tres momentos narrados con un apunte contable cada uno. Una tarjeta describe una función; un momento describe cuándo la vas a usar |
| Dos tarjetas de precios (gratis / Pro) | **Eliminado** | Cero código detrás del plan Pro. Reemplazado por «Beta fundadora», que es lo que realmente se está ofreciendo |
| FAQ de cinco preguntas | **Reducido a cuatro** | Las cuatro que el encargo define. «¿En qué se diferencia de otras apps?» se eliminó: comparar con competidores por nombre en una FAQ es defensivo, y el diferenciador ya está en la bajada del hero |
| Sección «Tus datos» (existía antes y se había eliminado) | **Reincorporada, reescrita** | Es el diferenciador más fuerte frente a las apps globales. Ahora es un acuerdo en dos columnas —lo que usa / lo que no hace— con cada línea verificada contra el código |
| Calculadora de carga financiera | **Conservada y corregida** | Es la única pieza de la página con utilidad propia. Se corrigió «promedio» → «mediana», se acotó el universo a deudores bancarios, se agregó validación con mensajes legibles y `aria-live`, y un estado inicial que no presiona |
| «Por qué necesito una invitación: para que la app siga rápida» | **Reformulado** | Explicar la invitación por rendimiento de base de datos convierte una decisión de producto en una disculpa técnica. Ahora: «Mesura está creciendo despacio, y a propósito» |
| Nota «Gratis hoy, sin letra chica» | **Reformulado** | Se mantiene el hecho (hoy no hay cobro) y se agrega explícitamente que no se promete gratuidad futura. Decirlo es más creíble que insinuarlo |

## 5. Decisiones de redacción que conviene no revertir

1. **«De quienes lo tienen»** en el 31%. Sin esa cláusula la cifra es refutable
   con el PDF del estudio en la mano.
2. **«Mediana»** y **«deudores bancarios»** en el 11,9%. Son dos palabras que
   nadie va a agradecer y que evitan que la única cifra dura de la página sea
   falsa.
3. **«Viene activado»** en el resumen semanal. Es opt-out. Publicitarlo como
   opt-in sería un problema frente a un reclamo de consentimiento.
4. **«Necesita conexión a internet.»** No hay service worker. Omitirlo era la
   parte engañosa de «funciona como una app nativa».
5. **Nombrar a Cloudflare y a Google.** La frase cómoda era «no compartimos tus
   datos con terceros». Es falsa: Google ve los montos en cada correo. Nombrar a
   los proveedores cuesta una línea y hace que el resto de la sección sea creíble.
6. **«Esta es la lista completa, no una selección.»** Al lado de la lista de lo
   que ya se puede usar. Es una promesa fácil de cumplir y difícil de imitar.

## 6. Lo que se ganó el espacio y lo que no

**Se ganó el espacio:** la hoja del estado del mes (es el producto), la
calculadora (utilidad propia), el acuerdo de datos (diferenciador verificable),
la beta fundadora (es la oferta real).

**No se ganó el espacio, y por eso no está:** testimonios (no hay usuarios que
citar), logos de prensa (no hay), número de usuarios (la evidencia apunta a ~2
cuentas reales), comparativa con competidores (defensiva), sección de blog,
«nuestra misión», equipo, y cualquier bloque cuya única función fuera que la
página se viera más larga.

Cuando existan usuarios reales dispuestos a dar su nombre, **esa** es la próxima
sección que se gana el espacio. No más texto.
