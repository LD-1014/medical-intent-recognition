const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun } = require('docx');

/**
 * 文件解析工具
 * 支持解析txt、docx、pdf格式文件，提取纯文本内容
 */

/**
 * 解析txt文件
 * @param {string} filePath 文件路径
 * @returns {Promise<string>} 文件文本内容
 */
async function parseTxt(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

/**
 * 解析docx文件
 * @param {string} filePath 文件路径
 * @returns {Promise<string>} 文件文本内容
 */
async function parseDocx(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const zip = await import('docx').then(m => m.Document.load(buffer));
    
    let textContent = '';
    const children = zip.body.children;
    
    for (const child of children) {
      if (child.children) {
        for (const run of child.children) {
          if (run.children) {
            for (const textRun of run.children) {
              textContent += textRun.text || '';
            }
          }
        }
        textContent += '\n';
      }
    }
    
    return textContent.trim();
  } catch (error) {
    console.error('解析docx文件失败:', error);
    throw new Error('docx文件解析失败');
  }
}

/**
 * 解析pdf文件
 * @param {string} filePath 文件路径
 * @returns {Promise<string>} 文件文本内容
 */
async function parsePdf(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('解析pdf文件失败:', error);
    throw new Error('pdf文件解析失败');
  }
}

/**
 * 根据文件扩展名选择合适的解析方法
 * @param {string} filePath 文件路径
 * @returns {Promise<string>} 文件文本内容
 */
async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.txt':
      return await parseTxt(filePath);
    case '.docx':
      return await parseDocx(filePath);
    case '.pdf':
      return await parsePdf(filePath);
    default:
      throw new Error('不支持的文件格式');
  }
}

/**
 * 删除临时文件
 * @param {string} filePath 文件路径
 */
function deleteTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('删除临时文件失败:', error);
  }
}

module.exports = {
  parseFile,
  deleteTempFile
};
