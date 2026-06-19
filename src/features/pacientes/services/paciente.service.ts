import { db } from '@/infrastructure/database/db'
import type { Paciente, PacienteFormData } from '../types'
import { format } from 'date-fns'

export const pacienteService = {
  async getAll(): Promise<Paciente[]> {
    return db.pacientes.orderBy('nome').toArray()
  },

  async getById(id: number): Promise<Paciente | undefined> {
    return db.pacientes.get(id)
  },

  async search(query: string): Promise<Paciente[]> {
    const lower = query.toLowerCase()
    return db.pacientes
      .filter(p => p.nome.toLowerCase().includes(lower) || p.cpf.includes(query) || p.email.toLowerCase().includes(lower))
      .toArray()
  },

  async create(data: PacienteFormData): Promise<number> {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    return db.pacientes.add({ ...data, ativo: true, createdAt: now, updatedAt: now })
  },

  async update(id: number, data: Partial<PacienteFormData>): Promise<void> {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    await db.pacientes.update(id, { ...data, updatedAt: now })
  },

  async remove(id: number): Promise<void> {
    await db.pacientes.delete(id)
  },

  async countAtivos(): Promise<number> {
    return db.pacientes.where('ativo').equals(1).count()
  },

  async getRecentes(limit = 5): Promise<Paciente[]> {
    return db.pacientes.orderBy('createdAt').reverse().limit(limit).toArray()
  },
}
