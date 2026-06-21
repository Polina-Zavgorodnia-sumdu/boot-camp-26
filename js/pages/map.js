/* ============================================================
   pages/map.js — Інтерактивна SVG-карта регіонів України
   ============================================================ */

let _mapMetric  = 'salary';
let _mapLoaded  = false;
let _mapYear    = 2024;
let _mapRegions = [];

/* Відповідність id регіону в SVG → id в нашій БД */
const SVG_TO_DB = {
  'UA.CK': 'cherkasy',      'UA.CH': 'chernihiv',     'UA.CV': 'chernivtsi',
  'UA.KR': 'crimea',        // Крим
  'UA.DP': 'dnipro',         'UA.DT': 'donetsk',       'UA.IF': 'ivano-frankivsk',
  'UA.KK': 'kharkiv',        'UA.KS': 'kherson',       'UA.KM': 'khmelnytskyi',
  'UA.KH': 'kirovograd',     'UA.KC': 'kyiv',           'UA.KV': 'kyiv-obl',
  'UA.LH': 'luhansk',        'UA.LV': 'lviv',           'UA.MK': 'mykolaiv',
  'UA.MY': 'odesa',          'UA.PL': 'poltava',        'UA.RV': 'rivne',
  'UA.SM': 'sumy',           'UA.TP': 'ternopil',       'UA.ZK': 'zakarpattia',
  'UA.ZP': 'zaporizhzhia',   'UA.ZT': 'zhytomyr',       'UA.VI': 'vinnytsia',
  'UA.VO': 'volyn',          'UA.SC': 'sevastopol',     // Севастополь
};

const METRIC_CONFIG = {
  salary:       { label: 'Середня зарплата', unit: 'грн',       fmt: v => v.toLocaleString('uk-UA') },
  gdp:          { label: 'ВРП',              unit: 'млн грн',   fmt: v => v.toLocaleString('uk-UA') },
  unemployment: { label: 'Безробіття',       unit: '%',         fmt: v => v.toFixed(1) },
  population:   { label: 'Населення',        unit: 'тис. осіб', fmt: v => v.toLocaleString('uk-UA') },
};

function initMap() {
  if (!_mapRegions.length && window.REGIONS) {
    _mapRegions = [...window.REGIONS];
  }
  renderMapControls();
  if (!_mapLoaded) loadMapSvg();
  else             colorizeMap();
}

function renderMapControls() {
  const ctrl = document.getElementById('map-controls');
  if (!ctrl) return;
  const metricsHtml = Object.entries(METRIC_CONFIG).map(([k, v]) => `
    <button class="win-btn ${_mapMetric === k ? 'active' : ''}"
            onclick="setMapMetric('${k}',this)"
            style="${_mapMetric===k ? 'background:#000080;color:#fff;' : ''}">
      ${v.label}
    </button>`).join('');

  // Генеруємо всі роки від 2005 до 2024 (дані є лише з 2005)
  const years = [];
  for (let y = 2024; y >= 2005; y--) {
    years.push(y);
  }

  const yearHtml = `
    <select class="win-select" style="margin-left:auto; width:100px; padding: 2px 4px;" onchange="setMapYear(this.value)">
      ${years.map(y => `<option value="${y}" ${_mapYear == y ? 'selected' : ''}>${y}</option>`).join('')}
    </select>
  `;
  ctrl.style.display = 'flex';
  ctrl.style.gap = '8px';
  ctrl.style.flexWrap = 'wrap';
  ctrl.innerHTML = metricsHtml + yearHtml;
}

async function setMapYear(year) {
  _mapYear = parseInt(year, 10);
  _mapRegions = await UkrApi.regions('salary', 'desc', _mapYear);
  colorizeMap();
  updateMapLegend();
  const panel = document.getElementById('map-detail-panel');
  if (panel) panel.style.display = 'none';
}

function setMapMetric(metric, btn) {
  _mapMetric = metric;
  document.querySelectorAll('#map-controls .win-btn').forEach(b => {
    b.classList.remove('active');
    b.style.background = '';
    b.style.color = '';
  });
  btn.classList.add('active');
  btn.style.background = '#000080';
  btn.style.color = '#fff';
  colorizeMap();
  updateMapLegend();
}

