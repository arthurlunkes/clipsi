export type LancamentoTipo = 'receita' | 'despesa'
export type LancamentoStatus = 'pago' | 'pendente' | 'cancelado'

export interface Lancamento {
  id?: number
  tipo: LancamentoTipo
  descricao: string
  valor: number
  data: string
  status: LancamentoStatus
  categoria: string
  pacienteId?: number
  pacienteNome?: string
  observacoes?: string
  createdAt: string
  updatedAt: string
}

export interface LancamentoFormData {
  tipo: LancamentoTipo
  descricao: string
  valor: number
  data: string
  status: LancamentoStatus
  categoria: string
  pacienteId?: number
  observacoes?: string
}
