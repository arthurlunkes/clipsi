<script setup lang="ts">
interface Props {
  lines?: number
  height?: string
  circle?: boolean
}

withDefaults(defineProps<Props>(), {
  lines: 3,
  height: 'h-4',
  circle: false,
})
</script>

<template>
  <div v-if="circle" class="skeleton rounded-full" :class="height" />
  <div v-else class="space-y-2">
    <div
      v-for="i in lines"
      :key="i"
      class="skeleton"
      :class="[height, i === lines && lines > 1 ? 'w-3/4' : 'w-full']"
    />
  </div>
</template>
