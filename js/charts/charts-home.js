/* ============================================================
   charts/charts-home.js — Графік на головній сторінці
   ============================================================ */

function renderHomeChart() {
  destroyChart('home-chart');
  const sorted  = [...(window.REGIONS || [])].sort((a, b) => b.salary - a.salary);
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
        borderColor: darkMode ? '#444' : '#000040',
        borderWidth: 1
      }]
    },
    options: chartOpts({ yLabel: 'грн' })
  });
}
