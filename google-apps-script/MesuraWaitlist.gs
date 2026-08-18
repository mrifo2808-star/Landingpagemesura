/**
 * Mesura — Lista de espera (Apps Script) — versión 1
 *
 * Proyecto de Apps Script SEPARADO del Mesura.gs principal, para no
 * interferir con sus versiones y despliegues. Hace dos cosas:
 *
 *  1. doPost(action: "waitlist_request"): lo llama la Cloudflare Pages
 *     Function de la landing cada vez que alguien deja su correo. Envía una
 *     notificación por Gmail al dueño (NOTIFY_EMAIL) con un botón "Aprobar".
 *  2. doGet(action: "approve"): al hacer clic en "Aprobar", valida la firma
 *     HMAC del enlace y envía al solicitante el correo HTML de invitación
 *     con el código (INVITE_CODE) y el enlace a la app.
 *
 * CONFIGURACIÓN (Archivo → Propiedades del proyecto → Propiedades del script):
 *  - SECRET        secreto compartido con la Pages Function (NOTIFY_SECRET).
 *  - NOTIFY_EMAIL  correo del dueño que recibe las solicitudes.
 *  - INVITE_CODE   código de invitación que va en el correo de invitación
 *                  (el SIGNUP_CODE global de Mesura, o el que se prefiera).
 *  - APP_URL       URL base de la app, ej: https://mesura.mrifo2808.workers.dev
 *
 * DESPLIEGUE: Implementar → Nueva implementación → Aplicación web →
 * "Ejecutar como: yo" + "Acceso: cualquier persona". Copiar la URL /exec
 * resultante a la variable NOTIFY_WEBHOOK_URL del proyecto de Pages.
 * Recordar (igual que con Mesura.gs): cada edición requiere redesplegar
 * como "Nueva versión", y la primera ejecución pide autorizar Gmail —
 * correr una vez la función autorizarCorreo() desde el editor (▶ Run).
 */

const PROPERTIES = PropertiesService.getScriptProperties();
const VERSION = 1;
const APPROVE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

/* Ejecutar una vez a mano desde el editor para conceder el permiso de Gmail. */
function autorizarCorreo() {
  const me = Session.getActiveUser().getEmail();
  MailApp.sendEmail(me, 'Mesura lista de espera — permiso OK',
    'Este correo confirma que el script puede enviar correos. Versión ' + VERSION + '.');
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action === 'approve') return handleApprove_(params);
  return jsonResponse_({ ok: true, service: 'mesura-waitlist', version: VERSION });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const secret = PROPERTIES.getProperty('SECRET') || '';
    if (!secret || body.secret !== secret) {
      return jsonResponse_({ ok: false, error: 'No autorizado' });
    }
    if (body.action !== 'waitlist_request') {
      return jsonResponse_({ ok: false, error: 'Acción desconocida' });
    }
    const email = normalizeEmail_(body.email);
    if (!isValidEmail_(email)) return jsonResponse_({ ok: false, error: 'Correo inválido' });

    sendOwnerNotification_(email);
    return jsonResponse_({ ok: true, action: 'waitlist_request' });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String((err && err.message) || err) });
  }
}

/* ---------- Notificación al dueño ---------- */

function sendOwnerNotification_(applicantEmail) {
  const notifyEmail = PROPERTIES.getProperty('NOTIFY_EMAIL') || Session.getActiveUser().getEmail();
  const exp = Date.now() + APPROVE_TTL_MS;
  const approveUrl = ScriptApp.getService().getUrl()
    + '?action=approve'
    + '&email=' + encodeURIComponent(applicantEmail)
    + '&exp=' + exp
    + '&sig=' + signApprove_(applicantEmail, exp);

  const fecha = Utilities.formatDate(new Date(), 'America/Santiago', "dd-MM-yyyy HH:mm 'hrs'");
  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;border:3px solid #111;background:#f4f0e8;">' +
    '  <div style="background:#dfff42;border-bottom:3px solid #111;padding:16px 20px;">' +
    '    <div style="font-size:20px;font-weight:900;letter-spacing:-1px;color:#111;">MESURA</div>' +
    '    <div style="font-size:11px;font-weight:bold;color:#111;">NUEVA SOLICITUD DE INVITACIÓN</div>' +
    '  </div>' +
    '  <div style="padding:20px;">' +
    '    <p style="margin:0 0 6px;font-size:14px;color:#111;">Alguien dejó su correo en la landing:</p>' +
    '    <p style="margin:0 0 4px;font-size:18px;font-weight:bold;color:#111;">' + escapeHtml_(applicantEmail) + '</p>' +
    '    <p style="margin:0 0 18px;font-size:12px;color:#6a675f;">' + fecha + ' · Chile</p>' +
    '    <a href="' + approveUrl + '" style="display:inline-block;background:#111;color:#fffdf8;border:3px solid #111;padding:13px 22px;font-size:14px;font-weight:bold;text-decoration:none;">✓ Aprobar y enviar invitación</a>' +
    '    <p style="margin:16px 0 0;font-size:12px;color:#6a675f;">Al aprobar, esta persona recibirá automáticamente el correo de invitación con el código de acceso. Para rechazar, simplemente ignora este mensaje (el enlace vence en 30 días).</p>' +
    '  </div>' +
    '</div>';

  MailApp.sendEmail({
    to: notifyEmail,
    subject: 'Mesura — nueva solicitud: ' + applicantEmail,
    htmlBody: html,
    body: 'Nueva solicitud de invitación: ' + applicantEmail + '\nAprobar: ' + approveUrl,
    name: 'Mesura'
  });
}

