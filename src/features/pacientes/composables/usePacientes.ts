import { ref, computed, watch } from 'vue'
import { pacienteService } from '../services/paciente.service'
import type { Paciente } from '../types'

const PER_PAGE = 10

export function usePacientes() {
  const loading = ref(true)
  const pacientes = ref<Paciente[]>([])
  const search = ref('')
  const currentPage = ref(1)

  const filtered = computed(() => {
    if (!search.value) return pacientes.value
    const q = search.value.toLowerCase()
    return pacientes.value.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) || p.cpf.includes(q) || p.email.toLowerCase().includes(q),
    )
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))

  const paginated = computed(() => {
    const start = (currentPage.value - 1) * PER_PAGE
    return filtered.value.slice(start, start + PER_PAGE)
  })

  watch(search, () => {
    currentPage.value = 1
  })

  async function load() {
    loading.value = true
    try {
      pacientes.value = await pacienteService.getAll()
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    await pacienteService.remove(id)
    pacientes.value = pacientes.value.filter((p) => p.id !== id)
  }

  load()

  return { loading, pacientes, search, currentPage, filtered, totalPages, paginated, load, remove }
}
