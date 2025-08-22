<template>
  <BaseModal
    :visible="visible"
    :title="effectiveTitle"
    :icon="getIcon()"
    size="small"
    :cancel-text="effectiveCancelText"
    :confirm-text="effectiveConfirmText"
    :confirm-icon="effectiveConfirmIcon"
    @close="close"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <div class="confirm-content">
      <div class="confirm-icon" :class="effectiveType">
        <font-awesome-icon :icon="getIcon()" />
      </div>
      
      <div class="confirm-message-section">
        <p class="confirm-message">{{ effectiveMessage }}</p>
        <div v-if="effectiveDetails" class="confirm-details">
          <p v-for="detail in effectiveDetails" :key="detail" class="detail-item">
            {{ detail }}
          </p>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'

interface ConfirmConfig {
  title?: string
  content?: string
  message?: string
  details?: string[]
  type?: 'warning' | 'danger' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
  confirmIcon?: string
  loading?: boolean
  onConfirm?: () => void
}

interface Props {
  visible: boolean
  title?: string
  message?: string
  details?: string[]
  type?: 'warning' | 'danger' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
  confirmIcon?: string
  config?: ConfirmConfig
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'warning',
  confirmText: '确定',
  cancelText: '取消'
})

const emit = defineEmits<Emits>()

// 合并config和直接props
const effectiveTitle = computed(() => props.config?.title || props.title)
const effectiveMessage = computed(() => props.config?.content || props.config?.message || props.message)
const effectiveDetails = computed(() => props.config?.details || props.details)
const effectiveType = computed(() => props.config?.type || props.type)
const effectiveConfirmText = computed(() => props.config?.confirmText || props.confirmText)
const effectiveCancelText = computed(() => props.config?.cancelText || props.cancelText)
const effectiveConfirmIcon = computed(() => props.config?.confirmIcon || props.confirmIcon)

const getIcon = () => {
  const icons = {
    warning: 'exclamation-triangle',
    danger: 'exclamation-circle',
    info: 'info-circle',
    success: 'check-circle'
  }
  return icons[effectiveType.value]
}

const close = () => {
  emit('close')
}

const handleConfirm = () => {
  if (props.config?.onConfirm) {
    props.config.onConfirm()
  } else {
    emit('confirm')
    close()
  }
}

const handleCancel = () => {
  emit('cancel')
  close()
}
</script>

<style scoped>
.confirm-content {
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.confirm-icon {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-xl);
  font-size: var(--font-size-2xl);
  box-shadow: var(--shadow-lg);
}

.confirm-icon.warning {
  background: var(--warning-bg);
  color: var(--warning-color);
  border: 2px solid var(--warning-border);
}

.confirm-icon.danger {
  background: var(--error-bg);
  color: var(--error-color);
  border: 2px solid var(--error-border);
}

.confirm-icon.info {
  background: var(--info-bg);
  color: var(--info-color);
  border: 2px solid var(--info-border);
}

.confirm-icon.success {
  background: var(--success-bg);
  color: var(--success-color);
  border: 2px solid var(--success-border);
}

.confirm-message-section {
  margin-bottom: var(--spacing-lg);
}

.confirm-message {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-md) 0;
  font-weight: var(--font-weight-medium);
}

.confirm-details {
  margin-top: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--border-accent);
  text-align: left;
}

.detail-item {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.5;
}

.detail-item:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 568px) {
  .confirm-icon {
    width: 60px;
    height: 60px;
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-lg);
  }
}
</style>