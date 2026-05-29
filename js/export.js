/* ============================================================
   export.js — Завантаження даних: CSV, JSON, Excel
   ============================================================ */

function exportData(format) {
  if (!tableData.length) generateTableData();

  if (format === 'csv') {
    const header = 'Рік,Регіон,Показник,Значення,Одиниця,Зміна%\n';
    const rows   = tableData.map(r => `${r.year},${r.region},${r.metric},${r.value},${r.unit},${r.change}`).join('\n');
    download(header + rows, 'ukrdata_export.csv', 'text/csv;charset=utf-8;');
  }
  if (format === 'json') {
    const json = JSON.stringify({ source:'УкрДані', url:'https://ukrdata.gov.ua', exported: new Date().toISOString(), data: tableData }, null, 2);
    download(json, 'ukrdata_export.json', 'application/json');
  }
  if (format === 'excel') {
    const header = 'Рік\tРегіон\tПоказник\tЗначення\tОдиниця\tЗміна%\n';
    const rows   = tableData.map(r => `${r.year}\t${r.region}\t${r.metric}\t${r.value}\t${r.unit}\t${r.change}`).join('\n');
    download(header + rows, 'ukrdata_export.xls', 'application/vnd.ms-excel');
  }
}

function download(content, filename, mime) {
  const blob = new Blob(['\uFEFF' + content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}