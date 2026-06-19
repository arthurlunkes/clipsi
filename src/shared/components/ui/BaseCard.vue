<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  border?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  hover: false,
  border: true,
})

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-sm"
    :class="[
      paddings[padding],
      border ? 'border border-[#E2E8F0]' : '',
      hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : '',
    ]"
  >
    <slot />
  </div>
</template>
