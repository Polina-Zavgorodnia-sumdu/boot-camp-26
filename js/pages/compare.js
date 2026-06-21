/* ============================================================
   pages/compare.js — Порівняння регіонів
   ============================================================ */

// Показники доступні для регіонального порівняння
const COMPARE_METRICS = [
  { id:'salary',       label:'Середня зарплата', unit:'грн',       fmt: v => v.toLocaleString('uk-UA') },
  { id:'gdp',          label:'ВРП',              unit:'млн грн',   fmt: v => v.toLocaleString('uk-UA') },
  { id:'unemployment', label:'Безробіття',       unit:'%',         fmt: v => v.toFixed(1) },
  { id:'population',   label:'Населення',        unit:'тис. осіб', fmt: v => v.toLocaleString('uk-UA') },
];

// Обрані регіони (до 4-х)
let _compareSelected = []; // Array of { id, year }
let _compareMetrics  = ['salary','gdp','unemployment','population'];
let _compareCache    = {}; // { '2024': [...], '2013': [...] }

async function initCompare() {
  if (!_compareCache[2024] && window.REGIONS) {
    _compareCache[2024] = [...window.REGIONS];
  }
  renderCompareSelectors();
  renderCompareMetricPicker();
  if (_compareSelected.length >= 2) renderCompareResult();
  else renderComparePlaceholder();
}

/* Скидає весь вибір — викликається кнопкою «Скинути» */
function resetCompare() {
  _compareSelected = [];
  _compareMetrics  = ['salary','gdp','unemployment','population'];
  destroyChart('compare-bar-chart');
  destroyChart('compare-radar-chart');
  renderCompareSelectors();
  renderCompareMetricPicker();
  renderComparePlaceholder();
}

/* Виклик з map.js — одразу передобирає один регіон */
function preselectRegion(regionId) {
  if (!_compareSelected.find(s => s.id === regionId)) {
    _compareSelected = [{ id: regionId, year: 2024 }];
  }
  initCompare();
}

/* ── Вибір регіонів ──────────────────────────────────────────── */

function renderCompareSelectors() {
  const container = document.getElementById('compare-region-selectors');
  if (!container) return;

  // Завжди 4 слоти
  const slots = [0, 1, 2, 3];
  const baseRegions = _compareCache[2024] || window.REGIONS || [];

  // Генеруємо всі роки від 2005 до 2024 (дані є лише з 2005)
  const years = [];
  for (let y = 2024; y >= 2005; y--) {
    years.push(y);
  }

  container.innerHTML = slots.map(i => {
    const s = _compareSelected[i] || { id: '', year: 2024 };
    const slotYear = s.year || 2024;
    // Отримуємо регіони для конкретного року
    const yearRegions = _compareCache[slotYear] || baseRegions;

    return `
      <div style="display:flex;flex-direction:column;gap:3px;min-width:160px;">
        <label style="font-size:10px;font-weight:700;">Регіон ${i+1}${i < 2 ? ' *' : ''}</label>
        <div style="display:flex;gap:4px;">
          <select onchange="onCompareSlotChange(${i}, this.value, document.getElementById('compare-year-${i}').value)"
                  style="font-size:11px; flex:1;">
            <option value="">— не обрано —</option>
            ${yearRegions.map(r => `<option value="${r.id}" ${r.id === s.id ? 'selected' : ''}>${r.name}</option>`).join('')}
          </select>
          <select id="compare-year-${i}" onchange="onCompareSlotYearChange(${i}, this.value)"
                  style="font-size:11px; width:60px;">
            ${years.map(y => `<option value="${y}" ${slotYear == y ? 'selected' : ''}>${y}</option>`).join('')}
          </select>
        </div>
      </div>`;
  }).join('');
}

async function onCompareSlotChange(slotIdx, regionId, yearStr) {
  const year = parseInt(yearStr, 10);
  if (regionId) {
    _compareSelected[slotIdx] = { id: regionId, year };
    
    if (!_compareCache[year]) {
      _compareCache[year] = await UkrApi.regions('salary', 'desc', year);
    }
  } else {
    _compareSelected.splice(slotIdx, 1);
  }
  
  _compareSelected = _compareSelected.filter(Boolean);
  renderCompareSelectors();
  if (_compareSelected.length >= 2) renderCompareResult();
  else renderComparePlaceholder();
}

