/**
 * src/utils/exportCsv.js
 * ----------------------
 * Exports an array of JSON objects to a CSV file download in browser.
 */

export function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return;

  const keys = Object.keys(rows[0]);
  const headerRow = keys.join(',');

  const csvRows = rows.map((row) =>
    keys
      .map((k) => {
        let val = row[k] ?? '';
        if (typeof val === 'string' && val.includes(',')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      })
      .join(',')
  );

  const csvContent = [headerRow, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
