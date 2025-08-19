<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container">
      <div class="modal-header">
        <h3>批量成员管理</h3>
        <button class="close-btn" @click="closeModal">
          <font-awesome-icon icon="times" />
        </button>
      </div>
      
      <div class="modal-body">
        <div class="management-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'batch-edit' }]"
            @click="activeTab = 'batch-edit'"
          >
            <font-awesome-icon icon="edit" />
            批量编辑
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'import-export' }]"
            @click="activeTab = 'import-export'"
          >
            <font-awesome-icon icon="exchange-alt" />
            导入导出
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'statistics' }]"
            @click="activeTab = 'statistics'"
          >
            <font-awesome-icon icon="chart-bar" />
            统计分析
          </button>
        </div>
        
        <!-- 批量编辑面板 -->
        <div v-if="activeTab === 'batch-edit'" class="tab-content">
          <div class="batch-edit-panel">
            <div class="selection-summary">
              <h4>已选择 {{ selectedMembers.length }} 个成员</h4>
              <div class="selected-members-preview">
                <div 
                  v-for="member in selectedMembers.slice(0, 5)" 
                  :key="member.id"
                  class="member-avatar-mini"
                >
                  <img :src="member.avatar || defaultAvatar" :alt="member.nickname || member.username" />
                </div>
                <span v-if="selectedMembers.length > 5" class="more-count">
                  +{{ selectedMembers.length - 5 }}
                </span>
              </div>
            </div>
            
            <div class="batch-operations">
              <div class="operation-group">
                <label class="operation-label">批量设置角色</label>
                <div class="operation-controls">
                  <select v-model="batchRole" class="batch-select">
                    <option value="">选择角色</option>
                    <option value="MEMBER">普通成员</option>
                    <option value="ADMIN">管理员</option>
                    <option value="OWNER">拥有者</option>
                  </select>
                  <button 
                    class="apply-btn" 
                    @click="applyBatchRole"
                    :disabled="!batchRole || selectedMembers.length === 0"
                  >
                    应用
                  </button>
                </div>
              </div>
              
              <div class="operation-group">
                <label class="operation-label">批量设置过期时间</label>
                <div class="operation-controls">
                  <input 
                    v-model="batchExpireTime" 
                    type="datetime-local" 
                    class="batch-input"
                  />
                  <button 
                    class="apply-btn" 
                    @click="applyBatchExpireTime"
                    :disabled="!batchExpireTime || selectedMembers.length === 0"
                  >
                    应用
                  </button>
                </div>
              </div>
              
              <div class="operation-group">
                <label class="operation-label">批量移除成员</label>
                <div class="operation-controls">
                  <button 
                    class="remove-batch-btn" 
                    @click="confirmBatchRemove"
                    :disabled="selectedMembers.length === 0"
                  >
                    <font-awesome-icon icon="user-minus" />
                    移除选中成员
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 导入导出面板 -->
        <div v-if="activeTab === 'import-export'" class="tab-content">
          <div class="import-export-panel">
            <div class="import-section">
              <h4>导入成员</h4>
              <div class="upload-area" @click="triggerFileUpload" @dragover.prevent @drop.prevent="handleFileDrop">
                <font-awesome-icon icon="cloud-upload-alt" class="upload-icon" />
                <p>点击或拖拽文件到此处上传</p>
                <span class="upload-hint">支持 .xlsx, .csv 格式，最大 5MB</span>
                <input 
                  ref="fileInput" 
                  type="file" 
                  accept=".xlsx,.csv" 
                  @change="handleFileSelect"
                  style="display: none"
                />
              </div>
              
              <div class="import-options">
                <label class="checkbox-item">
                  <input v-model="importOptions.skipExisting" type="checkbox" />
                  <span>跳过已存在的成员</span>
                </label>
                <label class="checkbox-item">
                  <input v-model="importOptions.sendNotification" type="checkbox" />
                  <span>向新成员发送通知</span>
                </label>
              </div>
              
              <button class="template-btn" @click="downloadTemplate">
                <font-awesome-icon icon="download" />
                下载导入模板
              </button>
            </div>
            
            <div class="export-section">
              <h4>导出成员</h4>
              <div class="export-options">
                <label class="checkbox-item">
                  <input v-model="exportOptions.includeInactive" type="checkbox" />
                  <span>包含已禁用成员</span>
                </label>
                <label class="checkbox-item">
                  <input v-model="exportOptions.includeExpired" type="checkbox" />
                  <span>包含已过期成员</span>
                </label>
                <label class="checkbox-item">
                  <input v-model="exportOptions.includeAttributes" type="checkbox" />
                  <span>包含用户属性</span>
                </label>
              </div>
              
              <div class="export-format">
                <label class="radio-item">
                  <input v-model="exportFormat" type="radio" value="xlsx" />
                  <span>Excel 格式 (.xlsx)</span>
                </label>
                <label class="radio-item">
                  <input v-model="exportFormat" type="radio" value="csv" />
                  <span>CSV 格式 (.csv)</span>
                </label>
              </div>
              
              <button class="export-btn" @click="exportMembers">
                <font-awesome-icon icon="file-export" />
                导出成员列表
              </button>
            </div>
          </div>
        </div>
        
        <!-- 统计分析面板 -->
        <div v-if="activeTab === 'statistics'" class="tab-content">
          <div class="statistics-panel">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon role-owner">
                  <font-awesome-icon icon="crown" />
                </div>
                <div class="stat-info">
                  <span class="stat-number">{{ getCountByRole('OWNER') }}</span>
                  <span class="stat-label">拥有者</span>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon role-admin">
                  <font-awesome-icon icon="user-shield" />
                </div>
                <div class="stat-info">
                  <span class="stat-number">{{ getCountByRole('ADMIN') }}</span>
                  <span class="stat-label">管理员</span>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon role-member">
                  <font-awesome-icon icon="user" />
                </div>
                <div class="stat-info">
                  <span class="stat-number">{{ getCountByRole('MEMBER') }}</span>
                  <span class="stat-label">普通成员</span>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon expired">
                  <font-awesome-icon icon="clock" />
                </div>
                <div class="stat-info">
                  <span class="stat-number">{{ getExpiredCount() }}</span>
                  <span class="stat-label">即将过期</span>
                </div>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>成员加入趋势</h4>
              <div class="chart-placeholder">
                <font-awesome-icon icon="chart-line" class="chart-icon" />
                <p>图表功能开发中...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button type="button" class="cancel-btn" @click="closeModal">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedGroup: {
    type: Object,
    default: null
  },
  members: {
    type: Array,
    default: () => []
  },
  selectedMembers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'close', 
  'batch-update-role', 
  'batch-set-expire-time', 
  'batch-remove-members',
  'import-members',
  'export-members'
])

