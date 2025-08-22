<template>
  <div class="user-view">
    <div class="page-header">
      <h1 class="page-title">
        <font-awesome-icon icon="user" />
        用户管理
      </h1>
      <p class="page-subtitle">管理系统用户信息、状态和权限</p>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="toolbar">
      <div class="search-section">
        <div class="search-group">
          <font-awesome-icon icon="search" class="search-icon" />
          <input 
            v-model="searchForm.keyword" 
            type="text" 
            placeholder="搜索用户名、邮箱或手机号" 
            class="search-input"
            @keyup.enter="handleSearch" 
          />
        </div>

        <select v-model="searchForm.status" class="filter-select" @change="handleSearch">
          <option value="">全部状态</option>
          <option value="active">启用</option>
          <option value="inactive">禁用</option>
        </select>
        <button class="search-btn" @click="handleSearch" :disabled="loading">
          <font-awesome-icon icon="search" />
          搜索
        </button>
      </div>

      <div class="action-section">
        <button class="action-btn primary" @click="showAddUserModal = true" :disabled="loading">
          <font-awesome-icon icon="user-plus" />
          添加用户
        </button>
        <button class="action-btn" @click="showImportModal = true" :disabled="loading">
          <font-awesome-icon icon="file-import" />
          导入
        </button>
        <button class="action-btn" @click="exportUsers" :disabled="loading">
          <font-awesome-icon icon="download" />
          导出
        </button>
        <button 
          v-if="selectedUsers.length > 0" 
          class="action-btn danger" 
          @click="batchDeleteUsers"
          :disabled="loading"
        >
          <font-awesome-icon icon="trash" />
          批量删除 ({{ selectedUsers.length }})
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <font-awesome-icon icon="spinner" spin />
        加载中...
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-container">
      <div class="error-message">
        <font-awesome-icon icon="exclamation-triangle" />
        {{ error }}
        <button @click="loadUsers" class="retry-btn">重试</button>
      </div>
    </div>

    <!-- 用户表格 -->
    <div v-if="!loading && !error" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                :checked="isCurrentPageAllSelected"
                :indeterminate="isCurrentPagePartialSelected"
                @change="handleSelectAll" 
              />
            </th>
            <th>用户信息</th>
            <th>用户组</th>
            <th>状态</th>
            <th>最后登录</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.id" class="table-row">
            <td>
              <input type="checkbox" :value="user.id" v-model="selectedUsers" />
            </td>
            <td>
              <div class="user-info" @click="viewUserDetail(user)">
                <img 
                  :src="getUserAvatar(user)" 
                  :alt="user.nickname || user.username" 
                  class="user-avatar"
                  @error="handleAvatarError"
                />
                <div class="user-details">
                  <div class="user-name">{{ user.nickname || user.username }}</div>
                  <div class="user-email">{{ user.email }}</div>
                  <div class="user-phone">{{ user.phone }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="user-groups">
                <template v-if="user.userGroups && user.userGroups.length > 0">
                  <span 
                    v-for="(group, index) in user.userGroups.slice(0, 2)" 
                    :key="index"
                    class="group-tag"
                  >
                    {{ group }}
                  </span>
                  <span 
                    v-if="user.userGroups.length > 2" 
                    class="group-count"
                    @mouseenter="showGroupTooltip($event, user.userGroups)"
                    @mouseleave="hideGroupTooltip"
                  >
                    +{{ user.userGroups.length - 2 }}
                  </span>
                </template>
                <span v-else class="no-groups">未分组</span>
              </div>
            </td>
            <td>
              <span :class="['status-badge', user.status]">
                <font-awesome-icon 
                  :icon="user.status === 'active' ? 'check-circle' : 'times-circle'" 
                />
                {{ user.status === 'active' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <span v-if="user.lastLogin" class="last-login">
                {{ formatDateTime(user.lastLogin) }}
              </span>
              <span v-else class="never-login">从未登录</span>
            </td>
            <td>
              <span class="create-time">{{ formatDateTime(user.createTime) }}</span>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  class="action-icon view" 
                  @click="viewUserDetail(user)"
                  title="查看详情"
                >
                  <font-awesome-icon icon="eye" />
                </button>
                <button 
                  class="action-icon edit" 
                  @click="editUser(user)"
                  :disabled="operatingUsers.has(user.id)"
                  title="编辑"
                >
                  <font-awesome-icon icon="edit" />
                </button>
                <button 
                  class="action-icon toggle" 
                  @click="toggleUserStatus(user)"
                  :disabled="operatingUsers.has(user.id)"
                  :title="user.status === 'active' ? '禁用' : '启用'"
                >
                  <font-awesome-icon 
                    :icon="operatingUsers.has(user.id) ? 'spinner' : (user.status === 'active' ? 'ban' : 'check')"
                    :spin="operatingUsers.has(user.id)"
                  />
                </button>
                <button 
                  class="action-icon delete" 
                  @click="deleteUser(user)"
                  :disabled="operatingUsers.has(user.id)"
                  title="删除"
                >
                  <font-awesome-icon icon="trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pagination">
        <div class="pagination-info">
          共 {{ pagination.total }} 条记录，第 {{ pagination.current }} / {{ totalPages }} 页
        </div>
        <div class="pagination-controls">
          <button 
            @click="handlePageChange(1)" 
            :disabled="pagination.current <= 1"
            class="page-btn"
          >
            首页
          </button>
          <button 
            @click="handlePageChange(pagination.current - 1)" 
            :disabled="pagination.current <= 1"
            class="page-btn"
          >
            上一页
          </button>
          <span class="page-numbers">
            <input 
              type="number" 
              v-model.number="currentPageInput" 
              @keyup.enter="goToPage"
              :min="1" 
              :max="totalPages"
              class="page-input"
            />
          </span>
          <button 
            @click="handlePageChange(pagination.current + 1)" 
            :disabled="pagination.current >= totalPages"
            class="page-btn"
          >
            下一页
          </button>
          <button 
            @click="handlePageChange(totalPages)" 
            :disabled="pagination.current >= totalPages"
            class="page-btn"
          >
            末页
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="pagination.total === 0" class="empty-state">
        <font-awesome-icon icon="users" class="empty-icon" />
        <h3>暂无用户数据</h3>
        <p>{{ searchForm.keyword || searchForm.status ? '没有找到符合条件的用户' : '还没有添加任何用户' }}</p>
        <button v-if="!searchForm.keyword && !searchForm.status" class="action-btn primary" @click="showAddUserModal = true">
          <font-awesome-icon icon="user-plus" />
          添加第一个用户
        </button>
      </div>
    </div>

    <!-- 悬浮提示 -->
    <div 
      v-if="tooltipVisible" 
      class="group-tooltip" 
      :style="{ left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px' }"
    >
      <div class="tooltip-content">
        <h4>用户组列表</h4>
        <ul>
          <li v-for="group in tooltipGroups" :key="group">{{ group }}</li>
        </ul>
      </div>
    </div>

    <!-- 用户模态框 -->
    <UserModal
      v-if="showAddUserModal || showEditUserModal"
      :visible="showAddUserModal || showEditUserModal"
      :user="currentUser"
      :loading="submitting"
      @submit="handleUserSubmit"
      @close="handleCloseUserModal"
    />

    <!-- 确认模态框 -->
    <ConfirmModal
      v-if="showConfirmModal"
      :visible="showConfirmModal"
      :config="confirmConfig"
      @confirm="handleConfirm"
      @close="showConfirmModal = false"
    />

    <!-- 导入模态框 -->
    <ImportModal
      v-if="showImportModal"
      :visible="showImportModal"
      @import="handleUserImport"
      @close="showImportModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import UserModal from '@/components/User/UserModal.vue'
import ConfirmModal from '@/components/Common/ConfirmModal.vue'
import ImportModal from '@/components/User/ImportModal.vue'
import { api } from '@/api'
import type { User, UserSearchParams, UserCreateRequest, UserUpdateRequest } from '@/types'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const error = ref('')
const submitting = ref(false)
const operatingUsers = ref(new Set<string>())

const searchForm = reactive<UserSearchParams>({
  keyword: '',
  status: '',
  current: 1,
  pageSize: 10
})

const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const showConfirmModal = ref(false)
const showImportModal = ref(false)
const currentUser = ref<User | null>(null)

// 用户数据
const userList = ref<User[]>([])
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10
})

// Tooltip 相关数据
const tooltipVisible = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })
const tooltipGroups = ref<string[]>([])

