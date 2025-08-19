import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    // 主控制台
    {
      path: '/dashboard',
      component: () => import('../components/Layout/MainLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/dashboard/overview'
        },
        {
          path: 'overview',
          name: 'dashboard-overview',
          component: () => import('../views/dashboard/OverviewView.vue'),
          meta: {
            title: '数据概览',
            requiresAuth: true
          }
        },
        {
          path: 'trends',
          name: 'dashboard-trends',
          component: () => import('../views/dashboard/TrendsView.vue'),
          meta: {
            title: '趋势分析',
            requiresAuth: true
          }
        },
        {
          path: 'shortcuts',
          name: 'dashboard-shortcuts',
          component: () => import('../views/dashboard/ShortcutsView.vue'),
          meta: {
            title: '常用功能',
            requiresAuth: true
          }
        }
      ]
    },
    // 权限管理模块
    {
      path: '/permission',
      component: () => import('../components/Layout/MainLayout.vue'),
      children: [
        // 用户管理
        {
          path: 'users',
          name: 'permission-users',
          component: () => import('../views/permission/UsersView.vue'),
          meta: {
            title: '用户列表',
            requiresAuth: true
          }
        },
        {
          path: 'groups',
          name: 'permission-groups',
          component: () => import('../views/Group.vue'),
          meta: {
            title: '用户组管理',
            requiresAuth: true
          }
        },
        // 权限控制
        {
          path: 'policies',
          name: 'permission-policies',
          component: () => import('../views/permission/PoliciesView.vue'),
          meta: {
            title: '权限策略',
            requiresAuth: true
          }
        },
        {
          path: 'resources',
          name: 'permission-resources',
          component: () => import('../views/permission/ResourcesView.vue'),
          meta: {
            title: '资源管理',
            requiresAuth: true
          }
        },
        {
          path: 'matrix',
          name: 'permission-matrix',
          component: () => import('../views/permission/MatrixView.vue'),
          meta: {
            title: '权限矩阵',
            requiresAuth: true
          }
        },
        // 安全审计
        {
          path: 'audit',
          name: 'permission-audit',
          component: () => import('../views/permission/AuditView.vue'),
          meta: {
            title: '操作日志',
            requiresAuth: true
          }
        },
        {
          path: 'login-logs',
          name: 'permission-login-logs',
          component: () => import('../views/permission/LoginLogsView.vue'),
          meta: {
            title: '登录日志',
            requiresAuth: true
          }
        },
        {
          path: 'security',
          name: 'permission-security',
          component: () => import('../views/permission/SecurityView.vue'),
          meta: {
            title: '安全监控',
            requiresAuth: true
          }
        }
      ]
    },
    // 系统管理模块
    {
      path: '/system',
      component: () => import('../components/Layout/MainLayout.vue'),
      children: [
        // 系统配置
        {
          path: 'settings',
          name: 'system-settings',
          component: () => import('../views/system/SettingsView.vue'),
          meta: {
            title: '系统设置',
            requiresAuth: true
          }
        },
        {
          path: 'params',
          name: 'system-params',
          component: () => import('../views/system/ParamsView.vue'),
          meta: {
            title: '参数配置',
            requiresAuth: true
          }
        },
        {
          path: 'dict',
          name: 'system-dict',
          component: () => import('../views/system/DictView.vue'),
          meta: {
            title: '数据字典',
            requiresAuth: true
          }
        },
        // 系统监控
        {
          path: 'monitor',
          name: 'system-monitor',
          component: () => import('../views/system/MonitorView.vue'),
          meta: {
            title: '性能监控',
            requiresAuth: true
          }
        },
        {
          path: 'logs',
          name: 'system-logs',
          component: () => import('../views/system/LogsView.vue'),
          meta: {
            title: '系统日志',
            requiresAuth: true
          }
        },
        {
          path: 'health',
          name: 'system-health',
          component: () => import('../views/system/HealthView.vue'),
          meta: {
            title: '健康检查',
            requiresAuth: true
          }
        },
        // 数据管理
        {
          path: 'backup',
          name: 'system-backup',
          component: () => import('../views/system/BackupView.vue'),
          meta: {
            title: '数据备份',
            requiresAuth: true
          }
        },
        {
          path: 'import',
          name: 'system-import',
          component: () => import('../views/system/ImportView.vue'),
          meta: {
            title: '数据导入',
            requiresAuth: true
          }
        },
        {
          path: 'export',
          name: 'system-export',
          component: () => import('../views/system/ExportView.vue'),
          meta: {
            title: '数据导出',
            requiresAuth: true
          }
        },
        // 安全审计
        {
          path: 'audit',
          name: 'system-audit',
          component: () => import('../views/system/AuditView.vue'),
          meta: {
            title: '操作日志',
            requiresAuth: true
          }
        },
        {
          path: 'login-logs',
          name: 'system-login-logs',
          component: () => import('../views/system/LoginLogsView.vue'),
          meta: {
            title: '登录日志',
            requiresAuth: true
          }
        },
        {
          path: 'security',
          name: 'system-security',
          component: () => import('../views/system/SecurityView.vue'),
          meta: {
            title: '安全监控',
            requiresAuth: true
          }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // TODO: 检查用户认证状态
    // const token = localStorage.getItem('token')
    // if (!token) {
    //   next('/login')
    //   return
    // }
  }
  next()
})

export default router
