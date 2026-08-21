# Evaluación de la reorganización visual — 21 de agosto de 2026

Sigue el método de `Mesura-lanzamiento/informe-landing/METODO.md` (las advertencias de §2 y
los sesgos de §3 valen igual aquí) y el diseño de dos grupos de
`Mesura-lanzamiento/landing-v3/evaluacion/METODO.md` (anclados + control), porque es el que de
verdad mide lo que Matías pidió: *si se entiende en el primer barrido, si algo confunde, y qué
se lleva alguien que sólo mira tres segundos.* Ésa es una decisión mía, no la advertí antes de
tomarla, así que la dejo explícita: el prompt cita el primer documento; el diseño A/B con control
es del segundo. Uso el segundo porque el primero no tiene control y no mide "primer barrido".

**Nadie leyó esta página. Son personas inventadas — cinco continúan personajes de
`landing-v3/evaluacion/` con una objeción registrada sobre la ACUMULACIÓN de advertencias
(el problema exacto que esta pasada ataca), y cuatro son control nuevo, sin haber visto ninguna
versión ni saber que existe este estudio.** Lo que este ejercicio puede hacer: someter la
maqueta nueva a la objeción textual que cada persona ya hizo, y ver si sigue en pie. Lo que no
puede hacer: predecir conversión real. Detalle de límites en §5.

---

## 1. Qué se les mostró

`index.html` de la rama `claude/jerarquia-visual-20260821`, tal como queda después de esta
pasada: mismo texto en todas partes salvo tres correcciones de contenido (el margen del ritmo,
el bug del primer mes, la instrucción de gastos fijos — ver `VALIDAR.md` §2), y tres bloques
reorganizados de párrafo-con-`<br><br>` a lista con filete (sección 01, dos de sección 02→05).
Se les dio la maqueta completa, no sólo el texto: two-column grids, filetes, la caja `.pact`,
todo.

---

## 2. Grupo A — anclados, con objeción registrada sobre acumulación (5)

| Quién | Objeción anterior (textual) |
|---|---|
| Andrés, 45, Medellín, contador | *"Ustedes pusieron todo en fila"* — la metáfora del estado financiero con las notas agrupadas |
| Camila, 24, Santiago | La metáfora del restorán: "el mejor lomo" en la puerta, la letra chica adentro |
| Teresa, 66, Talca | *"¿Entonces cuándo funciona?"* — dos advertencias del arranque, seguidas |
| Nicolás, 30, Mendoza | *"Contá los 'no' por función, no por página"* |
| Iván, 41, Maracay | Clasificó los 21 "no" de la v3.0 en buenas-noticias-en-negativo vs límites reales |

**Andrés:** *"Esto ya es otra cosa. Antes la sección 02 me daba cuatro párrafos seguidos —el
consejo, el castigo si no lo seguía, el margen, el bug del primer mes— y yo los leía como una
sola nota larga de auditoría, cada vez más grave. Ahora quedan un recuadro con la instrucción, y
al lado dos líneas chicas, en letra de máquina de escribir, que claramente pesan menos. Es
literalmente lo que yo pedía: la nota importante en su caja, las aclaraciones al margen. Y
encontré algo que no esperaba —el párrafo del margen de $500 desapareció entero. Ya no dice ese
número. Antes de esta ronda yo no tenía cómo saberlo, pero si de verdad ese umbral cambió, sacarlo
en vez de dejarlo mal es exactamente la disciplina que le pedía a la sección 04."* Correo 75→**82**.
Usar 40→**45**.

**Camila:** *"El menú del restorán por fin no tiene la letra chica pegada al título. La sección
01 —lo de la invitación— antes era un párrafo largo con cuatro '<b>' sueltos adentro, que yo leía
de corrido y se me mezclaban. Ahora es una lista: cada aviso en su propia línea, con su negrita
arriba. Conté los mismos cuatro hechos que antes, pero esta vez los conté SIN esfuerzo, no
haciendo memoria. Sigue sin ser bonito —es una lista de condiciones de invitación, no tiene por
qué ser bonito— pero ya no se siente como una sola advertencia larga."* Correo 70→**75**. Usar
40→**48**.

**Teresa:** *"La sección del ritmo ahora dice una cosa: pon todo, marca lo fijo. Antes yo leía
'no separa los gastos fijos' como una confesión más, apilada sobre las otras. Ahora es una
instrucción — hay una casilla, la nombra entre comillas como si fuera un botón de verdad, no una
disculpa. Eso cambia el tono completo del párrafo, de disculpa a instrucción. Sigo sin encontrar
dónde dice esa casilla en la hoja de ejemplo de arriba, y por un segundo pensé que me estaban
prometiendo algo que el ejemplo no hace — hasta que leí la letra chica bajo el ejemplo, que
ahora sí lo explica. Está, pero hay que buscarla."* — **Ver §4, es el hallazgo que más me
importa de todo el ejercicio.** Correo 80→**80**. Usar 55→**60**.

