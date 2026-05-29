/* ============================================================
   datasets.js — Статистика та датасети: фільтри, таблиця, картки
   ============================================================ */

/* ── STATISTICS PAGE ── */

function initStatistics() { buildStatTree(); filterStatistics(); }

function buildStatTree() {
  const tree = document.getElementById('stat-tree');
  tree.innerHTML = `
    <div class="tree-item selected" onclick="filterByTree('')"><span class="ti-icon">📁</span> Усі категорії</div>
    ${CATEGORIES.map(c => `<div class="tree-item" onclick="filterByTree('${c.id}')"><span class="ti-icon">${c.icon}</span> ${c.title}</div>`).join('')}
    <div style="margin-top:8px;font-size:10px;font-weight:700;text-transform:uppercase;">ДЖЕРЕЛА</div>
    <div class="tree-item" onclick="navigate('sources')"><span class="ti-icon">📄</span> Держстат</div>
    <div class="tree-item" onclick="navigate('sources')"><span class="ti-icon">📄</span> НБУ</div>
    <div class="tree-item" onclick="navigate('sources')"><span class="ti-icon">📄</span> Мінфін</div>
  `;
}

function filterByTree(catId) {
  document.getElementById('stat-cat').value = catId;
  filterStatistics();
  document.querySelectorAll('#stat-tree .tree-item').forEach(t => t.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
}

function filterStatistics() {
  const cat    = document.getElementById('stat-cat').value;
  const search = document.getElementById('stat-search').value.toLowerCase();
  let results  = DATASETS.filter(d => {
    if (cat && d.cat !== cat) return false;
    if (search && !d.title.toLowerCase().includes(search)) return false;
    return true;
  });
  document.getElementById('stat-status').textContent = `${results.length} датасетів знайдено`;
  renderStatCards(results);
}

function setStatView(v) {
  statView = v;
  ['grid','list','details'].forEach(x => { document.getElementById('vbtn-'+x).classList.toggle('active', x === v); });
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
          <span style="font-size:16px;">${CATEGORIES.find(c => c.id === d.cat)?.icon || '📊'}</span>
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
        <div class="cat-card-icon">${CATEGORIES.find(c => c.id === d.cat)?.icon || '📊'}</div>
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
  document.querySelectorAll('#stat-cards-container th').forEach(t => { t.textContent = t.textContent.replace(' ▲','').replace(' ▼',''); });
  th.textContent += statSortAsc ? ' ▲' : ' ▼';
  const cat    = document.getElementById('stat-cat').value;
  const search = document.getElementById('stat-search').value.toLowerCase();
  let results  = DATASETS.filter(d => { if (cat && d.cat !== cat) return false; if (search && !d.title.toLowerCase().includes(search)) return false; return true; });
  const keys   = ['title','cat','year','source','records'];
  results.sort((a, b) => { let va = a[keys[col]], vb = b[keys[col]]; if (typeof va === 'number') return statSortAsc ? va-vb : vb-va; return statSortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va)); });
  renderStatCards(results);
}

function openDataset(id) {
  const ds = DATASETS.find(d => d.id === id);
  if (ds) {
    document.getElementById('dataset-win-title').textContent = ds.title + ' — УкрДані';
    document.getElementById('ds-title').textContent = ds.title;
    document.getElementById('ds-cat-badge').textContent = CATEGORIES.find(c => c.id === ds.cat)?.title || ds.cat;
    document.getElementById('ds-updated').textContent = '01.2024';
    const metricMap = { labor:'salary', economy:'gdp', demography:'population', inflation:'unemployment' };
    const metricEl  = document.getElementById('ds-metric');
    if (metricEl && metricMap[ds.cat]) metricEl.value = metricMap[ds.cat];
  }
  navigate('dataset');
}

/* ── DATASET TABLE ── */

function initDataset() {
  generateTableData();
  renderTable();
  updateDataset();
  document.getElementById('ds-rows-count').textContent = tableData.length + ' записів';
}

