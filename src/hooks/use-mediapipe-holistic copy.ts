import { Holistic, POSE_CONNECTIONS, POSE_LANDMARKS, HAND_CONNECTIONS, FACEMESH_TESSELATION } from '@mediapipe/holistic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils';
import { HandDetector } from './use-mediapipe-detector-mode'
// 模块状态
const moduleStates = {
    hand: true,
    pose: true,
    face: true
};
interface LogEntry {
    time: string;
    log: string;
}
// 检测结果
interface DetectionResult {
    confidence: string;
    textContent: string;
    detectionType: string;
}
class MediaPipeHolisticService {
    private holistic: Holistic | null = null;

    private initLog = ref<LogEntry[]>([]);

    private camera: Camera | null = null;

    private videoElement: HTMLVideoElement | null = null;

    private outputCanvas: HTMLCanvasElement | null = null;

    private outputCanvasCtx: CanvasRenderingContext2D | null = null;

    private totalDetections = ref(0);

    private detectionResult = ref<DetectionResult>();

    private fps = ref(0);

    private frameInterval = 1000 / 15; // 默认15FPS，转换为毫秒

    private lastProcessedTime = 0;

    private detectors = {
        handDetector: new HandDetector(),
        // pose: new PoseDetector(),
        // face: new FaceDetector()
    };

    constructor() {
        
        //
    }

    addInitLog(log: string) {
        this.initLog.value.push({
            log: log,
            time: new Date().toLocaleString()
        });
    }

    getInitLog() {
        return this.initLog;
    }

    getDetectionResult() {
        return this.detectionResult;
    }

    getFPS() {
        return this.fps;
    }

