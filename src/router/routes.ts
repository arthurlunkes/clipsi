import type { Component } from 'vue'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Heart,
  FileText,
  DollarSign,
  BarChart3,
  Clock,
  Settings,
} from 'lucide-vue-next'

/**
 * Fonte única de verdade para os caminhos da aplicação.
 * Use estas constantes em vez de strings soltas em routers, links e guards.
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PACIENTES: '/pacientes',
  PACIENTE_NOVO: '/pacientes/novo',
  PACIENTE_PERFIL: '/pacientes/:id',
  PACIENTE_EDITAR: '/pacientes/:id/editar',
  AGENDA: '/agenda',
  ACOLHIMENTO: '/acolhimento',
  PRONTUARIOS: '/prontuarios',
  FINANCEIRO: '/financeiro',
  RELATORIOS: '/relatorios',
  FILA_ESPERA: '/fila-espera',
  CONFIGURACOES: '/configuracoes',
} as const

export interface NavItem {
  label: string
  icon: Component
  to: string
}

/** Itens do menu lateral (desktop). */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.DASHBOARD },
  { label: 'Pacientes', icon: Users, to: ROUTES.PACIENTES },
  { label: 'Agenda', icon: Calendar, to: ROUTES.AGENDA },
  { label: 'Acolhimento', icon: Heart, to: ROUTES.ACOLHIMENTO },
  { label: 'Prontuários', icon: FileText, to: ROUTES.PRONTUARIOS },
  { label: 'Financeiro', icon: DollarSign, to: ROUTES.FINANCEIRO },
  { label: 'Relatórios', icon: BarChart3, to: ROUTES.RELATORIOS },
  { label: 'Fila de Espera', icon: Clock, to: ROUTES.FILA_ESPERA },
]

/** Atalho de Configurações (rodapé do menu lateral). */
export const CONFIG_NAV_ITEM: NavItem = {
  label: 'Configurações',
  icon: Settings,
  to: ROUTES.CONFIGURACOES,
}

/** Itens da navegação inferior (mobile). */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Início', icon: LayoutDashboard, to: ROUTES.DASHBOARD },
  { label: 'Pacientes', icon: Users, to: ROUTES.PACIENTES },
  { label: 'Agenda', icon: Calendar, to: ROUTES.AGENDA },
  { label: 'Fila', icon: Clock, to: ROUTES.FILA_ESPERA },
  { label: 'Finanças', icon: DollarSign, to: ROUTES.FINANCEIRO },
]

/** Títulos exibidos no cabeçalho por caminho. */
export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PACIENTES]: 'Pacientes',
  [ROUTES.PACIENTE_NOVO]: 'Novo Paciente',
  [ROUTES.AGENDA]: 'Agenda',
  [ROUTES.ACOLHIMENTO]: 'Acolhimento',
  [ROUTES.PRONTUARIOS]: 'Prontuários',
  [ROUTES.FINANCEIRO]: 'Financeiro',
  [ROUTES.RELATORIOS]: 'Relatórios',
  [ROUTES.FILA_ESPERA]: 'Fila de Espera',
  [ROUTES.CONFIGURACOES]: 'Configurações',
}

export const APP_NAME = 'CliPSI'
