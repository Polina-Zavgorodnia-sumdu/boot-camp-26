/* ============================================================
   core/router.js — SPA-роутер та таскбар
   ============================================================ */

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (!pageEl) { console.warn('navigate: page not found:', page); return; }
  pageEl.classList.add('active');

  document.querySelectorAll('.tbar-btn').forEach(b => b.classList.remove('active'));
  const tBtn = document.querySelector(`.tbar-btn[data-page="${page}"]`);
  if (tBtn) tBtn.classList.add('active');

  currentPage = page;
  closeStartMenu();
  initPage(page);
}

function initPage(page) {
  if (page === 'home')       initHome();
  if (page === 'statistics') initStatistics();
  if (page === 'map')        initMap();
  if (page === 'compare')    initCompare();
  if (page === 'api')        initApi();
  if (page === 'sources')    initSources();
  // about — статичний контент, не потребує init
}

function buildTaskbar() {
  const container = document.getElementById('taskbar-buttons');
  if (!container) return;
  container.innerHTML = '';
  Object.entries(PAGES_META).forEach(([id, meta]) => {
    const btn = document.createElement('button');
    btn.className    = 'tbar-btn raised' + (id === 'home' ? ' active' : '');
    btn.dataset.page = id;
    btn.innerHTML    = `${meta.icon} ${meta.label}`;
    btn.onclick      = () => navigate(id);
    container.appendChild(btn);
  });
}
