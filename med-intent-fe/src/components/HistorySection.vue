<template>
  <el-card class="history-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>
          <el-icon><Clock /></el-icon>
          历史记录
          <el-badge :value="historyCount" :hidden="historyCount === 0" class="history-badge" />
        </span>
        <el-button
          v-if="historyCount > 0"
          type="danger"
          :icon="Delete"
          size="small"
          @click="handleClearHistory"
        >
          清空历史
        </el-button>
      </div>
    </template>

    <!-- 历史记录列表 -->
    <div class="history-content">
      <el-table
        v-if="historyList.length > 0"
        :data="historyList"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="type" label="请求类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'text' ? 'primary' : 'success'">
              {{ row.type === 'text' ? '文本' : '文件' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="summary" label="内容摘要" min-width="200">
          <template #default="{ row }">
            <span class="summary-text">{{ row.summary }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="resultCount" label="识别结果数" width="100" />
        <el-table-column prop="timestamp" label="识别时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 无历史记录 -->
      <el-empty
        v-else
        description="暂无历史记录"
        :image-size="80"
      />
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Clock, Delete } from '@element-plus/icons-vue';
import { useRecognitionStore } from '@/store/recognitionStore';

const store = useRecognitionStore();

const emit = defineEmits(['view-detail']);

const historyList = computed(() => store.historyList);
const historyCount = computed(() => store.historyList.length);

/**
 * 清空历史记录
 */
const handleClearHistory = () => {
  ElMessageBox.confirm(
    '确定要清空所有历史记录吗？此操作不可恢复。',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    store.clearHistory();
    ElMessage.success('历史记录已清空');
  }).catch(() => {});
};

/**
 * 查看详情
 */
const handleViewDetail = (row) => {
  emit('view-detail', row);
};

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
</script>

<style scoped>
.history-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.history-badge {
  margin-left: 8px;
}

.summary-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .card-header {
    font-size: 14px;
  }
}
</style>
