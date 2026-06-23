<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard, Users, Calendar, Heart, FileText,
  DollarSign, BarChart3, Clock, Settings, BrainCircuit, X,
  ChevronsLeft,
} from 'lucide-vue-next'
import { useLayout } from '@/shared/composables/useLayout'

const route = useRoute()

const {
  sidebarOpen, sidebarCollapsed, isResizing, isDesktop, collapsed, shellWidth,
  closeSidebar, toggleCollapsed, setSidebarWidth, resetSidebarWidth,
} = useLayout()

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

// ---- redimensionamento por arraste (desktop) ----
function onResize(e: PointerEvent) {
  setSidebarWidth(e.clientX)
}

function stopResize() {
  isResizing.value = false
  window.removeEventListener('pointermove', onResize)
  window.removeEventListener('pointerup', stopResize)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

function startResize(e: PointerEvent) {
  if (!isDesktop.value) return
  e.preventDefault()
  if (sidebarCollapsed.value) sidebarCollapsed.value = false // arrastar expande
  isResizing.value = true
  window.addEventListener('pointermove', onResize)
  window.addEventListener('pointerup', stopResize)
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
}

onBeforeUnmount(stopResize)
</script>

<template>
  <!-- Overlay mobile -->
  <Transition name="overlay">
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
      @click="closeSidebar"
      aria-hidden="true"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    class="fixed top-0 left-0 h-full w-64 glass border-r border-white/60 z-40 flex flex-col shadow-[0_8px_40px_-12px_rgba(16,24,40,0.12)]"
    :class="[
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      isResizing ? 'transition-none' : 'transition-[width,transform] duration-300 ease-out',
    ]"
    :style="isDesktop ? { width: shellWidth + 'px' } : undefined"
    role="navigation"
    aria-label="Menu principal"
  >
    <!-- Logo -->
    <div
      class="flex items-center h-16 px-3.5 border-b border-[#E7E9F2]/70 flex-shrink-0"
      :class="collapsed ? 'justify-center' : 'justify-between'"
    >
      <div class="flex items-center gap-2.5 overflow-hidden">
        <div class="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-primary">
          <BrainCircuit :size="19" class="text-white" />
        </div>
        <div v-if="!collapsed" class="whitespace-nowrap">
          <p class="text-sm font-bold text-[#1E293B] leading-tight font-display">Clínica Psi</p>
          <p class="text-xs text-[#64748B]">Gestão Psicológica</p>
        </div>
      </div>
      <button
        v-if="!collapsed"
        @click="closeSidebar"
        class="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
        aria-label="Fechar menu"
      >
        <X :size="18" />
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :title="collapsed ? item.label : undefined"
        class="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
        :class="[
          collapsed ? 'justify-center' : '',
          isActive(item.to)
            ? 'gradient-primary text-white shadow-primary'
            : 'text-[#64748B] hover:bg-white/70 hover:text-[#1E293B]',
        ]"
        @click="closeSidebar"
      >
        <component
          :is="item.icon"
          :size="18"
          class="flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          :class="isActive(item.to) ? 'text-white' : 'text-[#94A3B8] group-hover:text-[#7C5CFC]'"
        />
        <span v-if="!collapsed" class="whitespace-nowrap">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="p-3 border-t border-[#E7E9F2]/70 flex-shrink-0 space-y-1">
      <RouterLink
        to="/configuracoes"
        :title="collapsed ? 'Configurações' : undefined"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
        :class="[
          collapsed ? 'justify-center' : '',
          route.path === '/configuracoes'
            ? 'gradient-primary text-white shadow-primary'
            : 'text-[#64748B] hover:bg-white/70 hover:text-[#1E293B]',
        ]"
        @click="closeSidebar"
      >
        <Settings
          :size="18"
          class="flex-shrink-0 transition-transform duration-200 group-hover:rotate-45"
          :class="route.path === '/configuracoes' ? 'text-white' : 'text-[#94A3B8] group-hover:text-[#7C5CFC]'"
        />
        <span v-if="!collapsed" class="whitespace-nowrap">Configurações</span>
      </RouterLink>

      <!-- Recolher / expandir (desktop) -->
      <button
        @click="toggleCollapsed"
        :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
        class="hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-white/70 hover:text-[#1E293B] transition-all duration-200 group"
        :class="collapsed ? 'justify-center' : ''"
      >
        <ChevronsLeft
          :size="18"
          class="flex-shrink-0 text-[#94A3B8] group-hover:text-[#7C5CFC] transition-transform duration-300"
          :class="collapsed ? 'rotate-180' : ''"
        />
        <span v-if="!collapsed" class="whitespace-nowrap">Recolher</span>
      </button>
    </div>

    <!-- Handle de redimensionamento (desktop) -->
    <div
      class="hidden lg:block absolute top-0 right-0 h-full w-1.5 cursor-col-resize group/handle"
      @pointerdown="startResize"
      @dblclick="resetSidebarWidth"
      role="separator"
      aria-orientation="vertical"
      aria-label="Redimensionar menu (duplo clique para restaurar)"
      title="Arraste para redimensionar · duplo clique para restaurar"
    >
      <span
        class="absolute inset-y-0 right-0 w-0.5 transition-colors duration-150"
        :class="isResizing ? 'bg-[#7C5CFC]' : 'bg-transparent group-hover/handle:bg-[#C4B5FD]'"
        aria-hidden="true"
      />
    </div>
  </aside>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
