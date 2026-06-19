<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
  fullWidth: false,
})

const classes = computed(() => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary: 'bg-[#7C5CFC] text-white hover:bg-[#5B3FD4] focus-visible:ring-[#7C5CFC] shadow-sm hover:shadow-md',
    secondary: 'bg-[#EDE9FE] text-[#7C5CFC] hover:bg-[#DDD6FE] focus-visible:ring-[#7C5CFC]',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] focus-visible:ring-[#EF4444] shadow-sm',
    ghost: 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] focus-visible:ring-[#7C5CFC]',
    outline: 'border border-[#E2E8F0] text-[#1E293B] hover:bg-[#F8FAFC] focus-visible:ring-[#7C5CFC] bg-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return [base, variants[props.variant], sizes[props.size], props.fullWidth ? 'w-full' : '']
})
</script>

<template>
  <button
    :class="classes"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <svg v-if="loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
    <slot />
  </button>
</template>
