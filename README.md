# Tomz Boost — Landing

Landing de marketing para **Tomz Boost**, el optimizador gamer de Windows (Electron + React).

El diseño sigue el language visual real de la app de escritorio: fondo `#111`, paneles `#1a1a1a`, bordes `#2c2c2c`, tipografía **Geist**, acento blanco (estilo AMD Adrenalin) y el wordmark oficial `TOMZ BOOST`.

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Capturas de producto

Con el dev server corriendo:

```bash
npm run screenshots
```

Genera PNGs en `public/screenshots/` desde el preview fiel de la UI (`/?shot=inicio|tweaks|juegos`).

## Build

```bash
npm run build
npm run preview
```

## Agenda y PIX (BuckPay)

La optimización 1 a 1 se reserva en `#agendar`. El servidor crea el PIX en BuckPay y confirma el turno cuando el pago figura como `paid`. El token no sale del servidor.

Copiá `.env.example` a `.env` y completá:

- `BUCKPAY_TOKEN` — secret de 40 caracteres
- `BUCKPAY_USER_AGENT` — el valor que te pasa el gerente de cuentas
- `BOOKING_AMOUNT_CENTS` — precio en centavos (mínimo 600, máximo 300000)
- `PUBLIC_BASE_URL` — URL pública para el webhook `transaction.processed`
- `BOOKING_OFFER_SLUG` — slug de la oferta en el panel de Buck, si ya existe

Horarios por defecto: lunes a sábado, 14:00–22:00, hora de Brasília, turnos de 60 minutos. Se cambian con `SCHEDULE_TZ`, `SCHEDULE_DAYS`, `SCHEDULE_START` y `SCHEDULE_END`.

En desarrollo, `npm run dev` sirve el sitio y `/api` en el mismo puerto. En producción: `npm run build` y `npm start`.

`BUCKPAY_MOCK=1` simula el PIX sin llamar a BuckPay. No lo uses en producción.

## Enlaces y download

Editá en `src/config.ts`:

- `downloadUrl` — ruta o URL del instalador (hoy apunta a `/downloads/TomzBoost-Setup.zip`)
- `LINKS.discord` / `LINKS.whatsapp` — reemplazá `SEULINK` y `SEUNUMERO`
- `RELEASE` — versión, tamaño y fecha

Poné el `.exe` / instalador real en `public/downloads/` y actualizá `downloadUrl`.

## Origen

- Estructura y copy basados en la landing Lovable (`tomzboost.lovable.app`).
- Estilo, navegación y assets alineados al repo de la app [`tomasavellaneda/tomz-boost`](https://github.com/tomasavellaneda/tomz-boost).
