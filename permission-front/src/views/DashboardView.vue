<template>
  <div class="dashboard-container">
    <!-- 页面标题和欢迎信息 -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1 class="page-title">
          <font-awesome-icon icon="tachometer-alt" class="title-icon" />
          系统仪表板
        </h1>
        <p class="welcome-text">
          欢迎回来，{{ userInfo.name }}！今天是 {{ currentDate }}
        </p>
      </div>
      <div class="header-actions">
        <a-button type="primary" @click="refreshData" :loading="loading">
          <font-awesome-icon icon="sync-alt" />
          刷新数据
        </a-button>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-grid">
      <div class="stat-card" :class="{ 'loading': loading }" v-for="stat in statsData" :key="stat.key">
        <div class="stat-icon" :class="stat.colorClass">
          <font-awesome-icon :icon="stat.icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">
            <transition name="fade" mode="out-in">
              <a-skeleton v-if="loading" active :paragraph="false" />
              <span v-else class="value-number">{{ stat.value }}</span>
            </transition>
          </div>
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-change" :class="stat.changeType">
            <font-awesome-icon :icon="stat.changeType === 'increase' ? 'arrow-up' : 'arrow-down'" />
            {{ stat.change }}
          </div>
        </div>
        <!-- 加载遮罩层 -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-pulse"></div>
        </div>
      </div>
    </div>

    <!-- 图表和信息展示区域 -->
    <div class="charts-section">
      <div class="chart-row">
        <!-- 用户访问趋势图 -->
        <div class="chart-card chart-full">
          <div class="card-header">
            <h3 class="card-title">
              <font-awesome-icon icon="chart-line" />
              用户访问趋势
            </h3>
                      <div class="card-actions">
            <select 
              v-model="accessPeriod" 
              class="native-theme-select" 
              @change="onPeriodChange"
            >
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="90d">最近90天</option>
            </select>
          </div>
          </div>
          <div class="chart-container">
            <a-spin :spinning="chartLoading">
              <div ref="accessTrendChart" class="chart"></div>
            </a-spin>
          </div>
        </div>

        <!-- 快捷操作面板 -->
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">
              <font-awesome-icon icon="rocket" />
              快捷操作
            </h3>
          </div>
          <div class="quick-actions">
            <div class="action-card" v-for="action in quickActions" :key="action.key" @click="handleQuickAction(action)">
              <div class="action-icon" :class="action.colorClass">
                <font-awesome-icon :icon="action.icon" />
              </div>
              <div class="action-title">{{ action.title }}</div>
              <div class="action-desc">{{ action.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 近期活动和日志 -->
    <div class="activity-section">
      <div class="activity-card">
        <div class="card-header">
          <h3 class="card-title">
            <font-awesome-icon icon="clock" />
            近期操作日志
          </h3>
          <div class="card-actions">
            <a-button size="small" class="theme-button" @click="viewAllLogs">
              <font-awesome-icon icon="arrow-right" class="button-icon" />
              查看全部
            </a-button>
          </div>
        </div>
        <div class="activity-timeline">
          <a-spin :spinning="logsLoading">
            <template v-if="!logsLoading && recentLogs.length === 0">
              <a-empty description="暂无操作日志" />
            </template>
            <template v-else>
              <div class="timeline-item" v-for="log in recentLogs" :key="log.id">
                <div class="timeline-dot" :class="log.type"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-user">{{ log.user }}</span>
                    <span class="timeline-action">{{ log.action }}</span>
                    <span class="timeline-time">{{ log.time }}</span>
                  </div>
                  <div class="timeline-detail">{{ log.detail }}</div>
                </div>
              </div>
            </template>
          </a-spin>
        </div>
      </div>

      <!-- 系统通知 -->
      <div class="notification-card">
        <div class="card-header">
          <h3 class="card-title">
            <font-awesome-icon icon="bell" />
            系统通知
          </h3>
          <div class="card-actions">
            <a-badge :count="unreadNotifications" size="small">
              <a-button size="small" class="theme-button" @click="markAllRead" :disabled="unreadNotifications === 0">
                <font-awesome-icon icon="check-double" class="button-icon" />
                全部已读
              </a-button>
            </a-badge>
          </div>
        </div>
        <div class="notification-list">
          <a-spin :spinning="notificationsLoading">
            <template v-if="!notificationsLoading && notifications.length === 0">
              <a-empty description="暂无通知" />
            </template>
            <template v-else>
              <div class="notification-item" v-for="notification in notifications" :key="notification.id" :class="{ unread: !notification.read }">
                <div class="notification-icon" :class="notification.type">
                  <font-awesome-icon :icon="notification.icon" />
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">{{ notification.message }}</div>
                  <div class="notification-time">{{ formatTime(notification.time) }}</div>
                </div>
                <div class="notification-actions" v-if="!notification.read">
                  <a-button size="small" type="text" class="mark-read-button" @click="markAsRead(notification.id)">
                    <font-awesome-icon icon="check" class="button-icon-small" />
                    标记已读
                  </a-button>
                </div>
              </div>
            </template>
          </a-spin>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'

// 定义接口类型
interface StatData {
  key: string
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: string
  colorClass: string
}

interface QuickAction {
  key: string
  title: string
  description: string
  icon: string
  colorClass: string
  route: string
}

interface LogItem {
  id: number
  user: string
  action: string
  detail: string
  time: string
  type: string
}

interface NotificationItem {
  id: number
  title: string
  message: string
  time: string
  type: string
  icon: string
  read: boolean
}

const router = useRouter()

// 响应式数据
const loading = ref(false)
const chartLoading = ref(false)
const logsLoading = ref(false)
const notificationsLoading = ref(false)
const accessPeriod = ref('7d')
const unreadNotifications = ref(0)

// 用户信息
const userInfo = ref({
  name: '管理员'
})

// 当前日期 - 实时更新
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 统计数据
const statsData = ref<StatData[]>([
  {
    key: 'totalUsers',
    title: '总用户数',
    value: '0',
    change: '+0%',
    changeType: 'increase',
    icon: 'users',
    colorClass: 'primary'
  },
  {
    key: 'activeUsers',
    title: '活跃用户',
    value: '0',
    change: '+0%',
    changeType: 'increase',
    icon: 'user-check',
    colorClass: 'success'
  },
  {
    key: 'totalGroups',
    title: '用户组数',
    value: '0',
    change: '+0%',
    changeType: 'increase',
    icon: 'users-cog',
    colorClass: 'info'
  },
  {
    key: 'totalPolicies',
    title: '权限策略',
    value: '0',
    change: '+0%',
    changeType: 'increase',
    icon: 'shield-alt',
    colorClass: 'warning'
  }
])

// 快捷操作
const quickActions = ref<QuickAction[]>([
  {
    key: 'addUser',
    title: '添加用户',
    description: '快速创建新用户账户',
    icon: 'user-plus',
    colorClass: 'primary',
    route: '/permission/user'
  },
  {
    key: 'createGroup',
    title: '创建用户组',
    description: '建立新的用户组',
    icon: 'users',
    colorClass: 'success',
    route: '/permission/user-group'
  },
  {
    key: 'addPolicy',
    title: '新建策略',
    description: '配置权限策略规则',
    icon: 'plus-circle',
    colorClass: 'info',
    route: '/permission/policy'
  },
  {
    key: 'viewLogs',
    title: '查看日志',
    description: '检查系统操作记录',
    icon: 'file-alt',
    colorClass: 'warning',
    route: '/audit/logs'
  },
  {
    key: 'manageRoles',
    title: '角色管理',
    description: '管理系统角色权限',
    icon: 'user-shield',
    colorClass: 'primary',
    route: '/permission/role'
  },
  {
    key: 'systemSettings',
    title: '系统设置',
    description: '配置系统参数',
    icon: 'cog',
    colorClass: 'info',
    route: '/system/settings'
  }
])

// 近期操作日志
const recentLogs = ref<LogItem[]>([])

// 系统通知
const notifications = ref<NotificationItem[]>([])

// 图表引用和实例
const accessTrendChart = ref()
let chartInstance: echarts.ECharts | null = null

// API 模拟函数
const fetchDashboardStats = async () => {
  return new Promise<StatData[]>((resolve) => {
    setTimeout(() => {
      resolve([
        {
          key: 'totalUsers',
          title: '总用户数',
          value: '1,234',
          change: '+12%',
          changeType: 'increase',
          icon: 'users',
          colorClass: 'primary'
        },
        {
          key: 'activeUsers',
          title: '活跃用户',
          value: '892',
          change: '+8%',
          changeType: 'increase',
          icon: 'user-check',
          colorClass: 'success'
        },
        {
          key: 'totalGroups',
          title: '用户组数',
          value: '156',
          change: '+3%',
          changeType: 'increase',
          icon: 'users-cog',
          colorClass: 'info'
        },
        {
          key: 'totalPolicies',
          title: '权限策略',
          value: '89',
          change: '-2%',
          changeType: 'decrease',
          icon: 'shield-alt',
          colorClass: 'warning'
        }
      ])
    }, 1000)
  })
}

const fetchRecentLogs = async () => {
  return new Promise<LogItem[]>((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          user: '张三',
          action: '创建用户',
          detail: '为新员工李四创建了用户账户',
          time: '2分钟前',
          type: 'success'
        },
        {
          id: 2,
          user: '李四',
          action: '修改权限',
          detail: '更新了技术部门的API访问权限',
          time: '15分钟前',
          type: 'info'
        },
        {
          id: 3,
          user: '王五',
          action: '删除用户组',
          detail: '删除了已过期的临时项目组',
          time: '1小时前',
          type: 'warning'
        },
        {
          id: 4,
          user: '赵六',
          action: '登录系统',
          detail: '从IP 192.168.1.100 登录系统',
          time: '2小时前',
          type: 'info'
        },
        {
          id: 5,
          user: '钱七',
          action: '策略更新',
          detail: '更新了数据权限访问策略',
          time: '3小时前',
          type: 'success'
        }
      ])
    }, 800)
  })
}

