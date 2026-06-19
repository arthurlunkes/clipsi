<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { pacienteService } from '../services/paciente.service'
import { consultaService } from '@/features/agenda/services/consulta.service'
import { prontuarioService } from '@/features/prontuario/services/prontuario.service'
import type { Paciente } from '../types'
import BaseCard from '@/shared/components/ui/BaseCard.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseBadge from '@/shared/components/ui/BaseBadge.vue'
import SkeletonLoader from '@/shared/components/ui/SkeletonLoader.vue'
import { ArrowLeft, Pencil, Phone, Mail, MapPin, Calendar, FileText, Users } from 'lucide-vue-next'
import { format, parseISO, differenceInYears } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

const loading = ref(true)
const paciente = ref<Paciente | null>(null)
const consultas = ref<any[]>([])
const prontuarios = ref<any[]>([])

onMounted(async () => {
  const [p, c, pr] = await Promise.all([
    pacienteService.getById(id),
    consultaService.getByPaciente(id),
    prontuarioService.getByPaciente(id),
  ])
  paciente.value = p ?? null
  consultas.value = c.slice(0, 5)
  prontuarios.value = pr.slice(0, 3)
  loading.value = false
})

function age(d: string) {
  try { return differenceInYears(new Date(), parseISO(d)) } catch { return '-' }
}
function fmt(d: string) {
  try { return format(parseISO(d), "dd/MM/yyyy", { locale: ptBR }) } catch { return d }
}

const statusMap: Record<string, { label: string; variant: any }> = {
  agendada: { label: 'Agendada', variant: 'neutral' },
  confirmada: { label: 'Confirmada', variant: 'success' },
  realizada: { label: 'Realizada', variant: 'info' },
  cancelada: { label: 'Cancelada', variant: 'danger' },
  falta: { label: 'Falta', variant: 'warning' },
}
</script>

<template>
  <div class="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">

    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="router.back()" class="p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors" aria-label="Voltar">
        <ArrowLeft :size="20" />
      </button>
    </div>

    <div v-if="loading" class="space-y-4">
      <SkeletonLoader :lines="4" height="h-6" />
    </div>

    <template v-else-if="paciente">
      <!-- Profile card -->
      <BaseCard padding="md">
        <div class="flex flex-col sm:flex-row sm:items-start gap-4">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C5CFC] to-[#A78BFA] flex items-center justify-center flex-shrink-0">
            <span class="text-xl font-bold text-white">
              {{ paciente.nome.split(' ').map(n => n[0]).slice(0, 2).join('') }}
            </span>
          </div>
          <div class="flex-1">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 class="text-xl font-bold text-[#1E293B]">{{ paciente.nome }}</h1>
                <p class="text-sm text-[#64748B]">{{ age(paciente.dataNascimento) }} anos · CPF: {{ paciente.cpf }}</p>
              </div>
              <div class="flex gap-2">
                <BaseBadge :variant="paciente.ativo ? 'success' : 'neutral'" dot>
                  {{ paciente.ativo ? 'Ativo' : 'Inativo' }}
                </BaseBadge>
                <BaseButton size="sm" variant="outline" @click="router.push(`/pacientes/${id}/editar`)">
                  <Pencil :size="14" /> Editar
                </BaseButton>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="flex items-center gap-2 text-sm text-[#64748B]">
                <Phone :size="14" class="text-[#94A3B8]" />
                {{ paciente.telefone }}
              </div>
              <div class="flex items-center gap-2 text-sm text-[#64748B]">
                <Mail :size="14" class="text-[#94A3B8]" />
                {{ paciente.email }}
              </div>
              <div v-if="paciente.endereco" class="flex items-center gap-2 text-sm text-[#64748B]">
                <MapPin :size="14" class="text-[#94A3B8]" />
                {{ paciente.endereco }}
              </div>
            </div>

            <div v-if="paciente.observacoes" class="mt-3 p-3 bg-[#F8FAFC] rounded-lg text-sm text-[#64748B]">
              {{ paciente.observacoes }}
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4">
        <BaseCard padding="sm" class="text-center">
          <p class="text-2xl font-bold text-[#7C5CFC]">{{ consultas.length }}</p>
          <p class="text-xs text-[#64748B] mt-0.5">Consultas</p>
        </BaseCard>
        <BaseCard padding="sm" class="text-center">
          <p class="text-2xl font-bold text-[#7C5CFC]">{{ prontuarios.length }}</p>
          <p class="text-xs text-[#64748B] mt-0.5">Prontuários</p>
        </BaseCard>
        <BaseCard padding="sm" class="text-center">
          <p class="text-2xl font-bold text-[#7C5CFC]">
            {{ consultas.filter(c => c.status === 'realizada').length }}
          </p>
          <p class="text-xs text-[#64748B] mt-0.5">Realizadas</p>
        </BaseCard>
      </div>

      <!-- Consultas -->
      <BaseCard padding="none">
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
          <h2 class="text-base font-semibold text-[#1E293B] flex items-center gap-2">
            <Calendar :size="16" class="text-[#7C5CFC]" /> Consultas recentes
          </h2>
          <RouterLink to="/agenda" class="text-sm text-[#7C5CFC] hover:underline">Ver agenda</RouterLink>
        </div>
        <div v-if="consultas.length === 0" class="px-6 py-8 text-center text-sm text-[#64748B]">
          Nenhuma consulta registrada
        </div>
        <ul v-else class="divide-y divide-[#F8FAFC]">
          <li v-for="c in consultas" :key="c.id" class="flex items-center justify-between px-6 py-3">
            <div>
              <p class="text-sm font-medium text-[#1E293B]">{{ c.titulo }}</p>
              <p class="text-xs text-[#64748B]">{{ fmt(c.data) }} · {{ c.horaInicio }}–{{ c.horaFim }}</p>
            </div>
            <BaseBadge :variant="statusMap[c.status]?.variant ?? 'neutral'" size="sm">
              {{ statusMap[c.status]?.label }}
            </BaseBadge>
          </li>
        </ul>
      </BaseCard>

      <!-- Prontuários -->
      <BaseCard padding="none">
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
          <h2 class="text-base font-semibold text-[#1E293B] flex items-center gap-2">
            <FileText :size="16" class="text-[#7C5CFC]" /> Prontuário
          </h2>
          <RouterLink to="/prontuarios" class="text-sm text-[#7C5CFC] hover:underline">Ver todos</RouterLink>
        </div>
        <div v-if="prontuarios.length === 0" class="px-6 py-8 text-center text-sm text-[#64748B]">
          Nenhuma evolução registrada
        </div>
        <ul v-else class="divide-y divide-[#F8FAFC]">
          <li v-for="p in prontuarios" :key="p.id" class="px-6 py-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <p class="text-sm font-medium text-[#1E293B]">{{ p.titulo }}</p>
                <p class="text-xs text-[#64748B] mt-1 line-clamp-2">{{ p.conteudo }}</p>
              </div>
              <p class="text-xs text-[#94A3B8] flex-shrink-0">{{ fmt(p.createdAt) }}</p>
            </div>
          </li>
        </ul>
      </BaseCard>
    </template>

    <div v-else class="text-center py-16 text-[#64748B]">
      Paciente não encontrado.
    </div>
  </div>
</template>