function generateTableData() {
  const metric       = document.getElementById('ds-metric')?.value || 'salary';
  const yearFilter   = document.getElementById('ds-year')?.value    || '';
  const metricLabel  = { salary:'Зарплата', gdp:'ВРП', unemployment:'Безробіття', population:'Населення' }[metric];
  const unit         = { salary:'грн', gdp:'млн грн', unemployment:'%', population:'тис. осіб' }[metric];
  tableData = [];
  // Показуємо всі регіони
  const regions = REGIONS;
  const years   = yearFilter ? [+yearFilter] : HISTORY.years.slice(-8);
  regions.forEach(r => {
    years.forEach(y => {
      const anchor   = r[metric];
      const yIdx     = HISTORY.years.indexOf(y);
      const natNow   = HISTORY.salary_ua[HISTORY.salary_ua.length - 1];
      const natThen  = HISTORY.salary_ua[yIdx] || natNow;
      const factor   = natThen / natNow;
      const val      = Math.round(anchor * factor * (0.95 + Math.random() * 0.1));
      const prevFactor = HISTORY.years[yIdx-1] ? (HISTORY.salary_ua[yIdx-1] || natNow) / natNow : factor * 0.88;
      const prevVal  = Math.round(anchor * prevFactor * (0.95 + Math.random() * 0.1));
      const change   = prevVal > 0 ? (((val - prevVal) / prevVal) * 100).toFixed(1) : '—';
      tableData.push({ year: y, region: r.name, metric: metricLabel, value: val, unit, change: +change });
    });
  });
}

function renderTable() {
  const search   = document.getElementById('ds-table-search')?.value?.toLowerCase() || '';
  let filtered   = tableData.filter(r => !search || r.region.toLowerCase().includes(search) || String(r.year).includes(search) || r.metric.toLowerCase().includes(search));
  document.getElementById('ds-table-count').textContent = filtered.length + ' записів';
  const sortKeys = ['year','region','metric','value','unit','change'];
  filtered.sort((a, b) => { let va = a[sortKeys[tableSortCol]], vb = b[sortKeys[tableSortCol]]; if (typeof va === 'number') return tableSortAsc ? va-vb : vb-va; return tableSortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va)); });
  const total  = Math.ceil(filtered.length / PAGE_SIZE);
  tablePage_   = Math.min(tablePage_, Math.max(0, total - 1));
  const page   = filtered.slice(tablePage_ * PAGE_SIZE, tablePage_ * PAGE_SIZE + PAGE_SIZE);
  document.getElementById('ds-page-info').textContent = `Стор. ${tablePage_ + 1} з ${total || 1}`;
  const headers = ['Рік','Регіон','Показник','Значення','Одиниця','Зміна %'];
  document.querySelectorAll('#ds-table thead th').forEach((th, i) => { th.textContent = headers[i] + (i === tableSortCol ? (tableSortAsc ? ' ▲' : ' ▼') : ''); });
  document.getElementById('ds-table-body').innerHTML = page.map(r => `
    <tr>
      <td style="font-family:var(--font-mono)">${r.year}</td>
      <td>${r.region}</td>
      <td>${r.metric}</td>
      <td style="font-family:var(--font-mono);font-weight:700;">${r.value.toLocaleString('uk-UA')}</td>
      <td>${r.unit}</td>
      <td style="color:${r.change > 0 ? 'var(--green)' : 'var(--red)'}">${r.change}%</td>
    </tr>`).join('');
}

function filterTable(val) { tablePage_ = 0; renderTable(); }
function tablePage(dir) {
  const search   = document.getElementById('ds-table-search')?.value?.toLowerCase() || '';
  const filtered = tableData.filter(r => !search || r.region.toLowerCase().includes(search) || String(r.year).includes(search));
  tablePage_     = Math.max(0, Math.min(tablePage_ + dir, Math.ceil(filtered.length / PAGE_SIZE) - 1));
  renderTable();
}
function sortTable(col) { if (tableSortCol === col) tableSortAsc = !tableSortAsc; else { tableSortCol = col; tableSortAsc = true; } renderTable(); }

function switchDsTab(tab, btn) {
  document.querySelectorAll('#ds-tab-charts,#ds-tab-table,#ds-tab-api,#ds-tab-sources').forEach(p => p.classList.remove('active'));
  document.getElementById('ds-tab-' + tab).classList.add('active');
  document.querySelectorAll('#ds-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (tab === 'charts') updateDataset();
  if (tab === 'table')  { generateTableData(); renderTable(); }
}

function switchChartType(type, btn) {
  currentChartType = type;
  document.querySelectorAll('#chart-type-line,#chart-type-bar,#chart-type-pie').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateDataset();
}
