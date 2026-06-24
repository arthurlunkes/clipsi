<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Calendar as CalendarIcon,
  List,
  Clock,
  CheckCircle2,
  User,
  Tag,
  DollarSign,
} from 'lucide-vue-next'
import { format, parseISO, isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const consultas = ref<Consulta[]>([])
const pacientes = ref<Paciente[]>([])
const showModal = ref(false)
const showDetail = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const selectedConsulta = ref<Consulta | null>(null)

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const initialView =
  typeof window !== 'undefined' && window.innerWidth < 768 ? 'listWeek' : 'timeGridWeek'
const currentView = ref(initialView)
const currentTitle = ref('')

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

const statusColors: Record<string, string> = {
  agendada: '#7C5CFC',
  confirmada: '#22C55E',
  realizada: '#64748B',
  cancelada: '#EF4444',
  falta: '#F59E0B',
}

const events = computed(() =>
  consultas.value.map((c) => ({
    id: String(c.id),
    title: c.pacienteNome ?? c.titulo,
    start: `${c.data}T${c.horaInicio}`,
    end: `${c.data}T${c.horaFim}`,
    backgroundColor: statusColors[c.status] ?? '#7C5CFC',
    borderColor: 'transparent',
    editable: c.status !== 'cancelada' && c.status !== 'realizada',
    extendedProps: { consulta: c },
  })),
)

const pacienteOptions = computed(() =>
  pacientes.value.map((p) => ({ label: p.nome, value: p.id! })),
)

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

const viewOptions = [
  { label: 'Mês', value: 'dayGridMonth', icon: CalendarDays },
  { label: 'Semana', value: 'timeGridWeek', icon: CalendarRange },
  { label: 'Dia', value: 'timeGridDay', icon: CalendarIcon },
  { label: 'Lista', value: 'listWeek', icon: List },
]

const legend = [
  { label: 'Agendada', color: '#7C5CFC' },
  { label: 'Confirmada', color: '#22C55E' },
  { label: 'Realizada', color: '#64748B' },
  { label: 'Falta', color: '#F59E0B' },
  { label: 'Cancelada', color: '#EF4444' },
]

const stats = computed(() => {
  const now = new Date()
  const start = startOfWeek(now, { weekStartsOn: 0 })
  const end = endOfWeek(now, { weekStartsOn: 0 })
  let hoje = 0,
    semana = 0,
    confirmadas = 0,
    pendentes = 0
  for (const c of consultas.value) {
    let d: Date
    try {
      d = parseISO(c.data)
    } catch {
      continue
    }
    if (isToday(d)) hoje++
    if (isWithinInterval(d, { start, end })) {
      semana++
      if (c.status === 'confirmada') confirmadas++
      if (c.status === 'agendada') pendentes++
    }
  }
  return { hoje, semana, confirmadas, pendentes }
})

const statCards = computed(() => [
  {
    label: 'Consultas hoje',
    value: stats.value.hoje,
    icon: CalendarClock,
    from: '#8B5CF6',
    to: '#6366F1',
  },
  {
    label: 'Esta semana',
    value: stats.value.semana,
    icon: CalendarDays,
    from: '#3B82F6',
    to: '#2563EB',
  },
  {
    label: 'Confirmadas',
    value: stats.value.confirmadas,
    icon: CheckCircle2,
    from: '#22C55E',
    to: '#16A34A',
  },
  { label: 'Pendentes', value: stats.value.pendentes, icon: Clock, from: '#F59E0B', to: '#D97706' },
])

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  locale: ptBRLocale,
  initialView,
  headerToolbar: false as const,
  events: events.value,
  selectable: true,
  editable: true,
  eventStartEditable: true,
  eventDurationEditable: true,
  nowIndicator: true,
  dayMaxEvents: true,
  height: 'auto',
  allDaySlot: false,
  slotMinTime: '07:00:00',
  slotMaxTime: '21:00:00',
  slotDuration: '00:30:00',
  slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false } as const,
  eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false } as const,
  businessHours: { daysOfWeek: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '18:00' },
  select: handleDateSelect,
  eventClick: handleEventClick,
  datesSet: handleDatesSet,
  eventDrop: persistMove,
  eventResize: persistMove,
}))

// ---- toolbar / navegação ----
function api() {
  return calendarRef.value?.getApi()
}
function goPrev() {
  api()?.prev()
}
function goNext() {
  api()?.next()
}
function goToday() {
  api()?.today()
}
function setView(v: string) {
  api()?.changeView(v)
}

