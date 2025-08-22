<template>
  <div class="register-container">
    <!-- 粒子背景 -->
    <div id="particles-js"></div>
    
    <div class="container" :class="{ active: containerActive }">
      <div class="form-content">
        <!-- Logo区域 -->
        <div class="logo">
          <font-awesome-icon icon="user-astronaut" class="logo-icon" />
          <h2>未来科技平台</h2>
          <p class="subtitle">创建新账户</p>
        </div>
        
        <!-- 进度指示器 -->
        <div class="progress-indicator">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <span>账户信息</span>
          </div>
          <div class="step-connector" :class="{ active: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <span>身份验证</span>
          </div>
          <div class="step-connector" :class="{ active: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
            <div class="step-number">3</div>
            <span>注册完成</span>
          </div>
        </div>
        
        <!-- 步骤内容区域 -->
        <div class="step-container">
          <!-- 步骤一：账户密码注册 -->
          <form 
            class="register-form" 
            :class="{ active: currentStep === 1 }"
            @submit.prevent="handleStep1"
          >
            <div class="step-title">
              <h3>创建账户</h3>
              <p>请填写您的基本信息</p>
            </div>
            
            <div class="input-group">
              <font-awesome-icon icon="user" />
              <input 
                v-model="accountForm.username" 
                type="text" 
                placeholder="用户名（3-20个字符）" 
                required 
                @blur="validateUsername"
              />
              <div v-if="validation.username.show" class="validation-message" :class="validation.username.type">
                {{ validation.username.message }}
              </div>
            </div>
            
            <div class="input-group">
              <font-awesome-icon icon="lock" />
              <input 
                v-model="accountForm.password" 
                type="password" 
                placeholder="密码" 
                required 
                @input="validatePassword"
              />
              <div class="password-strength">
                <div class="strength-bar">
                  <div 
                    class="strength-fill" 
                    :class="passwordStrength.level"
                    :style="{ width: passwordStrength.width }"
                  ></div>
                </div>
                <span class="strength-text" :class="passwordStrength.level">
                  {{ passwordStrength.text }}
                </span>
              </div>
              <div class="password-tips">
                <div class="tip-item" :class="{ valid: passwordChecks.length }">
                  <font-awesome-icon :icon="passwordChecks.length ? 'check' : 'times'" />
                  至少8个字符
                </div>
                <div class="tip-item" :class="{ valid: passwordChecks.uppercase }">
                  <font-awesome-icon :icon="passwordChecks.uppercase ? 'check' : 'times'" />
                  包含大写字母
                </div>
                <div class="tip-item" :class="{ valid: passwordChecks.lowercase }">
                  <font-awesome-icon :icon="passwordChecks.lowercase ? 'check' : 'times'" />
                  包含小写字母
                </div>
                <div class="tip-item" :class="{ valid: passwordChecks.number }">
                  <font-awesome-icon :icon="passwordChecks.number ? 'check' : 'times'" />
                  包含数字
                </div>
                <div class="tip-item" :class="{ valid: passwordChecks.special }">
                  <font-awesome-icon :icon="passwordChecks.special ? 'check' : 'times'" />
                  包含特殊字符
                </div>
              </div>
            </div>
            
            <div class="input-group">
              <font-awesome-icon icon="lock" />
              <input 
                v-model="accountForm.confirmPassword" 
                type="password" 
                placeholder="确认密码" 
                required 
                @blur="validateConfirmPassword"
              />
              <div v-if="validation.confirmPassword.show" class="validation-message" :class="validation.confirmPassword.type">
                {{ validation.confirmPassword.message }}
              </div>
            </div>
            
            <button type="submit" class="register-btn" :disabled="!canProceedStep1">
              下一步
            </button>
          </form>
          
          <!-- 步骤二：绑定手机或邮箱 -->
          <div class="register-form" :class="{ active: currentStep === 2 }">
            <div class="step-title">
              <h3>身份验证</h3>
              <p>请选择验证方式并完成验证</p>
            </div>
            
            <!-- 验证方式选择 -->
            <div class="verify-tabs">
              <button 
                type="button"
                class="verify-tab" 
                :class="{ active: verifyType === 'phone' }"
                @click="verifyType = 'phone'"
              >
                <font-awesome-icon icon="mobile-alt" />
                手机验证
              </button>
              <button 
                type="button"
                class="verify-tab" 
                :class="{ active: verifyType === 'email' }"
                @click="verifyType = 'email'"
              >
                <font-awesome-icon icon="envelope" />
                邮箱验证
              </button>
            </div>
            
            <!-- 手机验证 -->
            <form 
              v-if="verifyType === 'phone'" 
              class="verify-form"
              @submit.prevent="handlePhoneVerify"
            >
              <div class="input-group">
                <font-awesome-icon icon="mobile-alt" />
                <input 
                  v-model="verifyForm.phone" 
                  type="tel" 
                  placeholder="请输入手机号码" 
                  required 
                />
              </div>
              
              <div class="code-container">
                <div class="input-group">
                  <font-awesome-icon icon="sms" />
                  <input 
                    v-model="verifyForm.phoneCode" 
                    type="text" 
                    placeholder="验证码" 
                    required 
                  />
                </div>
                <button 
                  type="button" 
                  class="send-code" 
                  :disabled="phoneCountdown > 0"
                  @click="sendPhoneCode"
                >
                  {{ phoneCountdown > 0 ? `${phoneCountdown}秒后重发` : '获取验证码' }}
                </button>
              </div>
              
              <div class="form-actions">
                <button type="button" class="back-btn" @click="goToStep(1)">
                  上一步
                </button>
                <button type="submit" class="register-btn" :disabled="!canProceedStep2Phone">
                  验证并注册
                </button>
              </div>
            </form>
            
            <!-- 邮箱验证 -->
            <form 
              v-if="verifyType === 'email'" 
              class="verify-form"
              @submit.prevent="handleEmailVerify"
            >
              <div class="input-group">
                <font-awesome-icon icon="envelope" />
                <input 
                  v-model="verifyForm.email" 
                  type="email" 
                  placeholder="请输入邮箱地址" 
                  required 
                />
              </div>
              
              <div class="code-container">
                <div class="input-group">
                  <font-awesome-icon icon="key" />
                  <input 
                    v-model="verifyForm.emailCode" 
                    type="text" 
                    placeholder="验证码" 
                    required 
                  />
                </div>
                <button 
                  type="button" 
                  class="send-code" 
                  :disabled="emailCountdown > 0"
                  @click="sendEmailCode"
                >
                  {{ emailCountdown > 0 ? `${emailCountdown}秒后重发` : '获取验证码' }}
                </button>
              </div>
              
              <div class="form-actions">
                <button type="button" class="back-btn" @click="goToStep(1)">
                  上一步
                </button>
                <button type="submit" class="register-btn" :disabled="!canProceedStep2Email">
                  验证并注册
                </button>
              </div>
            </form>
          </div>
          
          <!-- 步骤三：注册成功 -->
          <div class="register-form success-form" :class="{ active: currentStep === 3 }">
            <div class="success-content">
              <div class="success-icon">
                <font-awesome-icon icon="check-circle" />
              </div>
              <h3>注册成功！</h3>
              <p>恭喜您成功创建账户</p>
              <div class="success-info">
                <div class="info-item">
                  <span class="label">用户名：</span>
                  <span class="value">{{ accountForm.username }}</span>
                </div>
                <div class="info-item">
                  <span class="label">验证方式：</span>
                  <span class="value">
                    {{ verifyType === 'phone' ? `手机 ${verifyForm.phone}` : `邮箱 ${verifyForm.email}` }}
                  </span>
                </div>
              </div>
              <div class="countdown-info">
                <p>{{ countdown }}秒后自动跳转到登录页面</p>
                <div class="countdown-bar">
                  <div class="countdown-fill" :style="{ width: countdownProgress + '%' }"></div>
                </div>
              </div>
              <button type="button" class="login-now-btn" @click="goToLogin">
                立即登录
              </button>
            </div>
          </div>
        </div>
        
        <!-- 底部链接 -->
        <div class="footer-links" v-if="currentStep < 3">
          <span>已有账号？</span>
          <a href="#" @click="goToLogin">立即登录</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { tsParticles } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'

