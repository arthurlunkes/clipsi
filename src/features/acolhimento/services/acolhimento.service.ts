import { db } from '@/infrastructure/database/db'
import type { Acolhimento, AcolhimentoFormData } from '../types'
import { format } from 'date-fns'

export const acolhimentoService = {
  async getAll(): Promise<Acolhimento[]> {
    return db.acolhimentos.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: number): Promise<Acolhimento | undefined> {
    return db.acolhimentos.get(id)
  },

  async getByPaciente(pacienteId: number): Promise<Acolhimento[]> {
    return db.acolhimentos.where('pacienteId').equals(pacienteId).toArray()
  },

  async create(data: AcolhimentoFormData): Promise<number> {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    return db.acolhimentos.add({ ...data, createdAt: now, updatedAt: now })
  },

  async update(id: number, data: Partial<AcolhimentoFormData> & { resumoIA?: string }): Promise<void> {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    await db.acolhimentos.update(id, { ...data, updatedAt: now })
  },

  async remove(id: number): Promise<void> {
    await db.acolhimentos.delete(id)
  },
}
