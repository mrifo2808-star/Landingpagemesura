/**
 * POST /api/waitlist — Cloudflare Pages Function.
 *
 * Guarda el correo de la lista de espera en el KV namespace enlazado como
 * `WAITLIST` en el proyecto de Pages (Settings → Bindings → KV namespace).
 * Ver README.md para los dos pasos de configuración.
 *
 * Deliberadamente no guarda IP ni user-agent — la landing promete "sin venta
 * de datos" y lo mínimo necesario acá es el correo y la fecha.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function onRequestPost({ request, env, waitUntil }) {
  let body;
  try {
    body = await request.json();
  } catch {
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
