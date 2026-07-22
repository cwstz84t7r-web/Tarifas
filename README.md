# Tarifas — seguimiento de precios de supermercados

App personal para seguir el precio de productos en Mercadona, Dia, Carrefour,
Alcampo, Consum y Eroski. Tú añades productos pegando el enlace del producto
en cada tienda, y cuando tú lo pidas (nunca en automático) la app va a leer
el precio actual y lo guarda en un histórico.

Esta guía está pensada para alguien que **no programa**. Sigue los pasos en
orden. Se tarda unos 15-20 minutos la primera vez, y no hace falta instalar
nada en tu ordenador de trabajo: todo se hace desde la web.

## Qué vas a crear (gratis)

1. Una base de datos en **Supabase** (guarda tus productos e histórico de precios).
2. Un despliegue en **Vercel** (aloja la app y te da una dirección web, tipo
   `https://tarifas-tuusuario.vercel.app`, que podrás abrir desde el móvil
   como si fuera una web cualquiera).

Ambos servicios tienen un plan gratuito más que suficiente para uso personal.

---

## Paso 1 — Crear la base de datos en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta (puedes usar tu
   cuenta de Google).
2. Pulsa **New project**. Ponle un nombre (p. ej. `tarifas`), elige una
   contraseña para la base de datos (**guárdala**, la necesitarás luego) y
   una región cercana (p. ej. `West EU (Ireland)`).
3. Espera 1-2 minutos a que el proyecto se cree.
4. Ve a **Project Settings** (icono de engranaje) → **Database**.
5. En **Connection string**, elige la pestaña **Transaction pooler** (puerto
   `6543`) y copia la URI. Sustituye `[YOUR-PASSWORD]` por la contraseña que
   elegiste en el paso 2. Guarda esta cadena, es tu `DATABASE_URL`.

No hace falta crear tablas a mano: la app las crea sola la primera vez que
arranca.

---

## Paso 2 — Subir el proyecto a Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta con tu **GitHub**
   (el mismo usuario que tiene este repositorio).
2. Pulsa **Add New → Project** e importa el repositorio `tarifas`.
3. Vercel detectará que es un proyecto Next.js automáticamente. No cambies
   nada en **Build settings**.
4. Antes de pulsar "Deploy", abre **Environment Variables** y añade estas
   tres:

   | Nombre | Valor |
   |---|---|
   | `DATABASE_URL` | La cadena que copiaste de Supabase en el paso 1 |
   | `APP_PASSWORD` | Una contraseña que tú elijas para entrar en la app desde el móvil |
   | `SESSION_SECRET` | Otra cadena larga y aleatoria (puedes usar un generador de contraseñas online, no hace falta recordarla) |

5. Pulsa **Deploy**. En 1-2 minutos tendrás tu app en una URL como
   `https://tarifas-tuusuario.vercel.app`.

## Paso 3 — Usarla desde el móvil

Abre esa URL desde el navegador de tu móvil, escribe la `APP_PASSWORD` que
elegiste y ya estás dentro. Si quieres que parezca una app:

- **iPhone (Safari):** botón compartir → "Añadir a pantalla de inicio".
- **Android (Chrome):** menú (⋮) → "Añadir a pantalla de inicio".

Se añade un icono como el de cualquier app, pero por dentro es la página web
— no hace falta instalar nada de una tienda de aplicaciones.

---

## Cómo se usa

1. **Añadir un producto**: pulsa el botón **+**, ponle un nombre y pega el
   enlace del producto en cada tienda donde quieras seguirlo (entra en la web
   de cada súper, busca el producto tú misma una vez, y copia el enlace de su
   página). Puedes dejar tiendas en blanco y añadir el enlace más tarde.
2. **Actualizar precios**: en la lista o en el detalle de un producto, pulsa
   **Actualizar**. La app entra en cada enlace guardado y lee el precio
   actual — nunca lo hace sola, solo cuando tú lo pides.
3. **Histórico**: entra en un producto para ver la evolución del precio en
   cada tienda a lo largo del tiempo.
4. **Si una tienda bloquea la lectura automática**: verás un aviso claro
   ("bloqueado", "no se encontró el precio"...) y un botón **Precio manual**
   para escribir tú el precio que veas en la web. Se guarda igual en el
   histórico.

## Cosas que debes saber

- **Mercadona** tiene una interfaz interna bien conocida y suele funcionar de
  forma automática de manera fiable.
- **Dia, Carrefour, Alcampo, Consum y Eroski** no tienen una API pública:
  la app intenta leer el precio directamente de la página del producto
  (busca los datos que estas webs suelen incluir para que Google las
  indexe). Algunas de estas tiendas usan protecciones anti-bot que pueden
  bloquear la lectura automática en algún momento; en ese caso, usa el botón
  de precio manual. No es un fallo de la app, es una limitación de cada
  tienda.
- Si una tienda rediseña su web, la lectura automática de esa tienda puede
  dejar de funcionar hasta que se actualice el código. El precio manual
  siempre estará disponible como alternativa.
- La app está protegida con una contraseña (`APP_PASSWORD`), pero al estar
  en una URL pública de internet, no compartas el enlace con nadie que no
  deba usarla.

## Desarrollo local (opcional, solo si en algún momento quieres tocar código)

```bash
npm install
cp .env.example .env.local   # rellena las variables
npm run dev
```