async function loadMapSvg() {
  const container = document.getElementById('map-svg-container');
  if (!container) return;
  container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);"><img src="assets/hourglass.png" width="16" height="16" alt="Очікування" style="image-rendering:smooth;vertical-align:middle;"> Завантаження карти…</div>`;

  try {
    let svgText = '';
    if (typeof window.UKRAINE_SVG === 'string') {
      svgText = window.UKRAINE_SVG;
    } else {
      const resp = await fetch('data/ukraine_hc.svg');
      if (!resp.ok) throw new Error('SVG не знайдено');
      svgText = await resp.text();
    }
    container.innerHTML = svgText;

    const svg = container.querySelector('svg');
    if (!svg) throw new Error('Некоректний SVG');

    // Налаштовуємо SVG
    svg.style.width  = '100%';
    svg.style.height = '100%';
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Призначаємо обробники для кожного регіону
    svg.querySelectorAll('path[id], g[id]').forEach(el => {
      const svgId = el.id;
      if (!SVG_TO_DB.hasOwnProperty(svgId)) return;
      const dbId  = SVG_TO_DB[svgId];

      el.style.cursor = 'pointer';
      el.style.transition = 'filter 0.15s';

      el.addEventListener('mouseenter', e => {
        el.style.filter = 'brightness(1.2)';
        showMapTooltip(e, svgId, dbId);
      });
      el.addEventListener('mousemove', e => moveMapTooltip(e));
      el.addEventListener('mouseleave', () => {
        el.style.filter = '';
        hideMapTooltip();
      });
      el.addEventListener('click', () => {
        if (dbId) showRegionDetail(dbId);
      });
    });

    _mapLoaded = true;
    colorizeMap();
    updateMapLegend();

  } catch(e) {
    container.innerHTML = buildFallbackMap();
    _mapLoaded = true;
    colorizeMap();
    updateMapLegend();
  }
}

function colorizeMap() {
  if (!_mapRegions || !_mapRegions.length) return;
  const svg = document.querySelector('#map-svg-container svg');
  if (!svg) {
    buildFallbackMap();
    return;
  }
  
  // Знаходимо мін і макс
  const vals = _mapRegions.map(r => r[_mapMetric]).filter(v => typeof v === 'number' && !isNaN(v));
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);

  svg.querySelectorAll('path[id], g[id]').forEach(el => {
    const dbId = SVG_TO_DB[el.id];
    if (!dbId) {
      el.style.fill = '#e0e0e0';
      return;
    }
    const r = _mapRegions.find(x => x.id === dbId);
    if (!r || r[_mapMetric] == null) {
      el.style.fill = darkMode ? '#3a3a3a' : '#ccc';
      return;
    }
    const t = (r[_mapMetric] - minV) / (maxV - minV || 1);
    const rVal = Math.round(0   + t * 180);
    const gVal = Math.round(80  + t * 120);
    const bVal = Math.round(160 - t * 100);
    el.style.fill = `rgb(${rVal},${gVal},${bVal})`;
    el.style.stroke = darkMode ? '#1a1a1a' : '#ffffff';
    el.style.strokeWidth = '1.5px';
  });
}

function updateMapLegend() {
  const legend = document.getElementById('map-legend');
  if (!legend) return;
  const cfg  = METRIC_CONFIG[_mapMetric];
  const vals = _mapRegions.map(r => r[_mapMetric]).filter(v => v != null).sort((a,b) => a-b);
  const min  = vals[0], max = vals[vals.length-1];
  const mid  = ((min + max) / 2);

  legend.innerHTML = `
    <div style="font-size:10px;font-weight:700;margin-bottom:4px;">${cfg.label}, ${cfg.unit}</div>
    <div style="display:flex;align-items:center;gap:6px;">
      <span style="font-size:10px;">${cfg.fmt(min)}</span>
      <div style="width:120px;height:12px;background:linear-gradient(to right, rgb(0,80,160), rgb(180,200,60));border:1px solid #888;"></div>
      <span style="font-size:10px;">${cfg.fmt(max)}</span>
    </div>
    <div style="display:flex;gap:8px;margin-top:4px;font-size:10px;color:var(--text-muted);">
      <span style="display:flex;align-items:center;gap:3px;"><span style="display:inline-block;width:12px;height:12px;background:${darkMode?'#3a3a3a':'#b0b0b0'};border:1px solid #888;"></span> Окупована / немає даних</span>
    </div>`;
}

