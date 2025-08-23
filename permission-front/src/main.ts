import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/reset.css'

// 引入全局样式系统
import './styles/global.css'
import './styles/components.css'
import './styles/antd-override.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(fas, fab)

// 引入权限指令
import { permission, role } from './directives/permission'

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)

// 注册权限指令
app.directive('permission', permission)
app.directive('role', role)

app.use(createPinia())
app.use(router)

// 初始化认证状态
const initApp = async () => {
  const { useUserStore } = await import('./stores/user')
  const userStore = useUserStore()
  userStore.initializeAuth()
  
  app.mount('#app')
}

initApp()
