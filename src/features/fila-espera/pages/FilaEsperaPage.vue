<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { filaService } from '../services/fila.service'
import { pacienteService } from '@/features/pacientes/services/paciente.service'
import type { FilaEspera, FilaStatus } from '../types'
import type { Paciente } from '@/features/pacientes/types'
import BaseCard from '@/shared/components/ui/BaseCard.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseModal from '@/shared/components/ui/BaseModal.vue'
import BaseSelect from '@/shared/components/ui/BaseSelect.vue'
import BaseBadge from '@/shared/components/ui/BaseBadge.vue'
import BaseEmptyState from '@/shared/components/ui/BaseEmptyState.vue'
import SkeletonLoader from '@/shared/components/ui/SkeletonLoader.vue'
import { Plus, Clock, RefreshCw, Trash2, Play, CheckCircle, AlertCircle } from 'lucide-vue-next'
import { format } from 'date-fns'

const loading = ref(true)
const fila = ref<FilaEspera[]>([])
const pacientes = ref<Paciente[]>([])
const showModal = ref(false)
const saving = ref(false)

const form = ref({ pacienteId: 0, prioridade: 3, observacoes: '' })
const errors = ref<Record<string, string>>({})

const pacienteOptions = computed(() => pacientes.value.map(p => ({ label: p.nome, value: p.id! })))
const prioridadeOptions = [
  { label: 'Alta', value: 1 },
  { label: 'Média', value: 2 },
  { label: 'Normal', value: 3 },
]

const aguardando = computed(() => fila.value.filter(f => f.status === 'aguardando'))
const emAtendimento = computed(() => fila.value.filter(f => f.status === 'em_atendimento'))
const finalizados = computed(() => fila.value.filter(f => f.status === 'finalizado' || f.status === 'ausente'))

async function load() {
  loading.value = true
  const [f, p] = await Promise.all([filaService.getHoje(), pacienteService.getAll()])
  fila.value = f
  pacientes.value = p
  loading.value = false
}

function openNew() {
  form.value = { pacienteId: 0, prioridade: 3, observacoes: '' }
  errors.value = {}
  showModal.value = true
}

async function save() {
  if (!form.value.pacienteId) { errors.value.pacienteId = 'Selecione um paciente'; return }
  saving.value = true
  try {
    const paciente = pacientes.value.find(p => p.id === Number(form.value.pacienteId))
    await filaService.create({
      pacienteId: Number(form.value.pacienteId),
      prioridade: Number(form.value.prioridade),
      observacoes: form.value.observacoes,
    })
    await load()
    showModal.value = false
  } finally {
    saving.value = false
  }
}

async function updateStatus(id: number, status: FilaStatus) {
  await filaService.updateStatus(id, status)
  await load()
}

async function remove(id: number) {
  await filaService.remove(id)
  fila.value = fila.value.filter(f => f.id !== id)
}

const prioridadeLabel = (p: number) => ({ 1: 'Alta', 2: 'Média', 3: 'Normal' }[p] ?? 'Normal')
const prioridadeVariant = (p: number): any => ({ 1: 'danger', 2: 'warning', 3: 'neutral' }[p] ?? 'neutral')

function tempoEspera(horaChegada: string) {
  const parts = horaChegada.split(':').map(Number)
  const h = parts[0] ?? 0
  const m = parts[1] ?? 0
  const now = new Date()
  const diff = (now.getHours() * 60 + now.getMinutes()) - (h * 60 + m)
  if (diff < 0) return '—'
  if (diff < 60) return `${diff} min`
  return `${Math.floor(diff / 60)}h ${diff % 60}min`
}

onMounted(load)
</script>

