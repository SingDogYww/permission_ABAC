import { http } from '@/utils/request'
import type { 
  UserGroup, 
  GroupCreateRequest, 
  GroupUpdateRequest, 
  GroupSearchParams,
  UserGroupMember,
  ApiResponse,
  PaginationResponse 
} from '@/types'

// 用户组管理API服务
export const groupApi = {
  // 获取用户组列表
  getGroups(params?: GroupSearchParams): Promise<ApiResponse<PaginationResponse<UserGroup>>> {
    return http.get('/api/groups', { params })
  },

  // 获取用户组树形结构
  getGroupTree(): Promise<ApiResponse<UserGroup[]>> {
    return http.get('/api/groups/tree')
  },

  // 获取用户组详情
  getGroupById(id: string): Promise<ApiResponse<UserGroup>> {
    return http.get(`/api/groups/${id}`)
  },

  // 创建用户组
  createGroup(data: GroupCreateRequest): Promise<ApiResponse<UserGroup>> {
    return http.post('/api/groups', data)
  },

  // 更新用户组
  updateGroup(data: GroupUpdateRequest): Promise<ApiResponse<UserGroup>> {
    return http.put(`/api/groups/${data.id}`, data)
  },

  // 删除用户组
  deleteGroup(id: string): Promise<ApiResponse<void>> {
    return http.delete(`/api/groups/${id}`)
  },

  // 获取组成员列表
  getGroupMembers(groupId: string): Promise<ApiResponse<UserGroupMember[]>> {
    return http.get(`/api/groups/${groupId}/members`)
  },

  // 添加组成员
  addGroupMember(groupId: string, userId: string, memberType: 'MEMBER' | 'ADMIN' | 'OWNER'): Promise<ApiResponse<void>> {
    return http.post(`/api/groups/${groupId}/members`, { userId, memberType })
  },

  // 移除组成员
  removeGroupMember(groupId: string, userId: string): Promise<ApiResponse<void>> {
    return http.delete(`/api/groups/${groupId}/members/${userId}`)
  },

  // 更新成员权限
  updateMemberPermission(groupId: string, userId: string, memberType: 'MEMBER' | 'ADMIN' | 'OWNER'): Promise<ApiResponse<void>> {
    return http.put(`/api/groups/${groupId}/members/${userId}`, { memberType })
  },
}

