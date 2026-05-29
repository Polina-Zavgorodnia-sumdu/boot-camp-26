/* ============================================================
   state.js — Глобальний стан SPA
   ============================================================ */

let currentPage    = 'home';
let darkMode       = false;
let statView       = 'grid';
let currentChartType = 'line';
let currentDbTab   = 'economic';

const chartInstances = {};
const minimizedPages = {};

let tableData     = [];
let tablePage_    = 0;
let tableSortCol  = 0;
let tableSortAsc  = true;

let statSortCol   = -1;
let statSortAsc   = true;

const PAGE_SIZE   = 15;

const PAGES_META  = {
  home:       { icon:'🖥️', label:'УкрДані'    },
  statistics: { icon:'📊', label:'Статистика' },
  dataset:    { icon:'🗄️', label:'Dataset'    },
  dashboards: { icon:'📈', label:'Дашборди'   },
  api:        { icon:'⚙️', label:'API'        },
  sources:    { icon:'📁', label:'Джерела'    },
  about:      { icon:'ℹ️', label:'Про проєкт' },
};