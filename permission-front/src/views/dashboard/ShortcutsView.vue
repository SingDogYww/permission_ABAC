<template>
  <div class="shortcuts-container">
    <!-- 页面标题和欢迎信息 -->
    <div class="shortcuts-header">
      <div class="welcome-section">
        <h1 class="page-title">
          <font-awesome-icon icon="rocket" class="title-icon" />
          常用功能
        </h1>
        <p class="welcome-text">
          快捷操作和常用功能入口，提高您的工作效率
        </p>
      </div>
      <div class="header-actions">
        <button class="theme-button primary" @click="refreshShortcuts" :disabled="loading">
          <font-awesome-icon icon="sync-alt" :class="{ spinning: loading }" />
          刷新
        </button>
      </div>
    </div>

    <!-- 快捷操作网格 -->
    <div class="shortcuts-grid">
      <div class="shortcut-card" v-for="shortcut in shortcuts" :key="shortcut.key" @click="handleShortcut(shortcut)">
        <div class="shortcut-icon" :class="shortcut.colorClass">
          <font-awesome-icon :icon="shortcut.icon" />
        </div>
        <div class="shortcut-content">
          <div class="shortcut-title">{{ shortcut.title }}</div>
          <div class="shortcut-description">{{ shortcut.description }}</div>
          <div class="shortcut-badge" v-if="shortcut.badge">
            {{ shortcut.badge }}
          </div>
        </div>
        <div class="shortcut-arrow">
          <font-awesome-icon icon="chevron-right" />
        </div>
      </div>
    </div>

    <!-- 最近使用功能 -->
    <div class="recent-section">
      <div class="section-header">
        <h2 class="section-title">
          <font-awesome-icon icon="history" class="section-icon" />
          最近使用
        </h2>
      </div>
      <div class="recent-grid">
        <div class="recent-item" v-for="item in recentItems" :key="item.id" @click="handleRecentItem(item)">
          <div class="recent-icon" :class="item.type">
            <font-awesome-icon :icon="item.icon" />
          </div>
          <div class="recent-content">
            <div class="recent-title">{{ item.title }}</div>
            <div class="recent-time">{{ item.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const loading = ref(false)

// 快捷功能配置
const shortcuts = ref([
  {
    key: 'addUser',
    title: '添加用户',
    description: '快速创建新用户账户',
    icon: 'user-plus',
    colorClass: 'primary',
    route: '/permission/users',
    badge: null
  },
  {
    key: 'createGroup',
    title: '创建用户组',
    description: '建立新的用户组',
    icon: 'users',
    colorClass: 'success',
    route: '/permission/groups',
    badge: null
  },
  {
    key: 'addPolicy',
    title: '新建策略',
    description: '配置权限策略规则',
    icon: 'shield-alt',
    colorClass: 'info',
    route: '/permission/policies',
    badge: null
  },
  {
    key: 'viewLogs',
    title: '查看日志',
    description: '检查系统操作记录',
    icon: 'file-alt',
    colorClass: 'warning',
    route: '/permission/audit',
    badge: '新'
  },
  {
    key: 'systemSettings',
    title: '系统设置',
    description: '配置系统参数',
    icon: 'cog',
    colorClass: 'info',
    route: '/system/settings',
    badge: null
  },
  {
    key: 'exportData',
    title: '数据导出',
    description: '导出系统数据',
    icon: 'download',
    colorClass: 'primary',
    route: '/system/export',
    badge: null
  },
  {
    key: 'importData',
    title: '数据导入',
    description: '批量导入数据',
    icon: 'upload',
    colorClass: 'success',
    route: '/system/import',
    badge: null
  },
  {
    key: 'backup',
    title: '数据备份',
    description: '创建数据备份',
    icon: 'archive',
    colorClass: 'warning',
    route: '/system/backup',
    badge: null
  }
])

// 最近使用功能
const recentItems = ref([
  {
    id: 1,
    title: '用户管理',
    time: '2分钟前',
    icon: 'users',
    type: 'primary',
    route: '/permission/users'
  },
  {
    id: 2,
    title: '权限策略',
    time: '15分钟前',
    icon: 'shield-alt',
    type: 'info',
    route: '/permission/policies'
  },
  {
    id: 3,
    title: '操作日志',
    time: '1小时前',
    icon: 'file-alt',
    type: 'warning',
    route: '/permission/audit'
  },
  {
    id: 4,
    title: '系统设置',
    time: '3小时前',
    icon: 'cog',
    type: 'success',
    route: '/system/settings'
  }
])

// 方法
const refreshShortcuts = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const handleShortcut = (shortcut: any) => {
  if (shortcut.route) {
    router.push(shortcut.route)
  }
}

const handleRecentItem = (item: any) => {
  if (item.route) {
    router.push(item.route)
  }
}
</script>

<style scoped>
.shortcuts-container {
  padding: 0;
  background: transparent;
}

/* 页面头部 */
.shortcuts-header {
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

.theme-button.primary {
  padding: 12px 20px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 快捷操作网格 */
.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.shortcut-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.shortcut-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 238, 255, 0.05), transparent);
  transition: left 0.8s ease;
}

.shortcut-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 238, 255, 0.15);
  border-color: #00eeff;
}

