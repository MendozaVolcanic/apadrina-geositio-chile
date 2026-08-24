# Traspaso — Apadrina un Geositio · Chile

**De:** Nicolás Mendoza · **A:** Felipe Fuentes Carrasco · **Fecha:** 2026-08-24

## 1. Qué es

Plataforma de ciencia ciudadana para los **49 geositios del Inventario Nacional
SERNAGEOMIN 2024** (GST-001 a GST-049). Mapa Leaflet + panel lateral con filtros, y un
formulario para reportar visitas con fecha, estado de conservación y observaciones.

🌐 https://mendozavolcanic.github.io/apadrina-geositio-chile/

## 2. Estado de los datos

`data/geositios.json` — 49 registros con `id`, `nombre`, `region`, `lat`, `lon`,
`descripcion_corta`, `relevancia`.

⚠️ Las **coordenadas son aproximadas** y las descripciones son divulgativas, no fichas
oficiales. Está declarado en el README y hay que mantener esa advertencia hasta cruzarlo
con la ficha oficial de cada geositio. Antes de usar este dataset para cualquier cosa que
no sea visualización, validar contra la fuente SERNAGEOMIN.

La clasificación de `relevancia` (nacional / regional / local) tampoco está trazada a la
ficha oficial: revísala antes de construir encima.

## 3. La limitación de diseño más importante

**Los reportes se guardan en `localStorage`.** Es decir: viven solo en el navegador de
quien los escribe. No hay backend, no hay base de datos, nadie más los ve, y se pierden
si el usuario limpia el navegador.

Para una plataforma de ciencia ciudadana esto es una maqueta, no un producto. Es la
decisión que hay que tomar primero si vas a seguir con esto:

- **Mantener sin servidor** — sirve como demo y para mostrar la idea, pero nunca va a
  acumular datos reales de la comunidad.
- **Backend liviano** — Supabase o Firebase dan auth + base de datos con capa gratis y
  sin administrar servidores. Es el camino más corto a reportes reales.
- **Sin backend pero con persistencia** — que el formulario abra un issue de GitHub o
  mande a un Google Form. Feo pero funciona y es gratis.

## 4. Cómo levantarlo

```bash
python -m http.server 8080
```

HTML + CSS + JS vanilla, Leaflet 1.9.4 por CDN, sin build. Deploy automático a GitHub
Pages en cada push a `main` vía `.github/workflows/pages.yml`.

## 5. Estructura

```
apadrina-geositio-chile/
├── index.html
├── styles.css          # dark theme, --bg:#0f1419
├── app.js              # Leaflet + localStorage (410 líneas)
└── data/geositios.json # 49 geositios
```

Marcadores por relevancia: naranja `#d9764a` nacional · verde `#5fb878` regional ·
gris `#8b949e` local.

## 6. Arreglado en la entrega

El hash SRI de `leaflet.js` en `index.html` estaba mal, así que el navegador **bloqueaba
Leaflet y el mapa no cargaba**. Corregido al hash real
(`sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=`).

## 7. Próximos pasos sugeridos

1. Decidir el tema del backend (sección 3). Todo lo demás depende de eso.
2. Validar coordenadas y relevancia contra las fichas oficiales SERNAGEOMIN 2024.
3. Cruzar los 49 geositios con los 22 contextos de
   [dashboard-22-contextos](https://github.com/MendozaVolcanic/dashboard-22-contextos):
   ese cruce le falta a los dos repos.
4. Fotos de los geositios — hoy no hay ninguna.

## 8. Suite Geopatrimonio

- [contextos-geologicos](https://github.com/MendozaVolcanic/contextos-geologicos) — repo maestro
- [georrutas-chile](https://github.com/MendozaVolcanic/georrutas-chile) — rutas geoturísticas
- **apadrina-geositio-chile** *(este repo)*
- [dashboard-22-contextos](https://github.com/MendozaVolcanic/dashboard-22-contextos) — gestión SGCh

## Pendientes de la auditoría de código

Auditoría del 2026-08-24 con seis revisores. Informe completo en el repo maestro:
[`contextos-geologicos/reviews/code-review/`](https://github.com/MendozaVolcanic/contextos-geologicos/blob/main/reviews/code-review/2026-08-24_CODE-REVIEW-REPORT.md).

**Ya corregido:** el hash SRI de Leaflet que impedía cargar el mapa.

**Abierto — decisión de arquitectura, no urgente.** Los tres dashboards de la Suite
comparten utilidades casi idénticas (helper de creación de nodos, manejo de pestañas, carga
de datos, render de tablas y mapas). Un revisor lo marcó como crítico y **se rebajó a
menor** por una razón concreta: son tres repos independientes, cada uno con su propio
deploy a GitHub Pages. Compartir código entre ellos exigiría submodules de git o servir un
`shared.js` desde un CDN, y ese acoplamiento entre repos con ciclos de vida separados es
peor problema que la duplicación actual. Si algún día se consolidan en un solo repo con
tres carpetas, ahí sí conviene extraer el núcleo común.

Ninguno de los tres proyectos tiene linters ni tests configurados.