const fetchNotifications = async () => {
  return new Promise<NotificationItem[]>((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          title: '系统维护通知',
          message: '系统将于今晚23:00-01:00进行维护升级',
          time: '1小时前',
          type: 'warning',
          icon: 'exclamation-triangle',
          read: false
        },
        {
          id: 2,
          title: '新用户注册',
          message: '用户"新员工001"已成功注册并等待审核',
          time: '3小时前',
          type: 'info',
          icon: 'user-plus',
          read: false
        },
        {
          id: 3,
          title: '权限异常警告',
          message: '检测到异常权限访问尝试，请及时处理',
          time: '5小时前',
          type: 'error',
          icon: 'shield-alt',
          read: false
        },
        {
          id: 4,
          title: '数据备份完成',
          message: '今日数据备份已成功完成',
          time: '1天前',
          type: 'success',
          icon: 'check-circle',
          read: true
        }
      ])
    }, 600)
  })
}

const fetchAccessTrendData = async (period: string) => {
  return new Promise<number[]>((resolve) => {
    setTimeout(() => {
      const dataMap: Record<string, number[]> = {
        '7d': [320, 432, 301, 534, 590, 530, 620],
        '30d': [120, 232, 401, 634, 390, 730, 820, 456, 789, 234, 567, 890, 123, 456, 789, 234, 567, 890, 123, 456, 789, 234, 567, 890, 123, 456, 789, 234, 567, 890],
        '90d': [220, 332, 201, 434, 490, 630, 720, 356, 689, 134, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790, 220, 332, 201, 434, 490, 630, 720, 356, 689, 134, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790, 220, 332, 201, 434, 490, 630, 720, 356, 689, 134, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790]
      }
      resolve(dataMap[period] || dataMap['7d'])
    }, 500)
  })
}

