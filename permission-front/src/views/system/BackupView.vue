<template>
  <div class="backup-page">
    <div class="page-header">
      <div class="page-title">
        <h1>
          <font-awesome-icon icon="save" />
          数据备份
        </h1>
        <p>数据备份恢复</p>
      </div>
    </div>

    <div class="backup-content">
      <a-card>
        <div class="placeholder-content">
          <font-awesome-icon icon="save" size="3x" />
          <h2>数据备份</h2>
          <p>此页面将包含数据备份和恢复功能。</p>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// 数据备份相关逻辑
</script>

<style scoped>
.backup-page {
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
