<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, Bell } from 'lucide-vue-next'

const emit = defineEmits<{ toggleSidebar: [] }>()
const route = useRoute()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/pacientes': 'Pacientes',
    '/pacientes/novo': 'Novo Paciente',
    '/agenda': 'Agenda',
    '/acolhimento': 'Acolhimento',
    '/prontuarios': 'Prontuários',
    '/financeiro': 'Financeiro',
    '/relatorios': 'Relatórios',
    '/fila-espera': 'Fila de Espera',
    '/configuracoes': 'Configurações',
  }

  const exact = titles[route.path]
  if (exact) return exact

  if (route.path.startsWith('/pacientes/') && route.params.id) return 'Perfil do Paciente'

  return 'Clínica Psi'
})
</script>

<template>
  <header class="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-[#E2E8F0] z-20 flex items-center justify-between px-4 lg:px-6">
    <div class="flex items-center gap-3">
      <button
        @click="emit('toggleSidebar')"
        class="lg:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
        aria-label="Abrir menu"
      >
        <Menu :size="20" />
      </button>
      <h1 class="text-lg font-semibold text-[#1E293B]">{{ pageTitle }}</h1>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="relative p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
        aria-label="Notificações"
      >
        <Bell :size="20" />
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" aria-hidden="true" />
      </button>

      <div class="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
        <div class="w-8 h-8 rounded-full bg-[#7C5CFC] flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
          PS
        </div>
        <div class="hidden sm:block">
          <p class="text-sm font-medium text-[#1E293B] leading-tight">Dra. Paula Silva</p>
          <p class="text-xs text-[#64748B]">Psicóloga CRP 06/12345</p>
        </div>
      </div>
    </div>
  </header>
</template>
