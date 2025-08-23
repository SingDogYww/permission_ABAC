<template>
  <div class="dashboard-container">
    <!-- 页面标题和欢迎信息 -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1 class="page-title">
          <font-awesome-icon icon="chart-line" class="title-icon" />
          访问趋势
        </h1>
        <p class="welcome-text">
          深度分析系统访问模式，洞察用户行为趋势与安全风险
        </p>
      </div>
      <div class="header-actions">
        <select class="native-theme-select" v-model="selectedTimeRange" @change="loadTrendData">
          <option value="1h">最近1小时</option>
          <option value="24h">最近24小时</option>
          <option value="7d">最近7天</option>
          <option value="30d">最近30天</option>
        </select>
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

    <!-- 访问趋势图表 -->
    <div class="charts-section">
      <div class="chart-row">
        <!-- 实时访问趋势 -->
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">
              <font-awesome-icon icon="activity" />
              实时访问趋势
            </h3>
            <div class="chart-controls">
              <select class="native-theme-select" v-model="trendType">
                <option value="requests">请求数量</option>
                <option value="users">用户数量</option>
                <option value="sessions">会话数量</option>
              </select>
            </div>
          </div>
          <div class="chart-container">
            <div v-if="loading" class="chart-loading">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>
            <div v-else class="chart" id="realtimeTrend"></div>
          </div>
        </div>

        <!-- 访问来源分布 -->
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">
              <font-awesome-icon icon="globe" />
              访问来源分布
            </h3>
          </div>
          <div class="chart-container">
            <div v-if="loading" class="chart-loading">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>
            <div v-else class="chart" id="sourceDistribution"></div>
          </div>
        </div>
      </div>

      <!-- 设备和平台分析 -->
      <div class="chart-row">
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">
              <font-awesome-icon icon="laptop" />
              设备类型分析
            </h3>
          </div>
          <div class="device-stats">
            <div class="device-grid">
              <div v-for="device in deviceStats" :key="device.type" class="device-item">
                <div class="device-icon" :class="device.type">
                  <font-awesome-icon :icon="device.icon" />
                </div>
                <div class="device-info">
                  <div class="device-name">{{ device.name }}</div>
                  <div class="device-percentage">{{ device.percentage }}%</div>
                  <div class="device-count">{{ device.count }} 次访问</div>
                </div>
                <div class="device-chart">
                  <div class="progress-ring">
                    <svg width="60" height="60">
                      <circle cx="30" cy="30" r="25" stroke="rgba(255,255,255,0.1)" stroke-width="4" fill="none" />
                      <circle 
                        cx="30" cy="30" r="25" 
                        :stroke="device.color" 
                        stroke-width="4" 
                        fill="none"
                        :stroke-dasharray="`${device.percentage * 1.57}, 157`"
                        transform="rotate(-90 30 30)"
                        stroke-linecap="round"
                      />
                    </svg>
                    <div class="ring-text">{{ device.percentage }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 热门页面访问 -->
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">
              <font-awesome-icon icon="fire" />
              热门页面访问
            </h3>
            <select class="native-theme-select" v-model="pageMetric">
              <option value="views">浏览量</option>
              <option value="time">停留时间</option>
              <option value="bounce">跳出率</option>
            </select>
          </div>
          <div class="pages-list">
            <div v-for="(page, index) in hotPages" :key="page.path" class="page-item">
              <div class="page-rank">
                <span class="rank-number" :class="{ 'top3': index < 3 }">{{ index + 1 }}</span>
              </div>
              <div class="page-info">
                <div class="page-path">{{ page.path }}</div>
                <div class="page-title">{{ page.title }}</div>
              </div>
              <div class="page-metrics">
                <div class="metric-primary">{{ getMetricValue(page, pageMetric) }}</div>
                <div class="metric-change" :class="page.changeType">
                  <font-awesome-icon :icon="page.changeType === 'increase' ? 'arrow-up' : 'arrow-down'" />
                  {{ page.change }}
                </div>
              </div>
              <div class="page-visual">
                <div class="mini-chart" :style="{ height: `${page.viewPercentage}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户行为分析 -->
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">
            <font-awesome-icon icon="users" />
            用户行为分析
          </h3>
          <div class="behavior-tabs">
            <button 
              v-for="tab in behaviorTabs" 
              :key="tab.key"
              :class="['tab-btn', { active: activeBehaviorTab === tab.key }]"
              @click="activeBehaviorTab = tab.key"
            >
              <font-awesome-icon :icon="tab.icon" />
              {{ tab.name }}
            </button>
          </div>
        </div>
        <div class="behavior-content">
          <!-- 用户活跃度 -->
          <div v-if="activeBehaviorTab === 'activity'" class="behavior-section">
            <div class="activity-heatmap">
              <div class="heatmap-header">
                <div class="time-labels">
                  <span v-for="hour in 24" :key="hour" class="time-label">{{ hour - 1 }}</span>
                </div>
              </div>
              <div class="heatmap-grid">
                <div v-for="day in weekDays" :key="day" class="day-row">
                  <div class="day-label">{{ day }}</div>
                  <div class="hour-cells">
                    <div 
                      v-for="hour in 24" 
                      :key="hour" 
                      class="hour-cell"
                      :style="{ backgroundColor: getActivityColor(getActivityValue(day, hour)) }"
                      :title="`${day} ${hour-1}:00 - ${getActivityValue(day, hour)} 次访问`"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="heatmap-legend">
                <span class="legend-label">访问频率:</span>
                <div class="legend-colors">
                  <div class="legend-item" v-for="level in activityLevels" :key="level.value">
                    <div class="legend-color" :style="{ backgroundColor: level.color }"></div>
                    <span class="legend-text">{{ level.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 用户路径 -->
          <div v-if="activeBehaviorTab === 'paths'" class="behavior-section">
            <div class="user-paths">
              <div class="path-flow">
                <div v-for="path in userPaths" :key="path.id" class="path-item">
                  <div class="path-nodes">
                    <div v-for="(node, index) in path.nodes" :key="index" class="path-node">
                      <div class="node-icon">
                        <font-awesome-icon :icon="node.icon" />
                      </div>
                      <div class="node-info">
                        <div class="node-name">{{ node.name }}</div>
                        <div class="node-count">{{ node.count }} 用户</div>
                      </div>
                      <div v-if="index < path.nodes.length - 1" class="node-arrow">
                        <font-awesome-icon icon="arrow-right" />
                      </div>
                    </div>
                  </div>
                  <div class="path-stats">
                    <div class="path-percentage">{{ path.percentage }}%</div>
                    <div class="path-users">{{ path.totalUsers }} 用户</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 会话分析 -->
          <div v-if="activeBehaviorTab === 'sessions'" class="behavior-section">
            <div class="session-analysis">
              <div class="session-metrics">
                <div class="session-metric" v-for="metric in sessionMetrics" :key="metric.key">
                  <div class="metric-icon" :class="metric.status">
                    <font-awesome-icon :icon="metric.icon" />
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">{{ metric.value }}</div>
                    <div class="metric-label">{{ metric.label }}</div>
                    <div class="metric-trend" :class="metric.trendType">
                      <font-awesome-icon :icon="metric.trendType === 'up' ? 'arrow-up' : 'arrow-down'" />
                      {{ metric.trend }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="session-duration-chart">
                <h4 class="chart-subtitle">会话时长分布</h4>
                <div class="duration-bars">
                  <div v-for="duration in sessionDurations" :key="duration.range" class="duration-bar">
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ height: duration.percentage + '%' }"></div>
                    </div>
                    <div class="bar-label">{{ duration.range }}</div>
                    <div class="bar-value">{{ duration.count }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 异常访问检测 -->
      <div class="chart-row">
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">
              <font-awesome-icon icon="exclamation-triangle" />
              异常访问检测
            </h3>
            <button class="theme-button small" @click="runAnomalyDetection">
              <font-awesome-icon icon="search" />
              检测异常
            </button>
          </div>
          <div class="anomaly-list">
            <div v-for="anomaly in anomalies" :key="anomaly.id" class="anomaly-item" :class="anomaly.severity">
              <div class="anomaly-icon" :class="anomaly.severity">
                <font-awesome-icon :icon="anomaly.icon" />
              </div>
              <div class="anomaly-content">
                <div class="anomaly-title">{{ anomaly.title }}</div>
                <div class="anomaly-description">{{ anomaly.description }}</div>
                <div class="anomaly-meta">
                  <span class="anomaly-time">{{ formatTime(anomaly.timestamp) }}</span>
                  <span class="anomaly-source">来源: {{ anomaly.source }}</span>
                </div>
              </div>
              <div class="anomaly-actions">
                <button class="action-btn primary" @click="investigateAnomaly(anomaly.id)">
                  <font-awesome-icon icon="search" />
                  调查
                </button>
                <button class="action-btn secondary" @click="dismissAnomaly(anomaly.id)">
                  <font-awesome-icon icon="times" />
                  忽略
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 实时监控 -->
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">
              <font-awesome-icon icon="satellite-dish" />
              实时监控
            </h3>
            <div class="monitor-status" :class="{ 'active': isMonitoring }">
              <div class="status-indicator"></div>
              <span>{{ isMonitoring ? '监控中' : '已停止' }}</span>
            </div>
          </div>
          <div class="monitor-dashboard">
            <div class="live-metrics">
              <div class="live-metric" v-for="metric in liveMetrics" :key="metric.key">
                <div class="metric-label">{{ metric.label }}</div>
                <div class="metric-value" :class="metric.status">{{ metric.value }}</div>
                <div class="metric-sparkline">
                  <div 
                    v-for="(point, index) in metric.history" 
                    :key="index" 
                    class="sparkline-bar"
                    :style="{ height: (point / Math.max(...metric.history)) * 100 + '%' }"
                  ></div>
                </div>
              </div>
            </div>
            <div class="alert-stream">
              <div class="stream-header">
                <h4>实时事件流</h4>
                <button class="clear-btn" @click="clearEventStream">清空</button>
              </div>
              <div class="event-stream">
                <div v-for="event in eventStream" :key="event.id" class="event-item" :class="event.type">
                  <div class="event-time">{{ formatEventTime(event.timestamp) }}</div>
                  <div class="event-message">{{ event.message }}</div>
                  <div class="event-badge" :class="event.type">{{ getEventTypeText(event.type) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 访问报告 -->
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">
            <font-awesome-icon icon="file-chart-line" />
            访问报告
          </h3>
          <div class="report-actions">
            <button class="theme-button small" @click="generateReport">
              <font-awesome-icon icon="file-pdf" />
              生成报告
            </button>
            <button class="theme-button small" @click="exportData">
              <font-awesome-icon icon="download" />
              导出数据
            </button>
          </div>
        </div>
        <div class="report-summary">
          <div class="summary-stats">
            <div class="summary-stat" v-for="stat in reportSummary" :key="stat.key">
              <div class="stat-icon" :class="stat.type">
                <font-awesome-icon :icon="stat.icon" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
          <div class="key-insights">
            <h4 class="insights-title">
              <font-awesome-icon icon="lightbulb" />
              关键洞察
            </h4>
            <div class="insights-list">
              <div v-for="insight in keyInsights" :key="insight.id" class="insight-item">
                <div class="insight-icon" :class="insight.type">
                  <font-awesome-icon :icon="insight.icon" />
                </div>
                <div class="insight-content">
                  <div class="insight-title">{{ insight.title }}</div>
                  <div class="insight-description">{{ insight.description }}</div>
                </div>
                <div class="insight-impact" :class="insight.impact">{{ getImpactText(insight.impact) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const loading = ref(true)
const selectedTimeRange = ref('24h')
const trendType = ref('requests')
const pageMetric = ref('views')
const activeBehaviorTab = ref('activity')
const isMonitoring = ref(true)

// 统计数据
const statsData = ref([
  {
    key: 'totalVisits',
    title: '总访问量',
    value: '12,547',
    icon: 'eye',
    colorClass: 'success',
    change: '+15.3%',
    changeType: 'increase'
  },
  {
    key: 'uniqueUsers',
    title: '独立用户',
    value: '3,892',
    icon: 'users',
    colorClass: 'info',
    change: '+8.7%',
    changeType: 'increase'
  },
  {
    key: 'avgDuration',
    title: '平均时长',
    value: '4m 32s',
    icon: 'clock',
    colorClass: 'warning',
    change: '-2.1%',
    changeType: 'decrease'
  },
  {
    key: 'bounceRate',
    title: '跳出率',
    value: '23.4%',
    icon: 'sign-out-alt',
    colorClass: 'success',
    change: '-5.2%',
    changeType: 'decrease'
  }
])

// 设备统计
const deviceStats = ref([
  { type: 'desktop', name: '桌面端', percentage: 62, count: 7780, icon: 'desktop', color: '#00eeff' },
  { type: 'mobile', name: '移动端', percentage: 28, count: 3513, icon: 'mobile-alt', color: '#feca57' },
  { type: 'tablet', name: '平板端', percentage: 10, count: 1254, icon: 'tablet-alt', color: '#ff6b6b' }
])

// 热门页面
const hotPages = ref([
  {
    path: '/dashboard',
    title: '控制台',
    views: 4521,
    time: '5m 23s',
    bounce: '18.2%',
    viewPercentage: 100,
    change: '+12.3%',
    changeType: 'increase'
  },
  {
    path: '/users',
    title: '用户管理',
    views: 3892,
    time: '3m 45s',
    bounce: '21.7%',
    viewPercentage: 86,
    change: '+8.9%',
    changeType: 'increase'
  },
  {
    path: '/permissions',
    title: '权限设置',
    views: 2654,
    time: '6m 12s',
    bounce: '15.3%',
    viewPercentage: 59,
    change: '+5.4%',
    changeType: 'increase'
  },
  {
    path: '/reports',
    title: '报告中心',
    views: 1987,
    time: '4m 56s',
    bounce: '28.9%',
    viewPercentage: 44,
    change: '-2.1%',
    changeType: 'decrease'
  },
  {
    path: '/settings',
    title: '系统设置',
    views: 1456,
    time: '2m 34s',
    bounce: '35.6%',
    viewPercentage: 32,
    change: '+1.8%',
    changeType: 'increase'
  }
])

// 行为分析标签
const behaviorTabs = ref([
  { key: 'activity', name: '活跃度', icon: 'chart-bar' },
  { key: 'paths', name: '用户路径', icon: 'route' },
  { key: 'sessions', name: '会话分析', icon: 'stopwatch' }
])

// 一周天数
const weekDays = ref(['周一', '周二', '周三', '周四', '周五', '周六', '周日'])

// 活动级别
const activityLevels = ref([
  { value: 0, label: '无', color: 'rgba(255,255,255,0.05)' },
  { value: 1, label: '低', color: 'rgba(0,238,255,0.2)' },
  { value: 2, label: '中', color: 'rgba(0,238,255,0.5)' },
  { value: 3, label: '高', color: 'rgba(0,238,255,0.8)' },
  { value: 4, label: '极高', color: '#00eeff' }
])

// 用户路径
const userPaths = ref([
  {
    id: 1,
    nodes: [
      { name: '登录页', icon: 'sign-in-alt', count: 1523 },
      { name: '控制台', icon: 'tachometer-alt', count: 1342 },
      { name: '用户管理', icon: 'users', count: 892 },
      { name: '权限设置', icon: 'shield-alt', count: 654 }
    ],
    percentage: 43,
    totalUsers: 654
  },
  {
    id: 2,
    nodes: [
      { name: '登录页', icon: 'sign-in-alt', count: 1523 },
      { name: '控制台', icon: 'tachometer-alt', count: 1342 },
      { name: '报告中心', icon: 'chart-line', count: 567 }
    ],
    percentage: 37,
    totalUsers: 567
  },
  {
    id: 3,
    nodes: [
      { name: '登录页', icon: 'sign-in-alt', count: 1523 },
      { name: '系统设置', icon: 'cog', count: 234 }
    ],
    percentage: 15,
    totalUsers: 234
  }
])

// 会话指标
const sessionMetrics = ref([
  {
    key: 'avgSession',
    label: '平均会话时长',
    value: '8m 42s',
    icon: 'clock',
    status: 'good',
    trend: '+12%',
    trendType: 'up'
  },
  {
    key: 'pageViews',
    label: '平均页面浏览',
    value: '5.7',
    icon: 'eye',
    status: 'good',
    trend: '+8%',
    trendType: 'up'
  },
  {
    key: 'conversion',
    label: '转化率',
    value: '23.4%',
    icon: 'percentage',
    status: 'excellent',
    trend: '+15%',
    trendType: 'up'
  },
  {
    key: 'retention',
    label: '用户留存',
    value: '76.8%',
    icon: 'user-check',
    status: 'good',
    trend: '+3%',
    trendType: 'up'
  }
])

// 会话时长分布
const sessionDurations = ref([
  { range: '0-1m', count: 234, percentage: 15 },
  { range: '1-5m', count: 567, percentage: 36 },
  { range: '5-15m', count: 892, percentage: 57 },
  { range: '15-30m', count: 654, percentage: 42 },
  { range: '30m+', count: 321, percentage: 20 }
])

// 异常检测
const anomalies = ref([
  {
    id: 1,
    title: '异常登录频率',
    description: '检测到来自同一IP的大量登录尝试',
    severity: 'high',
    icon: 'exclamation-triangle',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    source: '192.168.1.100'
  },
  {
    id: 2,
    title: '异常访问模式',
    description: '用户在短时间内访问了大量敏感页面',
    severity: 'medium',
    icon: 'user-shield',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    source: 'user_12345'
  },
  {
    id: 3,
    title: '非工作时间访问',
    description: '检测到凌晨时段的异常访问活动',
    severity: 'low',
    icon: 'moon',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    source: 'multiple'
  }
])

// 实时指标
const liveMetrics = ref([
  {
    key: 'currentUsers',
    label: '当前在线',
    value: '127',
    status: 'normal',
    history: [45, 52, 48, 63, 57, 69, 73, 68, 75, 82, 89, 94, 127]
  },
  {
    key: 'requestsPerMin',
    label: '每分钟请求',
    value: '342',
    status: 'high',
    history: [234, 267, 298, 321, 345, 298, 276, 312, 334, 356, 342, 328, 342]
  },
  {
    key: 'responseTime',
    label: '响应时间(ms)',
    value: '156',
    status: 'normal',
    history: [123, 145, 134, 167, 145, 156, 178, 165, 152, 148, 156, 162, 156]
  },
  {
    key: 'errorRate',
    label: '错误率(%)',
    value: '0.8',
    status: 'good',
    history: [1.2, 0.9, 1.1, 0.7, 0.8, 1.0, 0.6, 0.9, 0.8, 0.7, 0.8, 0.9, 0.8]
  }
])

// 事件流
const eventStream = ref([
  {
    id: 1,
    timestamp: new Date(Date.now() - 5000),
    type: 'info',
    message: '用户 admin 登录系统'
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 15000),
    type: 'warning',
    message: '检测到异常访问模式'
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 32000),
    type: 'success',
    message: '系统健康检查完成'
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 67000),
    type: 'error',
    message: '登录失败: 用户名或密码错误'
  }
])

// 报告摘要
const reportSummary = ref([
  { key: 'totalPageViews', label: '总页面浏览量', value: '45,892', icon: 'eye', type: 'primary' },
  { key: 'uniqueVisitors', label: '独立访客', value: '12,345', icon: 'users', type: 'success' },
  { key: 'peakConcurrent', label: '峰值并发', value: '234', icon: 'chart-line', type: 'warning' },
  { key: 'avgLoadTime', label: '平均加载时间', value: '1.8s', icon: 'tachometer-alt', type: 'info' }
])

// 关键洞察
const keyInsights = ref([
  {
    id: 1,
    title: '移动端访问增长',
    description: '移动端访问量较上周增长28%，建议优化移动端体验',
    type: 'growth',
    icon: 'mobile-alt',
    impact: 'high'
  },
  {
    id: 2,
    title: '权限页面停留时间长',
    description: '用户在权限设置页面停留时间较长，可能存在易用性问题',
    type: 'warning',
    icon: 'shield-alt',
    impact: 'medium'
  },
  {
    id: 3,
    title: '非工作时间访问减少',
    description: '夜间和周末访问量明显下降，符合正常业务模式',
    type: 'normal',
    icon: 'clock',
    impact: 'low'
  }
])

// ECharts实例
let realtimeTrendInstance: echarts.ECharts | null = null
let sourceDistributionInstance: echarts.ECharts | null = null

// 定时器
let monitoringTimer: number | null = null

// 方法
const refreshData = async () => {
  loading.value = true
  
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 更新统计数据
  statsData.value.forEach((stat, index) => {
    const randomChange = Math.floor(Math.random() * 10) + 1
    stat.change = `+${randomChange}%`
    stat.changeType = 'increase'
  })
  
  loading.value = false
  
  // 重新初始化图表
  await nextTick()
  initRealtimeTrend()
  initSourceDistribution()
}

const loadTrendData = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  loading.value = false
  
  // 重新加载图表数据
  if (realtimeTrendInstance) {
    initRealtimeTrend()
  }
}

const initRealtimeTrend = () => {
  const chartElement = document.getElementById('realtimeTrend')
  if (!chartElement) return

  realtimeTrendInstance = echarts.init(chartElement)
  
  // 生成时间序列数据
  const timeData = []
  const valueData = []
  const now = new Date()
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    timeData.push(time.getHours() + ':00')
    valueData.push(Math.floor(Math.random() * 500) + 200)
  }

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#00eeff',
      textStyle: { color: '#fff' }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeData,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'rgba(255,255,255,0.6)' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'rgba(255,255,255,0.6)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
    },
    series: [
      {
        type: 'line',
        data: valueData,
        smooth: true,
        lineStyle: { color: '#00eeff', width: 3 },
        areaStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 238, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 238, 255, 0.05)' }
          ])
        },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  }

  realtimeTrendInstance.setOption(option)
}

