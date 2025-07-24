import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { FaceMesh, FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE, FACEMESH_RIGHT_EYEBROW, FACEMESH_LEFT_EYEBROW, FACEMESH_LIPS, FACEMESH_FACE_OVAL } from '@mediapipe/face_mesh';
import { throttle } from 'lodash-es';
// 课堂模式
export enum ROTATE_DIRECTION {
    RIGHT_ROTATE = 'RIGHT_ROTATE', // 右旋转
    LEFT_ROTATE = 'LEFT_ROTATE', // 左旋转
    NONE_ROTATE = 'NONE_ROTATE', // 无旋转
    NOT_FIND_FACE = 'NONE_FACE', // 未找到人脸
}
// 关键点索引
export enum _KEY_POINT_INDEX {
    LEFT_SIDE = 127, // 左侧颞部,
    RIGHT_SIDE = 356, // 右侧颞部,
    NOSE_TIP = 1, // 鼻尖
}

class MediapipeFaceMesh {
    private faceMesh: FaceMesh | undefined;
    private videoElement: HTMLVideoElement | null;
    private outputCanvas: HTMLCanvasElement | null;
    private outputCanvasCtx: CanvasRenderingContext2D | null;
    private currFaceRotateDirection: Ref = ref(ROTATE_DIRECTION.NOT_FIND_FACE); // 当前人脸旋转方向
    constructor() {
        // 初始化变量
        this.videoElement = null;
        this.outputCanvas = null;
        this.outputCanvasCtx = null;
        this.createFaceMeshMode();
    }

    createFaceMeshMode() {
        this.faceMesh = new FaceMesh({
            locateFile: (file: any) => {
                return `node_modules/@mediapipe/face_mesh/${file}`;
            },
        });
        // 配置 Pose 选项
        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });
    }

    // 初始化
    install(videoElement: HTMLVideoElement, outputCanvas: HTMLCanvasElement) {
        // 获取视频元素
        this.videoElement = videoElement;
        // 获取输出画布元素
        this.outputCanvas = outputCanvas;
        // 获取画布上下文
        this.outputCanvasCtx = outputCanvas.getContext('2d')!;
        // 翻转画布
        this.outputCanvasCtx.setTransform(-1, 0, 0, 1, this.outputCanvas.width, 0);
        // 处理检测结果
        this.faceMesh?.onResults(this.onResults.bind(this));

        return this;
    }

    startCamera() {
        // 启动摄像头
        const camera = new Camera(this.videoElement as HTMLVideoElement, {
            onFrame: async () => {
                await this.faceMesh?.send({ image: this.videoElement as HTMLVideoElement });
            },
            width: this.videoElement?.clientWidth,
            height: this.videoElement?.clientHeight,
        });
        camera.start();
    }

    getCurrFaceRotateDirection() {
        return this.currFaceRotateDirection;
    }

    // 清除画布
    private clearCanvas() {
        this.outputCanvasCtx?.clearRect(0, 0, this.outputCanvas?.width || 0, this.outputCanvas?.height || 0);
    }

    // 处理检测结果
    private onResults(results: any) {
        this.clearCanvas();
        // 如果检测到姿势
        if (results.multiFaceLandmarks) {
            // 绘制面部关键点和连接线
            for (const landmarks of results.multiFaceLandmarks) {
                if (this.outputCanvasCtx) {
                    drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_TESSELATION, {
                        color: '#C0C0C070',
                        lineWidth: 1,
                    });
                    drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
                        color: '#FF3030',
                    });
                    drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {
                        color: '#FF3030',
                    });
                    drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_LEFT_EYE, {
                        color: '#30FF30',
                    });
                    drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {
                        color: '#30FF30',
                    });
                    drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_FACE_OVAL, {
                        color: '#E0E0E0',
                    });
                    drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_LIPS, {
                        color: '#FF8000',
                    });
                }
            }

            // 使用节流后的函数检测面部转动
            this.throttledDetectFaceRotation(results.multiFaceLandmarks[0]);
        }
    }

    // 使用 lodash 的节流函数优化面部转动检测
    private throttledDetectFaceRotation = throttle(this.detectFaceRotation, 200);

    // 简化版面部转动检测函数
    private detectFaceRotation(landmarks: any) {
        if (!landmarks || landmarks.length === 0) {
            this.currFaceRotateDirection.value = ROTATE_DIRECTION.NOT_FIND_FACE;
            return;
        }

        // 计算左右两侧点到鼻尖的水平距离
        const leftDist = landmarks[_KEY_POINT_INDEX.LEFT_SIDE]?.x - landmarks[_KEY_POINT_INDEX.NOSE_TIP].x;
        const rightDist = landmarks[_KEY_POINT_INDEX.NOSE_TIP].x - landmarks[_KEY_POINT_INDEX.RIGHT_SIDE].x;

        // 计算距离差值（正值表示向右转动，负值表示向左转动）
        const distDiff = leftDist - rightDist;

        // 设置阈值（可根据需要调整,旋转角度）
        const ROTATION_THRESHOLD = 0.2;

        // 判断转动方向
        if (distDiff > ROTATION_THRESHOLD) {
            this.currFaceRotateDirection.value = ROTATE_DIRECTION.RIGHT_ROTATE;
        } else if (distDiff < -ROTATION_THRESHOLD) {
            this.currFaceRotateDirection.value = ROTATE_DIRECTION.LEFT_ROTATE;
        } else {
            this.currFaceRotateDirection.value = ROTATE_DIRECTION.NONE_ROTATE;
        }
    }
}

export default new MediapipeFaceMesh();