function handleDatesSet(arg: any) {
  currentTitle.value = arg.view.title
  currentView.value = arg.view.type
}

async function load() {
  const [c, p] = await Promise.all([consultaService.getAll(), pacienteService.getAll()])
  consultas.value = c
  pacientes.value = p
}

// ---- drag & drop / resize ----
async function persistMove(info: any) {
  const c: Consulta = info.event.extendedProps.consulta
  const start: Date | null = info.event.start
  const end: Date | null = info.event.end
  if (!c?.id || !start) {
    info.revert?.()
    return
  }
  try {
    await consultaService.update(c.id, {
      ...c,
      data: format(start, 'yyyy-MM-dd'),
      horaInicio: format(start, 'HH:mm'),
      horaFim: end ? format(end, 'HH:mm') : c.horaFim,
    })
    await load()
  } catch {
    info.revert?.()
  }
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
    const paciente = pacientes.value.find((p) => p.id === Number(form.value.pacienteId))
    const data = {
      ...form.value,
      pacienteId: Number(form.value.pacienteId),
      pacienteNome: paciente?.nome,
    }

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
  try {
    return format(parseISO(d), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return d
  }
}

// ---- responsividade: alterna para Lista no mobile ----
let mql: MediaQueryList | null = null
function onMqChange(e: MediaQueryListEvent) {
  const a = api()
  if (!a) return
  if (e.matches && currentView.value !== 'listWeek') a.changeView('listWeek')
  else if (!e.matches && currentView.value === 'listWeek') a.changeView('timeGridWeek')
}

onMounted(() => {
  load()
  if (typeof window !== 'undefined') {
    mql = window.matchMedia('(max-width: 767px)')
    mql.addEventListener('change', onMqChange)
  }
})
onBeforeUnmount(() => mql?.removeEventListener('change', onMqChange))
</script>

<template>
  <div class="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
    <!-- Resumo -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Resumo da agenda">
      <div
        v-for="(s, i) in statCards"
        :key="s.label"
        class="flex items-center gap-3 rounded-2xl bg-white border border-[#EEF0F7] shadow-(--shadow-card) p-3.5 animate-rise"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_8px_18px_-8px_rgba(16,24,40,0.4)]"
          :style="{ backgroundImage: `linear-gradient(135deg, ${s.from}, ${s.to})` }"
        >
          <component :is="s.icon" :size="18" class="text-white" />
        </div>
        <div class="min-w-0">
          <p class="text-xl font-bold text-[#1E293B] leading-none">{{ s.value }}</p>
          <p class="text-xs text-[#64748B] mt-1 truncate">{{ s.label }}</p>
        </div>
      </div>
    </section>

    <!-- Calendário -->
    <div
      class="bg-white rounded-2xl border border-[#EEF0F7] shadow-(--shadow-card) overflow-hidden"
    >
      <!-- Toolbar custom -->
      <div class="flex flex-col gap-3 p-3 sm:p-4 lg:p-5 border-b border-[#EEF0F7]">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <!-- Navegação + título -->
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="inline-flex items-center rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-soft"
            >
              <button
                @click="goPrev"
                class="p-2 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#7C5CFC] transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft :size="18" />
              </button>
              <button
                @click="goToday"
                class="px-3 py-2 text-sm font-semibold text-[#1E293B] border-x border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
              >
                Hoje
              </button>
              <button
                @click="goNext"
                class="p-2 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#7C5CFC] transition-colors"
                aria-label="Próximo"
              >
                <ChevronRight :size="18" />
              </button>
            </div>
            <h2
              class="text-base lg:text-lg font-bold text-[#1E293B] font-display capitalize truncate"
            >
              {{ currentTitle }}
            </h2>
          </div>

          <!-- Switcher + ação -->
          <div class="flex items-center gap-2">
            <div class="inline-flex p-1 bg-[#F1F5F9] rounded-xl">
              <button
                v-for="v in viewOptions"
                :key="v.value"
                @click="setView(v.value)"
                class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
                :class="
                  currentView === v.value
                    ? 'bg-white text-[#7C5CFC] shadow-soft'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                "
                :aria-pressed="currentView === v.value"
              >
                <component :is="v.icon" :size="15" />
                <span class="hidden sm:inline">{{ v.label }}</span>
              </button>
            </div>
            <BaseButton size="md" @click="openNew" class="flex-shrink-0">
              <Plus :size="16" /> <span class="hidden sm:inline">Nova consulta</span>
            </BaseButton>
          </div>
        </div>

        <!-- Legenda -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span class="text-xs font-medium text-[#94A3B8]">Legenda:</span>
          <span
            v-for="l in legend"
            :key="l.label"
            class="inline-flex items-center gap-1.5 text-xs text-[#64748B]"
          >
            <span
              class="w-2.5 h-2.5 rounded-full"
              :style="{ backgroundColor: l.color }"
              aria-hidden="true"
            />
            {{ l.label }}
          </span>
        </div>
      </div>

      <!-- Calendar -->
      <div class="p-2 sm:p-4 lg:p-5">
        <FullCalendar ref="calendarRef" :options="calendarOptions">
          <template #eventContent="arg">
            <div class="flex items-center gap-1 w-full overflow-hidden leading-tight">
              <span
                v-if="arg.timeText"
                class="text-[11px] font-bold opacity-90 whitespace-nowrap"
                >{{ arg.timeText }}</span
              >
              <span class="text-[11px] font-medium truncate">{{ arg.event.title }}</span>
            </div>
          </template>
        </FullCalendar>
      </div>
    </div>

    <!-- Detail modal -->
    <BaseModal
      :open="showDetail"
      title="Detalhes da consulta"
      size="md"
      @close="showDetail = false"
    >
      <div v-if="selectedConsulta" class="space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-base font-semibold text-[#1E293B] truncate">
              {{ selectedConsulta.titulo }}
            </h3>
            <p class="text-sm text-[#64748B] flex items-center gap-1.5 mt-0.5">
              <User :size="14" /> {{ selectedConsulta.pacienteNome }}
            </p>
          </div>
          <BaseBadge :variant="statusMap[selectedConsulta.status]?.variant" dot>
            {{ statusMap[selectedConsulta.status]?.label }}
          </BaseBadge>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="bg-[#F8FAFC] p-3 rounded-xl border border-[#EEF0F7]">
            <p class="text-xs text-[#94A3B8] mb-1 flex items-center gap-1">
              <CalendarIcon :size="12" /> Data
            </p>
            <p class="font-semibold text-[#1E293B]">{{ fmtDate(selectedConsulta.data) }}</p>
          </div>
          <div class="bg-[#F8FAFC] p-3 rounded-xl border border-[#EEF0F7]">
            <p class="text-xs text-[#94A3B8] mb-1 flex items-center gap-1">
              <Clock :size="12" /> Horário
            </p>
            <p class="font-semibold text-[#1E293B]">
              {{ selectedConsulta.horaInicio }} – {{ selectedConsulta.horaFim }}
            </p>
          </div>
          <div class="bg-[#F8FAFC] p-3 rounded-xl border border-[#EEF0F7]">
            <p class="text-xs text-[#94A3B8] mb-1 flex items-center gap-1">
              <Tag :size="12" /> Tipo
            </p>
            <p class="font-semibold text-[#1E293B] capitalize">{{ selectedConsulta.tipo }}</p>
          </div>
          <div
            v-if="selectedConsulta.valor"
            class="bg-[#F8FAFC] p-3 rounded-xl border border-[#EEF0F7]"
          >
            <p class="text-xs text-[#94A3B8] mb-1 flex items-center gap-1">
              <DollarSign :size="12" /> Valor
            </p>
            <p class="font-semibold text-[#1E293B]">
              {{
                selectedConsulta.valor.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              }}
            </p>
          </div>
        </div>

        <div
          v-if="selectedConsulta.observacoes"
          class="text-sm text-[#64748B] bg-[#F8FAFC] p-3 rounded-xl border border-[#EEF0F7]"
        >
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
    <BaseModal
      :open="showModal"
      :title="editingId ? 'Editar consulta' : 'Nova consulta'"
      size="lg"
      @close="showModal = false"
    >
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

        <BaseInput
          id="titulo"
          v-model="form.titulo"
          label="Título"
          placeholder="Ex: Sessão de psicoterapia"
        />

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BaseInput
            id="data"
            v-model="form.data"
            type="date"
            label="Data"
            :error="errors.data"
            required
          />
          <BaseInput
            id="horaInicio"
            v-model="form.horaInicio"
            type="time"
            label="Hora início"
            :error="errors.horaInicio"
            required
          />
          <BaseInput
            id="horaFim"
            v-model="form.horaFim"
            type="time"
            label="Hora fim"
            :error="errors.horaFim"
            required
          />
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
