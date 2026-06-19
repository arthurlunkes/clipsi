import { db } from '@/infrastructure/database/db'
import type { FilaEspera, FilaEsperaFormData, FilaStatus } from '../types'
import { format } from 'date-fns'

export const filaService = {
  async getHoje(): Promise<FilaEspera[]> {
    const hoje = format(new Date(), 'yyyy-MM-dd')
    return db.filaEspera
      .filter(f => f.createdAt.startsWith(hoje))
      .toArray()
      .then(items => items.sort((a, b) => a.prioridade - b.prioridade || a.horaChegada.localeCompare(b.horaChegada)))
  },

  async getById(id: number): Promise<FilaEspera | undefined> {
    return db.filaEspera.get(id)
  },

  async create(data: FilaEsperaFormData): Promise<number> {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    return db.filaEspera.add({
      ...data,
      prioridade: data.prioridade ?? 3,
      status: 'aguardando',
      horaChegada: format(new Date(), 'HH:mm'),
      createdAt: now,
      updatedAt: now,
    })
  },

  async updateStatus(id: number, status: FilaStatus): Promise<void> {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    const updates: Partial<FilaEspera> = { status, updatedAt: now }
    if (status === 'em_atendimento') updates.horaInicio = format(new Date(), 'HH:mm')
    if (status === 'finalizado') updates.horaFim = format(new Date(), 'HH:mm')
    await db.filaEspera.update(id, updates)
  },

  async remove(id: number): Promise<void> {
    await db.filaEspera.delete(id)
  },

  async countAguardando(): Promise<number> {
    const hoje = format(new Date(), 'yyyy-MM-dd')
    return db.filaEspera
      .filter(f => f.createdAt.startsWith(hoje) && f.status === 'aguardando')
      .count()
  },
}