// 模拟用户组API（用于开发阶段）
export const mockGroupApi = {
  // 模拟用户组数据
  mockGroups: [
    {
      id: '1',
      name: '管理员组',
      code: 'ADMIN_GROUP',
      type: 'security' as const,
      parentId: undefined,
      level: 1,
      path: '/admin',
      description: '系统管理员组，拥有最高权限',
      attributes: { priority: 'high', securityLevel: 5 },
      status: 'active' as const,
      memberCount: 2,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '2',
      name: '技术部',
      code: 'TECH_DEPT',
      type: 'department' as const,
      parentId: undefined,
      level: 1,
      path: '/tech',
      description: '技术部门，负责系统开发和维护',
      attributes: { department: 'technology', budget: '1000000' },
      status: 'active' as const,
      memberCount: 15,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '3',
      name: '开发组',
      code: 'DEV_GROUP',
      type: 'function' as const,
      parentId: '2',
      level: 2,
      path: '/tech/dev',
      description: '软件开发小组',
      attributes: { technology: 'full-stack', teamSize: 8 },
      status: 'active' as const,
      memberCount: 8,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '4',
      name: '测试组',
      code: 'TEST_GROUP',
      type: 'function' as const,
      parentId: '2',
      level: 2,
      path: '/tech/test',
      description: '软件测试小组',
      attributes: { testType: 'automated', tools: ['selenium', 'jest'] },
      status: 'active' as const,
      memberCount: 4,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '5',
      name: '产品部',
      code: 'PRODUCT_DEPT',
      type: 'department' as const,
      parentId: undefined,
      level: 1,
      path: '/product',
      description: '产品部门，负责产品设计和规划',
      attributes: { department: 'product', focus: 'user-experience' },
      status: 'active' as const,
      memberCount: 6,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '6',
      name: '项目Alpha组',
      code: 'PROJECT_ALPHA',
      type: 'project' as const,
      parentId: undefined,
      level: 1,
      path: '/projects/alpha',
      description: '项目Alpha开发组',
      attributes: { 
        projectType: 'web-app', 
        deadline: '2024-06-30',
        priority: 'high'
      },
      status: 'active' as const,
      memberCount: 12,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '7',
      name: '运维组',
      code: 'OPS_GROUP',
      type: 'function' as const,
      parentId: '2',
      level: 2,
      path: '/tech/ops',
      description: '系统运维组',
      attributes: { 
        responsibility: 'infrastructure',
        oncall: true,
        tools: ['kubernetes', 'docker', 'prometheus']
      },
      status: 'active' as const,
      memberCount: 3,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
  ] as UserGroup[],

  // 模拟组成员数据
  mockMembers: [
    {
      id: '1',
      userId: '1',
      groupId: '1',
      memberType: 'OWNER' as const,
      joinTime: '2024-01-01T00:00:00Z',
      createTime: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      userId: '2',
      groupId: '2',
      memberType: 'ADMIN' as const,
      joinTime: '2024-01-02T00:00:00Z',
      createTime: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      userId: '2',
      groupId: '3',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-02T00:00:00Z',
      createTime: '2024-01-02T00:00:00Z',
    },
    {
      id: '4',
      userId: '4',
      groupId: '3',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-04T00:00:00Z',
      createTime: '2024-01-04T00:00:00Z',
    },
    {
      id: '5',
      userId: '4',
      groupId: '4',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-04T00:00:00Z',
      createTime: '2024-01-04T00:00:00Z',
    },
  ] as UserGroupMember[],

  // 模拟获取用户组列表
  async getGroups(params?: GroupSearchParams): Promise<ApiResponse<PaginationResponse<UserGroup>>> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    let filteredGroups = [...this.mockGroups]
    
    // 关键词搜索
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredGroups = filteredGroups.filter(group => 
        group.name.toLowerCase().includes(keyword) ||
        group.code.toLowerCase().includes(keyword) ||
        group.description?.toLowerCase().includes(keyword)
      )
    }
    
    // 状态过滤
    if (params?.status) {
      filteredGroups = filteredGroups.filter(group => group.status === params.status)
    }
    
    // 类型过滤
    if (params?.type) {
      filteredGroups = filteredGroups.filter(group => group.type === params.type)
    }
    
    // 父组过滤
    if (params?.parentId !== undefined) {
      filteredGroups = filteredGroups.filter(group => group.parentId === params.parentId)
    }
    
    // 层级过滤
    if (params?.level) {
      filteredGroups = filteredGroups.filter(group => group.level === params.level)
    }
    
    // 分页
    const current = params?.current || 1
    const pageSize = params?.pageSize || 10
    const start = (current - 1) * pageSize
    const end = start + pageSize
    const paginatedGroups = filteredGroups.slice(start, end)
    
    return {
      code: 200,
      message: '获取成功',
      success: true,
      data: {
        list: paginatedGroups,
        total: filteredGroups.length,
        current,
        pageSize,
      },
    }
  },

  // 模拟获取用户组树形结构
  async getGroupTree(): Promise<ApiResponse<UserGroup[]>> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 构建树形结构
    const buildTree = (groups: UserGroup[], parentId?: string): UserGroup[] => {
      return groups
        .filter(group => group.parentId === parentId)
        .map(group => ({
          ...group,
          children: buildTree(groups, group.id)
        }))
    }
    
    const tree = buildTree(this.mockGroups)
    
    return {
      code: 200,
      message: '获取成功',
      success: true,
      data: tree,
    }
  },

  // 模拟获取用户组详情
  async getGroupById(id: string): Promise<ApiResponse<UserGroup>> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const group = this.mockGroups.find(g => g.id === id)
    if (!group) {
      throw new Error('用户组不存在')
    }
    
    return {
      code: 200,
      message: '获取成功',
      success: true,
      data: group,
    }
  },

  // 模拟创建用户组
  async createGroup(data: GroupCreateRequest): Promise<ApiResponse<UserGroup>> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 检查组编码是否已存在
    if (this.mockGroups.some(g => g.code === data.code)) {
      throw new Error('组编码已存在')
    }
    
    // 计算层级和路径
    let level = 1
    let path = `/${data.code.toLowerCase()}`
    
    if (data.parentId) {
      const parent = this.mockGroups.find(g => g.id === data.parentId)
      if (parent) {
        level = parent.level + 1
        path = `${parent.path}/${data.code.toLowerCase()}`
      }
    }
    
    const newGroup: UserGroup = {
      id: String(Date.now()),
      name: data.name,
      code: data.code,
      type: data.type,
      parentId: data.parentId,
      level,
      path,
      description: data.description,
      attributes: data.attributes,
      status: data.status || 'active',
      memberCount: 0,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      deleted: false,
    }
    
    this.mockGroups.push(newGroup)
    
    return {
      code: 200,
      message: '创建成功',
      success: true,
      data: newGroup,
    }
  },

  // 模拟更新用户组
  async updateGroup(data: GroupUpdateRequest): Promise<ApiResponse<UserGroup>> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const index = this.mockGroups.findIndex(g => g.id === data.id)
    if (index === -1) {
      throw new Error('用户组不存在')
    }
    
    // 检查组编码是否已被其他组使用
    if (data.code && this.mockGroups.some(g => g.code === data.code && g.id !== data.id)) {
      throw new Error('组编码已存在')
    }
    
    const updatedGroup = {
      ...this.mockGroups[index],
      ...data,
      updateTime: new Date().toISOString(),
    }
    
    this.mockGroups[index] = updatedGroup
    
    return {
      code: 200,
      message: '更新成功',
      success: true,
      data: updatedGroup,
    }
  },

  // 模拟删除用户组
  async deleteGroup(id: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const group = this.mockGroups.find(g => g.id === id)
    if (!group) {
      throw new Error('用户组不存在')
    }
    
    // 检查是否有子组
    const hasChildren = this.mockGroups.some(g => g.parentId === id)
    if (hasChildren) {
      throw new Error('该组下还有子组，无法删除')
    }
    
    // 检查是否有成员
    const hasMembers = this.mockMembers.some(m => m.groupId === id)
    if (hasMembers) {
      throw new Error('该组下还有成员，无法删除')
    }
    
    const index = this.mockGroups.findIndex(g => g.id === id)
    this.mockGroups.splice(index, 1)
    
    return {
      code: 200,
      message: '删除成功',
      success: true,
      data: undefined,
    }
  },

  // 模拟获取组成员列表
  async getGroupMembers(groupId: string): Promise<ApiResponse<UserGroupMember[]>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const members = this.mockMembers.filter(m => m.groupId === groupId)
    
    return {
      code: 200,
      message: '获取成功',
      success: true,
      data: members,
    }
  },

  // 模拟添加组成员
  async addGroupMember(groupId: string, userId: string, memberType: 'MEMBER' | 'ADMIN' | 'OWNER'): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // 检查成员是否已存在
    const existingMember = this.mockMembers.find(m => m.groupId === groupId && m.userId === userId)
    if (existingMember) {
      throw new Error('用户已是该组成员')
    }
    
    const newMember: UserGroupMember = {
      id: String(Date.now()),
      userId,
      groupId,
      memberType,
      joinTime: new Date().toISOString(),
      createTime: new Date().toISOString(),
    }
    
    this.mockMembers.push(newMember)
    
    // 更新组成员数量
    const group = this.mockGroups.find(g => g.id === groupId)
    if (group) {
      group.memberCount++
    }
    
    return {
      code: 200,
      message: '添加成员成功',
      success: true,
      data: undefined,
    }
  },

  // 模拟移除组成员
  async removeGroupMember(groupId: string, userId: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const memberIndex = this.mockMembers.findIndex(m => m.groupId === groupId && m.userId === userId)
    if (memberIndex === -1) {
      throw new Error('成员不存在')
    }
    
    this.mockMembers.splice(memberIndex, 1)
    
    // 更新组成员数量
    const group = this.mockGroups.find(g => g.id === groupId)
    if (group) {
      group.memberCount = Math.max(0, group.memberCount - 1)
    }
    
    return {
      code: 200,
      message: '移除成员成功',
      success: true,
      data: undefined,
    }
  },

  // 模拟更新成员权限
  async updateMemberPermission(groupId: string, userId: string, memberType: 'MEMBER' | 'ADMIN' | 'OWNER'): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const member = this.mockMembers.find(m => m.groupId === groupId && m.userId === userId)
    if (!member) {
      throw new Error('成员不存在')
    }
    
    member.memberType = memberType
    
    return {
      code: 200,
      message: '权限更新成功',
      success: true,
      data: undefined,
    }
  },
} 