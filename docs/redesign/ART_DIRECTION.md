# Dirección de arte — «El mes a la vista»

Rediseño de la landing de Mesura, 19 de agosto de 2026.
Implementación completa en `assets/css/landing.css`.

---

## 1. El diagnóstico que originó el cambio

La versión anterior era competente y funcionaba, pero era **reconocible**: un
visitante que haya visto cinco landings de SaaS en el último año podía predecir
la sexta sección antes de llegar. La estructura era la plantilla completa —
navegación fija, hero de dos columnas con mockup de teléfono, tres tarjetas con
cifras, cuatro tarjetas de características, dos tarjetas de precios, FAQ, CTA
oscuro.

El problema real, sin embargo, no era la lista de secciones: era que **todo era
una tarjeta**. Fondo blanco, borde negro de 2px, sombra dura de 5px, sobre una
grilla de puntos. Repetido doce veces. Cuando todo tiene el mismo peso visual,
nada tiene jerarquía, y el ojo deja de distinguir qué importa. El neobrutalismo
no era el problema; la **uniformidad** lo era.

## 2. El concepto

> **Un libro contable contemporáneo.** Una cartola chilena leída como pieza
> editorial.

No es una metáfora decorativa: es una regla de construcción. En un libro
contable, la información se separa con **filetes** —líneas—, se organiza en
**columnas**, y los montos se **alinean a la derecha** para poder leerse en
vertical. Nada flota. Nada tiene sombra. Todo está en su renglón.

De ahí salen las tres reglas que gobiernan la página:

1. **Las líneas hacen el trabajo que hacían las tarjetas.** Un filete de 1px
   separa dos ideas tan bien como una caja, y ocupa una centésima del peso
   visual. En toda la página hay **un solo marco grueso**: la hoja del estado
   del mes en el hero. Es el objeto principal, y se nota porque es el único.
2. **Las cifras se alinean como un registro.** Todo monto usa JetBrains Mono con
   `font-variant-numeric: tabular-nums`. Una columna de montos se lee de golpe,
   y ningún número «salta» al actualizarse porque todos los dígitos miden igual.
   Esto también es la razón de que el `cumulative-layout-shift` sea 0.
3. **La asimetría viene de las proporciones, no de los adornos.** Ninguna
   sección está centrada. El hero es 1,32 / 1. Los tres momentos usan un riel de
   84px para el número, una columna ancha para el texto y una angosta para el
   apunte. La evidencia es 0,9 / 1,1. Nada cae en una grilla de tercios.

## 3. Sistema tipográfico

Tres familias, cada una con un trabajo que las otras no pueden hacer. Todas
**auto-alojadas** en `assets/fonts/` — ver §7.

| Familia | Rol | Instancia | Peso |
|---|---|---|---|
| **Archivo** (variable, ejes `wdth`+`wght`) | Voz de la página: titulares, texto, etiquetas | `wdth 75..112`, `wght 400..700` | 90 KB |
| **JetBrains Mono** (variable `wght`) | Todo lo que sea cifra, dato, etiqueta de campo o metadato | `wght 400..700` | 31 KB |
| **Instrument Serif** (solo itálica) | **Una** frase editorial en toda la página | `italic 400` | 22 KB |

**Por qué Archivo y no otra.** Su eje de ancho variable permite que la misma
familia entregue titulares condensados (`font-stretch: 82%`, aire de encabezado
de estado de cuenta) y texto corrido cómodo (100%) sin cargar dos archivos. Es
una familia haciendo el trabajo de dos, que es exactamente lo que permite
respetar el límite de tres.

**Por qué la serif aparece una sola vez.** En «Nadie abre una app de finanzas
para hacer un presupuesto. La abre *porque acaba de pasar algo*», la itálica
serif marca el giro de la frase. Si apareciera en tres lugares dejaría de
significar nada. Aparece una vez, y por eso se lee.

Escala: `clamp()` en todos los niveles, sin breakpoints tipográficos. El
titular va de 40px a 84px de forma continua.

## 4. Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--ink` | `#12110e` | `#f0ebdd` | Texto principal y filetes |
| `--ink-2` | `#3d3a33` | `#c9c2b0` | Texto secundario |
| `--muted` | `#635f55` | `#9c9584` | Metadatos, etiquetas |
| `--paper` | `#f1ece0` | `#1b1914` | Fondo de página |
| `--paper-2` | `#e7e0d0` | `#232019` | Bandas alternas |
| `--sheet` | `#fbf8f1` | `#221f18` | La hoja del estado del mes |
| `--acid` | `#dfff42` | igual | Marca: CTA principal, resaltador, marca de ritmo |
| `--orange` | `#ff5c00` | igual | **Solo rellenos y marcas gráficas** |
| `--orange-ink` | `#a83a00` | `#ff7a2e` | **Solo naranja que sea texto** |
| `--red` | `#c02718` | `#ff7361` | Únicamente estados negativos |
| `--blue` | `#1f4fd8` | `#8bb0ff` | Únicamente foco y una categoría |

**El papel no es blanco.** `#f1ece0` es una hoja de cuaderno, no una pantalla.
Es lo que hace que la página se sienta impresa antes de que el lector procese
por qué.

