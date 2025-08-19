<template>
  <div v-if="visible" class="modal-overlay" @click="close">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <font-awesome-icon :icon="isEdit ? 'edit' : 'users-cog'" />
          {{ isEdit ? '编辑用户组' : '新建用户组' }}
        </h3>
        <button class="close-btn" @click="close">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- 基本信息 -->
          <div class="form-section">
            <label class="section-title">基本信息</label>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">
                  用户组名称 <span class="required">*</span>
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-input"
                  placeholder="请输入用户组名称"
                  :class="{ error: errors.name }"
                  @blur="validateForm"
                />
                <div v-if="errors.name" class="field-error">{{ errors.name }}</div>
              </div>
              
              <div class="form-group">
                <label class="form-label">
                  用户组编码 <span class="required">*</span>
                </label>
                <input
                  v-model="formData.code"
                  type="text"
                  class="form-input"
                  placeholder="请输入用户组编码（英文字母、数字、下划线）"
                  :class="{ error: errors.code }"
                  @blur="validateForm"
                />
                <div v-if="errors.code" class="field-error">{{ errors.code }}</div>
              </div>
              
              <div class="form-group">
                <label class="form-label">
                  组类型 <span class="required">*</span>
                </label>
                <select
                  v-model="formData.type"
                  class="form-select"
                  :class="{ error: errors.type }"
                  @change="validateForm"
                >
                  <option value="">请选择组类型</option>
                  <option value="department">部门</option>
                  <option value="project">项目组</option>
                  <option value="role">角色组</option>
                  <option value="function">功能组</option>
                  <option value="other">其他</option>
                </select>
                <div v-if="errors.type" class="field-error">{{ errors.type }}</div>
              </div>
              
              <div class="form-group">
                <label class="form-label">父级用户组</label>
                <select
                  v-model="formData.parentId"
                  class="form-select"
                >
                  <option value="">无父级组</option>
                  <option 
                    v-for="group in availableParentGroups" 
                    :key="group.id" 
                    :value="group.id"
                  >
                    {{ group.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">状态</label>
                <select v-model="formData.status" class="form-select">
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="form-section">
            <label class="section-title">详细信息</label>
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea
                v-model="formData.description"
                class="form-textarea"
                placeholder="请输入用户组描述信息"
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- 自定义属性 -->
          <div class="form-section">
            <label class="section-title">自定义属性</label>
            <div class="attributes-container">
              <div 
                v-for="(attr, index) in formData.attributes" 
                :key="index"
                class="attribute-item"
              >
                <div class="attr-input-group">
                  <input
                    v-model="attr.key"
                    type="text"
                    class="attr-input"
                    placeholder="属性名"
                  />
                  <input
                    v-model="attr.value"
                    type="text"
                    class="attr-input"
                    placeholder="属性值"
                  />
                </div>
                <button 
                  type="button" 
                  class="remove-attr-btn"
                  @click="removeAttribute(index)"
                  title="删除属性"
                >
                  <font-awesome-icon icon="trash" />
                </button>
              </div>
              
              <button 
                type="button" 
                class="add-attr-btn"
                @click="addAttribute"
              >
                <font-awesome-icon icon="plus" />
                添加自定义属性
              </button>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-cancel" @click="close">取消</button>
        <button 
          type="button" 
          class="btn-submit" 
          @click="handleSubmit"
          :disabled="!isFormValid || isSubmitting"
        >
          {{ isSubmitting ? '保存中...' : (isEdit ? '保存' : '创建') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  groupData: {
    type: Object,
    default: null
  },
  parentGroups: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'submit'])

const isEdit = computed(() => !!props.groupData?.id)
const isSubmitting = ref(false)

const formData = reactive({
  name: '',
  code: '',
  type: '',
  parentId: '',
  description: '',
  attributes: [],
  status: 'active'
})

const errors = reactive({
  name: '',
  code: '',
  type: ''
})

// 表单验证
const isFormValid = computed(() => {
  return formData.name && 
         formData.code && 
         formData.type &&
         !errors.name && 
         !errors.code && 
         !errors.type
})

// 可选择的父级组（排除自己和子组）
const availableParentGroups = computed(() => {
  if (!isEdit.value) return props.parentGroups
  
  // 编辑时需要排除自己和自己的子组
  return props.parentGroups.filter(group => {
    return group.id !== props.groupData.id && 
           !group.path?.includes(props.groupData.path)
  })
})

watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    resetForm()
    if (props.groupData) {
      loadGroupData()
    }
  }
})

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    code: '',
    type: '',
    parentId: '',
    description: '',
    attributes: [],
    status: 'active'
  })
  
  Object.assign(errors, {
    name: '',
    code: '',
    type: ''
  })
}

