<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './app/AppSidebar.vue'
import AppHeader from './app/AppHeader.vue'
import AppBottomNav from './app/AppBottomNav.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC]">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <main class="lg:ml-64 pt-16 pb-20 lg:pb-6 min-h-screen" id="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <AppBottomNav />
  </div>
</template>
