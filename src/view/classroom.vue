<template>
  <div class="zoom-in">
    <div class="head-nav">Vue 3 + Pinia 示例</div>
    <div class="main-content">
      <div class="counter">
        <p>当前计数：{{ counterStore.count }}</p>
        <button @click="counterStore.increment">+1</button>
        <button @click="counterStore.decrement">-1</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useCounterStore } from '@/store/counter'

const counterStore = useCounterStore()
</script>

<style scoped lang="scss">
.counter {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  button {
    margin: 0 0.5rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
}</style>

<style scoped lang="scss">
.zoom-in {
  width: 100%;
  background-color: $classroom-bg-color;
  aspect-ratio: 1366 / 768;

  .head-nav {
    width: 100%;
    height: 48px;
    background-color: #000000;
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    font-weight: 600;
  }

  .main-content {
    width: 100%;
    height: 100%;
    background-color: #5252cf;
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  .left {
    background-color: aqua;
    aspect-ratio: 4 / 3;
    #output-canvas {
      width: 100%;
      height: 100%;
      background-color: #834b4b;
    }
  }

  .right {
    flex: 1;
    background-color: cadetblue;

    .my-seat {
      width: 100%;
      background-color: #2682d7;
      aspect-ratio: 4 / 3;
      transform: scaleX(-1); // 翻转视频
      #mine-video {
        width: 100%;
        background-color: #5252cf;
      }
    }
  }
}
</style>