const router = useRouter()

// 响应式数据
const currentStep = ref(1)
const containerActive = ref(false)
const verifyType = ref('phone')
const phoneCountdown = ref(0)
const emailCountdown = ref(0)
const countdown = ref(5)

// 表单数据
const accountForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const verifyForm = reactive({
  phone: '',
  phoneCode: '',
  email: '',
  emailCode: ''
})

// 验证状态
const validation = reactive({
  username: { show: false, type: '', message: '' },
  confirmPassword: { show: false, type: '', message: '' }
})

// 密码强度检查
const passwordChecks = reactive({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
})

// 密码强度计算
const passwordStrength = computed(() => {
  const checks = Object.values(passwordChecks)
  const validCount = checks.filter(Boolean).length
  
  if (validCount === 0) return { level: 'weak', width: '0%', text: '' }
  if (validCount <= 2) return { level: 'weak', width: '25%', text: '弱' }
  if (validCount <= 3) return { level: 'medium', width: '50%', text: '中等' }
  if (validCount <= 4) return { level: 'strong', width: '75%', text: '强' }
  return { level: 'very-strong', width: '100%', text: '非常强' }
})

// 步骤验证
const canProceedStep1 = computed(() => {
  return accountForm.username.length >= 3 && 
         accountForm.password.length >= 8 && 
         accountForm.confirmPassword === accountForm.password &&
         Object.values(passwordChecks).filter(Boolean).length >= 3
})

