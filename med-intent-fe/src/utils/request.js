import axios from 'axios';
import { ElMessage, ElLoading } from 'element-plus';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const service = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let loadingInstance = null;

/**
 * 请求拦截器
 * 添加加载状态
 */
service.interceptors.request.use(
  (config) => {
    const loadingText = config.loadingText || '加载中...';
    loadingInstance = ElLoading.service({
      lock: true,
      text: loadingText,
      background: 'rgba(255, 255, 255, 0.8)'
    });
    return config;
  },
  (error) => {
    if (loadingInstance) {
      loadingInstance.close();
    }
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 处理错误提示、关闭加载状态
 */
service.interceptors.response.use(
  (response) => {
    if (loadingInstance) {
      loadingInstance.close();
    }
    
    const res = response.data;
    
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败');
      return Promise.reject(new Error(res.msg || '请求失败'));
    }
    
    return res;
  },
  (error) => {
    if (loadingInstance) {
      loadingInstance.close();
    }
    
    let errorMsg = '网络错误，请稍后重试';
    
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          errorMsg = error.response.data?.msg || '参数错误';
          break;
        case 404:
          errorMsg = '请求的资源不存在';
          break;
        case 500:
          errorMsg = '服务器内部错误';
          break;
        case 502:
          errorMsg = '网关错误';
          break;
        case 503:
          errorMsg = '服务不可用';
          break;
        default:
          errorMsg = `请求失败(${status})`;
      }
    } else if (error.request) {
      errorMsg = '网络连接失败，请检查网络';
    }
    
    ElMessage.error(errorMsg);
    return Promise.reject(error);
  }
);

/**
 * 文本识别请求
 * @param {string} text 识别文本
 * @param {string} loadingText 加载文案
 */
export const recognizeText = (text, loadingText = '文本识别中...') => {
  return service.post('/api/recognition/text', { text }, { loadingText });
};

/**
 * 文件识别请求
 * @param {File} file 识别文件
 * @param {string} loadingText 加载文案
 */
export const recognizeFile = (file, loadingText = '文件上传中...') => {
  const formData = new FormData();
  formData.append('file', file);
  
  return service.post('/api/recognition/file', formData, {
    loadingText,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default service;