// 默认头像
const defaultAvatar = `data:image/svg+xml;charset=UTF-8,%3csvg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='24' cy='24' r='24' fill='url(%23gradient0_linear_1_1)'/%3e%3ccircle cx='24' cy='19' r='7' fill='white' fill-opacity='0.9'/%3e%3cpath d='M12 38C12 31.3726 17.3726 26 24 26C30.6274 26 36 31.3726 36 38V38H12Z' fill='white' fill-opacity='0.9'/%3e%3cdefs%3e%3clinearGradient id='gradient0_linear_1_1' x1='0' y1='0' x2='48' y2='48' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='%2300EEFF'/%3e%3cstop offset='0.5' stop-color='%2300AACC'/%3e%3cstop offset='1' stop-color='%23007799'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e`
const confirmConfig = ref({
  title: '',
  message: '',
  details: [] as string[],
  type: 'warning' as 'warning' | 'danger' | 'info' | 'success',
  confirmText: '',
  confirmIcon: '',
  loading: false,
  onConfirm: () => {}
})
const selectedUsers = ref<string[]>([])
const currentPageInput = ref(1)

// 计算属性
const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize))

const isCurrentPageAllSelected = computed(() => {
  return userList.value.length > 0 && userList.value.every(user => selectedUsers.value.includes(user.id))
})

