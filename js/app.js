/* ============================================================
   app.js — Bootstrap: завантажує дані і запускає SPA
   ============================================================ */

(async () => {
  // Лоадер
  const loader = document.createElement('div');
  loader.id = 'api-loader';
  loader.style.cssText = [
    'position:fixed;inset:0;z-index:99999;',
    'background:var(--win-face,#c0c0c0);',
    'display:flex;align-items:center;justify-content:center;',
    'font-family:Tahoma,sans-serif;font-size:13px;',
  ].join('');
  loader.innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:32px;margin-bottom:10px;"><img src="assets/УкрДані.png" width="64" height="64" alt="Україна" style="image-rendering:smooth;vertical-align:middle;"></div>
      <div style="font-weight:700;font-size:14px;margin-bottom:6px;">УкрДані</div>
      <div style="color:#555;font-size:11px;">Завантаження даних з API…</div>
    </div>`;
  document.body.appendChild(loader);

  await loadGlobalData();

  loader.remove();

  buildTaskbar();
  initHome();
})();
