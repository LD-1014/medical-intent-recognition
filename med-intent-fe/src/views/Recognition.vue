<template>
  <div class="recognition-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <h1 class="page-title">
          <el-icon class="title-icon"><FirstAidKit /></el-icon>
          医疗咨询意图识别系统
        </h1>
        <p class="page-desc">基于BioBERT医学语义与TextCNN局部特征的智能识别系统</p>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-container">
      <el-row :gutter="20">
        <!-- 左侧：输入/上传区 -->
        <el-col :xs="24" :lg="10">
          <InputSection 
            ref="inputSectionRef"
            :loading="recognizing"
            @recognize="handleRecognize"
          />
        </el-col>

        <!-- 右侧：结果展示区 -->
        <el-col :xs="24" :lg="14">
          <ResultSection :result-data="store.currentResult" />
        </el-col>
      </el-row>

      <!-- 历史记录区 -->
      <HistorySection @view-detail="handleViewDetail" />
    </div>

    <!-- 详情弹窗 -->
    <DetailDialog 
      v-model:visible="detailDialogVisible" 
      :record="currentDetail"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { FirstAidKit } from '@element-plus/icons-vue';
import { recognizeText, recognizeFile } from '@/utils/request';
import { useRecognitionStore } from '@/store/recognitionStore';

import InputSection from '@/components/InputSection.vue';
import ResultSection from '@/components/ResultSection.vue';
import HistorySection from '@/components/HistorySection.vue';
import DetailDialog from '@/components/DetailDialog.vue';

const store = useRecognitionStore();

const inputSectionRef = ref(null);
const recognizing = ref(false);
const detailDialogVisible = ref(false);
const currentDetail = ref(null);

/**
 * 处理识别请求
 */
const handleRecognize = async (requestData) => {
  recognizing.value = true;
  store.setLoading(true);
  
  try {
    let result;
    
    if (requestData.type === 'text') {
      result = await recognizeText(requestData.content, '文本识别中...');
    } else {
      result = await recognizeFile(requestData.file, '文件上传中...');
    }
    
    store.setCurrentResult(result.data);
    
    store.addHistory({
      type: requestData.type,
      summary: requestData.summary,
      result: result.data,
      resultCount: result.data.length
    });
    
    ElMessage.success('识别成功');
  } catch (error) {
    console.error('识别失败:', error);
  } finally {
    recognizing.value = false;
    store.setLoading(false);
  }
};

/**
 * 查看详情
 */
const handleViewDetail = (record) => {
  currentDetail.value = record;
  detailDialogVisible.value = true;
};
</script>

<style scoped>
.recognition-page {
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.page-header {
  position: relative;
  text-align: center;
  margin-bottom: 30px;
  padding: 60px 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
}

.page-title {
  font-size: 32px;
  color: white;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: 600;
}

.title-icon {
  color: white;
  font-size: 36px;
}

.page-desc {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

.main-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 768px) {
  .page-header {
    padding: 40px 15px;
    margin-top: 10px;
  }
  
  .page-title {
    font-size: 24px;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 28px;
  }
  
  .page-desc {
    font-size: 14px;
  }
}
</style>
