export interface Acolhimento {
  id?: number
  pacienteId: number
  pacienteNome?: string
  queixaPrincipal: string
  historico: string
  encaminhamento?: string
  observacoes?: string
  resumoIA?: string
  createdAt: string
  updatedAt: string
}

export interface AcolhimentoFormData {
  pacienteId: number
  queixaPrincipal: string
  historico: string
  encaminhamento?: string
  observacoes?: string
}
