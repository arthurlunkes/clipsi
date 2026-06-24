import Dexie, { type Table } from 'dexie'
import type { Paciente } from '@/features/pacientes/types'
import type { Consulta } from '@/features/agenda/types'
import type { Acolhimento } from '@/features/acolhimento/types'
import type { Prontuario } from '@/features/prontuario/types'
import type { Lancamento } from '@/features/financeiro/types'
import type { FilaEspera } from '@/features/fila-espera/types'

export class ClinicaDB extends Dexie {
  pacientes!: Table<Paciente>
  consultas!: Table<Consulta>
  acolhimentos!: Table<Acolhimento>
  prontuarios!: Table<Prontuario>
  financeiro!: Table<Lancamento>
  filaEspera!: Table<FilaEspera>

  constructor() {
    super('ClinicaPsiDB')
    this.version(1).stores({
      pacientes: '++id, nome, cpf, email, telefone, createdAt',
      consultas: '++id, pacienteId, data, status, createdAt',
      acolhimentos: '++id, pacienteId, createdAt',
      prontuarios: '++id, pacienteId, createdAt',
      financeiro: '++id, tipo, data, createdAt',
      filaEspera: '++id, pacienteId, status, createdAt',
    })
    this.version(2).stores({
      pacientes: '++id, nome, cpf, email, telefone, ativo, createdAt',
    })
  }
}

export const db = new ClinicaDB()
