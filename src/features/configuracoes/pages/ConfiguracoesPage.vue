<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/shared/components/ui/BaseCard.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseInput from '@/shared/components/ui/BaseInput.vue'
import { db } from '@/infrastructure/database/db'
import { seedDatabase } from '@/infrastructure/database/seed'
import { Settings, BrainCircuit, Database, Trash2, RefreshCw } from 'lucide-vue-next'

const geminiKey = ref(import.meta.env.VITE_GEMINI_API_KEY ?? '')
const resetting = ref(false)
const seeding = ref(false)

async function resetDB() {
  if (!confirm('Apagar TODOS os dados? Esta ação não pode ser desfeita.')) return
  resetting.value = true
  await db.delete()
  window.location.reload()
}

async function reseed() {
  if (!confirm('Recriar dados de exemplo? Isso não apagará dados existentes.')) return
  seeding.value = true
  await seedDatabase()
  seeding.value = false
  alert('Dados de exemplo criados com sucesso!')
}
</script>

<template>
  <div class="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">

    <!-- Perfil -->
    <BaseCard padding="md">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-9 h-9 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
          <Settings :size="18" class="text-[#7C5CFC]" />
        </div>
        <h2 class="text-base font-semibold text-[#1E293B]">Perfil profissional</h2>
      </div>
      <div class="space-y-4">
        <BaseInput id="nomePsi" model-value="Dra. Paula Silva" label="Nome completo" disabled />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput id="crpPsi" model-value="CRP 06/12345" label="CRP" disabled />
          <BaseInput id="especialidade" model-value="Psicologia Clínica" label="Especialidade" disabled />
        </div>
        <p class="text-xs text-[#64748B] bg-[#F8FAFC] p-3 rounded-lg">
          Edição de perfil será disponibilizada em uma versão futura do sistema.
        </p>
      </div>
    </BaseCard>

    <!-- IA -->
    <BaseCard padding="md">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-9 h-9 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
          <BrainCircuit :size="18" class="text-[#7C5CFC]" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-[#1E293B]">Integração com IA (Gemini)</h2>
          <p class="text-xs text-[#64748B]">Para resumos automáticos de acolhimento e prontuário</p>
        </div>
      </div>

      <div class="space-y-3">
        <BaseInput
          id="geminiKey"
          v-model="geminiKey"
          type="password"
          label="Chave da API Gemini"
          placeholder="AIza..."
          hint="Configure VITE_GEMINI_API_KEY no arquivo .env para persistir"
        />
        <div class="p-3 bg-[#FEF3C7] rounded-lg text-xs text-[#92400E]">
          <strong>Nota de segurança:</strong> A chave inserida aqui é salva apenas na sessão atual. Para uso permanente, adicione ao arquivo <code class="bg-[#FDE68A] px-1 rounded">.env</code> como <code class="bg-[#FDE68A] px-1 rounded">VITE_GEMINI_API_KEY=sua_chave</code>
        </div>
      </div>
    </BaseCard>

    <!-- Banco de dados -->
    <BaseCard padding="md">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-9 h-9 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
          <Database :size="18" class="text-[#DC2626]" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-[#1E293B]">Banco de dados local</h2>
          <p class="text-xs text-[#64748B]">Os dados são armazenados no IndexedDB do seu navegador</p>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row gap-3">
          <BaseButton variant="outline" size="sm" :loading="seeding" @click="reseed" class="flex-1">
            <RefreshCw :size="14" /> Recriar dados de exemplo
          </BaseButton>
          <BaseButton variant="danger" size="sm" :loading="resetting" @click="resetDB" class="flex-1">
            <Trash2 :size="14" /> Apagar todos os dados
          </BaseButton>
        </div>
        <p class="text-xs text-[#94A3B8]">
          Os dados são armazenados localmente no navegador e não são enviados para servidores externos.
          Limpar o cache do navegador apagará todos os dados.
        </p>
      </div>
    </BaseCard>

    <!-- Sobre -->
    <BaseCard padding="md">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-[#7C5CFC] rounded-2xl flex items-center justify-center mx-auto">
          <BrainCircuit :size="24" class="text-white" />
        </div>
        <h3 class="text-base font-bold text-[#1E293B]">Clínica Psi</h3>
        <p class="text-sm text-[#64748B]">Sistema de Gestão Psicológica</p>
        <p class="text-xs text-[#94A3B8]">v1.0.0 · Trabalho acadêmico — Composição e Projeto Gráfico</p>
        <p class="text-xs text-[#94A3B8]">Desenvolvido com Vue 3 + TypeScript + Tailwind CSS + IndexedDB</p>
      </div>
    </BaseCard>

  </div>
</template>
