<template>
  <div v-if="visible" class="modal-overlay" @click="close">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <font-awesome-icon :icon="isEdit ? 'edit' : 'user-plus'" />
          {{ isEdit ? '编辑用户' : '添加用户' }}
        </h3>
        <button class="close-btn" @click="close">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- 头像选择区域 -->
          <div class="form-section">
            <label class="section-title">用户头像</label>
            <div class="avatar-section">
              <div class="current-avatar">
                <img :src="formData.avatar" :alt="formData.name" class="avatar-preview" />
                <div class="avatar-overlay" @click="showAvatarModal = true">
                  <font-awesome-icon icon="camera" />
                  <span>更换头像</span>
                </div>
              </div>
              <div class="avatar-actions">
                <button type="button" class="btn-avatar" @click="showAvatarModal = true">
                  <font-awesome-icon icon="images" />
                  选择头像
                </button>
                <button type="button" class="btn-avatar" @click="triggerFileUpload">
                  <font-awesome-icon icon="upload" />
                  上传头像
                </button>
                <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileUpload" />
              </div>
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="form-section">
            <label class="section-title">基本信息</label>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">
                  用户名 <span class="required">*</span>
                </label>
                <input v-model="formData.name" type="text" class="form-input" placeholder="请输入用户名" required 
                       :class="{ 'error': nameError }" @blur="validateName" />
                <div v-if="nameError" class="field-error">{{ nameError }}</div>
              </div>
              <div class="form-group">
                <label class="form-label">
                  邮箱地址 <span class="required">*</span>
                </label>
                <input v-model="formData.email" type="email" class="form-input" placeholder="请输入邮箱地址" required 
                       :class="{ 'error': emailError }" @blur="validateEmail" />
                <div v-if="emailError" class="field-error">{{ emailError }}</div>
              </div>
              <div class="form-group">
                <label class="form-label">
                  手机号码 <span class="required">*</span>
                </label>
                <input v-model="formData.phone" type="tel" class="form-input" placeholder="请输入手机号码" required 
                       :class="{ 'error': phoneError }" @blur="validatePhone" />
                <div v-if="phoneError" class="field-error">{{ phoneError }}</div>
              </div>

              <div class="form-group">
                <label class="form-label">用户状态</label>
                <select v-model="formData.status" class="form-select">
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>

            </div>
          </div>

          <!-- 登录设置 -->
          <div class="form-section" v-if="!isEdit">
            <label class="section-title">登录设置</label>
            
            <!-- 登录方式选择 -->
            <div class="form-group">
              <label class="form-label">登录方式 <span class="required">*</span></label>
              <div class="login-methods">
                <label class="checkbox-item">
                  <input type="checkbox" v-model="formData.loginMethods" value="username" @change="onLoginMethodChange" />
                  <span class="checkbox-mark"></span>
                  <font-awesome-icon icon="user" class="method-icon" />
                  用户名密码
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="formData.loginMethods" value="phone" @change="onLoginMethodChange" />
                  <span class="checkbox-mark"></span>
                  <font-awesome-icon icon="mobile-alt" class="method-icon" />
                  手机登录
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="formData.loginMethods" value="email" @change="onLoginMethodChange" />
                  <span class="checkbox-mark"></span>
                  <font-awesome-icon icon="envelope" class="method-icon" />
                  邮箱登录
                </label>
              </div>
              <div v-if="loginMethodError" class="field-error">{{ loginMethodError }}</div>
            </div>
            
            <!-- 用户名密码登录配置 -->
            <div v-if="formData.loginMethods.includes('username')" class="login-config">
              <!-- 登录用户名 -->
              <div class="form-group">
                <label class="form-label">
                  登录用户名 <span class="required">*</span>
                </label>
                <input v-model="formData.username" type="text" class="form-input" 
                       placeholder="请输入登录用户名" required 
                       :class="{ 'error': usernameError }" 
                       @blur="validateUsername" />
                <div v-if="usernameError" class="field-error">{{ usernameError }}</div>
              </div>
              
              <!-- 密码和确认密码 - 并排显示 -->
              <div class="password-row">
                <div class="form-group password-group">
                  <label class="form-label">
                    初始密码 <span class="required">*</span>
                  </label>
                  <div class="password-input">
                    <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" class="form-input password-field"
                      placeholder="请输入初始密码" required 
                      :class="{ 'error': passwordError }"
                      @input="validatePassword"
                      @focus="showPasswordTooltip = true"
                      @blur="showPasswordTooltip = false" />
                    <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                      <font-awesome-icon :icon="showPassword ? 'eye-slash' : 'eye'" />
                    </button>
                    <!-- 密码强度提示工具栏 -->
                    <div v-if="showPasswordTooltip && formData.password" class="password-tooltip">
                      <div class="tooltip-header">
                        <span class="tooltip-title">密码强度</span>
                        <span class="strength-indicator" :class="passwordStrength.level">
                          {{ passwordStrength.text }}
                        </span>
                      </div>
                      <div class="tooltip-requirements">
                        <div class="requirement" :class="{ valid: passwordValidation.length }">
                          <font-awesome-icon :icon="passwordValidation.length ? 'check' : 'times'" />
                          至少8个字符
                        </div>
                        <div class="requirement" :class="{ valid: passwordValidation.uppercase }">
                          <font-awesome-icon :icon="passwordValidation.uppercase ? 'check' : 'times'" />
                          包含大写字母
                        </div>
                        <div class="requirement" :class="{ valid: passwordValidation.lowercase }">
                          <font-awesome-icon :icon="passwordValidation.lowercase ? 'check' : 'times'" />
                          包含小写字母
                        </div>
                        <div class="requirement" :class="{ valid: passwordValidation.number }">
                          <font-awesome-icon :icon="passwordValidation.number ? 'check' : 'times'" />
                          包含数字
                        </div>
                        <div class="requirement" :class="{ valid: passwordValidation.special }">
                          <font-awesome-icon :icon="passwordValidation.special ? 'check' : 'times'" />
                          包含特殊字符
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="passwordError" class="field-error">{{ passwordError }}</div>
                </div>
                
                <div class="form-group password-group">
                  <label class="form-label">
                    确认密码 <span class="required">*</span>
                  </label>
                  <div class="password-input">
                    <input v-model="formData.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" class="form-input password-field"
                      placeholder="请再次输入密码" required 
                      :class="{ 'error': confirmPasswordError }"
                      @blur="validateConfirmPassword" />
                    <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                      <font-awesome-icon :icon="showConfirmPassword ? 'eye-slash' : 'eye'" />
                    </button>
                  </div>
                  <div v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</div>
                </div>
              </div>
            </div>
            
            <!-- 其他登录方式说明 -->
            <div v-if="formData.loginMethods.length > 0 && !formData.loginMethods.includes('username')" class="login-info">
              <div class="info-card">
                <font-awesome-icon icon="info-circle" class="info-icon" />
                <div class="info-content">
                  <h4>登录方式说明</h4>
                  <p v-if="formData.loginMethods.includes('phone')">
                    <font-awesome-icon icon="mobile-alt" /> 手机登录：用户可使用已绑定的手机号码接收验证码登录
                  </p>
                  <p v-if="formData.loginMethods.includes('email')">
                    <font-awesome-icon icon="envelope" /> 邮箱登录：用户可使用已绑定的邮箱地址接收验证码登录
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 其他信息 -->
          <div class="form-section">
            <label class="section-title">其他信息</label>
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea v-model="formData.remark" class="form-textarea" placeholder="请输入备注信息" rows="3"></textarea>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-cancel" @click="close">取消</button>
        <button type="button" class="btn-submit" @click="handleSubmit">
          {{ isEdit ? '保存' : '添加' }}
        </button>
      </div>
    </div>

    <!-- 头像选择弹窗 -->
    <div v-if="showAvatarModal" class="avatar-modal-overlay" @click="closeAvatarModal">
      <div class="avatar-modal" @click.stop>
        <div class="avatar-modal-header">
          <h4>选择头像</h4>
          <button class="close-btn" @click="closeAvatarModal">
            <font-awesome-icon icon="times" />
          </button>
        </div>
        <div class="avatar-modal-body">
          <div class="avatar-grid">
            <div v-for="avatar in systemAvatars" :key="avatar.id" class="avatar-option"
              :class="{ active: formData.avatar === avatar.url }" @click="selectAvatar(avatar.url)">
              <img :src="avatar.url" :alt="avatar.name" />
              <div class="avatar-name">{{ avatar.name }}</div>
            </div>
          </div>
        </div>
        <div class="avatar-modal-footer">
          <button class="btn-cancel" @click="closeAvatarModal">取消</button>
          <button class="btn-submit" @click="confirmAvatarSelection">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'

