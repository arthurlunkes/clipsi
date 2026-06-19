import { db } from '@/infrastructure/database/db'
import type { Lancamento, LancamentoFormData } from '../types'
import { format } from 'date-fns'

export const financeiroService = {
  async getAll(): Promise<Lancamento[]> {
    return db.financeiro.orderBy('data').reverse().toArray()
  },

  async getById(id: number): Promise<Lancamento | undefined> {
    return db.financeiro.get(id)
  },

  async getByMes(ano: number, mes: number): Promise<Lancamento[]> {
    const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`
    const fim = `${ano}-${String(mes).padStart(2, '0')}-31`
    return db.financeiro.where('data').between(inicio, fim, true, true).toArray()
  },

  async create(data: LancamentoFormData): Promise<number> {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    return db.financeiro.add({ ...data, createdAt: now, updatedAt: now })
  },

  async update(id: number, data: Partial<LancamentoFormData>): Promise<void> {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
    await db.financeiro.update(id, { ...data, updatedAt: now })
  },

  async remove(id: number): Promise<void> {
    await db.financeiro.delete(id)
  },

  async getReceitaMensal(ano: number, mes: number): Promise<number> {
    const items = await this.getByMes(ano, mes)
    return items.filter(i => i.tipo === 'receita' && i.status === 'pago').reduce((sum, i) => sum + i.valor, 0)
  },

  async getDespesaMensal(ano: number, mes: number): Promise<number> {
    const items = await this.getByMes(ano, mes)
    return items.filter(i => i.tipo === 'despesa' && i.status === 'pago').reduce((sum, i) => sum + i.valor, 0)
  },

  async getContasReceber(): Promise<number> {
    const all = await this.getAll()
    return all.filter(i => i.tipo === 'receita' && i.status === 'pendente').reduce((sum, i) => sum + i.valor, 0)
  },
}
