<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const emit = defineEmits<{ close: [] }>()

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

function handleKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', handleKey))
onUnmounted(() => document.removeEventListener('keydown', handleKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        :aria-modal="true"
        :aria-label="title"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />

        <div
          class="relative bg-white rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh]"
          :class="sizeClasses[size]"
        >
          <div v-if="title || $slots.header" class="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
            <slot name="header">
              <h2 class="text-lg font-semibold text-[#1E293B]">{{ title }}</h2>
            </slot>
            <button
              @click="emit('close')"
              class="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] transition-colors"
              aria-label="Fechar"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="overflow-y-auto flex-1 px-6 py-4">
            <slot />
          </div>

          <div v-if="$slots.footer" class="px-6 py-4 border-t border-[#E2E8F0]">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .relative, .modal-leave-active .relative {
  transition: transform 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: scale(0.95) translateY(-8px);
}
</style>
