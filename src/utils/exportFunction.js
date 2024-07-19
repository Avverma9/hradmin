import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName = 'export.xlsx') => {
  // Exclude avatarUrl and images fields from the data
  const dataForExport = data.map(({ avatarUrl, images, ...user }) => user);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dataForExport);
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  XLSX.writeFile(wb, fileName);
};
