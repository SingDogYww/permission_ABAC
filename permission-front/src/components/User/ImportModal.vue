<template>
  <div v-if="visible" class="import-overlay">
    <div class="import-modal" @click.stop>
      <div class="import-header">
        <h3 class="import-title">
          <font-awesome-icon icon="file-import" />
          批量导入用户
        </h3>
        <button class="close-btn" @click="close">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <div class="import-body">
        <!-- 步骤指示器 -->
        <div class="step-indicator">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-label">下载模板</div>
          </div>
          <div class="step-line" :class="{ active: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-label">上传文件</div>
          </div>
          <div class="step-line" :class="{ active: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
            <div class="step-number">3</div>
            <div class="step-label">确认导入</div>
          </div>
          <div class="step-line" :class="{ active: currentStep > 3 }"></div>
          <div class="step" :class="{ active: currentStep >= 4 }">
            <div class="step-number">4</div>
            <div class="step-label">导入结果</div>
          </div>
        </div>

        <!-- 步骤1: 下载模板 -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="step-info">
            <div class="info-icon">
              <font-awesome-icon icon="download" />
            </div>
            <h4>第一步：下载导入模板</h4>
            <p>请先下载用户导入模板，按照模板格式填写用户信息后再进行上传。</p>
          </div>

          <div class="template-info">
            <h5>模板说明：</h5>
            <ul class="template-rules">
              <li>支持格式：Excel (.xlsx) 或 CSV (.csv)</li>
              <li>必填字段：用户名、邮箱、手机号、角色</li>
              <li>可选字段：状态、用户组、权限、备注</li>
              <li>用户名必须唯一，不能重复</li>
              <li>邮箱格式必须正确且唯一</li>
              <li>手机号格式必须正确且唯一</li>
              <li>角色必须为：admin、user、guest 之一</li>
              <li>状态必须为：active 或 inactive</li>
            </ul>
          </div>

          <div class="template-actions">
            <button class="btn-download excel" @click="downloadTemplate('excel')">
              <font-awesome-icon icon="file-excel" />
              下载 Excel 模板
            </button>
            <button class="btn-download csv" @click="downloadTemplate('csv')">
              <font-awesome-icon icon="file-csv" />
              下载 CSV 模板
            </button>
          </div>
        </div>

        <!-- 步骤2: 上传文件 -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="step-info">
            <div class="info-icon">
              <font-awesome-icon icon="upload" />
            </div>
            <h4>第二步：上传导入文件</h4>
            <p>请选择填写好的用户信息文件进行上传。</p>
          </div>

          <div class="upload-area" :class="{ dragover: isDragOver }" @drop="handleDrop" @dragover="handleDragOver"
            @dragleave="handleDragLeave" @click="triggerFileUpload">
            <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" style="display: none"
              @change="handleFileUpload" />
            <div v-if="!uploadedFile" class="upload-placeholder">
              <font-awesome-icon icon="cloud-upload-alt" class="upload-icon" />
              <p class="upload-text">点击选择文件或拖拽文件到此区域</p>
              <p class="upload-hint">支持 .xlsx .xls .csv 格式，文件大小不超过 10MB</p>
            </div>
            <div v-else class="uploaded-file">
              <div class="file-info">
                <font-awesome-icon :icon="getFileIcon()" class="file-icon" />
                <div class="file-details">
                  <div class="file-name">{{ uploadedFile.name }}</div>
                  <div class="file-size">{{ formatFileSize(uploadedFile.size) }}</div>
                </div>
                <button class="remove-file" @click.stop="removeFile">
                  <font-awesome-icon icon="trash" />
                </button>
              </div>
              <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                </div>
                <span class="progress-text">{{ uploadProgress }}%</span>
              </div>
            </div>
          </div>

          <div v-if="parseErrors.length > 0" class="error-list">
            <h5>文件解析错误：</h5>
            <ul>
              <li v-for="error in parseErrors" :key="error" class="error-item">
                {{ error }}
              </li>
            </ul>
          </div>
        </div>

        <!-- 步骤3: 确认导入 -->
        <div v-if="currentStep === 3" class="step-content">
          <div class="step-info">
            <div class="info-icon">
              <font-awesome-icon icon="check-circle" />
            </div>
            <h4>第三步：确认导入数据</h4>
            <p>请确认以下用户信息无误后点击导入。</p>
          </div>

          <div class="import-summary">
            <div class="summary-item">
              <span class="summary-label">总记录数：</span>
              <span class="summary-value">{{ previewData.length }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">有效记录：</span>
              <span class="summary-value valid">{{ validCount }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">错误记录：</span>
              <span class="summary-value error">{{ errorCount }}</span>
            </div>
          </div>

          <div class="preview-table-container">
            <table class="preview-table">
              <thead>
                <tr>
                  <th>行号</th>
                  <th>用户名</th>
                  <th>邮箱</th>
                  <th>手机号</th>
                  <th>角色</th>
                  <th>状态</th>
                  <th>验证结果</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in previewData.slice(0, 10)" :key="index" :class="{ error: item.hasError }">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.email }}</td>
                  <td>{{ item.phone }}</td>
                  <td>{{ item.role }}</td>
                  <td>{{ item.status }}</td>
                  <td>
                    <span v-if="!item.hasError" class="status-valid">
                      <font-awesome-icon icon="check" />
                      有效
                    </span>
                    <span v-else class="status-error">
                      <font-awesome-icon icon="times" />
                      {{ item.errorMessage }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="previewData.length > 10" class="preview-more">
              还有 {{ previewData.length - 10 }} 条记录未显示...
            </div>
          </div>
        </div>

        <!-- 步骤4: 导入结果 -->
        <div v-if="currentStep === 4" class="step-content">
          <div v-if="importing" class="importing-status">
            <div class="loading-spinner">
              <font-awesome-icon icon="spinner" spin />
            </div>
            <h4>正在导入用户数据...</h4>
            <p>请稍候，正在处理您的数据</p>
          </div>

          <div v-else-if="importResult" class="import-result">
            <div class="result-header">
              <div v-if="importResult.success" class="result-icon success">
                <font-awesome-icon icon="check-circle" />
              </div>
              <div v-else class="result-icon error">
                <font-awesome-icon icon="times-circle" />
              </div>
              <h4>{{ importResult.success ? '导入完成' : '导入失败' }}</h4>
            </div>

            <div class="result-summary">
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="summary-label">总计：</span>
                  <span class="summary-value">{{ importResult.total }} 条</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">成功：</span>
                  <span class="summary-value success">{{ importResult.successCount }} 条</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">失败：</span>
                  <span class="summary-value error">{{ importResult.failedCount }} 条</span>
                </div>
              </div>
            </div>

            <div v-if="importResult.error" class="error-message">
              <font-awesome-icon icon="exclamation-triangle" />
              {{ importResult.error }}
            </div>

            <div v-if="importResult.results && importResult.results.length > 0" class="result-details">
              <h5>详细结果</h5>
              <div class="result-table-container">
                <table class="result-table">
                  <thead>
                    <tr>
                      <th>用户名</th>
                      <th>邮箱</th>
                      <th>手机号</th>
                      <th>角色</th>
                      <th>状态</th>
                      <th>结果说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(result, index) in importResult.results" :key="index"
                      :class="{ error: result.importStatus === 'failed' }">
                      <td>{{ result.username || result.name || '-' }}</td>
                      <td>{{ result.email || '-' }}</td>
                      <td>{{ result.phone || '-' }}</td>
                      <td>{{ result.role || '-' }}</td>
                      <td>
                        <span v-if="result.importStatus === 'success'" class="status-success">
                          <font-awesome-icon icon="check" />
                          成功
                        </span>
                        <span v-else class="status-failed">
                          <font-awesome-icon icon="times" />
                          失败
                        </span>
                      </td>
                      <td>
                        <span v-if="result.importStatus === 'success'" class="result-message">
                          导入成功
                        </span>
                        <span v-else class="error-message">
                          {{ result.errorMessage || '导入失败' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="importResult.successCount > 0" class="success-actions">
              <button class="btn-view-users" @click="handleViewUsers">
                <font-awesome-icon icon="users" />
                查看用户列表
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="import-footer">
        <button v-if="currentStep > 1 && currentStep < 4" class="btn-back" @click="previousStep">
          <font-awesome-icon icon="arrow-left" />
          上一步
        </button>
        <div class="footer-actions">
          <button v-if="currentStep < 4" class="btn-cancel" @click="close">取消</button>
          <!-- 测试按钮：直接跳转到第4步查看样式 -->
          <button v-if="currentStep === 3" class="btn-test" @click="testStep4">
            <font-awesome-icon icon="cog" />
            测试第4步
          </button>
          <button v-if="currentStep < 3" class="btn-next" :disabled="!canNext" @click="nextStep">
            下一步
            <font-awesome-icon icon="arrow-right" />
          </button>
          <button v-if="currentStep === 3" class="btn-import" :disabled="validCount === 0 || importing"
            @click="handleImport">
            <font-awesome-icon v-if="importing" icon="spinner" spin />
            <font-awesome-icon v-else icon="file-import" />
            {{ importing ? '导入中...' : `开始导入 (${validCount} 条)` }}
          </button>
          <button v-if="currentStep === 4" class="btn-close" @click="close">
            <font-awesome-icon icon="check" />
            完成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'import', data: any[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const currentStep = ref(1)
const uploadedFile = ref<File | null>(null)
const uploadProgress = ref(0)
const isDragOver = ref(false)
const parseErrors = ref<string[]>([])
const previewData = ref<any[]>([])
const fileInput = ref<HTMLInputElement>()
const importing = ref(false)
const importResult = ref<any>(null)

// 计算属性
const canNext = computed(() => {
  if (currentStep.value === 1) return true
  if (currentStep.value === 2) return uploadedFile.value && parseErrors.value.length === 0
  return false
})

const validCount = computed(() =>
  previewData.value.filter(item => !item.hasError).length
)

const errorCount = computed(() =>
  previewData.value.filter(item => item.hasError).length
)

// 模板数据
const templateData = [
  {
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    role: 'admin',
    status: 'active',
    groups: '管理员组',
    permissions: '系统配置,用户管理',
    remark: '示例用户1'
  },
  {
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    role: 'user',
    status: 'active',
    groups: '普通用户组',
    permissions: '',
    remark: '示例用户2'
  }
]

// 重置状态
const reset = () => {
  currentStep.value = 1
  uploadedFile.value = null
  uploadProgress.value = 0
  parseErrors.value = []
  previewData.value = []
  importing.value = false
  importResult.value = null
}

// 关闭弹窗
const close = () => {
  emit('close')
  reset()
}

// 下载模板
const downloadTemplate = (format: 'excel' | 'csv') => {
  if (format === 'excel') {
    // 模拟Excel文件下载
    const headers = ['用户名', '邮箱', '手机号', '角色', '状态', '用户组', '权限', '备注']
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => [
        row.name, row.email, row.phone, row.role,
        row.status, row.groups, row.permissions, row.remark
      ].join(','))
    ].join('\n')

    downloadFile(csvContent, 'user_import_template.csv', 'text/csv')
  } else {
    // CSV格式下载
    const headers = ['用户名', '邮箱', '手机号', '角色', '状态', '用户组', '权限', '备注']
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => [
        row.name, row.email, row.phone, row.role,
        row.status, row.groups, row.permissions, row.remark
      ].join(','))
    ].join('\n')

    downloadFile(csvContent, 'user_import_template.csv', 'text/csv')
  }

  // 下载后自动进入下一步
  setTimeout(() => {
    currentStep.value = 2
  }, 500)
}

// 文件下载辅助函数
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// 上一步
const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 下一步
const nextStep = () => {
  if (currentStep.value < 3 && canNext.value) {
    currentStep.value++
  }
}

// 触发文件上传
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// 处理拖拽
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

// 处理文件上传
const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFile(file)
  }
}

