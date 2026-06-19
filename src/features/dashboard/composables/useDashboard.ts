import { ref, onMounted } from 'vue'
import { pacienteService } from '@/features/pacientes/services/paciente.service'
import { consultaService } from '@/features/agenda/services/consulta.service'
import { financeiroService } from '@/features/financeiro/services/financeiro.service'
import { filaService } from '@/features/fila-espera/services/fila.service'
import { format, getMonth, getYear, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useDashboard() {
  const loading = ref(true)

  const stats = ref({
    pacientesAtivos: 0,
    consultasHoje: 0,
    receitaMes: 0,
    emEspera: 0,
  })

  const proximasConsultas = ref<any[]>([])
  const pacientesRecentes = ref<any[]>([])
  const chartAtendimentos = ref<number[]>([])
  const chartLabels = ref<string[]>([])
  const chartReceitas = ref<number[]>([])
  const chartDespesas = ref<number[]>([])

  async function load() {
    loading.value = true
    try {
      const now = new Date()
      const ano = getYear(now)
      const mes = getMonth(now) + 1

      const [ativos, hoje, receita, espera, proximas, recentes] = await Promise.all([
        pacienteService.countAtivos(),
        consultaService.countHoje(),
        financeiroService.getReceitaMensal(ano, mes),
        filaService.countAguardando(),
        consultaService.getProximas(5),
        pacienteService.getRecentes(5),
      ])

      stats.value = { pacientesAtivos: ativos, consultasHoje: hoje, receitaMes: receita, emEspera: espera }
      proximasConsultas.value = proximas
      pacientesRecentes.value = recentes

      const meses: string[] = []
      const atendimentos: number[] = []
      const receitas: number[] = []
      const despesas: number[] = []

      for (let i = 5; i >= 0; i--) {
        const d = subMonths(now, i)
        const a = getYear(d)
        const m = getMonth(d) + 1
        meses.push(format(d, 'MMM', { locale: ptBR }))
        const consultas = await consultaService.getByMes(a, m)
        atendimentos.push(consultas.filter(c => c.status === 'realizada').length)
        receitas.push(await financeiroService.getReceitaMensal(a, m))
        despesas.push(await financeiroService.getDespesaMensal(a, m))
      }

      chartLabels.value = meses
      chartAtendimentos.value = atendimentos
      chartReceitas.value = receitas
      chartDespesas.value = despesas
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return { loading, stats, proximasConsultas, pacientesRecentes, chartAtendimentos, chartLabels, chartReceitas, chartDespesas }
}
