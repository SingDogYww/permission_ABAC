<template>
  <div class="group-members">
    <div class="members-header">
      <h3>组成员管理</h3>
      <div class="members-actions">
        <button class="add-member-btn" @click="$emit('add-member')" :disabled="!selectedGroup">
          <font-awesome-icon icon="user-plus" />
          添加成员
        </button>
        <button class="batch-manage-btn" @click="$emit('batch-manage')" :disabled="!selectedGroup">
          <font-awesome-icon icon="users-cog" />
          批量管理
        </button>
      </div>
    </div>
    
    <div class="members-content">
      <div v-if="!selectedGroup" class="no-selection">
        <font-awesome-icon icon="arrow-left" class="no-selection-icon" />
        <p>请从左侧选择一个用户组查看成员信息</p>
      </div>
      
      <div v-else-if="loading" class="loading">
        <div class="spinner"></div>
        <span>加载成员信息...</span>
      </div>
      
      <div v-else class="members-list">
        <div class="group-info">
          <div class="group-header">
            <div class="group-icon" :class="`type-${selectedGroup.type}`">
              <font-awesome-icon :icon="getGroupIcon(selectedGroup.type)" />
            </div>
            <div class="group-details">
              <h4>{{ selectedGroup.name }}</h4>
              <span class="group-type">{{ getGroupTypeLabel(selectedGroup.type) }}</span>
            </div>
            <div class="member-count">
              <span class="count">{{ members.length }}</span>
              <span class="label">成员</span>
            </div>
          </div>
        </div>
        
        <div class="members-filter">
          <div class="search-box">
            <font-awesome-icon icon="search" class="search-icon" />
            <input 
              v-model="searchKeyword" 
              type="text" 
              placeholder="搜索成员姓名、用户名..."
              class="search-input"
            />
          </div>
          <select v-model="filterRole" class="role-filter">
            <option value="">全部角色</option>
            <option value="OWNER">拥有者</option>
            <option value="ADMIN">管理员</option>
            <option value="MEMBER">普通成员</option>
          </select>
        </div>
        
        <div v-if="filteredMembers.length === 0" class="empty-members">
          <font-awesome-icon icon="users" class="empty-icon" />
          <p v-if="members.length === 0">该用户组暂无成员</p>
          <p v-else>没有找到匹配的成员</p>
          <button v-if="members.length === 0" class="add-first-member-btn" @click="$emit('add-member')">
            添加第一个成员
          </button>
        </div>
        
        <div v-else class="member-items">
          <div 
            v-for="member in filteredMembers" 
            :key="member.id"
            class="member-item"
          >
            <div class="member-avatar">
              <img 
                :src="member.avatar || defaultAvatar" 
                :alt="member.nickname || member.username"
                @error="handleImageError"
              />
              <div class="member-status" :class="member.status">
                <span class="status-dot"></span>
              </div>
            </div>
            
            <div class="member-info">
              <div class="member-name">
                <span class="nickname">{{ member.nickname || member.username }}</span>
                <span class="username">@{{ member.username }}</span>
              </div>
              <div class="member-meta">
                <span class="join-time">加入时间: {{ formatDate(member.joinTime) }}</span>
                <span v-if="member.expireTime" class="expire-time">
                  过期时间: {{ formatDate(member.expireTime) }}
                </span>
              </div>
            </div>
            
            <div class="member-role">
              <select 
                :value="member.memberType" 
                @change="updateMemberRole(member, $event.target.value)"
                class="role-select"
                :disabled="!canEditMember(member)"
              >
                <option value="MEMBER">普通成员</option>
                <option value="ADMIN">管理员</option>
                <option value="OWNER">拥有者</option>
              </select>
              <div class="role-badge" :class="member.memberType.toLowerCase()">
                {{ getRoleLabel(member.memberType) }}
              </div>
            </div>
            
            <div class="member-actions">
              <button 
                class="action-btn edit" 
                @click="editMember(member)"
                title="编辑成员信息"
                :disabled="!canEditMember(member)"
              >
                <font-awesome-icon icon="edit" />
              </button>
              <button 
                class="action-btn remove" 
                @click="removeMember(member)"
                title="移除成员"
                :disabled="!canRemoveMember(member)"
              >
                <font-awesome-icon icon="user-minus" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  selectedGroup: {
    type: Object,
    default: null
  },
  members: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentUser: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'add-member', 
  'batch-manage', 
  'update-member-role', 
  'edit-member', 
  'remove-member'
])

