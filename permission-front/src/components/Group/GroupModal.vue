<template>
  <GroupFormModal
    :visible="visible"
    :group-data="group"
    :parent-groups="parentGroups"
    @close="$emit('close')"
    @submit="$emit('submit', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GroupFormModal from './GroupFormModal.vue'

// Props
const props = defineProps<{
  visible: boolean
  group?: any
  isEdit?: boolean
  parentGroups?: any[]
}>()

// Emits
const emit = defineEmits<{
  close: []
  submit: [group: any]
}>()

// 计算属性 - 如果没有传入parentGroups，则使用空数组
const parentGroups = computed(() => props.parentGroups || [])
</script>

<style scoped>
/* 这个组件只是一个适配器，样式由GroupFormModal处理 */
</style> 