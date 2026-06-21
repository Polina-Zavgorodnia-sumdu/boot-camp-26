/* ============================================================
   pages/home.js — Головна сторінка
   ============================================================ */

function initHome() {
  const last = HISTORY.years.length - 1;
  const prev = last - 1;

  function trendPct(now, p) {
    const pct = p > 0 ? (((now - p) / p) * 100).toFixed(1) : '0.0';
    return { pct: Math.abs(pct), dir: pct >= 0 ? 'up' : 'down', sign: pct >= 0 ? '▲' : '▼', suffix: '%' };
  }

  function trendPoints(now, p) {
    const diff = (now - p).toFixed(1);
    return { pct: Math.abs(diff), dir: diff >= 0 ? 'up' : 'down', sign: diff >= 0 ? '▲' : '▼', suffix: ' відсоткових пунктів.' };
  }

  const kpiData = [
    { icon:'<img src="assets/people.png" width="32" height="32" alt="Населення" style="image-rendering:smooth;vertical-align:middle;">', label:'Населення',     value: (HISTORY.population[last] / 1000).toFixed(1),                unit:'млн осіб', ...trendPct(HISTORY.population[last],   HISTORY.population[prev]) },
    { icon:'<img src="assets/economics.png" width="32" height="32" alt="ВВП" style="image-rendering:smooth;vertical-align:middle;">', label:'ВВП',           value: Math.round(HISTORY.gdp_ua[last] / 1000).toLocaleString('uk-UA'), unit:'млрд грн', ...trendPct(HISTORY.gdp_ua[last],      HISTORY.gdp_ua[prev]) },
    { icon:'<img src="assets/inflation.png" width="32" height="32" alt="Інфляція" style="image-rendering:smooth;vertical-align:middle;">', label:'Інфляція',      value: HISTORY.inflation[last].toFixed(1),                          unit:'% ІСЦ',   ...trendPoints(HISTORY.inflation[last],    HISTORY.inflation[prev]) },
    { icon:'<img src="assets/money.png" width="32" height="32" alt="Зарплата" style="image-rendering:smooth;vertical-align:middle;">', label:'Сер. зарплата', value: HISTORY.salary_ua[last].toLocaleString('uk-UA'),             unit:'грн/міс', ...trendPct(HISTORY.salary_ua[last],    HISTORY.salary_ua[prev]) },
    { icon:'<img src="assets/безробіття.png" width="32" height="32" alt="Безробіття" style="image-rendering:smooth;vertical-align:middle;">', label:'Безробіття',    value: HISTORY.unemployment[last].toFixed(1),                       unit:'%',       ...trendPoints(HISTORY.unemployment[last], HISTORY.unemployment[prev]) },
  ];

  const kpiEl = document.getElementById('home-kpi');
  if (kpiEl) kpiEl.innerHTML = kpiData.map(k => `
    <div class="kpi-tile inset">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-info">
        <span class="kpi-label">${k.label}</span>
        <span class="kpi-value">${k.value}</span>
        <span class="kpi-unit">${k.unit}</span>
        <span class="kpi-trend ${k.dir}">${k.sign} ${k.pct}${k.suffix}</span>
      </div>
    </div>`).join('');

  const catEl = document.getElementById('home-categories');
  if (catEl) catEl.innerHTML = CATEGORIES.slice(0, 6).map(c => `
    <div class="cat-card inset" onclick="navigate('statistics');setTimeout(()=>filterByTree('${c.id}'),50)">
      <div class="cat-card-icon">${c.icon}</div>
      <div class="cat-card-title">${c.title}</div>
      <div class="cat-card-desc">${c.desc}</div>
      <div class="cat-card-meta">${c.count} датасетів →</div>
    </div>`).join('');

  const updEl = document.getElementById('home-updates');
  if (updEl) updEl.innerHTML = DATASETS.slice(0, 5).map(u => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px;border-bottom:1px solid #d0ccc0;cursor:pointer;" onclick="openDataset(${u.id})">
      <span style="font-size:11px;">${u.title}</span>
      <span class="badge">${CATEGORIES.find(c => c.id === u.cat)?.title || u.cat}</span>
    </div>
    <div style="font-size:10px;color:var(--text-muted);padding:0 4px 4px;">${u.updated}</div>
  `).join('');

  renderHomeChart();
}
