/* ============================================================
   charts/charts-datasets.js — Графіки для 12 датасетів
   ============================================================ */

async function renderDatasetChart(datasetId) {
  const titleEl = document.getElementById('ds-chart-title');
  if (titleEl) titleEl.textContent = 'Завантаження даних…';

  let apiData;
  try {
    const resp = await fetch(`http://localhost:8000/v1/dataset-data/${datasetId}`);
    if (!resp.ok) throw new Error('API error ' + resp.status);
    apiData = await resp.json();
  } catch(e) {
    console.error('renderDatasetChart fetch error:', e);
    if (titleEl) titleEl.textContent = 'Помилка завантаження. Перевірте бекенд.';
    return;
  }

  if (titleEl) titleEl.textContent = apiData.title;
  destroyChart('ds-line-chart');
  destroyChart('ds-bar-chart');

  if (typeof removeYearPicker === 'function') {
    removeYearPicker('ds-bar-wrap');
  }

  const t = apiData.type;

  /* ---------- multi_line / natural_movement ---------- */
  if (t === 'multi_line' || t === 'natural_movement') {
    const years = apiData.series[0].data.map(d => d.year);

    // Лівий графік (лінії)
    const leftCanvas = document.getElementById('ds-line-chart');
    if (leftCanvas) {
      destroyChart('ds-line-chart');
      chartInstances['ds-line-chart'] = new Chart(leftCanvas, {
        type: 'line',
        data: {
          labels: years,
          datasets: apiData.series.map(s => ({
            label: s.label,
            data: s.data.map(d => d.value),
            borderColor: s.color,
            backgroundColor: s.color + '18',
            borderWidth: 2, pointRadius: 2, tension: 0.2,
            fill: t === 'natural_movement' && s.label.includes('приріст'),
          }))
        },
        options: chartOpts({ yLabel: apiData.y_label || '' })
      });
    }

    // Правий графік (стовпці з пікером року)
    const barTitleEl = document.getElementById('ds-bar-chart-title');
    if (barTitleEl) barTitleEl.textContent = 'Порівняння / Структура';

    const renderBarForYear = (selectedYear) => {
      destroyChart('ds-bar-chart');
      const barCanvas = setCanvas('ds-bar-wrap', 'ds-bar-chart');
      if (!barCanvas) return;
      const yi = years.indexOf(+selectedYear);
      if (yi < 0) return;
      chartInstances['ds-bar-chart'] = new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: apiData.series.map(s => s.label),
          datasets: [{
            label: String(selectedYear),
            data: apiData.series.map(s => s.data[yi]?.value ?? null),
            backgroundColor: apiData.series.map(s => s.color + 'cc'),
            borderColor: apiData.series.map(s => s.color),
            borderWidth: 1
          }]
        },
        options: chartOpts({ yLabel: apiData.y_label || '' })
      });
    };

    const picker = injectYearPicker('ds-bar-wrap', [...years].reverse(), e => renderBarForYear(e.target.value));
    const initYear = picker ? picker.value : years[years.length - 1];
    renderBarForYear(initYear);
  }

  /* ---------- bar_regions (ВРП) ---------- */
  else if (t === 'bar_regions') {
    const renderRegionsForYear = async (yr) => {
      let data = apiData;
      if (parseInt(yr) !== apiData.year) {
        try {
          const r2 = await fetch(`http://localhost:8000/v1/dataset-data/2?year=${yr}`);
          data = await r2.json();
        } catch(e) { return; }
      }

      // Лівий графік — горизонтальний бар
      const leftCanvas = document.getElementById('ds-line-chart');
      if (leftCanvas) {
        destroyChart('ds-line-chart');
        chartInstances['ds-line-chart'] = new Chart(leftCanvas, {
          type: 'bar',
          data: {
            labels: data.data.map(d => d.region),
            datasets: [{
              label: `ВРП регіонів · ${data.year}`,
              data: data.data.map(d => d.value),
              backgroundColor: data.data.map((_, i) => REGION_PALETTE[i % REGION_PALETTE.length] + 'cc'),
              borderColor: darkMode ? '#444' : '#000040', borderWidth: 1
            }]
          },
          options: chartOpts({ yLabel: data.y_label })
        });
      }

      // Правий графік — пончик
      destroyChart('ds-bar-chart');
      const barCanvas = setCanvas('ds-bar-wrap', 'ds-bar-chart');
      if (barCanvas) {
        chartInstances['ds-bar-chart'] = new Chart(barCanvas, {
          type: 'doughnut',
          data: {
            labels: data.data.map(d => d.region),
            datasets: [{ data: data.data.map(d => d.value), backgroundColor: data.data.map((_, i) => REGION_PALETTE[i % REGION_PALETTE.length]), borderWidth: 1, borderColor: darkMode ? '#1e1e1e' : '#fff' }]
          },
          options: chartOptsNoScales({ yLabel: data.y_label })
        });
      }

      const titleEl = document.getElementById('ds-chart-title');
      if (titleEl) titleEl.textContent = `${data.title} · ${data.year}`;
      const note = (data.year >= 2005 && data.year <= 2013) ? ' (включно з АР Крим та Севастополем)' : '';
      const barTitleEl = document.getElementById('ds-bar-chart-title');
      if (barTitleEl) barTitleEl.textContent = `Структура ВРП по регіонах${note}`;
    };

    const barTitleEl = document.getElementById('ds-bar-chart-title');
    if (barTitleEl) barTitleEl.textContent = 'Структура ВРП по регіонах';

    const picker = injectYearPicker('ds-bar-wrap', [2024, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005], e => renderRegionsForYear(e.target.value));
    renderRegionsForYear(picker ? picker.value : 2024);
  }

  /* ---------- bar_line (Безробіття, ІЦВ) ---------- */
  else if (t === 'bar_line') {
    const years = apiData.data.map(d => d.year);
    const vals  = apiData.data.map(d => d.value);

    const leftTitleEl = document.getElementById('ds-chart-title');
    if (leftTitleEl) leftTitleEl.textContent = apiData.title + ' – стовпчикова діаграма';

    const leftCanvas = document.getElementById('ds-line-chart');
    if (leftCanvas) {
      destroyChart('ds-line-chart');
      chartInstances['ds-line-chart'] = new Chart(leftCanvas, {
        type: 'bar',
        data: {
          labels: years,
          datasets: [{
            label: apiData.title,
            data: vals,
            backgroundColor: vals.map(v => v < 0 ? '#c0606088' : v > 20 ? '#c0000088' : '#6080c088'),
            borderColor: darkMode ? '#444' : '#000040', borderWidth: 1
          }]
        },
        options: chartOpts({ yLabel: apiData.y_label })
      });
    }

    const barTitleEl = document.getElementById('ds-bar-chart-title');
    if (barTitleEl) barTitleEl.textContent = apiData.title + ' – графік';

    const barCanvas = setCanvas('ds-bar-wrap', 'ds-bar-chart');
    if (barCanvas) {
      destroyChart('ds-bar-chart');
      chartInstances['ds-bar-chart'] = new Chart(barCanvas, {
        type: 'line',
        data: {
          labels: years,
          datasets: [{ label: apiData.title, data: vals, borderColor: '#000080', backgroundColor: 'rgba(0,0,128,0.1)', borderWidth: 2, tension: 0.3, fill: true, pointRadius: 2 }]
        },
        options: chartOpts({ yLabel: apiData.y_label })
      });
    }
  }

  /* ---------- area_line (Населення) ---------- */
  else if (t === 'area_line') {
    const years = apiData.data.map(d => d.year);
    const vals  = apiData.data.map(d => d.value);

    const leftCanvas = document.getElementById('ds-line-chart');
    if (leftCanvas) {
      destroyChart('ds-line-chart');
      chartInstances['ds-line-chart'] = new Chart(leftCanvas, {
        type: 'line',
        data: {
          labels: years,
          datasets: [{ label: apiData.title, data: vals, borderColor: '#006000', backgroundColor: 'rgba(0,96,0,0.12)', borderWidth: 2, tension: 0.2, fill: true, pointRadius: 2 }]
        },
        options: chartOpts({ yLabel: apiData.y_label })
      });
    }

    const barTitleEl = document.getElementById('ds-bar-chart-title');
    if (barTitleEl) barTitleEl.textContent = 'Щорічна зміна';

    const barCanvas = setCanvas('ds-bar-wrap', 'ds-bar-chart');
    if (barCanvas) {
      destroyChart('ds-bar-chart');
      const changes = vals.map((v, i) => i === 0 ? 0 : +(v - vals[i-1]).toFixed(1));
      chartInstances['ds-bar-chart'] = new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: years,
          datasets: [{ label: 'Щорічна зміна, тис.', data: changes, backgroundColor: changes.map(v => v >= 0 ? '#60c06088' : '#c0606088'), borderColor: darkMode ? '#444' : '#000', borderWidth: 1 }]
        },
        options: chartOpts({ yLabel: 'тис. осіб' })
      });
    }
  }

  /* ---------- dual_axis (ІСЦ+ВВП, реальна зарплата) ---------- */
  else if (t === 'dual_axis') {
    const s0 = apiData.series[0], s1 = apiData.series[1];
    const years = s0.data.map(d => d.year);
    // ВИПРАВЛЕНО: використовуємо функції з cc (з charts-core.js)
    const tc = cc.text();
    const gc = cc.grid();
    const tooltipBg = cc.tooltipBg();
    const tooltipBorder = cc.tooltipBorder();
    const tooltipText = cc.tooltipText();

    const leftCanvas = document.getElementById('ds-line-chart');
    if (leftCanvas) {
      destroyChart('ds-line-chart');
      chartInstances['ds-line-chart'] = new Chart(leftCanvas, {
        type: 'line',
        data: {
          labels: years,
          datasets: [
            { label: s0.label, data: s0.data.map(d => d.value), borderColor: s0.color, yAxisID: 'y',  borderWidth: 2, tension: 0.2, pointRadius: 2, fill: false },
            { label: s1.label, data: s1.data.map(d => d.value), borderColor: s1.color, yAxisID: 'y1', borderWidth: 2, tension: 0.2, pointRadius: 2, fill: false, borderDash: [4,2] },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: true, labels: { color: tc, font: { size: 10 }, boxWidth: 12 } },
            tooltip: { backgroundColor: tooltipBg, borderColor: tooltipBorder, borderWidth: 1, titleColor: tooltipText, bodyColor: tooltipText, mode: 'index' }
          },
          scales: {
            x:  { grid: { color: gc }, ticks: { color: tc, font: { size: 9 }, maxRotation: 45 } },
            y:  { grid: { color: gc }, ticks: { color: s0.color, font: { size: 9 } }, title: { display: true, text: s0.y_label, color: s0.color } },
            y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: s1.color, font: { size: 9 } }, title: { display: true, text: s1.y_label, color: s1.color } }
          }
        }
      });
    }

    const barTitleEl = document.getElementById('ds-bar-chart-title');
    if (barTitleEl) barTitleEl.textContent = 'Порівняння двох показників за рік';

    const renderBarYear = (selectedYear) => {
      destroyChart('ds-bar-chart');
      const barCanvas = setCanvas('ds-bar-wrap', 'ds-bar-chart');
      if (!barCanvas) return;
      const yi = years.indexOf(+selectedYear);
      if (yi < 0) return;
      chartInstances['ds-bar-chart'] = new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: [s0.label, s1.label],
          datasets: [{
            label: String(selectedYear),
            data: [s0.data[yi]?.value, s1.data[yi]?.value],
            backgroundColor: [s0.color + 'cc', s1.color + 'cc'],
            borderColor: [s0.color, s1.color], borderWidth: 1
          }]
        },
        options: chartOpts({ yLabel: '' })
      });
    };

    const picker = injectYearPicker('ds-bar-wrap', [...years].reverse(), e => renderBarYear(e.target.value));
    renderBarYear(picker ? picker.value : years[years.length - 1]);
  }

  /* ---------- stacked_bar (Зайнятість, структура ВВП) ---------- */
  else if (t === 'stacked_bar') {
    const years = apiData.series[0].data.map(d => d.year);

    const leftCanvas = document.getElementById('ds-line-chart');
    if (leftCanvas) {
      destroyChart('ds-line-chart');
      chartInstances['ds-line-chart'] = new Chart(leftCanvas, {
        type: 'bar',
        data: {
          labels: years,
          datasets: apiData.series.map(s => ({
            label: s.label, data: s.data.map(d => d.value),
            backgroundColor: s.color + 'cc', borderColor: s.color, borderWidth: 1
          }))
        },
        options: chartOptsStacked({ yLabel: apiData.y_label })
      });
    }

    const barTitleEl = document.getElementById('ds-bar-chart-title');
    if (barTitleEl) barTitleEl.textContent = 'Структура за рік';

    const renderDonutYear = (selectedYear) => {
      destroyChart('ds-bar-chart');
      const barCanvas = setCanvas('ds-bar-wrap', 'ds-bar-chart');
      if (!barCanvas) return;
      const yi = years.indexOf(+selectedYear);
      if (yi < 0) return;
      chartInstances['ds-bar-chart'] = new Chart(barCanvas, {
        type: 'doughnut',
        data: {
          labels: apiData.series.map(s => s.label),
          datasets: [{ data: apiData.series.map(s => s.data[yi]?.value ?? 0), backgroundColor: apiData.series.map(s => s.color), borderWidth: 2, borderColor: darkMode ? '#1e1e1e' : '#fff' }]
        },
        options: chartOptsNoScales({ yLabel: apiData.y_label })
      });
    };

    const picker = injectYearPicker('ds-bar-wrap', [...years].reverse(), e => renderDonutYear(e.target.value));
    renderDonutYear(picker ? picker.value : years[years.length - 1]);
  }

  /* ---------- budget (Бюджет) ---------- */
  else if (t === 'budget') {
    const years = apiData.series[0].data.map(d => d.year);

    const leftCanvas = document.getElementById('ds-line-chart');
    if (leftCanvas) {
      destroyChart('ds-line-chart');
      chartInstances['ds-line-chart'] = new Chart(leftCanvas, {
        type: 'bar',
        data: {
          labels: years,
          datasets: [
            { label: 'Доходи',  data: apiData.series[0].data.map(d => d.value), backgroundColor: '#00008088', borderColor: '#000080', borderWidth: 1 },
            { label: 'Видатки', data: apiData.series[1].data.map(d => d.value), backgroundColor: '#c0000088', borderColor: '#c00000', borderWidth: 1 },
          ]
        },
        options: chartOpts({ yLabel: 'млрд грн' })
      });
    }

    const barTitleEl = document.getElementById('ds-bar-chart-title');
    if (barTitleEl) barTitleEl.textContent = 'Баланс бюджету';

    const barCanvas = setCanvas('ds-bar-wrap', 'ds-bar-chart');
    if (barCanvas) {
      destroyChart('ds-bar-chart');
      const balData = apiData.series[2].data;
      chartInstances['ds-bar-chart'] = new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: balData.map(d => d.year),
          datasets: [{ label: 'Баланс (+ профіцит / − дефіцит)', data: balData.map(d => d.value), backgroundColor: balData.map(d => d.value >= 0 ? '#60c06088' : '#c0606088'), borderColor: darkMode ? '#444' : '#000', borderWidth: 1 }]
        },
        options: chartOpts({ yLabel: 'млрд грн' })
      });
    }
  }

  /* ---------- trade (Зовнішня торгівля) ---------- */
  else if (t === 'trade') {
    const years = apiData.series[0].data.map(d => d.year);

    const leftCanvas = document.getElementById('ds-line-chart');
    if (leftCanvas) {
      destroyChart('ds-line-chart');
      chartInstances['ds-line-chart'] = new Chart(leftCanvas, {
        type: 'line',
        data: {
          labels: years,
          datasets: [
            { label: 'Експорт', data: apiData.series[0].data.map(d => d.value), borderColor: '#000080', backgroundColor: 'rgba(0,0,128,0.08)', borderWidth: 2, tension: 0.2, fill: true, pointRadius: 2 },
            { label: 'Імпорт',  data: apiData.series[1].data.map(d => d.value), borderColor: '#c00000', backgroundColor: 'rgba(192,0,0,0.08)',   borderWidth: 2, tension: 0.2, fill: true, pointRadius: 2 },
          ]
        },
        options: chartOpts({ yLabel: 'млрд USD' })
      });
    }

    const barTitleEl = document.getElementById('ds-bar-chart-title');
    if (barTitleEl) barTitleEl.textContent = 'Торговий баланс';

    const barCanvas = setCanvas('ds-bar-wrap', 'ds-bar-chart');
    if (barCanvas) {
      destroyChart('ds-bar-chart');
      const balData = apiData.series[2].data;
      chartInstances['ds-bar-chart'] = new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: balData.map(d => d.year),
          datasets: [{ label: 'Торговий баланс', data: balData.map(d => d.value), backgroundColor: balData.map(d => d.value >= 0 ? '#60c06088' : '#c0606088'), borderColor: darkMode ? '#444' : '#000', borderWidth: 1 }]
        },
        options: chartOpts({ yLabel: 'млрд USD' })
      });
    }
  }

  // Невелика затримка для примусового перемалювання (вирішує проблеми з розмірами canvas)
  setTimeout(() => {
    if (chartInstances['ds-line-chart']) chartInstances['ds-line-chart'].resize();
    if (chartInstances['ds-bar-chart']) chartInstances['ds-bar-chart'].resize();
  }, 100);
}

/* updateDataset — використовує глобальний _currentDatasetId з state.js */
function updateDataset() {
  renderDatasetChart(_currentDatasetId);
}