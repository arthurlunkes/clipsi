<script setup lang="ts">
interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium text-[#374151]"
    >
      {{ label }}
      <span v-if="required" class="text-[#EF4444] ml-0.5" aria-hidden="true">*</span>
    </label>

    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
      class="w-full px-3 py-2 text-sm bg-white border rounded-lg transition-colors placeholder-[#94A3B8] text-[#1E293B] disabled:bg-[#F1F5F9] disabled:cursor-not-allowed"
      :class="error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 outline-none' : 'border-[#E2E8F0] focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/20 outline-none'"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <p v-if="error" :id="`${id}-error`" class="text-xs text-[#EF4444]" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="text-xs text-[#64748B]">{{ hint }}</p>
  </div>
</template>