const initSourceDistribution = () => {
  const chartElement = document.getElementById('sourceDistribution')
  if (!chartElement) return

  sourceDistributionInstance = echarts.init(chartElement)
  
  const data = [
    { value: 4521, name: '直接访问' },
    { value: 2892, name: '搜索引擎' },
    { value: 1654, name: '外部链接' },
    { value: 987, name: '社交媒体' },
    { value: 567, name: '邮件推广' }
  ]

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#00eeff',
      textStyle: { color: '#fff' }
    },
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: { color: '#fff' },
      itemWidth: 10,
      itemHeight: 10
    },
    series: [
      {
        type: 'pie',
        radius: ['30%', '70%'],
        center: ['50%', '45%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 238, 255, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 5,
          borderColor: 'rgba(15, 23, 42, 0.8)',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}',
          color: '#fff'
        }
      }
    ],
    color: ['#00eeff', '#feca57', '#ff6b6b', '#4ecdc4', '#a8e6cf']
  }

  sourceDistributionInstance.setOption(option)
}

const getActivityValue = (day: string, hour: number) => {
  // 模拟活动数据
  const baseActivity = Math.random() * 100
  const workHourMultiplier = (hour >= 9 && hour <= 18) ? 1.5 : 0.5
  const weekendMultiplier = (day === '周六' || day === '周日') ? 0.3 : 1
  return Math.floor(baseActivity * workHourMultiplier * weekendMultiplier)
}

