/**
 * FUENTE ÚNICA del ejemplo de la landing — un solo sitio, un solo juego de datos.
 * Ninguna cifra del ejemplo se escribe a mano en el HTML: todas salen de este módulo.
 *
 * Puerto directo de Mesura-lanzamiento/landing-v3/ejemplo/ejemplo.js, que
 * `verificar.js` audita contra los dos repos de la app (calendario, divisibilidad
 * por los días del mes, disparo de la alerta en las dos superficies, exponentes de
 * moneda). Si cambias un número aquí, corre ese script antes de publicar.
 *
 * Se usa en dos sitios que tienen que coincidir: `functions/_middleware.js` (Cloudflare
 * Pages Function, para fijar la moneda y los metadatos ANTES de que el HTML llegue al
 * navegador) y `assets/js/demo.js` (el ejemplo interactivo). Por eso es un módulo ES
 * plano, sin nada específico de un entorno: los dos lo importan igual.
 */

// El mes del ejemplo. Cambiarlo obliga a volver a correr verificar.js: los nombres de
// los días se calculan, no se escriben.
export const ANIO = 2026, MES = 8, DIA = 18;

/**
 * Exponentes y locales copiados de app/lib/money.ts (web). USD y EUR existen en el
 * registro de monedas de la app pero el producto los está retirando de las elegibles
 * (Mesura-mobile/lib/money.ts:96) — un ejemplo en una moneda que no se puede elegir
 * rompe la regla del escaparate, así que no están aquí a propósito.
 */
export const MONEDAS = {
  CLP: { locale: "es-CL", exp: 0, nombre: "pesos chilenos" },
  PEN: { locale: "es-PE", exp: 2, nombre: "soles" },
  ARS: { locale: "es-AR", exp: 2, nombre: "pesos argentinos" },
  MXN: { locale: "es-MX", exp: 2, nombre: "pesos mexicanos" },
  COP: { locale: "es-CO", exp: 0, nombre: "pesos colombianos" },
  VES: { locale: "es-VE", exp: 2, nombre: "bolívares" },
};

/**
 * El único número que se mantiene a mano por moneda, en unidades mínimas. Es un
 * presupuesto de gastos VARIABLES del mes: no incluye vivienda. Ninguno es divisible
 * por 31 — lo comprueba verificar.js.
 */
export const PRESUPUESTO = {
  CLP: 487300, PEN: 186500, ARS: 129740000, MXN: 2718000, COP: 1734500, VES: 1462000,
};

/** Reparto del gasto acumulado al día 18, como fracción del presupuesto. */
export const REPARTO = [
  { clave: "super", etiqueta: "Supermercado", color: "#ff5c00", fraccion: 0.2807 },
  { clave: "transporte", etiqueta: "Transporte", color: "#1f4fd8", fraccion: 0.0949 },
  { clave: "carrete", etiqueta: "Salidas", color: "#8a5cf6", fraccion: 0.1268 },
  { clave: "casa", etiqueta: "Casa", color: "#0f9d58", fraccion: 0.1768 },
];

/** Los cuatro últimos movimientos, como fracción del presupuesto. */
export const MOVIMIENTOS = [
  { dia: 16, titulo: "Feria de la Vega", clave: "super", fraccion: 0.0413 },
  { dia: 15, titulo: "Cumpleaños de la Javi", clave: "carrete", fraccion: 0.0371 },
  { dia: 14, titulo: "Bencina", clave: "transporte", fraccion: 0.0154 },
  { dia: 13, titulo: "Cuenta de la luz", clave: "casa", fraccion: 0.0687 },
];

/** Prefijo corto de cada moneda, para usarlo pegado a un campo de entrada
 * (`$ [12.000]`). No es el símbolo completo de Intl —que a veces incluye el
 * código, como "US$" o "Bs."— sino el que ya se ve en el resto de la página. */
export const SIMBOLOS = { CLP: "$", PEN: "S/", ARS: "$", MXN: "$", COP: "$", VES: "Bs." };

/** País de conexión → moneda del ejemplo. Es sólo el valor por defecto: el selector
 * visible manda siempre. Cualquier país fuera de los seis cae en CLP. */
export const PAIS_A_MONEDA = { CL: "CLP", PE: "PEN", AR: "ARS", MX: "MXN", CO: "COP", VE: "VES" };
export const MONEDA_POR_DEFECTO = "CLP";

