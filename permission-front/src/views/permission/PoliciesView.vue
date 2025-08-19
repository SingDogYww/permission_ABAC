<template>
  <div class="policies-page">
    <div class="page-header">
      <div class="page-title">
        <h1>
          <font-awesome-icon icon="scroll" />
          权限策略
        </h1>
        <p>ABAC策略管理</p>
      </div>
    </div>

    <div class="policies-content">
      <a-card>
        <div class="placeholder-content">
          <font-awesome-icon icon="scroll" size="3x" />
          <h2>权限策略</h2>
          <p>此页面将包含ABAC权限策略的创建、编辑和管理功能。</p>
          <p>支持基于属性的访问控制策略配置，包括主体、客体、操作和环境属性条件。</p>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// 权限策略相关逻辑
</script>

<style scoped>
.policies-page {
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

.placeholder-content p {
  margin: 10px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
</style>
