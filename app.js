/* ============================================================
   EstData — app.js
   Дані + логіка SPA.
   ============================================================ */

// ─── DATA ────────────────────────────────────────────────────────────────────
const REGIONS = [
  {
    id: "harju", name: "Гар'юмаа",
    gdp: 14820, unemployment: 5.2, salary: 2180, population: 612.4,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [1680,1590,1780,1950,2180],
      gdp:          [11200,10400,12100,13400,14820],
      unemployment: [4.1,7.8,6.5,5.8,5.2]
    }
  },
  {
    id: "tartu", name: "Тартумаа",
    gdp: 4210, unemployment: 6.1, salary: 1780, population: 152.3,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [1340,1270,1430,1610,1780],
      gdp:          [3100,2850,3300,3800,4210],
      unemployment: [5.0,8.9,7.4,6.8,6.1]
    }
  },
  {
    id: "ida-viru", name: "Іда-Вірумаа",
    gdp: 2380, unemployment: 12.8, salary: 1310, population: 130.8,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [1060,990,1090,1200,1310],
      gdp:          [1920,1710,1950,2150,2380],
      unemployment: [10.2,14.5,13.8,13.1,12.8]
    }
  },
  {
    id: "parnu", name: "Пярнумаа",
    gdp: 1650, unemployment: 7.4, salary: 1490, population: 82.1,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [1150,1080,1210,1360,1490],
      gdp:          [1300,1150,1330,1520,1650],
      unemployment: [6.0,10.2,8.8,7.9,7.4]
    }
  },
  {
    id: "laane-viru", name: "Ляяне-Вірумаа",
    gdp: 1280, unemployment: 8.9, salary: 1350, population: 58.7,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [1040,980,1100,1230,1350],
      gdp:          [1010,900,1050,1180,1280],
      unemployment: [7.2,11.0,10.1,9.4,8.9]
    }
  },
  {
    id: "voru", name: "Вирумаа",
    gdp: 890, unemployment: 9.5, salary: 1250, population: 44.6,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [960,900,1010,1130,1250],
      gdp:          [710,640,750,820,890],
      unemployment: [7.8,12.3,11.4,10.2,9.5]
    }
  },
  {
    id: "laane", name: "Ляянемаа",
    gdp: 710, unemployment: 8.1, salary: 1310, population: 23.9,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [1010,950,1060,1180,1310],
      gdp:          [570,510,600,660,710],
      unemployment: [6.5,10.8,9.5,8.7,8.1]
    }
  },
  {
    id: "saare", name: "Саарємаа",
    gdp: 980, unemployment: 7.2, salary: 1430, population: 33.8,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [1090,1020,1160,1310,1430],
      gdp:          [760,680,800,900,980],
      unemployment: [5.9,9.8,8.4,7.7,7.2]
    }
  },
  {
    id: "jogeva", name: "Йигевамаа",
    gdp: 620, unemployment: 9.1, salary: 1220, population: 30.2,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [940,880,990,1100,1220],
      gdp:          [500,450,530,580,620],
      unemployment: [7.4,11.8,10.7,9.8,9.1]
    }
  },
  {
    id: "polva", name: "Пилвамаа",
    gdp: 540, unemployment: 9.8, salary: 1190, population: 27.4,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [920,860,970,1080,1190],
      gdp:          [430,385,460,505,540],
      unemployment: [8.0,12.5,11.2,10.4,9.8]
    }
  },
  {
    id: "rapla", name: "Рапламаа",
    gdp: 870, unemployment: 7.6, salary: 1400, population: 35.1,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [1070,1010,1130,1270,1400],
      gdp:          [690,620,730,810,870],
      unemployment: [6.1,10.0,8.9,8.1,7.6]
    }
  },
  {
    id: "hiiu", name: "Гіюмаа",
    gdp: 290, unemployment: 6.8, salary: 1360, population: 9.5,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [1040,980,1090,1220,1360],
      gdp:          [230,205,245,268,290],
      unemployment: [5.4,9.3,8.1,7.3,6.8]
    }
  },
  {
    id: "jarva", name: "Ярвамаа",
    gdp: 870, unemployment: 7.8, salary: 1410, population: 31.8,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [1090,1020,1140,1280,1410],
      gdp:          [700,630,740,810,870],
      unemployment: [6.2,10.4,9.2,8.4,7.8]
    }
  },
  {
    id: "viljandi", name: "Вільяндімаа",
    gdp: 1140, unemployment: 8.3, salary: 1370, population: 48.3,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [1050,990,1110,1240,1370],
      gdp:          [900,810,960,1060,1140],
      unemployment: [6.7,11.1,9.9,9.0,8.3]
    }
  },
  {
    id: "valga", name: "Валгамаа",
    gdp: 600, unemployment: 10.2, salary: 1230, population: 29.6,
    history: {
      years: [2019,2020,2021,2022,2023],
      salary:       [950,890,1000,1110,1230],
      gdp:          [485,435,515,560,600],
      unemployment: [8.4,13.0,11.8,10.9,10.2]
    }
  }
];

