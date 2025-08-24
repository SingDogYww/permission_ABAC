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
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue'),
      meta: {
        title: '权限测试',
        requiresAuth: true
      }
    },
    {
      path: '/test-editor',
      name: 'test-editor',
      component: () => import('../views/TestAdvancedEditor.vue'),
      meta: {
        title: '高级编辑器测试',
        requiresAuth: false
      }
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
          path: 'monitor',
          name: 'dashboard-monitor',
          component: () => import('../views/dashboard/MonitorView.vue'),
          meta: {
            title: '系统监控',
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
        },
        {
          path: 'analytics',
          name: 'dashboard-analytics',
          component: () => import('../views/dashboard/AnalyticsView.vue'),
          meta: {
            title: '权限分析',
            requiresAuth: true
          }
        },
        {
          path: 'alerts',
          name: 'dashboard-alerts',
          component: () => import('../views/dashboard/AlertsView.vue'),
          meta: {
            title: '安全告警',
            requiresAuth: true
          }
        },
        {
          path: 'trends',
          name: 'dashboard-trends',
          component: () => import('../views/dashboard/TrendsView.vue'),
          meta: {
            title: '访问趋势',
            requiresAuth: true
          }
        },
        {
          path: 'workspace',
          name: 'dashboard-workspace',
          component: () => import('../views/dashboard/WorkspaceView.vue'),
          meta: {
            title: '工作台',
            requiresAuth: true
          }
        },
        {
          path: 'health',
          name: 'dashboard-health',
          component: () => import('../views/dashboard/HealthView.vue'),
          meta: {
            title: '系统健康检查',
            requiresAuth: true
          }
        },
        {
          path: 'compliance',
          name: 'dashboard-compliance',
          component: () => import('../views/dashboard/ComplianceView.vue'),
          meta: {
            title: '合规审计',
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
          path: 'users/:id',
          name: 'permission-user-detail',
          component: () => import('../views/UserDetail.vue'),
          meta: {
            title: '用户详情',
            requiresAuth: true
          },
          props: true
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
        {
          path: 'groups/:id',
          name: 'permission-group-detail',
          component: () => import('../views/GroupDetail.vue'),
          meta: {
            title: '用户组详情',
            requiresAuth: true
          },
          props: true
        },
        // 权限控制
        {
          path: 'attributes',
          name: 'permission-attributes',
          component: () => import('../views/permission/AttributesView.vue'),
          meta: {
            title: '属性管理',
            requiresAuth: true
          }
        },
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
          path: 'policy-test',
          name: 'permission-policy-test',
          component: () => import('../views/permission/PolicyTestView.vue'),
          meta: {
            title: '策略测试',
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
        {
          path: 'api-permissions',
          name: 'permission-api-permissions',
          component: () => import('../views/permission/ApiPermissionsView.vue'),
          meta: {
            title: 'API权限',
            requiresAuth: true
          }
        },
        {
          path: 'data-permissions',
          name: 'permission-data-permissions',
          component: () => import('../views/permission/DataPermissionsView.vue'),
          meta: {
            title: '数据权限',
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
    },
    // 帮助页面
    {
      path: '/help/abac-attributes',
      name: 'abac-attributes-help',
      component: () => import('../views/help/AbacAttributesHelpView.vue'),
      meta: {
        title: 'ABAC属性类型说明'
      }
    },
    // 错误页面
    {
      path: '/403',
      name: 'forbidden',
      component: () => import('../views/error/ForbiddenView.vue'),
      meta: {
        title: '访问被拒绝'
      }
    },
    {
      path: '/404',
      name: 'not-found',
      component: () => import('../views/error/NotFoundView.vue'),
      meta: {
        title: '页面未找到'
      }
    },
    // 捕获所有未匹配的路由
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 动态导入store避免循环依赖
  const { useUserStore } = await import('@/stores/user')
  const userStore = useUserStore()
  
  // 初始化认证状态（从localStorage恢复）
  userStore.initializeAuth()
  
  // 如果是登录或注册页面，且已登录，跳转到dashboard
  if ((to.name === 'login' || to.name === 'register') && userStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  // 需要认证的页面
  if (to.meta.requiresAuth) {
    if (!userStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // 检查权限（如果路由元数据中定义了权限要求）
    if (to.meta.permissions) {
      const permissions = Array.isArray(to.meta.permissions) 
        ? to.meta.permissions 
        : [to.meta.permissions]
      
      const hasPermission = userStore.hasPermission(permissions)
      if (!hasPermission) {
        next('/403')
        return
      }
    }
  }
  
  next()
})

export default router
