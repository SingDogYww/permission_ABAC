import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse, ErrorResponse } from '@/types'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 简单的消息提示函数
const showMessage = (message: string, type: 'error' | 'success' = 'error') => {
  console.log(`[${type.toUpperCase()}] ${message}`)
  // 这里可以替换为Ant Design的message组件
}

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          showMessage('登录已过期，请重新登录')
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          showMessage('权限不足，无法访问该资源')
          break
        case 404:
          showMessage('请求的资源不存在')
          break
        case 500:
          showMessage('服务器内部错误，请联系管理员')
          break
        default:
          showMessage(data?.message || `请求失败 (${status})`)
      }
    } else {
      showMessage('网络连接失败，请检查网络设置')
    }

    return Promise.reject(error)
  }
)

// 导出请求方法
export default request

// 封装常用请求方法
export const http = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.put(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.delete(url, config)
  },

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return request.patch(url, data, config)
  },
}

// 文件上传请求
export const uploadFile = (url: string, formData: FormData, onProgress?: (progress: number) => void) => {
  return request.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  })
}

// 下载文件请求
export const downloadFile = (url: string, filename?: string) => {
  return request.get(url, {
    responseType: 'blob',
  }).then((response: any) => {
    const blob = new Blob([response])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  })
} 