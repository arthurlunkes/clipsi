<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { acolhimentoService } from '../services/acolhimento.service'
import { pacienteService } from '@/features/pacientes/services/paciente.service'
import { aiService, aiPrompts } from '@/infrastructure/ai/gemini'
import type { Acolhimento } from '../types'
import type { Paciente } from '@/features/pacientes/types'
import BaseCard from '@/shared/components/ui/BaseCard.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseModal from '@/shared/components/ui/BaseModal.vue'
import BaseSelect from '@/shared/components/ui/BaseSelect.vue'
import BaseTextarea from '@/shared/components/ui/BaseTextarea.vue'
import BaseBadge from '@/shared/components/ui/BaseBadge.vue'
import BaseEmptyState from '@/shared/components/ui/BaseEmptyState.vue'
import SkeletonLoader from '@/shared/components/ui/SkeletonLoader.vue'
import { Plus, Heart, BrainCircuit, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const loading = ref(true)
const acolhimentos = ref<Acolhimento[]>([])
const pacientes = ref<Paciente[]>([])
const showModal = ref(false)
const saving = ref(false)
const aiLoading = ref(false)
const editingId = ref<number | null>(null)
const expanded = ref<number | null>(null)

const form = ref({
  pacienteId: 0,
  queixaPrincipal: '',
  historico: '',
  encaminhamento: '',
  observacoes: '',
})

const errors = ref<Record<string, string>>({})
const pacienteOptions = ref<{ label: string; value: number }[]>([])

async function load() {
  loading.value = true
  const [a, p] = await Promise.all([acolhimentoService.getAll(), pacienteService.getAll()])
  acolhimentos.value = a
  pacientes.value = p
  pacienteOptions.value = p.map(p => ({ label: p.nome, value: p.id! }))
  loading.value = false
}

function openNew() {
  form.value = { pacienteId: 0, queixaPrincipal: '', historico: '', encaminhamento: '', observacoes: '' }
  editingId.value = null
  errors.value = {}
  showModal.value = true
}

function openEdit(a: Acolhimento) {
  form.value = {
    pacienteId: a.pacienteId,
    queixaPrincipal: a.queixaPrincipal,
    historico: a.historico,
    encaminhamento: a.encaminhamento ?? '',
    observacoes: a.observacoes ?? '',
  }
  editingId.value = a.id!
  errors.value = {}
  showModal.value = true
}

function validate() {
  errors.value = {}
  if (!form.value.pacienteId) errors.value.pacienteId = 'Selecione um paciente'
  if (!form.value.queixaPrincipal.trim()) errors.value.queixaPrincipal = 'Queixa principal é obrigatória'
  if (!form.value.historico.trim()) errors.value.historico = 'Histórico é obrigatório'
  return Object.keys(errors.value).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    const paciente = pacientes.value.find(p => p.id === Number(form.value.pacienteId))
    const data = { ...form.value, pacienteId: Number(form.value.pacienteId), pacienteNome: paciente?.nome }
    if (editingId.value) {
      await acolhimentoService.update(editingId.value, data)
    } else {
      await acolhimentoService.create(data)
    }
    await load()
    showModal.value = false
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  if (!confirm('Deseja excluir este acolhimento?')) return
  await acolhimentoService.remove(id)
  acolhimentos.value = acolhimentos.value.filter(a => a.id !== id)
}

async function generateAI(a: Acolhimento) {
  aiLoading.value = true
  try {
    const resumo = await aiService.generateSummary(aiPrompts.acolhimento(a.queixaPrincipal, a.historico))
    await acolhimentoService.update(a.id!, { resumoIA: resumo })
    await load()
  } catch (e: any) {
    alert(e.message ?? 'Erro ao gerar resumo IA')
  } finally {
    aiLoading.value = false
  }
}

function fmt(d: string) {
  try { return format(parseISO(d), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) } catch { return d }
}

onMounted(load)
</script>

<template>
  <div class="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">

    <div class="flex items-center justify-between">
      <p class="text-sm text-[#64748B]">Registros de acolhimento dos pacientes</p>
      <BaseButton @click="openNew">
        <Plus :size="16" /> Novo acolhimento
      </BaseButton>
    </div>

    <div v-if="loading" class="space-y-3">
      <SkeletonLoader v-for="i in 3" :key="i" :lines="4" height="h-5" />
    </div>

    <BaseEmptyState
      v-else-if="acolhimentos.length === 0"
      title="Nenhum acolhimento registrado"
      description="Registre o primeiro acolhimento clicando no botão acima."
    >
      <template #icon><Heart :size="32" class="text-[#94A3B8]" /></template>
    </BaseEmptyState>

    <div v-else class="space-y-3">
      <BaseCard
        v-for="a in acolhimentos"
        :key="a.id"
        padding="none"
      >
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-[#FEE2E2] rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart :size="18" class="text-[#EF4444]" />
              </div>
              <div>
                <p class="text-sm font-semibold text-[#1E293B]">{{ a.pacienteNome }}</p>
                <p class="text-xs text-[#64748B]">{{ fmt(a.createdAt) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button @click="openEdit(a)" class="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] rounded-lg transition-colors" aria-label="Editar">
                <Pencil :size="15" />
              </button>
              <button @click="remove(a.id!)" class="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors" aria-label="Excluir">
                <Trash2 :size="15" />
              </button>
              <button @click="expanded = expanded === a.id ? null : a.id!" class="p-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors" :aria-label="expanded === a.id ? 'Recolher' : 'Expandir'">
                <ChevronUp v-if="expanded === a.id" :size="15" />
                <ChevronDown v-else :size="15" />
              </button>
            </div>
          </div>

          <div class="mt-3">
            <p class="text-sm text-[#1E293B] font-medium">{{ a.queixaPrincipal }}</p>
          </div>
        </div>

        <div v-if="expanded === a.id" class="px-4 pb-4 border-t border-[#F1F5F9] mt-0 space-y-3 pt-3">
          <div>
            <p class="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1">Histórico</p>
            <p class="text-sm text-[#374151]">{{ a.historico }}</p>
          </div>
          <div v-if="a.encaminhamento">
            <p class="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1">Encaminhamento</p>
            <p class="text-sm text-[#374151]">{{ a.encaminhamento }}</p>
          </div>
          <div v-if="a.observacoes">
            <p class="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1">Observações</p>
            <p class="text-sm text-[#374151]">{{ a.observacoes }}</p>
          </div>
          <div v-if="a.resumoIA" class="bg-[#EDE9FE] p-3 rounded-lg">
            <div class="flex items-center gap-1.5 mb-1">
              <BrainCircuit :size="14" class="text-[#7C5CFC]" />
              <p class="text-xs font-semibold text-[#7C5CFC]">Resumo IA</p>
            </div>
            <p class="text-sm text-[#374151]">{{ a.resumoIA }}</p>
          </div>
          <BaseButton variant="secondary" size="sm" :loading="aiLoading" @click="generateAI(a)">
            <BrainCircuit :size="14" />
            {{ a.resumoIA ? 'Regerar resumo IA' : 'Gerar resumo IA' }}
          </BaseButton>
        </div>
      </BaseCard>
    </div>

    <BaseModal :open="showModal" :title="editingId ? 'Editar acolhimento' : 'Novo acolhimento'" size="lg" @close="showModal = false">
      <form @submit.prevent="save" class="space-y-4" novalidate>
        <BaseSelect
          id="pacienteIdAc"
          v-model="form.pacienteId"
          label="Paciente"
          :options="pacienteOptions"
          placeholder="Selecione o paciente"
          :error="errors.pacienteId"
          required
        />
        <BaseTextarea id="queixaPrincipal" v-model="form.queixaPrincipal" label="Queixa principal" placeholder="Descreva a queixa principal do paciente..." :rows="3" :error="errors.queixaPrincipal" required />
        <BaseTextarea id="historico" v-model="form.historico" label="Histórico" placeholder="Histórico clínico, familiar e social..." :rows="4" :error="errors.historico" required />
        <BaseTextarea id="encaminhamento" v-model="form.encaminhamento" label="Encaminhamento" placeholder="Por quem foi encaminhado..." :rows="2" />
        <BaseTextarea id="observacoesAc" v-model="form.observacoes" label="Observações" placeholder="Observações adicionais..." :rows="2" />
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