const activeTab = ref('batch-edit')
const defaultAvatar = '/src/assets/default-avatar.svg'

// 批量操作数据
const batchRole = ref('')
const batchExpireTime = ref('')

// 导入导出选项
const importOptions = reactive({
  skipExisting: true,
  sendNotification: true
})

const exportOptions = reactive({
  includeInactive: false,
  includeExpired: false,
  includeAttributes: true
})

const exportFormat = ref('xlsx')
const fileInput = ref(null)

// 统计计算
const getCountByRole = (role) => {
  return props.members.filter(member => member.memberType === role).length
}

const getExpiredCount = () => {
  const now = new Date()
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  return props.members.filter(member => {
    if (!member.expireTime) return false
    const expireDate = new Date(member.expireTime)
    return expireDate <= thirtyDaysLater && expireDate > now
  }).length
}

// 批量操作方法
const applyBatchRole = () => {
  if (!batchRole.value || props.selectedMembers.length === 0) return
  
  emit('batch-update-role', {
    memberIds: props.selectedMembers.map(m => m.id),
    newRole: batchRole.value
  })
  
  batchRole.value = ''
}

const applyBatchExpireTime = () => {
  if (!batchExpireTime.value || props.selectedMembers.length === 0) return
  
  emit('batch-set-expire-time', {
    memberIds: props.selectedMembers.map(m => m.id),
    expireTime: batchExpireTime.value
  })
  
  batchExpireTime.value = ''
}