interface Props {
  visible: boolean
  user?: any
  isEdit?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false
})

const emit = defineEmits<Emits>()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showAvatarModal = ref(false)
const showPasswordTooltip = ref(false)
const fileInput = ref<HTMLInputElement>()

// 表单验证错误信息
const nameError = ref('')
const emailError = ref('')
const phoneError = ref('')
const usernameError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const loginMethodError = ref('')

// 表单数据
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  username: '',
  status: 'active',
  password: '',
  confirmPassword: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  remark: '',
  loginMethods: ['username'] // 默认选择用户名密码登录
})

// 密码验证规则
const passwordValidation = reactive({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
})

// 密码强度
const passwordStrength = ref({
  level: 'weak',
  text: '弱'
})

// 系统头像
const systemAvatars = ref([
  { id: '1', name: '默认', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default' },
  { id: '2', name: '男性1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male1' },
  { id: '3', name: '男性2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male2' },
  { id: '4', name: '女性1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female1' },
  { id: '5', name: '女性2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female2' },
  { id: '6', name: '商务', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=business' },
  { id: '7', name: '休闲', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=casual' },
  { id: '8', name: '年轻', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=young' }
])

// 验证函数
const validateName = () => {
  if (!formData.name.trim()) {
    nameError.value = '请输入用户名'
  } else if (formData.name.trim().length < 2) {
    nameError.value = '用户名至少2个字符'
  } else {
    nameError.value = ''
  }
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email.trim()) {
    emailError.value = '请输入邮箱地址'
  } else if (!emailRegex.test(formData.email)) {
    emailError.value = '请输入正确的邮箱格式'
  } else {
    emailError.value = ''
  }
}

const validatePhone = () => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!formData.phone.trim()) {
    phoneError.value = '请输入手机号码'
  } else if (!phoneRegex.test(formData.phone)) {
    phoneError.value = '请输入正确的手机号码格式'
  } else {
    phoneError.value = ''
  }
}

const validateUsername = () => {
  if (!formData.username.trim()) {
    usernameError.value = '请输入登录用户名'
  } else if (formData.username.trim().length < 3) {
    usernameError.value = '登录用户名至少3个字符'
  } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
    usernameError.value = '用户名只能包含字母、数字和下划线'
  } else {
    usernameError.value = ''
  }
}

