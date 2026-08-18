# Mesura — Landing page

**En producción:** https://mesura-landing.pages.dev

Landing page estática (un solo `index.html`, CSS inline, JS vanilla sin dependencias)
para presentar Mesura antes de que alguien entre a la app, más una Cloudflare Pages
Function mínima que guarda los correos de la lista de espera.

Cosas que trae y no son obvias a primera vista:

- **El teléfono del hero es una demo interactiva**, no una imagen. Todo el teléfono
  responde al clic: el botón "＋" (que pulsa para llamar la atención) y las tarjetas
  de categoría abren el registro de gasto (las tarjetas dejan la categoría ya
  elegida); las zonas que en la app real navegan a otra pantalla (Presupuesto,
  Movimientos, Perfil, sincronización) muestran un aviso que explica qué harían y
  reactivan el pulso del "＋". El disponible, la barra y las categorías se
  actualizan con la misma lógica de la app real, incluido el estado rojo de
  sobregiro. Nada se persiste.
- **El formulario de la lista de espera guarda correos de verdad** vía
  `functions/api/waitlist.js` (ver configuración abajo). Trae honeypot anti-bots y,
  si el endpoint falla, muestra un error honesto en vez de fingir éxito.
- **Modo oscuro automático** vía `prefers-color-scheme`, usando la paleta
  "Mesura Dark Soft" real de la app (los mismos tokens de `app/globals.css`).
- Ticker de movimientos, FAQ con `<details>` nativos (mismo patrón de acordeón que
  usa la app en Perfil) y sección "Tus datos" — todo lo que afirma esa sección
  (respaldo .xlsx, hoja de Google compartida con el usuario, exportar/eliminar,
  IA opt-in apagada por defecto) es funcionalidad real ya implementada en la app.
  Nota de precisión: la hoja de Sheets vive en el Drive del operador de Mesura
  (patrón del Apps Script) y se comparte al usuario como lector — por eso la
  landing dice "compartida solo contigo", no "en tu propio Drive".

## Archivos

- `index.html` — la landing completa (hero con demo, ticker, problema, funciones, tus datos, cómo funciona, FAQ, CTA, footer).
- `functions/api/waitlist.js` — Pages Function `POST /api/waitlist`: valida el correo y lo guarda en KV.
- `_redirects` — cualquier ruta desconocida sirve `index.html` (las Functions tienen prioridad sobre esto, `/api/*` no se ve afectada).
- `_headers` — headers de seguridad básicos para Cloudflare Pages.

## Publicar en Cloudflare Pages (gratis)

> **Importante:** como ahora hay una Function (`functions/`), el deploy por
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

### ¿Dónde "llegan" los correos?

No llegan a un buzón: quedan guardados en ese KV namespace, uno por correo
(reinscribirse no duplica). Para verlos:

- **Dashboard**: Storage & Databases → KV → `mesura-waitlist` → pestaña **KV pairs**.
  Cada clave es `email:tu@correo.com` y el valor trae la fecha de inscripción.
- **Terminal**: `npx wrangler kv key list --namespace-id=<id>` (el id aparece en el
  dashboard junto al namespace).

Si más adelante quieres recibir un aviso por correo con cada inscripción, el camino
natural es que la Function llame también al Google Apps Script de Mesura (que ya
sabe enviar correos con `MailApp`) — requiere agregarle una acción nueva al `.gs` y
configurar `GOOGLE_SCRIPT_URL`/`GOOGLE_SYNC_SECRET` como variables del proyecto de
Pages. No está implementado aún.

## Dominio propio (opcional)

En el proyecto de Pages → pestaña **Custom domains** puedes conectar algo como
`mesura.tudominio.com` — Cloudflare gestiona el certificado SSL solo.

## Notas

- Los links de "Términos de uso" y "Privacidad" del footer apuntan a las páginas
  reales de producción (`mesura.mrifo2808.workers.dev/terminos` y `/privacidad`).
- El botón "Empieza gratis" enlaza directo a `/signup` de producción. Como el
  registro sigue en modo invitación (`SIGNUP_MODE=invite_only`), alguien sin código
  verá el error de invitación — por eso el hero incluye la nota "Acceso por
  invitación" y el CTA final empuja hacia la lista de espera. Si se abre el
  registro público más adelante, esa nota se puede sacar.
