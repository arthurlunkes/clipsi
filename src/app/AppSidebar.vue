<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard, Users, Calendar, Heart, FileText,
  DollarSign, BarChart3, Clock, Settings, BrainCircuit, X
} from 'lucide-vue-next'

interface Props {
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()
const route = useRoute()

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Pacientes', icon: Users, to: '/pacientes' },
  { label: 'Agenda', icon: Calendar, to: '/agenda' },
  { label: 'Acolhimento', icon: Heart, to: '/acolhimento' },
  { label: 'Prontuários', icon: FileText, to: '/prontuarios' },
  { label: 'Financeiro', icon: DollarSign, to: '/financeiro' },
  { label: 'Relatórios', icon: BarChart3, to: '/relatorios' },
  { label: 'Fila de Espera', icon: Clock, to: '/fila-espera' },
]

const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')
</script>

<template>
  <!-- Overlay mobile -->
  <div
    v-if="open"
    class="fixed inset-0 bg-black/40 z-30 lg:hidden"
    @click="emit('close')"
    aria-hidden="true"
  />

  <!-- Sidebar -->
  <aside
    class="fixed top-0 left-0 h-full w-64 bg-white border-r border-[#E2E8F0] z-40 flex flex-col transition-transform duration-300 ease-out"
    :class="open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    role="navigation"
    aria-label="Menu principal"
  >
    <!-- Logo -->
    <div class="flex items-center justify-between h-16 px-5 border-b border-[#E2E8F0] flex-shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 bg-[#7C5CFC] rounded-lg flex items-center justify-center flex-shrink-0">
          <BrainCircuit :size="18" class="text-white" />
        </div>
        <div>
          <p class="text-sm font-bold text-[#1E293B] leading-tight">Clínica Psi</p>
          <p class="text-xs text-[#64748B]">Gestão Psicológica</p>
        </div>
      </div>
      <button
        @click="emit('close')"
        class="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
        aria-label="Fechar menu"
      >
        <X :size="18" />
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto p-3 space-y-0.5">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group"
        :class="isActive(item.to)
          ? 'bg-[#EDE9FE] text-[#7C5CFC]'
          : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'"
        @click="emit('close')"
      >
        <component
          :is="item.icon"
          :size="18"
          :class="isActive(item.to) ? 'text-[#7C5CFC]' : 'text-[#94A3B8] group-hover:text-[#64748B]'"
        />
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="p-3 border-t border-[#E2E8F0] flex-shrink-0">
      <RouterLink
        to="/configuracoes"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
        :class="route.path === '/configuracoes' ? 'bg-[#EDE9FE] text-[#7C5CFC]' : ''"
        @click="emit('close')"
      >
        <Settings :size="18" />
        Configurações
      </RouterLink>
    </div>
  </aside>
</template>