// 工具函数
const formatTime = (timeStr: string) => {
  // 简单的时间格式化，实际项目中应该用更完善的时间库
  return timeStr
}

const updateUnreadCount = () => {
  unreadNotifications.value = notifications.value.filter(n => !n.read).length
}

// 方法
const refreshData = async () => {
  try {
    loading.value = true
    
    // 并行加载数据，并确保最小加载时间让用户看到加载动画
    const [dataResult] = await Promise.all([
      Promise.all([
        loadDashboardStats(),
        loadRecentLogs(),
        loadNotifications(),
        loadChartData()
      ]),
      // 最小加载时间800ms，让加载动画足够平滑
      new Promise(resolve => setTimeout(resolve, 800))
    ])
    
    message.success('数据刷新成功')
  } catch (error) {
    message.error('数据刷新失败，请稍后重试')
    console.error('数据刷新失败:', error)
  } finally {
    // 延迟一点点再隐藏加载状态，让动画更自然
    setTimeout(() => {
      loading.value = false
    }, 200)
  }
}

const loadDashboardStats = async () => {
  try {
    const stats = await fetchDashboardStats()
    statsData.value = stats
  } catch (error) {
    console.error('加载统计数据失败:', error)
    throw error
  }
}

const loadRecentLogs = async () => {
  try {
    logsLoading.value = true
    const logs = await fetchRecentLogs()
    recentLogs.value = logs
  } catch (error) {
    console.error('加载日志数据失败:', error)
    throw error
  } finally {
    logsLoading.value = false
  }
}