// 处理文件
const handleFile = (file: File) => {
  // 验证文件类型
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]

  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
    parseErrors.value = ['不支持的文件格式，请上传 Excel 或 CSV 文件']
    return
  }

  // 验证文件大小
  if (file.size > 10 * 1024 * 1024) {
    parseErrors.value = ['文件大小不能超过 10MB']
    return
  }

  uploadedFile.value = file
  parseErrors.value = []
  uploadProgress.value = 0

  // 模拟上传进度
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      parseFile(file)
    }
  }, 100)
}

// 解析文件
const parseFile = (file: File) => {
  // 模拟文件解析
  setTimeout(() => {
    // 模拟解析结果
    const mockData = [
      {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138001',
        role: 'admin',
        status: 'active',
        hasError: false,
        errorMessage: ''
      },
      {
        name: '李四',
        email: 'lisi@example.com',
        phone: '13800138002',
        role: 'user',
        status: 'active',
        hasError: false,
        errorMessage: ''
      },
      {
        name: '王五',
        email: 'invalid-email',
        phone: '13800138003',
        role: 'user',
        status: 'active',
        hasError: true,
        errorMessage: '邮箱格式错误'
      }
    ]

    previewData.value = mockData
    currentStep.value = 3
  }, 500)
}

// 移除文件
const removeFile = () => {
  uploadedFile.value = null
  uploadProgress.value = 0
  previewData.value = []
}

