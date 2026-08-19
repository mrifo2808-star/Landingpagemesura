# Mesura — Landing page

**En producción:** https://mesura-landing.pages.dev

Landing page estática y sin herramientas de compilación (HTML, CSS y JS vanilla,
cero dependencias), más una Cloudflare Pages Function mínima que guarda los
correos de la lista de espera.

Concepto actual: **«El mes a la vista»**. La promesa única de la página es *ver
cómo va el mes antes de que termine*, y todo lo demás está subordinado a eso. El
rediseño completo — dirección de arte, auditoría de contenido, inventario de
afirmaciones verificadas contra el código real del producto, plan de medición e
informe de QA — está en [`docs/redesign/`](docs/redesign/).

Cosas que trae y no son obvias a primera vista:

- **El hero es una demostración funcional del estado del mes**, no una imagen ni
  un teléfono dibujado. Ocupa el ancho completo y se comporta como una cartola:
  disponible, gastado, **ritmo** (lo que llevas gastado contra lo que corresponde
  al día del mes en que vas), últimos movimientos y distribución por categoría.
  Se puede anotar un gasto de prueba y todo se recalcula al instante, incluido el
  estado de sobregiro. Funciona **entera con teclado**, no llama al backend y no
  persiste nada. «Volver al ejemplo original» restablece montos y categoría.
- **Sin JavaScript la página no se rompe**: la hoja muestra los mismos valores
  como HTML estático y los controles interactivos simplemente no aparecen, en vez
  de aparecer muertos. El gate es CSS (`#estado-mes:not([data-ready]) .jot`), así
  que los controles solo se muestran si `demo.js` efectivamente arrancó.
- **El formulario de la lista de espera guarda correos de verdad** vía
  `functions/api/waitlist.js` — ese contrato no cambió. Trae honeypot anti-bots,
  guarda contra doble envío (cubre el doble clic y el Enter repetido) y, si el
  endpoint falla, muestra un error honesto y conserva el correo escrito.
- **Cero peticiones a terceros.** Las tres tipografías están auto-alojadas en
  `assets/fonts/` (subconjunto latino, 144 KB en total). No es solo rendimiento:
  la página promete que no comparte datos con terceros, y pedirle la tipografía a
  Google filtraría la IP de cada visita. Como consecuencia, `_headers` puede
  declarar una CSP estricta (`default-src 'self'`) sin listas de excepciones.
- **Toda cifra publicada tiene fuente, universo y fecha**, y las que no
  resistieron verificación se eliminaron. El detalle, afirmación por afirmación y
  con ruta:línea del código que la respalda, está en
  [`docs/redesign/CLAIM_INVENTORY.md`](docs/redesign/CLAIM_INVENTORY.md).
- **Modo oscuro automático** vía `prefers-color-scheme`, tibio y nunca negro puro.
  `prefers-reduced-motion` desactiva toda animación y transición.

## Archivos

- `index.html` — la estructura completa: hero con el estado del mes, «un mes
  real», la brecha entre planificar y cumplir, calculadora, acuerdo de datos,
  beta fundadora, preguntas, invitación y pie.
- `assets/css/landing.css` — sistema visual completo (tokens, tipografía, grilla).
- `assets/js/demo.js` — la demostración del estado del mes.
- `assets/js/calculator.js` — calculadora de carga financiera, 100% en el navegador.
- `assets/js/landing.js` — formulario de lista de espera y eventos de medición.
- `assets/fonts/`, `assets/img/` — tipografías, favicon e imagen social original.
- `functions/api/waitlist.js` — Pages Function `POST /api/waitlist`: valida el
  correo y lo guarda en KV.
- `_redirects` — sirve `index.html` en rutas desconocidas y bloquea `/docs/*`.
- `_headers` — CSP, cabeceras de seguridad y caché de assets.
- `docs/redesign/` — documentación del rediseño. **No debe publicarse.**

> **Ojo con `docs/`.** Es documentación interna (estrategia, precios candidatos
> del plan Pro). Antes de este rediseño se servía públicamente:
> `/docs/ESTRATEGIA.md` devolvía 200 con el texto completo. `_redirects` y
> `.assetsignore` intentan cerrarlo, pero **eso no se pudo verificar sin
> desplegar: comprueba ese 200 después del primer deploy.**

## Publicar en Cloudflare Pages (gratis)

> **Importante:** como hay una Function (`functions/`), el deploy por
> arrastrar-y-soltar del dashboard **no** sirve para el formulario (sube solo los
> archivos estáticos). Usa la Opción A o la B.

**Opción A — con `wrangler` (línea de comandos):**

```bash
cd Mesura-landing
npx wrangler pages deploy . --project-name=mesura-landing
```

Pide login la primera vez (`npx wrangler login`) — la misma cuenta de Cloudflare
del Worker de Mesura. `wrangler` compila y sube la Function junto con lo estático.

**Opción B — conectado a este repo de Git (deploys automáticos en cada push):**

