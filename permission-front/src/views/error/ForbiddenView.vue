<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">
        <font-awesome-icon icon="exclamation-triangle" />
      </div>
      <h1>403</h1>
      <h2>访问被拒绝</h2>
      <p>您没有权限访问此页面</p>
      <a-button type="primary" @click="goBack">返回上一页</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.error-content {
  text-align: center;
}

.error-icon {
  font-size: 5rem;
  color: var(--error-color);
  margin-bottom: 2rem;
}

h1 {
  font-size: 4rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}
</style> 