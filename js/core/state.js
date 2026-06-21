/* ============================================================
   core/state.js — Глобальний стан SPA
   ============================================================ */

let currentPage      = 'home';
let darkMode         = false;
let statView         = 'grid';
let currentChartType = 'line';

const chartInstances = {};
const minimizedPages = {};

let tableData    = [];
let tablePage_   = 0;
let tableSortCol = 0;
let tableSortAsc = true;

let statSortCol  = -1;
let statSortAsc  = true;

const PAGE_SIZE = 15;

// Поточний відкритий датасет (використовується в statistics.js і charts-datasets.js)
let _currentDatasetId = null;

// Сторінки: id → мета (іконка, назва в тасклеті)
const PAGES_META = {
  home:       { icon:'<img src="assets/УкрДані.png" width="16" height="16" alt="УкрДані" style="image-rendering:smooth;vertical-align:middle;">',  label:'УкрДані'    },
  statistics: { icon:'<img src="assets/statistics.png" width="16" height="16" alt="Статистика" style="image-rendering:smooth;vertical-align:middle;">',  label:'Статистика' },
  map:        { icon:'<img src="assets/map.png" width="16" height="16" alt="Карта" style="image-rendering:smooth;vertical-align:middle;">',  label:'Карта'      },
  compare:    { icon:'<img src="assets/compare.png" width="16" height="16" alt="Порівняння" style="image-rendering:smooth;vertical-align:middle;">',  label:'Порівняння' },
  api:        { icon:'<img src="assets/api.png" width="16" height="16" alt="API Explorer" style="image-rendering:smooth;vertical-align:middle;">',  label:'API'        },
  sources:    { icon:'<img src="assets/folder1.png" width="16" height="16" alt="Джерела" style="image-rendering:smooth;vertical-align:middle;">',  label:'Джерела'    },
  about:      { icon:'<img src="assets/about.png" width="16" height="16" alt="Про проєкт" style="image-rendering:smooth;vertical-align:middle;">',  label:'Про проєкт' },
};
