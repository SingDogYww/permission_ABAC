<template>
  <div class="login-container">
    <!-- 粒子背景 -->
    <div id="particles-js"></div>
    
    <div class="container" :class="{ active: containerActive }">
      <div class="form-content">
        <div class="logo">
          <font-awesome-icon icon="user-astronaut" class="logo-icon" />
          <h2>未来科技平台</h2>
        </div>
        
        <div class="login-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            class="tab-btn" 
            :class="{ active: activeTab === tab.key }"
            @click="switchTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <div class="form-container">
        <!-- 用户名密码登录表单 -->
        <form 
          class="login-form" 
          :class="{ active: activeTab === 'username' }"
          @submit.prevent="handleLogin"
        >
          <div class="input-group">
            <font-awesome-icon icon="user" />
            <input 
              v-model="usernameForm.username" 
              type="text" 
              placeholder="用户名/账号" 
              required 
            />
          </div>
          
          <div class="input-group">
            <font-awesome-icon icon="lock" />
            <input 
              v-model="usernameForm.password" 
              type="password" 
              placeholder="密码" 
              required 
            />
          </div>
          
          <div class="options">
            <label class="remember">
              <input v-model="usernameForm.remember" type="checkbox" />
              记住我
            </label>
            <a href="#" class="forgot-password">忘记密码?</a>
          </div>
          
          <button type="submit" class="login-btn">登 录</button>
        </form>
        
        <!-- 手机验证码登录表单 -->
        <form 
          class="login-form" 
          :class="{ active: activeTab === 'phone' }"
          @submit.prevent="handlePhoneLogin"
        >
          <div class="input-group">
            <font-awesome-icon icon="mobile-alt" />
            <input 
              v-model="phoneForm.phone" 
              type="tel" 
              placeholder="手机号码" 
              required 
            />
          </div>
          
          <div class="code-container">
            <div class="input-group">
              <font-awesome-icon icon="sms" />
              <input 
                v-model="phoneForm.code" 
                type="text" 
                placeholder="验证码" 
                required 
              />
            </div>
            <button 
              type="button" 
              class="send-code" 
              :disabled="countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
            </button>
          </div>
          
          <button type="submit" class="login-btn">登 录</button>
        </form>
        
        <!-- 邮箱登录表单 -->
        <form 
          class="login-form" 
          :class="{ active: activeTab === 'email' }"
          @submit.prevent="handleEmailLogin"
        >
          <div class="input-group">
            <font-awesome-icon icon="envelope" />
            <input 
              v-model="emailForm.email" 
              type="email" 
              placeholder="电子邮箱" 
              required 
            />
          </div>
          
          <div class="input-group">
            <font-awesome-icon icon="lock" />
            <input 
              v-model="emailForm.password" 
              type="password" 
              placeholder="密码" 
              required 
            />
          </div>
          
          <div class="options">
            <label class="remember">
              <input v-model="emailForm.remember" type="checkbox" />
              记住我
            </label>
            <a href="#" class="forgot-password">忘记密码?</a>
          </div>
          
          <button type="submit" class="login-btn">登 录</button>
        </form>
      </div>
      
      <div class="other-login">
        <span>其他登录方式</span>
        <div class="social-icons">
          <a href="#"><font-awesome-icon :icon="['fab', 'weixin']" /></a>
          <a href="#"><font-awesome-icon :icon="['fab', 'qq']" /></a>
          <a href="#"><font-awesome-icon :icon="['fab', 'weibo']" /></a>
          <a href="#"><font-awesome-icon :icon="['fab', 'github']" /></a>
        </div>
      </div>
      
        <div class="register">
          还没有账号? <a href="#" @click="goToRegister">立即注册</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { tsParticles } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'

const router = useRouter()

// 响应式数据
const activeTab = ref('username')
const countdown = ref(0)
const containerActive = ref(false)


// 表单数据
const usernameForm = reactive({
  username: '',
  password: '',
  remember: false
})

const phoneForm = reactive({
  phone: '',
  code: ''
})

const emailForm = reactive({
  email: '',
  password: '',
  remember: false
})

// 标签页配置
const tabs = [
  { key: 'username', label: '账号登录' },
  { key: 'phone', label: '手机登录' },
  { key: 'email', label: '邮箱登录' }
]

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

