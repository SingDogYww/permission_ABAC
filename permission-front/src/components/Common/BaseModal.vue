<template>
  <teleport to="body">
    <transition name="modal" appear>
      <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" :class="[size, { 'full-screen': fullScreen }]" @click.stop>
          <!-- 模态框头部 -->
          <div v-if="!hideHeader" class="modal-header">
            <div class="modal-title-section">
              <div v-if="icon" class="modal-icon">
                <font-awesome-icon :icon="icon" />
              </div>
              <h3 class="modal-title">
                <slot name="title">{{ title }}</slot>
              </h3>
            </div>
            <button v-if="closable" class="close-btn" @click="closeModal" :disabled="loading">
              <font-awesome-icon icon="times" />
            </button>
          </div>

          <!-- 模态框内容 -->
          <div class="modal-body" :class="{ 'no-padding': noPadding }">
            <slot />
          </div>

          <!-- 模态框底部 -->
          <div v-if="!hideFooter && hasFooterContent" class="modal-footer">
            <slot name="footer">
              <div class="default-footer">
                <button v-if="showCancelButton" type="button" class="btn btn-cancel" @click="handleCancel"
                  :disabled="loading">
                  {{ cancelText }}
                </button>
                <button v-if="showConfirmButton" type="button" class="btn btn-confirm" @click="handleConfirm"
                  :disabled="loading || confirmDisabled">
                  <span v-if="loading" class="loading-spinner"></span>
                  <font-awesome-icon v-else-if="confirmIcon" :icon="confirmIcon" />
                  {{ confirmText }}
                </button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Props {
  visible: boolean
  title?: string
  icon?: string
  size?: 'small' | 'medium' | 'large' | 'extra-large'
  fullScreen?: boolean
  closable?: boolean
  maskClosable?: boolean
  hideHeader?: boolean
  hideFooter?: boolean
  noPadding?: boolean
  loading?: boolean
  showCancelButton?: boolean
  showConfirmButton?: boolean
  cancelText?: string
  confirmText?: string
  confirmIcon?: string
  confirmDisabled?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  closable: true,
  maskClosable: true,
  showCancelButton: true,
  showConfirmButton: true,
  cancelText: '取消',
  confirmText: '确定'
})

const emit = defineEmits<Emits>()
const slots = useSlots()

const hasFooterContent = computed(() => {
  return slots.footer || props.showCancelButton || props.showConfirmButton
})

const handleOverlayClick = () => {
  if (props.maskClosable && !props.loading) {
    closeModal()
  }
}

const closeModal = () => {
  if (!props.loading) {
    emit('close')
  }
}

const handleCancel = () => {
  emit('cancel')
  if (!props.loading) {
    emit('close')
  }
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
/* 使用系统全局CSS变量 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-lg);
}

.modal-container {
  background: var(--bg-modal);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl), var(--shadow-glow);
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 模态框大小 */
.modal-container.small {
  width: 100%;
  max-width: 400px;
}

.modal-container.medium {
  width: 100%;
  max-width: 600px;
}

.modal-container.large {
  width: 100%;
  max-width: 800px;
}

.modal-container.extra-large {
  width: 100%;
  max-width: 1200px;
}

.modal-container.full-screen {
  width: 95vw;
  height: 95vh;
  max-width: none;
  max-height: none;
}

/* 模态框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-2xl);
  border-bottom: 1px solid var(--border-accent);
  background: linear-gradient(135deg, var(--bg-card) 0%, transparent 100%);
  position: relative;
  flex-shrink: 0;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 1px;
  background: var(--primary-gradient);
  opacity: 0.6;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  box-shadow: var(--shadow-glow);
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 0.5px;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-md);
}

.close-btn:hover:not(:disabled) {
  background: var(--error-bg);
  color: var(--error-color);
  border-color: var(--error-border);
  box-shadow: var(--shadow-sm);
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 模态框内容 */
.modal-body {
  padding: var(--spacing-xl) var(--spacing-2xl);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.modal-body.no-padding {
  padding: 0;
}

/* 模态框底部 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-xl) var(--spacing-2xl);
  border-top: 1px solid var(--border-accent);
  background: linear-gradient(135deg, transparent 0%, var(--bg-card) 100%);
  position: relative;
  flex-shrink: 0;
}

.modal-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 1px;
  background: var(--primary-gradient);
  opacity: 0.5;
}

.default-footer {
  display: flex;
  gap: var(--spacing-md);
}

.btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 120px;
  justify-content: center;
  letter-spacing: 0.5px;
}

.btn-cancel {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-color: var(--border-primary);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-sm);
}

.btn-confirm {
  background: var(--primary-gradient);
  color: var(--text-primary);
  border-color: var(--primary-color);
  box-shadow: var(--shadow-glow);
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  filter: brightness(1.1);
}

.btn-confirm:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  background: var(--bg-disabled);
  color: var(--text-disabled);
  border-color: var(--border-disabled);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-primary);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}

.modal-enter-to .modal-container,
.modal-leave-from .modal-container {
  transform: scale(1) translateY(0);
}

/* 自定义滚动条 */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  margin: var(--spacing-sm) 0;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--border-accent);
  border-radius: var(--radius-sm);
  border: 2px solid var(--bg-secondary);
  transition: all 0.3s ease;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
  box-shadow: var(--shadow-glow);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-md);
  }

  .modal-container {
    max-width: 100%;
    margin: var(--spacing-sm);
  }

  .modal-header,
  .modal-footer {
    padding: var(--spacing-lg);
  }

  .modal-body {
    padding: var(--spacing-lg);
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: var(--spacing-sm);
  }

  .btn {
    width: 100%;
    min-width: unset;
  }
}

@media (max-width: 480px) {
  .modal-container {
    max-height: 95vh;
  }

  .modal-title {
    font-size: var(--font-size-lg);
  }

  .modal-container.full-screen {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
}
</style>