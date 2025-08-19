<template>
  <div class="tree-node">
    <div 
      class="node-content"
      :class="{ selected: selected }"
      @click="selectNode"
    >
      <div class="node-expand" @click.stop="toggleExpand">
        <font-awesome-icon 
          v-if="hasChildren"
          :icon="expanded ? 'chevron-down' : 'chevron-right'"
          class="expand-icon"
        />
        <span v-else class="expand-placeholder"></span>
      </div>

      <div class="node-icon">
        <font-awesome-icon :icon="getGroupIcon(group.type)" />
      </div>

      <div class="node-info">
        <div class="node-name">{{ group.name }}</div>
        <div class="node-meta">
          <span class="node-code">{{ group.code }}</span>
          <span class="type-tag" :class="group.type">{{ getGroupTypeName(group.type) }}</span>
          <span class="member-count">{{ group.memberCount || 0 }}人</span>
        </div>
      </div>

      <div class="node-actions" @click.stop>
        <button class="action-btn small" @click="$emit('create-child', group)" title="创建子组">
          <font-awesome-icon icon="plus" />
        </button>
        <button class="action-btn small" @click="$emit('edit', group)" title="编辑">
          <font-awesome-icon icon="edit" />
        </button>
        <button class="action-btn small success" @click="$emit('manage-members', group.id)" title="成员管理">
          <font-awesome-icon icon="user-friends" />
        </button>
        <button class="action-btn small danger" @click="$emit('delete', group)" title="删除">
          <font-awesome-icon icon="trash" />
        </button>
        <span class="status-indicator" :class="group.status"></span>
      </div>
    </div>

    <div v-if="hasChildren && expanded" class="node-children">
      <TreeNode
        v-for="child in children"
        :key="child.id"
        :group="child"
        :expanded="childExpandedStates.has(child.id)"
        :selected="child.id === selectedGroupId"
        :all-groups="allGroups"
        :selected-group-id="selectedGroupId"
        @toggle="handleChildToggle"
        @select="$emit('select', $event)"
        @create-child="$emit('create-child', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @manage-members="$emit('manage-members', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// Props
const props = defineProps<{
  group: any
  expanded: boolean
  selected?: boolean
  allGroups?: any[]
  selectedGroupId?: string
}>()

// Emits
const emit = defineEmits<{
  toggle: [groupId: string]
  select: [groupId: string]
  'create-child': [group: any]
  edit: [group: any]
  delete: [group: any]
  'manage-members': [groupId: string]
}>()

// 子节点展开状态
const childExpandedStates = ref(new Set<string>())

// 计算属性
const hasChildren = computed(() => {
  return children.value && children.value.length > 0
})

const children = computed(() => {
  if (!props.allGroups) return []
  return props.allGroups.filter(group => group.parentId === props.group.id)
})

// 方法
const getGroupIcon = (type: string) => {
  const iconMap: { [key: string]: string } = {
    department: 'building',
    project: 'project-diagram',
    function: 'cogs',
    security: 'shield-alt',
    custom: 'layer-group'
  }
  return iconMap[type] || 'users'
}

const getGroupTypeName = (type: string) => {
  const nameMap: { [key: string]: string } = {
    department: '部门',
    project: '项目',
    function: '职能',
    security: '安全',
    custom: '自定义'
  }
  return nameMap[type] || '未知'
}

const toggleExpand = () => {
  emit('toggle', props.group.id)
}

const selectNode = () => {
  emit('select', props.group.id)
}

const handleChildToggle = (groupId: string) => {
  emit('toggle', groupId)
}
</script>

<style scoped>
.tree-node {
  margin-bottom: 4px;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.node-content:hover {
  background: rgba(0, 238, 255, 0.1);
  border-color: rgba(0, 238, 255, 0.3);
}

.node-content.selected {
  background: rgba(0, 238, 255, 0.2);
  border-color: #00eeff;
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
}

.node-expand {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  cursor: pointer;
}

.expand-icon {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  transition: transform 0.2s ease;
}

.expand-placeholder {
  width: 12px;
  height: 12px;
}

.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #00eeff, #00b4db);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f2027;
  margin-right: 12px;
  font-size: 14px;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-name {
  font-weight: 500;
  color: #fff;
  font-size: 14px;
  margin-bottom: 4px;
}

.node-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.node-code {
  font-size: 11px;
  color: rgba(0, 238, 255, 0.8);
  font-family: 'Courier New', monospace;
}

.type-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
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
  background: rgba(149, 165, 166, 0.2);
  color: #95a5a6;
}

.member-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 4px;
}

.node-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.node-content:hover .node-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.action-btn:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
}

.action-btn.small {
  padding: 4px;
  font-size: 10px;
}

.action-btn.success {
  color: #2ecc71;
  border-color: rgba(46, 204, 113, 0.3);
}

.action-btn.success:hover {
  background: rgba(46, 204, 113, 0.1);
  border-color: #2ecc71;
}

.action-btn.danger {
  color: #e74c3c;
  border-color: rgba(231, 76, 60, 0.3);
}

.action-btn.danger:hover {
  background: rgba(231, 76, 60, 0.1);
  border-color: #e74c3c;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 8px;
}

.status-indicator.active {
  background: #2ecc71;
}

.status-indicator.inactive {
  background: #95a5a6;
}

.node-children {
  margin-left: 32px;
  margin-top: 4px;
  padding-left: 12px;
  border-left: 1px solid rgba(0, 238, 255, 0.2);
}
</style> 