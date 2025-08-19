<template>
  <div class="group-list">
    <div class="group-list-header">
      <h3>用户组列表</h3>
      <div class="group-list-controls">
        <button class="add-group-btn" @click="$emit('add-group')">
          <font-awesome-icon icon="plus" />
          新增用户组
        </button>
      </div>
    </div>
    
    <div class="group-list-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
      
      <div v-else-if="groups.length === 0" class="empty-state">
        <font-awesome-icon icon="folder-open" class="empty-icon" />
        <p>暂无用户组</p>
        <button class="create-first-btn" @click="$emit('add-group')">
          创建第一个用户组
        </button>
      </div>
      
      <div v-else class="group-grid">
        <div 
          v-for="group in groups" 
          :key="group.id" 
          class="group-card"
          :class="{ active: selectedGroup?.id === group.id }"
          @click="selectGroup(group)"
        >
          <div class="group-card-header">
            <div class="group-icon" :class="`type-${group.type}`">
              <font-awesome-icon :icon="getGroupIcon(group.type)" />
            </div>
            <div class="group-info">
              <h4>{{ group.name }}</h4>
              <span class="group-type">{{ getGroupTypeLabel(group.type) }}</span>
            </div>
            <div class="group-actions">
              <button 
                class="action-btn edit" 
                @click.stop="$emit('edit-group', group)"
                title="编辑"
              >
                <font-awesome-icon icon="edit" />
              </button>
              <button 
                class="action-btn delete" 
                @click.stop="$emit('delete-group', group)"
                title="删除"
              >
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </div>
          
          <div class="group-card-body">
            <p class="group-description">{{ group.description || '暂无描述' }}</p>
            
            <div class="group-stats">
              <div class="stat-item">
                <font-awesome-icon icon="users" />
                <span>{{ group.memberCount || 0 }} 成员</span>
              </div>
              <div class="stat-item">
                <font-awesome-icon icon="sitemap" />
                <span>层级 {{ group.level || 1 }}</span>
              </div>
            </div>
            
            <div class="group-status" :class="group.status">
              <span class="status-dot"></span>
              <span>{{ group.status === 'active' ? '启用' : '禁用' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  groups: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedGroup: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['add-group', 'edit-group', 'delete-group', 'select-group'])

const selectGroup = (group) => {
  emit('select-group', group)
}

const getGroupIcon = (type) => {
  const icons = {
    department: 'building',
    project: 'project-diagram',
    function: 'cogs',
    security: 'shield-alt',
    custom: 'layer-group'
  }
  return icons[type] || 'layer-group'
}

const getGroupTypeLabel = (type) => {
  const labels = {
    department: '部门组',
    project: '项目组',
    function: '职能组',
    security: '安全组',
    custom: '自定义组'
  }
  return labels[type] || '未知类型'
}
</script>

<style scoped>
.group-list {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.group-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.group-list-header h3 {
  color: #00eeff;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.add-group-btn {
  background: linear-gradient(135deg, #00eeff 0%, #0099cc 100%);
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.add-group-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 238, 255, 0.3);
}

.group-list-content {
  flex: 1;
  overflow-y: auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #00eeff;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 238, 255, 0.2);
  border-top: 3px solid #00eeff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: rgba(0, 238, 255, 0.4);
}

.create-first-btn {
  background: linear-gradient(135deg, #00eeff 0%, #0099cc 100%);
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  color: white;
  margin-top: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 238, 255, 0.3);
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.group-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.group-card:hover,
.group-card.active {
  border-color: #00eeff;
  box-shadow: 0 4px 20px rgba(0, 238, 255, 0.2);
  transform: translateY(-2px);
}

.group-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.group-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
}

.group-icon.type-department {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.group-icon.type-project {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.group-icon.type-function {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.group-icon.type-security {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.group-icon.type-custom {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.group-info {
  flex: 1;
}

.group-info h4 {
  margin: 0 0 4px 0;
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.group-type {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.group-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 12px;
}

.action-btn.edit {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
}

.action-btn.edit:hover {
  background: rgba(0, 238, 255, 0.2);
}

.action-btn.delete {
  background: rgba(255, 73, 73, 0.1);
  color: #ff4949;
}

.action-btn.delete:hover {
  background: rgba(255, 73, 73, 0.2);
}

.group-card-body {
  color: rgba(255, 255, 255, 0.8);
}

.group-description {
  font-size: 14px;
  margin: 0 0 12px 0;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.7);
}

.group-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.stat-item svg {
  color: #00eeff;
}

.group-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.group-status.active .status-dot {
  background: #52c41a;
}

.group-status.active {
  color: #52c41a;
}

.group-status.inactive .status-dot {
  background: #ff4d4f;
}

.group-status.inactive {
  color: #ff4d4f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .group-grid {
    grid-template-columns: 1fr;
  }
  
  .group-list-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
}
</style> 