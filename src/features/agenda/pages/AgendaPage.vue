<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import ptBRLocale from '@fullcalendar/core/locales/pt-br'
import { consultaService } from '../services/consulta.service'
import { pacienteService } from '@/features/pacientes/services/paciente.service'
import type { Consulta, ConsultaFormData } from '../types'
import type { Paciente } from '@/features/pacientes/types'
import BaseModal from '@/shared/components/ui/BaseModal.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseInput from '@/shared/components/ui/BaseInput.vue'
import BaseSelect from '@/shared/components/ui/BaseSelect.vue'
import BaseTextarea from '@/shared/components/ui/BaseTextarea.vue'
import BaseBadge from '@/shared/components/ui/BaseBadge.vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const consultas = ref<Consulta[]>([])
const pacientes = ref<Paciente[]>([])
const showModal = ref(false)
const showDetail = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const selectedConsulta = ref<Consulta | null>(null)

const form = ref<ConsultaFormData>({
  pacienteId: 0,
  titulo: '',
  data: format(new Date(), 'yyyy-MM-dd'),
  horaInicio: '09:00',
  horaFim: '10:00',
  status: 'agendada',
  tipo: 'acompanhamento',
  valor: 200,
  observacoes: '',
})

const errors = ref<Record<string, string>>({})

const events = computed(() => consultas.value.map(c => ({
  id: String(c.id),
  title: c.pacienteNome ?? c.titulo,
  start: `${c.data}T${c.horaInicio}`,
  end: `${c.data}T${c.horaFim}`,
  backgroundColor: statusColors[c.status] ?? '#7C5CFC',
  borderColor: 'transparent',
  extendedProps: { consulta: c },
})))

const statusColors: Record<string, string> = {
  agendada: '#7C5CFC',
  confirmada: '#22C55E',
  realizada: '#64748B',
  cancelada: '#EF4444',
  falta: '#F59E0B',
}

const pacienteOptions = computed(() => pacientes.value.map(p => ({ label: p.nome, value: p.id! })))

const statusOptions = [
  { label: 'Agendada', value: 'agendada' },
  { label: 'Confirmada', value: 'confirmada' },
  { label: 'Realizada', value: 'realizada' },
  { label: 'Cancelada', value: 'cancelada' },
  { label: 'Falta', value: 'falta' },
]

const tipoOptions = [
  { label: 'Acompanhamento', value: 'acompanhamento' },
  { label: 'Avaliação', value: 'avaliacao' },
  { label: 'Terapia', value: 'terapia' },
  { label: 'Retorno', value: 'retorno' },
]

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  locale: ptBRLocale,
  initialView: window.innerWidth < 768 ? 'listWeek' : 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  events: events.value,
  selectable: true,
  editable: false,
  height: 'auto',
  allDaySlot: false,
  slotMinTime: '07:00:00',
  slotMaxTime: '21:00:00',
  slotDuration: '00:30:00',
  businessHours: { daysOfWeek: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '18:00' },
  select: handleDateSelect,
  eventClick: handleEventClick,
  buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia', list: 'Lista' },
}))

async function load() {
  const [c, p] = await Promise.all([consultaService.getAll(), pacienteService.getAll()])
  consultas.value = c
  pacientes.value = p
}

function handleDateSelect(info: any) {
  form.value = {
    pacienteId: 0,
    titulo: 'Sessão de Psicoterapia',
    data: info.startStr.split('T')[0],
    horaInicio: info.startStr.split('T')[1]?.slice(0, 5) ?? '09:00',
    horaFim: info.endStr?.split('T')[1]?.slice(0, 5) ?? '10:00',
    status: 'agendada',
    tipo: 'acompanhamento',
    valor: 200,
    observacoes: '',
  }
  editingId.value = null
  errors.value = {}
  showModal.value = true
}

function handleEventClick(info: any) {
  selectedConsulta.value = info.event.extendedProps.consulta
  showDetail.value = true
}

function openNew() {
  form.value = {
    pacienteId: 0,
    titulo: 'Sessão de Psicoterapia',
    data: format(new Date(), 'yyyy-MM-dd'),
    horaInicio: '09:00',
    horaFim: '10:00',
    status: 'agendada',
    tipo: 'acompanhamento',
    valor: 200,
    observacoes: '',
  }
  editingId.value = null
  errors.value = {}
  showModal.value = true
}

function openEdit(c: Consulta) {
  form.value = {
    pacienteId: c.pacienteId,
    titulo: c.titulo,
    data: c.data,
    horaInicio: c.horaInicio,
    horaFim: c.horaFim,
    status: c.status,
    tipo: c.tipo,
    valor: c.valor,
    observacoes: c.observacoes ?? '',
  }
  editingId.value = c.id!
  errors.value = {}
  showDetail.value = false
  showModal.value = true
}

