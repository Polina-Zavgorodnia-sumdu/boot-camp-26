/* ============================================================
   pages/statistics.js — Каталог датасетів + деталь датасету
   datasets.js — Статистика, датасети, сторінка датасету
   ============================================================ */

/* ── STATISTICS PAGE ─────────────────────────────────────────── */

function initStatistics() { buildStatTree(); filterStatistics(); }

function buildStatTree() {
  const tree = document.getElementById('stat-tree');
  tree.innerHTML = `
    <div class="tree-item selected" onclick="filterByTree('',this)"><span class="ti-icon"><img src="assets/folder1.png" width="16" height="16" alt="Джерела" style="image-rendering:smooth;vertical-align:middle;"></span> Усі категорії</div>
    ${CATEGORIES.map(c => `<div class="tree-item" onclick="filterByTree('${c.id}',this)"><span class="ti-icon">${c.icon}</span> ${c.title}</div>`).join('')}
    <div style="margin-top:8px;font-size:10px;font-weight:700;text-transform:uppercase;">ДЖЕРЕЛА</div>
    <div class="tree-item" onclick="navigate('sources')"><span class="ti-icon"><img src="assets/paper.png" width="16" height="16" alt="Файл" style="image-rendering:smooth;vertical-align:middle;"></span> Держстат</div>
    <div class="tree-item" onclick="navigate('sources')"><span class="ti-icon"><img src="assets/paper.png" width="16" height="16" alt="Файл" style="image-rendering:smooth;vertical-align:middle;"></span> НБУ</div>
    <div class="tree-item" onclick="navigate('sources')"><span class="ti-icon"><img src="assets/paper.png" width="16" height="16" alt="Файл" style="image-rendering:smooth;vertical-align:middle;"></span> Мінфін</div>
  `;
}

function filterByTree(catId, el) {
  document.getElementById('stat-cat').value = catId;
  filterStatistics();
  document.querySelectorAll('#stat-tree .tree-item').forEach(t => t.classList.remove('selected'));
  if (el) el.classList.add('selected');
}

function filterStatistics() {
  const cat    = document.getElementById('stat-cat').value;
  const search = document.getElementById('stat-search').value.toLowerCase();
  const results = DATASETS.filter(d => {
    if (cat && d.cat !== cat) return false;
    if (search && !d.title.toLowerCase().includes(search)) return false;
    return true;
  });
  document.getElementById('stat-status').textContent = `${results.length} датасетів знайдено`;
  renderStatCards(results);
}

function setStatView(v) {
  statView = v;
  ['grid','list','details'].forEach(x => {
    document.getElementById('vbtn-'+x).classList.toggle('active', x === v);
  });
  filterStatistics();
}