// 获取文件图标
const getFileIcon = () => {
  if (!uploadedFile.value) return 'file'

  const name = uploadedFile.value.name.toLowerCase()
  if (name.includes('.xlsx') || name.includes('.xls')) {
    return 'file-excel'
  } else if (name.includes('.csv')) {
    return 'file-csv'
  }
  return 'file'
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 执行导入
const handleImport = async () => {
  const validData = previewData.value.filter(item => !item.hasError)

  // 模拟导入API调用
  try {
    // 显示导入中状态
    importing.value = true

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟导入结果 - 随机生成一些失败的记录
    const importResults = validData.map((item, index) => {
      // 模拟一些导入失败的情况
      const shouldFail = Math.random() < 0.2 // 20% 失败率
      return {
        ...item,
        importStatus: shouldFail ? 'failed' : 'success',
        errorMessage: shouldFail ? getRandomErrorMessage() : null
      }
    })

    const successCount = importResults.filter(item => item.importStatus === 'success').length
    const failedCount = importResults.filter(item => item.importStatus === 'failed').length

    importResult.value = {
      success: true,
      total: validData.length,
      successCount,
      failedCount,
      results: importResults
    }

    importing.value = false
    currentStep.value = 4 // 显示结果页面

  } catch (error) {
    importing.value = false
    importResult.value = {
      success: false,
      error: '导入过程中发生错误，请重试',
      total: validData.length,
      successCount: 0,
      failedCount: validData.length,
      results: []
    }
    currentStep.value = 4
  }
}

// 测试第4步 - 创建模拟的导入结果数据
const testStep4 = () => {
  // 创建模拟的导入结果数据
  const mockResults = [
    {
      username: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138001',
      role: 'admin',
      status: 'active',
      importStatus: 'success',
      errorMessage: null
    },
    {
      username: '李四',
      email: 'lisi@example.com',
      phone: '13800138002',
      role: 'user',
      status: 'active',
      importStatus: 'success',
      errorMessage: null
    },
    {
      username: '王五',
      email: 'invalid-email',
      phone: '13800138003',
      role: 'user',
      status: 'active',
      importStatus: 'failed',
      errorMessage: '邮箱格式不正确'
    },
    {
      username: '赵六',
      email: 'zhaoliu@example.com',
      phone: '13800138004',
      role: 'user',
      status: 'active',
      importStatus: 'failed',
      errorMessage: '用户名已存在'
    },
    {
      username: '钱七',
      email: 'qianqi@example.com',
      phone: '13800138005',
      role: 'user',
      status: 'active',
      importStatus: 'success',
      errorMessage: null
    }
  ]

  const successCount = mockResults.filter(item => item.importStatus === 'success').length
  const failedCount = mockResults.filter(item => item.importStatus === 'failed').length

  // 设置导入结果
  importResult.value = {
    success: true,
    total: mockResults.length,
    successCount,
    failedCount,
    results: mockResults
  }

  // 跳转到第4步
  currentStep.value = 4
}

// 获取随机错误信息
const getRandomErrorMessage = () => {
  const errors = [
    '用户名已存在',
    '邮箱格式不正确',
    '手机号已被使用',
    '用户组不存在',
    '必填字段缺失',
    '数据格式错误'
  ]
  return errors[Math.floor(Math.random() * errors.length)]
}

// 查看用户列表
const handleViewUsers = () => {
  // 通知父组件导入成功的用户数据
  const successfulUsers = importResult.value.results.filter(
    (user: any) => user.importStatus === 'success'
  )
  emit('import', successfulUsers)
  close()
}

// 监听visible变化，重置状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    reset()
  }
})
</script>