const getActivityColor = (value: number) => {
  if (value < 20) return 'rgba(255,255,255,0.05)'
  if (value < 40) return 'rgba(0,238,255,0.2)'
  if (value < 60) return 'rgba(0,238,255,0.5)'
  if (value < 80) return 'rgba(0,238,255,0.8)'
  return '#00eeff'
}

const getMetricValue = (page: any, metric: string) => {
  switch (metric) {
    case 'views': return page.views.toLocaleString()
    case 'time': return page.time
    case 'bounce': return page.bounce
    default: return page.views.toString()
  }
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  return `${hours}小时前`
}

const formatEventTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}

const getEventTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    info: '信息',
    warning: '警告',
    error: '错误',
    success: '成功'
  }
  return typeMap[type] || '未知'
}

const getImpactText = (impact: string) => {
  const impactMap: Record<string, string> = {
    high: '高影响',
    medium: '中影响',
    low: '低影响'
  }
  return impactMap[impact] || '未知'
}

const runAnomalyDetection = () => {
  console.log('运行异常检测')
  // TODO: 实现异常检测逻辑
}

const investigateAnomaly = (anomalyId: number) => {
  console.log('调查异常:', anomalyId)
  // TODO: 实现异常调查逻辑
}

const dismissAnomaly = (anomalyId: number) => {
  const index = anomalies.value.findIndex(a => a.id === anomalyId)
  if (index > -1) {
    anomalies.value.splice(index, 1)
  }
}