async function onCompareSlotYearChange(slotIdx, yearStr) {
  const year = parseInt(yearStr, 10);
  const slot = _compareSelected[slotIdx];
  
  // Завжди завантажуємо кеш для обраного року, навіть якщо регіон не обраний
  if (!_compareCache[year]) {
    _compareCache[year] = await UkrApi.regions('salary', 'desc', year);
  }
  
  if (slot) {
    slot.year = year;
    
    // Перевіряємо, чи існує обраний регіон для нового року
    const yearRegions = _compareCache[year] || [];
    const regionExists = yearRegions.find(r => r.id === slot.id);
    
    if (!regionExists && slot.id) {
      // Якщо регіон не існує для цього року (наприклад, Крим для 2014+), скидаємо вибір
      slot.id = '';
    }
  } else {
    // Створюємо слот з порожнім регіоном, але з обраним роком
    _compareSelected[slotIdx] = { id: '', year };
  }
  
  renderCompareSelectors();
  if (_compareSelected.length >= 2) renderCompareResult();
  else renderComparePlaceholder();
}

/* ── Вибір показників ────────────────────────────────────────── */

function renderCompareMetricPicker() {
  const container = document.getElementById('compare-metric-picker');
  if (!container) return;
  container.innerHTML = COMPARE_METRICS.map(m => `
    <label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;">
      <input type="checkbox"
             value="${m.id}"
             ${_compareMetrics.includes(m.id) ? 'checked' : ''}
             onchange="onCompareMetricChange('${m.id}',this.checked)"/>
      ${m.label}
    </label>`).join('');
}

function onCompareMetricChange(metricId, checked) {
  if (checked && !_compareMetrics.includes(metricId)) {
    _compareMetrics.push(metricId);
  } else if (!checked) {
    _compareMetrics = _compareMetrics.filter(m => m !== metricId);
  }
  if (_compareSelected.length >= 2) renderCompareResult();
}

/* ── Заглушка ────────────────────────────────────────────────── */

function renderComparePlaceholder() {
  const area = document.getElementById('compare-result-area');
  if (!area) return;
  area.innerHTML = `
    <div style="text-align:center;padding:40px;color:var(--text-muted);">
      <div style="font-size:32px;margin-bottom:8px;"><img src="assets/compare.png" width="48" height="48" alt="Порівняти" style="image-rendering:smooth;vertical-align:middle;"></div>
      <div style="font-size:12px;">Оберіть щонайменше <strong>2 регіони</strong> вище щоб побачити порівняння</div>
    </div>`;
  destroyChart('compare-bar-chart');
  destroyChart('compare-radar-chart');
}

/* ── Основний рендер порівняння ──────────────────────────────── */

function renderCompareResult() {
  if (_compareSelected.length < 2) { renderComparePlaceholder(); return; }
  if (_compareMetrics.length === 0) {
    document.getElementById('compare-result-area').innerHTML = `
      <div style="padding:20px;color:var(--red);"><img src="assets/test.png" width="16" height="16" alt="Помилка" style="image-rendering:smooth;vertical-align:middle;"> Оберіть хоча б один показник</div>`;
    return;
  }

  const regions = _compareSelected.map(slot => {
    let rData = _compareCache[slot.year] && _compareCache[slot.year].find(r => r.id === slot.id);
    if (!rData) {
      // Find the name from another year cache if data missing
      const baseR = (_compareCache[2024] && _compareCache[2024].find(r => r.id === slot.id)) ||
                    (_compareCache[2013] && _compareCache[2013].find(r => r.id === slot.id));
      const name = baseR ? baseR.name : slot.id;
      return { id: slot.id, name, _label: `${name} (${slot.year} - Немає даних)`, salary: 0, gdp: 0, unemployment: 0, population: 0, _year: slot.year };
    }
    return { ...rData, _label: `${rData.name} (${slot.year})`, _year: slot.year };
  }).filter(Boolean);

  const metrics  = COMPARE_METRICS.filter(m => _compareMetrics.includes(m.id));

  renderCompareTable(regions, metrics);
  renderCompareBarChart(regions, metrics);
  renderCompareRadarChart(regions, metrics);
}

