/* ============================================================
   charts/charts-core.js — Спільні утиліти Chart.js
   ============================================================ */

Chart.defaults.color       = '#444444';
Chart.defaults.font.family = "'Tahoma','MS Sans Serif','Arial',sans-serif";
Chart.defaults.font.size   = 10;
Chart.defaults.borderColor = '#c0c0c0';

const REGION_PALETTE = [
  '#000080','#1084d0','#006000','#cc0000','#804000','#500080',
  '#007070','#804080','#406000','#006080','#800040','#408040',
  '#204080','#804020','#408060','#602080','#806020','#206060',
  '#602020','#206020','#602060','#406080','#806080','#408020','#204060'
];

/* ── Колірні хелпери (враховують darkMode) ─────────────────── */
const cc = {
  text:          () => darkMode ? '#c0c0c0' : '#444444',
  grid:          () => darkMode ? '#333333' : '#e0e0e0',
  tooltipBg:     () => darkMode ? '#1e1e2e' : '#ffffcc',
  tooltipBorder: () => darkMode ? '#6ab0f5' : '#000080',
  tooltipText:   () => darkMode ? '#e0e0e0' : '#000000',
};

/* ── Загальні опції ─────────────────────────────────────────── */

function chartOpts({ yLabel = '' } = {}) {
  const tc = cc.text(), gc = cc.grid();
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: tc, font: { size: 10 }, boxWidth: 12 } },
      tooltip: {
        backgroundColor: cc.tooltipBg(), borderColor: cc.tooltipBorder(), borderWidth: 1,
        titleColor: cc.tooltipText(), bodyColor: cc.tooltipText(), padding: 6,
        callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString('uk-UA') ?? ''} ${yLabel}` }
      }
    },
    scales: {
      x: { grid: { color: gc }, ticks: { color: tc, font: { size: 9 }, maxRotation: 45, minRotation: 30 } },
      y: { grid: { color: gc }, ticks: { color: tc, font: { size: 9 }, callback: v => v.toLocaleString('uk-UA') } }
    }
  };
}

function chartOptsNoScales({ yLabel = '' } = {}) {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right', labels: { color: cc.text(), font: { size: 9 }, boxWidth: 10, padding: 6 } },
      tooltip: {
        backgroundColor: cc.tooltipBg(), borderColor: cc.tooltipBorder(), borderWidth: 1,
        titleColor: cc.tooltipText(), bodyColor: cc.tooltipText(), padding: 6,
        callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed?.toLocaleString('uk-UA') ?? ''} ${yLabel}` }
      }
    }
  };
}

function chartOptsStacked({ yLabel = '' } = {}) {
  const tc = cc.text(), gc = cc.grid();
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: tc, font: { size: 10 }, boxWidth: 12 } },
      tooltip: {
        backgroundColor: cc.tooltipBg(), borderColor: cc.tooltipBorder(), borderWidth: 1,
        titleColor: cc.tooltipText(), bodyColor: cc.tooltipText(), padding: 6, mode: 'index',
        callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString('uk-UA') ?? ''} ${yLabel}` }
      }
    },
    scales: {
      x: { stacked: true, grid: { color: gc }, ticks: { color: tc, font: { size: 9 }, maxRotation: 45 } },
      y: { stacked: true, grid: { color: gc }, ticks: { color: tc, font: { size: 9 }, callback: v => v.toLocaleString('uk-UA') } }
    }
  };
}

/* ── Управління екземплярами ────────────────────────────────── */

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

/* Перестворює canvas у контейнері (для правого блоку де рефреш) */
function setCanvas(wrapperId, canvasId) {
  const w = document.getElementById(wrapperId);
  if (!w) return null;
  w.innerHTML = `<div style="position:relative;width:100%;height:100%;"><canvas id="${canvasId}"></canvas></div>`;
  return document.getElementById(canvasId);
}

function removeYearPicker(wrapperId) {
  const pickerId = wrapperId + '-year-pick';
  const picker = document.getElementById(pickerId);
  if (picker && picker.parentNode) {
    picker.parentNode.remove();
  }
}

/* Вставляє пікер року над блоком wrapperId (видаляючи старий, якщо є) */
function injectYearPicker(wrapperId, availableYears, onChangeFn) {
  const w = document.getElementById(wrapperId);
  if (!w) return null;
  removeYearPicker(wrapperId);

  const pickerId = wrapperId + '-year-pick';
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:10px;';
  bar.innerHTML = `<span>Рік:</span>
    <select id="${pickerId}" style="font-size:10px;padding:1px 2px;">
      ${availableYears.map(y => `<option value="${y}">${y}</option>`).join('')}
    </select>`;
  w.parentNode.insertBefore(bar, w);
  document.getElementById(pickerId).addEventListener('change', onChangeFn);

  return document.getElementById(pickerId);
}
