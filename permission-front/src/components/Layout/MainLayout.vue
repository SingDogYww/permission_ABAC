<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <font-awesome-icon icon="user-astronaut" class="logo-icon" />
          <span class="logo-text">未来科技管理平台</span>
        </div>
        
        <!-- 主导航菜单 -->
        <nav class="main-nav">
          <router-link 
            v-for="item in mainNavItems" 
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ active: $route.path.startsWith(item.path) }"
          >
            <font-awesome-icon :icon="item.icon" />
            <span>{{ item.title }}</span>
          </router-link>
        </nav>
      </div>
      
      <div class="header-right">
        <!-- 消息通知 -->
        <div class="notification" @click="showNotifications">
          <font-awesome-icon icon="bell" />
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </div>
        
        <!-- 用户信息 -->
        <div 
          class="user-info" 
          @mouseenter="showUserMenu = true"
          @mouseleave="showUserMenu = false"
        >
          <img :src="userInfo.avatar" :alt="userInfo.name" class="user-avatar" />
          <span class="user-name">{{ userInfo.name }}</span>
          <font-awesome-icon icon="chevron-down" class="dropdown-icon" />
          
          <!-- 用户下拉菜单 -->
          <div class="user-dropdown" :class="{ show: showUserMenu }">
            <a href="#" class="dropdown-item" @click="goToProfile">
              <font-awesome-icon icon="user" />
              个人中心
            </a>
            <a href="#" class="dropdown-item" @click="changePassword">
              <font-awesome-icon icon="lock" />
              修改密码
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item logout" @click="logout">
              <font-awesome-icon icon="sign-out-alt" />
              退出登录
            </a>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 侧边栏 (仅在权限管理模块显示) -->
      <aside 
        v-if="showSidebar" 
        class="sidebar"
      >        
        <div class="sidebar-content">
          <nav class="sidebar-nav">
            <div 
              v-for="menu in sidebarMenus" 
              :key="menu.key"
              class="nav-group"
              :class="{ expanded: menu.expanded }"
            >
              <div class="nav-group-header" @click="toggleMenu(menu)">
                <div class="nav-group-title">
                  <font-awesome-icon :icon="menu.icon" class="nav-icon" />
                  <span class="nav-text">{{ menu.title }}</span>
                </div>
                <font-awesome-icon 
                  v-if="menu.children" 
                  :icon="menu.expanded ? 'chevron-down' : 'chevron-right'"
                  class="expand-icon"
                />
              </div>
              
              <div v-if="menu.children && menu.expanded" class="nav-group-content">
                <router-link
                  v-for="child in menu.children"
                  :key="child.path"
                  :to="child.path"
                  class="nav-link"
                  :class="{ active: $route.path === child.path }"
                >
                  <div class="nav-link-content">
                    <div class="nav-link-main">
                      <font-awesome-icon :icon="child.icon" class="nav-link-icon" />
                      <span class="nav-link-text">{{ child.title }}</span>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </nav>
        </div>
      </aside>
      
      <!-- 内容区域 -->
      <main class="content" :class="{ 'with-sidebar': showSidebar }">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 响应式数据
const showUserMenu = ref(false)
const unreadCount = ref(5)

// 用户信息
const userInfo = ref({
  name: '管理员',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
})

// 主导航菜单
const mainNavItems = [
  { path: '/dashboard', title: '首页', icon: 'home' },
  { path: '/permission', title: '权限管理', icon: 'users-cog' },
  { path: '/system', title: '系统管理', icon: 'cog' }
]

// 菜单展开状态管理
const menuExpandState = ref<Record<string, boolean>>({
  'user-management': true,
  'permission-control': true,
  'system-config': true,
  'system-monitor': false,
  'data-management': false,
  'security-audit': false,
  'overview': true,
  'workspace': true,
  'security': true,
  'system-health': false
})