1. En el dashboard: **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Elige este repo (`Landingpagemesura`). Sin build command (déjalo vacío),
   **Build output directory: `/`**.
3. Cada push a la rama configurada dispara un deploy, Function incluida.

## Lista de espera — ya configurada ✔

El KV namespace `mesura-waitlist` ya existe y está enlazado como `WAITLIST` vía
`wrangler.jsonc` (el binding se aplica automáticamente en cada
`wrangler pages deploy`). No hay pasos pendientes: el formulario en producción
guarda correos de verdad.

Si algún día hay que recrearlo desde cero: crear el namespace
(`npx wrangler kv namespace create mesura-waitlist`) y poner su `id` en el bloque
`kv_namespaces` de `wrangler.jsonc`.

> **Al hacer QA del formulario, usa siempre un mock local de `/api/waitlist`.**
> Apuntar las pruebas al endpoint real escribe correos de prueba en el KV de
> producción y puede disparar avisos por Gmail.

### ¿Dónde "llegan" los correos?

No llegan a un buzón: quedan guardados en ese KV namespace, uno por correo
(reinscribirse no duplica). Para verlos:

- **Dashboard**: Storage & Databases → KV → `mesura-waitlist` → pestaña **KV pairs**.
  Cada clave es `email:tu@correo.com` y el valor trae la fecha de inscripción.
- **Terminal**: `npx wrangler kv key list --namespace-id=<id>` (el id aparece en el
  dashboard junto al namespace).

## Notificación de solicitudes + invitación con un clic

Además de guardarse en KV, cada correo **nuevo** puede disparar un aviso a tu
Gmail con un botón "Aprobar y enviar invitación": al hacer clic, el solicitante
recibe automáticamente un correo HTML con el código de invitación y el enlace a
`/signup`. El flujo completo:

```
visitante deja su correo → KV (siempre) → Apps Script → aviso a tu Gmail
                                              ↓ (clic en "Aprobar")
                              correo HTML de invitación al solicitante
```

Implementado en `google-apps-script/MesuraWaitlist.gs` (proyecto de Apps Script
**separado** del Mesura.gs principal, para no tocar sus versiones). La
aprobación usa enlaces firmados con HMAC que vencen a los 30 días; rechazar es
simplemente ignorar el aviso. Reinscribirse no genera avisos duplicados.

**Puesta en marcha (una vez, ~5 minutos):**

1. En [script.google.com](https://script.google.com) (con la cuenta
   mrifo2808@gmail.com): **Nuevo proyecto** → pegar el contenido completo de
   `google-apps-script/MesuraWaitlist.gs`.
2. En ⚙ Configuración del proyecto → **Propiedades del script**, crear:
   - `SECRET`: un secreto largo inventado (se repetirá en el paso 5).
   - `NOTIFY_EMAIL`: el correo donde quieres recibir las solicitudes.
   - `INVITE_CODE`: el código que irá en el correo de invitación (p. ej. el
     `SIGNUP_CODE` global de Mesura).
   - `APP_URL`: `https://mesura.mrifo2808.workers.dev`.
3. Ejecutar una vez `autorizarCorreo()` desde el editor (▶ Run) para conceder
   el permiso de Gmail — llega un correo de confirmación.
4. **Implementar → Nueva implementación → Aplicación web** → Ejecutar como
   **yo**, acceso: **cualquier persona** → copiar la URL `/exec`.
5. Conectar la landing con el script:
   ```bash
   npx wrangler pages secret put NOTIFY_SECRET --project-name=mesura-landing   # el mismo SECRET del paso 2
   ```
   y en el dashboard del proyecto de Pages (Settings → Variables) agregar la
   variable `NOTIFY_WEBHOOK_URL` con la URL `/exec` del paso 4. Redeploy.

Sin estos pasos todo lo demás sigue funcionando: los correos quedan en KV y
simplemente no llega el aviso.

## Dominio propio (opcional)

En el proyecto de Pages → pestaña **Custom domains** puedes conectar algo como
`mesura.tudominio.com` — Cloudflare gestiona el certificado SSL solo.

## Notas

- Los links de "Términos de uso" y "Privacidad" del pie apuntan a las páginas
  reales de producción (`mesura.mrifo2808.workers.dev/terminos` y `/privacidad`).
- El registro sigue en modo invitación (`SIGNUP_MODE=invite_only`), por eso la
  landing ya no enlaza a `/signup` desde un CTA principal: todos los caminos
  llevan a la lista de espera. El enlace directo a "Iniciar sesión" queda en el
  pie, para quien ya tiene cuenta.
- Al tocar el copy, revisa antes
  [`docs/redesign/CLAIM_INVENTORY.md`](docs/redesign/CLAIM_INVENTORY.md): varias
  frases están redactadas de forma deliberadamente precisa (mediana vs. promedio,
  el denominador del 31%, el resumen semanal como opt-out) y "simplificarlas" las
  vuelve falsas.
