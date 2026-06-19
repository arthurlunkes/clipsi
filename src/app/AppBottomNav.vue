<script setup lang="ts">
import { useRoute } from 'vue-router'
import { LayoutDashboard, Users, Calendar, Clock, DollarSign } from 'lucide-vue-next'

const route = useRoute()

const items = [
  { label: 'Início', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Pacientes', icon: Users, to: '/pacientes' },
  { label: 'Agenda', icon: Calendar, to: '/agenda' },
  { label: 'Fila', icon: Clock, to: '/fila-espera' },
  { label: 'Finanças', icon: DollarSign, to: '/financeiro' },
]

const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')
</script>

<template>
  <nav
    class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-20 safe-area-pb"
    aria-label="Navegação móvel"
  >
    <div class="flex items-stretch">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 text-xs font-medium transition-colors min-h-[60px]"
        :class="isActive(item.to) ? 'text-[#7C5CFC]' : 'text-[#94A3B8]'"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <component
          :is="item.icon"
          :size="20"
          :class="isActive(item.to) ? 'text-[#7C5CFC]' : 'text-[#94A3B8]'"
        />
        <span>{{ item.label }}</span>
        <span v-if="isActive(item.to)" class="absolute bottom-0 w-8 h-0.5 bg-[#7C5CFC] rounded-t-full" aria-hidden="true" />
      </RouterLink>
    </div>
  </nav>
</template>
