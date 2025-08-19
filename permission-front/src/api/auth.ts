import { http } from '@/utils/request'
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ApiResponse,
  User 
} from '@/types'

// 认证API服务
export const authApi = {
  // 用户登录
  login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return http.post('/auth/login', data)
  },

  // 用户注册
  register(data: RegisterRequest): Promise<ApiResponse<User>> {
    return http.post('/auth/register', data)
  },

  // 刷新Token
  refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    return http.post('/auth/refresh', { refreshToken })
  },

  // 用户登出
  logout(): Promise<ApiResponse<void>> {
    return http.post('/auth/logout')
  },

  // 获取当前用户信息
  getCurrentUser(): Promise<ApiResponse<User>> {
    return http.get('/auth/me')
  },

  // 发送验证码
  sendVerificationCode(phone: string): Promise<ApiResponse<void>> {
    return http.post('/auth/send-code', { phone })
  },

  // 验证验证码
  verifyCode(phone: string, code: string): Promise<ApiResponse<void>> {
    return http.post('/auth/verify-code', { phone, code })
  },

  // 重置密码
  resetPassword(data: { phone: string; code: string; newPassword: string }): Promise<ApiResponse<void>> {
    return http.post('/auth/reset-password', data)
  },

  // 修改密码
  changePassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    return http.post('/auth/change-password', data)
  },
}

// 模拟数据返回函数（用于开发阶段）
export const mockAuthApi = {
  // 模拟登录
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 简单的模拟验证
    if (data.username === 'admin' && data.password === '123456') {
      const mockResponse: ApiResponse<LoginResponse> = {
        code: 200,
        message: '登录成功',
        success: true,
        data: {
          token: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          user: {
            id: '1',
            username: 'admin',
            nickname: '管理员',
            email: 'admin@example.com',
            phone: '13800138000',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            status: 'active',
            userGroups: ['管理员组', '系统管理员'],
            lastLogin: new Date().toISOString(),
            createTime: '2024-01-01T00:00:00Z',
            updateTime: new Date().toISOString(),
            deleted: false,
          },
          expiresIn: 7200,
        },
      }
      return mockResponse
    } else {
      throw new Error('用户名或密码错误')
    }
  },

  // 模拟注册
  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockUser: User = {
      id: String(Date.now()),
      username: data.username,
      nickname: data.username,
      email: data.email,
      phone: data.phone,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      status: 'active',
      userGroups: ['普通用户组'],
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      deleted: false,
    }

    return {
      code: 200,
      message: '注册成功',
      success: true,
      data: mockUser,
    }
  },

  // 模拟获取当前用户信息
  async getCurrentUser(): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw new Error('未登录')
    }

    return {
      code: 200,
      message: '获取成功',
      success: true,
      data: {
        id: '1',
        username: 'admin',
        nickname: '管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        status: 'active',
        userGroups: ['管理员组', '系统管理员'],
        lastLogin: new Date().toISOString(),
        createTime: '2024-01-01T00:00:00Z',
        updateTime: new Date().toISOString(),
        deleted: false,
      },
    }
  },

  // 模拟刷新Token
  async refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      code: 200,
      message: '刷新成功',
      success: true,
      data: {
        token: 'new_mock_access_token_' + Date.now(),
        refreshToken: 'new_mock_refresh_token_' + Date.now(),
        user: {
          id: '1',
          username: 'admin',
          nickname: '管理员',
          email: 'admin@example.com',
          phone: '13800138000',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          status: 'active',
          userGroups: ['管理员组', '系统管理员'],
          lastLogin: new Date().toISOString(),
          createTime: '2024-01-01T00:00:00Z',
          updateTime: new Date().toISOString(),
          deleted: false,
        },
        expiresIn: 7200,
      },
    }
  },

  // 模拟登出
  async logout(): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      code: 200,
      message: '登出成功',
      success: true,
      data: undefined,
    }
  },

  // 模拟发送验证码
  async sendVerificationCode(phone: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log(`发送验证码到 ${phone}: 123456`)
    
    return {
      code: 200,
      message: '验证码发送成功',
      success: true,
      data: undefined,
    }
  },

  // 模拟验证验证码
  async verifyCode(phone: string, code: string): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (code === '123456') {
      return {
        code: 200,
        message: '验证成功',
        success: true,
        data: undefined,
      }
    } else {
      throw new Error('验证码错误')
    }
  },
} 