const isCurrentPagePartialSelected = computed(() => {
  return selectedUsers.value.length > 0 && selectedUsers.value.length < userList.value.length
})

// 生命周期
onMounted(() => {
  loadUsers()
})

// 方法
const loadUsers = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await api.user.getUsers(searchForm)
    userList.value = response.data.list
    pagination.total = response.data.total
    pagination.current = response.data.current
    pagination.pageSize = response.data.pageSize
    currentPageInput.value = pagination.current
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载用户数据失败'
    console.error('加载用户失败:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  searchForm.current = 1
  pagination.current = 1
  selectedUsers.value = []
  loadUsers()
}

const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  searchForm.current = page
  pagination.current = page
  currentPageInput.value = page
  selectedUsers.value = []
  loadUsers()
}

const goToPage = () => {
  const page = currentPageInput.value
  if (page >= 1 && page <= totalPages.value) {
    handlePageChange(page)
  }
}

const handleSelectAll = () => {
  if (isCurrentPageAllSelected.value) {
    selectedUsers.value = []
  } else {
    selectedUsers.value = userList.value.map(user => user.id)
  }
}

const getUserAvatar = (user: User) => {
  return user.avatar || defaultAvatar
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = defaultAvatar
}

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const showGroupTooltip = (event: MouseEvent, groups: string[]) => {
  tooltipGroups.value = groups
  tooltipPosition.value = { x: event.pageX + 10, y: event.pageY + 10 }
  tooltipVisible.value = true
}

const hideGroupTooltip = () => {
  tooltipVisible.value = false
}

const viewUserDetail = (user: User) => {
  router.push(`/permission/users/${user.id}`)
}

const editUser = (user: User) => {
  currentUser.value = user
  showEditUserModal.value = true
}