/** Web y nativa: app/lib/home-context.ts, lib/home-state.ts. El ritmo se compara
 * contra un umbral RELATIVO a lo esperado a la fecha —10%—, no contra un monto
 * fijo. El monto fijo (PACE_TOLERANCE = 500) se retiró de las dos apps el
 * 2026-08-21: con un presupuesto grande esas 500 unidades no filtraban nada y
 * "vas por delante" quedaba encendido casi todos los días del mes. */
export const PACE_ESCALATION_RATIO = 0.1;

export const diasDelMes = (a, m) => new Date(a, m, 0).getDate();
export const nombreDia = (d) =>
  new Intl.DateTimeFormat("es-CL", { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(ANIO, MES - 1, d)));

/**
 * Resuelve la moneda del ejemplo. Orden: elección explícita → país → CLP. Una URL
 * manipulada (`?m=xx`, `?m=USD`, basura) nunca deja la página sin ejemplo: cae al
 * país o al defecto.
 */
export function resolverMoneda({ eleccion, pais } = {}) {
  const norm = (v) => String(v ?? "").trim().toUpperCase();
  const e = norm(eleccion);
  if (MONEDAS[e]) return { codigo: e, origen: "eleccion" };
  if (PAIS_A_MONEDA[e]) return { codigo: PAIS_A_MONEDA[e], origen: "eleccion" };
  const porPais = PAIS_A_MONEDA[norm(pais)];
  if (porPais) return { codigo: porPais, origen: "pais" };
  return { codigo: MONEDA_POR_DEFECTO, origen: "defecto" };
}

export function formatterFor(codigo) {
  const mon = MONEDAS[codigo] || MONEDAS[MONEDA_POR_DEFECTO];
  const f = new Intl.NumberFormat(mon.locale, { style: "currency", currency: codigo, maximumFractionDigits: mon.exp, minimumFractionDigits: mon.exp });
  return (x) => f.format(x / 10 ** mon.exp).replace("Bs.S", "Bs.");
}

/** Todo lo que necesita la página para un mes/día/moneda dados. */
export function calcular(codigo, { dia = DIA, mes = MES, anio = ANIO } = {}) {
  const mon = MONEDAS[codigo] || MONEDAS[MONEDA_POR_DEFECTO];
  const B = PRESUPUESTO[codigo] ?? PRESUPUESTO[MONEDA_POR_DEFECTO];
  const DIAS = diasDelMes(anio, mes);
  const RESTAN = DIAS - dia;

  const cats = REPARTO.map((c) => ({ ...c, monto: Math.round(B * c.fraccion) }));
  const gastado = cats.reduce((a, c) => a + c.monto, 0);
  const esperado = Math.round((B * dia) / DIAS);
  const desvio = gastado - esperado; // paceDiff
  const tolerancia = Math.round(Math.abs(esperado) * PACE_ESCALATION_RATIO);
  const queda = B - gastado;
  const diario = RESTAN > 0 ? Math.floor(queda / RESTAN) : queda; // siempre hacia abajo
  const movs = MOVIMIENTOS.map((m) => ({
    ...m,
    monto: Math.round(B * m.fraccion),
    nombreDia: nombreDia(m.dia),
    categoria: (REPARTO.find((c) => c.clave === m.clave) || {}).etiqueta,
  }));
  const luz = movs[3].monto;
  const f = formatterFor(codigo);

  let paceState, paceHeadline, paceDetail;
  if (desvio > tolerancia) {
    paceState = "over";
    paceHeadline = `Vas ${f(desvio)} por delante de tu ritmo`;
    paceDetail = "Es lo que llevas de más respecto a lo que correspondería a esta altura del mes.";
  } else if (desvio < -tolerancia) {
    paceState = "under";
    paceHeadline = `Vas ${f(Math.abs(desvio))} por debajo de tu ritmo`;
    paceDetail = "Si sigues así, cierras el mes con holgura sobre tu presupuesto.";
  } else {
    paceState = "";
    paceHeadline = "Vas al día con tu presupuesto";
    paceDetail = "Tu gasto va justo en lo que correspondería a esta altura del mes.";
  }

  return {
    codigo, mon, B, DIAS, dia, RESTAN, cats, gastado, esperado, desvio, queda, diario,
    movs, paceState, paceHeadline, paceDetail,
    mitad: Math.round(luz / 2), sesenta: Math.round(luz * 0.6), cuarenta: luz - Math.round(luz * 0.6),
    tolerancia, f,
  };
}
