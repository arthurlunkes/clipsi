import { ref, computed, watch } from 'vue'

/**
 * Estado global de layout (singleton, compartilhado entre App, Sidebar e Header).
 * Persiste largura/colapso da sidebar em localStorage.
 */

export const SIDEBAR_COLLAPSED_WIDTH = 76
export const SIDEBAR_MIN_WIDTH = 208
export const SIDEBAR_MAX_WIDTH = 384
export const SIDEBAR_DEFAULT_WIDTH = 256

const KEY_COLLAPSED = 'ui:sidebar-collapsed'
const KEY_WIDTH = 'ui:sidebar-width'

function clampWidth(n: number) {
  if (!Number.isFinite(n)) return SIDEBAR_DEFAULT_WIDTH
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, Math.round(n)))
}

function readBool(key: string) {
  try {
    return localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

function readWidth() {
  try {
    return clampWidth(Number(localStorage.getItem(KEY_WIDTH)))
  } catch {
    return SIDEBAR_DEFAULT_WIDTH
  }
}

// ---- estado singleton (criado uma única vez) ----
const sidebarOpen = ref(false) // drawer no mobile
const sidebarCollapsed = ref(readBool(KEY_COLLAPSED)) // modo só-ícones no desktop
const sidebarWidth = ref(readWidth()) // largura expandida (px)
const isResizing = ref(false)
const isDesktop = ref(true)

if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(min-width: 1024px)')
  isDesktop.value = mq.matches
  mq.addEventListener('change', (e) => {
    isDesktop.value = e.matches
    if (!e.matches) sidebarOpen.value = false // fecha drawer ao voltar pro desktop
  })

  watch(sidebarCollapsed, (v) => {
    try {
      localStorage.setItem(KEY_COLLAPSED, String(v))
    } catch {
      /* ignore */
    }
  })

  watch(sidebarWidth, (v) => {
    try {
      localStorage.setItem(KEY_WIDTH, String(v))
    } catch {
      /* ignore */
    }
  })
}

// colapso só faz sentido no desktop
const collapsed = computed(() => isDesktop.value && sidebarCollapsed.value)

// largura que o "shell" (header + conteúdo) deve reservar à esquerda
const shellWidth = computed(() => (collapsed.value ? SIDEBAR_COLLAPSED_WIDTH : sidebarWidth.value))

export function useLayout() {
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }
  function closeSidebar() {
    sidebarOpen.value = false
  }
  function toggleCollapsed() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  function setSidebarWidth(px: number) {
    sidebarWidth.value = clampWidth(px)
  }
  function resetSidebarWidth() {
    sidebarWidth.value = SIDEBAR_DEFAULT_WIDTH
  }

  return {
    // estado
    sidebarOpen,
    sidebarCollapsed,
    sidebarWidth,
    isResizing,
    isDesktop,
    collapsed,
    shellWidth,
    // constantes
    SIDEBAR_COLLAPSED_WIDTH,
    SIDEBAR_MIN_WIDTH,
    SIDEBAR_MAX_WIDTH,
    SIDEBAR_DEFAULT_WIDTH,
    // ações
    toggleSidebar,
    closeSidebar,
    toggleCollapsed,
    setSidebarWidth,
    resetSidebarWidth,
  }
}
