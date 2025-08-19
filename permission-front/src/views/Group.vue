<template>
  <div class="group-view">
    <div class="page-header">
      <h1 class="page-title">
        <font-awesome-icon icon="users" />
        用户组管理
      </h1>
      <p class="page-subtitle">管理系统的各类用户组，支持多维度分组和层次结构</p>
    </div>

    <!-- 功能切换标签 -->
    <div class="view-switcher">
      <button 
        class="switch-btn" 
        :class="{ active: currentView === 'list' }"
        @click="currentView = 'list'"
      >
        <font-awesome-icon icon="list" />
        组列表
      </button>
      <button 
        class="switch-btn" 
        :class="{ active: currentView === 'tree-members' }"
        @click="currentView = 'tree-members'"
      >
        <font-awesome-icon icon="sitemap" />
        结构与成员
      </button>
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
      <font-awesome-icon icon="exclamation-triangle" />
      {{ error }}
      <button @click="loadGroups" class="retry-btn">重试</button>
    </div>

    <!-- 列表视图 -->
    <div v-if="!loading && !error && currentView === 'list'" class="list-view">
      <!-- 搜索和操作区域 -->
      <div class="toolbar">
        <div class="search-section">
          <div class="search-group">
            <font-awesome-icon icon="search" class="search-icon" />
            <input 
              v-model="searchForm.keyword" 
              type="text" 
              placeholder="搜索用户组名称、编码或描述" 
              class="search-input"
              @keyup.enter="handleSearch" 
            />
          </div>

          <select v-model="searchForm.type" class="filter-select" @change="handleSearch">
            <option value="">全部类型</option>
            <option value="department">部门组</option>
            <option value="project">项目组</option>
            <option value="function">职能组</option>
            <option value="security">安全组</option>
            <option value="custom">自定义组</option>
          </select>

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
          <button class="action-btn primary" @click="showCreateModal" :disabled="loading">
            <font-awesome-icon icon="plus" />
            创建用户组
          </button>
          <button class="action-btn" @click="showImportModal = true" :disabled="loading">
            <font-awesome-icon icon="file-import" />
            导入
          </button>
          <button class="action-btn" @click="exportGroups" :disabled="loading">
            <font-awesome-icon icon="download" />
            导出
          </button>
          <button 
            v-if="selectedGroups.length > 0" 
            class="action-btn danger" 
            @click="batchDeleteGroups"
            :disabled="loading"
          >
            <font-awesome-icon icon="trash" />
            批量删除 ({{ selectedGroups.length }})
          </button>
        </div>
      </div>

      <!-- 用户组表格 -->
      <div class="table-container">
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
              <th>用户组信息</th>
              <th>类型</th>
              <th>成员数量</th>
              <th>层级</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="group in groupList" :key="group.id" class="table-row">
              <td>
                <input type="checkbox" :value="group.id" v-model="selectedGroups" />
              </td>
              <td>
                <div class="group-info" @click="viewGroupDetail(group)">
                  <div class="group-icon">
                    <font-awesome-icon :icon="getGroupIcon(group.type)" />
                  </div>
                  <div class="group-details">
                    <div class="group-name">{{ group.name }}</div>
                    <div class="group-code">{{ group.code }}</div>
                    <div class="group-description" v-if="group.description">{{ group.description }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span :class="['type-badge', group.type]">
                  {{ getGroupTypeLabel(group.type) }}
                </span>
              </td>
              <td>
                <span class="member-count" @click="viewGroupMembers(group)">
                  <font-awesome-icon icon="user" />
                  {{ group.memberCount || 0 }}
                </span>
              </td>
              <td>
                <div class="level-info">
                  <span class="level-badge">L{{ group.level || 1 }}</span>
                  <span v-if="group.path" class="group-path" :title="group.path">
                    {{ group.path }}
                  </span>
                </div>
              </td>
              <td>
                <span :class="['status-badge', group.status]">
                  <font-awesome-icon 
                    :icon="group.status === 'active' ? 'check-circle' : 'times-circle'" 
                  />
                  {{ group.status === 'active' ? '启用' : '禁用' }}
                </span>
              </td>
              <td>
                <span class="create-time">{{ formatDateTime(group.createTime) }}</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="action-icon view" 
                    @click="viewGroupDetail(group)"
                    title="查看详情"
                  >
                    <font-awesome-icon icon="eye" />
                  </button>
                  <button 
                    class="action-icon edit" 
                    @click="editGroup(group)"
                    :disabled="operatingGroups.has(group.id)"
                    title="编辑"
                  >
                    <font-awesome-icon icon="edit" />
                  </button>
                  <button 
                    class="action-icon members" 
                    @click="manageGroupMembers(group)"
                    title="管理成员"
                  >
                    <font-awesome-icon icon="users-cog" />
                  </button>
                  <button 
                    class="action-icon toggle" 
                    @click="toggleGroupStatus(group)"
                    :disabled="operatingGroups.has(group.id)"
                    :title="group.status === 'active' ? '禁用' : '启用'"
                  >
                    <font-awesome-icon 
                      :icon="operatingGroups.has(group.id) ? 'spinner' : (group.status === 'active' ? 'ban' : 'check')"
                      :spin="operatingGroups.has(group.id)"
                    />
                  </button>
                  <button 
                    class="action-icon delete" 
                    @click="deleteGroup(group)"
                    :disabled="operatingGroups.has(group.id)"
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
          <h3>暂无用户组数据</h3>
          <p>{{ searchForm.keyword || searchForm.type || searchForm.status ? '没有找到符合条件的用户组' : '还没有创建任何用户组' }}</p>
          <button v-if="!searchForm.keyword && !searchForm.type && !searchForm.status" class="action-btn primary" @click="showCreateModal">
            <font-awesome-icon icon="plus" />
            创建第一个用户组
          </button>
        </div>
      </div>
    </div>

    <!-- 树形结构与成员视图 -->
    <div v-if="!loading && !error && currentView === 'tree-members'" class="tree-view">
      <div class="tree-toolbar">
        <button class="action-btn primary" @click="showCreateModal" :disabled="loading">
          <font-awesome-icon icon="plus" />
          创建用户组
        </button>
        <button class="action-btn" @click="refreshTree" :disabled="treeLoading">
          <font-awesome-icon icon="sync" :spin="treeLoading" />
          刷新
        </button>
        <button class="action-btn" @click="expandAll">
          <font-awesome-icon icon="expand-arrows-alt" />
          展开全部
        </button>
        <button class="action-btn" @click="collapseAll">
          <font-awesome-icon icon="compress-arrows-alt" />
          收起全部
        </button>
      </div>

      <div class="tree-content">
        <div class="group-tree-panel">
          <h3>
            <font-awesome-icon icon="sitemap" />
            组织结构
          </h3>
          <div v-if="treeLoading" class="tree-loading">
            <font-awesome-icon icon="spinner" spin />
            加载中...
          </div>
                     <div v-else class="tree-container">
             <TreeNode
               v-for="rootGroup in groupTree"
               :key="rootGroup.id"
               :group="rootGroup"
               :expanded="expandedNodes.has(rootGroup.id)"
               :selected="selectedGroupId === rootGroup.id"
               :all-groups="groupTree"
               :selected-group-id="selectedGroupId"
               @toggle="toggleNode"
               @select="selectGroup"
               @edit="editGroup"
               @delete="deleteGroup"
               @create-child="addChildGroup"
               @manage-members="viewGroupMembers"
             />
           </div>
        </div>

        <div class="group-members-panel">
          <div v-if="selectedGroup" class="members-content">
            <div class="members-header">
              <h3>
                <font-awesome-icon :icon="getGroupIcon(selectedGroup.type)" />
                {{ selectedGroup.name }} - 成员管理
              </h3>
              <button class="action-btn primary" @click="addGroupMember" :disabled="membersLoading">
                <font-awesome-icon icon="user-plus" />
                添加成员
              </button>
            </div>

            <div v-if="membersLoading" class="members-loading">
              <font-awesome-icon icon="spinner" spin />
              加载成员数据...
            </div>

            <div v-else class="members-list">
              <div v-if="groupMembers.length === 0" class="no-members">
                <font-awesome-icon icon="users" />
                <p>该用户组暂无成员</p>
                <button class="action-btn primary" @click="addGroupMember">
                  <font-awesome-icon icon="user-plus" />
                  添加第一个成员
                </button>
              </div>

              <div v-else class="members-table">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>用户信息</th>
                      <th>成员类型</th>
                      <th>加入时间</th>
                      <th>过期时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="member in groupMembers" :key="member.id">
                      <td>
                        <div class="member-info">
                          <img 
                            :src="getUserAvatar(member.user)" 
                            :alt="member.user.nickname || member.user.username" 
                            class="member-avatar"
                            @error="handleAvatarError"
                          />
                          <div class="member-details">
                            <div class="member-name">{{ member.user.nickname || member.user.username }}</div>
                            <div class="member-email">{{ member.user.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span :class="['member-type-badge', member.memberType.toLowerCase()]">
                          {{ getMemberTypeLabel(member.memberType) }}
                        </span>
                      </td>
                      <td>
                        <span class="join-time">{{ formatDateTime(member.joinTime) }}</span>
                      </td>
                      <td>
                        <span v-if="member.expireTime" class="expire-time">
                          {{ formatDateTime(member.expireTime) }}
                        </span>
                        <span v-else class="no-expire">永不过期</span>
                      </td>
                      <td>
                        <div class="member-actions">
                          <button 
                            class="action-icon edit" 
                            @click="editGroupMember(member)"
                            title="编辑成员"
                          >
                            <font-awesome-icon icon="edit" />
                          </button>
                          <button 
                            class="action-icon delete" 
                            @click="removeGroupMember(member)"
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

          <div v-else class="no-group-selected">
            <font-awesome-icon icon="hand-point-left" />
            <p>请从左侧选择一个用户组查看其成员信息</p>
          </div>
        </div>
      </div>
    </div>

         <!-- 用户组模态框 -->
     <GroupFormModal
       v-if="showGroupModal"
       :visible="showGroupModal"
       :group-data="currentGroup"
       :parent-groups="parentGroupOptions"
       :loading="submitting"
       @submit="handleGroupSubmit"
       @close="handleCloseGroupModal"
     />

     <!-- 成员管理模态框 -->
     <MemberModal
       v-if="showMemberModal"
       :visible="showMemberModal"
       :group-id="selectedGroup?.id"
       @submit="handleMemberSubmit"
       @close="handleCloseMemberModal"
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
      type="group"
      @import="handleGroupImport"
      @close="showImportModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import GroupFormModal from '@/components/Group/GroupFormModal.vue'
import MemberModal from '@/components/Group/MemberModal.vue'
import TreeNode from '@/components/Group/TreeNode.vue'
import ConfirmModal from '@/components/Common/ConfirmModal.vue'
import ImportModal from '@/components/User/ImportModal.vue'
import { api } from '@/api'
import type { 
  UserGroup, 
  GroupSearchParams, 
  GroupCreateRequest, 
  GroupUpdateRequest,
  GroupMember,
  GroupMemberRequest,
  User
} from '@/types'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const treeLoading = ref(false)
const membersLoading = ref(false)
const error = ref('')
const submitting = ref(false)
const operatingGroups = ref(new Set<string>())

const currentView = ref<'list' | 'tree-members'>('list')

const searchForm = reactive<GroupSearchParams>({
  keyword: '',
  type: '',
  status: '',
  current: 1,
  pageSize: 10
})

// 模态框状态
const showGroupModal = ref(false)
const showMemberModal = ref(false)
const showConfirmModal = ref(false)
const showImportModal = ref(false)

// 当前操作的数据
const currentGroup = ref<UserGroup | null>(null)
const currentMember = ref<GroupMember | null>(null)

// 列表数据
const groupList = ref<UserGroup[]>([])
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10
})

// 树形数据
const groupTree = ref<UserGroup[]>([])
const selectedGroupId = ref<string | null>(null)
const selectedGroup = ref<UserGroup | null>(null)
const expandedNodes = ref(new Set<string>())

// 成员数据
const groupMembers = ref<GroupMember[]>([])

// 其他数据
const parentGroupOptions = ref<UserGroup[]>([])
const selectedGroups = ref<string[]>([])
const currentPageInput = ref(1)
const confirmConfig = ref<any>({})

// 默认头像
const defaultAvatar = `data:image/svg+xml;charset=UTF-8,%3csvg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='24' cy='24' r='24' fill='url(%23gradient0_linear_1_1)'/%3e%3ccircle cx='24' cy='19' r='7' fill='white' fill-opacity='0.9'/%3e%3cpath d='M12 38C12 31.3726 17.3726 26 24 26C30.6274 26 36 31.3726 36 38V38H12Z' fill='white' fill-opacity='0.9'/%3e%3cdefs%3e%3clinearGradient id='gradient0_linear_1_1' x1='0' y1='0' x2='48' y2='48' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='%2300EEFF'/%3e%3cstop offset='0.5' stop-color='%2300AACC'/%3e%3cstop offset='1' stop-color='%23007799'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e`

// 计算属性
const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize))

