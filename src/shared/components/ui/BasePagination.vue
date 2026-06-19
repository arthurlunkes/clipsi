<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:currentPage': [page: number] }>()

const pages = computed(() => {
  const range: (number | '...')[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  range.push(1)
  if (current > 3) range.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) range.push(i)
  if (current < total - 2) range.push('...')
  range.push(total)

  return range
})

const from = computed(() => props.itemsPerPage ? (props.currentPage - 1) * props.itemsPerPage + 1 : undefined)
const to = computed(() => props.itemsPerPage && props.totalItems ? Math.min(props.currentPage * props.itemsPerPage, props.totalItems) : undefined)
</script>

<template>
  <div class="flex items-center justify-between gap-4" role="navigation" aria-label="Paginação">
    <p v-if="totalItems && from && to" class="text-sm text-[#64748B]">
      Exibindo <span class="font-medium text-[#1E293B]">{{ from }}</span> a <span class="font-medium text-[#1E293B]">{{ to }}</span> de <span class="font-medium text-[#1E293B]">{{ totalItems }}</span>
    </p>

    <div class="flex items-center gap-1">
      <button
        @click="emit('update:currentPage', currentPage - 1)"
        :disabled="currentPage <= 1"
        class="p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Página anterior"
      >
        <ChevronLeft :size="16" />
      </button>

      <template v-for="(page, i) in pages" :key="i">
        <span v-if="page === '...'" class="px-2 text-[#94A3B8]">…</span>
        <button
          v-else
          @click="emit('update:currentPage', page)"
          class="min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors"
          :class="page === currentPage ? 'bg-[#7C5CFC] text-white' : 'text-[#64748B] hover:bg-[#F1F5F9]'"
          :aria-current="page === currentPage ? 'page' : undefined"
          :aria-label="`Página ${page}`"
        >
          {{ page }}
        </button>
      </template>

      <button
        @click="emit('update:currentPage', currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Próxima página"
      >
        <ChevronRight :size="16" />
      </button>
    </div>
  </div>
</template>
