/* ============================================================
   pages/api-explorer.js — API Explorer (інтерактивна консоль)
   ============================================================ */

/* ══════════════════════════════════════════════════════════════
   API EXPLORER
   ══════════════════════════════════════════════════════════════ */

const API_REGION_LABELS = {
  kyiv: 'Київ', 'kyiv-obl': 'Київська обл.', kharkiv: 'Харківська',
  dnipro: 'Дніпропетровська', odesa: 'Одеська', lviv: 'Львівська',
  zaporizhzhia: 'Запорізька', vinnytsia: 'Вінницька', poltava: 'Полтавська',
  cherkasy: 'Черкаська', sumy: 'Сумська', mykolaiv: 'Миколаївська',
  kherson: 'Херсонська', donetsk: 'Донецька', luhansk: 'Луганська',
  ternopil: 'Тернопільська', chernivtsi: 'Чернівецька', rivne: 'Рівненська',
  'ivano-frankivsk': 'Івано-Франківська', volyn: 'Волинська',
  zakarpattia: 'Закарпатська', khmelnytskyi: 'Хмельницька',
  chernihiv: 'Чернігівська', kirovograd: 'Кіровоградська', zhytomyr: 'Житомирська',
};

const API_REGION_CODES = Object.keys(API_REGION_LABELS);

const API_HISTORY_REGIONS = ['ukraine', 'kyiv', 'kharkiv', 'lviv', 'dnipro', 'odesa'];

const API_ENDPOINTS = [
  {
    method: 'GET', path: '/v1/statistics',
    desc: 'Статистика по регіонах за метрикою та роком',
    params: [
      { name:'metric',   type:'string',  req:true,  desc:'salary | gdp | unemployment | population' },
      { name:'region',   type:'string',  req:false, desc:"Код регіону або 'all' (за замовч.)" },
      { name:'year',     type:'integer', req:false, desc:'Рік 1998–2024 (всі якщо не вказано)' },
      { name:'format',   type:'string',  req:false, desc:'json | csv (за замовч. json)' },
      { name:'page',     type:'integer', req:false, desc:'Сторінка (за замовч. 1)' },
      { name:'per_page', type:'integer', req:false, desc:'Записів на сторінці, макс. 100' },
    ]
  },
  {
    method: 'GET', path: '/v1/statistics/history',
    desc: 'Динаміка показника по роках (1998–2024)',
    params: [
      { name:'metric', type:'string', req:true,  desc:'salary | unemployment | inflation | population | gdp' },
      { name:'region', type:'string', req:false, desc:'ukraine | kyiv | kharkiv | lviv | dnipro | odesa (тільки для salary)' },
      { name:'format', type:'string', req:false, desc:'json | csv' },
    ]
  },
  {
    method: 'GET', path: '/v1/regions',
    desc: 'Список регіонів з показниками за обраний рік',
    params: [
      { name:'sort_by', type:'string', req:false, desc:'salary | gdp | unemployment | population | name' },
      { name:'order',   type:'string', req:false, desc:'desc | asc' },
      { name:'year',    type:'integer', req:false, desc:'Рік (за замовч. 2024)' },
    ]
  },
  {
    method: 'GET', path: '/v1/regions/{id}',
    desc: 'Один регіон по ID (kyiv, lviv, dnipro, …)',
    params: [
      { name:'id', type:'string (path)', req:true, desc:'Ідентифікатор регіону: kyiv, lviv, odesa, …' },
    ]
  },
  {
    method: 'GET', path: '/v1/datasets',
    desc: 'Каталог датасетів з фільтрацією',
    params: [
      { name:'cat',      type:'string',  req:false, desc:'economy | labor | demography | inflation | regional | budget' },
      { name:'search',   type:'string',  req:false, desc:'Пошук по назві датасету' },
      { name:'page',     type:'integer', req:false, desc:'Сторінка (за замовч. 1)' },
      { name:'per_page', type:'integer', req:false, desc:'Записів на сторінці, макс. 100' },
    ]
  },
  {
    method: 'GET', path: '/v1/datasets/{id}',
    desc: 'Один датасет з каталогу по числовому ID',
    params: [
      { name:'id', type:'integer (path)', req:true, desc:'ID датасету від 1 до 12' },
    ]
  },
  {
    method: 'GET', path: '/v1/categories',
    desc: 'Список категорій статистики',
    params: []
  },
  {
    method: 'GET', path: '/v1/sources',
    desc: 'Список первинних джерел даних',
    params: [
      { name:'type', type:'string', req:false, desc:'Тип джерела (Офіційна статистика, Фінансові дані, …)' },
    ]
  },
  {
    method: 'GET', path: '/v1/dataset-data/{id}',
    desc: 'Повні дані конкретного датасету (1–12)',
    params: [
      { name:'id',   type:'integer (path)', req:true,  desc:'ID датасету від 1 до 12' },
      { name:'year', type:'integer',        req:false, desc:'Рік для регіональних даних (датасет #2)' },
    ]
  },
  {
    method: 'POST', path: '/v1/contact',
    desc: 'Надіслати повідомлення зворотного зв\'язку',
    params: [
      { name:'name',    type:'string (body)', req:true, desc:'Ім\'я відправника' },
      { name:'email',   type:'string (body)', req:true, desc:'Email адреса' },
      { name:'message', type:'string (body)', req:true, desc:'Текст повідомлення (мін. 10 символів)' },
    ]
  },
  {
    method: 'GET', path: '/health',
    desc: 'Перевірка стану сервера',
    params: []
  },
];

