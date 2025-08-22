import { http } from '@/utils/request'
import type { 
  User, 
  UserCreateRequest, 
  UserUpdateRequest, 
  UserSearchParams,
  ApiResponse,
  PaginationResponse 
} from '@/types'

// 用户管理API服务
export const userApi = {
  // 获取用户列表
  getUsers(params?: UserSearchParams): Promise<ApiResponse<PaginationResponse<User>>> {
    return http.get('/api/users', { params })
  },

  // 获取用户详情
  getUserById(id: string): Promise<ApiResponse<User>> {
    return http.get(`/api/users/${id}`)
  },

  // 创建用户
  createUser(data: UserCreateRequest): Promise<ApiResponse<User>> {
    return http.post('/api/users', data)
  },

  // 更新用户
  updateUser(data: UserUpdateRequest): Promise<ApiResponse<User>> {
    return http.put(`/api/users/${data.id}`, data)
  },

  // 删除用户
  deleteUser(id: string): Promise<ApiResponse<void>> {
    return http.delete(`/api/users/${id}`)
  },

  // 批量删除用户
  batchDeleteUsers(ids: string[]): Promise<ApiResponse<void>> {
    return http.delete('/api/users/batch', { data: { ids } })
  },

  // 更新用户状态
  updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<void>> {
    return http.put(`/api/users/${id}/status`, { status })
  },

  // 重置用户密码
  resetUserPassword(id: string, newPassword: string): Promise<ApiResponse<void>> {
    return http.put(`/api/users/${id}/password`, { newPassword })
  },

  // 获取用户所属组
  getUserGroups(id: string): Promise<ApiResponse<string[]>> {
    return http.get(`/api/users/${id}/groups`)
  },

  // 更新用户组成员关系
  updateUserGroups(id: string, groupIds: string[]): Promise<ApiResponse<void>> {
    return http.put(`/api/users/${id}/groups`, { groupIds })
  },

  // 导出用户数据
  exportUsers(params?: UserSearchParams): Promise<void> {
    return http.get('/api/users/export', { 
      params,
      responseType: 'blob'
    }).then((response: any) => {
      const blob = new Blob([response])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users_${new Date().getTime()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    })
  },
}

// 模拟用户API（用于开发阶段）
export const mockUserApi = {
  // 模拟用户数据
  mockUsers: [
    {
      id: '1',
      username: 'admin',
      nickname: '系统管理员',
      email: 'admin@example.com',
      phone: '13800138001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      status: 'active' as const,
      userGroups: ['管理员组', '系统管理员'],
      lastLogin: '2024-01-15T10:30:00Z',
      createTime: '2024-01-01T09:00:00Z',
      updateTime: '2024-01-15T10:30:00Z',
      deleted: false,
    },
    {
      id: '2',
      username: 'zhangsan',
      nickname: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138002',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
      status: 'active' as const,
      userGroups: ['技术部', '开发组'],
      lastLogin: '2024-01-14T15:20:00Z',
      createTime: '2024-01-02T10:00:00Z',
      updateTime: '2024-01-14T15:20:00Z',
      deleted: false,
    },
    {
      id: '3',
      username: 'lisi',
      nickname: '李四',
      email: 'lisi@example.com',
      phone: '13800138003',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
      status: 'inactive' as const,
      userGroups: ['产品部', '产品经理组'],
      lastLogin: null,
      createTime: '2024-01-03T11:00:00Z',
      updateTime: '2024-01-10T14:00:00Z',
      deleted: false,
    },
    {
      id: '4',
      username: 'wangwu',
      nickname: '王五',
      email: 'wangwu@example.com',
      phone: '13800138004',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
      status: 'active' as const,
      userGroups: ['技术部', '测试组', '质量保证组'],
      lastLogin: '2024-01-13T14:30:00Z',
      createTime: '2024-01-04T12:00:00Z',
      updateTime: '2024-01-13T14:30:00Z',
      deleted: false,
    },
    {
      id: '5',
      username: 'zhaoliu',
      nickname: '赵六',
      email: 'zhaoliu@example.com',
      phone: '13800138005',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
      status: 'active' as const,
      userGroups: ['运维部', '系统运维组'],
      lastLogin: '2024-01-12T09:15:00Z',
      createTime: '2024-01-05T08:30:00Z',
      updateTime: '2024-01-12T09:15:00Z',
      deleted: false,
    },
    {
      id: '6',
      username: 'sunqi',
      nickname: '孙七',
      email: 'sunqi@example.com',
      phone: '13800138006',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi',
      status: 'active' as const,
      userGroups: ['前端开发组'],
      lastLogin: '2024-01-14T11:20:00Z',
      createTime: '2024-01-06T09:00:00Z',
      updateTime: '2024-01-14T11:20:00Z',
      deleted: false,
    },
    {
      id: '7',
      username: 'zhouba',
      nickname: '周八',
      email: 'zhouba@example.com',
      phone: '13800138007',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouba',
      status: 'active' as const,
      userGroups: ['后端开发组'],
      lastLogin: '2024-01-14T16:30:00Z',
      createTime: '2024-01-07T10:00:00Z',
      updateTime: '2024-01-14T16:30:00Z',
      deleted: false,
    },
    {
      id: '8',
      username: 'wujiu',
      nickname: '吴九',
      email: 'wujiu@example.com',
      phone: '13800138008',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wujiu',
      status: 'active' as const,
      userGroups: ['UI/UX设计组'],
      lastLogin: '2024-01-13T14:45:00Z',
      createTime: '2024-01-08T11:00:00Z',
      updateTime: '2024-01-13T14:45:00Z',
      deleted: false,
    },
    {
      id: '9',
      username: 'zhengshi',
      nickname: '郑十',
      email: 'zhengshi@example.com',
      phone: '13800138009',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhengshi',
      status: 'active' as const,
      userGroups: ['产品经理组'],
      lastLogin: '2024-01-14T12:00:00Z',
      createTime: '2024-01-09T12:00:00Z',
      updateTime: '2024-01-14T12:00:00Z',
      deleted: false,
    },
    {
      id: '10',
      username: 'chenyi',
      nickname: '陈一',
      email: 'chenyi@example.com',
      phone: '13800138010',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenyi',
      status: 'active' as const,
      userGroups: ['市场部'],
      lastLogin: '2024-01-13T17:30:00Z',
      createTime: '2024-01-10T13:00:00Z',
      updateTime: '2024-01-13T17:30:00Z',
      deleted: false,
    },
    {
      id: '11',
      username: 'liner',
      nickname: '林二',
      email: 'liner@example.com',
      phone: '13800138011',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liner',
      status: 'active' as const,
      userGroups: ['销售部'],
      lastLogin: '2024-01-14T08:45:00Z',
      createTime: '2024-01-11T14:00:00Z',
      updateTime: '2024-01-14T08:45:00Z',
      deleted: false,
    },
    {
      id: '12',
      username: 'huilisan',
      nickname: '黄三',
      email: 'huilisan@example.com',
      phone: '13800138012',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=huilisan',
      status: 'active' as const,
      userGroups: ['人力资源部'],
      lastLogin: '2024-01-12T10:20:00Z',
      createTime: '2024-01-12T15:00:00Z',
      updateTime: '2024-01-12T10:20:00Z',
      deleted: false,
    },
    {
      id: '13',
      username: 'xusi',
      nickname: '徐四',
      email: 'xusi@example.com',
      phone: '13800138013',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xusi',
      status: 'active' as const,
      userGroups: ['财务部'],
      lastLogin: '2024-01-13T09:10:00Z',
      createTime: '2024-01-13T16:00:00Z',
      updateTime: '2024-01-13T09:10:00Z',
      deleted: false,
    },
    {
      id: '14',
      username: 'huwu',
      nickname: '胡五',
      email: 'huwu@example.com',
      phone: '13800138014',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=huwu',
      status: 'active' as const,
      userGroups: ['项目Alpha组', '项目Beta组'],
      lastLogin: '2024-01-14T13:25:00Z',
      createTime: '2024-01-14T17:00:00Z',
      updateTime: '2024-01-14T13:25:00Z',
      deleted: false,
    },
    {
      id: '15',
      username: 'heliu',
      nickname: '何六',
      email: 'heliu@example.com',
      phone: '13800138015',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=heliu',
      status: 'active' as const,
      userGroups: ['安全组'],
      lastLogin: '2024-01-14T15:40:00Z',
      createTime: '2024-01-15T18:00:00Z',
      updateTime: '2024-01-14T15:40:00Z',
      deleted: false,
    },
    {
      id: '16',
      username: 'luoqi',
      nickname: '罗七',
      email: 'luoqi@example.com',
      phone: '13800138016',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luoqi',
      status: 'inactive' as const,
      userGroups: ['质量保证组'],
      lastLogin: null,
      createTime: '2024-01-16T19:00:00Z',
      updateTime: '2024-01-10T12:00:00Z',
      deleted: false,
    },
    {
      id: '17',
      username: 'gaoba',
      nickname: '高八',
      email: 'gaoba@example.com',
      phone: '13800138017',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gaoba',
      status: 'active' as const,
      userGroups: ['前端开发组', '项目Alpha组'],
      lastLogin: '2024-01-14T14:15:00Z',
      createTime: '2024-01-17T20:00:00Z',
      updateTime: '2024-01-14T14:15:00Z',
      deleted: false,
    },
    {
      id: '18',
      username: 'tangjiu',
      nickname: '唐九',
      email: 'tangjiu@example.com',
      phone: '13800138018',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tangjiu',
      status: 'active' as const,
      userGroups: ['后端开发组', '运维组'],
      lastLogin: '2024-01-14T16:50:00Z',
      createTime: '2024-01-18T21:00:00Z',
      updateTime: '2024-01-14T16:50:00Z',
      deleted: false,
    },
    {
      id: '19',
      username: 'songshi',
      nickname: '宋十',
      email: 'songshi@example.com',
      phone: '13800138019',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=songshi',
      status: 'active' as const,
      userGroups: ['UI/UX设计组', '产品部'],
      lastLogin: '2024-01-13T11:30:00Z',
      createTime: '2024-01-19T22:00:00Z',
      updateTime: '2024-01-13T11:30:00Z',
      deleted: false,
    },
    {
      id: '20',
      username: 'dengyi',
      nickname: '邓一',
      email: 'dengyi@example.com',
      phone: '13800138020',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dengyi',
      status: 'active' as const,
      userGroups: ['市场部', '销售部'],
      lastLogin: '2024-01-14T18:20:00Z',
      createTime: '2024-01-20T23:00:00Z',
      updateTime: '2024-01-14T18:20:00Z',
      deleted: false,
    },
  ] as User[],

  // 模拟获取用户列表
  async getUsers(params?: UserSearchParams): Promise<ApiResponse<PaginationResponse<User>>> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    let filteredUsers = [...this.mockUsers]
    
    // 关键词搜索
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(keyword) ||
        user.nickname?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.includes(keyword)
      )
    }
    
    // 状态过滤
    if (params?.status) {
      filteredUsers = filteredUsers.filter(user => user.status === params.status)
    }
    
    // 用户组过滤
    if (params?.groupId) {
      filteredUsers = filteredUsers.filter(user => 
        user.userGroups.includes(params.groupId!)
      )
    }
    
    // 分页
    const current = params?.current || 1
    const pageSize = params?.pageSize || 10
    const start = (current - 1) * pageSize
    const end = start + pageSize
    const paginatedUsers = filteredUsers.slice(start, end)
    
    return {
      code: 200,
      message: '获取成功',
      success: true,
      data: {
        list: paginatedUsers,
        total: filteredUsers.length,
        current,
        pageSize,
      },
    }
  },

  // 模拟获取用户详情
  async getUserById(id: string): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const user = this.mockUsers.find(u => u.id === id)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    return {
      code: 200,
      message: '获取成功',
      success: true,
      data: user,
    }
  },

  // 模拟创建用户
  async createUser(data: UserCreateRequest): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 检查用户名是否已存在
    if (this.mockUsers.some(u => u.username === data.username)) {
      throw new Error('用户名已存在')
    }
    
    const newUser: User = {
      id: String(Date.now()),
      username: data.username,
      nickname: data.nickname || data.username,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      status: data.status || 'active',
      userGroups: data.userGroups || [],
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      deleted: false,
    }
    
    this.mockUsers.push(newUser)
    
    return {
      code: 200,
      message: '创建成功',
      success: true,
      data: newUser,
    }
  },

  // 模拟更新用户
  async updateUser(data: UserUpdateRequest): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const index = this.mockUsers.findIndex(u => u.id === data.id)
    if (index === -1) {
      throw new Error('用户不存在')
    }
    
    // 检查用户名是否已被其他用户使用
    if (data.username && this.mockUsers.some(u => u.username === data.username && u.id !== data.id)) {
      throw new Error('用户名已存在')
    }
    
    const updatedUser = {
      ...this.mockUsers[index],
      ...data,
      updateTime: new Date().toISOString(),
    }
    
    this.mockUsers[index] = updatedUser
    
    return {
      code: 200,
      message: '更新成功',
      success: true,
      data: updatedUser,
    }
  },

  // 模拟删除用户
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = this.mockUsers.findIndex(u => u.id === id)
    if (index === -1) {
      throw new Error('用户不存在')
    }
    
    this.mockUsers.splice(index, 1)
    
    return {
      code: 200,
      message: '删除成功',
      success: true,
      data: undefined,
    }
  },

  // 模拟批量删除用户
  async batchDeleteUsers(ids: string[]): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    this.mockUsers = this.mockUsers.filter(user => !ids.includes(user.id))
    
    return {
      code: 200,
      message: `成功删除 ${ids.length} 个用户`,
      success: true,
      data: undefined,
    }
  },

  // 模拟更新用户状态
  async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const user = this.mockUsers.find(u => u.id === id)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    user.status = status
    user.updateTime = new Date().toISOString()
    
    return {
      code: 200,
      message: `用户状态已更新为 ${status === 'active' ? '启用' : '禁用'}`,
      success: true,
      data: undefined,
    }
  },

  // 模拟获取用户所属组
  async getUserGroups(id: string): Promise<ApiResponse<string[]>> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const user = this.mockUsers.find(u => u.id === id)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    return {
      code: 200,
      message: '获取成功',
      success: true,
      data: user.userGroups,
    }
  },
} 