<template>
  <div class="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <BaseCard padding="sm" class="text-center">
        <p class="text-2xl font-bold text-[#F59E0B]">{{ aguardando.length }}</p>
        <p class="text-xs text-[#64748B]">Aguardando</p>
      </BaseCard>
      <BaseCard padding="sm" class="text-center">
        <p class="text-2xl font-bold text-[#7C5CFC]">{{ emAtendimento.length }}</p>
        <p class="text-xs text-[#64748B]">Em atendimento</p>
      </BaseCard>
      <BaseCard padding="sm" class="text-center">
        <p class="text-2xl font-bold text-[#22C55E]">{{ finalizados.length }}</p>
        <p class="text-xs text-[#64748B]">Finalizados</p>
      </BaseCard>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <p class="text-sm font-semibold text-[#1E293B]">Fila de hoje</p>
        <p class="text-xs text-[#64748B]">{{ format(new Date(), 'dd/MM/yyyy') }}</p>
      </div>
      <div class="flex gap-2">
        <BaseButton variant="outline" size="sm" @click="load">
          <RefreshCw :size="14" /> Atualizar
        </BaseButton>
        <BaseButton @click="openNew">
          <Plus :size="16" /> Adicionar
        </BaseButton>
      </div>
    </div>

    <div v-if="loading" class="space-y-3">
      <SkeletonLoader v-for="i in 3" :key="i" :lines="2" height="h-16" />
    </div>

    <BaseEmptyState
      v-else-if="fila.length === 0"
      title="Fila vazia"
      description="Nenhum paciente na fila hoje. Adicione pacientes conforme chegarem."
    >
      <template #icon><Clock :size="32" class="text-[#94A3B8]" /></template>
    </BaseEmptyState>

    <template v-else>
      <!-- Aguardando -->
      <div v-if="aguardando.length > 0">
        <h2 class="text-sm font-semibold text-[#64748B] uppercase tracking-wide mb-2 flex items-center gap-2">
          <Clock :size="14" class="text-[#F59E0B]" /> Aguardando ({{ aguardando.length }})
        </h2>
        <div class="space-y-2">
          <BaseCard
            v-for="f in aguardando"
            :key="f.id"
            padding="none"
            class="border-l-4 border-l-[#F59E0B]"
          >
            <div class="flex items-center gap-3 p-4">
              <div class="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-bold text-[#D97706]">
                  {{ f.pacienteNome?.split(' ').map(n => n[0]).slice(0, 2).join('') }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-[#1E293B]">{{ f.pacienteNome }}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <p class="text-xs text-[#64748B]">Chegou às {{ f.horaChegada }}</p>
                  <span class="text-xs text-[#94A3B8]">·</span>
                  <p class="text-xs text-[#F59E0B] font-medium">{{ tempoEspera(f.horaChegada) }} esperando</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <BaseBadge :variant="prioridadeVariant(f.prioridade)" size="sm">{{ prioridadeLabel(f.prioridade) }}</BaseBadge>
                <div class="flex gap-1">
                  <button @click="updateStatus(f.id!, 'em_atendimento')" class="p-2 text-[#7C5CFC] hover:bg-[#EDE9FE] rounded-lg transition-colors" aria-label="Iniciar atendimento">
                    <Play :size="15" />
                  </button>
                  <button @click="updateStatus(f.id!, 'ausente')" class="p-2 text-[#F59E0B] hover:bg-[#FEF3C7] rounded-lg transition-colors" aria-label="Marcar ausente">
                    <AlertCircle :size="15" />
                  </button>
                  <button @click="remove(f.id!)" class="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors" aria-label="Remover">
                    <Trash2 :size="15" />
                  </button>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Em atendimento -->
      <div v-if="emAtendimento.length > 0">
        <h2 class="text-sm font-semibold text-[#64748B] uppercase tracking-wide mb-2 flex items-center gap-2">
          <Play :size="14" class="text-[#7C5CFC]" /> Em atendimento
        </h2>
        <div class="space-y-2">
          <BaseCard v-for="f in emAtendimento" :key="f.id" padding="none" class="border-l-4 border-l-[#7C5CFC]">
            <div class="flex items-center gap-3 p-4">
              <div class="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-bold text-[#7C5CFC]">
                  {{ f.pacienteNome?.split(' ').map(n => n[0]).slice(0, 2).join('') }}
                </span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-[#1E293B]">{{ f.pacienteNome }}</p>
                <p class="text-xs text-[#64748B]">Iniciou às {{ f.horaInicio }}</p>
              </div>
              <button @click="updateStatus(f.id!, 'finalizado')" class="p-2 text-[#22C55E] hover:bg-[#DCFCE7] rounded-lg transition-colors" aria-label="Finalizar">
                <CheckCircle :size="18" />
              </button>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Finalizados -->
      <div v-if="finalizados.length > 0">
        <h2 class="text-sm font-semibold text-[#64748B] uppercase tracking-wide mb-2 flex items-center gap-2">
          <CheckCircle :size="14" class="text-[#22C55E]" /> Finalizados ({{ finalizados.length }})
        </h2>
        <div class="space-y-2">
          <BaseCard v-for="f in finalizados" :key="f.id" padding="none" class="opacity-70">
            <div class="flex items-center gap-3 p-3">
              <div class="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-bold text-[#64748B]">
                  {{ f.pacienteNome?.split(' ').map(n => n[0]).slice(0, 2).join('') }}
                </span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-[#64748B]">{{ f.pacienteNome }}</p>
                <p class="text-xs text-[#94A3B8]">{{ f.horaInicio }} – {{ f.horaFim }}</p>
              </div>
              <BaseBadge :variant="f.status === 'ausente' ? 'warning' : 'success'" size="sm">
                {{ f.status === 'ausente' ? 'Ausente' : 'Finalizado' }}
              </BaseBadge>
            </div>
          </BaseCard>
        </div>
      </div>
    </template>

    <!-- Modal -->
    <BaseModal :open="showModal" title="Adicionar à fila" size="sm" @close="showModal = false">
      <form @submit.prevent="save" class="space-y-4" novalidate>
        <BaseSelect id="pacienteIdFila" v-model="form.pacienteId" label="Paciente" :options="pacienteOptions" placeholder="Selecione o paciente" :error="errors.pacienteId" required />
        <BaseSelect id="prioridadeFila" v-model="form.prioridade" label="Prioridade" :options="prioridadeOptions" />
      </form>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="outline" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton :loading="saving" @click="save">Adicionar</BaseButton>
        </div>
      </template>
    </BaseModal>

  </div>
</template>