const validatePassword = () => {
  const password = formData.password
  
  // 重置验证状态
  passwordValidation.length = password.length >= 8
  passwordValidation.uppercase = /[A-Z]/.test(password)
  passwordValidation.lowercase = /[a-z]/.test(password)
  passwordValidation.number = /\d/.test(password)
  passwordValidation.special = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  // 计算密码强度
  const validCount = Object.values(passwordValidation).filter(Boolean).length
  if (validCount <= 2) {
    passwordStrength.value = { level: 'weak', text: '弱' }
  } else if (validCount <= 3) {
    passwordStrength.value = { level: 'medium', text: '中' }
  } else if (validCount <= 4) {
    passwordStrength.value = { level: 'strong', text: '强' }
  } else {
    passwordStrength.value = { level: 'very-strong', text: '很强' }
  }
  
  // 设置错误信息
  if (!password) {
    passwordError.value = '请输入密码'
  } else if (!passwordValidation.length) {
    passwordError.value = '密码至少8个字符'
  } else {
    passwordError.value = ''
  }
  
  // 重新验证确认密码
  if (formData.confirmPassword) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  if (!formData.confirmPassword) {
    confirmPasswordError.value = '请确认密码'
  } else if (formData.password !== formData.confirmPassword) {
    confirmPasswordError.value = '两次输入的密码不一致'
  } else {
    confirmPasswordError.value = ''
  }
}

// 登录方式验证
const validateLoginMethods = () => {
  if (formData.loginMethods.length === 0) {
    loginMethodError.value = '请至少选择一种登录方式'
  } else {
    loginMethodError.value = ''
  }
}