const loadGroupData = () => {
  Object.assign(formData, {
    name: props.groupData.name || '',
    code: props.groupData.code || '',
    type: props.groupData.type || '',
    parentId: props.groupData.parentId || '',
    description: props.groupData.description || '',
    attributes: props.groupData.attributes ? 
      Object.entries(props.groupData.attributes).map(([key, value]) => ({ key, value })) : [],
    status: props.groupData.status || 'active'
  })
}

const validateForm = () => {
  // 重置错误信息
  Object.assign(errors, {
    name: '',
    code: '',
    type: ''
  })
  
  // 验证名称
  if (!formData.name.trim()) {
    errors.name = '请输入用户组名称'
  } else if (formData.name.length > 50) {
    errors.name = '用户组名称长度不能超过50个字符'
  }
  
  // 验证编码
  if (!formData.code.trim()) {
    errors.code = '请输入用户组编码'
  } else if (!/^[a-zA-Z0-9_]+$/.test(formData.code)) {
    errors.code = '用户组编码只能包含英文字母、数字和下划线'
  } else if (formData.code.length > 50) {
    errors.code = '用户组编码长度不能超过50个字符'
  }
  
  // 验证类型
  if (!formData.type) {
    errors.type = '请选择组类型'
  }
  
  return isFormValid.value
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const submitData = {
      ...formData,
      attributes: formData.attributes.length > 0 ? 
        formData.attributes.reduce((acc, attr) => {
          if (attr.key && attr.value) {
            acc[attr.key] = attr.value
          }
          return acc
        }, {}) : null
    }
    
    emit('submit', submitData)
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const close = () => {
  emit('close')
  resetForm()
}

const addAttribute = () => {
  formData.attributes.push({ key: '', value: '' })
}

const removeAttribute = (index) => {
  formData.attributes.splice(index, 1)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
  padding: 20px;
}

.modal-container {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
  background: rgba(0, 238, 255, 0.05);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #00eeff;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #00eeff;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #e74c3c;
}

.form-input,
.form-select,
.form-textarea {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-select option {
  background: #1a2332;
  color: #fff;
}

.form-textarea {
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}

.field-error {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: slideInDown 0.3s ease-out;
}

.field-error::before {
  content: '⚠';
  font-weight: bold;
}

.form-input.error,
.form-select.error {
  border-color: #ff6b6b !important;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.3) !important;
}

.attributes-container {
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  background: rgba(0, 238, 255, 0.05);
}

.attribute-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.attribute-item:last-child {
  margin-bottom: 16px;
}

.attr-input-group {
  display: flex;
  gap: 12px;
  flex: 1;
}

.attr-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 238, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.attr-input:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 5px rgba(0, 238, 255, 0.3);
}

.attr-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.remove-attr-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 12px;
  flex-shrink: 0;
}

.remove-attr-btn:hover {
  background: #ff6b6b;
  color: #fff;
}

.add-attr-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px dashed rgba(0, 238, 255, 0.3);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  width: 100%;
}

.add-attr-btn:hover {
  border-color: #00eeff;
  background: rgba(0, 238, 255, 0.1);
  color: #00eeff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid rgba(0, 238, 255, 0.2);
  background: rgba(0, 238, 255, 0.05);
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-submit {
  background: linear-gradient(45deg, #00eeff, #00b4db);
  color: #0f2027;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(45deg, #00b4db, #00eeff);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 238, 255, 0.3);
}

.btn-submit:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 自定义滚动条 */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(0, 238, 255, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 238, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .attribute-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .attr-input-group {
    flex-direction: column;
  }

  .remove-attr-btn {
    align-self: flex-end;
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 18px;
  }

  .section-title {
    font-size: 14px;
  }

  .form-label {
    font-size: 12px;
  }

  .form-input,
  .form-select,
  .form-textarea,
  .attr-input {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style> 