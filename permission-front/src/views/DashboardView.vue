<template>
  <div class="dashboard-container">
    <!-- 页面标题和欢迎信息 -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1 class="page-title">
          <font-awesome-icon icon="tachometer-alt" class="title-icon" />
          数据概览
        </h1>
        <p class="welcome-text">
          欢迎回来，{{ userInfo.name }}！今天是 {{ currentDate }}
        </p>
      </div>
      <div class="header-actions">
        <button class="theme-button primary" @click="refreshData" :disabled="loading">
          <font-awesome-icon icon="sync-alt" :class="{ spinning: loading }" />
          刷新数据
        </button>
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
              <div v-if="loading" class="skeleton-text large"></div>
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
            <div v-if="chartLoading" class="chart-loading">
              <div class="loading-pulse"></div>
              <span>加载中...</span>
            </div>
            <div ref="accessTrendChart" class="chart" :style="{ opacity: chartLoading ? 0.3 : 1 }"></div>
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
            <button class="theme-button small" @click="viewAllLogs">
              <font-awesome-icon icon="arrow-right" />
              查看全部
            </button>
          </div>
        </div>
        <div class="activity-timeline">
          <div v-if="logsLoading" class="loading-state">
            <div class="loading-pulse"></div>
            <span>加载中...</span>
          </div>
          <div v-else-if="recentLogs.length === 0" class="empty-state">
            <font-awesome-icon icon="clock" class="empty-icon" />
            <span>暂无操作日志</span>
          </div>
          <div v-else>
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
          </div>
        </div>
      </div>

      <!-- 系统通知 -->
      <div class="notification-card">
        <div class="card-header">
          <h3 class="card-title">
            <font-awesome-icon icon="bell" />
            系统通知
            <span v-if="unreadNotifications > 0" class="notification-badge">{{ unreadNotifications }}</span>
          </h3>
          <div class="card-actions">
            <button 
              class="theme-button small" 
              @click="markAllRead" 
              :disabled="unreadNotifications === 0"
            >
              <font-awesome-icon icon="check-double" />
              全部已读
            </button>
          </div>
        </div>
        <div class="notification-list">
          <div v-if="notificationsLoading" class="loading-state">
            <div class="loading-pulse"></div>
            <span>加载中...</span>
          </div>
          <div v-else-if="notifications.length === 0" class="empty-state">
            <font-awesome-icon icon="bell" class="empty-icon" />
            <span>暂无通知</span>
          </div>
          <div v-else>
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
                <button class="mark-read-button" @click="markAsRead(notification.id)">
                  <font-awesome-icon icon="check" />
                  标记已读
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
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
        '90d': [220, 332, 201, 434, 490, 630, 720, 356, 689, 134, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790, 220, 332, 201, 434, 490, 630, 720, 356, 689, 134, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790, 220, 332, 201, 434, 490, 630, 720, 356, 689, 134, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790, 223, 556, 689, 334, 467, 790]
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

const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
  // 简单的消息提示函数，实际项目中可以用更复杂的实现
  console.log(`${type}: ${message}`)
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
    
    showMessage('数据刷新成功')
  } catch (error) {
    showMessage('数据刷新失败，请稍后重试', 'error')
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
    showMessage('页面跳转失败', 'error')
    console.error('路由跳转失败:', error)
  }
}

const viewAllLogs = () => {
  router.push('/audit/logs')
}

const markAllRead = () => {
  notifications.value.forEach(n => n.read = true)
  updateUnreadCount()
  showMessage('所有通知已标记为已读')
}

const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
    updateUnreadCount()
    showMessage('通知已标记为已读')
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
  background: transparent;
}

/* 页面头部 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.welcome-section .page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.title-icon {
  color: #00eeff;
  text-shadow: 0 0 10px rgba(0, 238, 255, 0.7);
}

.welcome-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  margin: 0;
}

/* 统一的按钮样式 */
.theme-button {
  padding: 12px 20px;
  background: linear-gradient(45deg, #00eeff, #00b4db);
  border: none;
  border-radius: 8px;
  color: #0f2027;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  text-decoration: none;
}

.theme-button:hover:not(:disabled) {
  background: linear-gradient(45deg, #00b4db, #00eeff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 238, 255, 0.3);
}

.theme-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.theme-button.small {
  padding: 8px 16px;
  font-size: 12px;
}

.theme-button.primary {
  padding: 12px 20px;
}

.theme-button svg {
  transition: transform 0.3s ease;
}

.theme-button:hover svg {
  transform: scale(1.1);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 238, 255, 0.05), transparent);
  transition: left 0.8s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 238, 255, 0.15);
  border-color: #00eeff;
}

.stat-card:hover::before {
  left: 100%;
}

.stat-icon {
  width: 65px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover .stat-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon.primary {
  background: linear-gradient(135deg, rgba(0, 238, 255, 0.2), rgba(0, 238, 255, 0.1));
  color: #00eeff;
  border: 1px solid rgba(0, 238, 255, 0.3);
  text-shadow: 0 0 10px rgba(0, 238, 255, 0.5);
}

.stat-icon.success {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(46, 204, 113, 0.1));
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
  text-shadow: 0 0 10px rgba(46, 204, 113, 0.4);
}

.stat-icon.info {
  background: linear-gradient(135deg, rgba(72, 219, 251, 0.2), rgba(72, 219, 251, 0.1));
  color: #48dbfb;
  border: 1px solid rgba(72, 219, 251, 0.3);
  text-shadow: 0 0 10px rgba(72, 219, 251, 0.4);
}

.stat-icon.warning {
  background: linear-gradient(135deg, rgba(254, 202, 87, 0.2), rgba(254, 202, 87, 0.1));
  color: #feca57;
  border: 1px solid rgba(254, 202, 87, 0.3);
  text-shadow: 0 0 10px rgba(254, 202, 87, 0.4);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
}

