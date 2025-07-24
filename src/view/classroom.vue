<template>
  <div class="zoom-in">
    <div class="head-nav">
      Vue 3 ts vite scss 模版项目
    </div>
    <div class="main-content">
      <div class="left">
        
      </div>
      <div class="right">
        <div class="my-seat">
         

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

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