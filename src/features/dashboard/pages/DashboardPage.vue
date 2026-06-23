<script setup lang="ts">
import { computed } from 'vue'
import { useDashboard } from '../composables/useDashboard'
import BaseCard from '@/shared/components/ui/BaseCard.vue'
import BaseBadge from '@/shared/components/ui/BaseBadge.vue'
import SkeletonLoader from '@/shared/components/ui/SkeletonLoader.vue'
import { Users, Calendar, DollarSign, Clock, TrendingUp, ArrowRight } from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const {
  loading, stats, proximasConsultas, pacientesRecentes,
  chartAtendimentos, chartLabels, chartReceitas, chartDespesas
} = useDashboard()

const atendimentosOptions = computed(() => ({
  chart: { type: 'area', height: 200, toolbar: { show: false }, sparkline: { enabled: false }, fontFamily: 'Inter, sans-serif' },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      type: 'vertical',
      colorStops: [
        { offset: 0, color: '#8B5CF6', opacity: 0.45 },
        { offset: 100, color: '#6366F1', opacity: 0.02 },
      ],
    },
  },
  colors: ['#7C5CFC'],
  markers: { size: 0, hover: { size: 5 }, colors: ['#7C5CFC'], strokeColors: '#fff', strokeWidth: 2 },
  xaxis: { categories: chartLabels.value, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#64748B', fontSize: '11px' } } },
  yaxis: { labels: { style: { colors: '#64748B', fontSize: '11px' } } },
  grid: { borderColor: '#F1F5F9', strokeDashArray: 4 },
  tooltip: { theme: 'light' },
  dataLabels: { enabled: false },
}))

