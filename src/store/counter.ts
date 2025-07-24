import { defineStore } from 'pinia'

// 定义Store（name需唯一）
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() { this.count++ },
    decrement() { this.count-- }
  },
  persist: true, // 启用持久化（使用全局配置）
  // 可选：覆盖全局配置（如指定sessionStorage）
  // persist: {
  //   storage: sessionStorage,
  //   key: 'custom_counter_key'
  // }
})