// 登录方式变化处理
const onLoginMethodChange = () => {
  validateLoginMethods()
  
  // 如果取消选择用户名密码登录，清空相关字段
  if (!formData.loginMethods.includes('username')) {
    formData.username = ''
    formData.password = ''
    formData.confirmPassword = ''
    usernameError.value = ''
    passwordError.value = ''
    confirmPasswordError.value = ''
  }
}

// 监听用户数据变化
watch(() => props.user, (newUser) => {
  if (newUser && props.isEdit) {
    Object.assign(formData, {
      name: newUser.name || '',
      email: newUser.email || '',
      phone: newUser.phone || '',
      username: newUser.username || '',
      status: newUser.status || 'active',
      avatar: newUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      remark: newUser.remark || ''
    })
  }
}, { immediate: true })

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    email: '',
    phone: '',
    username: '',
    status: 'active',
    password: '',
    confirmPassword: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
    remark: '',
    loginMethods: ['username'] // 重置为默认登录方式
  })
  // 重置密码显示状态
  showPassword.value = false
  showConfirmPassword.value = false
  showPasswordTooltip.value = false
  
  // 重置错误信息
  nameError.value = ''
  emailError.value = ''
  phoneError.value = ''
  usernameError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  loginMethodError.value = ''
}

// 关闭弹窗
const close = () => {
  emit('close')
  resetForm()
}

// 提交表单
const handleSubmit = () => {
  // 触发所有字段验证
  validateName()
  validateEmail()
  validatePhone()
  
  if (!props.isEdit) {
    // 验证登录方式
    validateLoginMethods()
    
    // 如果选择了用户名密码登录，验证相关字段
    if (formData.loginMethods.includes('username')) {
      validateUsername()
      validatePassword()
      validateConfirmPassword()
    }
  }
  
  // 检查是否有验证错误
  let hasErrors = nameError.value || emailError.value || phoneError.value
  
  if (!props.isEdit) {
    hasErrors = hasErrors || loginMethodError.value
    
    // 如果选择了用户名密码登录，检查相关错误
    if (formData.loginMethods.includes('username')) {
      hasErrors = hasErrors || usernameError.value || passwordError.value || confirmPasswordError.value
    }
  }
  
  if (hasErrors) {
    alert('请修正表单中的错误后再提交')
    return
  }
  
  // 检查密码强度（新增用户时且选择了用户名密码登录）
  if (!props.isEdit && formData.loginMethods.includes('username') && passwordStrength.value.level === 'weak') {
    if (!confirm('当前密码强度较弱，是否确认提交？')) {
      return
    }
  }

  emit('submit', { ...formData })
  close()
}

// 触发文件上传
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// 处理文件上传
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 检查文件大小（限制2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB')
      return
    }

    // 读取文件并转换为base64
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        formData.avatar = e.target.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

// 选择系统头像
const selectAvatar = (avatarUrl: string) => {
  formData.avatar = avatarUrl
}

// 关闭头像选择弹窗
const closeAvatarModal = () => {
  showAvatarModal.value = false
}

// 确认头像选择
const confirmAvatarSelection = () => {
  closeAvatarModal()
}
</script>