function renderStatCards(datasets) {
  const container = document.getElementById('stat-cards-container');
  if (statView === 'details') {
    container.innerHTML = `
      <table class="win-table full">
        <thead><tr>
          <th onclick="sortStatTable(0,this)">Назва датасету ▲</th>
          <th onclick="sortStatTable(1,this)">Категорія</th>
          <th onclick="sortStatTable(2,this)">Роки</th>
          <th onclick="sortStatTable(3,this)">Джерело</th>
          <th onclick="sortStatTable(4,this)">Записів</th>
          <th>Дія</th>
        </tr></thead>
        <tbody>${datasets.map(d => `
          <tr onclick="openDataset(${d.id})" style="cursor:pointer">
            <td>${d.title}</td>
            <td><span class="badge">${CATEGORIES.find(c => c.id === d.cat)?.title || d.cat}</span></td>
            <td>${d.year}</td>
            <td>${d.source}</td>
            <td style="font-family:var(--font-mono)">${d.records.toLocaleString()}</td>
            <td><button class="win-btn" onclick="event.stopPropagation();openDataset(${d.id})">Відкрити</button></td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  } else if (statView === 'list') {
    container.innerHTML = datasets.map(d => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;border-bottom:1px solid var(--table-border);cursor:pointer;" onclick="openDataset(${d.id})">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:16px;">${CATEGORIES.find(c => c.id === d.cat)?.icon || '<img src="assets/visuals.png" width="16" height="16" alt="Графік" style="image-rendering:smooth;vertical-align:middle;">'}</span>
          <div>
            <div style="font-size:11px;font-weight:700;">${d.title}</div>
            <div style="font-size:10px;">${d.year} · ${d.source} · ${d.records.toLocaleString()} записів</div>
          </div>
        </div>
        <button class="win-btn">→</button>
      </div>`).join('');
  } else {
    container.innerHTML = `<div class="card-grid">${datasets.map(d => `
      <div class="cat-card inset" onclick="openDataset(${d.id})">
        <div class="cat-card-icon">${CATEGORIES.find(c => c.id === d.cat)?.icon || '<img src="assets/visuals.png" width="32" height="32" alt="Графік" style="image-rendering:smooth;vertical-align:middle;">'}</div>
        <div class="cat-card-title">${d.title}</div>
        <div class="cat-card-desc">${d.year} · ${d.source}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
          <span class="cat-card-meta">${d.records.toLocaleString()} записів</span>
          <span class="badge">${CATEGORIES.find(c => c.id === d.cat)?.title || d.cat}</span>
        </div>
      </div>`).join('')}</div>`;
  }
}

function sortStatTable(col, th) {
  if (statSortCol === col) statSortAsc = !statSortAsc;
  else { statSortCol = col; statSortAsc = true; }
  document.querySelectorAll('#stat-cards-container th').forEach(t => {
    t.textContent = t.textContent.replace(' ▲','').replace(' ▼','');
  });
  th.textContent += statSortAsc ? ' ▲' : ' ▼';
  const cat    = document.getElementById('stat-cat').value;
  const search = document.getElementById('stat-search').value.toLowerCase();
  let results  = DATASETS.filter(d => {
    if (cat && d.cat !== cat) return false;
    if (search && !d.title.toLowerCase().includes(search)) return false;
    return true;
  });
  const keys = ['title','cat','year','source','records'];
  results.sort((a, b) => {
    let va = a[keys[col]], vb = b[keys[col]];
    if (typeof va === 'number') return statSortAsc ? va-vb : vb-va;
    return statSortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });
  renderStatCards(results);
}

/* ── ПЕРЕХІД НА ДАТАСЕТ ──────────────────────────────────────── */

// Метадані кожного датасету: джерело, посилання, колонки таблиці, API-ендпоінт
const DS_META = {
  1:  { source:'Держстат України', url:'https://stat.gov.ua', cols:['Рік','Місто/регіон','Зарплата (грн)'], endpoint:'/v1/statistics/history?metric=salary&region=ukraine', note:'Динаміка по 6 містах + Україна в цілому' },
  2:  { source:'Держстат України', url:'https://stat.gov.ua', cols:['Регіон','ВРП (млн грн)'], endpoint:'/v1/regions?sort_by=gdp', note:'ВРП 2005–2013 (Держстат, СНР-2008); 2024 — оцінка з урахуванням війни' },
  3:  { source:'Держстат України', url:'https://stat.gov.ua', cols:['Рік','Безробіття (%)'], endpoint:'/v1/statistics/history?metric=unemployment', note:'Методологія МОП, 1998–2024' },
  4:  { source:'Держстат України', url:'https://stat.gov.ua', cols:['Рік','Населення (тис.)'], endpoint:'/v1/statistics/history?metric=population', note:'Наявне населення, тис. осіб' },
  5:  { source:'Держстат України', url:'https://stat.gov.ua', cols:['Рік','ІСЦ (%)','ВВП (млн грн)'], endpoint:'/v1/statistics/history?metric=inflation', note:'Індекс споживчих цін + номінальний ВВП' },
  6:  { source:'Держстат України', url:'https://stat.gov.ua', cols:['Рік','С/г (тис.)','Промисл. (тис.)','Послуги (тис.)'], endpoint:'/v1/dataset-data/6', note:'Зайнятість за секторами, 2010–2024' },
  7:  { source:'Міністерство фінансів України', url:'https://minfin.gov.ua', cols:['Рік','Доходи (млрд грн)','Видатки (млрд грн)','Баланс (млрд грн)'], endpoint:'/v1/dataset-data/7', note:'Держбюджет, 2000–2024' },
  8:  { source:'Держстат України', url:'https://stat.gov.ua', cols:['Рік','Індекс (2010=100)','Номінальна (грн)'], endpoint:'/v1/dataset-data/8', note:'Реальна зарплата відносно 2010 р.' },
  9:  { source:'Держстат України', url:'https://stat.gov.ua', cols:['Рік','Народження (тис.)','Смерті (тис.)','Приріст (тис.)'], endpoint:'/v1/dataset-data/9', note:'Природний рух, 2000–2024' },
  10: { source:'Держстат України', url:'https://stat.gov.ua', cols:['Рік','ІЦВ (% зміна)'], endpoint:'/v1/dataset-data/10', note:'Індекс цін виробників, 2005–2024' },
  11: { source:'Держстат України', url:'https://stat.gov.ua', cols:['Рік','Оплата праці (%)','Вал. прибуток (%)','Податки (%)'], endpoint:'/v1/dataset-data/11', note:'Структура ВВП за доходами, 2010–2024' },
  12: { source:'Держстат України + НБУ', url:'https://stat.gov.ua', cols:['Рік','Експорт (млрд USD)','Імпорт (млрд USD)','Баланс (млрд USD)'], endpoint:'/v1/dataset-data/12', note:'Зовнішня торгівля, 2000–2024' },
};

function openDataset(id) {
  _currentDatasetId = id;
  const ds   = DATASETS.find(d => d.id === id);
  const meta = DS_META[id] || {};

  if (currentPage !== 'statistics') navigate('statistics');

  if (ds) {
    const dsTitle = document.getElementById('ds-title');
    if (dsTitle) dsTitle.textContent = ds.title;
    const catBadge = document.getElementById('ds-cat-badge');
    if (catBadge) catBadge.textContent = CATEGORIES.find(c => c.id === ds.cat)?.title || ds.cat;
    const updEl = document.getElementById('ds-updated');
    if (updEl) updEl.textContent = ds.updated || '01.2024';
    const recEl = document.getElementById('ds-records-meta');
    if (recEl) recEl.textContent = ds.records.toLocaleString() + ' записів · ' + ds.year;
    const srcLink = document.getElementById('ds-source-link');
    if (srcLink) { srcLink.textContent = meta.source || ds.source || 'stat.gov.ua'; srcLink.href = meta.url || 'https://stat.gov.ua'; }
    const winTitle = document.querySelector('#page-statistics .win-title');
    if (winTitle) winTitle.textContent = ds.title + ' — УкрДані';
    const stEl = document.getElementById('stat-status');
    if (stEl) stEl.textContent = ds.title;
  }

  const catalog   = document.getElementById('stat-catalog-view');
  const detail    = document.getElementById('stat-dataset-view');
  const leftPanel = document.getElementById('stat-left-panel');
  if (catalog)   catalog.style.display   = 'none';
  if (detail)    { detail.style.display  = 'flex'; detail.style.flexDirection = 'column'; }
  if (leftPanel) leftPanel.style.display = 'none';

  const tbCatalog = document.getElementById('stat-toolbar-catalog');
  const tbDataset = document.getElementById('stat-toolbar-dataset');
  const backBtn   = document.getElementById('stat-back-to-list-btn');
  if (tbCatalog) tbCatalog.style.display = 'none';
  if (tbDataset) tbDataset.style.display = 'inline-flex';
  if (backBtn)   backBtn.style.display   = 'inline-flex';

  document.querySelectorAll('#ds-tab-charts,#ds-tab-table,#ds-tab-api,#ds-tab-sources').forEach(p => p.classList.remove('active'));
  document.getElementById('ds-tab-charts')?.classList.add('active');
  document.querySelectorAll('#ds-tabs .tab-btn').forEach((b, i) => b.classList.toggle('active', i === 0));

  renderDatasetChart(id);

  // Налаштовуємо фільтр року таблиці відповідно до датасету
  const dsYearSel = document.getElementById('ds-year');
  if (dsYearSel) {
    if (id === 2) {
      // ВРП регіонів — 2005–2024
      const gdpYears = [2024, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005];
      dsYearSel.innerHTML = `<option value="">Всі</option>` +
        gdpYears.map(y => `<option value="${y}">${y}</option>`).join('');
    } else {
      // Стандартний список для інших датасетів
      dsYearSel.innerHTML = `
        <option value="">Всі</option>
        <option>2024</option><option>2023</option><option>2022</option>
        <option>2021</option><option>2020</option><option>2019</option>
        <option>2018</option><option>2010</option><option>2004</option><option>1998</option>`;
    }
  }
}

/* Повернутись до каталогу */
function closeDatasetDetail() {
  const catalog   = document.getElementById('stat-catalog-view');
  const detail    = document.getElementById('stat-dataset-view');
  const leftPanel = document.getElementById('stat-left-panel');
  if (catalog)   catalog.style.display   = 'block';
  if (detail)    detail.style.display    = 'none';
  if (leftPanel) leftPanel.style.display = 'block';

  const tbCatalog = document.getElementById('stat-toolbar-catalog');
  const tbDataset = document.getElementById('stat-toolbar-dataset');
  const backBtn   = document.getElementById('stat-back-to-list-btn');
  if (tbCatalog) tbCatalog.style.display = 'inline-flex';
  if (tbDataset) tbDataset.style.display = 'none';
  if (backBtn)   backBtn.style.display   = 'none';

  const winTitle = document.querySelector('#page-statistics .win-title');
  if (winTitle) winTitle.textContent = 'Statistics Explorer — УкрДані';

  _currentDatasetId = null;
  filterStatistics();
}

/* ── ПЕРЕМИКАННЯ ТАБІВ ───────────────────────────────────────── */

function switchDsTab(tab, btn) {
  document.querySelectorAll('#ds-tab-charts,#ds-tab-table,#ds-tab-api,#ds-tab-sources').forEach(p => p.classList.remove('active'));
  document.getElementById('ds-tab-' + tab)?.classList.add('active');
  document.querySelectorAll('#ds-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (tab === 'charts')  renderDatasetChart(_currentDatasetId);
  if (tab === 'table')   loadTableFromApi();
  if (tab === 'api')     renderDsApiTab(_currentDatasetId);
  if (tab === 'sources') renderDsSourcesTab(_currentDatasetId);
}

/* ── ТАБЛИЦЯ: дані з /v1/dataset-data/{id} ──────────────────── */

async function loadTableFromApi() {
  const id = _currentDatasetId || 1;
  const yearFilter = document.getElementById('ds-year')?.value || '';
  const meta = DS_META[id] || {};

  // Покажемо лоадер
  const tbody = document.getElementById('ds-table-body');
  if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:16px;"><img src="assets/hourglass.png" width="16" height="16" alt="Очікування" style="image-rendering:smooth;vertical-align:middle;"> Завантаження…</td></tr>`;

  // Встановлюємо заголовки колонок з метаданих
  const thead = document.getElementById('ds-table-head');
  if (thead && meta.cols) {
    thead.innerHTML = meta.cols.map((c, i) => `<th onclick="sortTable(${i})">${c}</th>`).join('');
  }

  // Для датасету ВРП (bar_regions) додаємо рік у запит
  let url = `http://localhost:8000/v1/dataset-data/${id}`;
  if (id === 2 && yearFilter) url += `?year=${yearFilter}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('API error');
    const apiData = await resp.json();

    tableData = buildTableRows(apiData, yearFilter);
    document.getElementById('ds-rows-count').textContent = tableData.length + ' записів';
    document.getElementById('ds-table-count').textContent = tableData.length + ' записів';
    renderTable();
  } catch(e) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:16px;color:var(--red);"><img src="assets/test.png" width="16" height="16" alt="Помилка" style="image-rendering:smooth;vertical-align:middle;"> Помилка завантаження. Перевірте бекенд.</td></tr>`;
  }
}

/* Перетворює відповідь API в рядки для таблиці залежно від типу датасету */
function buildTableRows(apiData, yearFilter) {
  const rows = [];
  const yf = yearFilter ? parseInt(yearFilter) : null;

  const type = apiData.type;

  if (type === 'multi_line') {
    // #1 зарплата: [{year, value}, ...] для кожної серії
    apiData.series.forEach(s => {
      s.data.forEach(d => {
        if (yf && d.year !== yf) return;
        rows.push([d.year, s.label, d.value.toLocaleString('uk-UA')]);
      });
    });
  } else if (type === 'bar_regions') {
    // #2 ВРП: [{region, value}]
    apiData.data.forEach(d => {
      rows.push([apiData.year, d.region, d.value.toLocaleString('uk-UA')]);
    });
  } else if (type === 'bar_line' || type === 'area_line') {
    // #3 безробіття, #4 населення, #10 ІЦВ
    apiData.data.forEach(d => {
      if (yf && d.year !== yf) return;
      rows.push([d.year, d.value]);
    });
  } else if (type === 'dual_axis') {
    // #5 ІСЦ+ВВП, #8 реальна зп: дві серії по роках
    const s0 = apiData.series[0].data;
    const s1 = apiData.series[1].data;
    s0.forEach((d, i) => {
      if (yf && d.year !== yf) return;
      rows.push([d.year, d.value, s1[i]?.value]);
    });
  } else if (type === 'stacked_bar') {
    // #6 зайнятість, #11 структура ВВП
    const years = apiData.series[0].data.map(d => d.year);
    years.forEach((y, yi) => {
      if (yf && y !== yf) return;
      rows.push([y, ...apiData.series.map(s => s.data[yi].value)]);
    });
  } else if (type === 'budget' || type === 'trade' || type === 'natural_movement') {
    // #7 бюджет, #12 торгівля, #9 природний рух
    const years = apiData.series[0].data.map(d => d.year);
    years.forEach((y, yi) => {
      if (yf && y !== yf) return;
      rows.push([y, ...apiData.series.map(s => s.data[yi].value)]);
    });
  }

  return rows;
}

function renderTable() {
  const search  = document.getElementById('ds-table-search')?.value?.toLowerCase() || '';
  let filtered  = tableData.filter(row => !search || row.some(cell => String(cell).toLowerCase().includes(search)));
  document.getElementById('ds-table-count').textContent = filtered.length + ' записів';

  // Сортування
  filtered.sort((a, b) => {
    let va = a[tableSortCol], vb = b[tableSortCol];
    if (typeof va === 'number' && typeof vb === 'number') return tableSortAsc ? va-vb : vb-va;
    return tableSortAsc ? String(va).localeCompare(String(vb),'uk') : String(vb).localeCompare(String(va),'uk');
  });

  const total = Math.ceil(filtered.length / PAGE_SIZE);
  tablePage_   = Math.min(tablePage_, Math.max(0, total - 1));
  const page   = filtered.slice(tablePage_ * PAGE_SIZE, tablePage_ * PAGE_SIZE + PAGE_SIZE);
  document.getElementById('ds-page-info').textContent = `Стор. ${tablePage_ + 1} з ${total || 1}`;

  // Оновлення позначок сортування в заголовках
  document.querySelectorAll('#ds-table thead th').forEach((th, i) => {
    th.textContent = th.textContent.replace(' ▲','').replace(' ▼','');
    if (i === tableSortCol) th.textContent += tableSortAsc ? ' ▲' : ' ▼';
  });

  document.getElementById('ds-table-body').innerHTML = page.map(row =>
    `<tr>${row.map((cell, i) => {
      const isNum = typeof cell === 'number';
      const fmt   = isNum ? cell.toLocaleString('uk-UA') : cell;
      return `<td style="${i > 0 && isNum ? 'font-family:var(--font-mono);font-weight:700;' : ''}">${fmt ?? '—'}</td>`;
    }).join('')}</tr>`
  ).join('');
}

function filterTable(val) { tablePage_ = 0; renderTable(); }
function tablePage(dir) {
  const search  = document.getElementById('ds-table-search')?.value?.toLowerCase() || '';
  const filtered = tableData.filter(row => !search || row.some(c => String(c).toLowerCase().includes(search)));
  tablePage_ = Math.max(0, Math.min(tablePage_ + dir, Math.ceil(filtered.length / PAGE_SIZE) - 1));
  renderTable();
}
function sortTable(col) {
  if (tableSortCol === col) tableSortAsc = !tableSortAsc;
  else { tableSortCol = col; tableSortAsc = true; }
  renderTable();
}

/* ── ВКЛАДКА API ─────────────────────────────────────────────── */

function renderDsApiTab(id) {
  const ds   = DATASETS.find(d => d.id === id);
  const meta = DS_META[id] || {};
  const endpoint = `http://localhost:8000${meta.endpoint || '/v1/dataset-data/' + id}`;

  document.getElementById('ds-api-endpoint-block').innerHTML = `
    <div class="console-line console-comment"># GET запит для датасету: ${ds?.title || ''}</div>
    <div class="console-line console-prompt">GET ${endpoint}</div>
    <div class="console-line console-comment"># ${meta.note || ''}</div>
  `;

  document.getElementById('ds-api-params-table').innerHTML = `
    <thead><tr><th>Параметр</th><th>Тип</th><th>Опис</th></tr></thead>
    <tbody>
      <tr><td style="font-family:var(--font-mono)">format</td><td>string</td><td>json (за замовч.) | csv</td></tr>
      <tr><td style="font-family:var(--font-mono)">region</td><td>string</td><td>all | kyiv | lviv | … (для деяких ендпоінтів)</td></tr>
      <tr><td style="font-family:var(--font-mono)">year</td><td>integer</td><td>Конкретний рік 1998–2024 (для деяких ендпоінтів)</td></tr>
    </tbody>
  `;

  // Підвантажуємо реальний приклад відповіді
  const responseBlock = document.getElementById('ds-api-response-block');
  responseBlock.innerHTML = `<div class="console-line" style="color:#888;"><img src="assets/hourglass.png" width="16" height="16" alt="Очікування" style="image-rendering:smooth;vertical-align:middle;"> Отримання відповіді…</div>`;

  fetch(`http://localhost:8000/v1/dataset-data/${id}`)
    .then(r => r.json())
    .then(data => {
      // Показуємо скорочену версію (перші 3 елементи першої серії)
      const preview = { ...data };
      if (preview.series) preview.series = preview.series.map(s => ({ ...s, data: s.data.slice(0,3).concat([{ year:'…', value:'…' }]) }));
      if (preview.data)   preview.data   = preview.data.slice(0,3).concat([{ '…':'…' }]);
      const json = JSON.stringify(preview, null, 2);
      responseBlock.innerHTML = `<div class="console-line console-response">${
        json.replace(/\n/g,'<br>').replace(/ /g,'&nbsp;')
            .replace(/"([^"]+)":/g,'"<span style="color:#88ccff">$1</span>":')
            .replace(/: (\d+\.?\d*)/g,': <span style="color:#a5d6a7">$1</span>')
      }</div>`;
    })
    .catch(() => {
      responseBlock.innerHTML = `<div class="console-line" style="color:var(--red);"><img src="assets/bin.png" width="16" height="16" alt="Помилка" style="image-rendering:smooth;vertical-align:middle;"> Бекенд не відповідає</div>`;
    });
}

/* ── ВКЛАДКА ДЖЕРЕЛА ─────────────────────────────────────────── */

const DS_SOURCES_DETAIL = {
  1:  [{ name:'Держстат — Зарплата', url:'https://www.ukrstat.gov.ua/operativ/operativ2007/gdn/sr_zp/sr_zp_u/arh_szp_u.htm',    org:'Держстат України',  license:'CC BY 4.0' }],
  2:  [{ name:'Держстат — ВРП регіонів', url:'https://www.ukrstat.gov.ua/operativ/operativ2012/vvp/vrp/vrp_u.htm',              org:'Держстат України',  license:'CC BY 4.0' }],
  3:  [{ name:'Держстат — Зайнятість та безробіття', url:'https://www.ukrstat.gov.ua/operativ/operativ2007/rp/ean/ean_u/arh_znz_u.htm', org:'Держстат України', license:'CC BY 4.0' }],
  4:  [{ name:'Держстат — Населення', url:'https://www.ukrstat.gov.ua/operativ/operativ2019/ds/kn/kn_u/kn1219_u.htm',           org:'Держстат України',  license:'CC BY 4.0' }],
  5:  [{ name:'Держстат — Індекси цін', url:'https://www.ukrstat.gov.ua/operativ/operativ2007/ct/is_c/arh_isc.htm',             org:'Держстат України',  license:'CC BY 4.0' },
       { name:'НБУ — Макроекономічні показники', url:'https://bank.gov.ua/ua/statistic/macro-indicators',                       org:'НБУ',               license:'CC BY 4.0' }],
  6:  [{ name:'Держстат — Зайнятість за видами діяльності', url:'https://www.ukrstat.gov.ua/operativ/operativ2014/rp/zn_ed/zn_ed_u/arh_zned_u.htm', org:'Держстат України', license:'CC BY 4.0' }],
  7:  [{ name:'Мінфін — Держбюджет', url:'https://minfin.gov.ua/ua/finance/budget/',                                            org:'Мінфін України',    license:'CC BY 4.0' },
       { name:'index.minfin.com.ua', url:'https://index.minfin.com.ua/ua/finance/budget/gov/',                                  org:'Minfin.com.ua',     license:'Відкрите' }],
  8:  [{ name:'Держстат — Реальна зарплата', url:'https://www.ukrstat.gov.ua/operativ/operativ2007/gdn/sr_zp/sr_zp_u/arh_szp_u.htm', org:'Держстат України', license:'CC BY 4.0' }],
  9:  [{ name:'Держстат — Природний рух населення', url:'https://www.ukrstat.gov.ua/operativ/operativ2007/ds/nas_rik/nas_u/nas_rik_u.html', org:'Держстат України', license:'CC BY 4.0' }],
  10: [{ name:'Держстат — Індекс цін виробників', url:'https://www.ukrstat.gov.ua/operativ/operativ2007/ct/icv/arh_icv_u.htm', org:'Держстат України',  license:'CC BY 4.0' }],
  11: [{ name:'Держстат — Структура ВВП', url:'https://www.ukrstat.gov.ua/operativ/operativ2008/vvp/vvp_ric/vvp_ric_u.htm',   org:'Держстат України',  license:'CC BY 4.0' }],
  12: [{ name:'Держстат — Зовнішня торгівля', url:'https://www.ukrstat.gov.ua/operativ/operativ2019/zd/ztt/ztt_u/arh_ztt_u.htm', org:'Держстат України', license:'CC BY 4.0' },
       { name:'НБУ — Платіжний баланс', url:'https://bank.gov.ua/ua/statistic/sector-external/data-balance-payments',           org:'НБУ',               license:'CC BY 4.0' }],
};

function renderDsSourcesTab(id) {
  const ds = DATASETS.find(d => d.id === id);
  const sources = DS_SOURCES_DETAIL[id] || [];

  document.getElementById('ds-sources-content').innerHTML = `
    <table class="win-table">
      <thead><tr><th>Джерело</th><th>Організація</th><th>Ліцензія</th><th>Посилання</th></tr></thead>
      <tbody>${sources.map(s => `
        <tr>
          <td>${s.name}</td>
          <td>${s.org}</td>
          <td><span class="badge">${s.license}</span></td>
          <td><a href="${s.url}" target="_blank">Відкрити →</a></td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div style="margin-top:8px;padding:6px;background:var(--inset-bg,#e8e4dc);border:1px solid var(--win-shadow);font-size:10px;">
      <img src="assets/pin.png" width="16" height="16" alt="Закріплено" style="image-rendering:smooth;vertical-align:middle;"> Дані з офіційних державних реєстрів. Актуальність: ${ds?.updated || '2024'}.
      Всі дані надаються відповідно до Закону України «Про відкриті дані».
    </div>
  `;
}

/* ── ЕКСПОРТ ─────────────────────────────────────────────────── */

async function exportCurrentDataset(format) {
  const id = _currentDatasetId || 1;
  const ds = DATASETS.find(d => d.id === id);

  try {
    const resp = await fetch(`http://localhost:8000/v1/dataset-data/${id}`);
    const apiData = await resp.json();

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(apiData, null, 2)], { type:'application/json' });
      downloadBlob(blob, `ukrdata_dataset_${id}.json`);
    } else if (format === 'csv') {
      const rows = buildTableRows(apiData, '');
      const meta = DS_META[id] || {};
      const header = (meta.cols || ['Рік','Значення']).join(',');
      const csv = header + '\n' + rows.map(r => r.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type:'text/csv;charset=utf-8' });
      downloadBlob(blob, `ukrdata_dataset_${id}.csv`);
    } else if (format === 'excel') {
      // Якщо є SheetJS — використовуємо, інакше CSV з .xls розширенням
      const rows = buildTableRows(apiData, '');
      const meta = DS_META[id] || {};
      if (window.XLSX) {
        const ws = XLSX.utils.aoa_to_sheet([meta.cols || [], ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, ds?.title?.slice(0,31) || 'Дані');
        XLSX.writeFile(wb, `ukrdata_dataset_${id}.xlsx`);
      } else {
        const header = (meta.cols || ['Рік','Значення']).join('\t');
        const tsv = header + '\n' + rows.map(r => r.join('\t')).join('\n');
        const blob = new Blob(['\uFEFF' + tsv], { type:'application/vnd.ms-excel' });
        downloadBlob(blob, `ukrdata_dataset_${id}.xls`);
      }
    }
  } catch(e) {
    alert('Помилка експорту: ' + e.message);
  }
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── switchChartType залишається для сумісності ─────────────── */
function switchChartType(type, btn) {
  currentChartType = type;
  document.querySelectorAll('#chart-type-line,#chart-type-bar,#chart-type-pie').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderDatasetChart(_currentDatasetId);
}
