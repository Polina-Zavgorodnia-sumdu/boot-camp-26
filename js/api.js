/* ============================================================
   api.js — API Explorer: ендпоінти, mock-запити
   ============================================================ */

function initApi() {
  const list = document.getElementById('api-endpoint-list');
  list.innerHTML = API_ENDPOINTS.map((ep, i) => `
    <div class="tree-item ${i === 0 ? 'selected' : ''}" onclick="showApiDetail(${i},this)" style="flex-direction:column;align-items:flex-start;gap:2px;padding:4px;">
      <span class="badge ${ep.method === 'POST' ? 'red' : ''}" style="font-size:9px;margin-bottom:2px;">${ep.method}</span>
      <span style="font-family:var(--font-mono);font-size:10px;">${ep.path}</span>
    </div>
  `).join('');
  showApiDetail(0, list.querySelector('.tree-item'));
  updateApiPreview();
}

function showApiDetail(idx, el) {
  document.querySelectorAll('#api-endpoint-list .tree-item').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
  const ep = API_ENDPOINTS[idx];
  document.getElementById('api-detail').innerHTML = `
    <div style="margin-bottom:6px;">
      <span class="badge ${ep.method === 'POST' ? 'red' : ''}" style="margin-right:6px;">${ep.method}</span>
      <span style="font-family:var(--font-mono);font-size:12px;font-weight:700;">${ep.path}</span>
    </div>
    <div style="font-size:11px;margin-bottom:8px;color:var(--text-muted);">${ep.desc}</div>
    <div style="font-weight:700;margin-bottom:4px;">Параметри:</div>
    <table class="win-table" style="margin-bottom:8px;">
      <thead><tr><th>Параметр</th><th>Тип</th><th>Обов'язк.</th><th>Опис</th></tr></thead>
      <tbody>${ep.params.map(p => `
        <tr>
          <td style="font-family:var(--font-mono)">${p.name}</td>
          <td>${p.type}</td>
          <td>${p.req ? '<span class="badge red">Так</span>' : 'Ні'}</td>
          <td>${p.desc}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  `;
}

function updateApiPreview() {
  const ep     = document.getElementById('api-try-endpoint').value;
  const region = document.getElementById('api-try-region').value;
  const year   = document.getElementById('api-try-year').value;
  const url    = `https://api.ukrdata.gov.ua/v1/${ep}?${region ? 'region=' + region + '&' : ''}year=${year}&metric=salary`;
  document.getElementById('api-preview-url').textContent = url;
}

function tryApi() {
  const ep     = document.getElementById('api-try-endpoint').value;
  const region = document.getElementById('api-try-region').value || 'all';
  const year   = +document.getElementById('api-try-year').value;
  const console_ = document.getElementById('api-console');
  const regionData = region === 'all' ? REGIONS.slice(0, 5) : REGIONS.filter(r => r.id === region).slice(0, 1);
  const mockResponses = {
    statistics: { status:'ok', page:1, per_page:5, total:25, data: regionData.map(r => ({ year, region: r.name, metric:'salary', value: Math.round(r.salary * (0.85 + (year - 2020) * 0.05)), unit:'грн' })) },
    regions:    { status:'ok', total:25, data: REGIONS.slice(0, 5).map(r => ({ id: r.id, name: r.name, gdp: r.gdp, salary: r.salary })) },
    categories: { status:'ok', data: CATEGORIES.map(c => ({ id: c.id, title: c.title, datasets: c.count })) },
    datasets:   { status:'ok', total: DATASETS.length, data: DATASETS.slice(0, 3).map(d => ({ id: d.id, title: d.title, source: d.source, records: d.records })) },
  };
  const resp = mockResponses[ep] || { status:'ok', data:[] };
  const json = JSON.stringify(resp, null, 2);
  const urlEl = document.getElementById('api-preview-url').textContent;
  console_.innerHTML = `
    <div class="console-line console-comment"># Simulated API Response · ${new Date().toLocaleTimeString('uk-UA')}</div>
    <div class="console-line console-prompt">GET ${urlEl}</div>
    <div class="console-line" style="color:#888;">HTTP 200 OK · application/json · ${json.length} bytes · 12ms</div>
    <div class="console-line">&nbsp;</div>
    <div class="console-line console-response">${json.replace(/\n/g,'<br>').replace(/ /g,'&nbsp;').replace(/"([^"]+)":/g,'"<span style="color:#88ccff">$1</span>":')}</div>
  `;
}