// 侧边栏菜单配置 - 基于README设计
const getMenusByRoute = () => {
  const path = route.path
  
  // 权限管理模块菜单
  if (path.startsWith('/permission')) {
    return [
      {
        key: 'user-management',
        title: '用户管理',
        icon: 'users',
        expanded: menuExpandState.value['user-management'],
        children: [
          { path: '/permission/users', title: '用户列表', icon: 'user' },
          { path: '/permission/groups', title: '用户组管理', icon: 'users-cog' }
        ]
      },
      {
        key: 'permission-control',
        title: '权限控制',
        icon: 'shield-alt',
        expanded: menuExpandState.value['permission-control'],
        children: [
          { path: '/permission/policies', title: '权限策略', icon: 'scroll' },
          { path: '/permission/resources', title: '资源管理', icon: 'sitemap' },
          { path: '/permission/matrix', title: '权限矩阵', icon: 'table' }
        ]
      }
    ]
  }
  
  // 系统管理模块菜单
  if (path.startsWith('/system')) {
    return [
      {
        key: 'system-config',
        title: '系统配置',
        icon: 'cog',
        expanded: menuExpandState.value['system-config'],
        children: [
          { path: '/system/settings', title: '系统设置', icon: 'sliders-h' },
          { path: '/system/params', title: '参数配置', icon: 'tools' },
          { path: '/system/dict', title: '数据字典', icon: 'book' }
        ]
      },
      {
        key: 'system-monitor',
        title: '系统监控',
        icon: 'chart-line',
        expanded: menuExpandState.value['system-monitor'],
        children: [
          { path: '/system/monitor', title: '性能监控', icon: 'tachometer-alt' },
          { path: '/system/logs', title: '系统日志', icon: 'file-alt' },
          { path: '/system/health', title: '健康检查', icon: 'heartbeat' }
        ]
      },
      {
        key: 'data-management',
        title: '数据管理',
        icon: 'database',
        expanded: menuExpandState.value['data-management'],
        children: [
          { path: '/system/backup', title: '数据备份', icon: 'save' },
          { path: '/system/import', title: '数据导入', icon: 'upload' },
          { path: '/system/export', title: '数据导出', icon: 'download' }
        ]
      },
      {
        key: 'security-audit',
        title: '安全审计',
        icon: 'eye',
        expanded: menuExpandState.value['security-audit'],
        children: [
          { path: '/system/audit', title: '操作日志', icon: 'history' },
          { path: '/system/login-logs', title: '登录日志', icon: 'sign-in-alt' },
          { path: '/system/security', title: '安全监控', icon: 'shield-virus' }
        ]
      }
    ]
  }
  
  // 主控制台菜单
  if (path.startsWith('/dashboard')) {
    return [
      {
        key: 'overview',
        title: '数据总览',
        icon: 'chart-pie',
        expanded: menuExpandState.value['overview'],
        children: [
          { path: '/dashboard/overview', title: '数据概览', icon: 'chart-bar' },
          { path: '/dashboard/monitor', title: '系统监控', icon: 'desktop' },
          { path: '/dashboard/trends', title: '访问趋势', icon: 'chart-line' }
        ]
      },
      {
        key: 'workspace',
        title: '工作管理',
        icon: 'briefcase',
        expanded: menuExpandState.value['workspace'],
        children: [
          { path: '/dashboard/workspace', title: '工作台', icon: 'home' },
          { path: '/dashboard/shortcuts', title: '常用功能', icon: 'star' }
        ]
      },
      {
        key: 'security',
        title: '安全管理',
        icon: 'shield-alt',
        expanded: menuExpandState.value['security'],
        children: [
          { path: '/dashboard/analytics', title: '权限分析', icon: 'chart-area' },
          { path: '/dashboard/alerts', title: '安全告警', icon: 'exclamation-triangle' },
          { path: '/dashboard/compliance', title: '合规审计', icon: 'balance-scale' }
        ]
      },
      {
        key: 'system-health',
        title: '系统状态',
        icon: 'heartbeat',
        expanded: menuExpandState.value['system-health'],
        children: [
          { path: '/dashboard/health', title: '系统健康检查', icon: 'stethoscope' }
        ]
      }
    ]
  }
  
  return []
}

const sidebarMenus = computed(() => getMenusByRoute())

// 计算属性
const showSidebar = computed(() => {
  return route.path.startsWith('/permission') || route.path.startsWith('/system') || route.path.startsWith('/dashboard')
})

// 方法
interface MenuType {
  key: string
  title: string
  icon: string
  expanded: boolean
  children?: Array<{ path: string; title: string; icon: string }>
}

const toggleMenu = (menu: MenuType) => {
  menuExpandState.value[menu.key] = !menuExpandState.value[menu.key]
}

const showNotifications = () => {
  // TODO: 实现通知面板显示逻辑
  // 显示通知
}

const goToProfile = () => {
  router.push('/profile')
  showUserMenu.value = false
}

