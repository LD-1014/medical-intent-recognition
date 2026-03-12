<template>
  <el-card class="result-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>识别结果</span>
        <el-button
          v-if="resultData.length > 0"
          type="success"
          :icon="Download"
          size="small"
          @click="handleExport"
        >
          导出Excel
        </el-button>
      </div>
    </template>

    <!-- 结果筛选 -->
    <div v-if="resultData.length > 0" class="result-filter">
      <span>按意图类型筛选：</span>
      <el-select
        v-model="filterIntent"
        placeholder="全部"
        clearable
        style="width: 150px"
      >
        <el-option
          v-for="item in intentOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <!-- 结果表格 -->
    <div class="result-content">
      <el-table
        v-if="filteredResult.length > 0"
        :data="filteredResult"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="intentType" label="意图类型" width="120" />
        <el-table-column label="置信度" width="180">
          <template #default="{ row }">
            <el-progress
              :percentage="row.confidence * 100"
              :format="formatProgress"
              :stroke-width="12"
              :color="getProgressColor(row.confidence)"
            />
            <span class="confidence-text">{{ (row.confidence * 100).toFixed(2) }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="意图描述" />
      </el-table>

      <!-- 无结果提示 -->
      <el-empty
        v-else
        description="未识别到有效医疗意图，请输入相关文本"
        :image-size="120"
      />
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';
import { exportResults } from '@/utils/export';

const props = defineProps({
  resultData: {
    type: Array,
    default: () => []
  }
});

const filterIntent = ref('');

/**
 * 意图类型选项
 */
const intentOptions = computed(() => {
  const types = [...new Set(props.resultData.map(item => item.intentType))];
  return types.map(type => ({ label: type, value: type }));
});

/**
 * 筛选后的结果
 */
const filteredResult = computed(() => {
  if (!filterIntent.value) {
    return props.resultData;
  }
  return props.resultData.filter(item => item.intentType === filterIntent.value);
});

/**
 * 监听结果变化，重置筛选
 */
watch(() => props.resultData, () => {
  filterIntent.value = '';
});

/**
 * 格式化进度条
 */
const formatProgress = (percentage) => {
  return `${percentage}%`;
};

/**
 * 获取进度条颜色
 */
const getProgressColor = (confidence) => {
  if (confidence >= 0.9) return '#67c23a';
  if (confidence >= 0.8) return '#409eff';
  return '#e6a23c';
};

/**
 * 导出结果
 */
const handleExport = () => {
  exportResults(props.resultData, 'xlsx');
  ElMessage.success('导出成功');
};

/**
 * 暴露给父组件
 */
defineExpose({
  filterIntent
});
</script>

<style scoped>
.result-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.result-filter {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-content {
  min-height: 200px;
}

.confidence-text {
  font-size: 12px;
  color: #606266;
  margin-left: 8px;
}

@media (max-width: 768px) {
  .card-header {
    font-size: 14px;
  }
  
  .result-filter {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
