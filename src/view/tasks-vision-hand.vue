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
        <div class="other-seat">
          <div class="init-message">
            <div v-for="(msg, index) in initMessage" :key="index" class="message-item">
              {{ msg }}
            </div>
          </div>
          <div class="tip-message">
            {{ tipMessage }}
            
          </div>
          <div class="num-message">
            {{ confidenceMessage }}
            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import mediapipePose from '@/hooks/use-mediapipe-pose'
// import mediapipeFaceMesh from '@/hooks/use-mediapipe-face-mesh'
import mediapipeTasksVisionService from '@/hooks/use-mediapipe-tasks-vision'
// import ROTATE_DIRECTION from '@/hooks/use-mediapipe-mode'

const initMessage = mediapipeTasksVisionService.getInitMessage();

const tipMessage = mediapipeTasksVisionService.getTipMessage();

const confidenceMessage = mediapipeTasksVisionService.getConfidenceMessage();


onMounted(async () => {

  console.error('Tasks onMounted')

  const videoElement = document.getElementById('mine-video') as HTMLVideoElement

  try {
    await mediapipeTasksVisionService.initGestureRecognizer(videoElement);
    mediapipeTasksVisionService.start();
  } catch (error) {
    console.error('Failed to initialize gesture recognizer:', error);
  }

})
onBeforeUnmount(() => {
  mediapipeTasksVisionService.stop()
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
    display: flex;
    flex-direction: column;
    background-color: cadetblue;
    .my-seat {
      flex: 1;
      width: 100%;
      background-color: #2682d7;
      aspect-ratio: 4 / 3;
      transform: scaleX(-1); // 翻转视频

      #mine-video {
        width: 100%;
        aspect-ratio: 4 / 3;
        background-color: #b552cf;
      }
    }

   .other-seat {
      padding-left: 12px;
     height: 100%;
     width: 100%;
     background-color: #26ca7d;
     display: flex;
     flex-direction: column;
     justify-content: center;
     align-items: center;
     font-size: 22px;
      color: #ffffff;
      background-color: #000;
     .init-message {
        width: 100%;
        height: 40%;
        font-size: 20px;
        .message-item {
         margin-bottom: 10px;
        }
     }
     .tip-message {
        width: 100%;
        height: 20%;
     }
     .num-message {
        width: 100%;
        height: 20%;
      }
   }
  }
}
</style>