const METRIC_CONFIG = {
  salary:       { label:"зарплатою", name:"зарплати",    unit:"€",     decimals:0, statusName:"Зарплата"   },
  gdp:          { label:"ВРП",       name:"ВРП",          unit:"млн €", decimals:0, statusName:"ВРП"        },
  unemployment: { label:"безробіттям",name:"безробіття", unit:"%",     decimals:1, statusName:"Безробіття" }
};

// ─── STATE ────────────────────────────────────────────────────────────────────
const state = {
  selectedRegionId: REGIONS[0].id,
  selectedMetric:   "salary",
  compareAId:       REGIONS[0].id,
  compareBId:       REGIONS[1].id,
};

let lineChartInst = null;
let barChartInst  = null;

// ─── UTILS ────────────────────────────────────────────────────────────────────
function getRegion(id) { return REGIONS.find(r => r.id === id); }

// ─── CLOCK ────────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const el = document.getElementById('taskbarClock');
  if (el) el.textContent = `${h}:${m}`;
}
setInterval(updateClock, 10000);
updateClock();

// ─── CHART.JS DEFAULTS (Aero theme) ──────────────────────────────────────────
Chart.defaults.color       = 'rgba(140,175,220,0.75)';
Chart.defaults.font.family = "'Segoe UI','Trebuchet MS',sans-serif";
Chart.defaults.font.size   = 11;
Chart.defaults.borderColor = 'rgba(50,90,160,0.45)';

// ─── BUILD REGION BUTTONS ─────────────────────────────────────────────────────
function buildRegionButtons() {
  const container = document.getElementById('regionButtons');
  container.innerHTML = '';
  REGIONS.forEach(r => {
    const btn = document.createElement('button');
    btn.className   = 'region-btn' + (r.id === state.selectedRegionId ? ' active' : '');
    btn.textContent = r.name;
    btn.dataset.id  = r.id;
    btn.addEventListener('click', () => {
      state.selectedRegionId = r.id;
      document.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateDashboard();
    });
    container.appendChild(btn);
  });
}

// ─── BUILD COMPARE SELECTS ────────────────────────────────────────────────────
function buildCompareSelects() {
  ['compareA','compareB'].forEach((id,idx) => {
    const sel = document.getElementById(id);
    sel.innerHTML = '';
    REGIONS.forEach(r => {
      const opt = document.createElement('option');
      opt.value       = r.id;
      opt.textContent = r.name;
      sel.appendChild(opt);
    });
    sel.value = idx === 0 ? state.compareAId : state.compareBId;
    sel.addEventListener('change', () => {
      if (idx===0) state.compareAId = sel.value;
      else         state.compareBId = sel.value;
      updateComparison();
    });
  });
}

// ─── KPI CARDS ───────────────────────────────────────────────────────────────
function updateKpiCards(region) {
  document.getElementById('val-gdp').textContent          = region.gdp.toLocaleString('uk-UA');
  document.getElementById('val-salary').textContent       = region.salary.toLocaleString('uk-UA');
  document.getElementById('val-unemployment').textContent = region.unemployment.toFixed(1);
  document.getElementById('val-population').textContent   = region.population.toFixed(1);
  document.getElementById('statusRegionName').textContent = region.name;
  document.getElementById('titleChartRegion').textContent = region.name;
}

// ─── LINE CHART ──────────────────────────────────────────────────────────────
function updateLineChart(region, metric) {
  if (lineChartInst) lineChartInst.destroy();
  const ctx  = document.getElementById('lineChart').getContext('2d');
  const grad = ctx.createLinearGradient(0,0,0,200);
  grad.addColorStop(0,'rgba(79,163,232,0.30)');
  grad.addColorStop(1,'rgba(79,163,232,0.02)');
  lineChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels: region.history.years,
      datasets: [{
        label:                METRIC_CONFIG[metric]?.name || metric,
        data:                 region.history[metric],
        borderColor:          '#4fa3e8',
        backgroundColor:      grad,
        borderWidth:          2,
        pointBackgroundColor: '#8ecfff',
        pointBorderColor:     'rgba(10,25,55,0.9)',
        pointBorderWidth:     1.5,
        pointRadius:          4,
        tension:              0.35,
        fill:                 true,
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display:false },
        tooltip: {
          backgroundColor: 'rgba(12,28,65,0.95)',
          borderColor:     'rgba(79,163,232,0.5)',
          borderWidth:     1,
          titleColor:      '#cce8ff',
          bodyColor:       '#8ecfff',
          padding:         8,
          callbacks: { label: ctx => ` ${ctx.parsed.y} ${METRIC_CONFIG[metric]?.unit||''}` }
        }
      },
      scales: {
        x: { grid:{ color:'rgba(40,80,160,0.3)' }, ticks:{ color:'rgba(140,175,220,0.7)' } },
        y: {
          grid:  { color:'rgba(40,80,160,0.3)' },
          ticks: { color:'rgba(140,175,220,0.7)', callback: v=>`${v}${METRIC_CONFIG[metric]?.unit||''}` }
        }
      }
    }
  });
}

