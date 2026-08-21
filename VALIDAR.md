# Validar — pasada del 20-21 de agosto de 2026

Rama: `claude/estudio-usuarios-capa1-20260820`. Un commit: `3a2ec58`. No se hizo
merge, no se desplegó, no se tocó ningún secreto.

Encargo original: aplicar al repo la Capa 1 (correcciones verificadas) del
estudio de usuarios en `C:\Users\matia\Downloads\Mesura-lanzamiento\`, sin
tocar la Capa 2 (la decisión estructural de seis países vs. uno, que corre en
otra sesión). Léelo primero si vas a revisar en detalle: es la fuente de cada
punto de abajo.

---

## 0. Lo primero que hay que saber: esta landing es una sola página, no seis

El repo (`index.html`) es la página **en producción hoy**, en pesos chilenos,
sin variantes por país. Las "seis versiones" que el encargo menciona
(`Mesura-lanzamiento/landing-v2/vista-previa/*.html`) son un **borrador sin
publicar**, en otra carpeta, que no toqué. Por eso varias instrucciones del
encargo no tenían nada que corregir *en este repo* — ver §4.

Busqué la carpeta nueva donde debía aparecer la decisión estructural (seis
países vs. uno, cómo declarar los límites del producto). **No apareció.** Lo
único nuevo en `Mesura-lanzamiento/` es `landing-v3/ejemplo/` — un generador y
verificador Node del ejemplo numérico (`ejemplo.js` + `verificar.js`), no una
decisión de arquitectura. Lo usé como fuente verificada de los montos (ver
§1), pero no resuelve si esta página pasa a seis versiones. Esa decisión
sigue pendiente — ver §3.

---

## 1. Qué cambió, en una frase cada uno

1. **El ejemplo del hero (la "hoja" del estado del mes) dejó de inventar un porcentaje.**
   Antes decía "Vas 16% por sobre el ritmo del mes" — la app, hoy, nunca
   calculó un porcentaje. Verificado en `Mesura-app-source` (rama `master`,
   `app/lib/home-context.ts`): compara la diferencia en dinero contra 500
   unidades mínimas y dice *"Vas $X por delante/por debajo de tu ritmo"* o
   *"Vas al día con tu presupuesto"*. El ejemplo ahora dice exactamente eso.
2. **El presupuesto del ejemplo era $620.000 — divisible exacto por los 31 días del mes.**
   Es el mismo defecto que el estudio encontró en los seis presupuestos de
   `landing-v2` (ninguno resistía la resta), pero **ya vivía en esta página
   publicada**, en su propio demo. Ahora es $487.300 (no divisible, sin
   vivienda), verificado con `landing-v3/ejemplo/verificar.js` — no falla
   ningún chequeo, incluido "dispara la alerta en las dos superficies".
3. **Las fechas del ejemplo eran agosto de 2025.** `sáb 16 · vie 15 · jue 14 · mié 13`
   → ahora `dom 16 · sáb 15 · vie 14 · jue 13`, que es lo que el calendario de
   2026 dice de verdad.
4. **"Un monto, una categoría, listo" y "Anotado en 4 segundos" eran falsos.**
   El formulario real tiene cuatro campos y uno es obligatorio ("¿Qué fue?").
   Ahora la página describe la secuencia real y deja de esconder ese campo,
   que el estudio señala como lo más valorado del producto.
5. **"Dos servicios para funcionar" → "Tres servicios".** Los Términos
   (`Mesura-app-source/app/terminos/page.tsx` §2) declaran Cloudflare, Google
   **y Anthropic**. Faltaba el tercero.
6. **Se declara que hoy no se puede importar** desde otra app ni desde una
   planilla (verificado: no existe `app/api/import` en el repo de la app).
7. **Se menciona que existe presupuesto por categoría**, además del general
   (verificado: existe `app/api/category-budgets`).
8. **El `og-mesura.png`** (la imagen que aparece al compartir el link en
   WhatsApp/redes) mostraba el mismo "16%" falso, congelado en un PNG. Se
   regeneró con las cifras nuevas.

Detalle completo, con cita al código, en el mensaje del commit `3a2ec58`.

---

## 2. Cómo comprobarlo en menos de diez minutos

No hace falta desplegar nada: es HTML/CSS/JS estático.

```
cd Mesura-landing
npx serve .          # o: npx wrangler pages dev .
```

Abre la URL que imprima y mira la primera pantalla (la "hoja"):

- **Disponible** debe decir `$156.325` (no `$204.000`).
- **Van gastados** `$330.975` (no `$416.000`).
- **Ritmo** debe decir *"Vas $48.027 por delante de tu ritmo."* — sin
  porcentaje, sin "16%".
- Los cuatro movimientos deben decir `dom 16 · sáb 15 · vie 14 · jue 13`.
- Escribe un monto en "Anotar gasto" y confirma que Disponible/Ritmo se
  recalculan sin errores en la consola del navegador.
- Baja a la sección **01**: el primer párrafo ya no dice "un monto, una
  categoría, listo".
- Sección **04**: "Tres servicios para funcionar" debe nombrar a Anthropic;
  "Lo que Mesura no hace" debe tener el ítem nuevo sobre importar.

Y la batería automática de este mismo repo (ya la corrí y quedó en verde,
pero puedes repetirla):

```
cd Mesura-landing/docs/redesign/qa
npm test
```

Debe imprimir `7/7 bloques en verde`, incluido `funcional: 24/24`.

**No hay "seis versiones" que revisar** — ver §0. Cuando la decisión
estructural de la Capa 2 aterrice y esta página se convierta en varias, cada
una tendrá que pasar por el mismo `verificar.js` de `landing-v3/ejemplo/`
antes de publicarse — ese script ya está escrito para eso.

---

## 3. Lo que necesita tu decisión — con mi recomendación ya tomada

Nada de esto bloquea lo ya aplicado; son llamadas que tomé para poder
avanzar esta noche, con la alternativa al lado por si la revocas.

1. **Regeneré `og-mesura.png` a mano** (HTML/CSS renderizado con Puppeteer y
   los mismos tokens de color de `landing.css`), no con la herramienta de
   diseño original de esa pieza — no sé cuál fue.
   **Recomendación: déjalo así por ahora** (ya no muestra el 16% falso), pero
   si existe un archivo fuente (Figma/Canva) para esa imagen, regenérala
   desde ahí para que el tipo y el espaciado calcen exactos.
   *Alternativa: revertir solo ese archivo* (`git checkout main --
   assets/img/og-mesura.png`) y dejar la imagen vieja hasta tener la fuente
   real — pero entonces vuelve a mostrar el 16% falso en las vistas previas.

2. **Quité el tercer estado "way-over" (rojo) del indicador de ritmo.**
   La app real solo tiene dos estados con color (`over` naranja, y un
   `on-track`/`under` sin color especial) — no existe un tercer umbral más
   severo. **Recomendación: dejarlo fuera**, siguiendo la regla de que el
   ejemplo replica Inicio. *Alternativa: si el equipo de producto define un
   estado "muy pasado" en el futuro, se puede reintroducir en `demo.js` y en
   `landing.css` (`--red` sigue definido) cuando exista en el código real.*

3. **No toqué `landing-v2/` ni `landing-v3/` en `Mesura-lanzamiento/`.**
   Son el borrador de seis países y su generador de ejemplo, ninguno vive en
   este repo todavía. **Recomendación: espera la sesión estructural** antes
   de decidir si esta página pasa a seis versiones o se queda en una — no lo
   decidí por mi cuenta porque es la Capa 2, no un hecho verificable.

4. **No toqué las secciones "Bloque II" (mejoras, no inexactitudes) de
   `CORRECCIONES-URGENTES.md`** ni las del `CORRECCIONES.md` de la v2 (la
   cifra diaria en el recuadro, declarar a quién no le sirve, etc.). No
   estaban en tu lista de Capa 1 y son juicio de producto, no hechos.
   **Recomendación: pasada aparte**, después de que la Capa 2 se resuelva,
   para no reescribir dos veces el mismo bloque.

---

## 4. Qué resultó falso de lo que se afirmó en el encargo

Verificando contra el repo real antes de tocar nada, como se pidió:

- **"La landing dice dos veces por versión que la moneda no se puede
  cambiar."** — **Falso para este repo.** La página en producción no
  menciona la moneda como irreversible en ninguna parte: no habla de elegir
  moneda porque solo tiene una (CLP). Esa afirmación describe el borrador de
  `landing-v2/vista-previa/` (seis países), que nunca se publicó. Sí verifiqué
  el hecho de fondo — `POST /api/account/currency` existe en
  `Mesura-app-source/app/api/account/currency/route.ts`, re-expresa montos
  con contraseña y confirmación, y no está mencionado en los Términos —, así
  que cuando la Capa 2 escriba el texto de moneda, tiene que decir que sí se
  puede cambiar (con esa fricción), no que es irreversible.
- **"El la renta": un dedazo sin artículo.** — **Falso para este repo.** Ese
  bug vive en la plantilla `{ARRIENDO}` de `landing-v2/vista-previa/ve.html`,
  que tampoco está publicada. No hay ningún token de arriendo en `index.html`
  hoy.
- Todo lo demás del encargo (fechas 2025, "dos toques", tres servicios,
  presupuesto por categoría, no se puede importar) sí estaba presente en el
  repo real y se corrigió — ver §1.

No encontré indicios de las "tres premisas falsas" que mencionas haber
pasado en una ronda anterior más allá de las dos de arriba — si te referías a
otras, dime cuáles y las reviso contra el código.

---

## 5. Frases que quedaron pendientes de que el código las respalde

No las escribí en la landing porque describirían algo que **todavía no
existe en producción** — dos sesiones paralelas están tocando
`Mesura-app-source` y `Mesura-mobile` ahora mismo:

- **El mensaje de ritmo como división ("Te quedan $X para N días · $Y al
  día")** ya existe en `Mesura-app-source`, pero **sin commitear**, en la
  rama de trabajo `mejoras/estudio-usuarios-web-20260820` (`app/lib/home-context.ts`,
  función `divisionPhrase`). `master` — lo que está desplegado — todavía usa
  el adjetivo/diferencia en dinero, que es lo que el ejemplo de esta landing
  describe ahora. **Cuando esa rama se mergee y despliegue, el ejemplo del
  hero (`index.html` + `assets/js/demo.js`) tiene que volver a actualizarse**
  para mostrar la división, no antes.
- **El presupuesto por categoría** que ahora se menciona está verificado
  contra la web (`app/api/category-budgets`). No verifiqué si existe el
  mismo alcance en `Mesura-mobile` — la landing no distingue plataforma, así
  que no debería importar, pero si en algún momento la landing empieza a
  hablar de "la app" con capturas específicas de una plataforma, hay que
  confirmarlo ahí también.
- **"No importa tus datos"** seguirá siendo cierto hasta que exista
  `app/api/import` (o equivalente) en `Mesura-app-source` — no hay indicio de
  que esté planeado, pero es la clase de afirmación que hay que re-verificar
  antes de cada release, no solo hoy.

---

## 6. Comandos — listos para copiar, **no ejecutados**

### Revisar el diff antes de decidir

```
git -C Mesura-landing log main..claude/estudio-usuarios-capa1-20260820 --oneline
git -C Mesura-landing diff main...claude/estudio-usuarios-capa1-20260820
```

### Mergear a `main`

```
git -C Mesura-landing checkout main
git -C Mesura-landing merge --no-ff claude/estudio-usuarios-capa1-20260820
git -C Mesura-landing push origin main
```

### Desplegar (según el README de este mismo repo)

```
cd Mesura-landing
npx wrangler pages deploy . --project-name=mesura-landing
```

### Revertir, si algo no calza

Si **ya hiciste el merge y el push**:

```
git -C Mesura-landing revert -m 1 <sha-del-commit-de-merge>
git -C Mesura-landing push origin main
```

Si **todavía no mergeaste** (el estado de ahora mismo): no hace falta
revertir nada — simplemente no hagas el merge, o borra la rama:

```
git -C Mesura-landing branch -D claude/estudio-usuarios-capa1-20260820
```

Si **ya desplegaste** y quieres volver a la versión anterior en Cloudflare
Pages: cada deploy queda versionado en el dashboard de Pages
(`mesura-landing` → pestaña Deployments) — "Rollback to this deployment"
sobre el deploy anterior a este, sin tocar git.

---

## 7. Lo que no alcancé a revisar

`informe-app/INFORME.md §9` ("La advertencia más repetida de la landing es
incorrecta") y el resto del Bloque II de ambos `CORRECCIONES*.md` no entraron
en esta pasada — son mejora, no hechos falsos, y el encargo pedía frenar ahí.
Si quieres que seleccione ítems específicos de esos bloques para incorporar
antes de que la Capa 2 aterrice, dímelo y los reviso contra el código, uno por
uno, como hice con estos.
