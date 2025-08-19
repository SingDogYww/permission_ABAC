<template>
  <div class="resources-page">
    <div class="page-header">
      <div class="page-title">
        <h1>
          <font-awesome-icon icon="sitemap" />
          资源管理
        </h1>
        <p>菜单和API资源管理</p>
      </div>
    </div>

    <div class="resources-content">
      <a-card>
        <div class="placeholder-content">
          <font-awesome-icon icon="sitemap" size="3x" />
          <h2>资源管理</h2>
          <p>此页面将包含系统资源的管理和权限配置功能。</p>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// 资源管理相关逻辑
</script>

<style scoped>
.resources-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-title h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.placeholder-content {
  text-align: center;
  padding: 60px 20px;
  color: #8c8c8c;
}

.placeholder-content h2 {
  margin: 20px 0 10px 0;
  color: #595959;
}
</style>