const loadNotifications = async () => {
  try {
    notificationsLoading.value = true
    const notifs = await fetchNotifications()
    notifications.value = notifs
    updateUnreadCount()
  } catch (error) {
    console.error('加载通知数据失败:', error)
    throw error
  } finally {
    notificationsLoading.value = false
  }
}

const loadChartData = async () => {
  try {
    chartLoading.value = true
    const data = await fetchAccessTrendData(accessPeriod.value)
    updateChart(data)
  } catch (error) {
    console.error('加载图表数据失败:', error)
    throw error
  } finally {
    chartLoading.value = false
  }
}

const handleQuickAction = (action: QuickAction) => {
  try {
    if (action.route) {
      router.push(action.route)
    }
  } catch (error) {
    message.error('页面跳转失败')
    console.error('路由跳转失败:', error)
  }
}

const viewAllLogs = () => {
  router.push('/audit/logs')
}

const markAllRead = () => {
  notifications.value.forEach(n => n.read = true)
  updateUnreadCount()
  message.success('所有通知已标记为已读')
}

const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
    updateUnreadCount()
    message.success('通知已标记为已读')
  }
}

const onPeriodChange = async () => {
  await loadChartData()
}

// 图表相关方法
const initAccessTrendChart = () => {
  if (!accessTrendChart.value) return
  
  chartInstance = echarts.init(accessTrendChart.value)
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: generateXAxisData(),
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(255, 255, 255, 0.6)' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(255, 255, 255, 0.6)' },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    series: [{
      name: '访问量',
      type: 'line',
      smooth: true,
      data: [],
      lineStyle: {
        color: '#00eeff',
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 238, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 238, 255, 0.05)' }
          ]
        }
      },
      itemStyle: {
        color: '#00eeff',
        borderColor: '#00eeff',
        borderWidth: 2
      }
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#00eeff',
      textStyle: { color: '#fff' }
    }
  }
  
  chartInstance.setOption(option)
}

const generateXAxisData = () => {
  const periodMap: Record<string, string[]> = {
    '7d': ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    '30d': Array.from({length: 30}, (_, i) => `${i + 1}日`),
    '90d': Array.from({length: 90}, (_, i) => `${Math.floor(i / 30) + 1}月${(i % 30) + 1}日`)
  }
  return periodMap[accessPeriod.value] || periodMap['7d']
}

