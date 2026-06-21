/* ============================================================
   pages/sources.js — Джерела даних
   ============================================================ */

function initSources() {
  const tree = document.getElementById('sources-tree');
  if (tree) tree.innerHTML = `
    <div class="tree-item selected" onclick="filterSources('',this)"><span class="ti-icon"><img src="assets/folder1.png" width="16" height="16" alt="Джерела" style="image-rendering:smooth;vertical-align:middle;"></span> Всі джерела</div>
    <div class="tree-item" onclick="filterSources('Офіційна статистика',this)"><span class="ti-icon"><img src="assets/folder1.png" width="16" height="16" alt="Джерела" style="image-rendering:smooth;vertical-align:middle;"></span> Офіційна статистика</div>
    <div class="tree-item" onclick="filterSources('Фінансові дані',this)"><span class="ti-icon"><img src="assets/folder1.png" width="16" height="16" alt="Джерела" style="image-rendering:smooth;vertical-align:middle;"></span> Фінансові дані</div>
    <div class="tree-item" onclick="filterSources('Міжнародна статистика',this)"><span class="ti-icon"><img src="assets/folder1.png" width="16" height="16" alt="Джерела" style="image-rendering:smooth;vertical-align:middle;"></span> Міжнародна</div>
    <div class="tree-item" onclick="filterSources('Агрегований портал',this)"><span class="ti-icon"><img src="assets/folder1.png" width="16" height="16" alt="Джерела" style="image-rendering:smooth;vertical-align:middle;"></span> Портали відкритих даних</div>
  `;
  renderSources(SOURCES_DATA);
  const st = document.getElementById('sources-status');
  if (st) st.textContent = SOURCES_DATA.length + ' джерел';
}

function filterSources(type, el) {
  document.querySelectorAll('#sources-tree .tree-item').forEach(t => t.classList.remove('selected'));
  if (el) el.classList.add('selected');
  const filtered = type ? SOURCES_DATA.filter(s => s.type === type) : SOURCES_DATA;
  renderSources(filtered);
  const st = document.getElementById('sources-status');
  if (st) st.textContent = filtered.length + ' джерел';
}

function renderSources(data) {
  const el = document.getElementById('sources-tbody');
  if (!el) return;
  el.innerHTML = data.map(s => `
    <tr>
      <td><img src="assets/paper.png" width="16" height="16" alt="Файл" style="image-rendering:smooth;vertical-align:middle;"> ${s.name}</td>
      <td><span class="badge">${s.type}</span></td>
      <td>${s.org}</td>
      <td>${s.updated}</td>
      <td>${s.license}</td>
      <td><a href="${s.url}" target="_blank">Відкрити →</a></td>
    </tr>`).join('');
}
