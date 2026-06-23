<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Nenhum item encontrado',
  description: 'Não há dados para exibir aqui ainda.',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center animate-rise">
    <div class="w-16 h-16 gradient-primary-soft rounded-2xl flex items-center justify-center mb-4 ring-1 ring-[#7C5CFC]/10">
      <slot name="icon">
        <svg class="w-8 h-8 text-[#A78BFA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </slot>
    </div>
    <h3 class="text-base font-semibold text-[#1E293B] mb-1">{{ title }}</h3>
    <p class="text-sm text-[#64748B] max-w-xs">{{ description }}</p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