const updateChart = (data: number[]) => {
  if (!chartInstance) return
  
  chartInstance.setOption({
    xAxis: {
      data: generateXAxisData()
    },
    series: [{
      data: data
    }]
  })
}

const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 生命周期
onMounted(async () => {
  await nextTick()
  initAccessTrendChart()
  
  // 加载初始数据
  await refreshData()
  
  // 添加窗口resize事件监听
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  // 清理图表实例
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  
  // 移除事件监听器
  window.removeEventListener('resize', resizeChart)
})
</script>

<style scoped>
.dashboard-container {
  padding: 0;
  min-height: calc(100vh - 70px);
  background: transparent;
}

/* 页面头部 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
}

.welcome-section .page-title {
  color: var(--text-primary);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-sm) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.title-icon {
  color: var(--primary-color);
  text-shadow: var(--shadow-glow);
}

.welcome-text {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  margin: 0;
}

.header-actions .ant-btn {
  background: var(--primary-gradient);
  border: none;
  color: var(--text-on-primary);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-button);
  transition: var(--transition-normal);
}

.header-actions .ant-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-strong);
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  transition: var(--transition-normal);
  backdrop-filter: blur(10px);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
  border-color: var(--border-accent);
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-2xl);
}

.stat-icon.primary {
  background: rgba(0, 238, 255, 0.15);
  color: var(--primary-color);
}

.stat-icon.success {
  background: var(--success-bg);
  color: var(--success-color);
}

.stat-icon.info {
  background: var(--info-bg);
  color: var(--info-color);
}

.stat-icon.warning {
  background: var(--warning-bg);
  color: var(--warning-color);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-title {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-change {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.stat-change.increase {
  color: var(--success-color);
}

.stat-change.decrease {
  color: var(--error-color);
}

/* 图表区域 */
.charts-section {
  margin-bottom: var(--spacing-xl);
}

.chart-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.chart-full {
  grid-column: 1;
}

.chart-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: var(--transition-normal);
}

.chart-card:hover {
  border-color: var(--border-accent);
  box-shadow: 0 4px 20px rgba(0, 238, 255, 0.1);
}

.card-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.card-title svg {
  color: var(--primary-color);
}

.chart-container {
  padding: 0 var(--spacing-sm);
  position: relative;
}

.chart {
  width: 100%;
  height: 450px;
  transition: opacity 0.3s ease;
}

.chart:hover {
  opacity: 0.95;
}



/* 快捷操作 */
.quick-actions {
  padding: var(--spacing-md);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-lg);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  transition: var(--transition-normal);
  cursor: pointer;
  min-height: 120px;
}

.action-card:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 238, 255, 0.15);
}

.action-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
}

.action-icon.primary {
  background: rgba(0, 238, 255, 0.15);
  color: var(--primary-color);
}

.action-icon.success {
  background: var(--success-bg);
  color: var(--success-color);
}

.action-icon.info {
  background: var(--info-bg);
  color: var(--info-color);
}

.action-icon.warning {
  background: var(--warning-bg);
  color: var(--warning-color);
}

.action-title {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
  line-height: 1.2;
}

.action-desc {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  line-height: 1.3;
}

/* 活动区域 */
.activity-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-lg);
}

.activity-card,
.notification-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: var(--transition-normal);
}

.activity-card:hover,
.notification-card:hover {
  border-color: var(--border-accent);
  box-shadow: 0 4px 20px rgba(0, 238, 255, 0.08);
}

/* 时间线 */
.activity-timeline {
  padding: var(--spacing-lg);
  max-height: 400px;
  overflow-y: auto;
}

/* 自定义滚动条样式 */
.activity-timeline::-webkit-scrollbar,
.notification-list::-webkit-scrollbar {
  width: 4px;
}

.activity-timeline::-webkit-scrollbar-track,
.notification-list::-webkit-scrollbar-track {
  background: transparent;
}