**Nicolás:** *"Conté por sección, como pedí la vez pasada. Sección 01: cuatro, en la lista nueva
— antes también eran cuatro, escondidos en un párrafo, así que el conteo no bajó, bajó el
esfuerzo de contarlos. Sección 02: antes eran mis viejos seis o siete entre el consejo, el
castigo, el margen y el bug; ahora conté tres, porque de verdad se sacaron dos. Ahí sí hay menos,
no sólo se ve como menos."* Correo 85→**85**. Usar 30→**38**.

**Iván:** *"Clasifiqué de nuevo. La frase nueva de la sección 02, 'si no marcas nada, el ritmo te
va a decir que vas por delante', es un límite real, no una buena noticia en negativo — pero
ahora viene con la salida al lado, en el mismo recuadro: marca la casilla. Antes el límite venía
solo, sin salida, en un callout aparte. Es la misma clase de arreglo que pedí para el 15% del
texto viejo: no es que el 'no' desaparezca, es que ya no llega desnudo."* Correo 60→**66**. Usar
10→**14**.

---

## 3. Grupo B — control nuevo, sin anclaje de ningún tipo (4)

| Quién | Perfil | Por qué este perfil |
|---|---|---|
| Valeria, 29, Guayaquil | Diseñadora de producto, evalúa jerarquía visual por oficio | Nadie del corpus anterior podía juzgar la maquetación como oficio, no como lector |
| Fabián, 52, Panamá | Dueño de un local, lee en el teléfono entre clientes, dos minutos como mucho | Mide el barrido de tres segundos bajo presión real de tiempo |
| Renata, 37, Asunción | Traductora freelance, lee todo, palabra por palabra, por costumbre profesional | Es la lectora que SÍ llega hasta la letra chica — mide si agrupar esconde algo de quien de verdad lee todo |
| Joaquín, 22, La Paz | Estudiante, primera app financiera de su vida, se aburre rápido con texto | Nadie del corpus anterior era joven Y sin ninguna app de plata previa |

**Valeria (diseñadora):** *"Como oficio, esto está bien resuelto y se nota que no es la primera
pasada: tipografía monoespaciada para cifras, un solo acento de color, filetes en vez de tarjetas
— hay una dirección. Mi objeción es puntual: la sección 02 tiene tres bloques seguidos con el
mismo peso visual —un recuadro con borde y dos notas con filete a la izquierda— y el ojo no sabe
cuál leer primero, porque ninguno tiene más jerarquía que el otro. No es un problema de exceso de
texto, es que dentro de la sección todo grita al mismo volumen. Yo bajaría un tono la segunda
nota (la del 'no distingue no gasté de no anoté') a texto corrido normal, sin el filete, porque
compite con la primera sin necesidad."* — **Ver §4, corrección aplicada.** Correo 55 (primera
lectura, no anclada). Usar 30.

**Fabián:** *"Miré tres segundos, como usted pidió, y cerré los ojos. Lo que me quedó: 'anoto un
gasto, me dice cuánto me queda por día'. Eso es lo que me llevo, y me sirve — tengo el local y
ando siempre con la cuenta corta a fin de mes. No até nada de lo compartido ni de la privacidad
en esos tres segundos, y está bien así: eso lo até cuando seguí leyendo, treinta segundos más.
Bajé hasta la parte de 'a mitad de mes' y ahí sí me trabé un poco — el recuadro de la casilla es
largo para alguien que lee parado. Pero no me asustó, sólo lo salté."* Correo 70. Usar 40.

**Renata:** *"Leí todo, como siempre. La ventaja de agrupar los avisos en una lista, para mí que
sí llego hasta el final, es que puedo confirmar rápido que no falta nada — cada punto es una
frase, no tengo que separar mentalmente dónde termina una idea y empieza otra dentro de un mismo
párrafo largo. Eso antes me costaba trabajo real en la sección de la invitación. Encontré una
sola cosa que me hizo dudar: la nota chica dice 'ninguno está marcado como gasto fijo' sobre el
ejemplo de arriba, pero no dice qué pasaría con los números SI uno estuviera marcado. Es honesto
—dice lo que no muestra— pero me dejó con la pregunta abierta, no con la respuesta."* Correo 60.
Usar 35.

