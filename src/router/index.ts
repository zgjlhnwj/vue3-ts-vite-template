import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Classroom from '@/view/classroom.vue' // 导入现有页面组件

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: Classroom }, // 默认路由指向课堂页
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router