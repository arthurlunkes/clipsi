export type ConsultaStatus = 'agendada' | 'confirmada' | 'realizada' | 'cancelada' | 'falta'

export interface Consulta {
  id?: number
  pacienteId: number
  pacienteNome?: string
  titulo: string
  data: string
  horaInicio: string
  horaFim: string
  status: ConsultaStatus
  tipo: string
  valor?: number
  observacoes?: string
  createdAt: string
  updatedAt: string
}

export interface ConsultaFormData {
  pacienteId: number
  titulo: string
  data: string
  horaInicio: string
  horaFim: string
  status: ConsultaStatus
  tipo: string
  valor?: number
  observacoes?: string
}
