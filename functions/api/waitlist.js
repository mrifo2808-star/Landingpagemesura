/**
 * POST /api/waitlist — Cloudflare Pages Function.
 *
 * Guarda el correo de la lista de espera en el KV namespace enlazado como
 * `WAITLIST` en el proyecto de Pages (Settings → Bindings → KV namespace).
 * Ver README.md para los dos pasos de configuración.
 *
 * Deliberadamente no guarda IP ni user-agent — la landing promete "sin venta
 * de datos" y lo mínimo necesario acá es el correo y la fecha. Eso no es una
 * omisión que convenga "mejorar": es la promesa escrita en la sección "El trato
 * con tus datos".
 *
 * El contrato con el frontend no cambia: POST { email, website }, honeypot,
 * idempotencia por correo, respuestas { ok } o { error } con el mensaje en
 * español.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* El cuerpo legítimo son dos campos y el correo tope mide 254 caracteres: con
   holgura son unos 300 bytes. 1 KB deja margen de sobra y evita leer —y
   parsear— cualquier cosa mayor. */
const MAX_BODY = 1024;

/**
 * Cualquier método que no sea POST. Es un endpoint de un solo verbo, así que
 * corresponde 405 con Allow y no el 404 genérico del comodín de Pages.
 * OPTIONS también responde 405: la landing es del mismo origen y nunca dispara
 * un preflight; no hay CORS que conceder.
 */
export function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ error: "Método no permitido" }, 405, { Allow: "POST" });
}

export async function onRequestPost({ request, env, waitUntil }) {
  // Content-Type antes de leer nada: el frontend manda application/json y no
  // hay ninguna otra forma legítima de llegar acá. Cerrarlo además impide que
  // un formulario de otro origen publique aquí, que es lo único que la CSP
  // form-action no alcanza a cubrir.
  const tipo = (request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (tipo !== "application/json") {
    return json({ error: "Formato no admitido" }, 415);
  }

  // Content-Length no es de fiar por sí solo —puede faltar o mentir— así que se
  // usa como filtro barato y el largo real se vuelve a comprobar tras leer.
  const declarado = Number(request.headers.get("content-length"));
  if (Number.isFinite(declarado) && declarado > MAX_BODY) {
    return json({ error: "Cuerpo demasiado grande" }, 413);
  }

  let crudo;
  try {
    crudo = await request.text();
  } catch {
    return json({ error: "Cuerpo inválido" }, 400);
  }
  if (crudo.length > MAX_BODY) {
    return json({ error: "Cuerpo demasiado grande" }, 413);
  }

  let body;
  try {
    body = JSON.parse(crudo);
  } catch {
    return json({ error: "Cuerpo inválido" }, 400);
  }
  // JSON.parse acepta `null`, `3` y `"hola"`: todos rompen el acceso a body.email.
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "Cuerpo inválido" }, 400);
  }

  // Honeypot: el campo "website" es invisible para personas; si viene con
  // contenido es un bot y se responde éxito sin guardar nada.
  if (body.website) return json({ ok: true });

  const email = String(body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ error: "Correo inválido" }, 400);
  }

  if (!env.WAITLIST) {
    // Sin binding configurado el frontend muestra su mensaje de error genérico
    // en vez de fingir que el correo quedó guardado.
    return json({ error: "Lista de espera no configurada" }, 503);
  }

  // Clave por correo: reinscribirse es idempotente, no duplica entradas.
  const key = "email:" + email;
  const alreadyRegistered = await env.WAITLIST.get(key);
  await env.WAITLIST.put(key, JSON.stringify({ at: new Date().toISOString() }));

  // Notificación al dueño vía el Apps Script de lista de espera
  // (google-apps-script/MesuraWaitlist.gs). Solo para correos NUEVOS — una
  // reinscripción no genera otro aviso. Corre en waitUntil y con su propio
  // try/catch: si el aviso falla, la inscripción igual queda guardada.
  if (!alreadyRegistered && env.NOTIFY_WEBHOOK_URL && env.NOTIFY_SECRET) {
    waitUntil(
      fetch(env.NOTIFY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "waitlist_request",
          secret: env.NOTIFY_SECRET,
          email,
        }),
      }).catch(() => {})
    );
  }

  return json({ ok: true });
}

function json(data, status = 200, extra) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });
}