const changePassword = () => {
  router.push('/change-password')
  showUserMenu.value = false
}

const logout = () => {
  // TODO: 实现退出登录逻辑
  router.push('/login')
  showUserMenu.value = false
}

// 生命周期
onMounted(() => {
  // 持久化菜单展开状态
  const savedMenuState = localStorage.getItem('menuExpandState')
  if (savedMenuState) {
    try {
      Object.assign(menuExpandState.value, JSON.parse(savedMenuState))
    } catch (error) {
      console.warn('Failed to restore menu state:', error)
    }
  }
})

// 监听菜单状态变化并持久化
watch(menuExpandState, (newState) => {
  localStorage.setItem('menuExpandState', JSON.stringify(newState))
}, { deep: true })
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  color: #fff;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

/* 顶部导航栏 */
.header {
  height: 70px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  color: #00eeff;
  text-shadow: 0 0 10px rgba(0, 238, 255, 0.7);
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.main-nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  color: #00eeff;
  background: rgba(0, 238, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
}

.nav-item.active {
  color: #00eeff;
  background: rgba(0, 238, 255, 0.15);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: #00eeff;
  border-radius: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.notification {
  position: relative;
  padding: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  border-radius: 6px;
}

.notification:hover {
  color: #00eeff;
  background: rgba(0, 238, 255, 0.1);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ff4757;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.user-info:hover {
  background: rgba(0, 238, 255, 0.1);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(0, 238, 255, 0.3);
}

.user-name {
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-icon {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  min-width: 180px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1001;
}

.user-dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
}

.dropdown-item.logout {
  color: #ff6b6b;
}

.dropdown-item.logout:hover {
  background: rgba(255, 107, 107, 0.1);
  color: #ff4757;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

/* 主体内容区 */
.main-content {
  display: flex;
  margin-top: 70px;
  min-height: calc(100vh - 70px);
}

/* 侧边栏 */
.sidebar {
  width: 240px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(0, 238, 255, 0.2);
  transition: all 0.3s ease;
}

.sidebar-content {
  padding: 16px 0;
  height: 100%;
  overflow-y: auto;
}

.sidebar-nav {
  padding: 0;
  margin: 0;
}

.nav-group {
  margin-bottom: 8px;
}

.nav-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin: 0 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-group-header:hover {
  background: rgba(0, 238, 255, 0.1);
}

.nav-group-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.nav-group-header:hover .nav-group-title {
  color: #00eeff;
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.nav-text {
  font-weight: 500;
  font-size: 16px;
}

.expand-icon {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease;
}

.nav-group.expanded .expand-icon {
  transform: rotate(90deg);
}

.nav-group-content {
  padding-left: 0;
  margin-top: 8px;
  margin-left: 28px;
  padding-bottom: 8px;
}

.nav-link {
  display: block;
  color: inherit;
  text-decoration: none;
  border-radius: 6px;
  margin: 4px 12px 4px 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-link:hover {
  background: rgba(0, 238, 255, 0.1);
  transform: translateX(2px);
}

.nav-link.active {
  background: rgba(0, 238, 255, 0.2);
  transform: translateX(4px);
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: #00eeff;
  border-radius: 0 2px 2px 0;
  box-shadow: 0 0 8px rgba(0, 238, 255, 0.6);
}

.nav-link-content {
  padding: 10px 16px;
}

.nav-link-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.nav-link-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.6);
}

.nav-link:hover .nav-link-icon {
  color: rgba(0, 238, 255, 0.8);
}

.nav-link.active .nav-link-icon {
  color: #00eeff;
}

.nav-link-text {
  font-weight: 500;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
}

.nav-link:hover .nav-link-text {
  color: rgba(0, 238, 255, 0.9);
}

.nav-link.active .nav-link-text {
  color: #00eeff;
}



/* 内容区域 */
.content {
  flex: 1;
  padding: 24px;
  background: transparent;
  transition: all 0.3s ease;
}

.content.with-sidebar {
  margin-left: 0;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .header-left {
    gap: 20px;
  }
  
  .logo-text {
    display: none;
  }
  
  .main-nav {
    display: none;
  }
  
  .sidebar {
    position: fixed;
    left: -240px;
    top: 70px;
    height: calc(100vh - 70px);
    z-index: 999;
  }
  
  .sidebar.show {
    left: 0;
  }
  
  .content {
    padding: 16px;
  }
}
</style> 