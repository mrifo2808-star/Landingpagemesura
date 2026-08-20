# Arnés de QA de la landing

Los scripts de QA se reconstruyeron dos veces —una en `QA_REPORT.md` §10 y otra
en `QA_RITMO.md` §7.1— porque nunca quedaron versionados. `QA_RITMO.md` §10 pide
explícitamente guardarlos acá. Esto es eso.

**Este directorio no llega a producción.** `.assetsignore` excluye `docs` del
despliegue de Cloudflare Pages y `_redirects` manda `/docs/*` a `/` con un 301.
La landing sigue sin build, sin `npm` y sin dependencias: este `package.json` es
suyo y de nadie más.

---

## Cómo correrlo

```
cd docs/redesign/qa
npm install
npm test
```

Hace falta **Node 20 o superior** y **Chrome instalado en el equipo**.
`puppeteer-core` no descarga ningún navegador; usa el que ya está. Si el tuyo
no está en la ruta habitual de Windows o macOS:

```
CHROME_PATH="/ruta/a/chrome" npm test
```

`npm test` corre siete bloques, cada uno en su propio proceso, y devuelve
código distinto de cero si alguno falla.

| Script | Qué comprueba |
|---|---|
| `npm run waitlist` | El contrato de `functions/api/waitlist.js` contra un KV falso: honeypot, idempotencia, 405/413/415, mensajes en español, cero IP y cero user-agent guardados. |
| `npm run viewports` | Alto de página, scroll horizontal y consola limpia en 360, 390, 768, 1024 y 1440 px, en claro y oscuro. El desborde se mide también con `overflow-x` desactivado. |
| `npm run anclas` | Que los seis destinos de ancla aterricen con su título entero bajo la cabecera fija, en los cinco anchos y los dos temas. |
| `npm run red` | Cero peticiones a terceros y presencia de las seis cabeceras de seguridad. |
| `npm run axe` | axe-core (`wcag2a` + `wcag2aa` + `wcag21a` + `wcag21aa` + `best-practice`) con los `<details>` abiertos. |
| `npm run funcional` | Demo, calculadora, formulario (contra el mock), teclado, tema oscuro y `prefers-reduced-motion`. |
| `npm run perf` | Fluidez del scroll: tareas largas, eventos `Paint` e intervalos entre cuadros. |

Fuera de `npm test`, porque tardan o escriben archivos:

| Script | Qué hace |
|---|---|
| `npm run lighthouse` | Lighthouse móvil y escritorio, dos corridas por perfil, mediana. Escribe `resultados/lighthouse.json`. Tarda unos minutos. |
| `npm run capturas` | Capturas antes/después en `docs/redesign/screenshots/`. El "antes" es la hoja de `main` servida por el mismo servidor. |
| `npm run minificar` | Mide qué se gana minificando `landing.css` y si se nota en Lighthouse. No instala nada en la landing. |
| `npm run csp` | Sirve la página con tres CSP distintas y mide si los `style=` sobreviven. |
| `npm run icono` | Regenera `assets/img/apple-touch-icon.png` desde los tokens de color de `landing.css`. |
| `npm run serve` | Deja el servidor corriendo para mirar la página a mano. |

---

## La regla que no se negocia

**Nunca contra `/api/waitlist` de producción.** El servidor de `lib/server.js`
monta un mock en memoria de ese endpoint, y las pruebas del formulario apuntan
siempre ahí. Escribir en el KV de producción guarda un correo real y dispara un
aviso al dueño.

---

## Qué replica el servidor local

`lib/server.js` lee `_headers` del repositorio y sirve la raíz del proyecto
imitando a Cloudflare Pages:

- Los headers reales, **concatenando** las reglas que coinciden en vez de
  sobrescribirlas. Pages hace exactamente eso, y por eso un `Cache-Control`
  duplicado en `/*` dejó los assets caducando en cinco minutos en vez de un año
  (`QA_REPORT.md` §8 bis). Si vuelve a pasar, se ve acá y no en producción.
- gzip para lo comprimible.
- El 301 de `/docs/*` y el comodín a `/index.html`.
- El mock de `/api/waitlist`.

`sustituir` permite servir otro contenido para una ruta sin tocar el
repositorio. Lo usan `capturas.js` —que sirve la hoja de `main` para el "antes"—
y `minificar.js`.

---

## Puntos ciegos conocidos del propio arnés

- **Solo Chrome.** Firefox y Safari siguen sin probarse en este proyecto
  (`QA_REPORT.md` §6). Todo lo que dicen estos scripts vale para Blink.
- **Las pruebas de `[hidden]` miran el renderizado, no el atributo.** Comprobar
  el atributo fue el punto ciego que dejó pasar la regresión de `QA_RITMO.md`
  §11.1: dos controles ocultos por atributo se pintaban igual porque una regla
  de clase le ganaba a `[hidden]`. Ahora se exige `display: none` **y** altura
  cero.
- **`scroll-behavior: smooth` se desactiva antes de medir o capturar.** Sin eso
  el disparo sale a medio camino de la animación, que es como salieron mal
  siete capturas en `QA_RITMO.md` §11.4. `capturas.js` además comprueba que el
  ancla quedó dentro del viewport y avisa si no.
- **axe se inyecta como fuente evaluada por CDP**, no como `<script src>`: la
  CSP de la página es `script-src 'self'` y bloquearía la etiqueta. Se evalúa en
  vez de desactivar la CSP, para auditar la página tal como se sirve.
