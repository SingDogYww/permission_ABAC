<template>
  <div class="login-logs-page">
    <div class="page-header">
      <div class="page-title">
        <h1>
          <font-awesome-icon icon="sign-in-alt" />
          登录日志
        </h1>
        <p>用户登录行为分析</p>
      </div>
    </div>

    <div class="login-logs-content">
      <a-card>
        <div class="placeholder-content">
          <font-awesome-icon icon="sign-in-alt" size="3x" />
          <h2>登录日志</h2>
          <p>此页面将展示用户登录行为分析，包括登录时间、IP地址、设备信息、登录状态等。</p>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// 登录日志相关逻辑
</script>

<style scoped>
.login-logs-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title h1 {
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title p {
  color: rgba(255, 255, 255, 0.7);
  margin: 8px 0 0 0;
}

.placeholder-content {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.placeholder-content svg {
  color: #00eeff;
  margin-bottom: 20px;
}

.placeholder-content h2 {
  color: #ffffff;
  margin: 0 0 16px 0;
}

.placeholder-content p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.6;
}
</style> 