<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { consultaService } from '@/features/agenda/services/consulta.service'
import { financeiroService } from '@/features/financeiro/services/financeiro.service'
import { pacienteService } from '@/features/pacientes/services/paciente.service'
import BaseCard from '@/shared/components/ui/BaseCard.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import SkeletonLoader from '@/shared/components/ui/SkeletonLoader.vue'
import { Download, BarChart3 } from 'lucide-vue-next'
import { format, subMonths, getYear, getMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import jsPDF from 'jspdf'

const loading = ref(true)
const chartLabels = ref<string[]>([])
const atendimentos = ref<number[]>([])
const receitas = ref<number[]>([])
const despesas = ref<number[]>([])
const totalPacientes = ref(0)
const totalConsultas = ref(0)

const atendimentosOptions = computed(() => ({
  chart: { type: 'bar', height: 280, toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
  colors: ['#7C5CFC'],
  xaxis: { categories: chartLabels.value, labels: { style: { colors: '#64748B', fontSize: '11px' } } },
  yaxis: { labels: { style: { colors: '#64748B', fontSize: '11px' } } },
  grid: { borderColor: '#F1F5F9', strokeDashArray: 4 },
  dataLabels: { enabled: false },
  tooltip: { theme: 'light' },
}))

const financeiroOptions = computed(() => ({
  chart: { type: 'line', height: 280, toolbar: { show: false } },
  stroke: { curve: 'smooth', width: [2, 2] },
  colors: ['#22C55E', '#EF4444'],
  legend: { position: 'top', fontSize: '12px' },
  xaxis: { categories: chartLabels.value, labels: { style: { colors: '#64748B', fontSize: '11px' } } },
  yaxis: { labels: { style: { colors: '#64748B', fontSize: '11px' }, formatter: (v: number) => `R$ ${v}` } },
  grid: { borderColor: '#F1F5F9', strokeDashArray: 4 },
  dataLabels: { enabled: false },
  tooltip: { y: { formatter: (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` } },
}))

const statusOptions = computed(() => ({
  chart: { type: 'donut', height: 280 },
  labels: ['Realizadas', 'Agendadas', 'Canceladas', 'Faltas'],
  colors: ['#7C5CFC', '#22C55E', '#EF4444', '#F59E0B'],
  legend: { position: 'bottom', fontSize: '12px' },
  dataLabels: { style: { fontSize: '12px' } },
  plotOptions: { pie: { donut: { size: '65%' } } },
  tooltip: { theme: 'light' },
}))

const statusData = ref([0, 0, 0, 0])

async function load() {
  loading.value = true
  const now = new Date()
  const labels: string[] = []
  const atds: number[] = []
  const recs: number[] = []
  const desps: number[] = []

  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i)
    const a = getYear(d)
    const m = getMonth(d) + 1
    labels.push(format(d, 'MMM/yy', { locale: ptBR }))
    const consultas = await consultaService.getByMes(a, m)
    atds.push(consultas.filter(c => c.status === 'realizada').length)
    recs.push(await financeiroService.getReceitaMensal(a, m))
    desps.push(await financeiroService.getDespesaMensal(a, m))
  }

  const allConsultas = await consultaService.getAll()
  statusData.value = [
    allConsultas.filter(c => c.status === 'realizada').length,
    allConsultas.filter(c => c.status === 'agendada' || c.status === 'confirmada').length,
    allConsultas.filter(c => c.status === 'cancelada').length,
    allConsultas.filter(c => c.status === 'falta').length,
  ]

  chartLabels.value = labels
  atendimentos.value = atds
  receitas.value = recs
  despesas.value = desps
  totalPacientes.value = await pacienteService.countAtivos()
  totalConsultas.value = allConsultas.length
  loading.value = false
}

async function exportPDF() {
  const doc = new jsPDF()
  const now = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })

  doc.setFontSize(20)
  doc.setTextColor(124, 92, 252)
  doc.text('Clínica Psi — Relatório Gerencial', 20, 25)

  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Gerado em ${now}`, 20, 33)

  doc.setDrawColor(226, 232, 240)
  doc.line(20, 37, 190, 37)

  doc.setFontSize(14)
  doc.setTextColor(30, 41, 59)
  doc.text('Resumo Geral', 20, 48)

  doc.setFontSize(11)
  doc.setTextColor(71, 85, 105)
  doc.text(`Pacientes ativos: ${totalPacientes.value}`, 20, 58)
  doc.text(`Total de consultas: ${totalConsultas.value}`, 20, 65)
  doc.text(`Consultas realizadas: ${statusData.value[0]}`, 20, 72)
  doc.text(`Receita total (6 meses): R$ ${receitas.value.reduce((a, b) => a + b, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 79)
  doc.text(`Despesas totais (6 meses): R$ ${despesas.value.reduce((a, b) => a + b, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 86)

  doc.setFontSize(14)
  doc.setTextColor(30, 41, 59)
  doc.text('Atendimentos por mês', 20, 100)

  chartLabels.value.forEach((label, i) => {
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    doc.text(`${label}: ${atendimentos.value[i]} sessões`, 25, 110 + i * 8)
  })

  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('Clínica Psi — Sistema de Gestão Psicológica', 20, 285)

  doc.save(`relatorio-clinica-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

onMounted(load)
</script>

<template>
  <div class="p-4 lg:p-6 max-w-6xl mx-auto space-y-5">

    <div class="flex items-center justify-between">
      <p class="text-sm text-[#64748B]">Visão analítica dos últimos 6 meses</p>
      <BaseButton variant="outline" @click="exportPDF">
        <Download :size="16" /> Exportar PDF
      </BaseButton>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <BaseCard padding="md" v-for="item in [
        { label: 'Pacientes ativos', value: totalPacientes, color: 'text-[#7C5CFC]' },
        { label: 'Total consultas', value: totalConsultas, color: 'text-[#1D4ED8]' },
        { label: 'Realizadas', value: statusData[0], color: 'text-[#16A34A]' },
        { label: 'Cancelamentos', value: statusData[2], color: 'text-[#DC2626]' },
      ]" :key="item.label">
        <p class="text-2xl font-bold" :class="item.color">
          <span v-if="loading"><SkeletonLoader :lines="1" height="h-8" /></span>
          <span v-else>{{ item.value }}</span>
        </p>
        <p class="text-sm text-[#64748B] mt-1">{{ item.label }}</p>
      </BaseCard>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard padding="md">
        <h2 class="text-base font-semibold text-[#1E293B] mb-4">Atendimentos realizados</h2>
        <div v-if="loading" class="h-64"><SkeletonLoader :lines="1" height="h-64" /></div>
        <apexchart v-else type="bar" height="280" :options="atendimentosOptions" :series="[{ name: 'Atendimentos', data: atendimentos }]" />
      </BaseCard>

      <BaseCard padding="md">
        <h2 class="text-base font-semibold text-[#1E293B] mb-4">Status das consultas</h2>
        <div v-if="loading" class="h-64"><SkeletonLoader :lines="1" height="h-64" /></div>
        <apexchart v-else type="donut" height="280" :options="statusOptions" :series="statusData" />
      </BaseCard>
    </div>

    <BaseCard padding="md">
      <h2 class="text-base font-semibold text-[#1E293B] mb-4">Evolução financeira</h2>
      <div v-if="loading" class="h-64"><SkeletonLoader :lines="1" height="h-64" /></div>
      <apexchart
        v-else
        type="line"
        height="280"
        :options="financeiroOptions"
        :series="[{ name: 'Receitas', data: receitas }, { name: 'Despesas', data: despesas }]"
      />
    </BaseCard>

  </div>
</template>
