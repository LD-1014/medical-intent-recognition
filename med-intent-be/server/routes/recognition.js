const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseFile, deleteTempFile } = require('../utils/fileParser');

const router = express.Router();

/**
 * 医疗意图类型定义
 * 共11类医疗意图
 */
const INTENT_TYPES = [
  { type: 'treatment', name: '治疗方案', desc: '询问疾病的治疗方法、用药建议等' },
  { type: 'diagnosis', name: '病情诊断', desc: '询问症状原因、可能患有的疾病等' },
  { type: 'cost', name: '医疗费用', desc: '询问检查费用、治疗费用、医保报销等' },
  { type: 'effect', name: '功效作用', desc: '询问药物功效、治疗方法效果等' },
  { type: 'prevention', name: '预防保健', desc: '询问疾病预防、健康保健建议等' },
  { type: 'examination', name: '检查检验', desc: '询问检查项目、检查注意事项等' },
  { type: 'diet', name: '饮食调理', desc: '询问疾病期间的饮食注意事项等' },
  { type: 'symptom', name: '症状描述', desc: '描述症状、病情变化等' },
  { type: 'medicine', name: '用药指导', desc: '询问药物用法用量、注意事项等' },
  { type: 'sideeffect', name: '副作用', desc: '询问药物副作用、注意事项等' },
  { type: 'other', name: '其他咨询', desc: '其他医疗相关咨询' }
];

/**
 * 生成模拟识别结果
 * 随机返回1-5个意图类型，置信度在0.8-0.99之间
 * @param {string} text 识别文本
 *} 识别结果 @returns {Array数组
 */
function generateRecognitionResult(text) {
  const textLength = text.length;
  const resultCount = Math.min(Math.floor(textLength / 500) + 1, 5);
  
  const shuffled = [...INTENT_TYPES].sort(() => 0.5 - Math.random());
  const selectedIntents = shuffled.slice(0, resultCount);
  
  return selectedIntents.map(intent => ({
    intentType: intent.name,
    confidence: parseFloat((0.8 + Math.random() * 0.19).toFixed(2)),
    description: intent.desc
  })).sort((a, b) => b.confidence - a.confidence);
}

/**
 * 配置multer用于文件上传
 * 设置文件保存目录和文件过滤
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.txt', '.docx', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('仅支持txt/docx/pdf格式'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * POST /api/recognition/text
 * 文本识别接口
 * 请求参数：{ text: string }
 * 响应格式：{ code: 200/400/500, msg: string, data: Array }
 */
router.post('/text', (req, res) => {
  try {
    const { text } = req.body;
    
    // 参数校验
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        code: 400,
        msg: '参数错误：text不能为空',
        data: []
      });
    }
    
    if (text.length > 5000) {
      return res.status(400).json({
        code: 400,
        msg: '参数错误：文本长度不能超过5000字',
        data: []
      });
    }
    
    // 生成模拟识别结果
    const result = generateRecognitionResult(text);
    
    res.json({
      code: 200,
      msg: '识别成功',
      data: result
    });
  } catch (error) {
    console.error('文本识别错误:', error);
    res.status(500).json({
      code: 500,
      msg: '服务器错误：识别处理失败',
      data: []
    });
  }
});

/**
 * POST /api/recognition/file
 * 文件上传识别接口
 * 接收multipart/form-data格式的文件
 * 响应格式：{ code: 200/400/500, msg: string, data: Array }
 */
router.post('/file', upload.single('file'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    // 参数校验
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        msg: '参数错误：请上传文件',
        data: []
      });
    }
    
    tempFilePath = req.file.path;
    
    // 解析文件内容
    const text = await parseFile(tempFilePath);
    
    if (!text || text.trim() === '') {
      return res.status(400).json({
        code: 400,
        msg: '文件内容为空或无法解析',
        data: []
      });
    }
    
    // 生成模拟识别结果
    const result = generateRecognitionResult(text);
    
    res.json({
      code: 200,
      msg: '识别成功',
      data: result
    });
  } catch (error) {
    console.error('文件识别错误:', error);
    
    if (error.message === '仅支持txt/docx/pdf格式') {
      return res.status(400).json({
        code: 400,
        msg: '参数错误：仅支持txt/docx/pdf格式',
        data: []
      });
    }
    
    if (error.message.includes('file size')) {
      return res.status(400).json({
        code: 400,
        msg: '参数错误：文件大小超过10MB',
        data: []
      });
    }
    
    res.status(500).json({
      code: 500,
      msg: '服务器错误：文件处理失败',
      data: []
    });
  } finally {
    // 删除临时文件
    if (tempFilePath) {
      deleteTempFile(tempFilePath);
    }
  }
});

// multer错误处理中间件
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        code: 400,
        msg: '参数错误：文件大小超过10MB，请压缩后上传',
        data: []
      });
    }
    return res.status(400).json({
      code: 400,
      msg: '参数错误：' + error.message,
      data: []
    });
  }
  
  if (error) {
    return res.status(400).json({
      code: 400,
      msg: error.message,
      data: []
    });
  }
  
  next();
});

module.exports = router;
