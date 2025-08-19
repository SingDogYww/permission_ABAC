<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <font-awesome-icon icon="sitemap" />
          组织架构图
        </h3>
        <button class="close-btn" @click="closeModal">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <div class="modal-body">
        <div class="tree-controls">
          <div class="view-controls">
            <button 
              class="control-btn" 
              :class="{ active: viewMode === 'tree' }"
              @click="viewMode = 'tree'"
            >
              <font-awesome-icon icon="sitemap" />
              树形视图
            </button>
            <button 
              class="control-btn" 
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
            >
              <font-awesome-icon icon="list" />
              列表视图
            </button>
          </div>

          <div class="filter-controls">
            <select v-model="typeFilter" class="filter-select">
              <option value="">全部类型</option>
              <option value="department">部门组</option>
              <option value="project">项目组</option>
              <option value="function">职能组</option>
              <option value="security">安全组</option>
              <option value="custom">自定义组</option>
            </select>

            <button class="control-btn" @click="expandAll">
              <font-awesome-icon icon="expand-arrows-alt" />
              展开全部
            </button>
            <button class="control-btn" @click="collapseAll">
              <font-awesome-icon icon="compress-arrows-alt" />
              收起全部
            </button>
          </div>
        </div>

        <!-- 树形视图 -->
        <div v-if="viewMode === 'tree'" class="tree-view">
          <div v-if="treeData.length === 0" class="empty-tree">
            <font-awesome-icon icon="sitemap" class="empty-icon" />
            <p>暂无组织架构数据</p>
          </div>
          <div v-else class="tree-container">
            <TreeNode 
              v-for="node in treeData" 
              :key="node.id" 
              :node="node"
              :expanded="expandedNodes"
              @toggle="toggleNode"
              @select="selectNode"
            />
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-if="viewMode === 'list'" class="list-view">
          <div v-if="filteredGroups.length === 0" class="empty-list">
            <font-awesome-icon icon="list" class="empty-icon" />
            <p>暂无符合条件的用户组</p>
          </div>
          <div v-else class="list-container">
            <div 
              v-for="group in filteredGroups" 
              :key="group.id"
              class="list-item"
              :class="{ selected: selectedNode?.id === group.id }"
              @click="selectNode(group)"
            >
              <div class="item-info">
                <div class="item-icon">
                  <font-awesome-icon :icon="getGroupIcon(group.type)" />
                </div>
                <div class="item-details">
                  <div class="item-name">{{ group.name }}</div>
                  <div class="item-code">{{ group.code }}</div>
                  <div class="item-path">{{ group.path }}</div>
                </div>
              </div>
              <div class="item-meta">
                <span class="type-tag" :class="group.type">
                  {{ getGroupTypeName(group.type) }}
                </span>
                <span class="level-tag">L{{ group.level }}</span>
                <span class="member-count">{{ group.memberCount }}人</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 详情面板 -->
        <div v-if="selectedNode" class="detail-panel">
          <h4 class="detail-title">
            <font-awesome-icon icon="info-circle" />
            用户组详情
          </h4>
          
          <div class="detail-content">
            <div class="detail-row">
              <label>名称:</label>
              <span>{{ selectedNode.name }}</span>
            </div>
            <div class="detail-row">
              <label>编码:</label>
              <span class="code-text">{{ selectedNode.code }}</span>
            </div>
            <div class="detail-row">
              <label>类型:</label>
              <span class="type-tag" :class="selectedNode.type">
                {{ getGroupTypeName(selectedNode.type) }}
              </span>
            </div>
            <div class="detail-row">
              <label>层级:</label>
              <span>第{{ selectedNode.level }}层</span>
            </div>
            <div class="detail-row">
              <label>路径:</label>
              <span class="path-text">{{ selectedNode.path }}</span>
            </div>
            <div class="detail-row">
              <label>成员数:</label>
              <span class="member-text">{{ selectedNode.memberCount }}名成员</span>
            </div>
            <div class="detail-row">
              <label>状态:</label>
              <span class="status-tag" :class="selectedNode.status">
                {{ selectedNode.status === 'active' ? '启用' : '禁用' }}
              </span>
            </div>
            <div v-if="selectedNode.description" class="detail-row">
              <label>描述:</label>
              <span>{{ selectedNode.description }}</span>
            </div>
            
            <!-- 自定义属性 -->
            <div v-if="Object.keys(selectedNode.attributes || {}).length > 0" class="attributes-section">
              <label>自定义属性:</label>
              <div class="attributes-grid">
                <div 
                  v-for="(value, key) in selectedNode.attributes" 
                  :key="key" 
                  class="attr-item"
                >
                  <span class="attr-key">{{ key }}:</span>
                  <span class="attr-value">{{ value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal">
          <font-awesome-icon icon="times" />
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TreeNode from './TreeNode.vue'

// Props
const props = defineProps<{
  visible: boolean
  groups: any[]
}>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const viewMode = ref<'tree' | 'list'>('tree')
const typeFilter = ref('')
const selectedNode = ref(null)
const expandedNodes = ref(new Set())

// 计算属性
const filteredGroups = computed(() => {
  let result = props.groups || []
  
  if (typeFilter.value) {
    result = result.filter(group => group.type === typeFilter.value)
  }
  
  return result.sort((a, b) => {
    // 按层级和名称排序
    if (a.level !== b.level) {
      return a.level - b.level
    }
    return a.name.localeCompare(b.name)
  })
})

const treeData = computed(() => {
  return buildTreeData(filteredGroups.value)
})

// 方法
const buildTreeData = (groups: any[]) => {
  const groupMap = new Map()
  const rootNodes = []

  // 创建节点映射
  groups.forEach(group => {
    groupMap.set(group.id, {
      ...group,
      children: []
    })
  })

  // 构建树形结构
  groups.forEach(group => {
    const node = groupMap.get(group.id)
    if (group.parentId === '0' || !groupMap.has(group.parentId)) {
      rootNodes.push(node)
    } else {
      const parent = groupMap.get(group.parentId)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  return rootNodes
}

const toggleNode = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
}

const selectNode = (node: any) => {
  selectedNode.value = node
}

const expandAll = () => {
  const allNodeIds = (props.groups || []).map(group => group.id)
  expandedNodes.value = new Set(allNodeIds)
}

const collapseAll = () => {
  expandedNodes.value.clear()
}

const getGroupIcon = (type: string) => {
  const icons = {
    department: 'building',
    project: 'project-diagram',
    function: 'cogs',
    security: 'shield-alt',
    custom: 'puzzle-piece'
  }
  return icons[type] || 'users'
}

const getGroupTypeName = (type: string) => {
  const names = {
    department: '部门组',
    project: '项目组',
    function: '职能组',
    security: '安全组',
    custom: '自定义组'
  }
  return names[type] || '未知类型'
}

const closeModal = () => {
  emit('close')
}

const handleOverlayClick = () => {
  closeModal()
}

// 监听visible变化
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    // 默认展开第一层
    expandedNodes.value = new Set(
      (props.groups || [])
        .filter(group => group.level === 1)
        .map(group => group.id)
    )
    selectedNode.value = null
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
  background: rgba(0, 238, 255, 0.05);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.modal-title svg {
  color: #00eeff;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body {
  flex: 1;
  overflow: hidden;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
}

.tree-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  grid-column: 1 / -1;
}

.view-controls,
.filter-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.control-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.control-btn:hover,
.control-btn.active {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
}

.filter-select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 6px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.filter-select option {
  background: #1a2332;
  color: #fff;
}

.tree-view,
.list-view {
  overflow-y: auto;
  max-height: 500px;
}

.empty-tree,
.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 48px;
  color: rgba(0, 238, 255, 0.3);
  margin-bottom: 16px;
}

.tree-container {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 16px;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 238, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.list-item:hover,
.list-item.selected {
  background: rgba(0, 238, 255, 0.1);
  border-color: rgba(0, 238, 255, 0.3);
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-weight: 500;
  color: #fff;
}

.item-code {
  font-size: 11px;
  color: rgba(0, 238, 255, 0.8);
  font-family: 'Courier New', monospace;
}

.item-path {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.type-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.type-tag.department {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.type-tag.project {
  background: rgba(155, 89, 182, 0.2);
  color: #9b59b6;
}

.type-tag.function {
  background: rgba(230, 126, 34, 0.2);
  color: #e67e22;
}

.type-tag.security {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.type-tag.custom {
  background: rgba(26, 188, 156, 0.2);
  color: #1abc9c;
}

.level-tag {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.member-count {
  font-size: 10px;
  color: #00eeff;
}

.detail-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 238, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #00eeff;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.detail-row span {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.code-text {
  font-family: 'Courier New', monospace;
  color: #00eeff !important;
}

.path-text {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 12px !important;
}

.member-text {
  color: #00eeff !important;
  font-weight: 500;
}

.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  width: fit-content;
}

.status-tag.active {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.status-tag.inactive {
  background: rgba(149, 165, 166, 0.2);
  color: #95a5a6;
}

.attributes-section {
  margin-top: 8px;
}

.attributes-grid {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}

.attr-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.attr-key {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  min-width: 60px;
}

.attr-value {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 238, 255, 0.2);
  background: rgba(0, 238, 255, 0.02);
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-container {
    max-width: 95vw;
  }

  .modal-body {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .tree-controls {
    flex-direction: column;
    gap: 12px;
  }

  .view-controls,
  .filter-controls {
    flex-wrap: wrap;
  }

  .detail-panel {
    grid-row: 2;
    max-height: 200px;
  }
}
</style> 