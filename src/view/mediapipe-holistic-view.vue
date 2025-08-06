<template>
    <div class="container">
        <div class="content">
            <div class="loading" id="loading" v-show="loadStatus == 'loading'">
                <div class="loading-spinner"></div>
                <p>正在加载 MediaPipe 模型...</p>
            </div>

            <section id="demos" v-show="loadStatus == 'loaded'">
                <div class="main-section">
                    <div class="video-section">
                        <video id="webcam" autoplay playsinline></video>
                        <canvas id="output_canvas"></canvas>

                        <div class="controls">
                            <button class="mdc-button mdc-button--raised" @click="cameraStart">
                                <span class="mdc-button__label">🎥 启动识别</span>
                            </button>
                            <button class="mdc-button mdc-button--outlined" @click="cameraStop">
                                <span class="mdc-button__label">🔄 停止识别</span>
                            </button>
                        </div>
                    </div>

                    <div class="info-panel">
                        <div class="detection-display" id="detection_display">
                            <div class="detection-result" id="detection_output" >{{ detectionResult?.textContent }}</div>
                            <div class="confidence-score" id="confidence_output">{{ detectionResult?.confidence }}</div>
                            <div class="detection-type" id="detection_type">{{ detectionResult?.detectionType }}</div>
                        </div>

                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-value" id="fps">{{ fps }}</div>
                                <div class="stat-label">帧率</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" id="total_detections">0</div>
                                <div class="stat-label">总检测数</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" id="hand_count">0/42</div>
                                <div class="stat-label">手部关键点</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" id="pose_count">0/33</div>
                                <div class="stat-label">姿态关键点</div>
                            </div>
                        </div>

                        <div class="log-section">
                            <div class="log-header">
                                📋 初始化日志
                                <button class="mdc-button mdc-button--outlined"
                                    style="padding: 4px 8px; font-size: 12px;" onclick="clearLogs()">
                                    <span class="mdc-button__label">清空</span>
                                </button>
                            </div>
                            <div class="log-container" id="log_container">
                                <div class="log-entry system" v-for="(obj, index) in initLog" :key="index">
                                    <div class="log-timestamp">{{obj.time}}</div>
                                    <div class="log-content">{{ obj.log }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div class="error-message" id="error"></div>
        </div>
    </div>
</template>
<script setup lang="ts">
import mediaPipeHolisticService from '@/hooks/use-mediapipe-holistic'


const loadStatus = ref('loading');

const initLog = mediaPipeHolisticService.getInitLog();

const detectionResult = mediaPipeHolisticService.getDetectionResult();

const fps = mediaPipeHolisticService.getFPS();

const fpsMonitor = mediaPipeHolisticService.calculateFPS(1000); // 1秒计算一次

const cameraStart = () => {
    mediaPipeHolisticService.cameraStart()
}

const cameraStop = () => {
    mediaPipeHolisticService.cameraStop()
}

onMounted(() => {
    nextTick(async () => {
        const videoElement = document.getElementById("webcam") as HTMLVideoElement;
        const canvasElement = document.getElementById("output_canvas");

        const videoStream = await mediaPipeHolisticService.createVideoStream();

        if (videoElement) {
            videoElement.srcObject = videoStream as MediaProvider;
        }

        await mediaPipeHolisticService.install();

        loadStatus.value = 'loaded';

        mediaPipeHolisticService.setVideoElement(videoElement as HTMLVideoElement);

        mediaPipeHolisticService.setOutPutCanvasElement(canvasElement as HTMLCanvasElement);

        mediaPipeHolisticService.cameraLoad()

        fpsMonitor.start();

    })
})

onBeforeUnmount(() => {
    mediaPipeHolisticService.uninstall()
    fpsMonitor.stop();
})


</script>
<style lang="scss">
.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.content {
    padding: 30px;
}

.main-section {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 30px;
    margin-bottom: 30px;
}

.video-section {
    position: relative;
}

#webcam {
    width: 100%;
    aspect-ratio: 4/ 3;
    border-radius: 12px;
    background: #f5f5f5;
}

#output_canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    border-radius: 12px;
    aspect-ratio: 4/ 3;
}

.controls {
    display: flex;
    gap: 15px;
    margin-top: 20px;
    flex-wrap: wrap;
}

.mdc-button {
    border-radius: 25px !important;
    text-transform: none !important;
    font-weight: 500 !important;
}

.info-panel {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 25px;
    height: fit-content;
}

.detection-display {
    text-align: center;
    padding: 25px;
    background: white;
    border-radius: 12px;
    margin-bottom: 25px;
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;
}

.detection-result {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
}

.confidence-score {
    font-size: 16px;
    color: #666;
    margin-bottom: 5px;
}

.detection-type {
    font-size: 14px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.module-selector {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
}

.module-selector h4 {
    margin-bottom: 15px;
    color: #333;
}

.module-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
}

.module-button {
    padding: 10px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
}

.module-button:hover {
    border-color: #667eea;
    background: #f0f4ff;
}

.module-button.active {
    border-color: #667eea;
    background: #667eea;
    color: white;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 25px;
}

.stat-item {
    background: white;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
}

.stat-value {
    font-size: 20px;
    font-weight: 600;
    color: #667eea;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
}

.log-section {
    background: white;
    border-radius: 8px;
    max-height: 300px;
    overflow-y: auto;
}

.log-header {
    padding: 15px;
    border-bottom: 1px solid #eee;
    font-weight: 600;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.log-container {
    padding: 15px;
}

.log-entry {
    margin-bottom: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    border-left: 4px solid #ddd;
}

.log-entry.hand {
    background: #e8f5e9;
    border-left-color: #4caf50;
}

.log-entry.pose {
    background: #e3f2fd;
    border-left-color: #2196f3;
}

.log-entry.face {
    background: #fce4ec;
    border-left-color: #e91e63;
}

.log-entry.system {
    background: #fff3e0;
    border-left-color: #ff9800;
}

.log-timestamp {
    color: #666;
    font-size: 11px;
}

.log-content {
    color: #333;
    margin-top: 2px;
}

.loading {
    text-align: center;
    padding: 60px;
    color: #666;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.invisible {
    display: none;
}

.error-message {
    background: #ffebee;
    color: #c62828;
    padding: 20px;
    border-radius: 12px;
    margin: 20px 0;
    display: none;
    border-left: 4px solid #f44336;
}
</style>