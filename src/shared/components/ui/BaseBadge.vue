<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info'
  size?: 'sm' | 'md'
  dot?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
  dot: false,
})

const variants = {
  primary: 'bg-[#EDE9FE] text-[#7C5CFC] ring-1 ring-[#7C5CFC]/15',
  success: 'bg-[#DCFCE7] text-[#16A34A] ring-1 ring-[#16A34A]/15',
  warning: 'bg-[#FEF3C7] text-[#D97706] ring-1 ring-[#D97706]/15',
  danger: 'bg-[#FEE2E2] text-[#DC2626] ring-1 ring-[#DC2626]/15',
  neutral: 'bg-[#F1F5F9] text-[#475569] ring-1 ring-[#475569]/10',
  info: 'bg-[#DBEAFE] text-[#1D4ED8] ring-1 ring-[#1D4ED8]/15',
}

const dotColors = {
  primary: 'bg-[#7C5CFC]',
  success: 'bg-[#16A34A]',
  warning: 'bg-[#D97706]',
  danger: 'bg-[#DC2626]',
  neutral: 'bg-[#64748B]',
  info: 'bg-[#1D4ED8]',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 font-semibold rounded-full"
    :class="[variants[variant], sizes[size]]"
  >
    <span
      v-if="dot"
      class="w-1.5 h-1.5 rounded-full animate-pulse"
      :class="dotColors[variant]"
      aria-hidden="true"
    />
    <slot />
  </span>
</template>