    async install() {
        try {
            this.addInitLog('正在初始化 MediaPipe ...');

            this.holistic = new Holistic({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
                }
            });

            this.holistic.setOptions({
                modelComplexity: 1, // 姿态检测模型复杂度（0-2），值越高精度越好但性能消耗更大
                smoothLandmarks: true, //是否平滑关键点位置，减少抖动（默认 true）
                enableSegmentation: false, // 是否启用人体分割掩码（默认 false）
                smoothSegmentation: false, // 是否平滑分割掩码（默认 true）
                refineFaceLandmarks: false, // 是否优化面部关键点细节（默认 false）
                minDetectionConfidence: 0.7, // 检测置信度阈值（0.0-1.0），低于此值的结果会被过滤
                minTrackingConfidence: 0.7, // 追踪置信度阈值（0.0-1.0），低于此值会触发重新检测
            });

            this.addInitLog('MediaPipe 模块化检测框架初始化完成');

            this.holistic.onResults(this.onResults.bind(this));



        } catch (error: any) {

            this.addInitLog("MediaPipe 初始化失败: " + error.message);
        }
    }

    cameraLoad() {
        // 启动摄像头
        this.camera = new Camera(this.videoElement as HTMLVideoElement, {
            onFrame: async () => {
                await this.holistic?.send({ image: this.videoElement as HTMLVideoElement });
            },
            width: this.videoElement?.clientWidth,
            height: this.videoElement?.clientHeight,
        });
        this.addInitLog('MediaPipe 创建Camera完成');
    }

    // 自定义视频帧处理函数，控制处理频率
    handleVideoFrame() {
        if (!this.holistic) return;
        
        // 检查是否达到处理间隔
        const now = performance.now();
        if (now - this.lastProcessedTime >= this.frameInterval) {
            // 处理当前帧
            this.holistic.send({ image: this.videoElement as HTMLVideoElement });
        }
        
        // 继续请求下一帧
        requestAnimationFrame(this.handleVideoFrame.bind(this));
    }

    cameraStart() {
        this.camera?.start();
        requestAnimationFrame(this.handleVideoFrame.bind(this));
        this.addInitLog('MediaPipe Camera 识别 启动');
    }

    cameraStop() {
        this.camera?.stop();
        this.addInitLog('MediaPipe Camera 识别 停止');
    }

    onResults = (results: any) => {

        debugger
           
        this.lastProcessedTime = performance.now();
        // TODO: 处理检测结果
        this.drawOutputCanvas(results);
        // TODO: 计算结果
        const { detectedAction, detectionType } = this.calculateResults(results);
        // 更新显示
        if (detectedAction) {
            this.detectionResult.value = {
                confidence: `置信度: ${Math.round(detectedAction.confidence * 100)}%`,
                textContent: `${detectedAction.emoji || '🤖'} ${detectedAction.name}`,
                detectionType: detectionType
            }
        } else {
            this.detectionResult.value = {
                confidence: `置信度: 0%`,
                textContent: "未检测到动作",
                detectionType: "等待检测",
            }
        }
    }

    setVideoElement(videoElement: HTMLVideoElement) {
        this.videoElement = videoElement;
    }

    setOutPutCanvasElement(canvasElement: HTMLCanvasElement) {
        this.outputCanvas = canvasElement;
        this.outputCanvasCtx = canvasElement.getContext('2d');
    }

    drawOutputCanvas(results: any) {

        if (this.outputCanvas && this.outputCanvasCtx) {
            this.outputCanvasCtx?.save();
            this.outputCanvasCtx?.clearRect(0, 0, this.outputCanvas?.width, this.outputCanvas?.height);

            // 绘制结果
            if (results.poseLandmarks && moduleStates.pose) {
                drawConnectors(this.outputCanvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
                drawLandmarks(this.outputCanvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
            }

            if (results.leftHandLandmarks && moduleStates.hand) {
                drawConnectors(this.outputCanvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 2 });
                drawLandmarks(this.outputCanvasCtx, results.leftHandLandmarks, { color: '#00FF00', lineWidth: 1, radius: 3 });
            }

            if (results.rightHandLandmarks && moduleStates.hand) {
                drawConnectors(this.outputCanvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 2 });
                drawLandmarks(this.outputCanvasCtx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
            }

            if (results.faceLandmarks && moduleStates.face) {
                drawConnectors(this.outputCanvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
            }

            this.outputCanvasCtx.restore();
        }
        // 清空画布
    }

    calculateResults(results: any) {
        let detectedAction = null;
        let detectionType = "等待检测";

        // 按优先级处理检测结果
        // const priorities = ['hand', 'pose', 'face'];

        const detector = this.detectors.handDetector;
        const result = detector.detect(results);

        if (result && result.confidence > detector.threshold) {
            detectedAction = result;
            detectionType = detector.getTypeName();
            // addLog(moduleType, `检测到${detectionType}: ${result.name} (${Math.round(result.confidence * 100)}%)`);
            this.totalDetections.value = this.totalDetections.value + 1;
        }

        return { detectedAction, detectionType };
    }

    createVideoStream() {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            }).then((stream) => {
                resolve(stream);
            }).catch((err) => {
                this.addInitLog('mediaDevices 获取视频流失败' + err.message);
                reject(err);
            });
        })
    }

    calculateFPS(interval: number = 1000) {
        // 默认1秒计算间隔（可自定义）
        let frames = 0;
        let lastTime = performance.now(); // 使用performance获取更精确时间
        const fps = 0;
        let rafId: number | null = null; // 记录requestAnimationFrame ID用于停止

        // 停止监测方法
        const stop = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        };

        // 更新帧计数逻辑
        const updateFrameCount = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= interval) {
                this.fps.value = Math.round((frames / deltaTime) * 1000); // 转换为每秒帧数
                frames = 0;
                lastTime = currentTime;
            }

            frames++;
            rafId = requestAnimationFrame(updateFrameCount);
        };

        // 返回控制对象（包含启动和停止方法）
        return {
            start: updateFrameCount,
            stop,
        };
    }

    uninstall() {
        this.camera?.stop();
        this.camera = null;
        this.holistic?.close(); // 关闭holistic实例
        this.holistic = null; // 清空holistic实例
        this.initLog.value = [];
        this.outputCanvasCtx = null;
        this.outputCanvas = null;
        this.videoElement = null;
    }
}

export default new MediaPipeHolisticService();