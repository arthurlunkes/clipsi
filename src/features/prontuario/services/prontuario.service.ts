import { db } from '@/infrastructure/database/db'
import type { Prontuario, ProntuarioFormData } from '../types'
import { format } from 'date-fns'

export const prontuarioService = {
  async getAll(): Promise<Prontuario[]> {
    return db.prontuarios.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: number): Promise<Prontuario | undefined> {
    return db.prontuarios.get(id)
  },

  async getByPaciente(pacienteId: number): Promise<Prontuario[]> {
    return db.prontuarios.where('pacienteId').equals(pacienteId).reverse().sortBy('createdAt')
  },

  async create(data: ProntuarioFormData): Promise<number> {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    return db.prontuarios.add({ ...data, createdAt: now, updatedAt: now })
  },

  async update(id: number, data: Partial<ProntuarioFormData> & { resumoIA?: string }): Promise<void> {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    await db.prontuarios.update(id, { ...data, updatedAt: now })
  },

  async remove(id: number): Promise<void> {
    await db.prontuarios.delete(id)
  },
}
