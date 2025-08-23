<template>
  <div class="settings-page">
    <div class="page-header">
      <div class="page-title">
        <h1>
          <font-awesome-icon icon="sliders-h" />
          系统设置
        </h1>
        <p>系统配置参数管理</p>
      </div>
    </div>

    <div class="settings-content">
      <div class="content-card">
        <div class="placeholder-content">
          <font-awesome-icon icon="sliders-h" size="3x" />
          <h2>系统设置</h2>
          <p>此页面将提供系统基础配置和参数设置功能。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 系统设置相关逻辑
</script>

<style scoped>
.settings-page {
  padding: 0;
  min-height: calc(100vh - 70px);
}

.page-header {
  margin-bottom: 32px;
}

.page-title h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title svg {
  color: #00eeff;
  text-shadow: 0 0 8px rgba(0, 238, 255, 0.5);
}

.page-title p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
}

.content-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.content-card:hover {
  border-color: rgba(0, 238, 255, 0.4);
  box-shadow: 0 4px 20px rgba(0, 238, 255, 0.1);
}

.placeholder-content {
  text-align: center;
  padding: 80px 40px;
  color: rgba(255, 255, 255, 0.6);
}

.placeholder-content svg {
  color: #00eeff;
  margin-bottom: 24px;
  filter: drop-shadow(0 0 8px rgba(0, 238, 255, 0.3));
}

.placeholder-content h2 {
  margin: 24px 0 16px 0;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
}

.placeholder-content p {
  margin: 12px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
}
</style>
