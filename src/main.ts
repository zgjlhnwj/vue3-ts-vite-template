// src/main.ts
import { createApp } from 'vue'
import router from './router'
import pinia from './store' // 新增：导入Pinia实例
import './assets/styles/reset.scss'
import './main.scss'
import App from './App.vue'

createApp(App)
  .use(router)
  .use(pinia) // 新增：挂载Pinia
  .mount('#app')