/* ── Тултип ─────────────────────────────────────────────────── */

function showMapTooltip(e, svgId, dbId) {
  let tooltip = document.getElementById('map-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'map-tooltip';
    tooltip.style.cssText = `
      position:fixed;pointer-events:none;z-index:9999;
      background:${darkMode?'#1e1e2e':'#ffffcc'};
      border:1px solid ${darkMode?'#6ab0f5':'#000080'};
      padding:6px 8px;font-size:11px;font-family:Tahoma,sans-serif;
      box-shadow:2px 2px 4px rgba(0,0,0,0.3);
      min-width:140px;`;
    document.body.appendChild(tooltip);
  }

  const r = dbId ? _mapRegions.find(reg => reg.id === dbId) : null;

  if (!r) {
    if (dbId === 'crimea' || dbId === 'sevastopol') {
      tooltip.innerHTML = `
        <div style="font-weight:700;margin-bottom:2px;">Крим / окупована територія</div>
        <div style="color:#888;font-size:10px;">Тимчасово окупована РФ з 2014 р.<br>Дані відсутні.</div>`;
    } else {
      tooltip.innerHTML = `
        <div style="font-weight:700;margin-bottom:2px;">Дані відсутні</div>`;
    }
  } else {
    tooltip.innerHTML = `
      <div style="font-weight:700;margin-bottom:4px;">${r.name}</div>
      <table style="font-size:10px;border-collapse:collapse;">
        <tr><td style="color:#666;padding-right:8px;">${METRIC_CONFIG.salary.label}:</td>       <td style="font-weight:700;">${METRIC_CONFIG.salary.fmt(r.salary)} грн</td></tr>
        <tr><td style="color:#666;padding-right:8px;">${METRIC_CONFIG.gdp.label}:</td>          <td style="font-weight:700;">${METRIC_CONFIG.gdp.fmt(r.gdp)} млн грн</td></tr>
        <tr><td style="color:#666;padding-right:8px;">${METRIC_CONFIG.unemployment.label}:</td> <td style="font-weight:700;">${METRIC_CONFIG.unemployment.fmt(r.unemployment)}%</td></tr>
        <tr><td style="color:#666;padding-right:8px;">${METRIC_CONFIG.population.label}:</td>   <td style="font-weight:700;">${METRIC_CONFIG.population.fmt(r.population)} тис.</td></tr>
      </table>
      <div style="margin-top:4px;font-size:9px;color:#888;">Клік → детальна інформація</div>`;
  }

  tooltip.style.display = 'block';
  moveMapTooltip(e);
}

function moveMapTooltip(e) {
  const t = document.getElementById('map-tooltip');
  if (!t) return;
  t.style.left = (e.clientX + 14) + 'px';
  t.style.top  = (e.clientY - 10) + 'px';
}

function hideMapTooltip() {
  const t = document.getElementById('map-tooltip');
  if (t) t.style.display = 'none';
}

/* ── Деталь регіону (бічна панель) ─────────────────────────── */