const TRY_ENDPOINTS = {
  statistics:   { method: 'GET',  params: ['metric','region','year','format'] },
  history:      { method: 'GET',  params: ['metric','region','format'] },
  regions:      { method: 'GET',  params: ['sort_by','order','year'] },
  region_id:    { method: 'GET',  params: ['region'] },
  datasets:     { method: 'GET',  params: ['cat','search'] },
  dataset_item: { method: 'GET',  params: ['id'] },
  categories:   { method: 'GET',  params: [] },
  sources:      { method: 'GET',  params: ['source_type'] },
  dataset_data: { method: 'GET',  params: ['id','year'] },
  contact:      { method: 'POST', params: ['contact'], body: true },
  health:       { method: 'GET',  params: [] },
};

const PARAM_WRAP_IDS = [
  'metric', 'region', 'year', 'format', 'id',
  'sort_by', 'order', 'cat', 'search', 'source_type', 'contact',
];

function apiVal(id, fallback = '') {
  const el = document.getElementById(id);
  return el ? (el.value ?? fallback) : fallback;
}

function fillSelect(id, options, selected) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = options.map(o => {
    const val = typeof o === 'string' ? o : o.value;
    const label = typeof o === 'string' ? o : o.label;
    const selAttr = val === selected ? ' selected' : '';
    return `<option value="${val}"${selAttr}>${label}</option>`;
  }).join('');
}

function regionOptions(mode) {
  if (mode === 'history') {
    return API_HISTORY_REGIONS.map(id => ({
      value: id,
      label: id === 'ukraine' ? 'ukraine — Україна' : `${id} — ${API_REGION_LABELS[id] || id}`,
    }));
  }
  if (mode === 'region_id') {
    return API_REGION_CODES.map(id => ({
      value: id,
      label: `${id} — ${API_REGION_LABELS[id]}`,
    }));
  }
  return [
    { value: 'all', label: 'all — всі регіони' },
    ...API_REGION_CODES.map(id => ({
      value: id,
      label: `${id} — ${API_REGION_LABELS[id]}`,
    })),
  ];
}

function metricOptions(mode) {
  if (mode === 'history') {
    return ['salary', 'unemployment', 'inflation', 'population', 'gdp'];
  }
  return ['salary', 'gdp', 'unemployment', 'population'];
}

function initApi() {
  checkApiHealth();

  const list = document.getElementById('api-endpoint-list');
  if (!list) return;
  list.innerHTML = API_ENDPOINTS.map((ep, i) => `
    <div class="tree-item ${i === 0 ? 'selected' : ''}"
         onclick="showApiDetail(${i}, this)"
         style="flex-direction:column;align-items:flex-start;gap:2px;padding:4px;">
      <span class="badge ${ep.method === 'POST' ? 'red' : ''}" style="font-size:9px;margin-bottom:2px;">${ep.method}</span>
      <span style="font-family:var(--font-mono);font-size:10px;word-break:break-all;">${ep.path}</span>
    </div>
  `).join('');

  showApiDetail(0, list.querySelector('.tree-item'));
  onApiEndpointChange();
  updateApiPreview();
}

async function checkApiHealth() {
  const label = document.getElementById('api-status-label');
  try {
    await fetch(`${API_BASE}/health`);
    if (label) label.innerHTML = '🟢 Бекенд підключено · <span style="font-family:var(--font-mono)">localhost:8000</span>';
  } catch {
    if (label) label.innerHTML = '🔴 Бекенд недоступний — запустіть: <span style="font-family:var(--font-mono)">uvicorn main:app --reload --port 8000</span>';
  }
}