<style scoped>
.modal-overlay {
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

.modal-container {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
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

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
  background: rgba(0, 238, 255, 0.05);
}

.modal-title {
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

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #00eeff;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.current-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(0, 238, 255, 0.3);
  cursor: pointer;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: all 0.3s ease;
}

.current-avatar:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay span {
  font-size: 10px;
  color: #fff;
}

.avatar-actions {
  display: flex;
  gap: 12px;
}

.btn-avatar {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-avatar:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #e74c3c;
}

.form-input,
.form-select {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-select option {
  background: #1a2332;
  color: #fff;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  color: #00eeff;
}

.password-error {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: slideInDown 0.3s ease-out;
}

.password-error::before {
  content: '⚠';
  font-weight: bold;
}

/* 字段错误样式 */
.field-error {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: slideInDown 0.3s ease-out;
}

.field-error::before {
  content: '⚠';
  font-weight: bold;
}

/* 错误状态输入框 */
.form-input.error,
.form-select.error {
  border-color: #ff6b6b !important;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.3) !important;
}

/* 密码行布局 */
.password-row {
  display: flex;
  gap: 20px;
  margin-top: 16px;
}

.password-group {
  flex: 1;
  min-width: 0; /* 允许flex项目缩小 */
}

/* 密码字段调整宽度 */
.password-field {
  width: 100%;
  min-width: 250px;
}

/* 在小屏幕上改为垂直布局 */
@media (max-width: 768px) {
  .password-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .password-field {
    min-width: 280px;
  }
}

/* 登录方式选择样式 */
.login-methods {
  display: flex;
  gap: 20px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.checkbox-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 12px 16px;
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 8px;
  background: rgba(26, 35, 50, 0.6);
  transition: all 0.3s ease;
  min-width: 140px;
  position: relative;
}

.checkbox-item:hover {
  border-color: #00eeff;
  background: rgba(0, 238, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 238, 255, 0.2);
}

.checkbox-item input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-mark {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-item input[type="checkbox"]:checked + .checkbox-mark {
  background: linear-gradient(45deg, #00eeff, #0099cc);
  border-color: #00eeff;
}

.checkbox-item input[type="checkbox"]:checked + .checkbox-mark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.method-icon {
  margin-right: 6px;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.3s ease;
}

.checkbox-item:hover .method-icon,
.checkbox-item input[type="checkbox"]:checked ~ .method-icon {
  color: #00eeff;
}

.checkbox-item span:last-child {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  transition: color 0.3s ease;
}

.checkbox-item:hover span:last-child,
.checkbox-item input[type="checkbox"]:checked ~ span:last-child {
  color: white;
}

/* 登录配置区域 */
.login-config {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  background: rgba(0, 238, 255, 0.05);
  animation: slideInDown 0.3s ease-out;
}

/* 登录信息卡片 */
.login-info {
  margin-top: 20px;
}

.info-card {
  padding: 16px;
  background: rgba(26, 35, 50, 0.8);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-icon {
  color: #00eeff;
  font-size: 18px;
  margin-top: 2px;
  flex-shrink: 0;
}

.info-content h4 {
  color: white;
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
}

.info-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 4px 0;
  font-size: 13px;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-content p svg {
  color: #00eeff;
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-methods {
    flex-direction: column;
    gap: 12px;
  }
  
  .checkbox-item {
    min-width: auto;
  }
}

/* 密码工具提示 */
.password-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(26, 35, 50, 0.98);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  animation: tooltipFadeIn 0.3s ease-out;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.tooltip-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.strength-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.strength-indicator.weak {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.strength-indicator.medium {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.strength-indicator.strong {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.strength-indicator.very-strong {
  background: rgba(0, 238, 255, 0.2);
  color: #00eeff;
  border: 1px solid #00eeff;
}

.tooltip-requirements {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.requirement.valid {
  color: #28a745;
}

.requirement svg {
  width: 12px;
  height: 12px;
}

.requirement.valid svg {
  color: #28a745;
}

.requirement:not(.valid) svg {
  color: #ff6b6b;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-textarea {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
}

.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.checkbox-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.checkbox-item input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 238, 255, 0.3);
  border-radius: 4px;
  position: relative;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.checkbox-item input[type="checkbox"]:checked+.checkmark {
  background: #00eeff;
  border-color: #00eeff;
}

.checkbox-item input[type="checkbox"]:checked+.checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #0f2027;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-label {
  flex: 1;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.checkbox-label small {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid rgba(0, 238, 255, 0.2);
  background: rgba(0, 238, 255, 0.05);
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-submit {
  background: linear-gradient(45deg, #00eeff, #00b4db);
  color: #0f2027;
}

.btn-submit:hover {
  background: linear-gradient(45deg, #00b4db, #00eeff);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 238, 255, 0.3);
}

/* 头像选择弹窗 */
.avatar-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.avatar-modal {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
}

.avatar-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.avatar-modal-header h4 {
  color: #00eeff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.avatar-modal-body {
  padding: 20px;
  max-height: 50vh;
  overflow-y: auto;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.avatar-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-option:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 238, 255, 0.3);
}

.avatar-option.active {
  border-color: #00eeff;
  background: rgba(0, 238, 255, 0.1);
}

.avatar-option img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(0, 238, 255, 0.2);
}

.avatar-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.avatar-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(0, 238, 255, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .avatar-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .avatar-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-avatar {
    justify-content: center;
  }

  .avatar-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
  }

  .avatar-option img {
    width: 50px;
    height: 50px;
  }
}
</style>