.activity-timeline::-webkit-scrollbar-thumb,
.notification-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.activity-timeline::-webkit-scrollbar-thumb:hover,
.notification-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 24px;
  width: 2px;
  height: calc(100% + var(--spacing-md));
  background: var(--border-primary);
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  margin-top: 4px;
  flex-shrink: 0;
}

.timeline-dot.success {
  background: var(--success-color);
}

.timeline-dot.info {
  background: var(--info-color);
}

.timeline-dot.warning {
  background: var(--warning-color);
}

.timeline-dot.error {
  background: var(--error-color);
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  flex-wrap: wrap;
}

.timeline-user {
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.timeline-action {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.timeline-time {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  margin-left: auto;
}

.timeline-detail {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* 通知列表 */
.notification-list {
  padding: var(--spacing-lg);
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
}

.notification-item.unread {
  background: rgba(0, 238, 255, 0.05);
  border-left: 3px solid var(--primary-color);
}

.notification-item.unread .notification-title {
  font-weight: var(--font-weight-semibold);
}

.notification-item:hover {
  background: var(--bg-hover);
}

.notification-item.unread:hover {
  background: rgba(0, 238, 255, 0.08);
}

.notification-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  flex-shrink: 0;
}

.notification-icon.success {
  background: var(--success-bg);
  color: var(--success-color);
}

.notification-icon.info {
  background: var(--info-bg);
  color: var(--info-color);
}

.notification-icon.warning {
  background: var(--warning-bg);
  color: var(--warning-color);
}

.notification-icon.error {
  background: var(--error-bg);
  color: var(--error-color);
}

.notification-content {
  flex: 1;
}

.notification-title {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
}

.notification-message {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
}

.notification-time {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}

.notification-actions {
  flex-shrink: 0;
}

/* 加载状态样式 */
.stat-value .ant-skeleton-input {
  height: 2.5rem;
  border-radius: var(--radius-sm);
}

.ant-empty {
  padding: var(--spacing-lg);
}

.ant-spin-container {
  min-height: 200px;
}

/* 卡片加载状态 */
.stat-card.loading {
  position: relative;
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(1px);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-pulse {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.3;
  animation: pulse-loading 1.5s ease-in-out infinite;
}

@keyframes pulse-loading {
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
}

/* 数值动画 */
.value-number {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 已合并到通知列表样式部分 */

/* 精致的主题按钮样式 */
.theme-button {
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)) !important;
  color: var(--text-primary) !important;
  border-radius: 6px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  height: 30px !important;
  padding: 0 14px !important;
  position: relative !important;
  overflow: hidden !important;
  backdrop-filter: blur(8px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.theme-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.theme-button:hover {
  background: linear-gradient(135deg, rgba(0, 238, 255, 0.15), rgba(0, 238, 255, 0.08)) !important;
  border-color: rgba(0, 238, 255, 0.4) !important;
  color: var(--primary-color) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 16px rgba(0, 238, 255, 0.2) !important;
}

.theme-button:hover::before {
  left: 100%;
}

.theme-button:active {
  transform: translateY(0) !important;
  box-shadow: 0 2px 8px rgba(0, 238, 255, 0.15) !important;
}

.theme-button:focus {
  background: linear-gradient(135deg, rgba(0, 238, 255, 0.15), rgba(0, 238, 255, 0.08)) !important;
  border-color: var(--primary-color) !important;
  color: var(--primary-color) !important;
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(0, 238, 255, 0.2) !important;
}

/* 精致的主题选择器样式 */
.native-theme-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  
  /* 精致的尺寸和间距 */
  width: 110px;
  height: 30px;
  padding: 6px 28px 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  
  /* 精致的背景和边框 */
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  position: relative;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  /* 平滑的过渡动画 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 精致的箭头图标 */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300eeff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
}

/* 精致的悬停效果 */
.native-theme-select:hover {
  background: linear-gradient(135deg, rgba(0, 238, 255, 0.15), rgba(0, 238, 255, 0.08));
  border-color: rgba(0, 238, 255, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 238, 255, 0.15);
}

/* 聚焦效果 */
.native-theme-select:focus {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(0, 238, 255, 0.15), rgba(0, 238, 255, 0.08));
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 238, 255, 0.2);
  transform: translateY(-1px);
}

/* 精致的选项样式 */
.native-theme-select option {
  background: rgba(20, 30, 45, 0.98);
  color: var(--text-primary);
  padding: 8px 12px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.native-theme-select option:hover {
  background: rgba(0, 238, 255, 0.15);
  color: var(--primary-color);
}

.native-theme-select option:checked,
.native-theme-select option:selected {
  background: linear-gradient(135deg, rgba(0, 238, 255, 0.25), rgba(0, 238, 255, 0.15));
  color: var(--primary-color);
  font-weight: 600;
}

/* 精致的按钮禁用状态 */
.theme-button:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: var(--text-disabled) !important;
  transform: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

.theme-button:disabled:hover {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  transform: none !important;
  box-shadow: none !important;
}

.theme-button:disabled::before {
  display: none !important;
}

/* 精致的标记已读按钮样式 */
.mark-read-button {
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)) !important;
  color: var(--text-secondary) !important;
  border-radius: 5px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  font-weight: 500 !important;
  font-size: 11px !important;
  height: 26px !important;
  padding: 0 10px !important;
  min-width: auto !important;
  position: relative !important;
  overflow: hidden !important;
  backdrop-filter: blur(4px) !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1) !important;
}

