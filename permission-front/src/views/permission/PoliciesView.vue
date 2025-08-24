<template>
  <div class="policies-page">
    <div class="page-header">
      <div class="page-title">
        <h1>
          <font-awesome-icon icon="shield-alt" />
          权限策略
        </h1>
        <p>ABAC策略管理 - 基于属性的访问控制策略配置</p>
      </div>
      
      <div class="page-actions">
        <button class="action-btn primary" @click="showCreateModal">
          <font-awesome-icon icon="plus" />
          新建策略
        </button>
        <button class="action-btn" @click="showTestModal">
          <font-awesome-icon icon="flask" />
          策略测试
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">
          <font-awesome-icon icon="shield-alt" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalPolicies }}</div>
          <div class="stat-label">总策略数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon active">
          <font-awesome-icon icon="check-circle" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.activePolicies }}</div>
          <div class="stat-label">启用策略</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon warning">
          <font-awesome-icon icon="exclamation-triangle" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.conflictPolicies }}</div>
          <div class="stat-label">冲突策略</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon info">
          <font-awesome-icon icon="clock" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.recentUpdates }}</div>
          <div class="stat-label">最近更新</div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-left">
        <div class="filter-group">
          <label>策略类型</label>
          <select v-model="filters.type" class="filter-select" @change="handleFilterChange">
            <option value="">全部类型</option>
            <option value="PERMIT">允许策略</option>
            <option value="DENY">拒绝策略</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>状态</label>
          <select v-model="filters.status" class="filter-select" @change="handleFilterChange">
            <option value="">全部状态</option>
            <option value="1">启用</option>
            <option value="0">禁用</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>优先级</label>
          <select v-model="filters.priority" class="filter-select" @change="handleFilterChange">
            <option value="">全部优先级</option>
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
        </div>
      </div>
      
      <div class="filter-right">
        <div class="search-box">
          <input 
            v-model="filters.search" 
            type="text" 
            placeholder="搜索策略名称或描述..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            <font-awesome-icon icon="search" />
          </button>
        </div>
        
        <button class="action-btn" @click="resetFilters">
          <font-awesome-icon icon="refresh" />
          重置
        </button>
      </div>
    </div>

    <!-- 策略列表 -->
    <div class="policies-table">
      <div class="table-header">
        <div class="table-actions">
          <button 
            class="action-btn" 
            :disabled="!selectedPolicies.length"
            @click="batchEnable"
          >
            <font-awesome-icon icon="check-circle" />
            批量启用
          </button>
          <button 
            class="action-btn" 
            :disabled="!selectedPolicies.length"
            @click="batchDisable"
          >
            <font-awesome-icon icon="times-circle" />
            批量禁用
          </button>
          <button 
            class="action-btn danger" 
            :disabled="!selectedPolicies.length"
            @click="batchDelete"
          >
            <font-awesome-icon icon="trash" />
            批量删除
          </button>
        </div>
        
        <div class="table-info">
          共 {{ filteredPolicies.length }} 条策略
        </div>
      </div>
      
      <div class="table-content">
        <div 
          v-for="policy in paginatedPolicies" 
          :key="policy.id"
          class="policy-row"
          :class="{ selected: selectedPolicies.includes(policy.id) }"
        >
          <div class="row-checkbox">
            <input 
              type="checkbox" 
              :checked="selectedPolicies.includes(policy.id)"
              @change="togglePolicySelection(policy.id)"
            />
          </div>
          
          <div class="row-content">
            <div class="policy-info">
              <div class="policy-name">{{ policy.name }}</div>
              <div class="policy-description">{{ policy.description || '无描述' }}</div>
              <div class="policy-meta">
                <span :class="['effect-badge', policy.effect.toLowerCase()]">
                  {{ policy.effect === 'PERMIT' ? '允许' : '拒绝' }}
                </span>
                <span class="priority-badge">优先级: {{ policy.priority }}</span>
                <span class="status-badge" :class="{ active: policy.status === 1 }">
                  {{ policy.status === 1 ? '启用' : '禁用' }}
                </span>
              </div>
            </div>
            
            <div class="policy-conditions">
              <div class="condition-summary">
                <span class="condition-label">主体:</span>
                <span class="condition-value">{{ getConditionSummary(policy.subjectAttributes) }}</span>
              </div>
              <div class="condition-summary">
                <span class="condition-label">客体:</span>
                <span class="condition-value">{{ getConditionSummary(policy.objectAttributes) }}</span>
              </div>
              <div class="condition-summary">
                <span class="condition-label">操作:</span>
                <span class="condition-value">{{ getConditionSummary(policy.actionAttributes) }}</span>
              </div>
              <div class="condition-summary">
                <span class="condition-label">环境:</span>
                <span class="condition-value">{{ getConditionSummary(policy.environmentAttributes) }}</span>
              </div>
            </div>
          </div>
          
          <div class="row-actions">
            <button class="action-icon edit" @click="editPolicy(policy)" title="编辑">
              <font-awesome-icon icon="edit" />
            </button>
            <button class="action-icon test" @click="testPolicy(policy)" title="测试">
              <font-awesome-icon icon="flask" />
            </button>
            <button class="action-icon toggle" @click="togglePolicyStatus(policy)" :title="policy.status === 1 ? '禁用' : '启用'">
              <font-awesome-icon :icon="policy.status === 1 ? 'times-circle' : 'check-circle'" />
            </button>
            <button class="action-icon delete" @click="deletePolicy(policy)" title="删除">
              <font-awesome-icon icon="trash" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <div class="pagination-info">
          共 {{ filteredPolicies.length }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
        </div>
        <div class="pagination-controls">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="currentPage = 1"
          >
            首页
          </button>
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            上一页
          </button>
          
          <span class="page-numbers">
            <input 
              type="number" 
              v-model.number="currentPageInput" 
              @keyup.enter="goToPage"
              :min="1" 
              :max="totalPages"
              class="page-input"
            />
          </span>
          
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            下一页
          </button>
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage = totalPages"
          >
            末页
          </button>
        </div>
      </div>
    </div>

    <!-- 策略编辑器弹窗 -->
    <PolicyEditorModal
      :visible="editorModal.visible"
      :policy="editorModal.policy"
      :is-editing="!!editorModal.policy"
      @save="handlePolicySave"
      @close="closeEditorModal"
    />

    <!-- 策略测试弹窗 -->
    <PolicyTestModal
      :visible="testModal.visible"
      :policy="testModal.policy"
      @close="closeTestModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import PolicyEditorModal from '@/components/Policy/PolicyEditorModal.vue'
import PolicyTestModal from '@/components/Policy/PolicyTestModal.vue'
import type { Policy } from '@/types'

// 响应式数据
const stats = reactive({
  totalPolicies: 0,
  activePolicies: 0,
  conflictPolicies: 0,
  recentUpdates: 0
})

const filters = reactive({
  type: '',
  status: '',
  priority: '',
  search: ''
})

const selectedPolicies = ref<number[]>([])
const currentPage = ref(1)
const currentPageInput = ref(1)
const pageSize = ref(10)

// 弹窗状态
const editorModal = reactive({
  visible: false,
  policy: null as Policy | null
})

const testModal = reactive({
  visible: false,
  policy: null as Policy | null
})

// 模拟数据
const policies = ref<Policy[]>([
  {
    id: 1,
    name: '部门数据访问策略',
    description: '允许部门成员访问本部门的数据资源',
    effect: 'PERMIT',
    priority: 100,
    status: 1,
    subjectAttributes: { department: '技术部' },
    objectAttributes: { resourceType: 'data' },
    actionAttributes: { operation: 'read' },
    environmentAttributes: { timeRange: '09:00-18:00' },
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '敏感数据保护策略',
    description: '限制对敏感数据的访问，仅允许高级权限用户',
    effect: 'DENY',
    priority: 200,
    status: 1,
    subjectAttributes: { securityLevel: { $lt: 3 } },
    objectAttributes: { dataClassification: 'sensitive' },
    actionAttributes: { operation: 'read' },
    environmentAttributes: {},
    createTime: '2024-01-02 10:00:00',
    updateTime: '2024-01-02 10:00:00'
  },
  {
    id: 3,
    name: '工作时间访问限制',
    description: '限制非工作时间对系统的访问',
    effect: 'DENY',
    priority: 150,
    status: 0,
    subjectAttributes: {},
    objectAttributes: {},
    actionAttributes: {},
    environmentAttributes: { 
      timeRange: { $not: '09:00-18:00' },
      dayOfWeek: { $not: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] }
    },
    createTime: '2024-01-03 10:00:00',
    updateTime: '2024-01-03 10:00:00'
  }
])

