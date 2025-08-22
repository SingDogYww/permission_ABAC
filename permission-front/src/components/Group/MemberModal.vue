<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <font-awesome-icon icon="user-cog" />
          成员管理
        </h3>
        <button class="close-btn" @click="closeModal">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <div class="modal-body">
        <div class="member-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'members' }"
            @click="activeTab = 'members'"
          >
            <font-awesome-icon icon="users" />
            当前成员 ({{ currentMembers.length }})
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'add' }"
            @click="activeTab = 'add'"
          >
            <font-awesome-icon icon="user-plus" />
            添加成员
          </button>
        </div>

        <!-- 当前成员列表 -->
        <div v-if="activeTab === 'members'" class="members-content">
          <div class="members-toolbar">
            <div class="search-box">
              <font-awesome-icon icon="search" class="search-icon" />
              <input
                v-model="memberSearchKeyword"
                type="text"
                placeholder="搜索成员名称或邮箱"
                class="search-input"
              />
            </div>
            <div class="filter-box">
              <select v-model="memberTypeFilter" class="filter-select">
                <option value="">全部权限</option>
                <option value="OWNER">组拥有者</option>
                <option value="ADMIN">组管理员</option>
                <option value="MEMBER">普通成员</option>
              </select>
            </div>
          </div>

          <div v-if="filteredMembers.length === 0" class="empty-members">
            <font-awesome-icon icon="user-friends" class="empty-icon" />
            <h4>{{ currentMembers.length === 0 ? '暂无成员' : '无匹配成员' }}</h4>
            <p>{{ currentMembers.length === 0 ? '请添加成员到此用户组' : '请调整搜索或筛选条件' }}</p>
          </div>

          <div v-else class="members-list">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>
                      <input 
                        type="checkbox" 
                        :checked="isAllMembersSelected"
                        :indeterminate="isSomeMembersSelected"
                        @change="handleSelectAllMembers" 
                      />
                    </th>
                    <th>用户信息</th>
                    <th>成员类型</th>
                    <th>用户组</th>
                    <th>加入时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="member in filteredMembers" :key="member.id" class="table-row">
                    <td>
                      <input type="checkbox" :value="member.id" v-model="selectedMembers" />
                    </td>
                    <td>
                      <div class="user-info">
                        <img 
                          :src="getUserAvatar(member)" 
                          :alt="member.name"
                          class="user-avatar"
                          @error="handleAvatarError"
                        />
                        <div class="user-details">
                          <div class="user-name">{{ member.name }}</div>
                          <div class="user-email">{{ member.email }}</div>
                          <div class="user-phone">{{ member.phone || '暂无' }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="member-type-badge" :class="`type-${member.memberType.toLowerCase()}`">
                        {{ getRoleName(member.memberType) }}
                      </span>
                    </td>
                    <td>
                      <div class="user-groups">
                        <span class="group-tag">{{ member.department || '暂无部门' }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="join-time">{{ member.joinTime }}</span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <select 
                          :value="member.memberType" 
                          class="role-select"
                          @change="updateMemberRole(member, $event.target.value)"
                        >
                          <option value="MEMBER">普通成员</option>
                          <option value="ADMIN">组管理员</option>
                          <option value="OWNER">组拥有者</option>
                        </select>
                        
                        <button 
                          class="action-icon danger" 
                          @click="removeMember(member)"
                          title="移除成员"
                        >
                          <font-awesome-icon icon="user-minus" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 添加成员 -->
        <div v-if="activeTab === 'add'" class="add-content">
          <div class="add-toolbar">
            <div class="search-box">
              <font-awesome-icon icon="search" class="search-icon" />
              <input
                v-model="userSearchKeyword"
                type="text"
                placeholder="搜索用户名称或邮箱"
                class="search-input"
              />
            </div>
            <div class="role-selector">
              <label>默认权限:</label>
              <select v-model="defaultRole" class="filter-select">
                <option value="MEMBER">普通成员</option>
                <option value="ADMIN">组管理员</option>
                <option value="OWNER">组拥有者</option>
              </select>
            </div>
          </div>

          <div v-if="availableUsers.length === 0" class="empty-users">
            <font-awesome-icon icon="user-friends" class="empty-icon" />
            <h4>暂无可添加用户</h4>
            <p>所有用户都已加入此用户组</p>
          </div>

          <div v-else class="users-list">
            <div 
              v-for="user in availableUsers" 
              :key="user.id"
              class="user-item"
              :class="{ selected: selectedUsers.includes(user.id) }"
              @click="toggleUserSelection(user.id)"
            >
              <div class="user-checkbox">
                <input
                  type="checkbox"
                  :checked="selectedUsers.includes(user.id)"
                  @click.stop
                  @change="toggleUserSelection(user.id)"
                />
              </div>
              <div class="user-info">
                <img 
                  :src="user.avatar || defaultAvatar" 
                  :alt="user.name"
                  class="user-avatar"
                  @error="handleAvatarError"
                />
                <div class="user-details">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                  <div class="user-department">{{ user.department || '暂无部门' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedUsers.length > 0" class="batch-actions">
            <div class="selection-info">
              已选择 {{ selectedUsers.length }} 个用户
            </div>
            <button class="btn btn-primary" @click="addSelectedUsers">
              <font-awesome-icon icon="user-plus" />
              批量添加为{{ getRoleName(defaultRole) }}
            </button>
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
import defaultAvatar from '@/assets/default-avatar.svg'

// Props
const props = defineProps<{
  visible: boolean
  groupId?: string
}>()

// Emits
const emit = defineEmits<{
  close: []
  update: [data: any]
}>()

// 响应式数据
const activeTab = ref<'members' | 'add'>('members')
const memberSearchKeyword = ref('')
const memberTypeFilter = ref('')
const userSearchKeyword = ref('')
const defaultRole = ref('MEMBER')
const selectedUsers = ref<string[]>([])
const selectedMembers = ref<string[]>([])

// 模拟数据 - 管理员组成员
const currentMembers = ref([
  {
    id: '1',
    name: '刑青',
    email: 'xingqing@example.com',
    phone: '13800138001',
    avatar: '',
    memberType: 'OWNER',
    joinTime: '2024-01-01 08:00:00',
    department: '管理组'
  },
  {
    id: '2',
    name: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138002',
    avatar: '',
    memberType: 'ADMIN',
    joinTime: '2024-01-01 08:00:00',
    department: '技术部'
  },
  {
    id: '3',
    name: '安全管理员',
    email: 'security@example.com',
    phone: '13800138003',
    avatar: '',
    memberType: 'ADMIN',
    joinTime: '2024-01-02 09:00:00',
    department: '安全部'
  },
  {
    id: '4',
    name: '数据管理员',
    email: 'dataadmin@example.com',
    phone: '13800138004',
    avatar: '',
    memberType: 'ADMIN',
    joinTime: '2024-01-03 10:00:00',
    department: '技术部'
  },
  {
    id: '5',
    name: '运维管理员',
    email: 'ops@example.com',
    phone: '13800138005',
    avatar: '',
    memberType: 'ADMIN',
    joinTime: '2024-01-05 14:30:00',
    department: '运维部'
  },
  {
    id: '6',
    name: '审计员',
    email: 'auditor@example.com',
    phone: '13800138006',
    avatar: '',
    memberType: 'MEMBER',
    joinTime: '2024-01-10 11:20:00',
    department: '审计部'
  },
  {
    id: '7',
    name: '备份管理员',
    email: 'backup@example.com',
    phone: '13800138007',
    avatar: '',
    memberType: 'MEMBER',
    joinTime: '2024-01-15 16:45:00',
    department: '技术部'
  },
  {
    id: '8',
    name: '监控管理员',
    email: 'monitor@example.com',
    phone: '13800138008',
    avatar: '',
    memberType: 'MEMBER',
    joinTime: '2024-01-20 13:15:00',
    department: '运维部'
  }
])

const allUsers = ref([
  {
    id: '9',
    name: '张伟',
    email: 'zhangwei@example.com',
    phone: '13800138009',
    avatar: '',
    department: '技术部'
  },
  {
    id: '10',
    name: '李娜',
    email: 'lina@example.com',
    phone: '13800138010',
    avatar: '',
    department: '产品部'
  },
  {
    id: '11',
    name: '王强',
    email: 'wangqiang@example.com',
    phone: '13800138011',
    avatar: '',
    department: '设计部'
  },
  {
    id: '12',
    name: '赵敏',
    email: 'zhaomin@example.com',
    phone: '13800138012',
    avatar: '',
    department: '市场部'
  },
  {
    id: '13',
    name: '孙磊',
    email: 'sunlei@example.com',
    phone: '13800138013',
    avatar: '',
    department: '财务部'
  },
  {
    id: '14',
    name: '周静',
    email: 'zhoujing@example.com',
    phone: '13800138014',
    avatar: '',
    department: '人事部'
  },
  {
    id: '15',
    name: '吴彬',
    email: 'wubin@example.com',
    phone: '13800138015',
    avatar: '',
    department: '法务部'
  },
  {
    id: '16',
    name: '郑华',
    email: 'zhenghua@example.com',
    phone: '13800138016',
    avatar: '',
    department: '采购部'
  },
  {
    id: '17',
    name: '刘洋',
    email: 'liuyang@example.com',
    phone: '13800138017',
    avatar: '',
    department: '质量部'
  },
  {
    id: '18',
    name: '陈晨',
    email: 'chenchen@example.com',
    phone: '13800138018',
    avatar: '',
    department: '研发部'
  }
])

// 计算属性
const filteredMembers = computed(() => {
  let result = currentMembers.value

  if (memberSearchKeyword.value) {
    const keyword = memberSearchKeyword.value.toLowerCase()
    result = result.filter(member =>
      member.name.toLowerCase().includes(keyword) ||
      member.email.toLowerCase().includes(keyword)
    )
  }

  if (memberTypeFilter.value) {
    result = result.filter(member => member.memberType === memberTypeFilter.value)
  }

  return result
})

const availableUsers = computed(() => {
  const memberIds = new Set(currentMembers.value.map(m => m.id))
  let result = allUsers.value.filter(user => !memberIds.has(user.id))

  if (userSearchKeyword.value) {
    const keyword = userSearchKeyword.value.toLowerCase()
    result = result.filter(user =>
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword)
    )
  }

  return result
})

const isAllMembersSelected = computed(() => {
  return filteredMembers.value.length > 0 && 
         selectedMembers.value.length === filteredMembers.value.length
})

const isSomeMembersSelected = computed(() => {
  return selectedMembers.value.length > 0 && 
         selectedMembers.value.length < filteredMembers.value.length
})

// 方法
const getUserAvatar = (user: any) => {
  return user.avatar || defaultAvatar
}

const handleSelectAllMembers = () => {
  if (isAllMembersSelected.value) {
    selectedMembers.value = []
  } else {
    selectedMembers.value = filteredMembers.value.map(m => m.id)
  }
}

const updateMemberRole = (member: any, newRole: string) => {
  member.memberType = newRole
  // 更新成员权限
  emit('update', { type: 'role_change', member, newRole })
  // TODO: 调用API更新成员权限
}

const removeMember = (member: any) => {
  const index = currentMembers.value.findIndex(m => m.id === member.id)
  if (index > -1) {
    currentMembers.value.splice(index, 1)
    // 移除成员
    emit('update', { type: 'remove_member', member })
    // TODO: 调用API移除成员
  }
}

const toggleUserSelection = (userId: string) => {
  const index = selectedUsers.value.indexOf(userId)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(userId)
  }
}

const addSelectedUsers = () => {
  const usersToAdd = allUsers.value.filter(user => selectedUsers.value.includes(user.id))
  
  usersToAdd.forEach(user => {
    const newMember = {
      ...user,
      memberType: defaultRole.value,
      joinTime: new Date().toLocaleString()
    }
    currentMembers.value.push(newMember)
  })

  // 批量添加成员
  emit('update', { type: 'add_members', members: usersToAdd, role: defaultRole.value })
  
  // 重置选择
  selectedUsers.value = []
  activeTab.value = 'members'
  
  // TODO: 调用API添加成员
}

const getRoleName = (role: string) => {
  const names = {
    OWNER: '组拥有者',
    ADMIN: '组管理员',
    MEMBER: '普通成员'
  }
  return names[role] || '普通成员'
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = defaultAvatar
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
    activeTab.value = 'members'
    selectedUsers.value = []
    selectedMembers.value = []
    memberSearchKeyword.value = ''
    userSearchKeyword.value = ''
    memberTypeFilter.value = ''
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
  max-width: 900px;
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
  font-size: 18px;
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
}

.member-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.tab-btn.active {
  background: rgba(0, 238, 255, 0.2);
  color: #00eeff;
}

.members-content,
.add-content {
  height: calc(500px - 60px);
  display: flex;
  flex-direction: column;
}

.members-toolbar,
.add-toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #00eeff;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.filter-box,
.role-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-select {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #00eeff;
}

.filter-select option {
  background: #1a2332;
  color: #fff;
}

.role-selector label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.empty-members,
.empty-users {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: rgba(0, 238, 255, 0.3);
  margin-bottom: 16px;
}

.empty-members h4,
.empty-users h4 {
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.8);
}

.empty-members p,
.empty-users p {
  margin: 0;
  font-size: 14px;
}

.members-list {
  flex: 1;
  overflow-y: auto;
}

.table-container {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  font-weight: 600;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
  font-size: 14px;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
}

.table-row {
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(0, 238, 255, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(0, 238, 255, 0.3);
  object-fit: cover;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 500;
  color: #fff;
  font-size: 14px;
}

.user-email,
.user-phone {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.member-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  gap: 6px;
}

.type-owner {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.type-admin {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
  border: 1px solid rgba(0, 123, 255, 0.3);
}

.type-member {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.3);
}

.user-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.group-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(0, 238, 255, 0.15);
  color: #00eeff;
  border: 1px solid rgba(0, 238, 255, 0.3);
  white-space: nowrap;
}

.join-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-select {
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.role-select option {
  background: #1a2332;
  color: #fff;
}

.action-icon {
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.action-icon.danger {
  color: #e74c3c;
  border-color: rgba(231, 76, 60, 0.3);
}

.action-icon.danger:hover {
  background: rgba(231, 76, 60, 0.1);
  border-color: #e74c3c;
}

.users-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 238, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-item:hover {
  background: rgba(0, 238, 255, 0.1);
  border-color: rgba(0, 238, 255, 0.3);
}

.user-item.selected {
  background: rgba(0, 238, 255, 0.2);
  border-color: rgba(0, 238, 255, 0.4);
}

.user-checkbox {
  margin-right: 12px;
}

.user-department {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(0, 238, 255, 0.1);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 8px;
}

.selection-info {
  color: #00eeff;
  font-size: 14px;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 238, 255, 0.2);
  background: rgba(0, 238, 255, 0.02);
}

.btn {
  padding: 12px 20px;
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

.btn-primary {
  background: linear-gradient(135deg, #00eeff, #0099cc);
  color: #fff;
  border: 1px solid #00eeff;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #33f0ff, #00b3e6);
  border-color: #33f0ff;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 238, 255, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-container {
    max-width: 95vw;
    margin: 10px;
  }

  .members-toolbar,
  .add-toolbar {
    flex-direction: column;
    gap: 12px;
  }

  .batch-actions {
    flex-direction: column;
    gap: 12px;
  }

  .data-table {
    font-size: 12px;
  }

  .data-table th,
  .data-table td {
    padding: 8px 12px;
  }
}
</style> 