.stat-change {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.increase {
  color: #2ecc71;
}

.stat-change.decrease {
  color: #e74c3c;
}

/* 骨架屏样式 */
.skeleton-text {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-text.large {
  height: 32px;
  width: 80px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 图表区域 */
.charts-section {
  margin-bottom: 32px;
}

.chart-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.chart-full {
  grid-column: 1;
}

.chart-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-card:hover {
  border-color: #00eeff;
  box-shadow: 0 4px 20px rgba(0, 238, 255, 0.1);
}

.card-header {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
}

.card-title svg {
  color: #00eeff;
  font-size: 18px;
  text-shadow: 0 0 8px rgba(0, 238, 255, 0.4);
  transition: all 0.3s ease;
}

.chart-card:hover .card-title {
  color: #00eeff;
}

.chart-card:hover .card-title svg {
  transform: scale(1.1);
  text-shadow: 0 0 12px rgba(0, 238, 255, 0.6);
}

.chart-container {
  padding: 0 8px;
  position: relative;
}

.chart {
  width: 100%;
  height: 450px;
  transition: opacity 0.3s ease;
}

.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.6);
  z-index: 10;
}

/* 选择框样式 */
.native-theme-select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.native-theme-select:focus {
  outline: none;
  border-color: #00eeff;
}

.native-theme-select option {
  background: #1a2332;
  color: #fff;
}

/* 快捷操作 */
.quick-actions {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 140px;
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  transition: left 0.6s ease;
}

.action-card:hover {
  background: rgba(0, 238, 255, 0.1);
  border-color: #00eeff;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 238, 255, 0.2);
}

.action-card:hover::before {
  left: 100%;
}

.action-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 20px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-card:hover .action-icon {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.action-icon.primary {
  background: linear-gradient(135deg, rgba(0, 238, 255, 0.2), rgba(0, 238, 255, 0.1));
  color: #00eeff;
  border: 1px solid rgba(0, 238, 255, 0.3);
  text-shadow: 0 0 8px rgba(0, 238, 255, 0.5);
}

.action-icon.success {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(46, 204, 113, 0.1));
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
  text-shadow: 0 0 8px rgba(46, 204, 113, 0.3);
}

.action-icon.info {
  background: linear-gradient(135deg, rgba(72, 219, 251, 0.2), rgba(72, 219, 251, 0.1));
  color: #48dbfb;
  border: 1px solid rgba(72, 219, 251, 0.3);
  text-shadow: 0 0 8px rgba(72, 219, 251, 0.3);
}

.action-icon.warning {
  background: linear-gradient(135deg, rgba(254, 202, 87, 0.2), rgba(254, 202, 87, 0.1));
  color: #feca57;
  border: 1px solid rgba(254, 202, 87, 0.3);
  text-shadow: 0 0 8px rgba(254, 202, 87, 0.3);
}

.action-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.action-card:hover .action-title {
  color: #00eeff;
}

.action-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.action-card:hover .action-desc {
  color: rgba(255, 255, 255, 0.8);
}

/* 活动区域 */
.activity-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.activity-card,
.notification-card {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 238, 255, 0.2);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s ease;
}

.activity-card:hover,
.notification-card:hover {
  border-color: #00eeff;
  box-shadow: 0 4px 20px rgba(0, 238, 255, 0.08);
}

/* 通知徽章 */
.notification-badge {
  background: #e74c3c;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  min-width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 时间线 */
.activity-timeline {
  padding: 24px;
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
  background: rgba(0, 238, 255, 0.3);
  border-radius: 2px;
}

.activity-timeline::-webkit-scrollbar-thumb:hover,
.notification-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 238, 255, 0.5);
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 24px;
  width: 2px;
  height: calc(100% + 16px);
  background: rgba(255, 255, 255, 0.1);
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}

.timeline-dot.success {
  background: #2ecc71;
}

.timeline-dot.info {
  background: #48dbfb;
}

.timeline-dot.warning {
  background: #feca57;
}

.timeline-dot.error {
  background: #e74c3c;
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.timeline-user {
  color: #00eeff;
  font-weight: 600;
  font-size: 14px;
}

.timeline-action {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.timeline-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.timeline-detail {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  line-height: 1.4;
}

/* 通知列表 */
.notification-list {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.notification-item:hover {
  background: rgba(0, 238, 255, 0.05);
  border-color: rgba(0, 238, 255, 0.2);
}

.notification-item.unread {
  background: rgba(0, 238, 255, 0.03);
  border-color: rgba(0, 238, 255, 0.1);
}

.notification-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 16px;
  flex-shrink: 0;
}

.notification-icon.warning {
  background: rgba(254, 202, 87, 0.1);
  color: #feca57;
  border: 1px solid rgba(254, 202, 87, 0.3);
}

.notification-icon.info {
  background: rgba(72, 219, 251, 0.1);
  color: #48dbfb;
  border: 1px solid rgba(72, 219, 251, 0.3);
}

.notification-icon.error {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.notification-icon.success {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.notification-content {
  flex: 1;
}

.notification-title {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.notification-message {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.notification-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.mark-read-button {
  background: transparent;
  border: 1px solid rgba(0, 238, 255, 0.3);
  color: #00eeff;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.mark-read-button:hover {
  background: rgba(0, 238, 255, 0.1);
  border-color: #00eeff;
}

/* 加载和空状态 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.loading-pulse {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 238, 255, 0.3);
  border-top: 3px solid #00eeff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  gap: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .chart-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .activity-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .action-card {
    min-height: 120px;
    padding: 24px;
  }
}
</style> 
 