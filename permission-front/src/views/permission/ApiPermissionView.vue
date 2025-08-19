<template>
  <div class="api-permission">
    <div class="page-header">
      <h1>接口权限管理</h1>
      <p>管理API接口访问权限</p>
    </div>
    
    <div class="management-content">
      <h2>接口权限管理功能开发中...</h2>
      <p>此页面将包含API接口权限控制功能。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.api-permission {
  padding: var(--spacing-lg);
}

.page-header h1 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.page-header p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.management-content {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--border-primary);
}

.management-content h2 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.management-content p {
  color: var(--text-secondary);
}
</style> 