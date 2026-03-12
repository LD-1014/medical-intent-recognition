<template>
  <el-card class="input-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>输入/上传区</span>
      </div>
    </template>

    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" class="input-tabs">
      <!-- 文本输入 -->
      <el-tab-pane label="文本输入" name="text">
        <div class="text-input-wrapper">
          <el-input
            v-model="textInput"
            type="textarea"
            :rows="6"
            placeholder="请输入医疗咨询文本（如：感冒该吃什么药？）"
            :show-word-limit="true"
            :maxlength="5000"
            @input="handleTextInput"
          />
          <div class="text-stats">
            <span :class="{ 'text-warning': textInput.length > 5000 }">
              已输入 {{ textInput.length }} / 5000 字
            </span>
          </div>
        </div>
      </el-tab-pane>

      <!-- 文件上传 -->
      <el-tab-pane label="文件上传" name="file">
        <el-upload
          ref="uploadRef"
          class="file-uploader"
          drag
          :auto-upload="false"
          :limit="1"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
          :on-remove="handleFileRemove"
          :before-upload="beforeUpload"
          accept=".txt,.docx,.pdf"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处 或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 .txt/.docx/.pdf 格式，文件大小不超过10MB
            </div>
          </template>
        </el-upload>
      </el-tab-pane>
    </el-tabs>

    <!-- 识别按钮 -->
    <div class="action-buttons">
      <el-button
        type="primary"
        :icon="Search"
        :disabled="!canRecognize"
        :loading="loading"
        @click="handleRecognize"
        class="recognize-btn"
      >
        {{ buttonText }}
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, UploadFilled } from '@element-plus/icons-vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['recognize']);

const activeTab = ref('text');
const textInput = ref('');
const uploadedFile = ref(null);
const uploadRef = ref(null);

const MAX_TEXT_LENGTH = 5000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.txt', '.docx', '.pdf'];

/**
 * 是否可以发起识别
 */
const canRecognize = computed(() => {
  if (props.loading) return false;
  
  if (activeTab.value === 'text') {
    return textInput.value.trim().length > 0 && textInput.value.length <= MAX_TEXT_LENGTH;
  } else {
    return uploadedFile.value !== null;
  }
});

/**
 * 按钮文字
 */
const buttonText = computed(() => {
  if (props.loading) {
    if (activeTab.value === 'text') {
      return '文本识别中...';
    } else {
      return uploadedFile.value ? '文件上传中...' : '模型分析中...';
    }
  }
  return '开始识别';
});

/**
 * 处理文本输入
 */
const handleTextInput = () => {
  if (textInput.value.length > MAX_TEXT_LENGTH) {
    ElMessage.warning('文本长度不能超过5000字');
  }
};

/**
 * 处理文件变化
 */
const handleFileChange = (file) => {
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    ElMessage.error('仅支持txt/docx/pdf格式');
    return false;
  }
  
  if (file.size > MAX_FILE_SIZE) {
    ElMessage.error('文件大小超过10MB，请压缩后上传');
    return false;
  }
  
  uploadedFile.value = file.raw;
  ElMessage.success('文件上传成功');
};

/**
 * 处理文件超出限制
 */
const handleExceed = () => {
  ElMessage.warning('只能上传1个文件，请先删除已有文件');
};

/**
 * 处理文件删除
 */
const handleFileRemove = () => {
  uploadedFile.value = null;
};

/**
 * 上传前校验
 */
const beforeUpload = (file) => {
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    ElMessage.error('仅支持txt/docx/pdf格式');
    return false;
  }
  
  if (file.size > MAX_FILE_SIZE) {
    ElMessage.error('文件大小超过10MB，请压缩后上传');
    return false;
  }
  
  return false;
};

/**
 * 执行识别
 */
const handleRecognize = () => {
  if (!canRecognize.value) return;
  
  let requestData;
  
  if (activeTab.value === 'text') {
    requestData = {
      type: 'text',
      content: textInput.value,
      summary: textInput.value.substring(0, 100) + (textInput.value.length > 100 ? '...' : '')
    };
  } else {
    requestData = {
      type: 'file',
      file: uploadedFile.value,
      summary: uploadedFile.value.name
    };
    
    uploadRef.value?.clearFiles();
    uploadedFile.value = null;
  }
  
  emit('recognize', requestData);
};

/**
 * 暴露给父组件的方法
 */
defineExpose({
  reset: () => {
    textInput.value = '';
    uploadedFile.value = null;
    activeTab.value = 'text';
  }
});
</script>

<style scoped>
.input-card {
  border-radius: 8px;
}

.card-header {
  font-weight: 600;
}

.input-tabs {
  margin-bottom: 20px;
}

.text-input-wrapper {
  margin-bottom: 15px;
}

.text-stats {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.text-warning {
  color: #f56c6c;
}

.file-uploader {
  width: 100%;
}

.file-uploader :deep(.el-upload-dragger) {
  padding: 30px;
}

.action-buttons {
  text-align: center;
  padding-top: 10px;
}

.recognize-btn {
  width: 200px;
  height: 40px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .recognize-btn {
    width: 100%;
  }
}
</style>