<style scoped>
.import-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
  padding: 20px;
}

.import-modal {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.import-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
  background: rgba(0, 238, 255, 0.05);
}

.import-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #00eeff;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.import-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step.active .step-number {
  border-color: #00eeff;
  background: rgba(0, 238, 255, 0.2);
  color: #00eeff;
}

.step.completed .step-number {
  border-color: #2ecc71;
  background: #2ecc71;
  color: #fff;
}

.step-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.step.active .step-label {
  color: #00eeff;
}

.step-line {
  width: 100px;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 16px;
  transition: all 0.3s ease;
}

.step-line.active {
  background: #00eeff;
}

/* 步骤内容 */
.step-content {
  text-align: center;
}

.step-info {
  margin-bottom: 24px;
}

.info-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 238, 255, 0.2);
  color: #00eeff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 16px;
}

.step-info h4 {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px 0;
}

.step-info p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 模板信息 */
.template-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
  text-align: left;
}

.template-info h5 {
  color: #00eeff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.template-rules {
  list-style: none;
  padding: 0;
  margin: 0;
}

.template-rules li {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  padding: 4px 0;
  border-left: 3px solid rgba(0, 238, 255, 0.3);
  padding-left: 12px;
  margin-bottom: 8px;
}

/* 模板下载按钮 */
.template-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-download {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.btn-download.excel {
  background: linear-gradient(45deg, #2ecc71, #27ae60);
}

.btn-download.excel:hover {
  background: linear-gradient(45deg, #27ae60, #2ecc71);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.btn-download.csv {
  background: linear-gradient(45deg, #3498db, #2980b9);
}

.btn-download.csv:hover {
  background: linear-gradient(45deg, #2980b9, #3498db);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

/* 上传区域 */
.upload-area {
  border: 2px dashed rgba(0, 238, 255, 0.3);
  border-radius: 12px;
  padding: 40px 20px;
  margin: 24px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
}

.upload-area:hover,
.upload-area.dragover {
  border-color: #00eeff;
  background: rgba(0, 238, 255, 0.05);
}

.upload-placeholder {
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 8px 0;
}

.upload-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.uploaded-file {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.file-icon {
  font-size: 32px;
  color: #00eeff;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 4px;
}

.file-size {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.remove-file {
  padding: 8px;
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 6px;
  color: #e74c3c;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-file:hover {
  background: rgba(231, 76, 60, 0.3);
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00eeff, #00b4db);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #00eeff;
  font-weight: 500;
  min-width: 40px;
}

/* 错误列表 */
.error-list {
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  text-align: left;
}

.error-list h5 {
  color: #e74c3c;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.error-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-item {
  color: #e74c3c;
  font-size: 14px;
  padding: 4px 0;
}

/* 导入摘要 */
.import-summary {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin: 24px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.summary-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.summary-value.valid {
  color: #2ecc71;
}

.summary-value.error {
  color: #e74c3c;
}

/* 预览表格 */
.preview-table-container {
  max-height: 300px;
  overflow: auto;
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  margin: 16px 0;
}

/* 预览表格滚动条样式 */
.preview-table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.preview-table-container::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
}

.preview-table-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #00eeff, #0ea5e9);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.preview-table-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

.preview-table-container::-webkit-scrollbar-corner {
  background: rgba(15, 23, 42, 0.5);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.preview-table th {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  font-weight: 600;
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
  position: sticky;
  top: 0;
}

.preview-table td {
  padding: 12px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
}

.preview-table tr.error {
  background: rgba(231, 76, 60, 0.1);
}

.preview-table tr:hover {
  background: rgba(0, 238, 255, 0.05);
}

.status-valid {
  color: #2ecc71;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.status-error {
  color: #e74c3c;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.preview-more {
  padding: 12px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  background: rgba(255, 255, 255, 0.02);
}

/* 底部操作 */
.import-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-top: 1px solid rgba(0, 238, 255, 0.2);
  background: rgba(0, 238, 255, 0.05);
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-back,
.btn-cancel,
.btn-next,
.btn-import {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-back,
.btn-cancel {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-back:hover,
.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-next,
.btn-import {
  background: linear-gradient(45deg, #00eeff, #00b4db);
  color: #0f2027;
}

.btn-next:hover,
.btn-import:hover {
  background: linear-gradient(45deg, #00b4db, #00eeff);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 238, 255, 0.3);
}

.btn-next:disabled,
.btn-import:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .import-overlay {
    padding: 10px;
  }

  .import-modal {
    max-height: 95vh;
  }

  .import-header,
  .import-body,
  .import-footer {
    padding: 16px;
  }

  .step-indicator {
    flex-direction: column;
    gap: 16px;
  }

  .step-line {
    width: 2px;
    height: 40px;
    margin: 0;
  }

  .template-actions {
    flex-direction: column;
  }

  .import-summary {
    flex-direction: column;
    gap: 16px;
  }

  .import-footer {
    flex-direction: column;
    gap: 16px;
  }

  .footer-actions {
    width: 100%;
    justify-content: center;
  }

  .preview-table {
    font-size: 12px;
  }

  .preview-table th,
  .preview-table td {
    padding: 8px 4px;
  }
}

/* 导入状态和结果样式 */
.importing-status {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  font-size: 48px;
  color: #00eeff;
  margin-bottom: 24px;
}

.importing-status h4 {
  color: #ffffff;
  margin-bottom: 12px;
  font-size: 20px;
}

.importing-status p {
  color: #94a3b8;
  font-size: 14px;
}

.import-result {
  max-height: 400px;
  overflow-y: auto;
}

.result-header {
  text-align: center;
  padding: 30px 20px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
  margin-bottom: 24px;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.result-icon.success {
  color: #10b981;
}

.result-icon.error {
  color: #ef4444;
}

.result-header h4 {
  color: #ffffff;
  font-size: 24px;
  margin: 0;
}

.result-summary {
  padding: 20px;
  background: rgba(0, 238, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.summary-grid .summary-item {
  text-align: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(0, 238, 255, 0.2);
}

.summary-grid .summary-label {
  display: block;
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 8px;
}

.summary-grid .summary-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}

.summary-grid .summary-value.success {
  color: #10b981;
}

.summary-grid .summary-value.error {
  color: #ef4444;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #ef4444;
  text-align: center;
}

.error-message .fa-icon {
  margin-right: 8px;
}

.result-details {
  margin-bottom: 24px;
}

.result-details h5 {
  color: #ffffff;
  font-size: 16px;
  margin-bottom: 16px;
  padding-left: 4px;
}

.result-table-container {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: auto;
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  position: relative;
  background: rgba(15, 23, 42, 0.8);
}

/* 自定义滚动条样式 */
.result-table-container::-webkit-scrollbar {
  width: 8px;
}

.result-table-container::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
}

.result-table-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #00eeff, #0ea5e9);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.result-table-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

.result-table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  background: rgba(15, 23, 42, 0.8);
  table-layout: fixed;
  border-spacing: 0;
}

/* 用户名列 */
.result-table th:nth-child(1),
.result-table td:nth-child(1) {
  width: 70px;
  padding: 8px 12px;
  text-align: left;
}

/* 邮箱列 */
.result-table th:nth-child(2),
.result-table td:nth-child(2) {
  width: 200px;
  padding: 8px 12px;
  text-align: left;
}

/* 手机号列 */
.result-table th:nth-child(3),
.result-table td:nth-child(3) {
  width: 120px;
  padding: 8px 12px;
  text-align: left;
}

/* 角色列 */
.result-table th:nth-child(4),
.result-table td:nth-child(4) {
  width: 80px;
  padding: 8px 12px;
  text-align: left;
}

/* 状态列 */
.result-table th:nth-child(5),
.result-table td:nth-child(5) {
  width: 90px;
  padding: 8px 12px;
  text-align: left;
}

/* 结果说明列 */
.result-table th:nth-child(6),
.result-table td:nth-child(6) {
  width: calc(100% - 540px);
  min-width: 60px;
  padding: 8px 12px;
  text-align: left;
}

.result-table th {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
  vertical-align: middle;
  height: 42px;
  line-height: 1.3;
}

.result-table td {
  border-bottom: 1px solid rgba(0, 238, 255, 0.1);
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
  vertical-align: middle;
  height: 42px;
  line-height: 1.3;
}

.result-table td:nth-child(6) {
  white-space: normal;
  word-wrap: break-word;
  overflow: visible;
  text-overflow: unset;
}

.result-table tr.error {
  background: rgba(239, 68, 68, 0.05);
}

.result-table tr.error td {
  border-bottom-color: rgba(239, 68, 68, 0.2);
}

.status-success {
  color: #10b981;
  font-weight: 500;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  white-space: nowrap;
  line-height: 1.2;
  max-width: 100%;
}

.status-failed {
  color: #ef4444;
  font-weight: 500;
  background: rgba(239, 68, 68, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  white-space: nowrap;
  line-height: 1.2;
  max-width: 100%;
}

.status-success .fa-icon,
.status-failed .fa-icon {
  margin-right: 6px;
}

.result-message {
  color: #10b981;
  font-size: 13px;
  font-weight: 500;
}

.error-message {
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
}

.success-actions {
  text-align: center;
  padding: 20px;
  border-top: 1px solid rgba(0, 238, 255, 0.2);
}

.btn-view-users {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-view-users:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-view-users .fa-icon {
  margin-right: 8px;
}

.btn-close {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-close:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-close .fa-icon {
  margin-right: 8px;
}

.btn-test {
  background: linear-gradient(135deg, #ff6b35, #e55a2b);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.btn-test:hover {
  background: linear-gradient(135deg, #e55a2b, #d94e1f);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.btn-test .fa-icon {
  margin-right: 8px;
}

/* 全局滚动条样式 */
.import-modal *::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.import-modal *::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
}

.import-modal *::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #00eeff, #0ea5e9);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.import-modal *::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

.import-modal *::-webkit-scrollbar-corner {
  background: rgba(15, 23, 42, 0.5);
}
</style>