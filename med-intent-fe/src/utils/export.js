import * as XLSX from 'xlsx';

/**
 * 导出识别结果为Excel/CSV
 * @param {Array} data 识别结果数据
 * @param {string} type 导出类型 'xlsx' | 'csv'
 */
export function exportResults(data, type = 'xlsx') {
  if (!data || data.length === 0) {
    return;
  }
  
  const exportData = data.map(item => ({
    '意图类型': item.intentType,
    '置信度': item.confidence,
    '意图描述': item.description
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '识别结果');
  
  const colWidths = [
    { wch: 15 },
    { wch: 10 },
    { wch: 40 }
  ];
  worksheet['!cols'] = colWidths;
  
  const fileName = `医疗意图识别结果_${formatDate(new Date())}`;
  
  if (type === 'csv') {
    XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: 'csv' });
  } else {
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }
}

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
}

export default exportResults;
