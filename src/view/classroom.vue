<template>
  <div class="zoom-in">
    <div class="head-nav">
      11111111
    </div>
    <div class="main-content">
      <div class="left">
        <canvas id="output-canvas"></canvas>
        <canvas id="output-canvas-face"></canvas>
      </div>
      <div class="right">
        <div class="my-seat">
          <!-- <video id="mine-video" ref="videoElement" width="640" height="480" autoplay></video> -->
          <video id="mine-video" ref="videoElement" autoplay></video>

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import mediapipePose from '@/hooks/use-mediapipe-pose'
// import mediapipeFaceMesh from '@/hooks/use-mediapipe-face-mesh'
import mediapipeCombined, { ROTATE_DIRECTION } from '@/hooks/use-mediapipe-mode'
// import ROTATE_DIRECTION from '@/hooks/use-mediapipe-mode'

const faceRotateDirection = mediapipeCombined.getCurrFaceRotateDirection();

watch(
  () => faceRotateDirection.value,
  (val, oldVal) => {
    if (val !== oldVal) {
      if (val == ROTATE_DIRECTION.LEFT_ROTATE) {
        document.body.style.backgroundColor = '#D32F2F';
      } else if (val == ROTATE_DIRECTION.RIGHT_ROTATE) {
        document.body.style.backgroundColor = '#2E7D32';
      } else if (val == ROTATE_DIRECTION.NOT_FIND_FACE) {
        document.body.style.backgroundColor = '#6865dd';
      } else if (val == ROTATE_DIRECTION.NONE_ROTATE) {
        document.body.style.backgroundColor = '';
      }
    }
  },
  { immediate: true },
);

onMounted(() => {
  nextTick().then(() => {
    const videoElement = document.getElementById('mine-video') as HTMLVideoElement
    const canvasElement = document.getElementById('output-canvas') as HTMLCanvasElement
    const canvasElement2 = document.getElementById('output-canvas-face') as HTMLCanvasElement
    // mediapipePose.install(videoElement, canvasElement).startCamera()
    // mediapipeFaceMesh.install(videoElement, canvasElement2).startCamera()
    mediapipeCombined.install(videoElement, canvasElement).startCamera()
  });

})

</script>

<style scoped lang="scss">
.zoom-in {
  width: 100%;
  background-color: $classroom-bg-color;
  aspect-ratio: 1366 / 768;

  .head-nav {
    width: 100%;
    height: 48px;
    background-color: #000000;
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
        height: 100%;
        background-color: #b552cf;
      }
    }
  }
}
</style>