// 计算属性
const filteredPolicies = computed(() => {
  let result = policies.value

  if (filters.type) {
    result = result.filter(p => p.effect === filters.type)
  }
  
  if (filters.status !== '') {
    result = result.filter(p => p.status === parseInt(filters.status))
  }
  
  if (filters.priority) {
    result = result.filter(p => {
      if (filters.priority === 'high') return p.priority >= 150
      if (filters.priority === 'medium') return p.priority >= 50 && p.priority < 150
      if (filters.priority === 'low') return p.priority < 50
      return true
    })
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(search) || 
      (p.description && p.description.toLowerCase().includes(search))
    )
  }
  
  return result
})

const totalPages = computed(() => Math.ceil(filteredPolicies.value.length / pageSize.value))

const paginatedPolicies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPolicies.value.slice(start, end)
})

// 方法
const showCreateModal = () => {
  editorModal.policy = null
  editorModal.visible = true
}

const showTestModal = () => {
  testModal.policy = null
  testModal.visible = true
}

const editPolicy = (policy: Policy) => {
  editorModal.policy = { ...policy }
  editorModal.visible = true
}

const testPolicy = (policy: Policy) => {
  testModal.policy = { ...policy }
  testModal.visible = true
}

const togglePolicyStatus = (policy: Policy) => {
  policy.status = policy.status === 1 ? 0 : 1
  updateStats()
}

