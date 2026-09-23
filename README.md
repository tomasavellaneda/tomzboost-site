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

## Enlaces y download

Editá en `src/config.ts`:

- `downloadUrl` — ruta o URL del instalador (hoy apunta a `/downloads/TomzBoost-Setup.zip`)
- `LINKS.discord` / `LINKS.whatsapp` — reemplazá `SEULINK` y `SEUNUMERO`
- `RELEASE` — versión, tamaño y fecha

Poné el `.exe` / instalador real en `public/downloads/` y actualizá `downloadUrl`.

## Origen

- Estructura y copy basados en la landing Lovable (`tomzboost.lovable.app`).
- Estilo, navegación y assets alineados al repo de la app [`tomasavellaneda/tomz-boost`](https://github.com/tomasavellaneda/tomz-boost).
