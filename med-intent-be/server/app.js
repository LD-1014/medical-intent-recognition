const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const recognitionRoutes = require('./routes/recognition');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * 中间件配置
 */

// 跨域处理
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志记录
app.use(morgan('[:method] :url :status :res[content-length] - :response-time ms'));

// 静态文件服务（用于上传目录）
app.use('/uploads', express.static(__dirname + '/uploads'));

/**
 * 路由配置
 */
app.use('/api/recognition', recognitionRoutes);

/**
 * 健康检查接口
 */
app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    msg: '服务运行正常',
    data: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

/**
 * 404处理
 */
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    msg: '接口不存在',
    data: []
  });
});

/**
 * 全局异常处理
 */
app.use((err, req, res, next) => {
  console.error('全局异常:', err);
  res.status(500).json({
    code: 500,
    msg: '服务器内部错误',
    data: []
  });
});

/**
 * 启动服务器
 */
app.listen(PORT, () => {
  console.log(`医疗咨询意图识别系统后端服务已启动`);
  console.log(`服务地址: http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
});

module.exports = app;
