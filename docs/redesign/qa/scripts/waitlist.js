/**
 * Contrato de functions/api/waitlist.js, ejecutado en Node con un KV falso.
 *
 * NO toca el endpoint real: escribir en el KV de produccion dispara un correo
 * al dueno. Aqui se importa el modulo y se le pasa un env de mentira, asi que
 * no hay red de por medio.
 */
import { onRequest } from "../../../../functions/api/waitlist.js";

function kvFalso() {
  const datos = new Map();
  return {
    datos,
    get: async (k) => datos.get(k) ?? null,
    put: async (k, v) => void datos.set(k, v),
  };
}

function peticion(cuerpo, { metodo = "POST", tipo = "application/json" } = {}) {
  const headers = {};
  if (tipo) headers["Content-Type"] = tipo;
  const init = { method: metodo, headers };
  if (metodo !== "GET" && metodo !== "HEAD" && cuerpo !== undefined) init.body = cuerpo;
  return new Request("https://mesura-landing.pages.dev/api/waitlist", init);
}

const casos = [];
const prueba = (nombre, fn) => casos.push({ nombre, fn });

const llamar = (req, env) => onRequest({ request: req, env, waitUntil: () => {} });

/* ---- Contrato que ya existia y no puede cambiar ------------------------- */

prueba("POST con correo valido responde 200 { ok: true } y lo guarda", async () => {
  const WAITLIST = kvFalso();
  const r = await llamar(peticion(JSON.stringify({ email: "Ana@Ejemplo.CL", website: "" })), { WAITLIST });
  igual(r.status, 200);
  igual(JSON.stringify(await r.json()), JSON.stringify({ ok: true }));
  igual(WAITLIST.datos.has("email:ana@ejemplo.cl"), true, "normaliza a minusculas");
});

prueba("reinscribirse es idempotente: una sola clave", async () => {
  const WAITLIST = kvFalso();
  for (let i = 0; i < 3; i++) {
    await llamar(peticion(JSON.stringify({ email: "ana@ejemplo.cl" })), { WAITLIST });
  }
  igual(WAITLIST.datos.size, 1);
});

prueba("honeypot: responde ok y NO guarda nada", async () => {
  const WAITLIST = kvFalso();
  const r = await llamar(peticion(JSON.stringify({ email: "bot@ejemplo.cl", website: "http://spam" })), { WAITLIST });
  igual(r.status, 200);
  igual(WAITLIST.datos.size, 0);
});

prueba("correo invalido responde 400 { error } en espanol", async () => {
  const r = await llamar(peticion(JSON.stringify({ email: "no-es-correo" })), { WAITLIST: kvFalso() });
  igual(r.status, 400);
  igual((await r.json()).error, "Correo inválido");
});

prueba("sin binding responde 503 y no finge exito", async () => {
  const r = await llamar(peticion(JSON.stringify({ email: "ana@ejemplo.cl" })), {});
  igual(r.status, 503);
  igual((await r.json()).error, "Lista de espera no configurada");
});

prueba("no guarda IP ni user-agent: solo la fecha y la preferencia de ingreso", async () => {
  const WAITLIST = kvFalso();
  await llamar(peticion(JSON.stringify({ email: "ana@ejemplo.cl" })), { WAITLIST });
  const guardado = JSON.parse([...WAITLIST.datos.values()][0]);
  igual(JSON.stringify(Object.keys(guardado)), JSON.stringify(["at", "ingreso"]));
  igual(guardado.ingreso, null, "sin 'ingreso' en el cuerpo debería guardarse null, no inventado");
});

prueba("'ingreso' sólo se guarda si es uno de los dos valores válidos", async () => {
  const WAITLIST = kvFalso();
  await llamar(peticion(JSON.stringify({ email: "ana@ejemplo.cl", ingreso: "fijas" })), { WAITLIST });
  igual(JSON.parse([...WAITLIST.datos.values()][0]).ingreso, "fijas");

  const WAITLIST2 = kvFalso();
  await llamar(peticion(JSON.stringify({ email: "bruno@ejemplo.cl", ingreso: "<script>" })), { WAITLIST: WAITLIST2 });
  igual(JSON.parse([...WAITLIST2.datos.values()][0]).ingreso, null, "un valor fuera de la lista blanca debería descartarse en silencio");
});

/* ---- Endurecimiento de esta rama ---------------------------------------- */

for (const metodo of ["GET", "PUT", "DELETE", "OPTIONS", "PATCH"]) {
  prueba(`${metodo} responde 405 con Allow: POST`, async () => {
    const r = await llamar(peticion(undefined, { metodo }), { WAITLIST: kvFalso() });
    igual(r.status, 405);
    igual(r.headers.get("Allow"), "POST");
    igual((await r.json()).error, "Método no permitido");
  });
}

prueba("Content-Type que no es JSON responde 415 sin parsear", async () => {
  const WAITLIST = kvFalso();
  const r = await llamar(
    peticion("email=ana@ejemplo.cl", { tipo: "application/x-www-form-urlencoded" }),
    { WAITLIST }
  );
  igual(r.status, 415);
  igual((await r.json()).error, "Formato no admitido");
  igual(WAITLIST.datos.size, 0);
});

prueba("application/json con charset sigue siendo valido", async () => {
  const r = await llamar(
    peticion(JSON.stringify({ email: "ana@ejemplo.cl" }), { tipo: "application/json; charset=utf-8" }),
    { WAITLIST: kvFalso() }
  );
  igual(r.status, 200);
});

prueba("cuerpo de mas de 1 KB responde 413", async () => {
  const WAITLIST = kvFalso();
  const relleno = "a".repeat(2000);
  const r = await llamar(peticion(JSON.stringify({ email: "ana@ejemplo.cl", relleno })), { WAITLIST });
  igual(r.status, 413);
  igual((await r.json()).error, "Cuerpo demasiado grande");
  igual(WAITLIST.datos.size, 0, "no llego a guardar");
});

prueba("JSON roto responde 400", async () => {
  const r = await llamar(peticion("{no es json"), { WAITLIST: kvFalso() });
  igual(r.status, 400);
  igual((await r.json()).error, "Cuerpo inválido");
});

prueba("JSON valido que no es objeto responde 400 y no revienta", async () => {
  for (const c of ["null", "3", '"hola"', "[1,2]"]) {
    const r = await llamar(peticion(c), { WAITLIST: kvFalso() });
    igual(r.status, 400, `cuerpo ${c}`);
  }
});

prueba("correo de mas de 254 caracteres responde 400", async () => {
  const largo = "a".repeat(250) + "@ejemplo.cl";
  const r = await llamar(peticion(JSON.stringify({ email: largo })), { WAITLIST: kvFalso() });
  igual(r.status, 400);
});

/* ---- Arnes -------------------------------------------------------------- */

let fallos = 0;
function igual(a, b, nota) {
  if (a !== b) {
    fallos++;
    throw new Error(`esperaba ${JSON.stringify(b)}, llegó ${JSON.stringify(a)}${nota ? ` — ${nota}` : ""}`);
  }
}

let ok = 0;
for (const c of casos) {
  try {
    await c.fn();
    ok++;
    console.log(`  ok   ${c.nombre}`);
  } catch (e) {
    console.log(`  FALLA ${c.nombre}: ${e.message}`);
  }
}
console.log(`\nwaitlist: ${ok}/${casos.length}`);
process.exitCode = ok === casos.length ? 0 : 1;