const deletePolicy = (policy: Policy) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除策略"${policy.name}"吗？此操作不可恢复。`,
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      const index = policies.value.findIndex(p => p.id === policy.id)
      if (index > -1) {
        policies.value.splice(index, 1)
        updateStats()
        message.success('策略删除成功')
      }
    }
  })
}

const togglePolicySelection = (policyId: number) => {
  const index = selectedPolicies.value.indexOf(policyId)
  if (index > -1) {
    selectedPolicies.value.splice(index, 1)
  } else {
    selectedPolicies.value.push(policyId)
  }
}

const batchEnable = () => {
  selectedPolicies.value.forEach(id => {
    const policy = policies.value.find(p => p.id === id)
    if (policy) policy.status = 1
  })
  updateStats()
  selectedPolicies.value = []
  message.success('批量启用成功')
}

const batchDisable = () => {
  selectedPolicies.value.forEach(id => {
    const policy = policies.value.find(p => p.id === id)
    if (policy) policy.status = 0
  })
  updateStats()
  selectedPolicies.value = []
  message.success('批量禁用成功')
}

const batchDelete = () => {
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedPolicies.value.length} 个策略吗？此操作不可恢复。`,
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      selectedPolicies.value.forEach(id => {
        const index = policies.value.findIndex(p => p.id === id)
        if (index > -1) {
          policies.value.splice(index, 1)
        }
      })
      updateStats()
      selectedPolicies.value = []
      message.success('批量删除成功')
    }
  })
}

const resetFilters = () => {
  filters.type = ''
  filters.status = ''
  filters.priority = ''
  filters.search = ''
  currentPage.value = 1
}

const handleFilterChange = () => {
  currentPage.value = 1 // 当筛选条件改变时，重置到第一页
}

const handleSearch = () => {
  currentPage.value = 1 // 当搜索条件改变时，重置到第一页
}

const goToPage = () => {
  const page = parseInt(currentPageInput.value.toString())
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  } else {
    message.warning('请输入有效的页码')
  }
}

const closeEditorModal = () => {
  editorModal.visible = false
  editorModal.policy = null
}

const closeTestModal = () => {
  testModal.visible = false
  testModal.policy = null
}

const handlePolicySave = (policy: Policy) => {
  if (editorModal.policy) {
    // 编辑模式
    const index = policies.value.findIndex(p => p.id === policy.id)
    if (index > -1) {
      policies.value[index] = { ...policy }
      message.success('策略更新成功')
    }
  } else {
    // 新建模式
    policy.id = Math.max(...policies.value.map(p => p.id)) + 1
    policies.value.push(policy)
    message.success('策略创建成功')
  }
  
  updateStats()
  closeEditorModal()
}

