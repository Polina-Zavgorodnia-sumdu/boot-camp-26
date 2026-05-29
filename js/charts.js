/* ============================================================
   charts.js — Графіки: налаштування Chart.js та рендеринг
   ============================================================ */

/* ── CHART.JS DEFAULTS ── */

Chart.defaults.color       = '#444444';
Chart.defaults.font.family = "'Tahoma','MS Sans Serif','Arial',sans-serif";
Chart.defaults.font.size   = 10;
Chart.defaults.borderColor = '#c0c0c0';

/* Палітра кольорів для регіонів */
const REGION_PALETTE = [
  '#000080','#1084d0','#006000','#cc0000','#804000','#500080',
  '#007070','#804080','#406000','#006080','#800040','#408040',
  '#204080','#804020','#408060','#602080','#806020','#206060',
  '#602020','#206020','#602060','#406080','#806080','#408020','#204060'
];

function getChartTextColor()  { return darkMode ? '#c0c0c0' : '#444444'; }
function getChartGridColor()  { return darkMode ? '#333333' : '#e0e0e0'; }
function getChartBgColor()    { return darkMode ? '#1e1e1e' : '#ffffff'; }
function getTooltipBg()       { return darkMode ? '#1e1e2e' : '#ffffcc'; }
function getTooltipBorder()   { return darkMode ? '#6ab0f5' : '#000080'; }
function getTooltipText()     { return darkMode ? '#e0e0e0' : '#000000'; }

function chartOpts({ yLabel = '' } = {}) {
  const tc = getChartTextColor();
  const gc = getChartGridColor();
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: tc, font: { size: 10 }, boxWidth: 12 } },
      tooltip: {
        backgroundColor: getTooltipBg(),
        borderColor: getTooltipBorder(), borderWidth: 1,
        titleColor: getTooltipText(), bodyColor: getTooltipText(), padding: 6,
        callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString('uk-UA') || ''} ${yLabel}` }
      }
    },
    scales: {
      x: { grid: { color: gc }, ticks: { color: tc, font: { size: 9 }, maxRotation: 45, minRotation: 30 } },
      y: { grid: { color: gc }, ticks: { color: tc, font: { size: 9 }, callback: v => v.toLocaleString('uk-UA') } }
    }
  };
}

function chartOptsNoScales({ yLabel = '' } = {}) {
  const tc = getChartTextColor();
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: { color: tc, font: { size: 9 }, boxWidth: 10, padding: 6 }
      },
      tooltip: {
        backgroundColor: getTooltipBg(),
        borderColor: getTooltipBorder(), borderWidth: 1,
        titleColor: getTooltipText(), bodyColor: getTooltipText(), padding: 6,
        callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed?.toLocaleString('uk-UA') || ''} ${yLabel}` }
      }
    }
  };
}

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

/* ── FULL-WIDTH BAR CHART HELPER ──
   Рендерить стовпчикову діаграму на всю ширину обгортки. */
function makeBarChart(wrapperId, canvasId, labels, datasets, opts) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;
  wrapper.innerHTML = `<div style="position:relative;width:100%;height:100%;"><canvas id="${canvasId}"></canvas></div>`;
  const canvas = document.getElementById(canvasId);
  return new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets },
    options: opts
  });
}

/* ── HOME CHART — всі регіони, прокрутка ── */

function renderHomeChart() {
  destroyChart('home-chart');
  const sorted = [...REGIONS].sort((a, b) => b.salary - a.salary);
  const wrapper = document.getElementById('home-chart-wrapper');
  if (!wrapper) return;

  wrapper.innerHTML = `<div style="position:relative;width:100%;height:100%;"><canvas id="home-chart"></canvas></div>`;

  chartInstances['home-chart'] = new Chart(document.getElementById('home-chart'), {
    type: 'bar',
    data: {
      labels: sorted.map(r => r.name),
      datasets: [{
        label: 'Середня зарплата (грн)',
        data: sorted.map(r => r.salary),
        backgroundColor: sorted.map((_, i) => REGION_PALETTE[i % REGION_PALETTE.length] + 'cc'),
        borderColor: darkMode ? '#444' : '#000040', borderWidth: 1, borderRadius: 0,
      }]
    },
    options: chartOpts({ yLabel: 'грн' })
  });
}

