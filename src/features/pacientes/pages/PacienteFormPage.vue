<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { pacienteService } from '../services/paciente.service'
import BaseCard from '@/shared/components/ui/BaseCard.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseInput from '@/shared/components/ui/BaseInput.vue'
import BaseTextarea from '@/shared/components/ui/BaseTextarea.vue'
import { ArrowLeft, Save } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const saving = ref(false)

const form = ref({
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  email: '',
  endereco: '',
  observacoes: '',
})

const errors = ref<Record<string, string>>({})

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    const p = await pacienteService.getById(Number(route.params.id))
    if (p) {
      form.value = {
        nome: p.nome,
        cpf: p.cpf,
        dataNascimento: p.dataNascimento,
        telefone: p.telefone,
        email: p.email,
        endereco: p.endereco ?? '',
        observacoes: p.observacoes ?? '',
      }
    }
    loading.value = false
  }
})

function validate() {
  errors.value = {}
  if (!form.value.nome.trim()) errors.value.nome = 'Nome é obrigatório'
  if (!form.value.cpf.trim()) errors.value.cpf = 'CPF é obrigatório'
  if (!form.value.dataNascimento) errors.value.dataNascimento = 'Data de nascimento é obrigatória'
  if (!form.value.telefone.trim()) errors.value.telefone = 'Telefone é obrigatório'
  if (!form.value.email.trim()) errors.value.email = 'E-mail é obrigatório'
  else if (!/\S+@\S+\.\S+/.test(form.value.email)) errors.value.email = 'E-mail inválido'
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  saving.value = true
  try {
    if (isEdit.value) {
      await pacienteService.update(Number(route.params.id), form.value)
    } else {
      await pacienteService.create(form.value)
    }
    router.push('/pacientes')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-4 lg:p-6 max-w-2xl mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.back()" class="p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors" aria-label="Voltar">
        <ArrowLeft :size="20" />
      </button>
      <div>
        <h1 class="text-lg font-semibold text-[#1E293B]">{{ isEdit ? 'Editar Paciente' : 'Novo Paciente' }}</h1>
        <p class="text-sm text-[#64748B]">{{ isEdit ? 'Atualize os dados do paciente' : 'Preencha os dados para cadastrar' }}</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" novalidate>
      <div class="space-y-4">
        <BaseCard padding="md">
          <h2 class="text-sm font-semibold text-[#1E293B] mb-4">Dados pessoais</h2>
          <div class="space-y-4">
            <BaseInput id="nome" v-model="form.nome" label="Nome completo" placeholder="Ex: Ana Clara Souza" :error="errors.nome" required />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput id="cpf" v-model="form.cpf" label="CPF" placeholder="000.000.000-00" :error="errors.cpf" required />
              <BaseInput id="dataNascimento" v-model="form.dataNascimento" type="date" label="Data de nascimento" :error="errors.dataNascimento" required />
            </div>
          </div>
        </BaseCard>

        <BaseCard padding="md">
          <h2 class="text-sm font-semibold text-[#1E293B] mb-4">Contato</h2>
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput id="telefone" v-model="form.telefone" label="Telefone" placeholder="(11) 99999-9999" :error="errors.telefone" required />
              <BaseInput id="email" v-model="form.email" type="email" label="E-mail" placeholder="email@exemplo.com" :error="errors.email" required />
            </div>
            <BaseInput id="endereco" v-model="form.endereco" label="Endereço" placeholder="Rua, número, bairro, cidade" />
          </div>
        </BaseCard>

        <BaseCard padding="md">
          <h2 class="text-sm font-semibold text-[#1E293B] mb-4">Observações</h2>
          <BaseTextarea id="observacoes" v-model="form.observacoes" placeholder="Anotações adicionais sobre o paciente..." :rows="3" />
        </BaseCard>

        <div class="flex gap-3 justify-end">
          <BaseButton variant="outline" type="button" @click="router.back()">Cancelar</BaseButton>
          <BaseButton type="submit" :loading="saving">
            <Save :size="16" />
            {{ isEdit ? 'Salvar alterações' : 'Cadastrar paciente' }}
          </BaseButton>
        </div>
      </div>
    </form>
  </div>
</template>