const getConditionSummary = (attributes: any): string => {
  if (!attributes || Object.keys(attributes).length === 0) {
    return '无限制'
  }
  
  const conditions = []
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === 'object' && value !== null) {
      // 处理复杂条件
      const operator = Object.keys(value)[0]
      const operatorValue = value[operator]
      conditions.push(`${key} ${operator} ${operatorValue}`)
    } else {
      conditions.push(`${key}: ${value}`)
    }
  }
  
  return conditions.join(', ')
}

const updateStats = () => {
  stats.totalPolicies = policies.value.length
  stats.activePolicies = policies.value.filter(p => p.status === 1).length
  stats.conflictPolicies = 0 // 这里可以添加冲突检测逻辑
  stats.recentUpdates = 0 // 这里可以添加最近更新统计逻辑
}

// 监听器
watch(currentPage, (newPage) => {
  currentPageInput.value = newPage
})

// 生命周期
onMounted(() => {
  updateStats()
})
</script>

<style scoped>
.policies-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-title h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.page-title h1 .fa-icon,
.page-title h1 svg {
  color: #00eeff;
}

.page-title p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: rgba(0, 238, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 238, 255, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-icon.active {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.stat-icon.warning {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.stat-icon.info {
  background: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* 筛选和搜索区域 */
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 24px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.filter-select {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
}

.filter-select option {
  background: #1a2332;
  color: #fff;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 300px;
  padding: 12px 16px 12px 48px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-btn {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.search-btn:hover {
  color: #00eeff;
}

/* 按钮样式 */
.action-btn {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.action-btn:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 238, 255, 0.2);
}

.action-btn.primary {
  background: linear-gradient(135deg, #00eeff 0%, #00b4db 100%);
  color: #0f2027;
  border-color: transparent;
  font-weight: 600;
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #00b4db 0%, #007799 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 238, 255, 0.3);
}

.action-btn.danger {
  color: #e74c3c;
  border-color: rgba(231, 76, 60, 0.3);
}

.action-btn.danger:hover {
  background: rgba(231, 76, 60, 0.1);
  border-color: #e74c3c;
  color: #e74c3c;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 表格样式 */
.policies-table {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(0, 238, 255, 0.1);
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.table-actions {
  display: flex;
  gap: 12px;
}

.table-info {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.table-content {
  padding: 0;
}

.policy-row {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.policy-row:hover {
  background: rgba(0, 238, 255, 0.05);
}

.policy-row.selected {
  background: rgba(0, 238, 255, 0.1);
  border-left: 4px solid #00eeff;
}

.row-checkbox {
  margin-right: 20px;
}

.row-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.row-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.policy-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.policy-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.policy-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.policy-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.effect-badge,
.priority-badge,
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.effect-badge.permit {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.effect-badge.deny {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.priority-badge {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
}

.status-badge {
  background: rgba(149, 165, 166, 0.2);
  color: #95a5a6;
}

.status-badge.active {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.policy-conditions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.condition-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.condition-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 40px;
}

.condition-value {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.row-actions {
  display: flex;
  gap: 8px;
  margin-left: 20px;
}

.action-icon {
  padding: 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  min-height: 36px;
}

.action-icon:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 238, 255, 0.2);
}

.action-icon.edit:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
}

.action-icon.test:hover {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border-color: #ffc107;
}

.action-icon.toggle:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
}

.action-icon.delete:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-color: #e74c3c;
}

.action-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 238, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.pagination-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-btn {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.page-btn:not(:disabled):hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-input {
  width: 40px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 14px;
  text-align: center;
  padding: 0;
}

.page-input:focus {
  outline: none;
  border-color: #00eeff;
}

.page-input::-webkit-inner-spin-button,
.page-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filter-left {
    flex-direction: column;
    gap: 12px;
  }

  .search-box {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .table-actions {
    justify-content: center;
  }

  .policy-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .row-actions {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }

  .pagination {
    flex-direction: column;
    gap: 16px;
  }

  .pagination-controls {
    justify-content: center;
  }
}
</style>