// ─── BAR CHART ───────────────────────────────────────────────────────────────
function updateBarChart(metric) {
  if (barChartInst) barChartInst.destroy();
  const sorted  = [...REGIONS].sort((a,b)=>b[metric]-a[metric]);
  const labels  = sorted.map(r=>r.name);
  const values  = sorted.map(r=>r[metric]);
  const colors  = sorted.map(r=> r.id===state.selectedRegionId ? 'rgba(142,207,255,0.85)' : 'rgba(79,163,232,0.45)');
  const borders = sorted.map(r=> r.id===state.selectedRegionId ? 'rgba(180,225,255,0.9)'  : 'rgba(79,163,232,0.6)');
  const ctx = document.getElementById('barChart').getContext('2d');
  barChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets:[{
        data:            values,
        backgroundColor: colors,
        borderColor:     borders,
        borderWidth:     1,
        borderRadius:    3,
        borderSkipped:   false,
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display:false },
        tooltip: {
          backgroundColor: 'rgba(12,28,65,0.95)',
          borderColor:     'rgba(79,163,232,0.5)',
          borderWidth:     1,
          titleColor:      '#cce8ff',
          bodyColor:       '#8ecfff',
          padding:         8,
          callbacks: { label: ctx => ` ${ctx.parsed.y} ${METRIC_CONFIG[metric]?.unit||''}` }
        }
      },
      scales: {
        x: { grid:{ display:false }, ticks:{ color:'rgba(140,175,220,0.7)', font:{size:9}, maxRotation:45, minRotation:30 } },
        y: { grid:{ color:'rgba(40,80,160,0.3)' }, ticks:{ color:'rgba(140,175,220,0.7)', callback: v=>`${v}${METRIC_CONFIG[metric]?.unit||''}` } }
      }
    }
  });
}

// ─── DASHBOARD UPDATE ─────────────────────────────────────────────────────────
function updateDashboard() {
  const region = getRegion(state.selectedRegionId);
  const metric = state.selectedMetric;
  const cfg    = METRIC_CONFIG[metric];
  updateKpiCards(region);
  updateLineChart(region, metric);
  updateBarChart(metric);
  document.getElementById('dynamicMetricName').textContent = cfg.name;
  document.getElementById('chartRegionName').textContent   = region.name;
  document.getElementById('barMetricLabel').textContent    = `за ${cfg.label}`;
  document.getElementById('statusMetric').textContent      = cfg.statusName;
}

// ─── COMPARISON ──────────────────────────────────────────────────────────────
function updateComparison() {
  const rA = getRegion(state.compareAId);
  const rB = getRegion(state.compareBId);
  const metrics = [
    { key:'gdp',          label:'ВРП',       unit:'млн €', higherBetter:true,  dec:0 },
    { key:'salary',       label:'Зарплата',  unit:'€',     higherBetter:true,  dec:0 },
    { key:'unemployment', label:'Безробіття',unit:'%',     higherBetter:false, dec:1 },
    { key:'population',   label:'Населення', unit:'тис.',  higherBetter:null,  dec:1 },
  ];
  function cls(aVal,bVal,higherBetter,isA) {
    if (higherBetter===null) return '';
    const aWins = higherBetter ? aVal>bVal : aVal<bVal;
    const bWins = higherBetter ? bVal>aVal : bVal<aVal;
    if (isA) return aWins?'is-better':bWins?'is-worse':'';
    else     return bWins?'is-better':aWins?'is-worse':'';
  }
  const buildCard = (region,badge,badgeCls,isA) => `
    <div class="compare-win">
      <div class="compare-win-header">
        <span class="compare-win-name">${region.name}</span>
        <span class="compare-badge ${badgeCls}">${badge}</span>
      </div>
      <div class="compare-rows">
        ${metrics.map(m=>{
          const aVal=rA[m.key], bVal=rB[m.key];
          const disp=region[m.key].toFixed(m.dec);
          const c=cls(aVal,bVal,m.higherBetter,isA);
          return `<div class="compare-row">
            <span class="compare-row-label">${m.label}</span>
            <span class="compare-row-value ${c}">${Number(disp).toLocaleString('uk-UA')} ${m.unit}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  document.getElementById('compareResult').innerHTML = `
    <div class="compare-grid">
      ${buildCard(rA,'Регіон A','badge-a',true)}
      ${buildCard(rB,'Регіон B','badge-b',false)}
    </div>`;
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.task-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const tab=btn.dataset.tab;
      document.querySelectorAll('.task-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-section').forEach(s=>s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-'+tab).classList.add('active');
      if (tab==='dashboard') updateDashboard();
      if (tab==='compare')   updateComparison();
    });
  });
}

// ─── METRIC TOGGLE ────────────────────────────────────────────────────────────
function initMetricToggle() {
  document.querySelectorAll('.metric-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      state.selectedMetric=btn.dataset.metric;
      document.querySelectorAll('.metric-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      updateDashboard();
    });
  });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  buildRegionButtons();
  buildCompareSelects();
  initTabs();
  initMetricToggle();
  updateDashboard();
  updateComparison();
}

document.addEventListener('DOMContentLoaded', init);