/* ---------- Aprobación → correo de invitación ---------- */

function handleApprove_(params) {
  const email = normalizeEmail_(params.email || '');
  const exp = Number(params.exp || 0);
  const sig = String(params.sig || '');

  if (!isValidEmail_(email)) return htmlPage_('Solicitud inválida', 'El correo del enlace no es válido.');
  if (!exp || Date.now() > exp) return htmlPage_('Enlace vencido', 'Este enlace de aprobación expiró (dura 30 días). Pide a la persona que se inscriba de nuevo en la landing.');
  if (sig !== signApprove_(email, exp)) return htmlPage_('Firma inválida', 'El enlace no es auténtico o fue modificado. No se envió nada.');

  sendInvitationEmail_(email);
  return htmlPage_('Invitación enviada ✓',
    'Se envió el correo de invitación a <b>' + escapeHtml_(email) + '</b>. ' +
    'Si vuelves a hacer clic en el mismo enlace, la invitación se reenvía.');
}

function sendInvitationEmail_(applicantEmail) {
  const code = PROPERTIES.getProperty('INVITE_CODE') || '';
  const appUrl = (PROPERTIES.getProperty('APP_URL') || 'https://mesura.mrifo2808.workers.dev').replace(/\/$/, '');
  const signupUrl = appUrl + '/signup';

  const codeBlock = code
    ? '<div style="margin:18px 0;padding:14px;border:2px dashed #111;background:#dfff42;text-align:center;">' +
      '  <div style="font-size:11px;font-weight:bold;color:#111;letter-spacing:2px;">TU CÓDIGO DE INVITACIÓN</div>' +
      '  <div style="font-size:26px;font-weight:900;letter-spacing:3px;color:#111;font-family:Consolas,Menlo,monospace;">' + escapeHtml_(code) + '</div>' +
      '</div>'
    : '';

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;border:3px solid #111;background:#f4f0e8;">' +
    '  <div style="background:#dfff42;border-bottom:3px solid #111;padding:18px 22px;">' +
    '    <div style="font-size:24px;font-weight:900;letter-spacing:-1px;color:#111;">MESURA</div>' +
    '    <div style="font-size:11px;font-weight:bold;color:#111;letter-spacing:1px;">FINANZAS SIN RUIDO</div>' +
    '  </div>' +
    '  <div style="padding:22px;">' +
    '    <p style="margin:0 0 12px;font-size:18px;font-weight:bold;color:#111;">Tu invitación está lista.</p>' +
    '    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#111;">Gracias por tu interés en Mesura. Ya hay un cupo disponible para ti: crea tu cuenta con este código y empieza a ordenar tus finanzas hoy mismo.</p>' +
    codeBlock +
    '    <a href="' + signupUrl + '" style="display:inline-block;background:#111;color:#fffdf8;border:3px solid #111;padding:14px 24px;font-size:15px;font-weight:bold;text-decoration:none;">Crear mi cuenta →</a>' +
    '    <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#6a675f;">En la página de registro, ingresa el código en el campo "Código de invitación". Mesura es gratuita, sin publicidad y tus datos son siempre exportables. Si no solicitaste esta invitación, puedes ignorar este correo.</p>' +
    '  </div>' +
    '  <div style="border-top:3px solid #111;padding:12px 22px;font-size:11px;color:#6a675f;">Mesura · Finanzas personales · ' + escapeHtml_(appUrl) + '</div>' +
    '</div>';

  MailApp.sendEmail({
    to: applicantEmail,
    subject: 'Tu invitación a Mesura está lista',
    htmlBody: html,
    body: 'Tu invitación a Mesura está lista. Código: ' + code + '\nCrea tu cuenta en: ' + signupUrl,
    name: 'Mesura'
  });
}

/* ---------- Utilidades ---------- */

function signApprove_(email, exp) {
  const secret = PROPERTIES.getProperty('SECRET') || '';
  const bytes = Utilities.computeHmacSha256Signature(email + '|' + exp, secret);
  return bytes.map(function (b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
}

function normalizeEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
}

function escapeHtml_(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function htmlPage_(title, message) {
  return HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:40px auto;border:3px solid #111;background:#f4f0e8;">' +
    '  <div style="background:#dfff42;border-bottom:3px solid #111;padding:14px 20px;font-size:18px;font-weight:900;color:#111;">MESURA</div>' +
    '  <div style="padding:20px;color:#111;"><h2 style="margin:0 0 10px;font-size:18px;">' + title + '</h2>' +
    '  <p style="margin:0;font-size:14px;line-height:1.6;">' + message + '</p></div>' +
    '</div>'
  ).setTitle('Mesura — ' + title);
}