// 方法
const switchTab = (tab: string) => {
  if (tab === activeTab.value) return
  activeTab.value = tab
}

const sendCode = () => {
  if (!phoneForm.phone) {
    alert('请先输入手机号码')
    return
  }
  
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleLogin = () => {
  // TODO: 实现登录逻辑
  // 暂时设置一个token以通过路由守卫
  localStorage.setItem('token', 'temp-token-for-demo')
  // 跳转到管理平台
  router.push('/dashboard')
}

const handlePhoneLogin = () => {
  // TODO: 实现手机登录逻辑
  // 暂时设置一个token以通过路由守卫
  localStorage.setItem('token', 'temp-token-for-demo')
  // 跳转到管理平台
  router.push('/dashboard')
}

const handleEmailLogin = () => {
  // TODO: 实现邮箱登录逻辑
  // 暂时设置一个token以通过路由守卫
  localStorage.setItem('token', 'temp-token-for-demo')
  // 跳转到管理平台
  router.push('/dashboard')
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

.login-container {
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
  width: 400px;
  padding: 40px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  min-height: auto;
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

.form-content {
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s;
}

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
  margin-top: 15px;
  letter-spacing: 1px;
  font-weight: 600;
}

.login-tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 12px 0;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  font-weight: 500;
  transform: scale(1);
}

.tab-btn:hover {
  color: rgba(0, 238, 255, 0.8);
  transform: scale(1.05);
}

.tab-btn.active {
  color: #00eeff;
  transform: scale(1.1);
}

.tab-btn::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #00b4db, #0083b0);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
  border-radius: 2px;
}

.tab-btn.active::after {
  width: 100%;
}

.form-container {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.login-form {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  pointer-events: none;
  transform: translateY(20px);
  transition: none;
}

.login-form.active {
  opacity: 1;
  pointer-events: all;
  transform: translateY(0);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.input-group {
  margin-bottom: 25px;
  position: relative;
}



.input-group .fa-icon,
.input-group svg {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
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

.input-group input:focus ~ svg,
.input-group input:focus ~ .fa-icon {
  color: #00eeff;
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.code-container {
  display: flex;
  gap: 15px;
}

.code-container .input-group {
  flex: 1;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-code:hover:not(:disabled) {
  background: linear-gradient(45deg, #0083b0, #00b4db);
  box-shadow: 0 0 15px rgba(0, 180, 219, 0.4);
}

.send-code:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.remember input {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.remember input:checked::before {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #00eeff;
  font-size: 12px;
  font-weight: bold;
}

.forgot-password {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.3s ease;
}

.forgot-password:hover {
  color: #00eeff;
}

.login-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(45deg, #00eeff, #00b4db);
  border: none;
  border-radius: 10px;
  color: #0f2027;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  box-shadow: 0 5px 15px rgba(0, 238, 255, 0.3);
}

.login-form.active .login-btn:hover {
  background: linear-gradient(45deg, #00b4db, #00eeff);
  box-shadow: 0 0 20px rgba(0, 238, 255, 0.5);
  transform: translateY(-2px);
}

.other-login {
  margin-top: 30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  position: relative;
  transform: translateY(15px);
  opacity: 0;
  transition: all 0.3s ease;
}

.container.active .other-login {
  transform: translateY(0);
  opacity: 1;
  transition-delay: 0.45s;
}

.other-login::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.other-login span {
  background: rgba(15, 23, 42, 0.8);
  padding: 0 15px;
  position: relative;
  z-index: 1;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.social-icons a {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-icons a:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  transform: translateY(-5px);
}

.register {
  text-align: center;
  margin-top: 25px;
  color: rgba(255, 255, 255, 0.6);
  transform: translateY(15px);
  opacity: 0;
  transition: all 0.3s ease;
}

.container.active .register {
  transform: translateY(0);
  opacity: 1;
  transition-delay: 0.5s;
}

.register a {
  color: #00eeff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 5px;
  transition: all 0.3s ease;
}

.register a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .container {
    width: 90%;
    padding: 30px 20px;
  }
  
  .logo h2 {
    font-size: 24px;
  }
  
  .tab-btn {
    font-size: 14px;
    padding: 10px 0;
  }
}
</style> 