const searchKeyword = ref('')
const filterRole = ref('')
const defaultAvatar = '/src/assets/default-avatar.svg'

const filteredMembers = computed(() => {
  let result = props.members
  
  // 按关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(member => 
      (member.nickname && member.nickname.toLowerCase().includes(keyword)) ||
      member.username.toLowerCase().includes(keyword)
    )
  }
  
  // 按角色筛选
  if (filterRole.value) {
    result = result.filter(member => member.memberType === filterRole.value)
  }
  
  return result
})

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

const getRoleLabel = (role) => {
  const labels = {
    OWNER: '拥有者',
    ADMIN: '管理员',
    MEMBER: '普通成员'
  }
  return labels[role] || role
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const handleImageError = (event) => {
  event.target.src = defaultAvatar
}

const canEditMember = (member) => {
  // 这里应该根据当前用户的权限来判断
  // 简化逻辑：拥有者和管理员可以编辑普通成员，拥有者可以编辑所有人
  return true
}

const canRemoveMember = (member) => {
  // 这里应该根据当前用户的权限来判断
  // 简化逻辑：不能移除自己，拥有者和管理员可以移除普通成员
  return props.currentUser && member.id !== props.currentUser.id
}

const updateMemberRole = (member, newRole) => {
  emit('update-member-role', member, newRole)
}

const editMember = (member) => {
  emit('edit-member', member)
}

const removeMember = (member) => {
  emit('remove-member', member)
}
</script>

<style scoped>
.group-members {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.members-header h3 {
  color: #00eeff;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.members-actions {
  display: flex;
  gap: 10px;
}

.add-member-btn,
.batch-manage-btn {
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

.add-member-btn:disabled,
.batch-manage-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}

.add-member-btn:not(:disabled):hover,
.batch-manage-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 238, 255, 0.3);
}

.members-content {
  flex: 1;
  overflow-y: auto;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: rgba(255, 255, 255, 0.6);
}

.no-selection-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: rgba(0, 238, 255, 0.4);
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

.group-info {
  margin-bottom: 20px;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.group-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 20px;
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

.group-details {
  flex: 1;
}

.group-details h4 {
  margin: 0 0 4px 0;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.group-type {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.member-count {
  text-align: center;
}

.member-count .count {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #00eeff;
}

.member-count .label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.members-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 14px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-input:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 0 2px rgba(0, 238, 255, 0.2);
}

.role-filter {
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 14px;
  min-width: 120px;
}

.role-filter:focus {
  outline: none;
  border-color: #00eeff;
}

.empty-members {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: rgba(0, 238, 255, 0.4);
}

.add-first-member-btn {
  background: linear-gradient(135deg, #00eeff 0%, #0099cc 100%);
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  color: white;
  margin-top: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-first-member-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 238, 255, 0.3);
}

.member-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.member-item:hover {
  border-color: rgba(0, 238, 255, 0.3);
  box-shadow: 0 2px 10px rgba(0, 238, 255, 0.1);
}

.member-avatar {
  position: relative;
  margin-right: 16px;
}

.member-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.member-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.member-status.active .status-dot {
  background: #52c41a;
}

.member-status.inactive .status-dot {
  background: #ff4d4f;
}

.member-info {
  flex: 1;
}

.member-name {
  margin-bottom: 4px;
}

.nickname {
  color: white;
  font-weight: 600;
  font-size: 16px;
  margin-right: 8px;
}

.username {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.member-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.member-role {
  margin-right: 16px;
  position: relative;
}

.role-select {
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 12px;
  min-width: 80px;
}

.role-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.role-badge {
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  text-align: center;
}

.role-badge.owner {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.role-badge.admin {
  background: rgba(0, 238, 255, 0.2);
  color: #00eeff;
  border: 1px solid rgba(0, 238, 255, 0.3);
}

.role-badge.member {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.member-actions {
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

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.edit {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
}

.action-btn.edit:not(:disabled):hover {
  background: rgba(0, 238, 255, 0.2);
}

.action-btn.remove {
  background: rgba(255, 73, 73, 0.1);
  color: #ff4949;
}

.action-btn.remove:not(:disabled):hover {
  background: rgba(255, 73, 73, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .members-filter {
    flex-direction: column;
  }
  
  .member-item {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 12px;
  }
  
  .member-avatar {
    align-self: center;
    margin-right: 0;
  }
  
  .member-actions {
    justify-content: center;
  }
}
</style> 