const isCurrentPageAllSelected = computed(() => {
  return groupList.value.length > 0 && groupList.value.every(group => selectedGroups.value.includes(group.id))
})

const isCurrentPagePartialSelected = computed(() => {
  return selectedGroups.value.length > 0 && selectedGroups.value.length < groupList.value.length
})

// 生命周期
onMounted(() => {
  loadGroups()
  loadParentGroupOptions()
})

// 方法
const loadGroups = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await api.group.getGroups(searchForm)
    groupList.value = response.data.list
    pagination.total = response.data.total
    pagination.current = response.data.current
    pagination.pageSize = response.data.pageSize
    currentPageInput.value = pagination.current
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载用户组数据失败'
    console.error('加载用户组失败:', err)
  } finally {
    loading.value = false
  }
}

const loadGroupTree = async () => {
  try {
    treeLoading.value = true
    const response = await api.group.getGroupTree()
    groupTree.value = response.data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载用户组树失败'
    console.error('加载用户组树失败:', err)
  } finally {
    treeLoading.value = false
  }
}

const loadParentGroupOptions = async () => {
  try {
    const response = await api.group.getGroups({ pageSize: 1000 })
    parentGroupOptions.value = response.data.list
  } catch (err) {
    console.error('加载父组选项失败:', err)
  }
}

