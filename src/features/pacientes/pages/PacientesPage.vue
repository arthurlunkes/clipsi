<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePacientes } from '../composables/usePacientes'
import BaseCard from '@/shared/components/ui/BaseCard.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseInput from '@/shared/components/ui/BaseInput.vue'
import BaseBadge from '@/shared/components/ui/BaseBadge.vue'
import BasePagination from '@/shared/components/ui/BasePagination.vue'
import BaseModal from '@/shared/components/ui/BaseModal.vue'
import BaseEmptyState from '@/shared/components/ui/BaseEmptyState.vue'
import SkeletonLoader from '@/shared/components/ui/SkeletonLoader.vue'
import { UserPlus, Search, Eye, Pencil, Trash2, Users } from 'lucide-vue-next'
import { format, parseISO, differenceInYears } from 'date-fns'

const router = useRouter()
const { loading, search, currentPage, totalPages, paginated, filtered, remove } = usePacientes()

const confirmDelete = ref<number | null>(null)
const deleting = ref(false)

async function handleDelete() {
  if (!confirmDelete.value) return
  deleting.value = true
  await remove(confirmDelete.value)
  confirmDelete.value = null
  deleting.value = false
}

function age(dataNascimento: string) {
  try { return differenceInYears(new Date(), parseISO(dataNascimento)) } catch { return '-' }
}
</script>

<template>
  <div class="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="flex-1 relative">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          v-model="search"
          placeholder="Buscar por nome, CPF ou e-mail..."
          class="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/20 outline-none placeholder-[#94A3B8]"
          aria-label="Buscar pacientes"
        />
      </div>
      <BaseButton @click="router.push('/pacientes/novo')" size="md">
        <UserPlus :size="16" />
        Novo Paciente
      </BaseButton>
    </div>

    <!-- Table card -->
    <BaseCard padding="none">
      <!-- Mobile cards -->
      <div class="lg:hidden divide-y divide-[#F8FAFC]">
        <div v-if="loading" class="p-4 space-y-4">
          <SkeletonLoader v-for="i in 4" :key="i" :lines="3" height="h-4" />
        </div>

        <BaseEmptyState
          v-else-if="paginated.length === 0"
          title="Nenhum paciente encontrado"
          :description="search ? 'Tente buscar com outros termos.' : 'Cadastre o primeiro paciente clicando em Novo Paciente.'"
        >
          <template #icon>
            <Users :size="32" class="text-[#94A3B8]" />
          </template>
          <template #action>
            <BaseButton @click="router.push('/pacientes/novo')">
              <UserPlus :size="16" /> Novo Paciente
            </BaseButton>
          </template>
        </BaseEmptyState>

        <div
          v-else
          v-for="p in paginated"
          :key="p.id"
          class="p-4 flex items-center gap-3"
        >
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#A78BFA] flex items-center justify-center flex-shrink-0">
            <span class="text-xs font-bold text-white">{{ p.nome.split(' ').map(n => n[0]).slice(0, 2).join('') }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[#1E293B] truncate">{{ p.nome }}</p>
            <p class="text-xs text-[#64748B]">{{ p.telefone }}</p>
            <p class="text-xs text-[#64748B]">{{ age(p.dataNascimento) }} anos</p>
          </div>
          <div class="flex items-center gap-1">
            <RouterLink :to="`/pacientes/${p.id}`">
              <button class="p-2 text-[#64748B] hover:text-[#7C5CFC] hover:bg-[#EDE9FE] rounded-lg transition-colors" aria-label="Ver perfil">
                <Eye :size="16" />
              </button>
            </RouterLink>
            <button @click="confirmDelete = p.id!" class="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors" aria-label="Excluir">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop table -->
      <div class="hidden lg:block overflow-x-auto">
        <table class="w-full" aria-label="Lista de pacientes">
          <thead>
            <tr class="border-b border-[#F1F5F9]">
              <th class="text-left px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Paciente</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">CPF</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Idade</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Telefone</th>
              <th class="text-left px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Status</th>
              <th class="text-right px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F8FAFC]">
            <template v-if="loading">
              <tr v-for="i in 5" :key="i">
                <td v-for="j in 6" :key="j" class="px-6 py-4">
                  <SkeletonLoader :lines="1" height="h-4" />
                </td>
              </tr>
            </template>

            <tr v-else-if="paginated.length === 0">
              <td colspan="6">
                <BaseEmptyState
                  title="Nenhum paciente encontrado"
                  :description="search ? 'Tente buscar com outros termos.' : 'Cadastre o primeiro paciente.'"
                />
              </td>
            </tr>

            <tr
              v-else
              v-for="p in paginated"
              :key="p.id"
              class="hover:bg-[#F8FAFC] transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#A78BFA] flex items-center justify-center flex-shrink-0">
                    <span class="text-xs font-bold text-white">{{ p.nome.split(' ').map(n => n[0]).slice(0, 2).join('') }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-[#1E293B]">{{ p.nome }}</p>
                    <p class="text-xs text-[#64748B]">{{ p.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-[#64748B]">{{ p.cpf }}</td>
              <td class="px-6 py-4 text-sm text-[#64748B]">{{ age(p.dataNascimento) }} anos</td>
              <td class="px-6 py-4 text-sm text-[#64748B]">{{ p.telefone }}</td>
              <td class="px-6 py-4">
                <BaseBadge :variant="p.ativo ? 'success' : 'neutral'" dot>
                  {{ p.ativo ? 'Ativo' : 'Inativo' }}
                </BaseBadge>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-1">
                  <RouterLink :to="`/pacientes/${p.id}`">
                    <button class="p-2 text-[#64748B] hover:text-[#7C5CFC] hover:bg-[#EDE9FE] rounded-lg transition-colors" aria-label="Ver perfil">
                      <Eye :size="16" />
                    </button>
                  </RouterLink>
                  <RouterLink :to="`/pacientes/${p.id}/editar`">
                    <button class="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] rounded-lg transition-colors" aria-label="Editar">
                      <Pencil :size="16" />
                    </button>
                  </RouterLink>
                  <button @click="confirmDelete = p.id!" class="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors" aria-label="Excluir">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && filtered.length > 10" class="px-6 py-4 border-t border-[#F1F5F9]">
        <BasePagination
          v-model:current-page="currentPage"
          :total-pages="totalPages"
          :total-items="filtered.length"
          :items-per-page="10"
        />
      </div>
    </BaseCard>

    <!-- Delete modal -->
    <BaseModal :open="!!confirmDelete" title="Excluir paciente" size="sm" @close="confirmDelete = null">
      <p class="text-sm text-[#64748B]">
        Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita e todos os dados associados serão perdidos.
      </p>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="outline" @click="confirmDelete = null">Cancelar</BaseButton>
          <BaseButton variant="danger" :loading="deleting" @click="handleDelete">Excluir</BaseButton>
        </div>
      </template>
    </BaseModal>

  </div>
</template>
