import { db } from '@/infrastructure/database/db'
import type { Consulta, ConsultaFormData } from '../types'
import { format } from 'date-fns'

export const consultaService = {
  async getAll(): Promise<Consulta[]> {
    return db.consultas.orderBy('data').toArray()
  },

  async getById(id: number): Promise<Consulta | undefined> {
    return db.consultas.get(id)
  },

  async getByPaciente(pacienteId: number): Promise<Consulta[]> {
    return db.consultas.where('pacienteId').equals(pacienteId).sortBy('data')
  },

  async getHoje(): Promise<Consulta[]> {
    const hoje = format(new Date(), 'yyyy-MM-dd')
    return db.consultas.where('data').equals(hoje).toArray()
  },

  async getProximas(limit = 5): Promise<Consulta[]> {
    const agora = format(new Date(), 'yyyy-MM-dd')
    return db.consultas
      .where('data')
      .aboveOrEqual(agora)
      .filter((c) => c.status !== 'cancelada')
      .limit(limit)
      .toArray()
  },

  async create(data: ConsultaFormData): Promise<number> {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    return db.consultas.add({ ...data, createdAt: now, updatedAt: now })
  },

  async update(id: number, data: Partial<ConsultaFormData>): Promise<void> {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    await db.consultas.update(id, { ...data, updatedAt: now })
  },

  async remove(id: number): Promise<void> {
    await db.consultas.delete(id)
  },

  async countHoje(): Promise<number> {
    const hoje = format(new Date(), 'yyyy-MM-dd')
    return db.consultas.where('data').equals(hoje).count()
  },

  async getByMes(ano: number, mes: number): Promise<Consulta[]> {
    const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`
    const fim = `${ano}-${String(mes).padStart(2, '0')}-31`
    return db.consultas.where('data').between(inicio, fim, true, true).toArray()
  },
}