const clearEventStream = () => {
  eventStream.value = []
}

const generateReport = () => {
  console.log('生成访问报告')
  // TODO: 实现报告生成逻辑
}

const exportData = () => {
  console.log('导出访问数据')
  // TODO: 实现数据导出逻辑
}

// 模拟实时数据更新
const updateLiveData = () => {
  liveMetrics.value.forEach(metric => {
    const newValue = Math.floor(Math.random() * 50) + 50
    metric.history.push(newValue)
    if (metric.history.length > 13) {
      metric.history.shift()
    }
    
    // 更新当前值
    const latest = metric.history[metric.history.length - 1]
    switch (metric.key) {
      case 'currentUsers':
        metric.value = latest.toString()
        break
      case 'requestsPerMin':
        metric.value = (latest * 4).toString()
        break
      case 'responseTime':
        metric.value = (latest + 100).toString()
        break
      case 'errorRate':
        metric.value = (latest / 100).toFixed(1)
        break
    }
  })
  
  // 添加新事件
  if (Math.random() < 0.3) {
    const eventTypes = ['info', 'warning', 'success', 'error']
    const messages = [
      '用户登录系统',
      '检测到异常活动',
      '数据同步完成',
      '网络连接超时'
    ]
    
    const newEvent = {
      id: Date.now(),
      timestamp: new Date(),
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      message: messages[Math.floor(Math.random() * messages.length)]
    }
    
    eventStream.value.unshift(newEvent)
    if (eventStream.value.length > 10) {
      eventStream.value.pop()
    }
  }
}