const canProceedStep2Phone = computed(() => {
  return verifyForm.phone && verifyForm.phoneCode.length === 6
})

const canProceedStep2Email = computed(() => {
  return verifyForm.email && verifyForm.emailCode.length === 6
})

// 倒计时进度
const countdownProgress = computed(() => {
  return ((5 - countdown.value) / 5) * 100
})

// 粒子背景初始化
onMounted(async () => {
  await loadSlim(tsParticles)
  
  await tsParticles.load({
    id: "particles-js",
    options: {
      background: {
        color: {
          value: "transparent"
        }
      },
      fpsLimit: 120,
      particles: {
        color: {
          value: "#00eeff"
        },
        links: {
          color: "#00eeff",
          distance: 150,
          enable: true,
          opacity: 0.15,
          width: 1
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce"
          },
          random: false,
          speed: 0.8,
          straight: false
        },
        number: {
          density: {
            enable: true,
            area: 800
          },
          value: 150
        },
        opacity: {
          value: 0.5
        },
        shape: {
          type: "circle"
        },
        size: {
          value: { min: 0.5, max: 2 }
        }
      },
      detectRetina: true,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push"
          },
          onHover: {
            enable: true,
            mode: "grab"
          },
          resize: true
        },
        modes: {
          push: {
            quantity: 4
          },
          grab: {
            distance: 140,
            links: {
              opacity: 1
            }
          }
        }
      }
    }
  })
  
  // 延迟激活容器动画
  setTimeout(() => {
    containerActive.value = true
  }, 100)
})

// 验证方法
const validateUsername = () => {
  if (accountForm.username.length < 3) {
    validation.username = { show: true, type: 'error', message: '用户名至少需要3个字符' }
  } else if (accountForm.username.length > 20) {
    validation.username = { show: true, type: 'error', message: '用户名不能超过20个字符' }
  } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(accountForm.username)) {
    validation.username = { show: true, type: 'error', message: '用户名只能包含字母、数字、下划线和中文' }
  } else {
    validation.username = { show: true, type: 'success', message: '用户名可用' }
  }
}

