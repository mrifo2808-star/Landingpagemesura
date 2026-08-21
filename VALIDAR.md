# Validar — pasada del 20–21 de agosto de 2026

Rama: `claude/estudio-usuarios-capa1-20260820`. Cuatro commits: `3a2ec58`,
`a55bc48`, `f54f022` (el grande) y este archivo. No se hizo merge, no se
desplegó, no se tocó ningún secreto.

**Esto reemplaza la versión anterior de `VALIDAR.md`.** Empezó como una
pasada acotada (Capa 1: fechas, "dos toques", tres servicios). A mitad de la
noche llegaron dos cosas tuyas que cambiaron el encargo: cerraste la
pregunta de seis-sitios-vs-uno, y la sesión paralela ("Alcance real de la
landing") terminó y dejó su decisión de moneda escrita en
`Mesura-lanzamiento/landing-v3/`. Con eso disponible, la pasada se volvió
una reescritura completa de la página según esa especificación. La Capa 1
original queda incorporada adentro; no hace falta revisarla aparte.

---

## 0. Qué encontré cuando fui a buscar la decisión de moneda

Hiciste bien en avisar que llegaría en una carpeta nueva. La encontré:
`Mesura-lanzamiento/landing-v3/` tenía, cuando la leí, tres piezas ya
terminadas:

- **`ESPECIFICACION-MONEDA.md`** — la decisión técnica, tomada: un solo
  sitio, el ejemplo se muestra en la moneda del lector, detectada por país
  de conexión, con un selector visible que manda siempre. **Nada de dólares
  ni euros** — no porque yo lo decidiera, sino porque el propio documento
  dice que el producto los está retirando de las monedas elegibles
  (`Mesura-mobile/lib/money.ts:96`). Un ejemplo en una moneda que la app no
  va a dejar elegir rompería la regla del escaparate.
- **`TEXTO.md`** — "v3.1 · FINAL", el texto completo de la página, ya
  pasado por dos rondas de evaluación con trece lectores simulados. Es lo
  que llevé al repositorio.
- **`landing-v3/ejemplo/ejemplo.js` + `verificar.js`** — el generador
  verificado de todos los montos del ejemplo, con las seis monedas, y el
  script que audita calendario, divisibilidad y disparo de la alerta contra
  el código real de los dos repos de la app.

Antes de usarlos verifiqué las dos afirmaciones de código que la
especificación hacía, porque son las que sostienen toda la arquitectura:

- **USD y EUR existen como monedas de cuenta reales** en
  `Mesura-app-source/app/lib/money.ts` (`CurrencyCode`, con exponente y
  locale igual que las otras seis) — pero **`Mesura-mobile/lib/money.ts:96`
  las excluye de las elegibles al crear cuenta**. Las dos cosas son
  ciertas a la vez: por eso la especificación dice que el producto "las
  está retirando", no que nunca existieron.
- **`app/lib/home-maturity.ts`**: el ritmo y el bloque de categorías
  aparecen desde el quinto movimiento del mes (`USEFUL_MONTH_MIN_TRANSACTIONS
  = 5`), verificado línea por línea. La nota que el ejemplo hace de esto es cierta.

---

## 1. Qué cambió, en una frase cada uno

1. **Un solo `index.html`, no seis.** Cerraste tú esa pregunta; la landing-v2
   de seis países queda como estaba, sin publicar, en `Mesura-lanzamiento/`.
2. **El ejemplo del hero ahora tiene un selector de moneda visible** ("Ejemplo
   en ▾"), y por defecto muestra la moneda del país de conexión
   (`CF-IPCountry`, resuelto en el borde con una Cloudflare Pages Function
   nueva — `functions/_middleware.js` — para que no parpadee). Una entrada
   rota en la URL (`?m=xx`, `?m=USD`) nunca deja la página sin ejemplo: cae
   al país o a pesos chilenos.
3. **El texto de la página completa se reescribió según `TEXTO.md` v3.1**:
   el ritmo real ("Vas $X por delante de tu ritmo", sin porcentaje), los
   cuatro casos en que el ritmo no sirve hoy (quincena, ingreso irregular,
   temporada, gasto que no decides tú), lo compartido explicado completo
   (invitación de 7 días, qué ve la otra persona, grupos de hasta 20), que
   el presupuesto por categoría existe, los favoritos, y "Lo que Mesura
   decidió no hacer" en vez de una lista de "no". Se sacó la sección de
   estadísticas 71%/31% (bases distintas, salto causal, un solo país).
4. **La moneda sí se puede cambiar — dicho explícito, donde antes no se
   decía nada.** Sección "Antes de dejar tu correo": re-expresar, no
   convertir, con contraseña, irreversible si la moneda nueva no tiene
   decimales. (Ver §4: esto contradice al propio formulario de registro de
   la app — hay que decidir cuál de las dos superficies se corrige.)
5. **La calculadora dejó de fijar pesos chilenos.** Ahora sigue la moneda
   que el lector eligió arriba, y se sacó la comparación con la mediana de
   endeudamiento de Chile (no tenía sentido para seis países).
6. **El formulario de invitación pregunta "¿Cómo te entra la plata?"**
   (fechas fijas / a los saltos) — es sólo para priorizar a quién conviene
   invitar primero; no bloquea el envío. `functions/api/waitlist.js` lo
   guarda como campo opcional, sin tocar el contrato existente.

---

## 2. Cómo comprobarlo en menos de diez minutos

Esta vez sí hace falta `wrangler`, porque la detección por país corre en
una Cloudflare Pages Function que el arnés de QA no ejecuta:

```
cd Mesura-landing
npx wrangler pages dev . --compatibility-date=2026-08-01
```

Abre la URL que imprima y mira:

- **El selector "Ejemplo en ▾"**, pegado al ejemplo. Cámbialo a "soles":
  toda la hoja (disponible, gastado, ritmo, movimientos, categorías, la
  cifra diaria, el símbolo de la calculadora) tiene que cambiar junta, y la
  URL debe pasar a `?m=PEN` sin recargar la página.
- **La detección por país**, sin usar el navegador — con curl, simulando un
  visitante peruano:
  ```
  curl -s -H "CF-IPCountry: PE" http://127.0.0.1:8788/ | grep data-moneda
  ```
  Debe imprimir `data-moneda="PEN"`. Sin la cabecera, `data-moneda="CLP"`.
- **Que una URL rota no rompa nada**: abre `/?m=USD` o `/?m=xx` — la página
  tiene que verse en pesos chilenos, no en blanco ni con un error.
- **Que el ritmo diga dinero, no porcentaje**: el recuadro debe decir "Vas
  $48.027 por delante de tu ritmo", nunca "Vas 16%…".
- **Que `/api/waitlist` siga funcionando**: llena el formulario del final
  con un correo cualquiera — no lo va a mandar a producción si no
  configuraste el KV, pero no debería tirar un error de servidor.

Y la batería automática (no ejecuta la Function, pero cubre todo lo demás:
teclado, contraste, formulario, la demo con JS y sin JS):

```
cd docs/redesign/qa && npm test
```

Debe imprimir `7/7 bloques en verde` (incluido `funcional: 26/26`).

Y, si quieres la verificación más dura — la que audita los números contra
el código real de los dos repos de la app —, desde
`Mesura-lanzamiento/landing-v3/ejemplo/`:

```
node verificar.js --contra-repo "C:\Users\matia\Downloads\Mesura-app-source" "C:\Users\matia\Downloads\Mesura-mobile"
```

Debe imprimir `SIN FALLOS`.

---

## 3. Lo que necesita tu decisión — con mi recomendación ya tomada

1. **El formulario NO ofrece WhatsApp como canal**, aunque `TEXTO.md` lo
   pedía. Lo dejé fuera después de leer `google-apps-script/MesuraWaitlist.gs`
   completo: la aprobación y el envío de la invitación dependen del correo
   de punta a punta — no hay forma de mandar una invitación por WhatsApp
   hoy. Ofrecer la opción en la página sin poder cumplirla habría sido
   exactamente el tipo de promesa vacía que esta reescritura vino a
   eliminar. **Recomendación: si quieres esa opción, hace falta decidir
   cómo se entrega la invitación por WhatsApp antes de tocar la landing** —
   no es un cambio de texto, es un canal de entrega nuevo.
   *Alternativa reversible: agregar el radio "Correo / WhatsApp" ya mismo
   como preferencia declarada (sin cambiar la entrega real), y ser
   honestos en la misma línea: "hoy solo podemos escribirte por correo".*
   No lo hice porque me pareció peor que omitirlo del todo — decide tú.

2. **"Te escribimos, aunque sea para decirte que todavía no."** — sin plazo.
   `TEXTO.md` proponía "en menos de dos semanas", con la condición explícita
   de que "hay que poder cumplirlo. Si no, se quita el número." No tengo
   forma de verificar tu capacidad real de respuesta, así que usé la
   versión sin promesa. **Recomendación: si dos semanas es realista, agrega
   el plazo** — es una frase, en `index.html`, sección 07, dentro de
   `.signup__consent`. *Alternativa: dejarlo como está.*

3. **La sección 08 ("Quién hace esto") no lleva la frase sobre qué pasa si
   cierras Mesura.** `TEXTO.md` la marca como "PENDIENTE — no publicar hasta
   que Matías ponga el número" (los días de aviso antes de cerrar). La dejé
   completamente afuera, tal como pide la nota — nada de placeholder.
   **Necesita tu número.** Cuando lo tengas, la frase exacta está en
   `Mesura-lanzamiento/landing-v3/TEXTO.md`, sección 08.

4. **El `og-mesura.png` no se tocó en esta pasada** — ya lo había regenerado
   en el commit `3a2ec58` con las cifras correctas ($156.325 / $330.975 /
   "Vas $48.027 por delante de tu ritmo"), y esos números no cambiaron. Sigue
   siendo una imagen fija en pesos chilenos: no hay una versión por moneda
   para compartir en redes. **Recomendación: dejarlo así** — es la moneda
   por defecto y regenerar una imagen distinta por cada una de las seis es
   trabajo de diseño, no de esta pasada.

5. **`docs/redesign/CLAIM_INVENTORY.md`** (el inventario de afirmaciones de
   una revisión anterior) no se concilió con este cambio. Puede tener
   entradas que esta reescritura ya resolvió. No lo abrí por tiempo — queda
   para una pasada de limpieza documental, no bloquea nada de lo publicado.

---

## 4. Qué resultó falso — de lo que afirmé yo antes y de lo que encontré ahora

- **Mi VALIDAR.md anterior decía que "la moneda no se puede cambiar" no
  aparecía en ningún lugar del repo.** Seguía siendo cierto en ese momento.
  Ahora sí aparece — la agregué yo, siguiendo `TEXTO.md` — y por eso
  encontré algo que antes no era relevante: **el formulario de registro
  real de la app dice lo contrario.** `Mesura-app-source/app/components/SignupForm.tsx`
  tiene el texto "No podrás cambiarla una vez que tengas movimientos
  registrados", y eso es falso: `POST /api/account/currency` existe y re-expresa
  montos con contraseña. **La landing y el formulario de la propia app
  ahora dicen cosas distintas**, y las dos no pueden quedar así. No corregí
  `SignupForm.tsx` — no es un archivo de este repositorio — pero queda
  anotado para quien tenga el repo de la app abierto.
- **Encontré tres funciones que el estudio de usuarios documentó como
  "escondidas o negadas" y verifiqué las tres contra el código antes de
  escribir sobre ellas:** presupuesto por categoría (`app/api/category-budgets`,
  existe), favoritos con monto opcional (`app/api/favorites/route.ts:77`),
  y grupos de deudas de hasta 20 personas (`app/lib/debt-groups/validation.ts:18`,
  `MAX_MEMBERS_PER_GROUP = 20`). Las tres están en la página ahora.
- **El campo "¿Qué fue?" es obligatorio en el móvil y opcional en la web.**
  Verificado: `MovementFormSheet.tsx:316` (web) lo marca "(opcional)";
  `components/TransactionForm.tsx:363` (móvil) y `app/api/expenses/route.ts:66-69`
  (el servidor exige título) lo hacen obligatorio ahí. La landing describe
  la versión web, que es la que existe hoy como sitio; si en algún momento
  la página empieza a hablar específicamente de la app de teléfono, esta
  frase hay que revisarla aparte — quedó anotada en el propio `TEXTO.md`
  y la repito aquí porque es la clase de discrepancia fácil de perder.

No encontré nada más que contradijera lo que este encargo o `TEXTO.md`
afirmaban — pero tampoco re-verifiqué cada línea de `TEXTO.md` contra el
código; verifiqué las que sostienen la arquitectura (moneda, quinto
movimiento) y las que ya traían cita de archivo:línea. El resto lo heredé
de un texto que ya pasó dos rondas de evaluación con objeciones reales.

---

## 5. Frases que quedaron pendientes de que el código las respalde

- **La moneda "sí se puede cambiar"** (sección 05) es cierta hoy vía
  `POST /api/account/currency`, pero es una salida de emergencia, no el
  camino normal — y como se dijo en §4, el propio formulario de registro
  todavía promete lo contrario. Si `SignupForm.tsx` se corrige, esta
  sección de la landing no necesita cambiar; si en cambio se decide sacar
  el endpoint de re-expresión, esta sección sí.
- **El mensaje de ritmo como división** ("Te quedan $X para N días · $Y al
  día", en vez de la resta manual que hace la "cifra diaria" de esta
  landing) existe en `Mesura-app-source`, pero **sin commitear**, en la
  rama de trabajo `mejoras/estudio-usuarios-web-20260820`. `master` — lo
  desplegado — sigue con el adjetivo/diferencia en dinero, que es lo que
  la landing describe ahora. Cuando esa rama se mergee, la nota de la
  "cifra diaria" ("La app todavía no la muestra") deja de ser cierta y hay
  que borrar el párrafo — está escrito para que sea un borrado, no una
  reescritura.
- **El campo "¿Qué fue?" opcional** es cierto en la web, falso en el móvil
  (ver §4). Si la landing empieza a hablar de la app nativa específicamente,
  revisar esto primero.

---

## 6. Comandos — listos para copiar, **no ejecutados**

### Revisar el diff antes de decidir

```
git -C Mesura-landing log main..claude/estudio-usuarios-capa1-20260820 --oneline
git -C Mesura-landing diff main...claude/estudio-usuarios-capa1-20260820 -- index.html
```

### Mergear a `main`

```
git -C Mesura-landing checkout main
git -C Mesura-landing merge --no-ff claude/estudio-usuarios-capa1-20260820
git -C Mesura-landing push origin main
```

### Desplegar

```
cd Mesura-landing
npx wrangler pages deploy . --project-name=mesura-landing
```

### Revertir, si algo no calza

Si **ya mergeaste y pusheaste**:

```
git -C Mesura-landing revert -m 1 <sha-del-commit-de-merge>
git -C Mesura-landing push origin main
```

Si **todavía no mergeaste** (el estado de ahora mismo):

```
git -C Mesura-landing branch -D claude/estudio-usuarios-capa1-20260820
```

Si **ya desplegaste**: Cloudflare Pages guarda cada deploy —
`mesura-landing` → pestaña Deployments → "Rollback to this deployment"
sobre el anterior a éste, sin tocar git.

### Si el rollback es sólo de la Function (no de todo el sitio)

`functions/_middleware.js` es nuevo y es lo único de este cambio que corre
en el borde de Cloudflare en vez de ser HTML/CSS/JS estático. Si algo falla
específicamente ahí (por ejemplo, `CF-IPCountry` se comporta distinto de lo
esperado en producción) y quieres el resto del cambio sin la detección por
país, la salida más chica es borrar `functions/_middleware.js` — el
selector y `?m=` siguen funcionando enteros sin él, sólo se pierde el valor
por defecto según el país.

---

## 7. Verificaciones que hice y que puedes repetir

- `node ejemplo/verificar.js --contra-repo ...` (arriba, §2): `SIN FALLOS`.
- `npx wrangler pages dev .` + `curl` con `CF-IPCountry` y `?m=`: confirmado
  que la Function resuelve en el orden correcto (elección > país > CLP), que
  `Vary: CF-IPCountry` se agrega, y que las cabeceras de seguridad de
  `_headers` sobreviven pasando por la Function.
- `docs/redesign/qa`: 7/7, incluida una prueba nueva de cambio de moneda y
  una de que `?m=USD` (basura, porque USD no es elegible) cae a pesos
  chilenos sin romper la página.
- Grep manual en `Mesura-app-source` y `Mesura-mobile` para las citas de
  código de §0 y §4 — no confié en que `TEXTO.md` las tuviera bien sólo
  porque traía la ruta del archivo.