// 组件挂载
onMounted(async () => {
  await refreshData()
  
  // 启动实时监控
  if (isMonitoring.value) {
    monitoringTimer = setInterval(updateLiveData, 3000)
  }
})

// 组件卸载
onUnmounted(() => {
  if (monitoringTimer) {
    clearInterval(monitoringTimer)
  }
})

// 监听趋势类型变化
watch(trendType, () => {
  if (realtimeTrendInstance) {
    initRealtimeTrend()
  }
})

// 监听时间范围变化
watch(selectedTimeRange, () => {
  loadTrendData()
})
</script>

<style scoped>
/* 基础样式继承自之前的样式，这里只添加特有的样式 */
.dashboard-container {
  padding: 0;
  background: transparent;
}

/* 页面头部样式与之前相同 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding: 32px 0 24px 0;
}

.welcome-section {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-icon {
  color: #00eeff;
  text-shadow: 0 0 20px rgba(0, 238, 255, 0.6);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 20px rgba(0, 238, 255, 0.6); }
  to { text-shadow: 0 0 30px rgba(0, 238, 255, 0.8); }
}

.welcome-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 统计卡片样式与之前相同 */
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

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 238, 255, 0.15);
  border-color: #00eeff;
}

/* 设备统计样式 */
.device-stats {
  padding: 24px;
}

