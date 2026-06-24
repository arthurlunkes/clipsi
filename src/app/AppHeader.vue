<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, Bell, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-vue-next'
import { useLayout } from '@/shared/composables/useLayout'
import { useTheme } from '@/shared/composables/useTheme'
import { PAGE_TITLES, ROUTES, APP_NAME } from '@/router/routes'

const emit = defineEmits<{ toggleSidebar: [] }>()
const route = useRoute()

const { isResizing, collapsed, toggleCollapsed } = useLayout()
const { isDark, toggleTheme } = useTheme()

const pageTitle = computed(() => {
  const exact = PAGE_TITLES[route.path]
  if (exact) return exact

  if (route.path.startsWith(ROUTES.PACIENTES + '/') && route.params.id) return 'Perfil do Paciente'

  return APP_NAME
})
</script>

<template>
  <header
    class="fixed top-0 right-0 left-0 lg:left-(--sidebar-w) h-16 glass border-b border-white/60 z-20 flex items-center justify-between px-4 lg:px-6"
    :class="isResizing ? '' : 'transition-[left] duration-300 ease-out'"
  >
    <div class="flex items-center gap-3">
      <button
        @click="emit('toggleSidebar')"
        class="lg:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
        aria-label="Abrir menu"
      >
        <Menu :size="20" />
      </button>
      <button
        @click="toggleCollapsed"
        class="hidden lg:inline-flex p-2 rounded-xl text-[#64748B] hover:bg-white/70 hover:text-[#7C5CFC] transition-colors"
        :aria-label="collapsed ? 'Expandir menu' : 'Recolher menu'"
        :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
      >
        <PanelLeftOpen v-if="collapsed" :size="20" />
        <PanelLeftClose v-else :size="20" />
      </button>
      <h1 class="text-lg font-bold text-[#1E293B] font-display">{{ pageTitle }}</h1>
    </div>

    <div class="flex items-center gap-2">
      <button
        @click="toggleTheme"
        class="relative p-2 rounded-xl text-[#64748B] hover:bg-white/70 hover:text-[#7C5CFC] transition-colors"
        :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
        :title="isDark ? 'Tema claro' : 'Tema escuro'"
      >
        <Sun v-if="isDark" :size="20" />
        <Moon v-else :size="20" />
      </button>

      <button
        class="relative p-2 rounded-xl text-[#64748B] hover:bg-white/70 hover:text-[#7C5CFC] transition-colors"
        aria-label="Notificações"
      >
        <Bell :size="20" />
        <span
          class="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white animate-pulse"
          aria-hidden="true"
        />
      </button>

      <div class="flex items-center gap-2.5 pl-2.5 border-l border-[#E7E9F2]">
        <div
          class="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-primary ring-2 ring-white"
          aria-hidden="true"
        >
          PS
        </div>
        <div class="hidden sm:block">
          <p class="text-sm font-semibold text-[#1E293B] leading-tight">Dra. Paula Silva</p>
          <p class="text-xs text-[#64748B]">Psicóloga CRP 06/12345</p>
        </div>
      </div>
    </div>
  </header>
</template>