const financeiroOptions = computed(() => ({
  chart: { type: 'bar', height: 200, toolbar: { show: false }, stacked: false, fontFamily: 'Inter, sans-serif' },
  plotOptions: { bar: { borderRadius: 6, borderRadiusApplication: 'end', columnWidth: '55%' } },
  fill: {
    type: 'gradient',
    gradient: { type: 'vertical', shadeIntensity: 0.25, gradientToColors: ['#16A34A', '#DC2626'], opacityFrom: 1, opacityTo: 0.85, stops: [0, 100] },
  },
  colors: ['#22C55E', '#EF4444'],
  legend: { position: 'top', horizontalAlign: 'left', fontSize: '12px', markers: { radius: 12 } },
  xaxis: { categories: chartLabels.value, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#64748B', fontSize: '11px' } } },
  yaxis: { labels: { style: { colors: '#64748B', fontSize: '11px' }, formatter: (v: number) => `R$ ${v}` } },
  grid: { borderColor: '#F1F5F9', strokeDashArray: 4 },
  dataLabels: { enabled: false },
  tooltip: { y: { formatter: (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` } },
}))

const statusMap: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' | 'neutral' }> = {
  agendada: { label: 'Agendada', variant: 'neutral' },
  confirmada: { label: 'Confirmada', variant: 'success' },
  realizada: { label: 'Realizada', variant: 'info' },
  cancelada: { label: 'Cancelada', variant: 'danger' },
  falta: { label: 'Falta', variant: 'warning' },
}

function formatDate(d: string) {
  try { return format(parseISO(d), "dd 'de' MMM", { locale: ptBR }) } catch { return d }
}
function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<template>
  <div class="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">

    <!-- Stats Cards -->
    <section aria-label="Indicadores principais">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <BaseCard v-if="loading" v-for="i in 4" :key="i" padding="md">
          <SkeletonLoader :lines="3" height="h-4" />
        </BaseCard>

        <template v-else>
          <BaseCard padding="md" class="group animate-rise relative overflow-hidden">
            <div class="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#7C5CFC]/5 group-hover:bg-[#7C5CFC]/10 transition-colors" aria-hidden="true" />
            <div class="flex items-start justify-between mb-3 relative">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center shadow-[0_8px_18px_-6px_rgba(124,92,252,0.6)] group-hover:scale-105 transition-transform">
                <Users :size="20" class="text-white" />
              </div>
              <BaseBadge variant="primary" size="sm">+2 mês</BaseBadge>
            </div>
            <p class="text-3xl font-bold text-[#1E293B] tracking-tight relative">{{ stats.pacientesAtivos }}</p>
            <p class="text-sm text-[#64748B] mt-0.5 relative">Pacientes ativos</p>
          </BaseCard>

          <BaseCard padding="md" class="group animate-rise relative overflow-hidden" style="animation-delay: 60ms">
            <div class="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#3B82F6]/5 group-hover:bg-[#3B82F6]/10 transition-colors" aria-hidden="true" />
            <div class="flex items-start justify-between mb-3 relative">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-[0_8px_18px_-6px_rgba(59,130,246,0.6)] group-hover:scale-105 transition-transform">
                <Calendar :size="20" class="text-white" />
              </div>
            </div>
            <p class="text-3xl font-bold text-[#1E293B] tracking-tight relative">{{ stats.consultasHoje }}</p>
            <p class="text-sm text-[#64748B] mt-0.5 relative">Consultas hoje</p>
          </BaseCard>

          <BaseCard padding="md" class="group animate-rise relative overflow-hidden" style="animation-delay: 120ms">
            <div class="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#22C55E]/5 group-hover:bg-[#22C55E]/10 transition-colors" aria-hidden="true" />
            <div class="flex items-start justify-between mb-3 relative">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shadow-[0_8px_18px_-6px_rgba(34,197,94,0.6)] group-hover:scale-105 transition-transform">
                <DollarSign :size="20" class="text-white" />
              </div>
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
                <TrendingUp :size="14" /> +12%
              </span>
            </div>
            <p class="text-3xl font-bold text-[#1E293B] tracking-tight relative">{{ formatMoney(stats.receitaMes) }}</p>
            <p class="text-sm text-[#64748B] mt-0.5 relative">Receita do mês</p>
          </BaseCard>

          <BaseCard padding="md" class="group animate-rise relative overflow-hidden" style="animation-delay: 180ms">
            <div class="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#F59E0B]/5 group-hover:bg-[#F59E0B]/10 transition-colors" aria-hidden="true" />
            <div class="flex items-start justify-between mb-3 relative">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-[0_8px_18px_-6px_rgba(245,158,11,0.6)] group-hover:scale-105 transition-transform">
                <Clock :size="20" class="text-white" />
              </div>
              <BaseBadge variant="warning" dot>Ao vivo</BaseBadge>
            </div>
            <p class="text-3xl font-bold text-[#1E293B] tracking-tight relative">{{ stats.emEspera }}</p>
            <p class="text-sm text-[#64748B] mt-0.5 relative">Em espera</p>
          </BaseCard>
        </template>
      </div>
    </section>

    <!-- Charts -->
    <section aria-label="Gráficos">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BaseCard padding="md">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-semibold text-[#1E293B]">Atendimentos</h2>
              <p class="text-xs text-[#64748B]">Últimos 6 meses</p>
            </div>
          </div>
          <div v-if="loading" class="h-48"><SkeletonLoader :lines="1" height="h-48" /></div>
          <apexchart
            v-else
            type="area"
            height="200"
            :options="atendimentosOptions"
            :series="[{ name: 'Atendimentos', data: chartAtendimentos }]"
          />
        </BaseCard>

        <BaseCard padding="md">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-semibold text-[#1E293B]">Financeiro</h2>
              <p class="text-xs text-[#64748B]">Receitas vs Despesas</p>
            </div>
          </div>
          <div v-if="loading" class="h-48"><SkeletonLoader :lines="1" height="h-48" /></div>
          <apexchart
            v-else
            type="bar"
            height="200"
            :options="financeiroOptions"
            :series="[{ name: 'Receitas', data: chartReceitas }, { name: 'Despesas', data: chartDespesas }]"
          />
        </BaseCard>
      </div>
    </section>

    <!-- Bottom Lists -->
    <section aria-label="Listas">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Próximas consultas -->
        <BaseCard padding="none">
          <div class="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
            <h2 class="text-base font-semibold text-[#1E293B]">Próximas consultas</h2>
            <RouterLink to="/agenda" class="text-sm text-[#7C5CFC] hover:underline flex items-center gap-1">
              Ver agenda <ArrowRight :size="14" />
            </RouterLink>
          </div>

          <div v-if="loading" class="p-6 space-y-3">
            <SkeletonLoader v-for="i in 3" :key="i" :lines="2" height="h-4" />
          </div>

          <div v-else-if="proximasConsultas.length === 0" class="px-6 py-8 text-center">
            <p class="text-sm text-[#64748B]">Nenhuma consulta agendada</p>
          </div>

          <ul v-else class="divide-y divide-[#F8FAFC]">
            <li
              v-for="c in proximasConsultas"
              :key="c.id"
              class="flex items-center gap-3 px-6 py-3 hover:bg-[#F8FAFC] transition-colors"
            >
              <div class="w-9 h-9 rounded-xl bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-bold text-[#7C5CFC]">
                  {{ c.pacienteNome?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-[#1E293B] truncate">{{ c.pacienteNome }}</p>
                <p class="text-xs text-[#64748B]">{{ formatDate(c.data) }} · {{ c.horaInicio }}</p>
              </div>
              <BaseBadge :variant="statusMap[c.status]?.variant ?? 'neutral'" size="sm">
                {{ statusMap[c.status]?.label }}
              </BaseBadge>
            </li>
          </ul>
        </BaseCard>

        <!-- Pacientes recentes -->
        <BaseCard padding="none">
          <div class="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
            <h2 class="text-base font-semibold text-[#1E293B]">Pacientes recentes</h2>
            <RouterLink to="/pacientes" class="text-sm text-[#7C5CFC] hover:underline flex items-center gap-1">
              Ver todos <ArrowRight :size="14" />
            </RouterLink>
          </div>

          <div v-if="loading" class="p-6 space-y-3">
            <SkeletonLoader v-for="i in 3" :key="i" :lines="2" height="h-4" />
          </div>

          <ul v-else class="divide-y divide-[#F8FAFC]">
            <li
              v-for="p in pacientesRecentes"
              :key="p.id"
              class="flex items-center gap-3 px-6 py-3 hover:bg-[#F8FAFC] transition-colors"
            >
              <RouterLink :to="`/pacientes/${p.id}`" class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#A78BFA] flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-bold text-white">
                    {{ p.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('') }}
                  </span>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-[#1E293B] truncate">{{ p.nome }}</p>
                  <p class="text-xs text-[#64748B] truncate">{{ p.email }}</p>
                </div>
              </RouterLink>
              <BaseBadge :variant="p.ativo ? 'success' : 'neutral'" dot size="sm">
                {{ p.ativo ? 'Ativo' : 'Inativo' }}
              </BaseBadge>
            </li>
          </ul>
        </BaseCard>

      </div>
    </section>

  </div>
</template>
