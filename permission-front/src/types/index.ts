// 通用响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 分页响应类型
export interface PaginationResponse<T> {
  list: T[]
  total: number
  current: number
  pageSize: number
}

// 用户类型定义
export interface User {
  id: string
  username: string
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
  status: 'active' | 'inactive'
  userGroups: string[]
  lastLogin?: string
  createTime: string
  updateTime: string
  deleted: boolean
}

// 用户组类型定义
export interface UserGroup {
  id: string
  name: string
  code: string
  type: 'department' | 'project' | 'function' | 'security' | 'custom'
  parentId?: string
  level: number
  path?: string
  description?: string
  attributes?: Record<string, any>
  status: 'active' | 'inactive'
  memberCount: number
  createTime: string
  updateTime: string
  deleted: boolean
}

// 用户组成员类型定义
export interface UserGroupMember {
  id: string
  userId: string
  groupId: string
  memberType: 'MEMBER' | 'ADMIN' | 'OWNER'
  joinTime: string
  expireTime?: string
  createTime: string
  user?: User // 关联的用户信息
}

// 用户组成员类型定义（别名，用于向后兼容）
export type GroupMember = UserGroupMember

// 用户组成员请求参数
export interface GroupMemberRequest {
  userId: string
  memberType: 'MEMBER' | 'ADMIN' | 'OWNER'
  expireTime?: string
}

// ABAC策略相关类型定义

// 策略目标定义
export interface PolicyTarget {
  subjects: Array<{ type: string; value: string }>
  resources: Array<{ type: string; value: string }>
  actions: Array<{ type: string; value: string }>
}

// 条件定义
export interface ConditionItem {
  attribute: string
  operator: 'equals' | 'not-equals' | 'in' | 'not-in' | 'greater-than' | 'less-than' | 'between' | 'contains' | 'starts-with' | 'ends-with'
  value: any
}

export interface SubjectCondition extends ConditionItem {}
export interface ResourceCondition extends ConditionItem {}
export interface ActionCondition extends ConditionItem {}
export interface EnvironmentCondition extends ConditionItem {}

// 策略规则定义
export interface PolicyRule {
  id: string
  effect: 'permit' | 'deny'
  conditions: {
    subject?: SubjectCondition[]
    resource?: ResourceCondition[]
    action?: ActionCondition[]
    environment?: EnvironmentCondition[]
  }
}

// 策略定义 - 更新为ABAC策略格式
export interface Policy {
  id: number
  name: string
  description?: string
  subjectAttributes: Record<string, any>
  objectAttributes: Record<string, any>
  actionAttributes: Record<string, any>
  environmentAttributes: Record<string, any>
  effect: 'PERMIT' | 'DENY'
  priority: number
  status: number // 1-启用，0-禁用
  createTime: string
  updateTime: string
}

// 策略搜索参数
export interface PolicySearchParams extends SearchParams {
  version?: string
  priority?: number
}

// 权限评估请求
export interface PermissionEvaluationRequest {
  userId: string
  subject: {
    attributes: Record<string, any>
  }
  resource: {
    id: string
    attributes: Record<string, any>
  }
  action: {
    type: string
    attributes: Record<string, any>
  }
  environment: {
    ipAddress?: string
    userAgent?: string
    location?: string
    timestamp?: string
  }
  resourceId: string
  actionType: string
}

// 权限评估结果
export interface PermissionEvaluationResult {
  decision: 'PERMIT' | 'DENY' | 'INDETERMINATE'
  reason: string
  appliedPolicies: Array<{
    policyId: string
    policyName: string
    effect: 'PERMIT' | 'DENY'
  }>
  evaluationTime: number
  obligations?: string[]
  advice?: string[]
}

// 资源类型定义
export interface Resource {
  id: string
  name: string
  type: 'module' | 'document' | 'api' | 'data' | 'file'
  path?: string
  description?: string
  attributes: Record<string, any>
  actions: string[]
  createdAt: string
  updatedAt: string
}

// 资源搜索参数
export interface ResourceSearchParams extends SearchParams {
  type?: string
  path?: string
}

// 搜索和分页参数类型
export interface SearchParams {
  keyword?: string
  status?: string
  type?: string
  current?: number
  pageSize?: number
}

// 用户搜索参数
export interface UserSearchParams extends SearchParams {
  groupId?: string
  role?: string
}

// 用户组搜索参数
export interface GroupSearchParams extends SearchParams {
  parentId?: string
  level?: number
}

// 登录请求参数
export interface LoginRequest {
  username: string
  password: string
  captcha?: string
  rememberMe?: boolean
}

// 登录响应数据
export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
  expiresIn: number
}

// 注册请求参数
export interface RegisterRequest {
  username: string
  password: string
  email?: string
  phone?: string
  captcha: string
}

// 用户创建/更新请求参数
export interface UserCreateRequest {
  username: string
  password?: string
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
  status?: 'active' | 'inactive'
  userGroups?: string[]
}

export interface UserUpdateRequest extends Partial<UserCreateRequest> {
  id: string
}

// 用户组创建/更新请求参数
export interface GroupCreateRequest {
  name: string
  code: string
  type: 'department' | 'project' | 'function' | 'security' | 'custom'
  parentId?: string
  description?: string
  attributes?: Record<string, any>
  status?: 'active' | 'inactive'
}

export interface GroupUpdateRequest extends Partial<GroupCreateRequest> {
  id: string
}

// 错误响应类型
export interface ErrorResponse {
  code: number
  message: string
  details?: string
  timestamp: string
} 