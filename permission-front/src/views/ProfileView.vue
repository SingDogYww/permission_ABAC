<template>
  <div class="profile">
    <div class="page-header">
      <h1>个人资料</h1>
      <p>管理个人账户信息和设置</p>
    </div>
    
    <div class="management-content">
      <h2>个人资料功能开发中...</h2>
      <p>此页面将包含个人信息编辑和账户设置功能。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.profile {
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