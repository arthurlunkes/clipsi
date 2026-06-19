import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: () => import('@/features/dashboard/pages/DashboardPage.vue') },
    { path: '/pacientes', component: () => import('@/features/pacientes/pages/PacientesPage.vue') },
    { path: '/pacientes/novo', component: () => import('@/features/pacientes/pages/PacienteFormPage.vue') },
    { path: '/pacientes/:id', component: () => import('@/features/pacientes/pages/PacientePerfilPage.vue') },
    { path: '/pacientes/:id/editar', component: () => import('@/features/pacientes/pages/PacienteFormPage.vue') },
    { path: '/agenda', component: () => import('@/features/agenda/pages/AgendaPage.vue') },
    { path: '/acolhimento', component: () => import('@/features/acolhimento/pages/AcolhimentoPage.vue') },
    { path: '/prontuarios', component: () => import('@/features/prontuario/pages/ProntuariosPage.vue') },
    { path: '/financeiro', component: () => import('@/features/financeiro/pages/FinanceiroPage.vue') },
    { path: '/relatorios', component: () => import('@/features/relatorios/pages/RelatoriosPage.vue') },
    { path: '/fila-espera', component: () => import('@/features/fila-espera/pages/FilaEsperaPage.vue') },
    { path: '/configuracoes', component: () => import('@/features/configuracoes/pages/ConfiguracoesPage.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
