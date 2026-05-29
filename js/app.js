/* ============================================================
   app.js — Точка входу: init-функції всіх сторінок
   ============================================================ */

/* ── HOME ── */

function initHome() {
  const kpiData = [
    { icon:'👥', label:'Населення',    value:'36,0',  unit:'млн осіб', trend:'-2.3%', dir:'down' },
    { icon:'💰', label:'ВВП',          value:'5 870', unit:'млрд грн', trend:'+3.1%', dir:'up'   },
    { icon:'📉', label:'Інфляція',     value:'5,1',   unit:'% ІСЦ',   trend:'-7.0%', dir:'down' },
    { icon:'💵', label:'Сер. зарплата',value:'18 600',unit:'грн/міс', trend:'+12.4%',dir:'up'   },
    { icon:'👔', label:'Зайнятість',   value:'58,3',  unit:'%',       trend:'-1.2%', dir:'down' },
  ];
  document.getElementById('home-kpi').innerHTML = kpiData.map(k => `
    <div class="kpi-tile inset">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-info">
        <span class="kpi-label">${k.label}</span>
        <span class="kpi-value">${k.value}</span>
        <span class="kpi-unit">${k.unit}</span>
        <span class="kpi-trend ${k.dir}">${k.dir === 'up' ? '▲' : '▼'} ${k.trend}</span>
      </div>
    </div>`).join('');

  document.getElementById('home-categories').innerHTML = CATEGORIES.slice(0, 6).map(c => `
    <div class="cat-card inset" onclick="navigate('statistics');setTimeout(()=>{document.getElementById('stat-cat').value='${c.id}';filterStatistics();},50)">
      <div class="cat-card-icon">${c.icon}</div>
      <div class="cat-card-title">${c.title}</div>
      <div class="cat-card-desc">${c.desc}</div>
      <div class="cat-card-meta">${c.count} датасетів →</div>
    </div>`).join('');

  const updates = [
    { title:'Зарплати по регіонах Q4 2023', date:'15.01.2024', cat:'Ринок праці', dsId:1 },
    { title:'ВРП 2022 — фінальні дані',     date:'12.01.2024', cat:'Економіка',   dsId:2 },
    { title:'ІСЦ грудень 2023',             date:'10.01.2024', cat:'Інфляція',    dsId:5 },
    { title:'Населення 2024 (попередні)',   date:'08.01.2024', cat:'Демографія',  dsId:4 },
    { title:'Безробіття Q3 2023',           date:'05.01.2024', cat:'Ринок праці', dsId:3 },
  ];
  document.getElementById('home-updates').innerHTML = updates.map(u => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px;border-bottom:1px solid #d0ccc0;cursor:pointer;" onclick="openDataset(${u.dsId})">
      <span style="font-size:11px;">${u.title}</span>
      <span class="badge">${u.cat}</span>
    </div>
    <div style="font-size:10px;color:var(--text-muted);padding:0 4px 4px;">${u.date}</div>
  `).join('');

  renderHomeChart();
}

/* ── DASHBOARDS ── */

function initDashboards() { renderDbKpis(); renderDbCharts('economic'); }

function switchDbTab(tab, btn) {
  document.querySelectorAll('[id^="db-tab-"]').forEach(p => p.classList.remove('active'));
  document.getElementById('db-tab-' + tab).classList.add('active');
  document.querySelectorAll('#page-dashboards .tab-row .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderDbCharts(tab);
}

function renderDbKpis() {
  const eco = [
    { icon:'💰', label:'ВВП України',   value:'5 870', unit:'млрд грн', trend:'▲ 3.1%',  dir:'up'   },
    { icon:'💵', label:'Сер. зарплата', value:'18 600',unit:'грн',      trend:'▲ 12.4%', dir:'up'   },
    { icon:'💹', label:'ВРП Київ',      value:'98 400',unit:'млн грн',  trend:'▲ 8.2%',  dir:'up'   },
    { icon:'📤', label:'Експорт',       value:'49 200',unit:'млн USD',  trend:'▼ 12.1%', dir:'down' },
    { icon:'📥', label:'Імпорт',        value:'55 800',unit:'млн USD',  trend:'▼ 8.4%',  dir:'down' },
  ];
  document.getElementById('db-kpi-economic').innerHTML = eco.map(k => kpiTile(k)).join('');

  const dem = [
    { icon:'👥', label:'Населення',      value:'36.0', unit:'млн осіб', trend:'▼ 2.3%', dir:'down' },
    { icon:'👶', label:'Народжуваність', value:'7.1',  unit:'на 1000',  trend:'▼ 5.8%', dir:'down' },
    { icon:'⬛', label:'Смертність',     value:'12.8', unit:'на 1000',  trend:'▲ 2.1%', dir:'up'   },
  ];
  document.getElementById('db-kpi-demographic').innerHTML = dem.map(k => kpiTile(k)).join('');

  const emp = [
    { icon:'👔', label:'Зайнятість',      value:'58.3', unit:'%',        trend:'▼ 1.2%', dir:'down' },
    { icon:'📉', label:'Безробіття',      value:'12.4', unit:'%',        trend:'▼ 2.8%', dir:'up'   },
    { icon:'👥', label:'Ек. актив. нас.', value:'18.2', unit:'млн осіб', trend:'▼ 0.8%', dir:'down' },
  ];
  document.getElementById('db-kpi-employment').innerHTML = emp.map(k => kpiTile(k)).join('');

  const infl = [
    { icon:'📉', label:'Інфляція (ІСЦ)',    value:'5.1',  unit:'%',       trend:'▼ 7.0%',  dir:'up'   },
    { icon:'🛒', label:'Продовольча інфл.', value:'6.2',  unit:'%',       trend:'▼ 8.1%',  dir:'up'   },
    { icon:'⛽', label:'Ціна на газ',       value:'7.96', unit:'грн/м³',  trend:'▲ 12.0%', dir:'down' },
  ];
  document.getElementById('db-kpi-inflation').innerHTML = infl.map(k => kpiTile(k)).join('');
}

function kpiTile(k) {
  return `<div class="kpi-tile inset">
    <div class="kpi-icon">${k.icon}</div>
    <div class="kpi-info">
      <span class="kpi-label">${k.label}</span>
      <span class="kpi-value">${k.value}</span>
      <span class="kpi-unit">${k.unit}</span>
      <span class="kpi-trend ${k.dir}">${k.trend}</span>
    </div>
  </div>`;
}

function updateDashboard() { renderDbCharts(currentDbTab); }

/* ── SOURCES ── */

function initSources() {
  const tree = document.getElementById('sources-tree');
  tree.innerHTML = `
    <div class="tree-item selected" onclick="filterSources('',this)"><span class="ti-icon">📁</span> Всі джерела</div>
    <div class="tree-item" onclick="filterSources('Офіційна статистика',this)"><span class="ti-icon">📁</span> Офіційна статистика</div>
    <div class="tree-item" onclick="filterSources('Фінансові дані',this)"><span class="ti-icon">📁</span> Фінансові дані</div>
    <div class="tree-item" onclick="filterSources('Міжнародна статистика',this)"><span class="ti-icon">📁</span> Міжнародна</div>
    <div class="tree-item" onclick="filterSources('Агрегований портал',this)"><span class="ti-icon">📁</span> Портали відкритих даних</div>
  `;
  renderSources(SOURCES_DATA);
  document.getElementById('sources-status').textContent = SOURCES_DATA.length + ' джерел';
}

function filterSources(type, el) {
  document.querySelectorAll('#sources-tree .tree-item').forEach(t => t.classList.remove('selected'));
  if (el) el.classList.add('selected');
  const filtered = type ? SOURCES_DATA.filter(s => s.type === type) : SOURCES_DATA;
  renderSources(filtered);
  document.getElementById('sources-status').textContent = filtered.length + ' джерел';
}

function renderSources(data) {
  document.getElementById('sources-tbody').innerHTML = data.map(s => `
    <tr>
      <td>📄 ${s.name}</td>
      <td><span class="badge">${s.type}</span></td>
      <td>${s.org}</td>
      <td>${s.updated}</td>
      <td>${s.license}</td>
      <td><a href="${s.url}" target="_blank">Відкрити →</a></td>
    </tr>`).join('');
}

/* ── ABOUT ── */

function switchAboutTab(tab, btn) {
  document.querySelectorAll('[id^="about-tab-"]').forEach(p => p.classList.remove('active'));
  document.getElementById('about-tab-' + tab).classList.add('active');
  btn.closest('.tab-row').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function submitContact() {
  const name   = document.getElementById('contact-name').value.trim();
  const email  = document.getElementById('contact-email').value.trim();
  const msg    = document.getElementById('contact-msg').value.trim();
  const status = document.getElementById('contact-status');
  if (!name || !email || !msg)              { status.innerHTML = '<span style="color:var(--red)">⚠️ Заповніть усі поля</span>'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.innerHTML = '<span style="color:var(--red)">⚠️ Некоректний email</span>'; return; }
  if (msg.length < 10)                      { status.innerHTML = '<span style="color:var(--red)">⚠️ Повідомлення занадто коротке</span>'; return; }
  status.innerHTML = '<span style="color:var(--text-muted)">⏳ Відправляється...</span>';
  setTimeout(() => { status.innerHTML = '<span style="color:var(--green)">✓ Повідомлення надіслано. Дякуємо!</span>'; clearContact(); }, 800);
}

function clearContact() {
  ['contact-name','contact-email','contact-msg'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  setTimeout(() => { const st = document.getElementById('contact-status'); if (st && st.innerHTML.includes('✓')) st.innerHTML = ''; }, 3000);
}

/* ── BOOTSTRAP ── */

buildTaskbar();
initHome();