function showRegionDetail(dbId) {
  const r = _mapRegions.find(reg => reg.id === dbId);
  if (!r) return;

  const panel = document.getElementById('map-detail-panel');
  if (!panel) return;

  const validVals = _mapRegions.map(reg => reg[_mapMetric]).filter(v => typeof v === 'number' && !isNaN(v));
  let natAvg = 0;
  if (validVals.length > 0) {
    natAvg = validVals.reduce((a, b) => a + b, 0) / validVals.length;
  }
  
  let chgText = '';
  if (natAvg > 0) {
    const chg = (((r[_mapMetric] - natAvg) / natAvg) * 100).toFixed(1);
    const grammarSuffix = _mapMetric === 'salary' ? 'середньої' : 'середнього';
    chgText = `${METRIC_CONFIG[_mapMetric].label} ${+chg >= 0 ? '+' : ''}${chg}% відносно ${grammarSuffix} по Україні`;
  }

  panel.innerHTML = `
    <div style="font-weight:700;font-size:12px;margin-bottom:6px;border-bottom:2px solid var(--win-shadow);padding-bottom:4px;">
      <img src="assets/inf.png" width="16" height="16" alt="Місце" style="image-rendering:smooth;vertical-align:middle;"> ${r.name} (${_mapYear})
    </div>
    <table style="font-size:11px;width:100%;border-collapse:collapse;">
      <tr style="background:var(--table-even);">
        <td style="padding:3px 6px;"><img src="assets/money.png" width="16" height="16" alt="Зарплата" style="image-rendering:smooth;vertical-align:middle;"> Зарплата</td>
        <td style="padding:3px 6px;font-weight:700;font-family:var(--font-mono);">${r.salary.toLocaleString('uk-UA')} грн</td>
      </tr>
      <tr>
        <td style="padding:3px 6px;"><img src="assets/economics.png" width="16" height="16" alt="ВРП" style="image-rendering:smooth;vertical-align:middle;"> ВРП</td>
        <td style="padding:3px 6px;font-weight:700;font-family:var(--font-mono);">${r.gdp.toLocaleString('uk-UA')} млн грн</td>
      </tr>
      <tr style="background:var(--table-even);">
        <td style="padding:3px 6px;"><img src="assets/безробіття.png" width="16" height="16" alt="Безробіття" style="image-rendering:smooth;vertical-align:middle;"> Безробіття</td>
        <td style="padding:3px 6px;font-weight:700;font-family:var(--font-mono);">${r.unemployment.toFixed(1)}%</td>
      </tr>
      <tr>
        <td style="padding:3px 6px;"><img src="assets/people.png" width="16" height="16" alt="Населення" style="image-rendering:smooth;vertical-align:middle;"> Населення</td>
        <td style="padding:3px 6px;font-weight:700;font-family:var(--font-mono);">${r.population.toLocaleString('uk-UA')} тис.</td>
      </tr>
    </table>
    <div style="margin-top:6px;font-size:10px;color:var(--text-muted);">
      ${chgText}
    </div>
    <button class="win-btn" style="margin-top:8px;width:100%;"
            onclick="navigate('compare');setTimeout(()=>preselectRegion('${r.id}'),80)">
      <img src="assets/compare.png" width="16" height="16" alt="Порівняти" style="image-rendering:smooth;vertical-align:middle;"> Порівняти з іншими →
    </button>
  `;
  panel.style.display = 'block';
}

/* ── Резервна карта (таблиця) якщо SVG не завантажився ──────── */

function buildFallbackMap() {
  const sorted = [..._mapRegions].sort((a, b) => b[_mapMetric] - a[_mapMetric]);
  return `
    <div style="padding:8px;">
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">
        <img src="assets/test.png" width="16" height="16" alt="Помилка" style="image-rendering:smooth;vertical-align:middle;"> SVG-карта недоступна. Покладіть файл <code>ukraine_hc.svg</code> у папку <code>data/</code>.
        Нижче — табличне відображення регіонів.
      </div>
      <table class="win-table" style="width:100%;">
        <thead><tr><th>#</th><th>Регіон</th><th>Зарплата (грн)</th><th>ВРП (млн грн)</th><th>Безробіття (%)</th><th>Населення (тис.)</th></tr></thead>
        <tbody>${sorted.map((r, i) => `
          <tr onclick="showRegionDetail('${r.id}')" style="cursor:pointer;">
            <td>${i+1}</td>
            <td>${r.name}</td>
            <td style="font-family:var(--font-mono)">${r.salary.toLocaleString('uk-UA')}</td>
            <td style="font-family:var(--font-mono)">${r.gdp.toLocaleString('uk-UA')}</td>
            <td style="font-family:var(--font-mono)">${r.unemployment.toFixed(1)}</td>
            <td style="font-family:var(--font-mono)">${r.population.toLocaleString('uk-UA')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* Рендер карти — викликається з toggleTheme */
function renderMap() {
  colorizeMap();
  updateMapLegend();
}
