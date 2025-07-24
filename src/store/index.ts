import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia()

// 配置持久化插件（支持localStorage/sessionStorage等）
pinia.use(createPersistedState({
  storage: localStorage, // 默认使用localStorage
  key: (id) => `pinia_${id}`, // 存储键名前缀（id为store的name）
  auto: true, // 自动持久化（默认true）
}))

export default pinia