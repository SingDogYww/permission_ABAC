<template>
  <div class="group-tree">
    <div class="group-tree-header">
      <h3>组织架构</h3>
      <div class="tree-actions">
        <button class="expand-all-btn" @click="expandAll" title="展开所有">
          <font-awesome-icon icon="expand-arrows-alt" />
        </button>
        <button class="collapse-all-btn" @click="collapseAll" title="收起所有">
          <font-awesome-icon icon="compress-arrows-alt" />
        </button>
      </div>
    </div>
    
    <div class="group-tree-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <span>加载组织架构...</span>
      </div>
      
      <div v-else-if="treeData.length === 0" class="empty-state">
        <font-awesome-icon icon="sitemap" class="empty-icon" />
        <p>暂无组织架构</p>
      </div>
      
      <div v-else class="tree-container">
        <TreeNode
          v-for="node in treeData"
          :key="node.id"
          :node="node"
          :expanded-nodes="expandedNodes"
          :selected-node="selectedNode"
          @toggle-expand="toggleExpand"
          @select-node="selectNode"
          @add-child="addChild"
          @edit-node="editNode"
          @delete-node="deleteNode"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import TreeNode from './TreeNode.vue'

const props = defineProps({
  treeData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select-node', 'add-child', 'edit-node', 'delete-node'])

const expandedNodes = ref(new Set())
const selectedNode = ref(null)

const toggleExpand = (nodeId) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
}

const selectNode = (node) => {
  selectedNode.value = node
  emit('select-node', node)
}

const addChild = (parentNode) => {
  emit('add-child', parentNode)
}

const editNode = (node) => {
  emit('edit-node', node)
}

const deleteNode = (node) => {
  emit('delete-node', node)
}

const expandAll = () => {
  const getAllNodeIds = (nodes) => {
    let ids = []
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children && node.children.length > 0) {
        ids = ids.concat(getAllNodeIds(node.children))
      }
    })
    return ids
  }
  
  const allIds = getAllNodeIds(props.treeData)
  expandedNodes.value = new Set(allIds)
}

const collapseAll = () => {
  expandedNodes.value.clear()
}
</script>

<style scoped>
.group-tree {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.group-tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.group-tree-header h3 {
  color: #00eeff;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.tree-actions {
  display: flex;
  gap: 8px;
}

.expand-all-btn,
.collapse-all-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
}

.expand-all-btn:hover,
.collapse-all-btn:hover {
  background: rgba(0, 238, 255, 0.2);
  transform: scale(1.05);
}

.group-tree-content {
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

.tree-container {
  padding: 10px 0;
}

/* 自定义滚动条样式 */
.group-tree-content::-webkit-scrollbar {
  width: 6px;
}

.group-tree-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.group-tree-content::-webkit-scrollbar-thumb {
  background: rgba(0, 238, 255, 0.3);
  border-radius: 3px;
}

.group-tree-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 238, 255, 0.5);
}
</style> 