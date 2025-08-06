<template>
  <div class="container mx-auto px-4 py-8">
    <nav class="nav-container">
      <router-link to="/FaceMesh" class="nav-link">面部识别</router-link>
      <router-link to="/TasksVisionHand" class="nav-link">自定义-手势</router-link>
      <router-link to="/MediapipeHolisticView" class="nav-link">整体姿势</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.nav-container {
  margin-bottom: 2rem;
  padding: 0 1rem;
  border-bottom: 1px solid #e5e7eb; /* 底部分隔线 */
}

.nav-link {
  display: inline-block;
  padding: 0.75rem 1rem; /* 增大点击区域 */
  margin-right: 0.5rem;
  text-decoration: none;
  color: #4b5563; /* 更柔和的默认色 */
  font-weight: 500;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent; /* 预留激活边框位置 */
}

.nav-link:hover {
  color: #3b82f6; /* 悬停主色（可替换为项目变量） */
  background-color: #f3f4f6; /* 浅灰背景 */
}

.nav-link.router-link-exact-active {
  color: #2563eb; /* 激活主色 */
  border-bottom-color: #2563eb; /* 底部激活边框 */
  font-weight: 600;
}
</style>