**Los dos naranjas son deliberados.** El naranja vivo de Mesura da 2,6:1 sobre
papel: precioso como relleno de barra, ilegible como texto. Separar
`--orange` de `--orange-ink` evita tener que elegir entre la marca y WCAG AA —
la barra de ritmo conserva el naranja de la marca y el texto que la acompaña usa
el quemado. Todos los valores fueron calculados, no estimados; el detalle está
en `QA_REPORT.md` §4.

**El oscuro es tibio, nunca negro puro.** `#1b1914` mantiene la sensación de
papel con menos luz, en vez de convertir la página en otra cosa de noche.

## 5. Composición por sección

- **Masthead** — no es una barra flotante de SaaS: es la cabecera de una cartola,
  con su filete inferior. Cuatro destinos. Bajo 720px la fila de secciones baja a
  su propia banda con filete, en vez de colapsar en hamburguesa: **cuatro enlaces
  caben, y un menú que hay que abrir es peor que cuatro palabras que ya están**.
- **Hero** — titular a la izquierda (1,32fr), bajada y botones a la derecha (1fr)
  **alineados al pie de la última línea del titular** (`align-items: end`). Ese
  desnivel es lo que hace que no se lea como un hero de dos columnas. Debajo, a
  todo el ancho, la hoja.
- **La hoja** — el único marco de 2px. Cabecera con filete, tres cifras separadas
  por filetes verticales, cuerpo partido en movimientos (1,5fr) y categorías
  (1fr), y abajo la banda de anotar gasto sobre `--paper-2`.
- **Un mes real** — tres momentos como filas de un registro, no como tarjetas.
  Cada fila: número al margen en mono naranja, texto en la columna ancha, y un
  **apunte contable** a la derecha que muestra el momento del que habla en el
  mismo lenguaje visual de la hoja.
- **La brecha** — dos cifras enfrentadas en la misma escala tipográfica, con
  medidores del ancho de su propio porcentaje. La brecha entre 71% y 31% se ve
  antes de leerse.
- **Calculadora** — dentro del lenguaje de un estado financiero: filete superior
  de 2px, filas regladas etiqueta/campo, y el resultado bajo otro filete de 2px
  con el porcentaje en escala de titular.
- **Acuerdo de datos** — dos columnas separadas por un filete vertical, con `+` y
  `–` como marcadores. Sin tarjetas, sin íconos, sin verde y rojo.
- **Preguntas** — `<details>` nativos sobre filetes. Sin bordes, sin sombras,
  sin fondo. Cuatro. Encabezado en una columna y acordeón en la otra
  (0,62 / 1,38): la misma figura asimétrica de la evidencia y la calculadora,
  aplicada al bloque operable de la sección. Van **antes** del cierre, porque las
  objeciones se resuelven antes de pedir el correo, no entre la oferta y el
  formulario.
- **Cierre: beta fundadora + invitación** — una sola composición de dos columnas
  (0,82 / 1,18). A la izquierda el encuadre —timbre de goma, titular, bajada y
  nota al margen—, sobre papel; a la derecha el bloque de conversión. El encuadre
  se queda fuera de la tinta a propósito: dentro habría que anular `--ink-2`,
  `--muted` y `--orange-ink`, que son tokens de papel y sobre `#12110e` no
  pasan AA.
- **Invitación** — el único bloque de alto contraste de la página, tinta en ambos
  temas. No se parte en dos columnas propias: fluye en vertical, porque ahora
  *es* la columna derecha del cierre.

## 6. Imperfecciones controladas

Tres, y ninguna más:

1. **El resaltador** de «antes» usa `clip-path: polygon(0 6%, 100% 0, 99.6% 96%,
   .4% 100%)`: un trazo levemente torcido, como un destacador pasado a mano.
2. **El timbre** de «Acceso por invitación» va rotado `-2.2deg`, con borde
   quemado. Es el único elemento rotado de la página.
3. **La marca de ritmo** es un cuadrado ácido con borde de tinta y halo del color
   de la hoja, para seguir leyéndose sobre naranjo o sobre rojo.

## 7. Rendimiento y coherencia

**Las tipografías se sirven desde este mismo dominio.** No es solo rendimiento:
una página que promete «no compartimos tus datos con terceros» no puede pedirle
la tipografía a Google y filtrarle la IP de cada visita. Con las fuentes locales,
la landing **no hace ni una sola petición a un tercero**, lo que además permitió
declarar una CSP estricta en `_headers` sin listas de excepciones.

Subconjunto latino (cubre el español completo), `font-display: swap`, y `preload`
para las dos familias del primer pantallazo.

## 8. Movimiento

El movimiento existe solo donde significa algo: cuando un número cambia porque
alguien hizo algo.

- Barra de ritmo y marca de esperado: `width`/`left` con
  `cubic-bezier(.22,.9,.3,1)`, 500ms.
- Movimiento recién anotado: entra con un destello ácido de 450ms que se apaga.
- **Nada más.** Sin animaciones infinitas, sin carruseles, sin parallax, sin
  cursores personalizados, sin aparición al hacer scroll.

`prefers-reduced-motion: reduce` reduce toda animación y transición a 0,001ms
globalmente y desactiva el scroll suave. Verificado: `QA_REPORT.md` §3.

## 9. Lo que se decidió no hacer

Sin degradados. Sin glassmorphism. Sin ilustraciones 3D. Sin fotos de stock. Sin
dispositivos flotando. Sin filas de tarjetas de características. Sin dos tarjetas
de precios. Sin testimonios. Sin logos de clientes. Sin contadores animados. Sin
una sola sección agregada para que la página se viera «completa».
