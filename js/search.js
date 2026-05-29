/* ============================================================
   search.js — Пошук датасетів з debounce
   ============================================================ */

let searchTimer = null;

function debounceSearch(val, resultId) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => showSearchResults(val, resultId), 300);
}

function showSearchResults(val, resultId) {
  const el = document.getElementById(resultId);
  if (!val || val.length < 2) { el.style.display = 'none'; return; }
  const matches = DATASETS.filter(d => d.title.toLowerCase().includes(val.toLowerCase())).slice(0, 6);
  if (!matches.length) { el.style.display = 'none'; return; }
  el.innerHTML = matches.map(d =>
    `<div style="padding:4px 8px;cursor:pointer;border-bottom:1px solid #ddd;font-size:11px;"
      onmousedown="navigate('dataset');openDataset(${d.id})"
      onmouseenter="this.style.background='#000080';this.style.color='#fff'"
      onmouseleave="this.style.background='';this.style.color=''">
      ${CATEGORIES.find(c => c.id === d.cat)?.icon || '📊'} ${d.title}
    </div>`
  ).join('');
  el.style.display = 'block';
}

function doSearch(val) {
  if (val) {
    document.getElementById('search-results').style.display = 'none';
    navigate('statistics');
    setTimeout(() => {
      const s = document.getElementById('stat-search');
      if (s) { s.value = val; filterStatistics(); }
    }, 50);
  }
}