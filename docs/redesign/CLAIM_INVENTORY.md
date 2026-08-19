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
| «Respaldo en Excel y copia completa de tu cuenta en JSON» | Funcionalidad | `app/api/export/route.ts:33-39` (.xlsx); `app/api/account/export/route.ts:95-96` (.json, exige contraseña) | **Comprobada** | Son dos exportaciones distintas y ambas existen |
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
| «El análisis con IA viene apagado y hoy está deshabilitado en todo el servicio» | Funcionalidad | `db/schema.ts:285` default `0`; consentimiento versionado en `worker/index.ts:61`; **`wrangler.jsonc:17` `AI_GLOBAL_ENABLED: "false"`** + `app/lib/ai-limits.ts:50` | **Ajustada** | Antes se ofrecía como algo que el usuario puede encender y usar. Hoy no corre para nadie aunque active el toggle. Se dice tal cual |
| «No se conecta a tu banco ni te pide claves bancarias» | Funcionalidad | Búsqueda de `fintoc\|plaid\|belvo\|cartola\|open banking` en `app/ worker/ db/`: cero coincidencias | **Comprobada** | Es el diferenciador más sólido y más fácil de verificar de toda la página |
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