.mark-read-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 238, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.mark-read-button:hover {
  background: linear-gradient(135deg, rgba(0, 238, 255, 0.12), rgba(0, 238, 255, 0.06)) !important;
  border-color: rgba(0, 238, 255, 0.3) !important;
  color: var(--primary-color) !important;
  transform: translateY(-1px) scale(1.02) !important;
  box-shadow: 0 3px 12px rgba(0, 238, 255, 0.15) !important;
}

.mark-read-button:hover::before {
  left: 100%;
}

.mark-read-button:active {
  transform: translateY(0) scale(1) !important;
  box-shadow: 0 1px 6px rgba(0, 238, 255, 0.1) !important;
}

.mark-read-button:focus {
  background: linear-gradient(135deg, rgba(0, 238, 255, 0.12), rgba(0, 238, 255, 0.06)) !important;
  border-color: rgba(0, 238, 255, 0.4) !important;
  color: var(--primary-color) !important;
  outline: none !important;
  box-shadow: 0 0 0 1px rgba(0, 238, 255, 0.2) !important;
}

/* 按钮图标样式 */
.button-icon {
  margin-right: 6px !important;
  font-size: 10px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.button-icon-small {
  margin-right: 4px !important;
  font-size: 9px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.theme-button:hover .button-icon {
  transform: translateX(2px) !important;
}

.mark-read-button:hover .button-icon-small {
  transform: scale(1.1) !important;
}

/* Badge 样式优化 */
:deep(.ant-badge-count) {
  background: linear-gradient(135deg, #ff4757, #ff3742) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3) !important;
  font-weight: var(--font-weight-semibold) !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .activity-section {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .timeline-time {
    margin-left: 0;
  }
  
  .chart {
    height: 280px;
  }
  
  .card-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .notification-list,
  .activity-timeline {
    max-height: 300px;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 0 var(--spacing-sm);
  }
  
  .dashboard-header {
    padding: var(--spacing-md);
  }
  
  .page-title {
    font-size: var(--font-size-2xl) !important;
  }
  
  .stat-card {
    padding: var(--spacing-md);
  }
  
  .chart {
    height: 220px;
  }
  
  .notification-list,
  .activity-timeline {
    max-height: 250px;
    padding: var(--spacing-md);
  }
  
  .action-card {
    min-height: 100px;
    padding: var(--spacing-md);
  }
}
</style> 
 