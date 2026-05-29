/* ============================================================
   ui.js — Оболонка: вікна, годинник, меню, тема
   ============================================================ */

/* ── MINIMIZE / MAXIMIZE / RESTORE ── */

function minimizePage() {
  const pageEl = document.querySelector('.page.active');
  if (!pageEl) return;
  const win = pageEl.querySelector('.win-window');
  if (!win) return;
  const id = pageEl.id;
  if (!minimizedPages[id]) {
    minimizedPages[id] = { left:win.style.left, top:win.style.top, width:win.style.width, height:win.style.height };
  }
  win.style.transition = 'all 0.15s ease';
  win.style.transform  = 'scale(0.1) translateY(400px)';
  win.style.opacity    = '0';
  win.style.pointerEvents = 'none';
  const tBtn = document.querySelector(`.tbar-btn[data-page="${currentPage}"]`);
  if (tBtn) { tBtn.classList.remove('active'); tBtn.onclick = () => restorePage(currentPage); }
}

function restorePage(pageId) {
  navigate(pageId);
  const pageEl = document.getElementById('page-' + pageId);
  const win    = pageEl?.querySelector('.win-window');
  if (!win) return;
  win.style.transition    = 'all 0.15s ease';
  win.style.transform     = '';
  win.style.opacity       = '';
  win.style.pointerEvents = '';
  const saved = minimizedPages[pageId];
  if (saved) { win.style.left = saved.left; win.style.top = saved.top; win.style.width = saved.width; win.style.height = saved.height; delete minimizedPages[pageId]; }
  const tBtn = document.querySelector(`.tbar-btn[data-page="${pageId}"]`);
  if (tBtn) { tBtn.classList.add('active'); tBtn.onclick = () => navigate(pageId); }
}

function maximizePage(pageId) {
  const win = document.querySelector(`#${pageId} .win-window`);
  if (!win) return;
  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    win.style.cssText = 'left:10px;top:8px;width:calc(100% - 20px);height:calc(100% - 16px);';
  } else {
    win.classList.add('maximized');
    win.style.cssText = 'left:0;top:0;width:100%;height:100%;';
  }
}

/* ── CLOCK ── */

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  document.getElementById('clock').textContent = `${h}:${m}`;
}
setInterval(updateClock, 10000);
updateClock();

/* ── START MENU ── */

function toggleStartMenu() { document.getElementById('start-menu').classList.toggle('open'); }
function closeStartMenu()  { document.getElementById('start-menu').classList.remove('open'); }

document.addEventListener('click', e => {
  if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) closeStartMenu();
});

/* ── DARK THEME ── */

function applyChartColors(isDark) {
  if (isDark) {
    Chart.defaults.color       = '#c0c0c0';
    Chart.defaults.borderColor = '#444444';
  } else {
    Chart.defaults.color       = '#444444';
    Chart.defaults.borderColor = '#c0c0c0';
  }
}

function toggleTheme() {
  darkMode = !darkMode;
  const root = document.documentElement;
  const btn  = document.getElementById('theme-btn');
  if (darkMode) {
    root.style.setProperty('--win-face',     '#2a2a2a');
    root.style.setProperty('--win-highlight','#4a4a4a');
    root.style.setProperty('--win-dark',     '#000000');
    root.style.setProperty('--desktop-bg',   '#004040');
    root.style.setProperty('--text',         '#e0e0e0');
    root.style.setProperty('--text-muted',   '#a0a0a0');
    root.style.setProperty('--white',        '#1a1a1a');
    root.style.setProperty('--input-bg',     '#1a1a1a');
    root.style.setProperty('--chart-bg',     '#1e1e1e');
    root.style.setProperty('--table-even',   '#222222');
    root.style.setProperty('--table-border', '#444444');
    root.style.setProperty('--link-color',   '#6ab0f5');
    root.style.setProperty('--link-hover',   '#ff8888');
    document.body.classList.add('dark-mode');
    if (btn) btn.textContent = '☀️ Світла тема';
    applyChartColors(true);
  } else {
    root.style.setProperty('--win-face',     '#d4d0c8');
    root.style.setProperty('--win-highlight','#ffffff');
    root.style.setProperty('--win-dark',     '#404040');
    root.style.setProperty('--desktop-bg',   '#008080');
    root.style.setProperty('--text',         '#000000');
    root.style.setProperty('--text-muted',   '#444444');
    root.style.setProperty('--white',        '#ffffff');
    root.style.setProperty('--input-bg',     '#ffffff');
    root.style.setProperty('--chart-bg',     '#ffffff');
    root.style.setProperty('--table-even',   '#f0eeea');
    root.style.setProperty('--table-border', '#d0ccc0');
    root.style.setProperty('--link-color',   '#000080');
    root.style.setProperty('--link-hover',   '#cc0000');
    document.body.classList.remove('dark-mode');
    if (btn) btn.textContent = '🌙 Темна тема';
    applyChartColors(false);
  }
  // Перестворити всі поточні графіки щоб вони підхопили нові кольори
  if (currentPage === 'home')       renderHomeChart();
  if (currentPage === 'dashboards') renderDbCharts(currentDbTab);
  if (currentPage === 'dataset')    updateDataset();
}