function validate() {
  errors.value = {}
  if (!form.value.pacienteId) errors.value.pacienteId = 'Selecione um paciente'
  if (!form.value.data) errors.value.data = 'Data é obrigatória'
  if (!form.value.horaInicio) errors.value.horaInicio = 'Hora início obrigatória'
  if (!form.value.horaFim) errors.value.horaFim = 'Hora fim obrigatória'
  return Object.keys(errors.value).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    const paciente = pacientes.value.find(p => p.id === Number(form.value.pacienteId))
    const data = { ...form.value, pacienteId: Number(form.value.pacienteId), pacienteNome: paciente?.nome }

    if (editingId.value) {
      await consultaService.update(editingId.value, data)
    } else {
      await consultaService.create(data)
    }
    await load()
    showModal.value = false
  } finally {
    saving.value = false
  }
}

async function deleteConsulta() {
  if (!selectedConsulta.value?.id) return
  await consultaService.remove(selectedConsulta.value.id)
  await load()
  showDetail.value = false
}

const statusMap: Record<string, { label: string; variant: any }> = {
  agendada: { label: 'Agendada', variant: 'neutral' },
  confirmada: { label: 'Confirmada', variant: 'success' },
  realizada: { label: 'Realizada', variant: 'info' },
  cancelada: { label: 'Cancelada', variant: 'danger' },
  falta: { label: 'Falta', variant: 'warning' },
}

function fmtDate(d: string) {
  try { return format(parseISO(d), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) } catch { return d }
}

onMounted(load)
</script>

<template>
  <div class="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">

    <div class="flex items-center justify-between">
      <p class="text-sm text-[#64748B]">Gerencie seus agendamentos</p>
      <BaseButton size="md" @click="openNew">
        <Plus :size="16" /> Nova consulta
      </BaseButton>
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 lg:p-5">
      <FullCalendar :options="calendarOptions" />
    </div>

    <!-- Detail modal -->
    <BaseModal :open="showDetail" title="Detalhes da consulta" size="md" @close="showDetail = false">
      <div v-if="selectedConsulta" class="space-y-4">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-base font-semibold text-[#1E293B]">{{ selectedConsulta.titulo }}</h3>
            <p class="text-sm text-[#64748B]">{{ selectedConsulta.pacienteNome }}</p>
          </div>
          <BaseBadge :variant="statusMap[selectedConsulta.status]?.variant" dot>
            {{ statusMap[selectedConsulta.status]?.label }}
          </BaseBadge>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="bg-[#F8FAFC] p-3 rounded-lg">
            <p class="text-xs text-[#64748B] mb-1">Data</p>
            <p class="font-medium text-[#1E293B]">{{ fmtDate(selectedConsulta.data) }}</p>
          </div>
          <div class="bg-[#F8FAFC] p-3 rounded-lg">
            <p class="text-xs text-[#64748B] mb-1">Horário</p>
            <p class="font-medium text-[#1E293B]">{{ selectedConsulta.horaInicio }} – {{ selectedConsulta.horaFim }}</p>
          </div>
          <div class="bg-[#F8FAFC] p-3 rounded-lg">
            <p class="text-xs text-[#64748B] mb-1">Tipo</p>
            <p class="font-medium text-[#1E293B] capitalize">{{ selectedConsulta.tipo }}</p>
          </div>
          <div v-if="selectedConsulta.valor" class="bg-[#F8FAFC] p-3 rounded-lg">
            <p class="text-xs text-[#64748B] mb-1">Valor</p>
            <p class="font-medium text-[#1E293B]">{{ selectedConsulta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</p>
          </div>
        </div>

        <div v-if="selectedConsulta.observacoes" class="text-sm text-[#64748B] bg-[#F8FAFC] p-3 rounded-lg">
          {{ selectedConsulta.observacoes }}
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2 justify-between">
          <BaseButton variant="danger" size="sm" @click="deleteConsulta">
            <Trash2 :size="14" /> Cancelar consulta
          </BaseButton>
          <BaseButton size="sm" @click="selectedConsulta && openEdit(selectedConsulta)">
            <Pencil :size="14" /> Editar
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Form modal -->
    <BaseModal :open="showModal" :title="editingId ? 'Editar consulta' : 'Nova consulta'" size="lg" @close="showModal = false">
      <form @submit.prevent="save" class="space-y-4" novalidate>
        <BaseSelect
          id="pacienteId"
          v-model="form.pacienteId"
          label="Paciente"
          :options="pacienteOptions"
          placeholder="Selecione o paciente"
          :error="errors.pacienteId"
          required
        />

        <BaseInput id="titulo" v-model="form.titulo" label="Título" placeholder="Ex: Sessão de psicoterapia" />

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BaseInput id="data" v-model="form.data" type="date" label="Data" :error="errors.data" required />
          <BaseInput id="horaInicio" v-model="form.horaInicio" type="time" label="Hora início" :error="errors.horaInicio" required />
          <BaseInput id="horaFim" v-model="form.horaFim" type="time" label="Hora fim" :error="errors.horaFim" required />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BaseSelect id="tipo" v-model="form.tipo" label="Tipo" :options="tipoOptions" />
          <BaseSelect id="status" v-model="form.status" label="Status" :options="statusOptions" />
          <BaseInput id="valor" v-model="form.valor" type="number" label="Valor (R$)" />
        </div>

        <BaseTextarea id="observacoes" v-model="form.observacoes" label="Observações" :rows="2" />
      </form>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="outline" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton :loading="saving" @click="save">
            {{ editingId ? 'Salvar' : 'Agendar' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

  </div>
</template>
