/* ============================================================
   Apadrina un Geositio · Chile — app.js
   Ciencia ciudadana para el patrimonio geológico de Chile
   ============================================================ */

'use strict';

// ── ESTADO GLOBAL ────────────────────────────────────────────
const State = {
  geositios: [],
  filtrados: [],
  selectedId: null,
  markers: {},
  map: null,
};

// ── COLORES POR RELEVANCIA ───────────────────────────────────
const RELEVANCIA_COLOR = {
  nacional: '#d9764a',
  regional: '#5fb878',
  local:    '#8b949e',
};

// ── UTILIDADES ───────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function estadoLabel(v) {
  const m = { bueno: 'Buen estado', regular: 'Estado regular', deteriorado: 'Deteriorado' };
  return m[v] || escHtml(v);
}

// ── LOCALSTORAGE ─────────────────────────────────────────────
const LS_KEY = 'apadrina_reportes_v1';

function getReportes() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch (_) { return {}; }
}

function saveReporte(gstId, reporte) {
  const all = getReportes();
  if (!all[gstId]) all[gstId] = [];
  all[gstId].unshift(reporte);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

function getReportesPorSitio(gstId) {
  return getReportes()[gstId] || [];
}

function tieneRegistro(gstId) {
  return getReportesPorSitio(gstId).length > 0;
}

// ── ICONOS SVG ───────────────────────────────────────────────
function crearIcono(color) {
  const safeColor = color.replace(/[^#a-zA-Z0-9]/g, '');
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="34" viewBox="0 0 26 34">',
    '<path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21S26 22.75 26 13C26 5.82 20.18 0 13 0z"',
    ' fill="' + safeColor + '" opacity="0.95"/>',
    '<circle cx="13" cy="13" r="5.5" fill="white" opacity="0.9"/>',
    '<circle cx="13" cy="13" r="3" fill="' + safeColor + '"/>',
    '</svg>',
  ].join('');
  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [26, 34],
    iconAnchor: [13, 34],
    popupAnchor:[0, -32],
  });
}

// ── INIT MAPA ────────────────────────────────────────────────
function initMap() {
  State.map = L.map('map', {
    center: [-35.5, -70.5],
    zoom: 5,
    zoomControl: true,
    attributionControl: true,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_matter_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://osm.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
    zIndex: 1,
  }).addTo(State.map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
    attribution: '',
    maxZoom: 18,
    zIndex: 3,
    opacity: 0.7,
  }).addTo(State.map);
}

// ── POPUP (DOM puro, sin innerHTML con datos externos) ────────
function crearPopupDOM(g) {
  const wrap = document.createElement('div');
  wrap.className = 'popup-inner';

  const h3 = document.createElement('h3');
  h3.textContent = g.nombre;
  wrap.appendChild(h3);

  const meta = document.createElement('div');
  meta.className = 'popup-meta';
  meta.textContent = g.id + ' · ' + g.region;
  wrap.appendChild(meta);

  const desc = document.createElement('div');
  desc.className = 'popup-desc';
  desc.textContent = g.descripcion_corta;
  wrap.appendChild(desc);

  const btn = document.createElement('button');
  btn.className = 'popup-btn';
  btn.textContent = 'Ver detalle y reportar';
  btn.addEventListener('click', function () {
    abrirDetalle(g.id);
  });
  wrap.appendChild(btn);

  return wrap;
}

// ── MARKERS ──────────────────────────────────────────────────
function agregarMarkers(lista) {
  Object.keys(State.markers).forEach(id => {
    if (!lista.find(g => g.id === id)) {
      State.map.removeLayer(State.markers[id]);
      delete State.markers[id];
    }
  });

  lista.forEach(g => {
    if (State.markers[g.id]) return;

    const color  = RELEVANCIA_COLOR[g.relevancia] || '#8b949e';
    const marker = L.marker([g.lat, g.lon], { icon: crearIcono(color) }).addTo(State.map);
    marker.bindPopup(crearPopupDOM(g), { closeButton: false, maxWidth: 240 });
    marker.on('click', () => seleccionarItem(g.id, false));
    State.markers[g.id] = marker;
  });
}

// ── SIDEBAR ───────────────────────────────────────────────────
function renderSidebar(lista) {
  const container = document.getElementById('geositio-list');
  container.innerHTML = '';

  lista.forEach(g => {
    const tieneReg = tieneRegistro(g.id);
    const item = document.createElement('div');
    item.className = 'geositio-item' + (State.selectedId === g.id ? ' active' : '');
    item.dataset.id = g.id;
    item.setAttribute('role', 'listitem');

    const top = document.createElement('div');
    top.className = 'gi-top';

    const nombre = document.createElement('span');
    nombre.className = 'gi-nombre';
    nombre.textContent = g.nombre;

    const codigo = document.createElement('span');
    codigo.className = 'gi-codigo';
    codigo.textContent = g.id;

    top.appendChild(nombre);
    top.appendChild(codigo);

    const bottom = document.createElement('div');
    bottom.className = 'gi-bottom';

    const region = document.createElement('span');
    region.className = 'gi-region';
    region.textContent = g.region;

    const badgeRel = document.createElement('span');
    badgeRel.className = 'badge-relevancia ' + g.relevancia;
    badgeRel.textContent = g.relevancia;

    const badgeEst = document.createElement('span');
    badgeEst.className = 'badge-estado ' + (tieneReg ? 'con_registro' : 'sin_registro');
    badgeEst.textContent = tieneReg ? 'con registro' : 'sin registro';

    bottom.appendChild(region);
    bottom.appendChild(badgeRel);
    bottom.appendChild(badgeEst);

    item.appendChild(top);
    item.appendChild(bottom);
    item.addEventListener('click', () => seleccionarItem(g.id, true));
    container.appendChild(item);
  });
}

