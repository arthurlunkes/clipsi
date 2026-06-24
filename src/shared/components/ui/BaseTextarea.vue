<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  rows?: number
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

withDefaults(defineProps<Props>(), {
  rows: 4,
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="id" class="text-sm font-medium text-[#374151]">
      {{ label }}
      <span v-if="required" class="text-[#EF4444] ml-0.5" aria-hidden="true">*</span>
    </label>

    <textarea
      :id="id"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-invalid="!!error"
      class="w-full px-3 py-2 text-sm bg-white border rounded-lg transition-colors placeholder-[#94A3B8] text-[#1E293B] resize-y disabled:bg-[#F1F5F9] disabled:cursor-not-allowed"
      :class="
        error
          ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 outline-none'
          : 'border-[#E2E8F0] focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/20 outline-none'
      "
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <p v-if="error" class="text-xs text-[#EF4444]" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-[#64748B]">{{ hint }}</p>
  </div>
</template>
