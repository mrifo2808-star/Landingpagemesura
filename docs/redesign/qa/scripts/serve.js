/**
 * Levanta el servidor local y lo deja corriendo, para mirar la pagina a mano
 * con los headers reales de `_headers` y el mock de /api/waitlist.
 *
 * `npm run serve` — Ctrl+C para cortar.
 */
import { levantar } from "../lib/server.js";

const puerto = Number(process.env.PUERTO || 4173);
const { url, correos } = await levantar({ puerto });

console.log(`Landing en ${url}`);
console.log("  · headers reales de _headers, CSP incluida");
console.log("  · /assets/* con caché de un año, gzip en lo comprimible");
console.log("  · /docs/* redirige 301 a /");
console.log("  · /api/waitlist es un MOCK en memoria: no toca el KV de producción");
console.log("\nCtrl+C para cortar.");

process.on("SIGINT", () => {
  if (correos.size) {
    console.log(`\nCorreos que recibió el mock (${correos.size}, en memoria, se pierden ahora):`);
    for (const k of correos.keys()) console.log("  · " + k);
  }
  process.exit(0);
});
