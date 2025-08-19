<template>
  <div class="audit-page">
    <div class="page-header">
      <div class="page-title">
        <h1>
          <font-awesome-icon icon="history" />
          操作日志
        </h1>
        <p>用户操作审计记录</p>
      </div>
    </div>

    <div class="audit-content">
      <a-card>
        <div class="placeholder-content">
          <font-awesome-icon icon="history" size="3x" />
          <h2>操作日志</h2>
          <p>此页面将展示用户操作审计记录，包括操作时间、操作用户、操作内容等详细信息。</p>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// 操作日志相关逻辑
</script>

<style scoped>
.audit-page {
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