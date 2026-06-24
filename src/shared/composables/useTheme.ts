import { ref, computed, watch } from 'vue'

/**
 * Estado global de tema (singleton, compartilhado por toda a aplicação).
 *
 * - `theme` é a preferência do usuário: 'light' | 'dark' | 'system'.
 * - `isDark` é o valor resolvido (considerando o sistema quando 'system').
 * - Aplica/remove a classe `.dark` em <html>, persiste a escolha em localStorage
 *   e acompanha mudanças do tema do sistema operacional em tempo real.
 *
 * A aplicação inicial da classe acontece em um script inline no index.html
 * (antes da renderização) para evitar "flash" de tema claro ao recarregar.
 */

export type Theme = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'ui:theme'

function readStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
  } catch {
    /* ignore */
  }
  return 'system'
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

// ---- estado singleton (criado uma única vez) ----
const theme = ref<Theme>(readStoredTheme())
const systemDark = ref(systemPrefersDark())

const isDark = computed(() =>
  theme.value === 'system' ? systemDark.value : theme.value === 'dark',
)

function applyTheme(dark: boolean) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', (e) => {
    systemDark.value = e.matches
  })

  watch(isDark, (dark) => applyTheme(dark), { immediate: true })

  watch(theme, (value) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, value)
    } catch {
      /* ignore */
    }
  })
}

export function useTheme() {
  function setTheme(value: Theme) {
    theme.value = value
  }

  function toggleTheme() {
    theme.value = isDark.value ? 'light' : 'dark'
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
