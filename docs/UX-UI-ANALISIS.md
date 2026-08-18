# Análisis UX/UI de la landing — y simplificación aplicada

Agosto 2026. Motivación: la página se percibía saturada. Auditoría contra
tiempos de atención reales y contra la estructura de las landing más populares
de la categoría (revisadas en vivo: fintual.cl, splitwise.com, ynab.com).

## 1. Tiempos de atención: el presupuesto real del visitante

- La decisión de quedarse o irse ocurre en los **primeros ~10 segundos**; si la
  propuesta de valor no queda clara ahí, el resto de la página no existe.
- La mayor parte del tiempo de lectura se concentra **sobre el pliegue** (primer
  pantallazo) y cae drásticamente con cada scroll adicional.
- El ojo sigue patrones de escaneo (F/Z): titular → visual → primer CTA. Todo
  elemento extra en ese recorrido compite contra la conversión.
- **El movimiento captura atención involuntariamente**: un elemento animado
  permanente (ticker) roba miradas al CTA y a la demo aunque no aporte decisión.

## 2. Qué hacen las landing más populares (verificado en vivo)

| Sitio | Hero | Features | Movimiento decorativo |
|---|---|---|---|
| Splitwise | 1 titular + 1 subtítulo + 2 CTA + 1 visual | **4** bloques | No |
| Fintual | 1 titular + subtítulo + **1 CTA** + 1 imagen | **4** tarjetas | No (solo carruseles operables) |
| YNAB | 1 titular + subtítulo + 2 CTA + 1 imagen | 6, como chips livianos | No |

Patrón común: **un solo visual en el hero, ~4 features, cero animación
decorativa**. La longitud que tienen la gastan en social proof (testimonios,
prensa) — cosa que Mesura aún no tiene, por lo que no hay razón para ser igual
de largos.

## 3. Auditoría de nuestra página (antes)

10 bloques de contenido: hero (con 8 elementos: eyebrow, titular, lead, 2 CTA,
nota de invitación, 3 stats, teléfono con sticker y caption), ticker animado,
problema (3 tarjetas + fuentes), calculadora, 6 features, "Tus datos" (4
ítems), "Cómo funciona" (3 pasos), plan (2 tarjetas), FAQ (5), CTA final.

Problemas concretos:

1. **Hero sobrecargado**: 3 zonas pedían atención a la vez (stats, sticker
   animable, ticker inmediatamente debajo). El referente usa 4-5 elementos; el
   nuestro tenía 8.
2. **Ticker en movimiento perpetuo**: robaba atención sin aportar decisión, y
   además duplicaba información que la demo ya muestra.
3. **Dos secciones de texto redundantes**: "Tus datos" repetía lo que el plan
   gratis y el FAQ ya dicen; "Cómo funciona" explicaba un producto que la demo
   interactiva ya demuestra mejor.
4. **6 features cuando el estándar es 4**: las dos últimas (calendario,
   favoritos) son secundarias — valor real, pero no argumentos de conversión.
5. La estética neobrutalista es de alto contraste por diseño: **soporta menos
   densidad** que una estética suave antes de saturar. Menos bloques, no menos
   personalidad.

## 4. Cambios aplicados

| Antes | Después |
|---|---|
| Hero con 8 elementos | Hero con 5: eyebrow, titular, lead corto, 2 CTA, demo |
| Ticker animado | **Eliminado** |
| 6 tarjetas de features | **4 tarjetas** + una línea "Y además…" con lo secundario |
| Sección "Tus datos" (4 ítems) | **Eliminada**; su esencia vive en el plan gratis y en un FAQ ampliado |
| Sección "Cómo funciona" (3 pasos) | **Eliminada**; la demo ya lo demuestra y el CTA menciona que crear cuenta toma un minuto |
| 10 bloques de contenido | **7 bloques**: hero → problema → calculadora → features → plan → FAQ → CTA |

Se conservan intactas las dos piezas diferenciadoras e interactivas (demo del
teléfono y calculadora de carga financiera): son las que justifican el scroll.
El FAQ queda como acordeón cerrado — profundidad disponible sin costo visual.

## 5. Qué medir después (cuando haya tráfico)

- % de visitantes que interactúan con la demo y con la calculadora.
- Scroll depth: ¿llegan al plan? ¿al CTA final?
- Conversión de lista de espera por origen de clic (hero vs. calculadora vs. CTA final).
- Si el social proof aparece (usuarios reales, prensa), esa es la próxima
  sección que se gana el espacio — no más texto.
