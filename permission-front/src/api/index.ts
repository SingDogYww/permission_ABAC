// 认证相关API
import { authApi, mockAuthApi } from './auth'
export { authApi, mockAuthApi }

// 用户管理API
import { userApi, mockUserApi } from './user'
export { userApi, mockUserApi }

// 用户组管理API
import { groupApi, mockGroupApi } from './group'
export { groupApi, mockGroupApi }

// 根据环境变量决定使用真实API还是模拟API
const useMockApi = 'true'

// 如果是开发环境并且配置了使用模拟API，则使用模拟API
const shouldUseMockApi = useMockApi

// 导出当前环境下使用的API
export const api = {
  // 认证API
  auth: shouldUseMockApi ? mockAuthApi : authApi,

  // 用户管理API
  user: shouldUseMockApi ? mockUserApi : userApi,

  // 用户组管理API
  group: shouldUseMockApi ? mockGroupApi : groupApi,
}

// 默认导出
export default api

// 类型导出
export type * from '@/types'
