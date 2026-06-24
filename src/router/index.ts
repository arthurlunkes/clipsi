import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: ROUTES.HOME, redirect: ROUTES.DASHBOARD },
    {
      path: ROUTES.DASHBOARD,
      component: () => import('@/features/dashboard/pages/DashboardPage.vue'),
    },
    {
      path: ROUTES.PACIENTES,
      component: () => import('@/features/pacientes/pages/PacientesPage.vue'),
    },
    {
      path: ROUTES.PACIENTE_NOVO,
      component: () => import('@/features/pacientes/pages/PacienteFormPage.vue'),
    },
    {
      path: ROUTES.PACIENTE_PERFIL,
      component: () => import('@/features/pacientes/pages/PacientePerfilPage.vue'),
    },
    {
      path: ROUTES.PACIENTE_EDITAR,
      component: () => import('@/features/pacientes/pages/PacienteFormPage.vue'),
    },
    { path: ROUTES.AGENDA, component: () => import('@/features/agenda/pages/AgendaPage.vue') },
    {
      path: ROUTES.ACOLHIMENTO,
      component: () => import('@/features/acolhimento/pages/AcolhimentoPage.vue'),
    },
    {
      path: ROUTES.PRONTUARIOS,
      component: () => import('@/features/prontuario/pages/ProntuariosPage.vue'),
    },
    {
      path: ROUTES.FINANCEIRO,
      component: () => import('@/features/financeiro/pages/FinanceiroPage.vue'),
    },
    {
      path: ROUTES.RELATORIOS,
      component: () => import('@/features/relatorios/pages/RelatoriosPage.vue'),
    },
    {
      path: ROUTES.FILA_ESPERA,
      component: () => import('@/features/fila-espera/pages/FilaEsperaPage.vue'),
    },
    {
      path: ROUTES.CONFIGURACOES,
      component: () => import('@/features/configuracoes/pages/ConfiguracoesPage.vue'),
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