const toggleUserStatus = async (user: User) => {
  try {
    operatingUsers.value.add(user.id)
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    
    await api.user.updateUserStatus(user.id, newStatus)
    
    // 更新本地状态
    user.status = newStatus

  } catch (err) {
    error.value = err instanceof Error ? err.message : '更新用户状态失败'
    console.error('更新用户状态失败:', err)
  } finally {
    operatingUsers.value.delete(user.id)
  }
}

const deleteUser = (user: User) => {
  confirmConfig.value = {
    title: '删除用户',
    message: `确定要删除用户 "${user.nickname || user.username}" 吗？`,
    details: [
      `用户名：${user.username}`,
      `邮箱：${user.email || '无'}`,
      '删除后无法恢复，请谨慎操作！'
    ],
    type: 'danger',
    confirmText: '删除',
    confirmIcon: 'trash',
    loading: false,
    onConfirm: async () => {
      try {
        await api.user.deleteUser(user.id)

        // 重新加载当前页数据
        loadUsers()
      } catch (err) {
        error.value = err instanceof Error ? err.message : '删除用户失败'
        console.error('删除用户失败:', err)
      }
    }
  }
  showConfirmModal.value = true
}

const batchDeleteUsers = () => {
  confirmConfig.value = {
    title: '批量删除用户',
    message: `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
    details: [
      `选中用户数量：${selectedUsers.value.length}`,
      '删除后无法恢复，请谨慎操作！'
    ],
    type: 'danger',
    confirmText: '批量删除',
    confirmIcon: 'trash',
    loading: false,
    onConfirm: async () => {
      try {
        await api.user.batchDeleteUsers(selectedUsers.value)

        selectedUsers.value = []
        // 重新加载当前页数据
        loadUsers()
      } catch (err) {
        error.value = err instanceof Error ? err.message : '批量删除用户失败'
        console.error('批量删除用户失败:', err)
      }
    }
  }
  showConfirmModal.value = true
}

const exportUsers = async () => {
  try {
    await api.user.exportUsers(searchForm)

  } catch (err) {
    error.value = err instanceof Error ? err.message : '导出用户数据失败'
    console.error('导出用户数据失败:', err)
  }
}

// 处理用户提交（添加或编辑）
const handleUserSubmit = async (userData: UserCreateRequest | UserUpdateRequest) => {
  try {
    submitting.value = true
    
    if (currentUser.value) {
      // 编辑用户
      const updateData = { ...userData, id: currentUser.value.id } as UserUpdateRequest
      await api.user.updateUser(updateData)
    } else {
      // 添加用户
      await api.user.createUser(userData as UserCreateRequest)
    }
    
    // 关闭模态框
    handleCloseUserModal()
    
    // 重新加载数据
    loadUsers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存用户失败'
    console.error('保存用户失败:', err)
  } finally {
    submitting.value = false
  }
}

// 处理用户导入
const handleUserImport = async (importedUsers: UserCreateRequest[]) => {
  try {
    // 批量创建用户
    const promises = importedUsers.map(userData => api.user.createUser(userData))
    await Promise.all(promises)
    

    showImportModal.value = false
    
    // 重新加载数据
    loadUsers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '导入用户失败'
    console.error('导入用户失败:', err)
  }
}

// 处理确认操作
const handleConfirm = () => {
  if (confirmConfig.value.onConfirm) {
    confirmConfig.value.onConfirm()
  }
}

// 关闭弹窗时重置当前用户
const handleCloseUserModal = () => {
  currentUser.value = null
  showAddUserModal.value = false
  showEditUserModal.value = false
}
</script>

<style scoped>
.user-view {
  padding: 0;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.page-title .fa-icon,
.page-title svg {
  color: #00eeff;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  margin: 0;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 24px;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.search-group {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
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

.search-btn {
  padding: 12px 20px;
  background: linear-gradient(45deg, #00eeff, #00b4db);
  border: none;
  border-radius: 8px;
  color: #0f2027;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-btn:hover {
  background: linear-gradient(45deg, #00b4db, #00eeff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 238, 255, 0.3);
}

.action-section {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.action-btn:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
}

.action-btn.primary {
  background: linear-gradient(45deg, #00eeff, #00b4db);
  color: #0f2027;
  border-color: transparent;
}

.action-btn.primary:hover {
  background: linear-gradient(45deg, #00b4db, #00eeff);
}

.action-btn.small {
  padding: 8px;
  font-size: 12px;
}

.action-btn.warning {
  color: #f39c12;
  border-color: rgba(243, 156, 18, 0.3);
}

.action-btn.warning:hover {
  background: rgba(243, 156, 18, 0.1);
  border-color: #f39c12;
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

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00eeff;
}

.loading-spinner .fa-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 错误提示 */
.error-container {
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #e74c3c;
  font-size: 14px;
}

.error-message .fa-icon {
  color: #e74c3c;
}

.retry-btn {
  padding: 8px 12px;
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-btn:hover {
  background: linear-gradient(45deg, #c0392b, #e74c3c);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

/* 表格 */
.table-container {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  font-weight: 600;
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
}

.table-row:hover {
  background: rgba(0, 238, 255, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(0, 238, 255, 0.3);
  object-fit: cover;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-avatar:hover {
  border-color: rgba(0, 238, 255, 0.6);
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(0, 238, 255, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 500;
  color: #fff;
}

.user-email,
.user-phone {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 用户组 */
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

.group-count {
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: help;
  white-space: nowrap;
}

.group-count:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

.no-groups {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(158, 158, 158, 0.15);
  color: rgba(158, 158, 158, 0.8);
  border: 1px solid rgba(158, 158, 158, 0.2);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  gap: 6px;
}

.status-badge.active {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.status-badge.inactive {
  background: rgba(149, 165, 166, 0.2);
  color: #95a5a6;
}

.last-login,
.create-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.never-login {
  color: rgba(255, 255, 255, 0.5);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-icon {
  padding: 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
}

.action-icon.view:hover {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border-color: #52c41a;
}

.action-icon.edit:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
}

.action-icon.toggle:hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
}

.action-icon.delete:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-color: #e74c3c;
}

.action-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 238, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
}

.pagination-info {
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-btn {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:not(:disabled):hover {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  border-color: #00eeff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

 .page-info {
   font-weight: 500;
   color: #00eeff;
 }
 
 /* 空状态 */
 .empty-state {
   text-align: center;
   padding: 60px 20px;
   color: rgba(255, 255, 255, 0.6);
 }
 
 .empty-icon {
   font-size: 64px;
   color: rgba(0, 238, 255, 0.3);
   margin-bottom: 20px;
 }
 
 .empty-title {
   font-size: 18px;
   color: rgba(255, 255, 255, 0.8);
   margin-bottom: 8px;
 }
 
 .empty-description {
   font-size: 14px;
   color: rgba(255, 255, 255, 0.5);
   margin: 0;
 }

/* 悬浮提示 */
.group-tooltip {
  position: fixed;
  z-index: 1000;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  transform: translateX(-50%) translateY(-100%);
  max-width: 300px;
  min-width: 200px;
}

.group-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(0, 238, 255, 0.3);
}

.group-tooltip::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1a1a2e;
  z-index: 1;
}

.tooltip-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #00eeff;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
  padding-bottom: 4px;
}

.tooltip-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tooltip-content li {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(0, 238, 255, 0.15);
  color: #00eeff;
  border: 1px solid rgba(0, 238, 255, 0.3);
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .search-section {
    flex-direction: column;
    gap: 12px;
  }

  .action-section {
    justify-content: center;
  }

  .data-table {
    font-size: 12px;
  }

  .data-table th,
  .data-table td {
    padding: 12px 8px;
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
  }
  
  .user-avatar:hover {
    transform: scale(1.1);
  }
}
</style>