.shortcut-card:hover::before {
  left: 100%;
}

.shortcut-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.shortcut-card:hover .shortcut-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.shortcut-icon.primary {
  background: linear-gradient(135deg, rgba(0, 238, 255, 0.2), rgba(0, 238, 255, 0.1));
  color: #00eeff;
  border: 1px solid rgba(0, 238, 255, 0.3);
  text-shadow: 0 0 10px rgba(0, 238, 255, 0.5);
}

.shortcut-icon.success {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(46, 204, 113, 0.1));
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
  text-shadow: 0 0 10px rgba(46, 204, 113, 0.4);
}

.shortcut-icon.info {
  background: linear-gradient(135deg, rgba(72, 219, 251, 0.2), rgba(72, 219, 251, 0.1));
  color: #48dbfb;
  border: 1px solid rgba(72, 219, 251, 0.3);
  text-shadow: 0 0 10px rgba(72, 219, 251, 0.4);
}

.shortcut-icon.warning {
  background: linear-gradient(135deg, rgba(254, 202, 87, 0.2), rgba(254, 202, 87, 0.1));
  color: #feca57;
  border: 1px solid rgba(254, 202, 87, 0.3);
  text-shadow: 0 0 10px rgba(254, 202, 87, 0.4);
}

.shortcut-content {
  flex: 1;
  position: relative;
}

.shortcut-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
  transition: color 0.3s ease;
}

.shortcut-card:hover .shortcut-title {
  color: #00eeff;
}

.shortcut-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
  transition: color 0.3s ease;
}

.shortcut-card:hover .shortcut-description {
  color: rgba(255, 255, 255, 0.8);
}

.shortcut-badge {
  position: absolute;
  top: -6px;
  right: 0;
  background: #e74c3c;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
}

.shortcut-arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 16px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.shortcut-card:hover .shortcut-arrow {
  color: #00eeff;
  transform: translateX(4px);
}

/* 最近使用区域 */
.recent-section {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.recent-section:hover {
  border-color: #00eeff;
  box-shadow: 0 4px 20px rgba(0, 238, 255, 0.1);
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.section-title {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
}

.section-icon {
  color: #00eeff;
  text-shadow: 0 0 8px rgba(0, 238, 255, 0.4);
  transition: all 0.3s ease;
}

.recent-section:hover .section-title {
  color: #00eeff;
}

.recent-section:hover .section-icon {
  transform: scale(1.1);
  text-shadow: 0 0 12px rgba(0, 238, 255, 0.6);
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.recent-item:hover {
  background: rgba(0, 238, 255, 0.05);
  border-color: rgba(0, 238, 255, 0.2);
  transform: translateY(-2px);
}

.recent-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 16px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.recent-item:hover .recent-icon {
  transform: scale(1.1);
}

.recent-icon.primary {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border: 1px solid rgba(0, 238, 255, 0.3);
}

.recent-icon.success {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.recent-icon.info {
  background: rgba(72, 219, 251, 0.1);
  color: #48dbfb;
  border: 1px solid rgba(72, 219, 251, 0.3);
}

.recent-icon.warning {
  background: rgba(254, 202, 87, 0.1);
  color: #feca57;
  border: 1px solid rgba(254, 202, 87, 0.3);
}

.recent-content {
  flex: 1;
}

.recent-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.recent-item:hover .recent-title {
  color: #00eeff;
}

.recent-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.3s ease;
}

.recent-item:hover .recent-time {
  color: rgba(255, 255, 255, 0.7);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shortcuts-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .shortcuts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .shortcut-card {
    padding: 20px;
  }

  .shortcut-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .recent-grid {
    grid-template-columns: 1fr;
  }
}
</style> 