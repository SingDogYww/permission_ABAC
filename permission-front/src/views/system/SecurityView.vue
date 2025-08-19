<template>
  <div class="security-page">
    <div class="page-header">
      <div class="page-title">
        <h1>
          <font-awesome-icon icon="shield-virus" />
          安全监控
        </h1>
        <p>实时安全事件监控与防护</p>
      </div>
    </div>

    <div class="security-content">
      <a-card>
        <div class="placeholder-content">
          <font-awesome-icon icon="shield-virus" size="3x" />
          <h2>安全监控</h2>
          <p>此页面将展示实时安全事件监控、威胁检测、安全防护状态等信息。</p>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// 安全监控相关逻辑
</script>

<style scoped>
.security-page {
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