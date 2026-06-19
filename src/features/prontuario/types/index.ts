export interface Prontuario {
  id?: number
  pacienteId: number
  pacienteNome?: string
  titulo: string
  conteudo: string
  sessaoNumero?: number
  resumoIA?: string
  createdAt: string
  updatedAt: string
}

export interface ProntuarioFormData {
  pacienteId: number
  titulo: string
  conteudo: string
  sessaoNumero?: number
}
