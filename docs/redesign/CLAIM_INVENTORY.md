# Inventario de afirmaciones — landing de Mesura

Rediseño «El mes a la vista», 19 de agosto de 2026.

Cada afirmación pública de la landing fue contrastada contra una de dos cosas:
el **código real del producto** (repositorios `mesurapp` y `Aplicacion-mesura`,
leídos en modo solo lectura) o la **fuente primaria** del dato. Nada quedó
apoyado en la landing anterior, en notas de prensa ni en «se entiende que».

Estado del código auditado: `mesurapp` en `21a73d7`, `Aplicacion-mesura` en
`ed6b1e3`, ambos del 18-ago-2026.

Leyenda de estado:

- **Comprobada** — verificada contra código o fuente primaria, publicada.
- **Ajustada** — era defendible solo con un matiz; se publicó con el matiz.
- **Eliminada** — no se pudo sostener; no aparece en la landing.

---

## 1. Cifras y estudios

| Texto publicado | Tipo | Fuente | Fecha fuente | Estado | Versión final |
|---|---|---|---|---|---|
| «71% de las personas en Chile declara manejar un presupuesto mensual» | Estadística | [Radiografía a la educación e inclusión financiera en Chile](https://politicaspublicas.uc.cl/publicacion/radiografia-a-la-educacion-e-inclusion-financiera-en-chile/), CPP UC + Banco Falabella. Cita textual sección 2.2. N=1.502, CATI/RDD nacional, 18+ | Terreno dic-2024, publicado ago-2025 | **Comprobada** | Publicada con «personas», nunca «hogares» |
| «31% de quienes lo tienen dice cumplirlo de manera consistente» | Estadística | Ídem, misma cita textual | Ídem | **Ajustada** | La cláusula «de quienes lo tienen» es obligatoria: el informe se contradice a sí mismo más adelante y omite el condicionante. Publicamos la versión rigurosa |
| «La mediana de la carga financiera de los deudores bancarios en Chile es 11,9%» | Estadística | [Informe de Endeudamiento CMF](https://www.cmfchile.cl/portal/prensa/625/w4-article-102984.html), 12ª versión. Universo: 6,1 millones de deudores bancarios con información de renta | Datos a jun-2025, publicado ene-2026 | **Ajustada** | Antes se publicaba como «el promedio es 11,9%». Es **mediana**, y de **deudores bancarios**, no de la población. Ambas precisiones están ahora en el texto |
| «48% de los hogares lleva un registro sistemático de sus gastos» | Estadística | — | — | **Eliminada** | La cifra **no existe** en el informe CPP UC. Lo más cercano (71% «afirma llevar un registro») tiene base restringida a quienes manejan *y cumplen* presupuesto, con una nota del propio informe advirtiendo que el NSE bajo no alcanza el mínimo de 30 observaciones. No proyectable |
| «57% gastó más de lo que recibió el mes anterior» | Estadística | Campaña «Chile al Día» | jun-2025 | **Eliminada** | «Chile al Día» es una campaña comercial de cobranza/repactación, no un centro de estudios. Sin ficha técnica ni documento metodológico público. La muestra sale de su propio ecosistema de personas endeudadas: el mismo estudio reporta 67% en mora contra ~25% de morosidad país según CMF |
| «89% no ahorra mensualmente para metas de largo plazo» | Estadística | Ídem | jun-2025 | **Eliminada** | Misma fuente, mismo problema |
| «54% no sabe cómo tomar decisiones financieras» | Estadística | Ídem | jun-2025 | **Eliminada** | Misma fuente, mismo problema. No estaba publicada, pero estaba en el material de apoyo |
| Cualquier número de usuarios / prueba social | Métrica | — | — | **Eliminada** (nunca se publicó) | No existe endpoint ni consulta de conteo de usuarios en el repositorio. La única pista interna apunta a ~2 cuentas reales. Cualquier cifra sería inventada |

**Regla aplicada:** una sola evidencia principal en toda la página, con fuente
enlazada, universo y N declarados en el mismo párrafo. Se prefirió una cifra
sólida a cuatro cifras impresionantes.

---

## 2. Producto — lo que la landing dice que Mesura hace

| Texto publicado | Tipo | Evidencia en código | Estado | Nota |
|---|---|---|---|---|
| «En pesos chilenos… sin decimales» | Funcionalidad | `app/lib/currency.ts:16` (`Intl.NumberFormat("es-CL", CLP, maximumFractionDigits: 0)`); `db/schema.ts:284` default `"CLP"`; montos como `integer` | **Comprobada** | Existen USD/EUR como unidad de visualización sin conversión FX; no se menciona porque no aporta y confundiría |
| «Registro de gastos e ingresos por categoría, con categorías que editas tú» | Funcionalidad | `db/schema.ts:88-92` (`label`, `icon`, `color`); `CategoriesManager.tsx` | **Ajustada** | La edición de categorías es **solo web**. Como la landing declara explícitamente que hoy Mesura se usa desde el navegador, la afirmación es consistente |
| «Presupuesto del mes y por categoría, con ritmo de gasto» | Funcionalidad | `db/schema.ts:238,267`; `app/api/budgets/category/route.ts`; `BudgetView.tsx:366-373` | **Ajustada** | Solo web. Ídem anterior |
| «Gastos compartidos y deudas, con abonos parciales y liquidación» | Funcionalidad | `db/schema.ts:68-77` (`debt_payments`); `app/lib/debt-fifo.ts:26-38`; `app/api/debts/consolidated/route.ts` | **Comprobada** | Web completo. Móvil sin pago consolidado, pero la app móvil no se ofrece |
| «Metas de ahorro con aportes y progreso» | Funcionalidad | `db/schema.ts:149,171`; `app/api/savings-goals/` | **Comprobada** | Existe en web y móvil |
| «Calendario, favoritos y **recordatorios de pagos fijos**» | Funcionalidad | `app/lib/calendar.ts`; `db/schema.ts:108-127`; `db/schema.ts:188-236` | **Ajustada** | Antes decía «pagos recurrentes», que sugiere automatismo. El producto es explícito: *«Mesura nunca los registra sola»* (`RecurringManager.tsx:113`). Se cambió a «recordatorios» |
| «Resumen semanal por correo — viene activado y lo apagas en un clic» | Funcionalidad | `db/schema.ts:283` default `1`; cron `wrangler.jsonc:51`; `worker/index.ts:52-53` | **Ajustada** | Es **opt-out**, no opt-in. Antes se insinuaba lo contrario. Ahora se dice que viene activado |
| «Respaldo en Excel y copia completa de tu cuenta en JSON» | Funcionalidad | `app/api/export/route.ts:33-39` (.xlsx); `app/api/account/export/route.ts:95-96` (.json, exige contraseña) | **Comprobada** | Son dos exportaciones distintas y ambas existen. **Desde §10 se publica como «un respaldo completo de tu cuenta»**: mismo hecho, sin el nombre del formato |
| Respaldo en Google Drive | Funcionalidad | `google-apps-script/Mesura.gs:47-53, 214-216`; `:59` `file.addViewer(email)` | **Eliminada** | **El mayor riesgo de la versión anterior.** La hoja se crea en el Drive del **operador**, no en el del usuario, y al usuario se le da permiso de **lector**. Decir «respaldo en Google Drive» invita a leer lo contrario de lo que ocurre. Se eliminó de la landing |
| Plan «Mesura Pro» con features y precio | Comercial | Búsqueda de `stripe\|mercadopago\|webpay\|transbank\|suscripci\|paywall` en `app/ worker/ db/`: **cero coincidencias** | **Eliminada** | No existe una línea de código de planes, límites ni pasarela de pago. Vender un plan futuro con features nombradas es prometer sin respaldo. Vive solo en `docs/ESTRATEGIA.md` |

---

## 3. Datos, privacidad y seguridad

| Texto publicado | Tipo | Evidencia en código | Estado | Nota |
|---|---|---|---|---|
| «No muestra publicidad» | Privacidad | Búsqueda de `admob\|adsense\|gtag\|google-analytics\|plausible\|posthog\|mixpanel\|segment\|fbq\|hotjar\|clarity` en `app/ worker/ public/ db/`: cero coincidencias reales. `package.json` con 5 dependencias | **Comprobada** | |
| «No vende tus datos» | Privacidad | Ningún destinatario publicitario ni de datos en el código | **Comprobada** | |
| «No usa cookies de seguimiento» | Privacidad | Única `cookieStore.set` del repo: `app/lib/auth.ts:25,65-72` (`session`, httpOnly, secure, sameSite lax) | **Comprobada** | Tema y hints van en `localStorage`, no en cookies |
| «Para funcionar, Mesura se apoya en Cloudflare y en Google para el envío de correo» | Privacidad | `wrangler.jsonc:54-70`; `app/lib/mailer.ts:34-38` → `google-apps-script/Mesura.gs:120` `MailApp.sendEmail` | **Ajustada** | Antes la página insinuaba que no se comparte nada con terceros. Es falso como absoluto: **todo** correo transaccional y el resumen semanal —con montos reales— pasan por el Apps Script/Gmail del operador, con Drive o sin él. Ahora se nombra a los proveedores |
| «La contraseña se guarda solo como hash con sal, nunca en texto plano» | Seguridad | `app/lib/password-hash.ts:81-85` (PBKDF2-HMAC-SHA256, sal de 16 bytes, comparación en tiempo constante) | **Ajustada** | Se afirma el hecho sin superlativos y **sin citar el número de iteraciones**: el propio código documenta que las 100.000 iteraciones son un techo impuesto por Cloudflare Workers y quedan bajo el piso OWASP de 600.000 (`password-hash.ts:9-14`). Es un P0 residual abierto, no un argumento de venta |
| «Cada cuenta ve solo sus propios datos… la única excepción es un gasto que tú decides dividir» | Seguridad | Filtro por usuario en `app/api/expenses/route.ts:144,152,266,329-330,358-359,385-386`; excepción en `:161`. Suites `financial-invariants-security.test.ts`, `debt-groups-auth.test.ts` | **Comprobada** | La excepción se declara en la propia landing en vez de esconderla |
| «Eliminas tu cuenta desde tu perfil, sin escribirle a soporte, y se borra de verdad» | Funcionalidad | `app/api/account/delete/route.ts:43-45` (síncrono, exige contraseña); `app/lib/account-deletion.ts:95-117` (`db.delete(users)`, borra R2 y hoja de Drive) | **Ajustada** | Es hard delete real. Se añadió el matiz de que los gastos compartidos se **anonimizan** en vez de borrarse (`account-deletion.ts:83-85`), porque el saldo de la contraparte depende de esas filas |
| «No usa inteligencia artificial, salvo que tú la actives» + la letra chica que nombra el análisis semanal y el registro por voz | Funcionalidad | `wrangler.jsonc:17` `AI_GLOBAL_ENABLED: "false"`, `db/schema.ts:285` default `0`, consentimiento versionado en `worker/index.ts:61`; para la voz, `docs/input-channels/PRIVACY_AND_CONSENT.md` del repo de la app (matriz de datos, tabla de los tres consentimientos y garantías con sus pruebas: `multichannel-input-invariants`, `quick-entry-ui-structure`, `privacy-architecture-invariants`) | **Ajustada** | Reemplaza a «No pasa tus datos por inteligencia artificial» (ver §9). La versión anterior era exacta solo mientras la voz estuviera apagada; ésta es exacta en los dos escenarios |
| «No se conecta a tu banco ni te pide claves bancarias» | Funcionalidad | Búsqueda de `fintoc\|plaid\|belvo\|cartola\|open banking` en `app/ worker/ db/`: cero coincidencias | **Comprobada** | Es el diferenciador más sólido y más fácil de verificar de toda la página. La FAQ que lo desarrolla cambió de vocabulario en §10 («estados de cuenta», «servicios que entren al banco por ti»), no de contenido |
| «Ninguna aplicación puede prometer seguridad absoluta y esta no lo hace» | Seguridad | — | **Comprobada** | Reemplaza cualquier formulación tipo «100% seguro». No se publica ninguna |

---

## 4. Acceso, instalación y precio

| Texto publicado | Tipo | Evidencia | Estado | Nota |
|---|---|---|---|---|
| «Hoy Mesura no tiene ningún cobro: no hay planes de pago, ni compras dentro de la app, ni tarjeta» | Comercial | Cero código de pagos (ver §2) | **Comprobada** | |
| «Tampoco te vamos a prometer que será gratis para siempre» | Comercial | Decisión del dueño registrada en `docs/ESTRATEGIA.md` §3 | **Comprobada** | Se dice explícitamente en vez de dejarlo ambiguo |
| «El acceso es por invitación» | Comercial | `wrangler.jsonc:37` `SIGNUP_MODE: "invite_only"`; degradación forzada en `app/lib/config.ts:66-81` | **Comprobada** | |
| «Mesura está creciendo despacio, y a propósito» | Comercial | — | **Ajustada** | Antes se justificaba la invitación diciendo que era para que la base de datos siguiera rápida. Es una explicación técnica que suena a excusa; el encargo pedía eliminarla. Ahora se presenta como decisión de producto |
| «Funciona en el navegador y se agrega a la pantalla de inicio desde el menú del propio navegador» | Funcionalidad | `public/manifest.json` (`display: standalone`, íconos 192/512 verificados), enlazado en `app/layout.tsx:19` | **Ajustada** | Antes decía «se ve y se siente como una app nativa». **No existe service worker** (`docs/ANDROID_READINESS.md:62`), así que Chrome/Android puede no ofrecer la instalación automática. Se describe la vía manual, que sí funciona siempre |
| «Necesita conexión a internet» | Funcionalidad | `docs/ANDROID_READINESS.md:65` («No hay soporte offline») | **Comprobada** | Afirmación nueva. Antes se omitía, y omitirla era la parte engañosa |
| «Todavía no está en App Store ni en Google Play» | Comercial | `Aplicacion-mesura/eas.json`: solo perfiles `development` y `preview`, `distribution: internal`, `submit.production` vacío | **Comprobada** | |
| «Hay una aplicación nativa en desarrollo, pero no vamos a anunciar una fecha que no podamos cumplir» | Comercial | Ídem | **Comprobada** | Sin fecha, por diseño |
| «Usamos tu correo solo para avisarte del cupo. Nada de newsletters» | Privacidad | `functions/api/waitlist.js`: guarda solo `email` y fecha; comentario explícito de que no guarda IP ni user-agent | **Comprobada** | |

---

## 5. Afirmaciones eliminadas, en resumen

Nueve afirmaciones de la versión anterior no sobrevivieron la verificación:

1. **48%** de hogares con registro de gastos — la cifra no existe en la fuente citada.
2. **57%** que gastó más de lo que recibió — fuente sin metodología pública.
3. **89%** que no ahorra — misma fuente.
4. **«promedio 11,9%»** — es mediana, y de deudores bancarios.
5. **Respaldo en Google Drive** — la hoja es del operador, el usuario es lector.
6. **«Sin compartir datos con terceros»** — Google recibe montos reales en cada correo.
7. **Mesura Pro** con features y precio — cero código detrás.
8. **«Se siente como una app nativa»** — sin service worker y sin uso offline.
9. **La invitación explicada por rendimiento de base de datos** — excusa técnica innecesaria.

Además se corrigió el **denominador** del 31% (es «de quienes tienen presupuesto»,
no «de las personas») y se reveló que el **resumen semanal es opt-out**, cosa que
la página anterior dejaba entender al revés.

---

## 6. Dos inexactitudes detectadas FUERA de esta landing

No se tocaron porque están en otro repositorio, pero conviene corregirlas allá:

1. **`mesurapp/app/privacidad/page.tsx:60`** afirma que Google interviene *«solo
   si conectas la sincronización opcional con Drive»*. No es exacto: todo correo
   transaccional y el resumen semanal pasan por el mismo Apps Script/Gmail. Es
   una inexactitud en un documento legal publicado.
2. **`mesurapp/app/privacidad/page.tsx:31`** dice que la hoja se comparte
   *«contigo como lectora/editora»*. El código solo agrega **lector**
   (`Mesura.gs:59`).

---

## 7. Recorte posterior al despliegue (19-ago-2026)

Tras ver la página publicada, el dueño pidió sacar las dos listas de la sección
«Beta fundadora» («Ya puedes usar» / «Todavía no existe»): se leían como un
changelog interno y, en una página comercial, enumerar carencias justo antes del
formulario planta dudas en el peor momento.

**Un problema de fondo que el recorte resuelve:** la lista de carencias incluía
*«cualquier tipo de conexión bancaria automática»*, que el hero vende como
virtud (*«sin conectarte al banco»*). La página se contradecía a sí misma.

Ninguna afirmación verificada se perdió: todas siguen publicadas en otro lugar.

| Afirmación | Dónde vive ahora |
|---|---|
| Registro por categoría, con categorías editables | Momento 01 |
| Ritmo de gasto | Momento 02 y la hoja del hero |
| Gastos compartidos con abonos y liquidación | Momento 03 |
| Metas de ahorro, calendario, favoritos, recordatorios de pagos fijos | Nota al margen de la sección 01 |
| **Resumen semanal opt-out** («llega activado y se apaga en un clic») | Nota al margen de la sección 01 — **se reubicó a propósito**, era una corrección deliberada de honestidad y no podía perderse |
| Respaldo en Excel y copia en JSON | Acuerdo de datos |
| No está en App Store ni Google Play | FAQ «¿Cómo se instala?» |
| Necesita conexión a internet | FAQ «¿Cómo se instala?» |
| **Gastos compartidos se anonimizan al eliminar la cuenta** | FAQ «¿Qué pasa con mis datos?» — **se reubicó** desde la letra chica, que también se recortó por leerse como texto legal interno |

**Afirmaciones que dejaron de publicarse** (sin reemplazo, por ser roadmap y no
producto actual): presupuesto compartido entre dos cuentas, proyección de fin de
mes con avisos anticipados, y «presupuesto **por categoría**» — esta última
existe en el producto (`app/api/budgets/category/route.ts`), simplemente ya no se
menciona en la landing.

---

## 8. Pasada de lenguaje para consumidor (19-ago-2026)

Segunda revisión pedida por el dueño con la misma lógica del recorte: el lector
es un consumidor decidiendo si probar la app, no un auditor. Se eliminó el
lenguaje interno, la jerga técnica y el meta-comentario (la página hablando de
su propia honestidad). **Ninguna afirmación cambió de significado**; cambió la
voz. Mapa de redacciones:

| Antes (voz de auditor) | Ahora (voz de consumidor) | ¿Sigue siendo verdad? |
|---|---|---|
| «Finanzas personales en CLP» | «App chilena de finanzas personales» | Sí — «pesos chilenos» ya está en la bajada |
| «Monto de referencia del mes» (demo) | «Presupuesto del mes» | Sí — es la palabra que usa el producto real |
| «hash con sal, nunca en texto plano» | «se guarda de forma que nadie puede leerla — ni siquiera nosotros» | Sí — descripción correcta de un hash sin nombrar el algoritmo |
| «en pesos chilenos y sin decimales» | «en pesos chilenos» | Sí — el CLP no usa decimales; el detalle era ruido |
| «El análisis con IA viene apagado y hoy está deshabilitado en todo el servicio» | «No pasa tus datos por inteligencia artificial» + «si algún día ofrecemos análisis con IA, será opcional y vendrá apagado» | Sí — con `AI_GLOBAL_ENABLED: false` el presente «no pasa» es exacto, y el futuro condicional es la política real (default 0 + consentimiento) |
| Ficha metodológica completa en la fuente UC (N=1.502, CATI, dic-2024) | Solo «CPP UC y Banco Falabella, 2025» + enlace | Sí — el detalle vive en el estudio enlazado y en este inventario (§1) |
| «—no de la población completa—» en la letra chica CMF | Eliminado | Sí — «de los deudores bancarios» ya acota el universo; la doble negación era redundante |
| «puedes desconectarte de internet y sigue funcionando» (calculadora) | Eliminado | Corregía algo peor: **contradecía** a la FAQ que dice que Mesura necesita internet |
| «porque nadie puede sostener esa promesa con honestidad» | «No prometemos que será gratis para siempre.» | Sí — el hecho queda, el sermón se va |
| «Nos parece más honesto decirlo que escribir "no compartimos nada con terceros"» | Eliminado de la FAQ | Sí — la transparencia sobre Cloudflare y Google **sigue publicada** en la sección 04; lo que se fue es el comentario sobre la propia honestidad |
| «cada línea de arriba está tomada como decisión y es verificable en el producto» | Eliminado | Era la página describiéndose a sí misma |

Líneas rojas que esta pasada respetó, y que cualquier edición futura debe
respetar: «mediana» y «deudores bancarios» en el 11,9%; «de quienes lo tienen»
en el 31%; el resumen semanal como opt-out; la mención a Cloudflare y Google en
la sección 04; y la anonimización de gastos compartidos en la FAQ de datos.

---

## 9. Corrección de la afirmación sobre IA, previa al registro por voz (19-ago-2026)

Pasada acotada, sin rediseño: solo la afirmación sobre inteligencia artificial.
Motivo: la app va a activar el **registro de gastos por voz**, que envía la
grabación al servicio de transcripción de **Cloudflare Workers AI**. Está
implementado y detrás de un interruptor (`VOICE_INPUT_ENABLED`), todavía en
`false`. La frase publicada hasta ahora era exacta con la voz apagada y dejaba
de serlo el día del encendido.

Fuente de la redacción: `docs/input-channels/PRIVACY_AND_CONSENT.md` del
repositorio de la app (`Mesura-app-source`), sección «Textos públicos que hay
que corregir», leída en modo solo lectura. La redacción se adaptó al formato de
la sección 04 —afirmación corta + `<small>`— conservando su significado exacto.

| Antes (publicado) | Ahora | Por qué |
|---|---|---|
| «No pasa tus datos por inteligencia artificial» | «No usa inteligencia artificial, salvo que tú la actives» | El absoluto deja de ser cierto en cuanto se encienda la voz: el audio sale hacia un tercero para transcribirse. La nueva versión es verdadera con la voz apagada **y** encendida, así que no hay que volver a tocarla el día del encendido |
| «Si algún día ofrecemos análisis con IA, será opcional y vendrá apagado.» | «Tus cuentas se calculan siempre sin IA. Las dos funciones que sí la usan —el análisis semanal y el registro por voz— vienen apagadas y cada una se enciende con su propio permiso; la de voz envía tu grabación al servicio de transcripción de Cloudflare para convertirla en texto, no la guarda y no entrena modelos con ella.» | El condicional a futuro («si algún día») ya no describe el producto: las dos funciones existen. Se nombra al proveedor, se dice que el audio sale, y se declaran los cuatro hechos que lo diferencian de «mandamos tus datos a una IA»: opcional, permiso separado, no se guarda, no entrena |

**Qué respalda cada parte de la letra chica**

| Afirmación | Respaldo |
|---|---|
| «Tus cuentas se calculan siempre sin IA» | Totales, categorías y presupuesto son cálculo del producto; la matriz de datos del documento de la app no lista ninguna salida hacia un proveedor de IA para esas operaciones |
| «vienen apagadas» | `AI_GLOBAL_ENABLED: "false"` y `db/schema.ts:285` default `0` para el análisis; `VOICE_INPUT_ENABLED` en `false` y consentimiento de voz **desactivado por defecto** |
| «cada una se enciende con su propio permiso» | Tres consentimientos separados con versiones distintas (`AI_CONSENT_VERSION`, `VOICE_INPUT_CONSENT_VERSION`, `COMMUNICATIONS_VERSION`); `POST /api/consents` mapea cada tipo a la suya. Rechazar el de voz no bloquea nada |
| «envía tu grabación al servicio de transcripción de Cloudflare» | Matriz de datos: la grabación sale del dispositivo hacia Cloudflare Workers AI durante la petición. **No se suaviza: el audio sale hacia un tercero** |
| «no la guarda» | La ruta de transcripción no importa la capa de base de datos ni el binding de almacenamiento, ni escribe el audio en logs; verificado por `tests/multichannel-input-invariants.test.ts`. La transcripción solo se guarda si la persona marca explícitamente «guardar como nota» |
| «no entrena modelos con ella» | Texto del consentimiento del producto (`VoiceConsentCard.tsx`), cuya presencia vigila `tests/quick-entry-ui-structure.test.ts` |

**Barrido del resto de la página.** Se revisaron FAQ (HTML y JSON-LD),
metadatos, `og:`/`twitter:`, `robots.txt`, `sitemap.xml`, CSS y JS. La única
aparición de «inteligencia artificial» / «IA» en material publicado era la
corregida. Ninguna otra afirmación se vuelve inexacta al encender la voz: la
FAQ «¿Qué pasa con mis datos?» habla de aislamiento por cuenta, exportación,
eliminación, publicidad, venta de datos y cookies, y todo eso sigue igual.

**Un punto pendiente, deliberadamente no tocado.** En «Lo que Mesura usa», la
línea «Cloudflare aloja la app y Google envía los correos» seguirá siendo
verdadera pero **incompleta** el día del encendido: Cloudflare pasará también a
transcribir. Queda fuera del alcance de esta pasada por instrucción explícita
(esa línea no se toca). Hoy el hecho igual queda publicado, dos ítems más abajo
en la misma pantalla, donde la letra chica nombra «el servicio de transcripción
de Cloudflare». Si se prefiere decirlo también arriba, es una edición de una
línea.

**Cifra CMF re-verificada.** El 11,9% se comprobó de nuevo contra la fuente
([nota de prensa CMF](https://www.cmfchile.cl/portal/prensa/625/w4-article-102984.html),
HTTP 200 al 19-ago-2026). El texto de la nota confirma las dos precisiones que
la landing publica: «se utiliza la **mediana** de la distribución de cada una de
las variables» y «la carga financiera […] se ubica en **11,9%**», con datos a
junio de 2025. La letra chica de la landing ya declara que sirve «para poner tu
número en contexto — no es una recomendación financiera ni un diagnóstico de tu
situación». Sin cambios.

**Línea roja nueva.** No volver a publicar un absoluto sobre IA («no pasa»,
«nunca», «cero IA»). Cualquier redacción futura tiene que seguir siendo cierta
con el registro por voz encendido, y no se resuelve con un asterisco: una
afirmación absoluta con letra chica es peor que una afirmación matizada.

---

## 10. Barrido de lenguaje llano y comprensión regional (19-ago-2026)

Pasada de **vocabulario**, sin rediseño y sin tocar el layout. Rama
`claude/landing-plain-language-latam-20260819`, partiendo de
`claude/landing-ai-copy-voice-20260819` @ `576e152` — esa rama **no estaba
mezclada a `main`** al empezar (`main` seguía en `4daa4a5`), así que se partió de
ella para no dejar el arreglo de la afirmación sobre IA fuera del árbol.

Dos encargos en una sola pasada:

1. Sacar de la página el vocabulario que solo entiende quien construye software.
2. Que la página se pueda leer sin tropiezos desde Perú, Argentina, México,
   Colombia o Venezuela, **sin dejar de sonar chilena**.

**Ninguna afirmación cambió de significado.** Todas las de §1–§9 siguen
publicadas, con su universo, su fuente y sus precisiones intactas.

### 10.1 Jerga técnica retirada

| Término | Dónde estaba | Ahora dice | Por qué sigue siendo verdad |
|---|---|---|---|
| **JSON** | Acuerdo de datos (`<small>` de «Tu respaldo»), FAQ «¿Qué pasa con mis datos?» y la misma respuesta en el JSON-LD | «un **respaldo completo de tu cuenta**» | Sigue siendo la segunda exportación, distinta del Excel y de la cuenta entera (`app/api/account/export/route.ts`). El nombre del formato no era información para quien lee: era la etiqueta interna del archivo |
| **servicios de agregación (financiera)** | FAQ «¿Debo conectar mi banco?» y su versión en el JSON-LD | «servicios que **entren al banco por ti**» | Describe exactamente lo que hace un agregador. La búsqueda que respalda la afirmación (`fintoc\|plaid\|belvo\|open banking`, cero coincidencias) no cambia |
| **credencial bancaria** | FAQ «¿Debo conectar mi banco?» | «no le entregas a nadie **las claves de tu banco**» | Misma afirmación, con la palabra que usa la gente |
| **quien administra el servidor** | FAQ «¿Qué pasa con mis datos?» | «ni siquiera **quien mantiene Mesura**» | El punto era que el operador tampoco puede leer la contraseña. Se conserva; se nombra a la persona, no a la máquina |
| **aloja** | Acuerdo de datos, «Dos servicios para funcionar» | «Cloudflare **mantiene la app en internet**» | **Línea roja respetada:** Cloudflare y Google siguen nombrados, y el resumen semanal sigue declarado como correo que pasa por Google |
| **corre** (en «el ejemplo corre en tu navegador») | Nota al pie de la demo del hero | «el ejemplo **funciona** en tu navegador» | Calco de programador. El hecho —cálculo local, sin envío, sin cuenta— no cambia |

**Términos buscados que no existían en material publicado:** token, caché,
endpoint, hash, PWA, service worker, worker, log, esquema, API, y cualquier
código de error crudo. El *hash* ya se había traducido en la pasada §8
(«se guarda de forma que nadie puede leerla»).

**Revisado y conservado:** «cookies de seguimiento». Es el término que la gente
ve todos los días en los avisos de consentimiento y en las políticas de
privacidad; traducirlo lo volvería más confuso, no menos.

**Encontrado y deliberadamente no tocado:** las respuestas de error de
`functions/api/waitlist.js` («Cuerpo inválido», «Correo inválido», «Lista de
espera no configurada») son JSON de la Function y **nunca se muestran**:
`landing.js` descarta el cuerpo de la respuesta y escribe su propio mensaje. No
son texto publicado.

### 10.2 Mensajes de error

Los tres mensajes que una persona puede llegar a ver se revisaron con el
criterio de que digan **qué pasó y qué hacer**:

| Antes | Ahora |
|---|---|
| «Revisa el correo: parece que le falta algo.» | «Ese correo no está completo. Revísalo y vuelve a enviarlo.» |
| «Necesitamos tu ingreso mensual para calcular el porcentaje.» | «Escribe cuánto te llega al mes para poder calcular el porcentaje.» |
| «Ejemplo restablecido a su estado original.» (aviso para lector de pantalla) | «Volvimos al ejemplo original.» |

Sin cambios: «No pudimos guardar tu correo — puede ser la conexión. Inténtalo
otra vez en un momento; tu correo sigue escrito arriba.» y «Escribe un monto
para anotarlo.» Ya decían causa y salida, y no tenían jerga.

### 10.3 Comprensión regional

La app admite hoy más monedas que el peso chileno, así que la página tiene que
poder leerla alguien de fuera de Chile. El criterio no fue neutralizar el
español: fue **quitar lo que se malentiende o no se entiende, y dejar lo que
solo suena chileno**.

**«Luca» no aparece** en ningún texto publicado — se buscó en HTML, JS,
metadatos, JSON-LD, `robots.txt` y `sitemap.xml`. Era el caso conocido (mil
pesos en Chile y Argentina, un sol en Perú) y no existía. Tampoco «boleta»,
«gamba», «palo» ni «al tiro».

| Expresión | Dónde | Decisión | Criterio |
|---|---|---|---|
| **cartolas** | FAQ del banco y su JSON-LD | → «tus **estados de cuenta**» | «Cartola» es chilena; en México y Perú es «estado de cuenta», en Colombia «extracto», en Argentina «resumen». «Estado de cuenta» se entiende en los seis países |
| **ingreso líquido** | Etiqueta de la calculadora | → «Tu **ingreso mensual**», con la explicación que ya estaba abajo | «Líquido» como «neto» es chileno y además contable. El `<small>` («Lo que te llega a la cuenta, después de los descuentos») ya definía el concepto sin depender de la palabra |
| **avances** | Calculadora, qué cuenta como deuda | → «avances **en efectivo**» | «Avance» solo se lee como avance de efectivo en Chile. Con las dos palabras se entiende en toda la región |
| **mediana nacional 11,9%** | Marca del eje del resultado | → «**mediana en Chile** 11,9%» | «Nacional» era ambiguo: un lector peruano lo lee como *su* país. El dato es de la CMF y es chileno, y ahora lo dice. **La cifra, la palabra «mediana» y el universo «deudores bancarios» no se tocaron** |
| **mediana nacional** (texto del resultado) | `calculator.js`, rama «coincide con la mediana» | → «la mediana de 11,9% de los deudores bancarios en Chile» | Queda igual que las otras cuatro ramas, que ya decían el universo completo |
| **SERNAC** | `calculator.js`, rama de cuotas sobre el ingreso | → «en Chile, el SERNAC o la institución donde tomaste el crédito; fuera de Chile, el organismo que defiende al consumidor en tu país» | Antes se ofrecía un organismo chileno como si fuera universal. Ahora se declara chileno y el lector de otro país recibe una pista útil |

**Revisado y conservado a propósito** — esto es la voz de la página, no un
descuido:

| Expresión | Dónde | Por qué se queda |
|---|---|---|
| **Bencina** | Movimiento del estado del mes | Es la palabra chilena para gasolina y no significa otra cosa en ningún otro país: no se puede *malentender*. La fila trae su categoría al lado («Transporte · vie 15»), que entrega el referente a quien no conozca la palabra |
| **Feria de la Vega** | Movimiento del estado del mes y apunte del momento 01 | Lugar real de Santiago. Va acompañado de «Supermercado», que da el sentido. Cambiarlo por un genérico sería exactamente lo que el encargo prohíbe |
| **«el arriendo a medias, el asado que pagaste tú, la plata que te deben»** | Momento 03 | La frase más chilena de la página y la más concreta. «Arrendar», «asado» y «plata» se entienden en toda Hispanoamérica aunque no sean la palabra cotidiana en cada país |
| **«Cumpleaños de la Javi»** | Movimiento del estado del mes | El artículo antes del nombre es marca chilena y rioplatense. Se entiende sin esfuerzo y es parte de que el texto suene a alguien |
| **sueldo**, **computador**, **cuenta de la luz** | Calculadora, FAQ, movimientos | Se usan y se entienden en los seis países |
| **carrete** | `value="carrete"` e `id="demo-cat-carrete"` | Identificador interno del formulario, nunca visible: la etiqueta que se lee dice «Salidas». No es texto publicado y cambiarlo solo arriesgaría romper CSS y JS |

**Cifras y evidencia chilena: intactas.** El 71% y el 31% del CPP UC con su
cláusula «de quienes lo tienen»; el 11,9% de la CMF con «mediana» y «deudores
bancarios»; Cloudflare y Google; la anonimización de gastos compartidos; el
resumen semanal opt-out; el acceso por invitación; «Hecha en Chile». Ni una
palabra de eso se tocó, y los dos enlaces a las fuentes siguen apuntando a la
misma URL.

**Sin meta-comentario.** La pasada no agregó ni una frase de la página hablando
de sí misma, de su propia honestidad ni de objeciones anticipadas. La línea roja
de §8 se mantiene.

### 10.4 Un pendiente que esta pasada no podía resolver

La landing declara **«en pesos chilenos»** en cuatro lugares: la meta
descripción, `og:`/`twitter:`, la bajada del hero y el acuerdo de datos. La
afirmación está verificada en §2 contra `db/schema.ts:284` (default `"CLP"`).

Si la app efectivamente admite hoy sol peruano, peso argentino, peso mexicano,
peso colombiano y bolívar, esa afirmación **queda incompleta** — es la misma
figura del problema de la IA en §9: exacta ayer, angosta hoy. No se tocó porque
(a) el encargo era de vocabulario y esto es un cambio de afirmación, y (b) no se
puede verificar desde este repositorio: exige leer el código de la app, como se
hizo para §2 y §9.

Lo mismo vale para el formato de los montos: la calculadora imprime todo con
`Intl.NumberFormat("es-CL", CLP)`, de modo que quien escriba soles verá el
resultado con formato de peso chileno. El **porcentaje**, que es lo que la
calculadora afirma, es correcto en cualquier moneda.

**Recomendación:** verificar las monedas en el repositorio de la app y, si se
confirman, corregir la afirmación en una pasada propia con la evidencia al lado.

### 10.5 Efecto en la altura de la página

El ritmo vertical medido en `QA_RITMO.md` **no se deshizo**. Medido con el mismo
método —Chrome sin interfaz, seis anchos, claro y oscuro— antes y después:

| Ancho | Antes | Después | Δ |
|---|---|---|---|
| 320 × 720 | 8.871 px | 8.906 px | **+35 px** (+0,4 %) |
| 390 × 844 | 7.943 px | 7.959 px | **+16 px** (+0,2 %) |
| 768 × 1.024 | 6.603 px | 6.603 px | **0** |
| 1.024 × 768 | 4.975 px | 4.979 px | +4 px |
| 1.366 × 768 | 5.204 px | 5.204 px | **0** |
| 1.440 × 900 | 5.234 px | 5.234 px | **0** |

Hero, «Un mes real», la brecha, las preguntas y el cierre miden **exactamente lo
mismo en los doce escenarios**. El movimiento viene de dos `<small>` que ganaron
una línea en las pantallas más angostas: «avances en efectivo» en la calculadora
(+15/+16 px) y «Cloudflare mantiene la app en internet» en el acuerdo de datos
(+19 px a 320).

Dos redacciones se acortaron durante la pasada precisamente para devolver
altura, sin perder nada: «un respaldo completo de tu cuenta» en vez de «una
copia completa de tu cuenta en un archivo de respaldo» (−23 caracteres, misma
afirmación), y se quitó el «cada mes» que duplicaba lo que ya decía la etiqueta
del campo. Con eso el escritorio volvió a 0 px de diferencia.

### 10.6 Controles

Ejecutados contra un servidor local que replica los headers reales de `_headers`
—CSP incluida— y con **mock de `/api/waitlist`**: no se escribió en el KV de
producción ni se disparó ningún correo.

- **axe-core** (`wcag2a` + `wcag2aa` + `wcag21a` + `wcag21aa` + `best-practice`)
  en claro y oscuro, a 390 y 1.440: **0 violaciones** en las cuatro
  configuraciones.
- **12/12 pruebas funcionales**: el JSON-LD sigue parseando con sus cuatro
  preguntas; la demo recalcula al anotar un gasto y vuelve al ejemplo original
  con el aviso nuevo; los tres mensajes de error aparecen con el texto nuevo; la
  calculadora entrega porcentaje y texto, con la marca del eje diciendo Chile;
  la rama de sobreendeudamiento acota el SERNAC a Chile; el envío al mock
  responde éxito y oculta el formulario.
- **0 errores de consola** en los doce escenarios medidos.
- **0 scroll horizontal** entre 320 y 1.440 px.
- **12 anclas internas**, todas apuntando a un `id` existente. Los cinco enlaces
  externos no se modificaron: siguen siendo los mismos `https://` de antes.