/* Таблиця-підсумок */
function renderCompareTable(regions, metrics) {
  const tableEl = document.getElementById('compare-table');
  if (!tableEl) return;

  const rows = metrics.map(m => {
    const vals   = regions.map(r => r[m.id]);
    const maxVal = Math.max(...vals);
    const minVal = Math.min(...vals);
    const cells  = vals.map(v => {
      const isMax = v === maxVal && maxVal !== minVal;
      const isMin = v === minVal && maxVal !== minVal;
      return `<td style="font-family:var(--font-mono);font-weight:700;text-align:right;
        ${isMax ? 'color:#006000;' : isMin ? 'color:#c00000;' : ''}">
        ${m.fmt(v)} ${m.unit}
      </td>`;
    }).join('');
    return `<tr><td style="font-weight:700;">${m.label}</td>${cells}</tr>`;
  });

  tableEl.innerHTML = `
    <table class="win-table" style="width:100%;">
      <thead>
        <tr>
          <th>Показник</th>
          ${regions.map(r => `<th>${r._label}</th>`).join('')}
        </tr>
      </thead>
      <tbody>${rows.join('')}</tbody>
    </table>
    <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">
      🟢 найвище значення · 🔴 найнижче значення
    </div>`;
}

/* Стовпчаста діаграма — по одному показнику */
function renderCompareBarChart(regions, metrics) {
  destroyChart('compare-bar-chart');
  const canvas = document.getElementById('compare-bar-chart');
  if (!canvas) return;

  // Для кожного показника — одна група стовпців
  const colors = ['#000080','#c00000','#006000','#804000'];

  chartInstances['compare-bar-chart'] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: metrics.map(m => m.label),
      datasets: regions.map((r, i) => ({
        label: r._label,
        data: metrics.map(m => {
          const allVals = (_compareCache[r._year] || []).map(reg => reg[m.id]);
          const max = Math.max(...allVals, 0);
          return max > 0 ? +(r[m.id] / max * 100).toFixed(1) : 0;
        }),
        backgroundColor: colors[i] + 'cc',
        borderColor: colors[i],
        borderWidth: 1,
      }))
    },
    options: {
      ...chartOpts({ yLabel: '% від макс.' }),
      plugins: {
        ...chartOpts().plugins,
        tooltip: {
          backgroundColor: cc.tooltipBg(), borderColor: cc.tooltipBorder(), borderWidth: 1,
          titleColor: cc.tooltipText(), bodyColor: cc.tooltipText(), padding: 6,
          callbacks: {
            label: ctx => {
              const r = regions[ctx.datasetIndex];
              const m = metrics[ctx.dataIndex];
              return `${r._label}: ${m.fmt(r[m.id])} ${m.unit}`;
            }
          }
        },
        title: { display: true, text: 'Нормалізоване порівняння (% від максимуму по Україні за відповідний рік)', color: cc.text(), font: { size: 10 } }
      }
    }
  });
}

/* Радарна діаграма */
function renderCompareRadarChart(regions, metrics) {
  destroyChart('compare-radar-chart');
  
  if (metrics.length < 3) {
    // Радарна потребує мінімум 3 осі
    const wrap = document.getElementById('compare-radar-wrap');
    if (wrap) {
      wrap.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:11px;text-align:center;">
        Радарна діаграма потребує<br>мінімум 3 показники
      </div>`;
    }
    return;
  }

  const canvas = setCanvas('compare-radar-wrap', 'compare-radar-chart');
  if (!canvas) return;

  const colors = ['#000080','#c00000','#006000','#804000'];

  chartInstances['compare-radar-chart'] = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: metrics.map(m => m.label),
      datasets: regions.map((r, i) => {
        const normalizedData = metrics.map(m => {
          const allVals = (_compareCache[r._year] || []).map(reg => reg[m.id]);
          const max = Math.max(...allVals, 0);
          return max > 0 ? +(r[m.id] / max * 100).toFixed(1) : 0;
        });
        return {
          label: r._label,
          data: normalizedData,
          borderColor: colors[i],
          backgroundColor: colors[i] + '22',
          pointBackgroundColor: colors[i],
          borderWidth: 2,
          pointRadius: 3,
        };
      })
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: cc.text(), font: { size: 10 }, boxWidth: 12 } },
        tooltip: {
          backgroundColor: cc.tooltipBg(), borderColor: cc.tooltipBorder(), borderWidth: 1,
          titleColor: cc.tooltipText(), bodyColor: cc.tooltipText(),
        }
      },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { color: cc.text(), backdropColor: darkMode ? '#1e1e1e' : 'rgba(255, 255, 255, 0.75)', font: { size: 8 }, stepSize: 25, callback: v => v + '%' },
          grid:  { color: cc.grid() },
          pointLabels: { color: cc.text(), font: { size: 10 } },
          angleLines: { color: cc.grid() },
        }
      }
    }
  });
}

/* Перемалювати при зміні теми */
function redrawCompareCharts() {
  if (_compareSelected.length >= 2) renderCompareResult();
}
