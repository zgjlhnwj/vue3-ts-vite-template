<!-- src/App.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <header class="text-center mb-8">
      <h1 class="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-gray-800">
        <i class="fa fa-user-o mr-2"></i>
      </h1>
    </header>
    
    <PoseDetector />
  </div>
</template>

<script setup>
import PoseDetector from './view/classroom.vue'

</script>

<style>
.container {
  max-width: 1200px;
}
</style>