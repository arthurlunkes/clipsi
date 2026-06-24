<script setup lang="ts">
interface Option {
  label: string
  value: string | number
}

interface Props {
  modelValue?: string | number
  label?: string
  options: Option[]
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

withDefaults(defineProps<Props>(), {
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

    <select
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :aria-invalid="!!error"
      class="w-full px-3 py-2 text-sm bg-white border rounded-lg transition-colors text-[#1E293B] disabled:bg-[#F1F5F9] disabled:cursor-not-allowed appearance-none cursor-pointer"
      :class="
        error
          ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 outline-none'
          : 'border-[#E2E8F0] focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/20 outline-none'
      "
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled :selected="!modelValue">
        {{ placeholder }}
      </option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>

    <p v-if="error" class="text-xs text-[#EF4444]" role="alert">{{ error }}</p>
  </div>
</template>
