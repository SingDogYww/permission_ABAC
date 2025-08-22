import { http } from '@/utils/request'
import type { 
  UserGroup, 
  GroupCreateRequest, 
  GroupUpdateRequest, 
  GroupSearchParams,
  UserGroupMember,
  GroupMemberRequest,
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

  // 更新用户组状态
  updateGroupStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<void>> {
    return http.put(`/api/groups/${id}/status`, { status })
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
  addGroupMember(groupId: string, memberData: GroupMemberRequest): Promise<ApiResponse<void>> {
    return http.post(`/api/groups/${groupId}/members`, memberData)
  },

  // 移除组成员
  removeGroupMember(groupId: string, userId: string): Promise<ApiResponse<void>> {
    return http.delete(`/api/groups/${groupId}/members/${userId}`)
  },

  // 更新成员权限
  updateGroupMember(groupId: string, userId: string, memberData: GroupMemberRequest): Promise<ApiResponse<void>> {
    return http.put(`/api/groups/${groupId}/members/${userId}`, memberData)
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
    {
      id: '8',
      name: '前端开发组',
      code: 'FRONTEND_GROUP',
      type: 'function' as const,
      parentId: '3',
      level: 3,
      path: '/tech/dev/frontend',
      description: '前端开发团队',
      attributes: { 
        technology: 'frontend',
        frameworks: ['vue', 'react', 'angular'],
        teamLead: 'zhangsan'
      },
      status: 'active' as const,
      memberCount: 5,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '9',
      name: '后端开发组',
      code: 'BACKEND_GROUP',
      type: 'function' as const,
      parentId: '3',
      level: 3,
      path: '/tech/dev/backend',
      description: '后端开发团队',
      attributes: { 
        technology: 'backend',
        languages: ['java', 'python', 'go'],
        teamLead: 'lisi'
      },
      status: 'active' as const,
      memberCount: 6,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '10',
      name: 'UI/UX设计组',
      code: 'DESIGN_GROUP',
      type: 'function' as const,
      parentId: '5',
      level: 2,
      path: '/product/design',
      description: 'UI/UX设计团队',
      attributes: { 
        specialty: 'design',
        tools: ['figma', 'sketch', 'adobe'],
        focus: 'user-experience'
      },
      status: 'active' as const,
      memberCount: 4,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '11',
      name: '产品经理组',
      code: 'PM_GROUP',
      type: 'function' as const,
      parentId: '5',
      level: 2,
      path: '/product/pm',
      description: '产品经理团队',
      attributes: { 
        responsibility: 'product-management',
        methodology: 'agile',
        tools: ['jira', 'confluence', 'axure']
      },
      status: 'active' as const,
      memberCount: 3,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '12',
      name: '市场部',
      code: 'MARKETING_DEPT',
      type: 'department' as const,
      parentId: undefined,
      level: 1,
      path: '/marketing',
      description: '市场营销部门',
      attributes: { 
        department: 'marketing',
        budget: '500000',
        channels: ['digital', 'traditional', 'social-media']
      },
      status: 'active' as const,
      memberCount: 8,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '13',
      name: '销售部',
      code: 'SALES_DEPT',
      type: 'department' as const,
      parentId: undefined,
      level: 1,
      path: '/sales',
      description: '销售部门',
      attributes: { 
        department: 'sales',
        target: '10000000',
        region: 'nationwide'
      },
      status: 'active' as const,
      memberCount: 12,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '14',
      name: '人力资源部',
      code: 'HR_DEPT',
      type: 'department' as const,
      parentId: undefined,
      level: 1,
      path: '/hr',
      description: '人力资源部门',
      attributes: { 
        department: 'human-resources',
        employees: '150',
        recruitment: 'active'
      },
      status: 'active' as const,
      memberCount: 5,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '15',
      name: '财务部',
      code: 'FINANCE_DEPT',
      type: 'department' as const,
      parentId: undefined,
      level: 1,
      path: '/finance',
      description: '财务部门',
      attributes: { 
        department: 'finance',
        budget: 'enterprise',
        compliance: 'sox'
      },
      status: 'active' as const,
      memberCount: 6,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '16',
      name: '项目Beta组',
      code: 'PROJECT_BETA',
      type: 'project' as const,
      parentId: '6',
      level: 2,
      path: '/projects/alpha/beta',
      description: '项目Beta子模块开发组',
      attributes: { 
        projectType: 'mobile-app',
        platform: 'ios-android',
        deadline: '2024-05-31',
        priority: 'medium'
      },
      status: 'active' as const,
      memberCount: 6,
      createTime: '2024-01-15T00:00:00Z',
      updateTime: '2024-01-15T00:00:00Z',
      deleted: false,
    },
    {
      id: '17',
      name: '质量保证组',
      code: 'QA_GROUP',
      type: 'function' as const,
      parentId: '4',
      level: 3,
      path: '/tech/test/qa',
      description: '质量保证团队',
      attributes: { 
        responsibility: 'quality-assurance',
        certification: 'iso9001',
        processes: ['code-review', 'testing', 'documentation']
      },
      status: 'active' as const,
      memberCount: 3,
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z',
      deleted: false,
    },
    {
      id: '18',
      name: '安全组',
      code: 'SECURITY_GROUP',
      type: 'security' as const,
      parentId: '2',
      level: 2,
      path: '/tech/security',
      description: '信息安全团队',
      attributes: { 
        responsibility: 'cybersecurity',
        certifications: ['cissp', 'cisa'],
        tools: ['sonarqube', 'nessus', 'wireshark']
      },
      status: 'active' as const,
      memberCount: 4,
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
      id: '27',
      userId: '2',
      groupId: '1',
      memberType: 'ADMIN' as const,
      joinTime: '2024-01-01T08:00:00Z',
      createTime: '2024-01-01T08:00:00Z',
    },
    {
      id: '28',
      userId: '3',
      groupId: '1',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-02T09:00:00Z',
      createTime: '2024-01-02T09:00:00Z',
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
    {
      id: '6',
      userId: '5',
      groupId: '7',
      memberType: 'ADMIN' as const,
      joinTime: '2024-01-05T00:00:00Z',
      createTime: '2024-01-05T00:00:00Z',
    },
    {
      id: '7',
      userId: '6',
      groupId: '8',
      memberType: 'ADMIN' as const,
      joinTime: '2024-01-06T00:00:00Z',
      createTime: '2024-01-06T00:00:00Z',
    },
    {
      id: '8',
      userId: '7',
      groupId: '9',
      memberType: 'ADMIN' as const,
      joinTime: '2024-01-07T00:00:00Z',
      createTime: '2024-01-07T00:00:00Z',
    },
    {
      id: '9',
      userId: '8',
      groupId: '10',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-08T00:00:00Z',
      createTime: '2024-01-08T00:00:00Z',
    },
    {
      id: '10',
      userId: '9',
      groupId: '11',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-09T00:00:00Z',
      createTime: '2024-01-09T00:00:00Z',
    },
    {
      id: '11',
      userId: '10',
      groupId: '12',
      memberType: 'ADMIN' as const,
      joinTime: '2024-01-10T00:00:00Z',
      createTime: '2024-01-10T00:00:00Z',
    },
    {
      id: '12',
      userId: '11',
      groupId: '13',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-11T00:00:00Z',
      createTime: '2024-01-11T00:00:00Z',
    },
    {
      id: '13',
      userId: '12',
      groupId: '14',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-12T00:00:00Z',
      createTime: '2024-01-12T00:00:00Z',
    },
    {
      id: '14',
      userId: '13',
      groupId: '15',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-13T00:00:00Z',
      createTime: '2024-01-13T00:00:00Z',
    },
    {
      id: '15',
      userId: '14',
      groupId: '6',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-14T00:00:00Z',
      createTime: '2024-01-14T00:00:00Z',
    },
    {
      id: '16',
      userId: '14',
      groupId: '16',
      memberType: 'ADMIN' as const,
      joinTime: '2024-01-14T00:00:00Z',
      createTime: '2024-01-14T00:00:00Z',
    },
    {
      id: '17',
      userId: '15',
      groupId: '18',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-15T00:00:00Z',
      createTime: '2024-01-15T00:00:00Z',
    },
    {
      id: '18',
      userId: '16',
      groupId: '17',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-16T00:00:00Z',
      createTime: '2024-01-16T00:00:00Z',
    },
    {
      id: '19',
      userId: '17',
      groupId: '8',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-17T00:00:00Z',
      createTime: '2024-01-17T00:00:00Z',
    },
    {
      id: '20',
      userId: '17',
      groupId: '6',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-17T00:00:00Z',
      createTime: '2024-01-17T00:00:00Z',
    },
    {
      id: '21',
      userId: '18',
      groupId: '9',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-18T00:00:00Z',
      createTime: '2024-01-18T00:00:00Z',
    },
    {
      id: '22',
      userId: '18',
      groupId: '7',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-18T00:00:00Z',
      createTime: '2024-01-18T00:00:00Z',
    },
    {
      id: '23',
      userId: '19',
      groupId: '10',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-19T00:00:00Z',
      createTime: '2024-01-19T00:00:00Z',
    },
    {
      id: '24',
      userId: '19',
      groupId: '5',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-19T00:00:00Z',
      createTime: '2024-01-19T00:00:00Z',
    },
    {
      id: '25',
      userId: '20',
      groupId: '12',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-20T00:00:00Z',
      createTime: '2024-01-20T00:00:00Z',
    },
    {
      id: '26',
      userId: '20',
      groupId: '13',
      memberType: 'MEMBER' as const,
      joinTime: '2024-01-20T00:00:00Z',
      createTime: '2024-01-20T00:00:00Z',
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
        .filter(group => {
          // 处理parentId为undefined的情况，将其视为根节点
          const groupParentId = group.parentId === undefined ? null : group.parentId
          const targetParentId = parentId === undefined ? null : parentId
          return groupParentId === targetParentId
        })
        .map(group => ({
          ...group,
          children: buildTree(groups, group.id)
        }))
    }
    
    const tree = buildTree(this.mockGroups, undefined)
    
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

  // 模拟更新用户组状态
  async updateGroupStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const group = this.mockGroups.find(g => g.id === id)
    if (!group) {
      throw new Error('用户组不存在')
    }
    
    group.status = status
    group.updateTime = new Date().toISOString()
    
    return {
      code: 200,
      message: '状态更新成功',
      success: true,
      data: undefined,
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
    
    // 导入用户API以获取用户详细信息
    const { mockUserApi } = await import('./user')
    
    const members = this.mockMembers.filter(m => m.groupId === groupId)
    
    // 为每个成员添加用户详细信息
    const membersWithUserInfo = members.map(member => {
      const user = mockUserApi.mockUsers.find(u => u.id === member.userId)
      return {
        ...member,
        user: user || {
          id: member.userId,
          username: `user_${member.userId}`,
          nickname: `用户${member.userId}`,
          email: `user${member.userId}@example.com`,
          phone: `1380013800${member.userId}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${member.userId}`,
          status: 'active' as const,
          userGroups: [],
          createTime: '2024-01-01T00:00:00Z',
          updateTime: '2024-01-01T00:00:00Z',
          deleted: false,
        }
      }
    })
    
    return {
      code: 200,
      message: '获取成功',
      success: true,
      data: membersWithUserInfo,
    }
  },

  // 模拟添加组成员
  async addGroupMember(groupId: string, memberData: GroupMemberRequest): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // 检查成员是否已存在
    const existingMember = this.mockMembers.find(m => m.groupId === groupId && m.userId === memberData.userId)
    if (existingMember) {
      throw new Error('用户已是该组成员')
    }
    
    const newMember: UserGroupMember = {
      id: String(Date.now()),
      userId: memberData.userId,
      groupId,
      memberType: memberData.memberType,
      joinTime: new Date().toISOString(),
      expireTime: memberData.expireTime,
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

  // 模拟更新组成员
  async updateGroupMember(groupId: string, userId: string, memberData: GroupMemberRequest): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const member = this.mockMembers.find(m => m.groupId === groupId && m.userId === userId)
    if (!member) {
      throw new Error('成员不存在')
    }
    
    member.memberType = memberData.memberType
    if (memberData.expireTime !== undefined) {
      member.expireTime = memberData.expireTime
    }
    
    return {
      code: 200,
      message: '成员信息更新成功',
      success: true,
      data: undefined,
    }
  },
} 