<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { prontuarioService } from '../services/prontuario.service'
import { pacienteService } from '@/features/pacientes/services/paciente.service'
import { aiService, aiPrompts } from '@/infrastructure/ai/gemini'
import type { Prontuario } from '../types'
import type { Paciente } from '@/features/pacientes/types'
import BaseCard from '@/shared/components/ui/BaseCard.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseModal from '@/shared/components/ui/BaseModal.vue'
import BaseSelect from '@/shared/components/ui/BaseSelect.vue'
import BaseInput from '@/shared/components/ui/BaseInput.vue'
import BaseTextarea from '@/shared/components/ui/BaseTextarea.vue'
import BaseEmptyState from '@/shared/components/ui/BaseEmptyState.vue'
import SkeletonLoader from '@/shared/components/ui/SkeletonLoader.vue'
import {
  Plus,
  FileText,
  BrainCircuit,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const loading = ref(true)
const prontuarios = ref<Prontuario[]>([])
const pacientes = ref<Paciente[]>([])
const filterPaciente = ref<string>('')
const showModal = ref(false)
const saving = ref(false)
const aiLoading = ref(false)
const editingId = ref<number | null>(null)
const expanded = ref<number | null>(null)

const form = ref({
  pacienteId: 0,
  titulo: '',
  conteudo: '',
  sessaoNumero: undefined as number | undefined,
})
const errors = ref<Record<string, string>>({})

const pacienteOptions = ref<{ label: string; value: number }[]>([])
const filterOptions = ref<{ label: string; value: string }[]>([])

async function load() {
  loading.value = true
  const [pr, p] = await Promise.all([prontuarioService.getAll(), pacienteService.getAll()])
  prontuarios.value = pr
  pacientes.value = p
  pacienteOptions.value = p.map((p) => ({ label: p.nome, value: p.id! }))
  filterOptions.value = [
    { label: 'Todos os pacientes', value: '' },
    ...p.map((p) => ({ label: p.nome, value: String(p.id) })),
  ]
  loading.value = false
}

const filtered = () =>
  filterPaciente.value
    ? prontuarios.value.filter((p) => String(p.pacienteId) === filterPaciente.value)
    : prontuarios.value

function openNew() {
  form.value = { pacienteId: 0, titulo: '', conteudo: '', sessaoNumero: undefined }
  editingId.value = null
  errors.value = {}
  showModal.value = true
}

function openEdit(p: Prontuario) {
  form.value = {
    pacienteId: p.pacienteId,
    titulo: p.titulo,
    conteudo: p.conteudo,
    sessaoNumero: p.sessaoNumero,
  }
  editingId.value = p.id!
  showModal.value = true
}

function validate() {
  errors.value = {}
  if (!form.value.pacienteId) errors.value.pacienteId = 'Selecione um paciente'
  if (!form.value.titulo.trim()) errors.value.titulo = 'Título é obrigatório'
  if (!form.value.conteudo.trim()) errors.value.conteudo = 'Conteúdo é obrigatório'
  return Object.keys(errors.value).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    const paciente = pacientes.value.find((p) => p.id === Number(form.value.pacienteId))
    const data = {
      ...form.value,
      pacienteId: Number(form.value.pacienteId),
      pacienteNome: paciente?.nome,
    }
    if (editingId.value) {
      await prontuarioService.update(editingId.value, data)
    } else {
      await prontuarioService.create(data)
    }
    await load()
    showModal.value = false
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  if (!confirm('Excluir esta evolução?')) return
  await prontuarioService.remove(id)
  prontuarios.value = prontuarios.value.filter((p) => p.id !== id)
}

async function generateAI(p: Prontuario) {
  aiLoading.value = true
  try {
    const resumo = await aiService.generateSummary(aiPrompts.prontuario(p.titulo, p.conteudo))
    await prontuarioService.update(p.id!, { resumoIA: resumo })
    await load()
  } catch (e: any) {
    alert(e.message ?? 'Erro ao gerar resumo IA')
  } finally {
    aiLoading.value = false
  }
}

function fmt(d: string) {
  try {
    return format(parseISO(d), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return d
  }
}

onMounted(load)
</script>

<template>
  <div class="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div class="w-48">
        <BaseSelect
          id="filterPacientePr"
          v-model="filterPaciente"
          :options="filterOptions"
          placeholder="Todos os pacientes"
        />
      </div>
      <BaseButton @click="openNew"> <Plus :size="16" /> Nova evolução </BaseButton>
    </div>

    <div v-if="loading" class="space-y-3">
      <SkeletonLoader v-for="i in 3" :key="i" :lines="4" height="h-5" />
    </div>

    <BaseEmptyState
      v-else-if="filtered().length === 0"
      title="Nenhuma evolução registrada"
      description="Adicione a primeira nota de evolução."
    >
      <template #icon><FileText :size="32" class="text-[#94A3B8]" /></template>
    </BaseEmptyState>

    <div v-else class="space-y-3">
      <BaseCard v-for="p in filtered()" :key="p.id" padding="none">
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-[#EDE9FE] rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <FileText :size="18" class="text-[#7C5CFC]" />
              </div>
              <div>
                <p class="text-sm font-semibold text-[#1E293B]">{{ p.titulo }}</p>
                <p class="text-xs text-[#64748B]">{{ p.pacienteNome }} · {{ fmt(p.createdAt) }}</p>
                <p v-if="p.sessaoNumero" class="text-xs text-[#94A3B8]">
                  Sessão {{ p.sessaoNumero }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="openEdit(p)"
                class="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] rounded-lg transition-colors"
                aria-label="Editar"
              >
                <Pencil :size="15" />
              </button>
              <button
                @click="remove(p.id!)"
                class="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                aria-label="Excluir"
              >
                <Trash2 :size="15" />
              </button>
              <button
                @click="expanded = expanded === p.id ? null : p.id!"
                class="p-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors"
              >
                <ChevronUp v-if="expanded === p.id" :size="15" />
                <ChevronDown v-else :size="15" />
              </button>
            </div>
          </div>

          <p class="mt-2 text-sm text-[#374151] line-clamp-2">{{ p.conteudo }}</p>
        </div>

        <div v-if="expanded === p.id" class="px-4 pb-4 border-t border-[#F1F5F9] pt-3 space-y-3">
          <p class="text-sm text-[#374151] whitespace-pre-wrap">{{ p.conteudo }}</p>

          <div v-if="p.resumoIA" class="bg-[#EDE9FE] p-3 rounded-lg">
            <div class="flex items-center gap-1.5 mb-1">
              <BrainCircuit :size="14" class="text-[#7C5CFC]" />
              <p class="text-xs font-semibold text-[#7C5CFC]">Resumo IA</p>
            </div>
            <p class="text-sm text-[#374151]">{{ p.resumoIA }}</p>
          </div>

          <BaseButton variant="secondary" size="sm" :loading="aiLoading" @click="generateAI(p)">
            <BrainCircuit :size="14" />
            {{ p.resumoIA ? 'Regerar resumo' : 'Gerar resumo IA' }}
          </BaseButton>
        </div>
      </BaseCard>
    </div>

    <BaseModal
      :open="showModal"
      :title="editingId ? 'Editar evolução' : 'Nova evolução'"
      size="lg"
      @close="showModal = false"
    >
      <form @submit.prevent="save" class="space-y-4" novalidate>
        <BaseSelect
          id="pacienteIdPr"
          v-model="form.pacienteId"
          label="Paciente"
          :options="pacienteOptions"
          placeholder="Selecione o paciente"
          :error="errors.pacienteId"
          required
        />
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="sm:col-span-3">
            <BaseInput
              id="tituloPr"
              v-model="form.titulo"
              label="Título da sessão"
              placeholder="Ex: Sessão 5 - Técnicas cognitivas"
              :error="errors.titulo"
              required
            />
          </div>
          <BaseInput
            id="sessaoNum"
            v-model="form.sessaoNumero"
            type="number"
            label="Nº sessão"
            placeholder="5"
          />
        </div>
        <BaseTextarea
          id="conteudoPr"
          v-model="form.conteudo"
          label="Evolução"
          placeholder="Descreva o que ocorreu na sessão, observações clínicas, técnicas utilizadas..."
          :rows="6"
          :error="errors.conteudo"
          required
        />
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