function showApiDetail(idx, el) {
  document.querySelectorAll('#api-endpoint-list .tree-item').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
  const ep = API_ENDPOINTS[idx];

  document.getElementById('api-detail').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <span class="badge ${ep.method === 'POST' ? 'red' : ''}">${ep.method}</span>
      <span style="font-family:var(--font-mono);font-size:13px;font-weight:700;">${ep.path}</span>
    </div>
    <div style="font-size:11px;margin-bottom:8px;color:var(--text-muted);">${ep.desc}</div>
    ${ep.params.length ? `
    <div style="font-weight:700;margin-bottom:4px;font-size:11px;">Параметри:</div>
    <table class="win-table" style="margin-bottom:0;max-width:600px;">
      <thead><tr><th>Параметр</th><th>Тип</th><th>Обов'язк.</th><th>Опис</th></tr></thead>
      <tbody>${ep.params.map(p => `
        <tr>
          <td style="font-family:var(--font-mono)">${p.name}</td>
          <td style="color:var(--text-muted)">${p.type}</td>
          <td>${p.req ? '<span class="badge red" style="font-size:9px;">Так</span>' : '<span style="color:var(--text-muted)">—</span>'}</td>
          <td>${p.desc}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : '<div style="font-size:11px;color:var(--text-muted);">Параметрів немає</div>'}
  `;
}

function onApiEndpointChange() {
  const ep = document.getElementById('api-try-endpoint')?.value || 'statistics';
  const cfg = TRY_ENDPOINTS[ep] || TRY_ENDPOINTS.statistics;
  const visible = cfg.params;

  PARAM_WRAP_IDS.forEach(name => {
    const wrap = document.getElementById(`api-param-${name}-wrap`);
    if (wrap) wrap.style.display = visible.includes(name) ? 'flex' : 'none';
  });

  const regionLabel = document.getElementById('api-param-region-label');
  if (regionLabel) {
    regionLabel.textContent = ep === 'region_id' ? 'Region ID:' : 'Region:';
  }

  if (visible.includes('region')) {
    const mode = ep === 'history' ? 'history' : ep === 'region_id' ? 'region_id' : 'statistics';
    const current = apiVal('api-try-region', mode === 'history' ? 'ukraine' : 'kyiv');
    const valid = regionOptions(mode).map(o => o.value);
    fillSelect('api-try-region', regionOptions(mode), valid.includes(current) ? current : valid[0]);
  }

  if (visible.includes('metric')) {
    const current = apiVal('api-try-metric', 'salary');
    const opts = metricOptions(ep === 'history' ? 'history' : 'statistics');
    fillSelect('api-try-metric', opts, opts.includes(current) ? current : 'salary');
  }

  updateApiPreview();
}

function buildApiRequest() {
  const ep = document.getElementById('api-try-endpoint')?.value || 'statistics';
  const cfg = TRY_ENDPOINTS[ep] || TRY_ENDPOINTS.statistics;
  const base = API_BASE;

  if (ep === 'statistics') {
    const params = new URLSearchParams();
    params.set('metric', apiVal('api-try-metric', 'salary'));
    const region = apiVal('api-try-region', 'all');
    if (region) params.set('region', region);
    const year = apiVal('api-try-year');
    if (year) params.set('year', year);
    params.set('format', apiVal('api-try-format', 'json'));
    return { method: cfg.method, url: `${base}/v1/statistics?${params}` };
  }

  if (ep === 'history') {
    const params = new URLSearchParams();
    params.set('metric', apiVal('api-try-metric', 'salary'));
    params.set('region', apiVal('api-try-region', 'ukraine'));
    params.set('format', apiVal('api-try-format', 'json'));
    return { method: cfg.method, url: `${base}/v1/statistics/history?${params}` };
  }

  if (ep === 'regions') {
    const params = new URLSearchParams();
    params.set('sort_by', apiVal('api-try-sort-by', 'salary'));
    params.set('order', apiVal('api-try-order', 'desc'));
    const year = apiVal('api-try-year');
    if (year) params.set('year', year);
    return { method: cfg.method, url: `${base}/v1/regions?${params}` };
  }

  if (ep === 'region_id') {
    const rid = apiVal('api-try-region', 'kyiv');
    return { method: cfg.method, url: `${base}/v1/regions/${encodeURIComponent(rid)}` };
  }

  if (ep === 'datasets') {
    const params = new URLSearchParams();
    const cat = apiVal('api-try-cat');
    const search = apiVal('api-try-search').trim();
    if (cat) params.set('cat', cat);
    if (search) params.set('search', search);
    const qs = params.toString();
    return { method: cfg.method, url: `${base}/v1/datasets${qs ? '?' + qs : ''}` };
  }

  if (ep === 'dataset_item') {
    const id = apiVal('api-try-id', '1');
    return { method: cfg.method, url: `${base}/v1/datasets/${id}` };
  }

  if (ep === 'categories') {
    return { method: cfg.method, url: `${base}/v1/categories` };
  }

  if (ep === 'sources') {
    const params = new URLSearchParams();
    const type = apiVal('api-try-source-type');
    if (type) params.set('type', type);
    const qs = params.toString();
    return { method: cfg.method, url: `${base}/v1/sources${qs ? '?' + qs : ''}` };
  }

  if (ep === 'dataset_data') {
    const id = apiVal('api-try-id', '1');
    const params = new URLSearchParams();
    const year = apiVal('api-try-year');
    if (year) params.set('year', year);
    const qs = params.toString();
    return { method: cfg.method, url: `${base}/v1/dataset-data/${id}${qs ? '?' + qs : ''}` };
  }

  if (ep === 'contact') {
    return {
      method: cfg.method,
      url: `${base}/v1/contact`,
      body: {
        name: apiVal('api-try-contact-name'),
        email: apiVal('api-try-contact-email'),
        message: apiVal('api-try-contact-message'),
      },
    };
  }

  return { method: cfg.method, url: `${base}/health` };
}

function updateApiPreview() {
  const { method, url, body } = buildApiRequest();

  const methodEl = document.getElementById('api-preview-method');
  const urlEl = document.getElementById('api-preview-url');
  const bodyEl = document.getElementById('api-preview-body');

  if (methodEl) methodEl.textContent = method;
  if (urlEl) urlEl.textContent = url;
  if (bodyEl) {
    bodyEl.textContent = body ? JSON.stringify(body) : '';
    bodyEl.style.display = body ? 'inline' : 'none';
  }
}

function escapeHtmlUrl(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatRequestLine(method, url, body) {
  const safeUrl = escapeHtmlUrl(url);
  if (!body) return `${method} ${safeUrl}`;
  const safeBody = escapeHtmlUrl(JSON.stringify(body));
  return `${method} ${safeUrl}<br><span style="color:#aaa;">Body: ${safeBody}</span>`;
}

async function tryApi() {
  const console_ = document.getElementById('api-console');
  const { method, url, body } = buildApiRequest();
  const requestLine = formatRequestLine(method, url, body);

  if (!url) return;

  console_.innerHTML = `
    <div class="console-line console-comment"># Запит до API…</div>
    <div class="console-line console-prompt">${requestLine}</div>
    <div class="console-line" style="color:#888;"><img src="assets/hourglass.png" width="16" height="16" alt="Очікування" style="image-rendering:smooth;vertical-align:middle;"> Очікування відповіді…</div>`;

  const t0 = Date.now();
  try {
    const opts = { method };
    if (body) {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(body);
    }

    const resp = await fetch(url, opts);
    const ms   = Date.now() - t0;
    const ct   = resp.headers.get('content-type') || 'application/json';
    const isJson = ct.includes('json');

    let bodyText;
    if (isJson) {
      const data = await resp.json();
      bodyText = JSON.stringify(data, null, 2);
    } else {
      bodyText = await resp.text();
      bodyText = bodyText.slice(0, 800) + (bodyText.length > 800 ? '\n…(скорочено)' : '');
    }

    const size = new Blob([bodyText]).size;

    const highlighted = isJson
      ? bodyText
          .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"([^"]+)":/g, '"<span style="color:#88ccff">$1</span>":')
          .replace(/: (true|false|null)/g, ': <span style="color:#f9a825">$1</span>')
          .replace(/: (-?\d+\.?\d*)/g, ': <span style="color:#a5d6a7">$1</span>')
          .replace(/: "([^"]*)"/g, ': "<span style="color:#ffcc80">$1</span>"')
          .replace(/\n/g, '<br>').replace(/ {2}/g, '&nbsp;&nbsp;')
      : bodyText.replace(/\n/g,'<br>');

    console_.innerHTML = `
      <div class="console-line console-comment"># Live API Response · ${new Date().toLocaleTimeString('uk-UA')}</div>
      <div class="console-line console-prompt">${requestLine}</div>
      <div class="console-line" style="color:${resp.ok ? '#4caf50' : '#f44336'};">
        HTTP ${resp.status} ${resp.ok ? 'OK' : 'Error'} · ${ct.split(';')[0]} · ${size} bytes · ${ms}ms
      </div>
      <div class="console-line">&nbsp;</div>
      <div class="console-line console-response">${highlighted}</div>`;
  } catch(err) {
    const ms = Date.now() - t0;
    console_.innerHTML = `
      <div class="console-line console-comment"># API Error · ${new Date().toLocaleTimeString('uk-UA')}</div>
      <div class="console-line console-prompt">${requestLine}</div>
      <div class="console-line" style="color:#f44336;"><img src="assets/bin.png" width="16" height="16" alt="Помилка" style="image-rendering:smooth;vertical-align:middle;"> ${escapeHtmlUrl(err.message)} · ${ms}ms</div>
      <div class="console-line" style="color:#888;margin-top:4px;">
        Переконайтесь що бекенд запущено:<br>
        &nbsp;&nbsp;cd backend<br>
        &nbsp;&nbsp;uvicorn main:app --reload --port 8000
      </div>`;
  }
}
