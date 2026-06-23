<script setup lang="ts">
import AppSidebar from './app/AppSidebar.vue'
import AppHeader from './app/AppHeader.vue'
import AppBottomNav from './app/AppBottomNav.vue'
import { useLayout } from './shared/composables/useLayout'

const { shellWidth, isResizing, toggleSidebar } = useLayout()
</script>

<template>
  <div class="min-h-screen" :style="{ '--sidebar-w': shellWidth + 'px' }">
    <AppSidebar />
    <AppHeader @toggle-sidebar="toggleSidebar" />

    <main
      class="pt-16 pb-20 lg:pb-6 min-h-screen lg:ml-(--sidebar-w)"
      :class="isResizing ? '' : 'transition-[margin] duration-300 ease-out'"
      id="main-content"
    >
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <AppBottomNav />
  </div>
</template>
