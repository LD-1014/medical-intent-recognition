<template>
  <el-dialog
    v-model="dialogVisible"
    title="识别详情"
    width="700px"
    destroy-on-close
  >
    <div v-if="currentRecord" class="detail-content">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="请求类型">
          <el-tag :type="currentRecord.type === 'text' ? 'primary' : 'success'">
            {{ currentRecord.type === 'text' ? '文本' : '文件' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="识别时间">
          {{ formatTime(currentRecord.timestamp) }}
        </el-descriptions-item>
        <el-descriptions-item label="内容摘要" :span="2">
          {{ currentRecord.summary }}
        </el-descriptions-item>
      </el-descriptions>

      <h4 class="detail-result-title">识别结果</h4>
      <el-table :data="currentRecord.result" stripe border>
        <el-table-column prop="intentType" label="意图类型" width="120" />
        <el-table-column label="置信度" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="row.confidence * 100"
              :stroke-width="10"
              :color="getProgressColor(row.confidence)"
            />
            <span class="confidence-text">{{ (row.confidence * 100).toFixed(2) }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="意图描述" />
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  record: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible']);

const dialogVisible = ref(props.visible);
const currentRecord = ref(null);

/**
 * 监听visible变化
 */
watch(() => props.visible, (val) => {
  dialogVisible.value = val;
});

/**
 * 监听dialogVisible变化
 */
watch(dialogVisible, (val) => {
  emit('update:visible', val);
});

/**
 * 监听record变化
 */
watch(() => props.record, (val) => {
  currentRecord.value = val;
}, { immediate: true });

/**
 * 格式化时间
 */
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

/**
 * 获取进度条颜色
 */
const getProgressColor = (confidence) => {
  if (confidence >= 0.9) return '#67c23a';
  if (confidence >= 0.8) return '#409eff';
  return '#e6a23c';
};
</script>

<style scoped>
.detail-content {
  padding: 10px;
}

.detail-result-title {
  margin: 20px 0 10px;
  font-size: 16px;
  color: #303133;
}

.confidence-text {
  font-size: 12px;
  color: #606266;
  margin-left: 8px;
}
</style>
