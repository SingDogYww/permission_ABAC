<template>
  <div class="overview-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h1>
          <font-awesome-icon icon="chart-bar" />
          数据概览
        </h1>
        <p>权限管理系统数据统计与概览</p>
      </div>
      
      <div class="page-actions">
        <a-button @click="refreshData">
          <font-awesome-icon icon="sync" />
          刷新数据
        </a-button>
        <a-button type="primary" @click="exportReport">
          <font-awesome-icon icon="download" />
          导出报告
        </a-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon user">
                <font-awesome-icon icon="users" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalUsers }}</div>
                <div class="stat-label">总用户数</div>
                <div class="stat-change positive">
                  <font-awesome-icon icon="arrow-up" />
                  +{{ stats.userGrowth }}%
                </div>
              </div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon group">
                <font-awesome-icon icon="users-cog" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalGroups }}</div>
                <div class="stat-label">用户组数</div>
                <div class="stat-change positive">
                  <font-awesome-icon icon="arrow-up" />
                  +{{ stats.groupGrowth }}%
                </div>
              </div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon policy">
                <font-awesome-icon icon="scroll" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalPolicies }}</div>
                <div class="stat-label">权限策略</div>
                <div class="stat-change neutral">
                  <font-awesome-icon icon="minus" />
                  {{ stats.policyChange }}%
                </div>
              </div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon audit">
                <font-awesome-icon icon="history" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.todayOperations }}</div>
                <div class="stat-label">今日操作</div>
                <div class="stat-change negative">
                  <font-awesome-icon icon="arrow-down" />
                  -{{ stats.operationChange }}%
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <a-row :gutter="[24, 24]">
        <!-- 用户增长趋势 -->
        <a-col :xs="24" :lg="12">
          <a-card title="用户增长趋势" class="chart-card">
            <template #extra>
              <a-radio-group v-model:value="userTrendPeriod" size="small">
                <a-radio-button value="7d">7天</a-radio-button>
                <a-radio-button value="30d">30天</a-radio-button>
                <a-radio-button value="90d">90天</a-radio-button>
              </a-radio-group>
            </template>
            <div class="chart-container" ref="userTrendChart"></div>
          </a-card>
        </a-col>

        <!-- 权限分布 -->
        <a-col :xs="24" :lg="12">
          <a-card title="权限策略分布" class="chart-card">
            <div class="chart-container" ref="policyDistChart"></div>
          </a-card>
        </a-col>

        <!-- 操作热点 -->
        <a-col :xs="24" :lg="12">
          <a-card title="操作热点分析" class="chart-card">
            <div class="chart-container" ref="operationHeatChart"></div>
          </a-card>
        </a-col>

        <!-- 登录统计 -->
        <a-col :xs="24" :lg="12">
          <a-card title="登录活跃度" class="chart-card">
            <div class="chart-container" ref="loginActivityChart"></div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 最新动态 -->
    <div class="activity-section">
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :lg="16">
          <a-card title="最新操作" class="activity-card">
            <template #extra>
              <a-button type="link" @click="$router.push('/permission/audit')">
                查看全部
                <font-awesome-icon icon="arrow-right" />
              </a-button>
            </template>
            
            <a-list
              :data-source="recentOperations"
              :split="false"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar :style="{ backgroundColor: getOperationColor(item.type) }">
                        <font-awesome-icon :icon="getOperationIcon(item.type)" />
                      </a-avatar>
                    </template>
                    
                    <template #title>
                      <span class="operation-title">{{ item.title }}</span>
                      <a-tag :color="getOperationTagColor(item.type)" size="small">
                        {{ item.type }}
                      </a-tag>
                    </template>
                    
                    <template #description>
                      <div class="operation-description">
                        <span>{{ item.description }}</span>
                        <span class="operation-time">{{ formatTime(item.createTime) }}</span>
                      </div>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>

        <a-col :xs="24" :lg="8">
          <a-card title="系统状态" class="status-card">
            <div class="status-list">
              <div class="status-item">
                <div class="status-label">
                  <font-awesome-icon icon="server" />
                  系统运行时间
                </div>
                <div class="status-value">{{ systemStatus.uptime }}</div>
              </div>
              
              <div class="status-item">
                <div class="status-label">
                  <font-awesome-icon icon="database" />
                  数据库状态
                </div>
                <div class="status-value">
                  <a-tag color="green">正常</a-tag>
                </div>
              </div>
              
              <div class="status-item">
                <div class="status-label">
                  <font-awesome-icon icon="memory" />
                  内存使用率
                </div>
                <div class="status-value">
                  <a-progress 
                    :percent="systemStatus.memoryUsage" 
                    size="small" 
                    :show-info="false"
                  />
                  <span>{{ systemStatus.memoryUsage }}%</span>
                </div>
              </div>
              
              <div class="status-item">
                <div class="status-label">
                  <font-awesome-icon icon="tachometer-alt" />
                  CPU使用率
                </div>
                <div class="status-value">
                  <a-progress 
                    :percent="systemStatus.cpuUsage" 
                    size="small" 
                    :show-info="false"
                  />
                  <span>{{ systemStatus.cpuUsage }}%</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'