function actualizarContador() {
  const all = getReportes();
  const monitoreados = Object.keys(all).filter(k => all[k].length > 0).length;
  document.getElementById('counter-num').textContent = monitoreados;
}

// ── FILTRO REGIÓN ────────────────────────────────────────────
function poblarFiltroRegion() {
  const regiones = [...new Set(State.geositios.map(g => g.region))].sort();
  const sel = document.getElementById('region-filter');
  regiones.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r;
    opt.textContent = r;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    const val = sel.value;
    State.filtrados = val === ''
      ? [...State.geositios]
      : State.geositios.filter(g => g.region === val);
    renderSidebar(State.filtrados);
    agregarMarkers(State.filtrados);
  });
}

// ── SELECCIONAR ITEM ──────────────────────────────────────────
function seleccionarItem(gstId, flyTo) {
  State.selectedId = gstId;

  document.querySelectorAll('.geositio-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === gstId);
  });

  const g = State.geositios.find(x => x.id === gstId);
  if (!g) return;

  if (flyTo && State.markers[gstId]) {
    State.map.flyTo([g.lat, g.lon], 9, { duration: 1 });
    State.markers[gstId].openPopup();
  }

  abrirDetalle(gstId);
}

// ── PANEL DETALLE ─────────────────────────────────────────────
function abrirDetalle(gstId) {
  const g = State.geositios.find(x => x.id === gstId);
  if (!g) return;
  State.selectedId = gstId;

  document.getElementById('detail-nombre').textContent = g.nombre;
  document.getElementById('detail-codigo').textContent = g.id;
  document.getElementById('detail-region').textContent = g.region;

  const badge = document.getElementById('detail-relevancia');
  badge.textContent = g.relevancia;
  badge.className = 'badge-relevancia ' + g.relevancia;

  document.getElementById('detail-desc').textContent = g.descripcion_corta;

  document.getElementById('report-form').reset();
  document.getElementById('report-fecha').value = new Date().toISOString().split('T')[0];

  const btn = document.getElementById('btn-submit');
  btn.textContent = 'Enviar reporte';
  btn.classList.remove('success');

  renderReportesPrevios(gstId);

  const panel = document.getElementById('detail-panel');
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');

  const activeEl = document.querySelector('.geositio-item.active');
  if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cerrarDetalle() {
  const panel = document.getElementById('detail-panel');
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  State.selectedId = null;
  document.querySelectorAll('.geositio-item').forEach(el => el.classList.remove('active'));
}

function renderReportesPrevios(gstId) {
  const reportes = getReportesPorSitio(gstId);
  const container = document.getElementById('reportes-lista');
  container.innerHTML = '';

  if (reportes.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-reportes';
    p.textContent = 'Todavía no hay reportes para este geositio. ¡Sé el primero en registrar una visita!';
    container.appendChild(p);
    return;
  }

  reportes.forEach(r => {
    const card = document.createElement('div');
    card.className = 'reporte-card';

    const header = document.createElement('div');
    header.className = 'r-header';

    const visitante = document.createElement('span');
    visitante.className = 'r-visitante';
    visitante.textContent = r.visitante || 'Anónimo';

    const fecha = document.createElement('span');
    fecha.className = 'r-fecha';
    fecha.textContent = r.fecha || '';

    header.appendChild(visitante);
    header.appendChild(fecha);

    const estadoEl = document.createElement('span');
    estadoEl.className = 'r-estado ' + (r.conservacion || '');
    estadoEl.textContent = estadoLabel(r.conservacion);

    const obs = document.createElement('div');
    obs.className = 'r-obs';
    if (r.observacion) {
      obs.textContent = r.observacion;
    } else {
      const em = document.createElement('em');
      em.style.opacity = '0.5';
      em.textContent = 'Sin observaciones';
      obs.appendChild(em);
    }

    card.appendChild(header);
    card.appendChild(estadoEl);
    card.appendChild(obs);
    container.appendChild(card);
  });
}

// ── FORMULARIO ────────────────────────────────────────────────
function initForm() {
  document.getElementById('report-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const gstId = State.selectedId;
    if (!gstId) return;

    const reporte = {
      gstId,
      fecha:        document.getElementById('report-fecha').value,
      visitante:    (document.getElementById('report-visitante').value.trim() || 'Anónimo').slice(0, 80),
      observacion:  document.getElementById('report-obs').value.trim().slice(0, 600),
      conservacion: document.getElementById('report-conservacion').value,
      ts:           Date.now(),
    };

    saveReporte(gstId, reporte);

    const btn = document.getElementById('btn-submit');
    btn.textContent = '¡Reporte guardado!';
    btn.classList.add('success');

    renderReportesPrevios(gstId);
    actualizarContador();
    renderSidebar(State.filtrados);
    showToast('Reporte guardado en este dispositivo');

    setTimeout(function () {
      btn.textContent = 'Enviar reporte';
      btn.classList.remove('success');
      document.getElementById('report-form').reset();
      document.getElementById('report-fecha').value = new Date().toISOString().split('T')[0];
    }, 2000);
  });
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 2800);
}

// ── MAIN ──────────────────────────────────────────────────────
(async function main() {
  initMap();

  const resp = await fetch('./data/geositios.json');
  State.geositios = await resp.json();
  State.filtrados  = State.geositios.slice();

  agregarMarkers(State.geositios);
  poblarFiltroRegion();
  renderSidebar(State.geositios);
  actualizarContador();
  initForm();

  document.getElementById('close-detail').addEventListener('click', cerrarDetalle);

  // Exponer para compatibilidad con llamadas desde el popup
  window.abrirDetalle = abrirDetalle;
}());
