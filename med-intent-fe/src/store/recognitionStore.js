import { defineStore } from 'pinia';

const STORAGE_KEY = 'medical_intent_history';

/**
 * 从本地存储加载历史记录
 */
function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * 保存历史记录到本地存储
 */
function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn('历史记录保存失败');
  }
}

export const useRecognitionStore = defineStore('recognition', {
  state: () => ({
    // 当前识别结果
    currentResult: [],
    // 识别结果筛选值
    filterIntent: '',
    // 历史记录列表
    historyList: loadFromStorage(),
    // 加载状态
    loading: false
  }),
  
  getters: {
    /**
     * 获取筛选后的识别结果
     */
    filteredResult: (state) => {
      if (!state.filterIntent) {
        return state.currentResult;
      }
      return state.currentResult.filter(
        item => item.intentType === state.filterIntent
      );
    },
    
    /**
     * 获取所有意图类型选项（用于筛选）
     */
    intentOptions: (state) => {
      const types = [...new Set(state.currentResult.map(item => item.intentType))];
      return types.map(type => ({ label: type, value: type }));
    },
    
    /**
     * 获取历史记录数量
     */
    historyCount: (state) => state.historyList.length
  },
  
  actions: {
    /**
     * 设置当前识别结果
     * @param {Array} result 识别结果
     */
    setCurrentResult(result) {
      this.currentResult = result;
      this.filterIntent = '';
    },
    
    /**
     * 设置筛选意图
     * @param {string} intent 意图类型
     */
    setFilterIntent(intent) {
      this.filterIntent = intent;
    },
    
    /**
     * 添加历史记录
     * @param {Object} record 历史记录
     */
    addHistory(record) {
      const newRecord = {
        id: Date.now(),
        ...record,
        timestamp: new Date().toISOString()
      };
      this.historyList.unshift(newRecord);
      
      if (this.historyList.length > 50) {
        this.historyList = this.historyList.slice(0, 50);
      }
      
      saveToStorage(this.historyList);
    },
    
    /**
     * 清空历史记录
     */
    clearHistory() {
      this.historyList = [];
      saveToStorage([]);
    },
    
    /**
     * 获取历史记录详情
     * @param {number} id 记录ID
     */
    getHistoryDetail(id) {
      return this.historyList.find(item => item.id === id);
    },
    
    /**
     * 设置加载状态
     * @param {boolean} loading 加载状态
     */
    setLoading(loading) {
      this.loading = loading;
    }
  }
});
