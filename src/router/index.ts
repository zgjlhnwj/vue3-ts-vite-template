import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import FaceMesh from '@/view/face-mesh.vue' // 导入现有页面组件
import TasksVisionHand from '@/view/tasks-vision-hand.vue' // 导入现有页面组件
import MediapipeHolisticView from '@/view/mediapipe-holistic-view.vue' // 导入现有页面组件

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/FaceMesh' }, // 重定向到默认路由 
  { path: '/FaceMesh', name: 'FaceMesh', component: FaceMesh }, // 默认路由指向课堂页
  { path: '/TasksVisionHand', name: 'TasksVisionHand', component: TasksVisionHand }, // 默认路由指向课堂页
  { path: '/MediapipeHolisticView', name: 'MediapipeHolisticView', component: MediapipeHolisticView }, // 默认路由指向课堂页
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router