.device-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.device-item:hover {
  background: rgba(0, 238, 255, 0.03);
  transform: translateY(-2px);
}

.device-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 20px;
  color: #00eeff;
  background: rgba(0, 238, 255, 0.1);
  border: 1px solid rgba(0, 238, 255, 0.2);
}

.device-info {
  flex: 1;
}

.device-name {
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.device-percentage {
  color: #00eeff;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 2px;
}

.device-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.device-chart {
  position: relative;
}

.progress-ring {
  position: relative;
  width: 60px;
  height: 60px;
}

.ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

/* 热门页面列表 */
.pages-list {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.page-item:hover {
  background: rgba(0, 238, 255, 0.03);
  border-color: rgba(0, 238, 255, 0.2);
}

.page-rank {
  width: 32px;
  text-align: center;
}

.rank-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 600;
}

.rank-number.top3 {
  background: linear-gradient(45deg, #00eeff, #00b4db);
  color: #0f2027;
}

.page-info {
  flex: 1;
}

.page-path {
  color: #00eeff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  margin-bottom: 2px;
}

.page-title {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.page-metrics {
  text-align: right;
  min-width: 80px;
}

.metric-primary {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.metric-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

.metric-change.increase {
  color: #2ecc71;
}

.metric-change.decrease {
  color: #e74c3c;
}

.page-visual {
  width: 40px;
  height: 40px;
  position: relative;
}

.mini-chart {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  background: linear-gradient(to top, #00eeff, rgba(0, 238, 255, 0.3));
  border-radius: 2px;
  transition: height 0.3s ease;
}

/* 行为分析标签 */
.behavior-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-btn:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #fff;
}

.tab-btn.active {
  background: linear-gradient(45deg, #00eeff, #00b4db);
  color: #0f2027;
  border-color: #00eeff;
}

.behavior-content {
  padding: 24px;
}

/* 活动热力图 */
.activity-heatmap {
  width: 100%;
}

.heatmap-header {
  margin-bottom: 8px;
}

.time-labels {
  display: grid;
  grid-template-columns: 80px repeat(24, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.time-label {
  text-align: center;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.heatmap-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.day-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 8px;
  align-items: center;
}

.day-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  text-align: right;
  padding-right: 8px;
}

.hour-cells {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 2px;
}

.hour-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hour-cell:hover {
  transform: scale(1.2);
}

.heatmap-legend {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.legend-colors {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
}

/* 用户路径 */
.user-paths {
  width: 100%;
}

.path-flow {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.path-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border-left: 4px solid #00eeff;
}

.path-nodes {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.path-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 238, 255, 0.1);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  color: #00eeff;
  font-size: 14px;
}

.node-info {
  text-align: center;
}

.node-name {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 2px;
}

.node-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
}

.node-arrow {
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
  margin: 0 8px;
}

.path-stats {
  text-align: right;
  min-width: 80px;
}

.path-percentage {
  color: #00eeff;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 2px;
}

.path-users {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

/* 会话分析 */
.session-analysis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.session-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.session-metric {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.metric-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 16px;
}

.metric-icon.good {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.metric-icon.excellent {
  background: rgba(0, 238, 255, 0.2);
  color: #00eeff;
}

.metric-content {
  flex: 1;
}

.metric-value {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.metric-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-bottom: 4px;
}

.metric-trend {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-trend.up {
  color: #2ecc71;
}

.session-duration-chart {
  display: flex;
  flex-direction: column;
}

.chart-subtitle {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.duration-bars {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 120px;
}

.duration-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-container {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar-fill {
  width: 20px;
  background: linear-gradient(to top, #00eeff, rgba(0, 238, 255, 0.3));
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
}

.bar-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  text-align: center;
}

.bar-value {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

/* 异常检测列表 */
.anomaly-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.anomaly-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.anomaly-item:hover {
  background: rgba(0, 238, 255, 0.03);
  border-color: rgba(0, 238, 255, 0.2);
}

.anomaly-item.high {
  border-left: 4px solid #e74c3c;
}

.anomaly-item.medium {
  border-left: 4px solid #feca57;
}

.anomaly-item.low {
  border-left: 4px solid #48dbfb;
}

.anomaly-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 16px;
}

.anomaly-icon.high {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.anomaly-icon.medium {
  background: rgba(254, 202, 87, 0.2);
  color: #feca57;
}

.anomaly-icon.low {
  background: rgba(72, 219, 251, 0.2);
  color: #48dbfb;
}

.anomaly-content {
  flex: 1;
}

.anomaly-title {
  color: #fff;
  font-weight: 600;
  margin-bottom: 4px;
}

.anomaly-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 8px;
}

.anomaly-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.anomaly-actions {
  display: flex;
  gap: 8px;
}

/* 实时监控 */
.monitor-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.monitor-status.active {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #95a5a6;
}

.monitor-status.active .status-indicator {
  background: #2ecc71;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.monitor-dashboard {
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.live-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.live-metric {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.metric-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-bottom: 4px;
}

.metric-value {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.metric-value.normal {
  color: #00eeff;
}

.metric-value.high {
  color: #feca57;
}

.metric-value.good {
  color: #2ecc71;
}

.metric-sparkline {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 20px;
}

.sparkline-bar {
  flex: 1;
  background: linear-gradient(to top, #00eeff, rgba(0, 238, 255, 0.3));
  border-radius: 1px;
  min-height: 2px;
  transition: height 0.3s ease;
}

.alert-stream {
  display: flex;
  flex-direction: column;
}

.stream-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stream-header h4 {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.clear-btn {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.event-stream {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  border-left: 3px solid transparent;
  font-size: 12px;
}

.event-item.info {
  border-left-color: #48dbfb;
}

.event-item.warning {
  border-left-color: #feca57;
}

.event-item.error {
  border-left-color: #e74c3c;
}

.event-item.success {
  border-left-color: #2ecc71;
}

.event-time {
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Courier New', monospace;
  min-width: 60px;
}

.event-message {
  flex: 1;
  color: rgba(255, 255, 255, 0.8);
}

.event-badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
}

.event-badge.info {
  background: rgba(72, 219, 251, 0.2);
  color: #48dbfb;
}

.event-badge.warning {
  background: rgba(254, 202, 87, 0.2);
  color: #feca57;
}

.event-badge.error {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.event-badge.success {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

/* 报告摘要 */
.report-summary {
  padding: 24px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.summary-stat {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 20px;
}

.stat-icon.primary {
  background: rgba(0, 238, 255, 0.2);
  color: #00eeff;
}

.stat-icon.success {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.stat-icon.warning {
  background: rgba(254, 202, 87, 0.2);
  color: #feca57;
}

.stat-icon.info {
  background: rgba(72, 219, 251, 0.2);
  color: #48dbfb;
}

.stat-content {
  flex: 1;
}

.stat-value {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.key-insights {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 24px;
}

.insights-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.insights-title svg {
  color: #00eeff;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.insight-item .insight-icon.growth {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.insight-item.growth {
  border-left-color: #2ecc71;
}

.insight-item .insight-icon.warning {
  background: rgba(254, 202, 87, 0.2);
  color: #feca57;
}

.insight-item.warning {
  border-left-color: #feca57;
}

.insight-item .insight-icon.normal {
  background: rgba(72, 219, 251, 0.2);
  color: #48dbfb;
}

.insight-item.normal {
  border-left-color: #48dbfb;
}

.insight-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 16px;
}

.insight-content {
  flex: 1;
}

.insight-title {
  color: #fff;
  font-weight: 600;
  margin-bottom: 4px;
}

.insight-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.4;
}

.insight-impact {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.insight-impact.high {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.insight-impact.medium {
  background: rgba(254, 202, 87, 0.2);
  color: #feca57;
}

.insight-impact.low {
  background: rgba(149, 165, 166, 0.2);
  color: #95a5a6;
}

/* 通用样式 */
.theme-button, .action-btn {
  padding: 8px 16px;
  background: linear-gradient(45deg, #00eeff, #00b4db);
  color: #0f2027;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.theme-button:hover, .action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 238, 255, 0.3);
}

.theme-button.small {
  padding: 6px 12px;
  font-size: 11px;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.native-theme-select {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.chart-card, .stats-grid .stat-card {
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
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title svg {
  color: #00eeff;
}

.chart-container {
  padding: 0 8px;
  position: relative;
}

.chart {
  width: 100%;
  height: 300px;
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
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0, 238, 255, 0.2);
  border-left: 2px solid #00eeff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.charts-section {
  margin-bottom: 32px;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

/* 骨架屏和加载动画 */
.skeleton-text {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-text.large {
  height: 28px;
  width: 80px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-pulse {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #00eeff;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 22px;
  border: 1px solid;
}

.stat-icon.success {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border-color: rgba(46, 204, 113, 0.3);
}

.stat-icon.info {
  background: rgba(72, 219, 251, 0.1);
  color: #48dbfb;
  border-color: rgba(72, 219, 251, 0.3);
}

.stat-icon.warning {
  background: rgba(254, 202, 87, 0.1);
  color: #feca57;
  border-color: rgba(254, 202, 87, 0.3);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
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

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
  
  .session-analysis,
  .monitor-dashboard {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .device-grid {
    grid-template-columns: 1fr;
  }
  
  .session-metrics,
  .live-metrics {
    grid-template-columns: 1fr;
  }
}
</style> 