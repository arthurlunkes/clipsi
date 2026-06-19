import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'

import App from './App.vue'
import router from './router'
import { seedDatabase } from './infrastructure/database/seed'
import './style.css'

async function bootstrap() {
  await seedDatabase()

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.use(VueApexCharts)
  app.mount('#app')
}

bootstrap()