/* ── DATASET CHARTS ── */

function updateDataset() {
  const metric  = document.getElementById('ds-metric').value;
  const yearSel = document.getElementById('ds-bar-year')?.value || '2024';
  const metricLabel = { salary:'Зарплата', gdp:'ВРП', unemployment:'Безробіття', population:'Населення' }[metric];
  const yLabel      = { salary:'грн', gdp:'млн грн', unemployment:'%', population:'тис. осіб' }[metric];

  // Для лінійного/барного графіку динаміки — беремо Україну або перший регіон
  let histKey;
  if (metric === 'salary')           histKey = 'salary_ua';
  else if (metric === 'unemployment') histKey = 'unemployment';
  else if (metric === 'population')   histKey = 'population';
  else                                histKey = 'gdp_ua';
  const histData = HISTORY[histKey] || HISTORY.salary_ua;

  document.getElementById('ds-chart-title').textContent = `Динаміка — ${metricLabel} по Україні (1998–2024)`;
  destroyChart('ds-line-chart');
  destroyChart('ds-bar-chart');

  const yearIdx = HISTORY.years.indexOf(+yearSel);
  const factor = (yearIdx >= 0 && HISTORY.salary_ua[yearIdx]) ? HISTORY.salary_ua[yearIdx] / HISTORY.salary_ua[HISTORY.salary_ua.length - 1] : 1;

  if (currentChartType === 'pie') {
    // Кругова — всі регіони
    const allRegions = [...REGIONS].sort((a, b) => b[metric] - a[metric]);
    const vals = allRegions.map(r => Math.round(r[metric] * (metric === 'salary' ? factor : 1)));
    // Лінійний графік зліва (динаміка)
    chartInstances['ds-line-chart'] = new Chart(document.getElementById('ds-line-chart'), {
      type: 'line',
      data: {
        labels: HISTORY.years,
        datasets: [{
          label: `${metricLabel} · Україна`,
          data: histData,
          borderColor: '#000080',
          backgroundColor: darkMode ? 'rgba(100,160,255,0.1)' : 'rgba(0,0,128,0.1)',
          borderWidth: 2, pointRadius: 2, tension: 0.2, fill: true
        }]
      },
      options: chartOpts({ yLabel })
    });
    // Кругова зправа — всі регіони
    const wrapRight = document.getElementById('ds-bar-wrap');
    if (wrapRight) {
      wrapRight.innerHTML = `<div style="position:relative;width:100%;height:100%;"><canvas id="ds-bar-chart"></canvas></div>`;
    }
    chartInstances['ds-bar-chart'] = new Chart(document.getElementById('ds-bar-chart'), {
      type: 'doughnut',
      data: {
        labels: allRegions.map(r => r.name),
        datasets: [{
          data: vals,
          backgroundColor: allRegions.map((_, i) => REGION_PALETTE[i % REGION_PALETTE.length]),
          borderWidth: 1,
          borderColor: darkMode ? '#1e1e1e' : '#ffffff'
        }]
      },
      options: chartOptsNoScales({ yLabel })
    });
    document.getElementById('ds-bar-year-row')?.style && (document.getElementById('ds-bar-year-row').style.display = 'none');
  } else {
    // Лінійний / стовпчиковий — динаміка по Україні зліва
    chartInstances['ds-line-chart'] = new Chart(document.getElementById('ds-line-chart'), {
      type: currentChartType === 'bar' ? 'bar' : 'line',
      data: {
        labels: HISTORY.years,
        datasets: [{
          label: `${metricLabel} · Україна`,
          data: histData,
          borderColor: '#000080',
          backgroundColor: currentChartType === 'bar'
            ? HISTORY.years.map((_, i) => REGION_PALETTE[i % 6])
            : (darkMode ? 'rgba(100,160,255,0.1)' : 'rgba(0,0,128,0.1)'),
          borderWidth: 2, pointBackgroundColor: '#000080', pointRadius: currentChartType === 'bar' ? 0 : 2,
          tension: 0.2, fill: currentChartType !== 'bar'
        }]
      },
      options: chartOpts({ yLabel })
    });

    // Стовпчикова — всі регіони за вибраний рік (зправа), на всю ширину
    const allRegions = [...REGIONS].sort((a, b) => b[metric] - a[metric]);
    const vals = allRegions.map(r => Math.round(r[metric] * (metric === 'salary' ? factor : 1)));

    const wrapRight = document.getElementById('ds-bar-wrap');
    if (wrapRight) {
      wrapRight.innerHTML = `<div style="position:relative;width:100%;height:100%;"><canvas id="ds-bar-chart"></canvas></div>`;
    }
    chartInstances['ds-bar-chart'] = new Chart(document.getElementById('ds-bar-chart'), {
      type: 'bar',
      data: {
        labels: allRegions.map(r => r.name),
        datasets: [{
          label: `${metricLabel} · ${yearSel}`,
          data: vals,
          backgroundColor: allRegions.map((_, i) => REGION_PALETTE[i % REGION_PALETTE.length] + 'cc'),
          borderColor: darkMode ? '#444' : '#000040',
          borderWidth: 1
        }]
      },
      options: chartOpts({ yLabel })
    });

    // Показуємо рядок вибору року
    const yearRow = document.getElementById('ds-bar-year-row');
    if (yearRow) yearRow.style.display = '';
  }

  generateTableData();
  document.getElementById('ds-rows-count').textContent = tableData.length + ' записів';
}

