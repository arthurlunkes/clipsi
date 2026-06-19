export interface Paciente {
  id?: number
  nome: string
  cpf: string
  dataNascimento: string
  telefone: string
  email: string
  endereco?: string
  observacoes?: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface PacienteFormData {
  nome: string
  cpf: string
  dataNascimento: string
  telefone: string
  email: string
  endereco?: string
  observacoes?: string
}
