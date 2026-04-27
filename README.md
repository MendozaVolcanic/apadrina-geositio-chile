# Apadrina un Geositio · Chile

Visor de ciencia ciudadana para el **patrimonio geológico de Chile**.  
Parte de la **Suite Geopatrimonio** — herramientas digitales para la divulgación y monitoreo del patrimonio geológico chileno.

## Qué hace

- Mapa interactivo con los **49 geositios** del Inventario Nacional SERNAGEOMIN 2024.
- Panel lateral con lista scrollable, filtro por región y estado de monitoreo.
- Al hacer clic en un geositio: formulario para **reportar visitas** con fecha, nombre, estado de conservación y observaciones libres.
- Los reportes se guardan en **localStorage** (sin servidor, 100 % en el navegador).
- Historial de reportes por geositio visible en el panel de detalle.

## Marcadores por relevancia

| Color | Relevancia |
|-------|-----------|
| Naranja `#d9764a` | Nacional |
| Verde `#5fb878` | Regional |
| Gris `#8b949e` | Local |

## Stack

- HTML5 + CSS3 (variables CSS, dark theme)
- JavaScript vanilla (ES2020, sin build)
- [Leaflet 1.9.4](https://leafletjs.com/) vía CDN
- Tiles: CartoDB Dark Matter

## Estructura

```
apadrina-geositio-chile/
├── index.html          # Entrada principal
├── styles.css          # Dark theme (--bg:#0f1419 …)
├── app.js              # Lógica Leaflet + localStorage
├── data/
│   └── geositios.json  # 49 geositios con id, nombre, región, coords, relevancia
└── .github/
    └── workflows/
        └── pages.yml   # Deploy automático a GitHub Pages
```

## Deploy

El repositorio se despliega automáticamente en **GitHub Pages** con cada push a `main`.  
Activar en: Settings → Pages → Source: GitHub Actions.

## Datos

Los geositios corresponden al Inventario Nacional de Geositios SERNAGEOMIN 2024 (GST-001 a GST-049), con coordenadas aproximadas y descripciones representativas. Los datos son de carácter divulgativo.

## Licencia

MIT — uso libre con atribución.