/* ── DASHBOARD CHARTS ── */

function renderDbCharts(tab) {
  currentDbTab = tab;

  if (tab === 'economic') {
    destroyChart('db-gdp-chart');
    destroyChart('db-salary-hist-chart');

    const yearSel = document.getElementById('db-year').value || '2024';
    const yearIdx = HISTORY.years.indexOf(+yearSel);
    const factor  = (yearIdx >= 0 && HISTORY.salary_ua[yearIdx]) ? HISTORY.salary_ua[yearIdx] / HISTORY.salary_ua[HISTORY.salary_ua.length - 1] : 1;

    const allRegions = [...REGIONS].sort((a, b) => b.gdp - a.gdp);
    const gdpVals    = allRegions.map(r => Math.round(r.gdp * factor));

    // ВРП — всі регіони на всю ширину
    const gdpWrap = document.getElementById('db-gdp-wrap');
    if (gdpWrap) {
      gdpWrap.innerHTML = `<div style="position:relative;width:100%;height:100%;"><canvas id="db-gdp-chart"></canvas></div>`;
    }
    chartInstances['db-gdp-chart'] = new Chart(document.getElementById('db-gdp-chart'), {
      type: 'bar',
      data: {
        labels: allRegions.map(r => r.name),
        datasets: [{ label: `ВРП млн грн · ${yearSel}`, data: gdpVals, backgroundColor: allRegions.map((_, i) => REGION_PALETTE[i % REGION_PALETTE.length] + 'cc'), borderColor: darkMode ? '#444' : '#000040', borderWidth: 1 }]
      },
      options: chartOpts({ yLabel: 'млн грн' })
    });

    // Динаміка зарплат по регіонах
    chartInstances['db-salary-hist-chart'] = new Chart(document.getElementById('db-salary-hist-chart'), {
      type: 'line',
      data: {
        labels: HISTORY.years,
        datasets: [
          { label: 'Київ',    data: HISTORY.salary_kyiv,    borderColor: '#000080', backgroundColor: 'transparent', borderWidth: 2, tension: 0.2, fill: false, pointRadius: 2 },
          { label: 'Харків',  data: HISTORY.salary_kharkiv, borderColor: '#c00000', backgroundColor: 'transparent', borderWidth: 2, tension: 0.2, fill: false, pointRadius: 2 },
          { label: 'Дніпро',  data: HISTORY.salary_dnipro,  borderColor: '#008000', backgroundColor: 'transparent', borderWidth: 2, tension: 0.2, fill: false, pointRadius: 2 },
          { label: 'Львів',   data: HISTORY.salary_lviv,    borderColor: '#804000', backgroundColor: 'transparent', borderWidth: 2, tension: 0.2, fill: false, pointRadius: 2 },
          { label: 'Одеса',   data: HISTORY.salary_odesa,   borderColor: '#500080', backgroundColor: 'transparent', borderWidth: 2, tension: 0.2, fill: false, pointRadius: 2 },
          { label: 'Україна', data: HISTORY.salary_ua,      borderColor: '#007070', backgroundColor: darkMode ? 'rgba(0,112,112,0.1)' : 'rgba(0,112,112,0.05)', borderWidth: 2, tension: 0.2, fill: true, pointRadius: 2 },
        ]
      },
      options: chartOpts({ yLabel: 'грн' })
    });
  }

  if (tab === 'demographic') {
    destroyChart('db-pop-chart');
    destroyChart('db-pop-hist-chart');
    destroyChart('db-pop-pie-chart');

    const yearSel = document.getElementById('db-year').value || '2024';
    const yearIdx = HISTORY.years.indexOf(+yearSel);
    const factor  = (yearIdx >= 0 && HISTORY.population[yearIdx]) ? HISTORY.population[yearIdx] / HISTORY.population[HISTORY.population.length - 1] : 1;
    const allRegions = [...REGIONS].sort((a, b) => b.population - a.population);
    const popVals    = allRegions.map(r => +(r.population * factor).toFixed(1));

    // Стовпчикова — всі регіони на всю ширину
    const popWrap = document.getElementById('db-pop-wrap');
    if (popWrap) {
      popWrap.innerHTML = `<div style="position:relative;width:100%;height:100%;"><canvas id="db-pop-chart"></canvas></div>`;
    }
    chartInstances['db-pop-chart'] = new Chart(document.getElementById('db-pop-chart'), {
      type: 'bar',
      data: {
        labels: allRegions.map(r => r.name),
        datasets: [{ label: `Населення тис. · ${yearSel}`, data: popVals, backgroundColor: allRegions.map((_, i) => REGION_PALETTE[i % REGION_PALETTE.length] + 'cc'), borderColor: darkMode ? '#444' : '#004000', borderWidth: 1 }]
      },
      options: chartOpts({ yLabel: 'тис. осіб' })
    });

    // Динаміка населення України
    chartInstances['db-pop-hist-chart'] = new Chart(document.getElementById('db-pop-hist-chart'), {
      type: 'line',
      data: {
        labels: HISTORY.years,
        datasets: [{ label: 'Населення України', data: HISTORY.population, borderColor: '#006000', backgroundColor: darkMode ? 'rgba(0,96,0,0.15)' : 'rgba(0,96,0,0.1)', borderWidth: 2, tension: 0.2, fill: true, pointRadius: 2 }]
      },
      options: chartOpts({ yLabel: 'тис. осіб' })
    });

    // Кругова — розподіл населення по регіонах
    const pieWrap = document.getElementById('db-pop-pie-wrap');
    if (pieWrap) {
      pieWrap.innerHTML = `<div style="position:relative;width:100%;height:100%;"><canvas id="db-pop-pie-chart"></canvas></div>`;
    }
    chartInstances['db-pop-pie-chart'] = new Chart(document.getElementById('db-pop-pie-chart'), {
      type: 'doughnut',
      data: {
        labels: allRegions.map(r => r.name),
        datasets: [{ data: popVals, backgroundColor: allRegions.map((_, i) => REGION_PALETTE[i % REGION_PALETTE.length]), borderWidth: 1, borderColor: darkMode ? '#1e1e1e' : '#ffffff' }]
      },
      options: chartOptsNoScales({ yLabel: 'тис. осіб' })
    });
  }

  if (tab === 'employment') {
    destroyChart('db-unemp-chart');
    destroyChart('db-unemp-hist-chart');
    destroyChart('db-unemp-pie-chart');

    const yearSel = document.getElementById('db-year').value || '2024';
    const allRegions = [...REGIONS].sort((a, b) => b.unemployment - a.unemployment);

    // Стовпчикова — всі регіони на всю ширину
    const unWrap = document.getElementById('db-unemp-wrap');
    if (unWrap) {
      unWrap.innerHTML = `<div style="position:relative;width:100%;height:100%;"><canvas id="db-unemp-chart"></canvas></div>`;
    }
    chartInstances['db-unemp-chart'] = new Chart(document.getElementById('db-unemp-chart'), {
      type: 'bar',
      data: {
        labels: allRegions.map(r => r.name),
        datasets: [{ label: 'Безробіття %', data: allRegions.map(r => r.unemployment), backgroundColor: allRegions.map(r => r.unemployment > 10 ? '#c06060cc' : '#6080c0cc'), borderColor: darkMode ? '#444' : '#800000', borderWidth: 1 }]
      },
      options: chartOpts({ yLabel: '%' })
    });

    // Динаміка безробіття в Україні
    chartInstances['db-unemp-hist-chart'] = new Chart(document.getElementById('db-unemp-hist-chart'), {
      type: 'line',
      data: {
        labels: HISTORY.years,
        datasets: [{ label: 'Безробіття %', data: HISTORY.unemployment, borderColor: '#cc0000', backgroundColor: darkMode ? 'rgba(204,0,0,0.15)' : 'rgba(204,0,0,0.1)', borderWidth: 2, tension: 0.2, fill: true, pointRadius: 2 }]
      },
      options: chartOpts({ yLabel: '%' })
    });

    // Кругова — частка безробіття
    const piePie = document.getElementById('db-unemp-pie-wrap');
    if (piePie) {
      piePie.innerHTML = `<div style="position:relative;width:100%;height:100%;"><canvas id="db-unemp-pie-chart"></canvas></div>`;
    }
    chartInstances['db-unemp-pie-chart'] = new Chart(document.getElementById('db-unemp-pie-chart'), {
      type: 'doughnut',
      data: {
        labels: allRegions.map(r => r.name),
        datasets: [{ data: allRegions.map(r => r.unemployment), backgroundColor: allRegions.map((_, i) => REGION_PALETTE[i % REGION_PALETTE.length]), borderWidth: 1, borderColor: darkMode ? '#1e1e1e' : '#ffffff' }]
      },
      options: chartOptsNoScales({ yLabel: '%' })
    });
  }

  if (tab === 'inflation') {
    destroyChart('db-inflation-chart');
    destroyChart('db-real-salary-chart');
    destroyChart('db-gdp-line-chart');

    // Стовпчикова інфляція по роках
    chartInstances['db-inflation-chart'] = new Chart(document.getElementById('db-inflation-chart'), {
      type: 'bar',
      data: {
        labels: HISTORY.years,
        datasets: [{ label: 'Інфляція %', data: HISTORY.inflation, backgroundColor: HISTORY.inflation.map(v => v > 10 ? '#c06060cc' : v < 0 ? '#60c060cc' : '#6080c0cc'), borderColor: darkMode ? '#444' : '#000040', borderWidth: 1 }]
      },
      options: chartOpts({ yLabel: '%' })
    });

    // Реальна зарплата
    const base2010idx = HISTORY.years.indexOf(2010);
    const baseSalary  = HISTORY.salary_ua[base2010idx];
    const cpiAccum    = [];
    let cpi = 1;
    HISTORY.inflation.forEach((inf, i) => { if (i <= base2010idx) cpi = 1; else cpi *= (1 + inf / 100); cpiAccum.push(cpi); });
    const realSalary = HISTORY.salary_ua.map((v, i) => Math.round(v / cpiAccum[i] / baseSalary * 100));
    chartInstances['db-real-salary-chart'] = new Chart(document.getElementById('db-real-salary-chart'), {
      type: 'line',
      data: {
        labels: HISTORY.years,
        datasets: [{ label: 'Реальна зарплата (2010=100)', data: realSalary, borderColor: '#000080', backgroundColor: darkMode ? 'rgba(100,160,255,0.1)' : 'rgba(0,0,128,0.1)', borderWidth: 2, tension: 0.2, fill: true, pointRadius: 2 }]
      },
      options: chartOpts({ yLabel: 'індекс' })
    });

    // Номінальний ВВП лінійно
    const gdpLineWrap = document.getElementById('db-gdp-line-wrap');
    if (gdpLineWrap) {
      gdpLineWrap.innerHTML = `<div style="position:relative;width:100%;height:100%;"><canvas id="db-gdp-line-chart"></canvas></div>`;
    }
    chartInstances['db-gdp-line-chart'] = new Chart(document.getElementById('db-gdp-line-chart'), {
      type: 'line',
      data: {
        labels: HISTORY.years,
        datasets: [{ label: 'ВВП номінальний (млн грн)', data: HISTORY.gdp_ua, borderColor: '#006000', backgroundColor: darkMode ? 'rgba(0,96,0,0.12)' : 'rgba(0,96,0,0.07)', borderWidth: 2, tension: 0.2, fill: true, pointRadius: 2 }]
      },
      options: chartOpts({ yLabel: 'млн грн' })
    });
  }
}