const validatePassword = () => {
  const password = accountForm.password
  passwordChecks.length = password.length >= 8
  passwordChecks.uppercase = /[A-Z]/.test(password)
  passwordChecks.lowercase = /[a-z]/.test(password)
  passwordChecks.number = /\d/.test(password)
  passwordChecks.special = /[!@#$%^&*(),.?":{}|<>]/.test(password)
}

const validateConfirmPassword = () => {
  if (accountForm.confirmPassword !== accountForm.password) {
    validation.confirmPassword = { show: true, type: 'error', message: '两次输入的密码不一致' }
  } else {
    validation.confirmPassword = { show: true, type: 'success', message: '密码确认无误' }
  }
}

// 步骤处理方法
const handleStep1 = () => {
  if (canProceedStep1.value) {
    currentStep.value = 2
  }
}

const goToStep = (step: number) => {
  currentStep.value = step
}

const sendPhoneCode = () => {
  if (!verifyForm.phone) {
    alert('请先输入手机号码')
    return
  }
  
  phoneCountdown.value = 60
  const timer = setInterval(() => {
    phoneCountdown.value--
    if (phoneCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  
  // TODO: 发送短信验证码
}

const sendEmailCode = () => {
  if (!verifyForm.email) {
    alert('请先输入邮箱地址')
    return
  }
  
  emailCountdown.value = 60
  const timer = setInterval(() => {
    emailCountdown.value--
    if (emailCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  
  // TODO: 发送邮箱验证码
}

const handlePhoneVerify = () => {
  if (canProceedStep2Phone.value) {
    // TODO: 验证手机验证码
    completeRegistration()
  }
}

const handleEmailVerify = () => {
  if (canProceedStep2Email.value) {
    // TODO: 验证邮箱验证码
    completeRegistration()
  }
}

const completeRegistration = () => {
  currentStep.value = 3
  startCountdown()
}

const startCountdown = () => {
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      goToLogin()
    }
  }, 1000)
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  overflow: hidden;
  position: relative;
}

/* 粒子背景效果 */
#particles-js {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.container {
  position: relative;
  z-index: 10;
  width: 480px;
  max-width: 90vw;
  max-height: 90vh;
  padding: 40px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
  transform: translateY(50px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.1), rgba(0, 255, 255, 0.05), transparent);
  transform: rotate(0deg);
  animation: animate 6s linear infinite;
  z-index: -1;
}

@keyframes animate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.container.active {
  transform: translateY(0);
  opacity: 1;
}

.container.active .form-content {
  transform: translateY(0);
  opacity: 1;
}

/* 自定义滚动条 */
.container::-webkit-scrollbar {
  width: 6px;
}

.container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.container::-webkit-scrollbar-thumb {
  background: rgba(0, 238, 255, 0.3);
  border-radius: 3px;
}

.container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 238, 255, 0.5);
}

.form-content {
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s;
}

/* Logo样式 */
.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo-icon {
  font-size: 48px;
  color: #00eeff;
  text-shadow: 0 0 10px rgba(0, 238, 255, 0.7);
  display: inline-block;
  filter: drop-shadow(0 0 10px rgba(0, 238, 255, 0.7));
}

.logo h2 {
  color: #fff;
  font-size: 28px;
  margin: 15px 0 5px 0;
  letter-spacing: 1px;
  font-weight: 600;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
}

/* 进度指示器 */
.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  padding: 0 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.step.active .step-number {
  background: linear-gradient(45deg, #00eeff, #00b4db);
  color: #0f2027;
  border-color: #00eeff;
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.5);
}

.step.completed .step-number {
  background: #00eeff;
  color: #0f2027;
  border-color: #00eeff;
}

.step span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  text-align: center;
}

.step.active span {
  color: #00eeff;
  font-weight: 500;
}

.step.completed span {
  color: #00eeff;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 15px;
  transition: all 0.3s ease;
}

