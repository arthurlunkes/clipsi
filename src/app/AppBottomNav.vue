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
    class="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/60 z-20 safe-area-pb shadow-[0_-8px_30px_-12px_rgba(16,24,40,0.15)]"
    aria-label="Navegação móvel"
  >
    <div class="flex items-stretch">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 text-xs font-medium transition-colors min-h-[60px] group"
        :class="isActive(item.to) ? 'text-[#7C5CFC]' : 'text-[#94A3B8]'"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <span
          class="flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200"
          :class="isActive(item.to) ? 'gradient-primary-soft' : 'group-active:bg-[#F1F5F9]'"
        >
          <component
            :is="item.icon"
            :size="20"
            class="transition-transform duration-200"
            :class="isActive(item.to) ? 'text-[#7C5CFC] scale-110' : 'text-[#94A3B8]'"
          />
        </span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