const confirmBatchRemove = () => {
  if (props.selectedMembers.length === 0) return
  
  if (confirm(`确定要移除选中的 ${props.selectedMembers.length} 个成员吗？此操作不可撤销。`)) {
    emit('batch-remove-members', props.selectedMembers.map(m => m.id))
  }
}

// 文件处理方法
const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processImportFile(file)
  }
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    processImportFile(file)
  }
}

const processImportFile = (file) => {
  // 验证文件类型和大小
  const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    alert('请选择 .xlsx 或 .csv 格式的文件')
    return
  }
  
  if (file.size > maxSize) {
    alert('文件大小不能超过 5MB')
    return
  }
  
  emit('import-members', {
    file,
    options: importOptions
  })
}

const downloadTemplate = () => {
  // 创建模板数据
  const templateData = [
    ['用户名*', '昵称', '邮箱', '角色', '过期时间'],
    ['user001', '张三', 'zhang@example.com', 'MEMBER', '2024-12-31 23:59:59'],
    ['user002', '李四', 'li@example.com', 'ADMIN', ''],
    ['user003', '王五', 'wang@example.com', 'MEMBER', '2024-06-30 23:59:59']
  ]
  
  // 转换为CSV格式并下载
  const csvContent = templateData.map(row => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', '成员导入模板.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportMembers = () => {
  emit('export-members', {
    format: exportFormat.value,
    options: exportOptions
  })
}

const closeModal = () => {
  emit('close')
}

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 238, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 238, 255, 0.2);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.modal-header h3 {
  color: #00eeff;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 73, 73, 0.2);
  color: #ff4949;
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.management-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #00eeff;
  border-bottom-color: #00eeff;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.8);
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 批量编辑面板样式 */
.batch-edit-panel {
  space-y: 24px;
}

.selection-summary {
  background: rgba(0, 238, 255, 0.1);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.selection-summary h4 {
  color: #00eeff;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.selected-members-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-avatar-mini {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(0, 238, 255, 0.3);
}

.member-avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.more-count {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.batch-operations {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.operation-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.operation-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.operation-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.batch-select,
.batch-input {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 14px;
  min-width: 150px;
}

.apply-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #00eeff 0%, #0099cc 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.apply-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}

.apply-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 238, 255, 0.3);
}

.remove-batch-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #ff4949 0%, #cc3333 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.remove-batch-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}

.remove-batch-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 73, 73, 0.3);
}

/* 导入导出面板样式 */
.import-export-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.import-section,
.export-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
}

.import-section h4,
.export-section h4 {
  color: #00eeff;
  margin: 0 0 16px 0;
  font-size: 16px;
}

.upload-area {
  border: 2px dashed rgba(0, 238, 255, 0.4);
  border-radius: 8px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.upload-area:hover {
  border-color: #00eeff;
  background: rgba(0, 238, 255, 0.05);
}

.upload-icon {
  font-size: 32px;
  color: #00eeff;
  margin-bottom: 12px;
}

.upload-area p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 8px 0;
  font-size: 16px;
}

.upload-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.import-options,
.export-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
}

.checkbox-item,
.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.checkbox-item input,
.radio-item input {
  margin-right: 8px;
  accent-color: #00eeff;
}

.template-btn,
.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #00eeff 0%, #0099cc 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  width: 100%;
  justify-content: center;
}

.template-btn:hover,
.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 238, 255, 0.3);
}

.export-format {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
}

/* 统计分析面板样式 */
.statistics-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: rgba(0, 238, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 238, 255, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-icon.role-owner {
  background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
  color: white;
}

.stat-icon.role-admin {
  background: linear-gradient(135deg, #00eeff 0%, #0099cc 100%);
  color: white;
}

.stat-icon.role-member {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: white;
}

.stat-icon.expired {
  background: linear-gradient(135deg, #ff4949 0%, #cc3333 100%);
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.chart-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
}

.chart-container h4 {
  color: #00eeff;
  margin: 0 0 16px 0;
  font-size: 16px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.5);
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: rgba(0, 238, 255, 0.4);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 238, 255, 0.2);
}

.cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .import-export-panel {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .operation-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .batch-select,
  .batch-input,
  .apply-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .management-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    justify-content: center;
  }
}
</style> 