// 响应式数据
const userTrendPeriod = ref('30d')

// 统计数据
const stats = reactive({
  totalUsers: 1247,
  userGrowth: 12.5,
  totalGroups: 85,
  groupGrowth: 8.3,
  totalPolicies: 156,
  policyChange: 0,
  todayOperations: 2834,
  operationChange: 5.2
})

// 最新操作数据
const recentOperations = ref([
  {
    id: 1,
    type: '用户创建',
    title: '新增用户 john_doe',
    description: '管理员 admin 创建了新用户 john_doe',
    createTime: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: 2,
    type: '权限分配',
    title: '分配用户组权限',
    description: '为技术部组分配了新的API访问权限',
    createTime: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: 3,
    type: '策略更新',
    title: '更新数据权限策略',
    description: '修改了财务数据访问策略的时间限制',
    createTime: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 4,
    type: '登录异常',
    title: '检测到异常登录',
    description: '用户 test_user 在异常时间段登录',
    createTime: new Date(Date.now() - 45 * 60 * 1000)
  },
  {
    id: 5,
    type: '用户禁用',
    title: '禁用用户账户',
    description: '管理员禁用了用户 inactive_user',
    createTime: new Date(Date.now() - 60 * 60 * 1000)
  }
])

// 系统状态
const systemStatus = reactive({
  uptime: '15天 8小时 32分钟',
  memoryUsage: 68,
  cpuUsage: 23
})

// Chart引用
const userTrendChart = ref()
const policyDistChart = ref()
const operationHeatChart = ref()
const loginActivityChart = ref()

// 方法
const refreshData = () => {
  message.info('数据刷新中...')
  // TODO: 实现数据刷新逻辑
}

const exportReport = () => {
  message.info('报告导出功能开发中...')
}

const getOperationColor = (type: string) => {
  const colors = {
    '用户创建': '#52c41a',
    '权限分配': '#1890ff',
    '策略更新': '#fa8c16',
    '登录异常': '#f5222d',
    '用户禁用': '#8c8c8c'
  }
  return colors[type] || '#1890ff'
}

const getOperationIcon = (type: string) => {
  const icons = {
    '用户创建': 'user-plus',
    '权限分配': 'key',
    '策略更新': 'edit',
    '登录异常': 'exclamation-triangle',
    '用户禁用': 'user-times'
  }
  return icons[type] || 'info-circle'
}

const getOperationTagColor = (type: string) => {
  const colors = {
    '用户创建': 'green',
    '权限分配': 'blue',
    '策略更新': 'orange',
    '登录异常': 'red',
    '用户禁用': 'default'
  }
  return colors[type] || 'blue'
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

// 初始化图表（模拟）
const initCharts = () => {
  // 这里应该使用真实的图表库如 ECharts 或 Chart.js
  console.log('初始化图表...')
}

onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})
</script>

<style scoped>
.overview-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-title h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.page-actions {
  display: flex;
  gap: 12px;
}

/* 统计卡片 */
.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  height: 120px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.group {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.policy {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.audit {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: #52c41a;
}

.stat-change.negative {
  color: #f5222d;
}

.stat-change.neutral {
  color: #8c8c8c;
}

/* 图表区域 */
.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 8px;
  color: #8c8c8c;
}

/* 活动区域 */
.activity-section {
  margin-bottom: 24px;
}

.activity-card,
.status-card {
  height: 500px;
}

.operation-title {
  font-weight: 500;
  margin-right: 8px;
}

.operation-description {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operation-time {
  color: #8c8c8c;
  font-size: 12px;
}

/* 状态列表 */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #595959;
  font-size: 14px;
}

.status-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .page-actions {
    justify-content: flex-start;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}
</style> 