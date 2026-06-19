export type FilaStatus = 'aguardando' | 'em_atendimento' | 'finalizado' | 'ausente'

export interface FilaEspera {
  id?: number
  pacienteId: number
  pacienteNome?: string
  status: FilaStatus
  horaChegada: string
  horaInicio?: string
  horaFim?: string
  prioridade: number
  observacoes?: string
  createdAt: string
  updatedAt: string
}

export interface FilaEsperaFormData {
  pacienteId: number
  prioridade?: number
  observacoes?: string
}
