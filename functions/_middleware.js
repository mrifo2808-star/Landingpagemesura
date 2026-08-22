/**
 * Fija la moneda del ejemplo ANTES de que el HTML llegue al navegador, para que el
 * escaparate no parpadee: el primer bloque de la página es el que se juega la
 * credibilidad y no puede pintarse dos veces (primero en una moneda, después en otra).
 *
 * Orden de resolución — igual que assets/js/mesura-datos.v2.js:resolverMoneda:
 *   1. ?m=<código o país>  → gana siempre, y viaja en la URL si el lector comparte el link
 *   2. CF-IPCountry        → valor por defecto
 *   3. CLP                 → si los dos anteriores fallan
 *
 * No se guarda el país en ninguna parte: se lee del encabezado, se usa para elegir un
 * atributo y se descarta — igual que functions/api/waitlist.js no guarda IP ni
 * user-agent. Esa no es una omisión mejorable: es la promesa de la sección 04.
 */
import { MONEDAS, PAIS_A_MONEDA, MONEDA_POR_DEFECTO, calcular } from "../assets/js/mesura-datos.v2.js";

/**
 * Identificador de build: distingue "está roto" de "estás viendo una versión
 * vieja" sin necesitar una investigación completa cada vez. Cloudflare Pages
 * expone CF_PAGES_COMMIT_SHA y CF_PAGES_BRANCH automáticamente en cada
 * deploy, sin build step ni configuración — no hay que acordarse de nada.
 * En local (wrangler pages dev) esas variables no existen y cae a "local",
 * que es exactamente lo que hay que ver ahí. Nació el 21 de agosto de un
 * reporte de bug que resultó ser una versión vieja en caché del navegador:
 * ver VALIDAR.md §2.
 */
function resolverBuild(env) {
  const sha = env.CF_PAGES_COMMIT_SHA;
  if (!sha) return { corta: "local", etiqueta: "Compilación local" };
  const corta = sha.slice(0, 7);
  const rama = env.CF_PAGES_BRANCH;
  return { corta, etiqueta: `Compilación ${corta}${rama ? ` (${rama})` : ""}` };
}

export async function onRequest(context) {
  const res = await context.next();
  const build = resolverBuild(context.env);
  const tipo = res.headers.get("content-type") || "";
  if (!tipo.includes("text/html")) {
    // Los headers de lo que devuelve context.next() vienen inmutables (salen
    // del asset store de Pages): hay que reenvolver la respuesta antes de
    // poder agregar uno.
    const conBuild = new Response(res.body, res);
    conBuild.headers.set("X-Mesura-Build", build.corta);
    return conBuild;
  }

  const url = new URL(context.request.url);
  const eleccionCruda = String(url.searchParams.get("m") ?? "").trim().toUpperCase();
  const pais = (context.request.headers.get("CF-IPCountry") || "").toUpperCase();

  const codigo =
    (MONEDAS[eleccionCruda] ? eleccionCruda : null) ??
    (PAIS_A_MONEDA[eleccionCruda] ?? null) ??
    PAIS_A_MONEDA[pais] ??
    MONEDA_POR_DEFECTO;

  const mon = MONEDAS[codigo];
  const e = calcular(codigo);
  const descripcion =
    `Anotas lo que gastas, ves cuánto te queda por día para llegar a fin de mes, y llevas la cuenta ` +
    `de lo que pagas a medias con alguien. En ${mon.nombre}. Sin conectar tu banco, sin publicidad y sin vender datos.`;
  const alt = `Pantalla de Inicio de Mesura: quedan ${e.f(e.queda)} del presupuesto del mes y el aviso de que vas ${e.f(Math.abs(e.desvio))} por delante del ritmo.`;

  const rewriter = new HTMLRewriter()
    .on("html", {
      element(el) {
        el.setAttribute("data-moneda", codigo);
        el.setAttribute("data-build", build.corta);
      },
    })
    .on('meta[name="description"]', { element(el) { el.setAttribute("content", descripcion); } })
    .on('meta[property="og:description"]', { element(el) { el.setAttribute("content", descripcion); } })
    .on('meta[name="twitter:description"]', { element(el) { el.setAttribute("content", descripcion); } })
    .on('meta[property="og:locale"]', { element(el) { el.setAttribute("content", mon.locale.replace("-", "_")); } })
    .on('meta[property="og:image:alt"]', { element(el) { el.setAttribute("content", alt); } })
    .on("#foot-build", { element(el) { el.setInnerContent(build.etiqueta); } });

  const transformada = rewriter.transform(res);
  // La caché de Pages no puede servirle a un peruano el HTML que ya resolvió para un
  // chileno: es el fallo más probable de esta implementación si se olvida.
  transformada.headers.append("Vary", "CF-IPCountry");
  transformada.headers.set("X-Mesura-Build", build.corta);
  return transformada;
}