const loadGroupMembers = async (groupId: string) => {
  try {
    membersLoading.value = true
    const response = await api.group.getGroupMembers(groupId)
    groupMembers.value = response.data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载组成员失败'
    console.error('加载组成员失败:', err)
  } finally {
    membersLoading.value = false
  }
}

const handleSearch = () => {
  searchForm.current = 1
  pagination.current = 1
  selectedGroups.value = []
  loadGroups()
}

const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  searchForm.current = page
  pagination.current = page
  currentPageInput.value = page
  selectedGroups.value = []
  loadGroups()
}

const goToPage = () => {
  const page = currentPageInput.value
  if (page >= 1 && page <= totalPages.value) {
    handlePageChange(page)
  }
}

const handleSelectAll = () => {
  if (isCurrentPageAllSelected.value) {
    selectedGroups.value = []
  } else {
    selectedGroups.value = groupList.value.map(group => group.id)
  }
}

const getGroupIcon = (type: string) => {
  const icons: Record<string, string> = {
    department: 'building',
    project: 'project-diagram',
    function: 'cogs',
    security: 'shield-alt',
    custom: 'layer-group'
  }
  return icons[type] || 'users'
}

const getGroupTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    department: '部门组',
    project: '项目组',
    function: '职能组',
    security: '安全组',
    custom: '自定义组'
  }
  return labels[type] || type
}

const getMemberTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    MEMBER: '普通成员',
    ADMIN: '组管理员',
    OWNER: '组所有者'
  }
  return labels[type] || type
}

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getUserAvatar = (user: User) => {
  return user.avatar || defaultAvatar
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = defaultAvatar
}

// 用户组操作
const showCreateModal = () => {
  currentGroup.value = null
  showGroupModal.value = true
}

const viewGroupDetail = (group: UserGroup) => {
  router.push(`/groups/${group.id}`)
}

const editGroup = (group: UserGroup) => {
  currentGroup.value = group
  showGroupModal.value = true
}

const toggleGroupStatus = async (group: UserGroup) => {
  try {
    operatingGroups.value.add(group.id)
    const newStatus = group.status === 'active' ? 'inactive' : 'active'
    
    await api.group.updateGroupStatus(group.id, newStatus)
    
    // 更新本地状态
    group.status = newStatus
    console.log(`用户组 ${group.name} 状态已更新为 ${newStatus}`)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '更新用户组状态失败'
    console.error('更新用户组状态失败:', err)
  } finally {
    operatingGroups.value.delete(group.id)
  }
}

const deleteGroup = (group: UserGroup) => {
  confirmConfig.value = {
    title: '删除用户组',
    message: `确定要删除用户组 "${group.name}" 吗？`,
    details: [
      `用户组名称：${group.name}`,
      `用户组编码：${group.code}`,
      `成员数量：${group.memberCount || 0}`,
      '删除后无法恢复，请谨慎操作！'
    ],
    type: 'danger',
    confirmText: '删除',
    confirmIcon: 'trash',
    onConfirm: async () => {
      try {
        await api.group.deleteGroup(group.id)
        console.log('用户组已删除:', group.name)
        // 重新加载数据
        loadGroups()
        if (currentView.value === 'tree-members') {
          loadGroupTree()
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : '删除用户组失败'
        console.error('删除用户组失败:', err)
      }
    }
  }
  showConfirmModal.value = true
}

const batchDeleteGroups = () => {
  confirmConfig.value = {
    title: '批量删除用户组',
    message: `确定要删除选中的 ${selectedGroups.value.length} 个用户组吗？`,
    details: [
      `选中用户组数量：${selectedGroups.value.length}`,
      '删除后无法恢复，请谨慎操作！'
    ],
    type: 'danger',
    confirmText: '批量删除',
    confirmIcon: 'trash',
    onConfirm: async () => {
      try {
        await api.group.batchDeleteGroups(selectedGroups.value)
        console.log(`成功删除 ${selectedGroups.value.length} 个用户组`)
        selectedGroups.value = []
        // 重新加载数据
        loadGroups()
      } catch (err) {
        error.value = err instanceof Error ? err.message : '批量删除用户组失败'
        console.error('批量删除用户组失败:', err)
      }
    }
  }
  showConfirmModal.value = true
}

const exportGroups = async () => {
  try {
    await api.group.exportGroups(searchForm)
    console.log('用户组数据导出成功')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '导出用户组数据失败'
    console.error('导出用户组数据失败:', err)
  }
}

// 处理用户组提交（添加或编辑）
const handleGroupSubmit = async (groupData: GroupCreateRequest | GroupUpdateRequest) => {
  try {
    submitting.value = true
    
    if (currentGroup.value) {
      // 编辑用户组
      const updateData = { ...groupData, id: currentGroup.value.id } as GroupUpdateRequest
      await api.group.updateGroup(updateData)
      console.log('用户组已更新:', groupData)
    } else {
      // 添加用户组
      await api.group.createGroup(groupData as GroupCreateRequest)
      console.log('用户组已添加:', groupData)
    }
    
    // 关闭模态框
    handleCloseGroupModal()
    
    // 重新加载数据
    loadGroups()
    loadParentGroupOptions()
    if (currentView.value === 'tree-members') {
      loadGroupTree()
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存用户组失败'
    console.error('保存用户组失败:', err)
  } finally {
    submitting.value = false
  }
}

// 处理用户组导入
const handleGroupImport = async (importedGroups: GroupCreateRequest[]) => {
  try {
    // 批量创建用户组
    const promises = importedGroups.map(groupData => api.group.createGroup(groupData))
    await Promise.all(promises)
    
    console.log(`成功导入 ${importedGroups.length} 个用户组`)
    showImportModal.value = false
    
    // 重新加载数据
    loadGroups()
    loadParentGroupOptions()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '导入用户组失败'
    console.error('导入用户组失败:', err)
  }
}

// 关闭弹窗时重置当前用户组
const handleCloseGroupModal = () => {
  currentGroup.value = null
  showGroupModal.value = false
}

// 树形视图相关方法
const refreshTree = () => {
  loadGroupTree()
}

const expandAll = () => {
  const allIds = new Set<string>()
  const addIds = (groups: UserGroup[]) => {
    groups.forEach(group => {
      allIds.add(group.id)
      if (group.children) {
        addIds(group.children)
      }
    })
  }
  addIds(groupTree.value)
  expandedNodes.value = allIds
}

const collapseAll = () => {
  expandedNodes.value.clear()
}

const toggleNode = (groupId: string) => {
  if (expandedNodes.value.has(groupId)) {
    expandedNodes.value.delete(groupId)
  } else {
    expandedNodes.value.add(groupId)
  }
}

const selectGroup = (group: UserGroup) => {
  selectedGroupId.value = group.id
  selectedGroup.value = group
  loadGroupMembers(group.id)
}

const addChildGroup = (parentGroup: UserGroup) => {
  currentGroup.value = { parentId: parentGroup.id } as UserGroup
  showGroupModal.value = true
}

// 成员管理相关方法
const viewGroupMembers = (group: UserGroup) => {
  currentView.value = 'tree-members'
  selectGroup(group)
  if (!groupTree.value.length) {
    loadGroupTree()
  }
}

const manageGroupMembers = (group: UserGroup) => {
  viewGroupMembers(group)
}

const addGroupMember = () => {
  currentMember.value = null
  showMemberModal.value = true
}

const editGroupMember = (member: GroupMember) => {
  currentMember.value = member
  showMemberModal.value = true
}

const removeGroupMember = (member: GroupMember) => {
  confirmConfig.value = {
    title: '移除组成员',
    message: `确定要将 "${member.user.nickname || member.user.username}" 从用户组中移除吗？`,
    details: [
      `用户：${member.user.nickname || member.user.username}`,
      `用户组：${selectedGroup.value?.name}`,
      `成员类型：${getMemberTypeLabel(member.memberType)}`
    ],
    type: 'warning',
    confirmText: '移除',
    confirmIcon: 'user-minus',
    onConfirm: async () => {
      try {
        await api.group.removeGroupMember(selectedGroup.value!.id, member.user.id)
        console.log('组成员已移除:', member.user.username)
        // 重新加载成员数据
        loadGroupMembers(selectedGroup.value!.id)
        // 更新组信息中的成员数量
        if (selectedGroup.value) {
          selectedGroup.value.memberCount = (selectedGroup.value.memberCount || 1) - 1
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : '移除组成员失败'
        console.error('移除组成员失败:', err)
      }
    }
  }
  showConfirmModal.value = true
}

const handleMemberSubmit = async (memberData: GroupMemberRequest) => {
  try {
    submitting.value = true
    
    if (currentMember.value) {
      // 编辑成员
      await api.group.updateGroupMember(selectedGroup.value!.id, currentMember.value.user.id, memberData)
      console.log('组成员已更新:', memberData)
    } else {
      // 添加成员
      await api.group.addGroupMember(selectedGroup.value!.id, memberData)
      console.log('组成员已添加:', memberData)
      // 更新组信息中的成员数量
      if (selectedGroup.value) {
        selectedGroup.value.memberCount = (selectedGroup.value.memberCount || 0) + 1
      }
    }
    
    // 关闭模态框
    handleCloseMemberModal()
    
    // 重新加载成员数据
    loadGroupMembers(selectedGroup.value!.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存组成员失败'
    console.error('保存组成员失败:', err)
  } finally {
    submitting.value = false
  }
}

const handleCloseMemberModal = () => {
  currentMember.value = null
  showMemberModal.value = false
}

// 处理确认操作
const handleConfirm = () => {
  if (confirmConfig.value.onConfirm) {
    confirmConfig.value.onConfirm()
  }
}

// 监听视图切换
const handleViewChange = () => {
  if (currentView.value === 'tree-members' && !groupTree.value.length) {
    loadGroupTree()
  }
}
</script>

<style scoped>
.group-view {
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

/* 视图切换器 */
.view-switcher {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 12px;
  padding: 8px;
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.switch-btn:hover {
  background: rgba(0, 238, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.switch-btn.active {
  background: linear-gradient(45deg, #00eeff, #00b4db);
  color: #0f2027;
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

.error-container .fa-icon {
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

/* 工具栏样式复用用户列表的样式 */
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

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 表格样式复用用户列表的样式 */
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

/* 用户组信息 */
.group-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.group-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00eeff, #00b4db);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f2027;
  font-size: 20px;
  transition: all 0.3s ease;
}

.group-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(0, 238, 255, 0.3);
}

.group-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.group-name {
  font-weight: 500;
  color: #fff;
  font-size: 16px;
}

.group-code {
  font-size: 12px;
  color: rgba(0, 238, 255, 0.8);
  font-family: 'Courier New', monospace;
}

.group-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 类型标签 */
.type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.type-badge.department {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.type-badge.project {
  background: rgba(155, 89, 182, 0.2);
  color: #9b59b6;
}

.type-badge.function {
  background: rgba(230, 126, 34, 0.2);
  color: #e67e22;
}

.type-badge.security {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.type-badge.custom {
  background: rgba(149, 165, 166, 0.2);
  color: #95a5a6;
}

/* 成员数量 */
.member-count {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #00eeff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.member-count:hover {
  background: rgba(0, 238, 255, 0.1);
}

/* 层级信息 */
.level-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-badge {
  display: inline-block;
  padding: 2px 6px;
  background: rgba(0, 238, 255, 0.2);
  color: #00eeff;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  width: fit-content;
}

.group-path {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px; /* Adjust as needed */
}

/* 状态标签 */
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge.active {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.status-badge.inactive {
  background: rgba(149, 165, 166, 0.2);
  color: #95a5a6;
}

.text-muted {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
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

.action-icon.view:hover,
.action-icon.edit:hover,
.action-icon.members:hover,
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

/* 分页样式复用用户列表的样式 */
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

.page-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-input {
  width: 50px;
  padding: 8px;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.page-input:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
}

.page-input::-webkit-inner-spin-button,
.page-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.page-input[type="number"] {
  -moz-appearance: textfield;
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

/* 树形结构与成员管理视图 */
.tree-view {
  min-height: 600px;
}

.tree-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 24px;
}

.tree-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  min-height: 600px;
}

/* 左侧树形面板 */
.group-tree-panel {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  background: rgba(0, 238, 255, 0.1);
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-header h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #00eeff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.tree-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
}

.tree-container {
  padding: 20px;
  min-height: 500px;
  max-height: 500px;
  overflow-y: auto;
}

/* 右侧成员面板 */
.group-members-panel {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
  background: rgba(0, 238, 255, 0.1);
}

.members-header h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #00eeff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.members-content {
  padding: 20px;
}

.members-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
}

.members-list {
  /* Styles for the members list area */
}

.no-members {
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.no-members .fa-icon {
  font-size: 64px;
  color: rgba(0, 238, 255, 0.3);
  margin-bottom: 20px;
}

.no-members h3 {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.no-members p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.no-members .action-btn {
  margin-top: 20px;
}

.members-table {
  /* Styles for the members table */
}

.members-table .data-table {
  width: 100%;
  border-collapse: collapse;
}

.members-table .data-table th {
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
  font-weight: 600;
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.members-table .data-table td {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
}

.members-table .table-row:hover {
  background: rgba(0, 238, 255, 0.05);
}

.members-table .member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.members-table .member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(0, 238, 255, 0.3);
  object-fit: cover;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.members-table .member-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.members-table .member-name {
  font-weight: 500;
  color: #fff;
}

.members-table .member-email {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 成员类型标签 */
.member-type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.member-type-badge.member {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.member-type-badge.admin {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
}

.member-type-badge.owner {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

/* 移除重复的空状态样式，统一使用上面定义的样式 */

.no-group-selected {
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.no-group-selected .fa-icon {
  font-size: 64px;
  color: rgba(0, 238, 255, 0.3);
  margin-bottom: 20px;
}

.no-group-selected p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.no-group-selected .action-btn {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .tree-view {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .group-tree-panel {
    order: 2;
  }
  
  .group-members-panel {
    order: 1;
  }
}

@media (max-width: 768px) {
  .view-switcher {
    flex-direction: column;
    gap: 4px;
  }
  
  .switch-btn {
    justify-content: center;
  }

  .toolbar,
  .tree-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .search-section {
    flex-direction: column;
    gap: 12px;
  }

  .action-section,
  .tree-actions,
  .member-actions {
    justify-content: center;
  }

  .data-table {
    font-size: 12px;
  }

  .data-table th,
  .data-table td {
    padding: 12px 8px;
  }

  .group-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .group-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .member-count {
    font-size: 12px;
  }

  .level-info {
    flex-direction: column;
    gap: 4px;
  }

  .level-badge {
    font-size: 10px;
  }

  .group-path {
    font-size: 10px;
    max-width: 150px;
  }

  .status-badge {
    font-size: 10px;
    padding: 3px 10px;
    gap: 4px;
  }

  .status-badge .fa-icon {
    font-size: 16px;
  }

  .members-stats {
    flex-direction: column;
    gap: 12px;
  }

  .stat-item {
    font-size: 12px;
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

  .user-details {
    align-items: flex-start;
  }

  .user-name {
    font-size: 14px;
  }

  .user-email {
    font-size: 11px;
  }

  .member-type-badge {
    font-size: 10px;
    padding: 3px 10px;
  }

  .join-time,
  .expire-time {
    font-size: 11px;
  }

  .member-actions {
    gap: 4px;
  }

  .action-icon {
    padding: 6px;
    font-size: 14px;
  }
}
</style> 