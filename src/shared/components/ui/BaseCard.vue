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
    class="bg-white rounded-2xl shadow-(--shadow-card)"
    :class="[
      paddings[padding],
      border ? 'border border-[#EEF0F7]' : '',
      hover ? 'hover:shadow-(--shadow-lifted) hover:-translate-y-1 hover:border-[#DDD6FE] transition-all duration-300 cursor-pointer' : '',
    ]"
  >
    <slot />
  </div>
</template>