**Joaquín:** *"Sinceramente no leí la mitad de las cajas grises, ni antes ni ahora — eso no
cambió, y no creo que cambie con ningún acomodo de letras. Lo que sí noté es que ya no se ve tan
largo de un vistazo: antes en el teléfono la sección de mitad de mes eran como cinco pantallas de
puro texto gris, ahora se ve más corto porque hay más aire entre los bloques. Puede que sea lo
mismo de largo scrolleando, pero se siente más corto, y para mí eso ya es ganancia — lo que se ve
largo yo simplemente no lo abro."* Correo 45. Usar 20.

---

## 4. Hallazgos — lo que sostiene la pasada y lo que expone

### 4.1 Sostiene: el conteo de "no" bajó de verdad, no sólo de aspecto

Nicolás lo dice explícito: la sección 02 pasó de "sus viejos seis o siete" a tres. Eso coincide
con el cambio real — se borraron dos bloques completos (el margen de $500, obsoleto, y el bug del
primer mes, arreglado en las dos apps) y se fusionó uno (sección 05, dos callouts a uno). No es
sólo que la caja se vea más liviana: hay menos cajas.

### 4.2 Sostiene: la reorganización de listas se lee como se pretendía

Andrés y Camila, las dos personas cuya objeción original era literalmente "está en fila", dicen
que la sección 01 ya no se siente así. Es el resultado más limpio del ejercicio porque es el más
fácil de falsear: si hubieran dicho que seguía sintiéndose igual, la intervención habría fallado
en su propio término.

### 4.3 Expone algo real: dos correcciones que hay que aplicar

**Teresa y Renata, desde ángulos distintos, encontraron el mismo hueco:** el ejemplo interactivo
no demuestra la casilla de gasto fijo, y aunque la nota nueva ya lo dice, ninguna de las dos supo
qué pasaría si la marcara. Es honesto — no promete de más — pero dos de nueve personas se
quedaron con la pregunta sin cerrar. Es una limitación real de esta pasada, declarada en
`VALIDAR.md` §3, no un defecto que se pueda arreglar con más texto: arreglarlo de verdad significa
construir la casilla dentro del ejemplo interactivo, que es trabajo de ingeniería, no de
maquetación, y queda para otra pasada.

**Valeria, la única lectora con oficio de diseño, encontró un defecto de jerarquía que sí se
corrigió en esta misma pasada:** dentro de la sección 02, la nota "no distingue no gasté de no
anoté" tenía el mismo peso visual que la nota principal de al lado, cuando debería pesar menos.
Aplicado: ver `VALIDAR.md` §2 — se sacó el filete de esa nota y quedó como texto corrido bajo la
otra, para que la jerarquía dentro de la sección no compita consigo misma.

### 4.4 Lo que no cambió, y está bien que no haya cambiado

Ninguno de los nueve pidió que se borrara información. Ninguno dijo que un límite declarado lo
espantara por sí solo — la misma conclusión que ya tenía `RESULTADO.md` §4.2 con las trece
personas anteriores. La objeción de esta ronda es toda sobre ORDEN y PESO VISUAL, nunca sobre
CONTENIDO, que es exactamente el eje que esta pasada tenía permiso de tocar.

---

## 5. Lo que este ejercicio no puede decir

Todo lo de `informe-landing/METODO.md` §2 vale igual aquí, y una cosa más, propia de esta ronda:

**El control de cuatro es más chico que el de cinco de la ronda anterior, y ya se demostró una
vez que el tamaño del control cambia la conclusión** (`landing-v3/evaluacion/RESULTADO.md` §2: un
control de una persona invirtió el resultado del estudio anterior). Cuatro sigue siendo poco.
No hay manera de saber, con esta muestra, si la brecha correo/uso entre el grupo A y el B de esta
ronda es real o es ruido de un n pequeño.

**Los nueve leyeron una maqueta corriendo en un navegador de escritorio simulado, no en un
teléfono real, con dedo real, con luz de sol real.** El hallazgo de Joaquín —"se siente más
corto" en el teléfono— es plausible y no verificado: nadie midió el alto real en píxeles de la
sección antes y después en un viewport de 390px.

**Y la limitación de siempre: nadie usó Mesura, nadie es real, y quien escribió las nueve
respuestas es quien hizo los cambios que están siendo evaluados.** El sesgo de confirmación no se
puede descontar del todo. La precaución que sí se tomó: se dejaron los dos hallazgos de §4.3 en
vez de reportar sólo éxito, y uno de ellos (el hueco de la casilla en el ejemplo) es un límite que
esta pasada no resuelve, no uno que resuelve y presume.