.step-connector.active {
  background: linear-gradient(90deg, #00eeff, #00b4db);
}

/* 步骤容器 */
.step-container {
  position: relative;
  min-height: 480px;
}

.register-form {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  pointer-events: none;
  transform: translateX(30px);
  transition: all 0.4s ease;
}

.register-form.active {
  opacity: 1;
  pointer-events: all;
  transform: translateX(0);
}

.step-title {
  text-align: center;
  margin-bottom: 30px;
}

.step-title h3 {
  color: #fff;
  font-size: 24px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.step-title p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 14px;
}

/* 输入组样式 */
.input-group {
  margin-bottom: 25px;
  position: relative;
}

.input-group svg {
  position: absolute;
  left: 15px;
  top: 15px;
  transform: translateY(0);
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  transition: all 0.3s ease;
  z-index: 1;
}

.input-group input {
  width: 100%;
  padding: 15px 15px 15px 45px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
}

.input-group input:focus ~ svg {
  color: #00eeff;
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* 验证消息 */
.validation-message {
  margin-top: 8px;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.validation-message.error {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.validation-message.success {
  color: #51cf66;
  background: rgba(81, 207, 102, 0.1);
  border: 1px solid rgba(81, 207, 102, 0.3);
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak {
  background: #ff6b6b;
}

.strength-fill.medium {
  background: #feca57;
}

.strength-fill.strong {
  background: #48dbfb;
}

.strength-fill.very-strong {
  background: #00eeff;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
  min-width: 50px;
}

.strength-text.weak {
  color: #ff6b6b;
}

.strength-text.medium {
  color: #feca57;
}

.strength-text.strong {
  color: #48dbfb;
}

.strength-text.very-strong {
  color: #00eeff;
}

/* 密码提示 */
.password-tips {
  margin-top: 15px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  padding: 4px 0;
}

.tip-item.valid {
  color: #51cf66;
  font-weight: 500;
}

.tip-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.tip-item:not(.valid) svg {
  color: #ff6b6b;
}

.tip-item.valid svg {
  color: #51cf66;
  filter: drop-shadow(0 0 4px rgba(81, 207, 102, 0.4));
}

/* 验证方式选择 */
.verify-tabs {
  display: flex;
  margin-bottom: 25px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
}

.verify-tab {
  flex: 1;
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.verify-tab.active {
  background: linear-gradient(45deg, #00eeff, #00b4db);
  color: #0f2027;
  font-weight: 500;
}

/* 验证码容器 */
.code-container {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.code-container .input-group {
  flex: 1;
  margin-bottom: 0;
}

.send-code {
  flex: 0 0 120px;
  height: 48px;
  background: linear-gradient(45deg, #00b4db, #0083b0);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.send-code:hover:not(:disabled) {
  background: linear-gradient(45deg, #0083b0, #00b4db);
  box-shadow: 0 0 15px rgba(0, 180, 219, 0.4);
}

.send-code:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  gap: 15px;
}

.back-btn {
  flex: 1;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.register-btn {
  flex: 2;
  padding: 15px;
  background: linear-gradient(45deg, #00eeff, #00b4db);
  border: none;
  border-radius: 10px;
  color: #0f2027;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  box-shadow: 0 5px 15px rgba(0, 238, 255, 0.3);
}

.register-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #00b4db, #00eeff);
  box-shadow: 0 0 20px rgba(0, 238, 255, 0.5);
  transform: translateY(-2px);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* 成功页面样式 */
.success-form {
  text-align: center;
}

.success-content {
  padding: 20px 0;
}

.success-icon {
  margin-bottom: 20px;
}

.success-icon svg {
  font-size: 80px;
  color: #51cf66;
  filter: drop-shadow(0 0 20px rgba(81, 207, 102, 0.5));
}

.success-content h3 {
  color: #fff;
  font-size: 32px;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.success-content > p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0 0 30px 0;
}

.success-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.value {
  color: #00eeff;
  font-weight: 500;
  font-size: 14px;
}

.countdown-info {
  margin-bottom: 25px;
}

.countdown-info p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0 0 10px 0;
}

.countdown-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.countdown-fill {
  height: 100%;
  background: linear-gradient(90deg, #00eeff, #00b4db);
  transition: width 1s linear;
  border-radius: 2px;
}

.login-now-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(45deg, #00eeff, #00b4db);
  border: none;
  border-radius: 10px;
  color: #0f2027;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
}

.login-now-btn:hover {
  background: linear-gradient(45deg, #00b4db, #00eeff);
  box-shadow: 0 0 20px rgba(0, 238, 255, 0.5);
  transform: translateY(-2px);
}

/* 底部链接 */
.footer-links {
  text-align: center;
  margin-top: 30px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.footer-links a {
  color: #00eeff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 5px;
  transition: all 0.3s ease;
}

.footer-links a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .container {
    width: 95%;
    padding: 30px 20px;
    max-height: 95vh;
  }
  
  .logo h2 {
    font-size: 24px;
  }
  
  .progress-indicator {
    padding: 0 10px;
  }
  
  .step-connector {
    margin: 0 10px;
  }
  
  .step span {
    font-size: 10px;
  }
  
  .password-tips {
    grid-template-columns: 1fr;
    padding: 10px;
  }
  
  .step-container {
    min-height: 420px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .code-container {
    flex-direction: column;
  }
  
  .send-code {
    flex: none;
    width: 100%;
  }
}
</style> 