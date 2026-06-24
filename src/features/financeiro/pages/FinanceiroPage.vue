<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { financeiroService } from '../services/financeiro.service'
import type { Lancamento } from '../types'
import BaseCard from '@/shared/components/ui/BaseCard.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseModal from '@/shared/components/ui/BaseModal.vue'
import BaseSelect from '@/shared/components/ui/BaseSelect.vue'
import BaseInput from '@/shared/components/ui/BaseInput.vue'
import BaseTextarea from '@/shared/components/ui/BaseTextarea.vue'
import BaseBadge from '@/shared/components/ui/BaseBadge.vue'
import BaseEmptyState from '@/shared/components/ui/BaseEmptyState.vue'
import SkeletonLoader from '@/shared/components/ui/SkeletonLoader.vue'
import { Plus, TrendingUp, TrendingDown, DollarSign, Clock, Pencil, Trash2 } from 'lucide-vue-next'
import { format, parseISO, getYear, getMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const loading = ref(true)
const lancamentos = ref<Lancamento[]>([])
const showModal = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const filterTipo = ref('')

const now = new Date()
const selectedAno = ref(getYear(now))
const selectedMes = ref(getMonth(now) + 1)

const form = ref({
  tipo: 'receita' as 'receita' | 'despesa',
  descricao: '',
  valor: 0,
  data: format(now, 'yyyy-MM-dd'),
  status: 'pago' as 'pago' | 'pendente' | 'cancelado',
  categoria: '',
  observacoes: '',
})

const errors = ref<Record<string, string>>({})

const tipoOptions = [
  { label: 'Receita', value: 'receita' },
  { label: 'Despesa', value: 'despesa' },
]

const statusOptions = [
  { label: 'Pago', value: 'pago' },
  { label: 'Pendente', value: 'pendente' },
  { label: 'Cancelado', value: 'cancelado' },
]

const categoriaReceitaOptions = [
  { label: 'Consultas', value: 'Consultas' },
  { label: 'Avaliação', value: 'Avaliação' },
  { label: 'Outros', value: 'Outros' },
]

const categoriaDespesaOptions = [
  { label: 'Infraestrutura', value: 'Infraestrutura' },
  { label: 'Materiais', value: 'Materiais' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Pessoal', value: 'Pessoal' },
  { label: 'Outros', value: 'Outros' },
]

const categoriaOptions = computed(() =>
  form.value.tipo === 'receita' ? categoriaReceitaOptions : categoriaDespesaOptions,
)

const mesesOptions = [
  { label: 'Janeiro', value: 1 },
  { label: 'Fevereiro', value: 2 },
  { label: 'Março', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Maio', value: 5 },
  { label: 'Junho', value: 6 },
  { label: 'Julho', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Setembro', value: 9 },
  { label: 'Outubro', value: 10 },
  { label: 'Novembro', value: 11 },
  { label: 'Dezembro', value: 12 },
]

const anosOptions = [2024, 2025, 2026].map((y) => ({ label: String(y), value: y }))

const filtered = computed(() => {
  let items = lancamentos.value
  if (filterTipo.value) items = items.filter((i) => i.tipo === filterTipo.value)
  return items
})

const totalReceitas = computed(() =>
  filtered.value
    .filter((i) => i.tipo === 'receita' && i.status === 'pago')
    .reduce((s, i) => s + i.valor, 0),
)
const totalDespesas = computed(() =>
  filtered.value
    .filter((i) => i.tipo === 'despesa' && i.status === 'pago')
    .reduce((s, i) => s + i.valor, 0),
)
const lucro = computed(() => totalReceitas.value - totalDespesas.value)
const contasReceber = computed(() =>
  filtered.value
    .filter((i) => i.tipo === 'receita' && i.status === 'pendente')
    .reduce((s, i) => s + i.valor, 0),
)

async function load() {
  loading.value = true
  lancamentos.value = await financeiroService.getByMes(selectedAno.value, selectedMes.value)
  loading.value = false
}

watch([selectedAno, selectedMes], load)

function openNew() {
  form.value = {
    tipo: 'receita',
    descricao: '',
    valor: 0,
    data: format(now, 'yyyy-MM-dd'),
    status: 'pago',
    categoria: '',
    observacoes: '',
  }
  editingId.value = null
  errors.value = {}
  showModal.value = true
}

function openEdit(l: Lancamento) {
  form.value = {
    tipo: l.tipo,
    descricao: l.descricao,
    valor: l.valor,
    data: l.data,
    status: l.status,
    categoria: l.categoria,
    observacoes: l.observacoes ?? '',
  }
  editingId.value = l.id!
  showModal.value = true
}

function validate() {
  errors.value = {}
  if (!form.value.descricao.trim()) errors.value.descricao = 'Descrição obrigatória'
  if (!form.value.valor || form.value.valor <= 0)
    errors.value.valor = 'Valor deve ser maior que zero'
  if (!form.value.data) errors.value.data = 'Data obrigatória'
  if (!form.value.categoria) errors.value.categoria = 'Categoria obrigatória'
  return Object.keys(errors.value).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    if (editingId.value) {
      await financeiroService.update(editingId.value, form.value)
    } else {
      await financeiroService.create(form.value)
    }
    await load()
    showModal.value = false
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  if (!confirm('Excluir este lançamento?')) return
  await financeiroService.remove(id)
  lancamentos.value = lancamentos.value.filter((l) => l.id !== id)
}

function fmtMoney(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtDate(d: string) {
  try {
    return format(parseISO(d), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return d
  }
}

const statusConfig: Record<string, { label: string; variant: any }> = {
  pago: { label: 'Pago', variant: 'success' },
  pendente: { label: 'Pendente', variant: 'warning' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
}

onMounted(load)
</script>

<template>
  <div class="p-4 lg:p-6 max-w-6xl mx-auto space-y-5">
    <!-- Filtros de período -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="w-36">
        <BaseSelect id="mes" v-model="selectedMes" :options="mesesOptions" />
      </div>
      <div class="w-24">
        <BaseSelect id="ano" v-model="selectedAno" :options="anosOptions" />
      </div>
      <div class="flex gap-2 ml-auto">
        <BaseSelect
          id="filterTipo"
          v-model="filterTipo"
          :options="[{ label: 'Todos', value: '' }, ...tipoOptions]"
        />
        <BaseButton @click="openNew"> <Plus :size="16" /> Lançamento </BaseButton>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <BaseCard padding="md">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-9 h-9 rounded-xl bg-[#DCFCE7] flex items-center justify-center">
            <TrendingUp :size="18" class="text-[#16A34A]" />
          </div>
          <span class="text-xs text-[#64748B]">Receitas</span>
        </div>
        <p class="text-xl font-bold text-[#1E293B]">{{ fmtMoney(totalReceitas) }}</p>
      </BaseCard>

      <BaseCard padding="md">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-9 h-9 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
            <TrendingDown :size="18" class="text-[#DC2626]" />
          </div>
          <span class="text-xs text-[#64748B]">Despesas</span>
        </div>
        <p class="text-xl font-bold text-[#1E293B]">{{ fmtMoney(totalDespesas) }}</p>
      </BaseCard>

      <BaseCard padding="md">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-9 h-9 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
            <DollarSign :size="18" class="text-[#7C5CFC]" />
          </div>
          <span class="text-xs text-[#64748B]">Lucro</span>
        </div>
        <p class="text-xl font-bold" :class="lucro >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'">
          {{ fmtMoney(lucro) }}
        </p>
      </BaseCard>

      <BaseCard padding="md">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
            <Clock :size="18" class="text-[#D97706]" />
          </div>
          <span class="text-xs text-[#64748B]">A receber</span>
        </div>
        <p class="text-xl font-bold text-[#1E293B]">{{ fmtMoney(contasReceber) }}</p>
      </BaseCard>
    </div>

    <!-- Table -->
    <BaseCard padding="none">
      <div v-if="loading" class="p-6 space-y-3">
        <SkeletonLoader v-for="i in 5" :key="i" :lines="1" height="h-10" />
      </div>

      <BaseEmptyState
        v-else-if="filtered.length === 0"
        title="Nenhum lançamento"
        description="Adicione o primeiro lançamento financeiro."
      />

      <div v-else class="overflow-x-auto">
        <table class="w-full" aria-label="Lançamentos financeiros">
          <thead>
            <tr class="border-b border-[#F1F5F9]">
              <th
                class="text-left px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide"
              >
                Descrição
              </th>
              <th
                class="text-left px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide hidden sm:table-cell"
              >
                Categoria
              </th>
              <th
                class="text-left px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide hidden md:table-cell"
              >
                Data
              </th>
              <th
                class="text-left px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide"
              >
                Valor
              </th>
              <th
                class="text-left px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide hidden sm:table-cell"
              >
                Status
              </th>
              <th
                class="text-right px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F8FAFC]">
            <tr v-for="l in filtered" :key="l.id" class="hover:bg-[#F8FAFC] transition-colors">
              <td class="px-6 py-3">
                <div class="flex items-center gap-2">
                  <div
                    class="w-1 h-8 rounded-full flex-shrink-0"
                    :class="l.tipo === 'receita' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'"
                  />
                  <div>
                    <p class="text-sm font-medium text-[#1E293B]">{{ l.descricao }}</p>
                    <p class="text-xs text-[#64748B] capitalize">{{ l.tipo }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-3 text-sm text-[#64748B] hidden sm:table-cell">
                {{ l.categoria }}
              </td>
              <td class="px-6 py-3 text-sm text-[#64748B] hidden md:table-cell">
                {{ fmtDate(l.data) }}
              </td>
              <td
                class="px-6 py-3 text-sm font-semibold"
                :class="l.tipo === 'receita' ? 'text-[#16A34A]' : 'text-[#DC2626]'"
              >
                {{ l.tipo === 'receita' ? '+' : '-' }}{{ fmtMoney(l.valor) }}
              </td>
              <td class="px-6 py-3 hidden sm:table-cell">
                <BaseBadge :variant="statusConfig[l.status]?.variant" size="sm">
                  {{ statusConfig[l.status]?.label }}
                </BaseBadge>
              </td>
              <td class="px-6 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openEdit(l)"
                    class="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] rounded-lg transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil :size="15" />
                  </button>
                  <button
                    @click="remove(l.id!)"
                    class="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                    aria-label="Excluir"
                  >
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <!-- Modal -->
    <BaseModal
      :open="showModal"
      :title="editingId ? 'Editar lançamento' : 'Novo lançamento'"
      size="md"
      @close="showModal = false"
    >
      <form @submit.prevent="save" class="space-y-4" novalidate>
        <BaseSelect id="tipoL" v-model="form.tipo" label="Tipo" :options="tipoOptions" required />
        <BaseInput
          id="descricaoL"
          v-model="form.descricao"
          label="Descrição"
          placeholder="Ex: Sessão de psicoterapia"
          :error="errors.descricao"
          required
        />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            id="valorL"
            v-model="form.valor"
            type="number"
            label="Valor (R$)"
            :error="errors.valor"
            required
          />
          <BaseInput
            id="dataL"
            v-model="form.data"
            type="date"
            label="Data"
            :error="errors.data"
            required
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <BaseSelect
            id="categoriaL"
            v-model="form.categoria"
            label="Categoria"
            :options="categoriaOptions"
            placeholder="Selecione"
            :error="errors.categoria"
            required
          />
          <BaseSelect
            id="statusL"
            v-model="form.status"
            label="Status"
            :options="statusOptions"
            required
          />
        </div>
        <BaseTextarea id="obsL" v-model="form.observacoes" label="Observações" :rows="2" />
      </form>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="outline" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton :loading="saving" @click="save">Salvar</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
