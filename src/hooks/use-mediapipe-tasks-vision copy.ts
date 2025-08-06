import { FilesetResolver, GestureRecognizer, GestureRecognizerResult } from '@mediapipe/tasks-vision'

import { Camera } from '@mediapipe/camera_utils'


const GestureDescriptions = {
    rock: {name: '石头', emoji: '✊'},
    paper: {name: '布', emoji: '✋'},
    scissors: {name: '剪刀', emoji: '✌️'},
    none: {name: '无手势', emoji: '❓'},
};

enum GestureTypes {
    Rock = 'rock',
    Paper = 'paper',
    Scissors = 'scissors',
    None = 'none'
}

class MediapipeTasksVisionService {
    private static instance: MediapipeTasksVisionService
    private gestureRecognizer?: GestureRecognizer // 以手势识别为例
    private videoElement: HTMLVideoElement | null = null; // 添加视频元素属性
    private camera?: Camera | null; // 摄像头实例
    private initMessage = ref<string[]>([]);
    private tipMessage = ref<string>('');
    private confidenceMessage = ref<string>('');

    // public static getInstance(): MediapipeTasksVisionService {
    //     if (!MediapipeTasksVisionService.instance) {
    //         MediapipeTasksVisionService.instance = new MediapipeTasksVisionService()
    //     }
    //     return MediapipeTasksVisionService.instance
    // }
    // 初始化模型（以手势识别模型为例）
    getTipMessage() {
        return this.tipMessage;
    }
    getInitMessage() {
        return this.initMessage;
    }
    getConfidenceMessage() {
        return this.confidenceMessage;
    }
    async initGestureRecognizer(videoElement: HTMLVideoElement) {
        return new Promise<void>(async (resolve, reject) => {
            this.initMessage.value.push('正在初始化...');
    
            this.videoElement = videoElement

            let vision: any = undefined!;
            try {
                
                // 加载模型文件（需从 MediaPipe 官方获取模型路径）
                vision = await FilesetResolver.forVisionTasks(
                    '/node_modules/@mediapipe/tasks-vision/wasm' // 本地npm包的WASM资源路径
                )
                this.initMessage.value.push('MediaPipe wasm模型加载完成');               
            } catch (error) {
                this.initMessage.value.push('MediaPipe wasm模型加载失败' + error);
                reject(error);
            }
            if (vision) {
                try {
                    // 初始化手势识别器
                    this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
                        baseOptions: {
                            // modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task', // 官方预训练模型
                            modelAssetPath: 'src/mediapipe-tasks-mode/gesture_recognizer.task', // 本地预训练模型
                            delegate: 'GPU' // 使用 GPU 加速（可选：'CPU' 兼容性更好但速度较慢）
                        },
                        runningMode: 'VIDEO' // 模式：'IMAGE'（图片）、'VIDEO'（视频）、'LIVE_STREAM'（实时流）
                    }) 
                    this.initMessage.value.push('MediaPipe 识别器加载完成');
                    resolve();
                   
                } catch (error) {
                    this.initMessage.value.push('MediaPipe 识别器加载失败' + error);
                    reject(error);
                }
            }
            
        });
        
    }

    start() {
        if (this.videoElement) {
            const videoElement = this.videoElement
            this.camera = new Camera(videoElement, {
                onFrame: async () => {
                    if (this.gestureRecognizer) {
                        // 处理视频帧并返回结果
                        const result = await this.gestureRecognizer.recognizeForVideo(
                            videoElement, // 视频元素,
                            performance.now() // 时间戳（用于跟踪帧）
                        )
                        this.onResults(result) // 回调传递结果
                    }
                },
                width: this.videoElement?.clientWidth,
                height: this.videoElement?.clientHeight,
            })
            this.camera.start() // 启动摄像头

            this.initMessage.value.push('MediaPipe 启动摄像头完成');
        }
    }
    onResults(results: GestureRecognizerResult) {
        // 处理手势识别结果
        console.error('手势识别结果：', results)

        let currGesture = GestureTypes.None;

        if (results?.gestures && results.gestures?.length > 0) {
            // 获取第一个检测到的手势
            const gesture = results.gestures[0][0];
            const gestureName = gesture.categoryName.toLowerCase();
            const confidence = gesture.score;
            
           
            if (gestureName.includes(GestureTypes.Rock) || gestureName.includes('closed_fist')) {
                currGesture = GestureTypes.Rock;
            } else if (gestureName.includes(GestureTypes.Paper) || gestureName.includes('open_palm')) {
                currGesture = GestureTypes.Paper;
            } else if (gestureName.includes(GestureTypes.Scissors) || gestureName.includes('victory')) {
                currGesture = GestureTypes.Scissors;
            }
            
            this.tipMessage.value = `识别当前手势: ${GestureDescriptions[currGesture].emoji} ${GestureDescriptions[currGesture].name}`;
            this.confidenceMessage.value = `置信度: ${(confidence * 100).toFixed(1)}%`;
        } else {
            currGesture = GestureTypes.None;
            this.tipMessage.value = `识别当前手势: ${GestureDescriptions[currGesture].emoji} ${GestureDescriptions[currGesture].name}`;
            this.confidenceMessage.value = ``;

        }
    }

    stop() {
        this.camera?.stop()
        this.gestureRecognizer = undefined; // 清空手势识别器
        this.initMessage.value = [];
        this.tipMessage.value = '';
        this.confidenceMessage.value = ''
    }

}

export default new MediapipeTasksVisionService();