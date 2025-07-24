import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose'
import { throttle } from 'lodash-es'
// 课堂模式
export enum BODY_POSE_TYPE {
  RIGHT_HAND_UP = 'right_hand_up', // 右手向上
  LEFT_HAND_UP = 'left_hand_up', // 左手向上
  BOTH_HANDS_UP = 'both_hands_up', // 新增：双手向上
  NORMAL = 'normal', // 正常
}
// 关键点索引
export enum BODY_POSE_KEY_POINT_INDEX {
  NOSE = 0,
  LEFT_SHOULDER = 11,
  RIGHT_SHOULDER = 12,
  LEFT_ELBOW = 13,
  RIGHT_ELBOW = 14,
  LEFT_WRIST = 15,
  RIGHT_WRIST = 16,
}

class MediapipePose {
  private pose: Pose | undefined
  private videoElement: HTMLVideoElement | null
  private outputCanvas: HTMLCanvasElement | null
  private outputCanvasCtx: CanvasRenderingContext2D | null
  private currBodyPoseType: Ref = ref(BODY_POSE_TYPE.NORMAL) // 当前肢体姿势类型
  constructor() {
    // 初始化变量
    this.videoElement = null
    this.outputCanvas = null
    this.outputCanvasCtx = null
    // 初始化 Pose
    this.createPoseMode()
  }

  createPoseMode() {
    this.pose = new Pose({
      locateFile: (file: any) => {
        return `node_modules/@mediapipe/pose/${file}`
      },
    })
    // 配置 Pose 选项
    this.pose.setOptions({
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })
  }

  // 初始化
  install(videoElement: HTMLVideoElement, outputCanvas: HTMLCanvasElement) {
    // 获取视频元素
    this.videoElement = videoElement
    // 获取输出画布元素
    this.outputCanvas = outputCanvas
    // 获取画布上下文
    this.outputCanvasCtx = outputCanvas.getContext('2d')!
    // 翻转画布
    this.outputCanvasCtx.setTransform(-1, 0, 0, 1, this.outputCanvas.width, 0)
    // 处理检测结果
    this.pose?.onResults(this.onResults.bind(this))

    return this
  }

  // 启动摄像头
  startCamera() {
    // 启动摄像头
    const camera = new Camera(this.videoElement as HTMLVideoElement, {
      onFrame: async () => {
        await this.pose?.send({ image: this.videoElement as HTMLVideoElement })
      },
      width: this.videoElement?.clientWidth,
      height: this.videoElement?.clientHeight,
    })
    camera.start()
  }

  getCurrBodyPoseType() {
    return this.currBodyPoseType
  }

  // 清除画布
  private clearCanvas() {
    this.outputCanvasCtx?.clearRect(
      0,
      0,
      this.outputCanvas?.width || 0,
      this.outputCanvas?.height || 0
    )
  }

  // 处理检测结果
  private onResults(results: any) {
    this.clearCanvas()
    // 如果检测到姿势
    if (results.poseLandmarks) {
      // 绘制姿势关键点和连接线
      drawConnectors(
        this.outputCanvasCtx as CanvasRenderingContext2D,
        results.poseLandmarks,
        POSE_CONNECTIONS,
        {
          color: '#00FF00',
          lineWidth: 4,
        }
      )
      drawLandmarks(
        this.outputCanvasCtx as CanvasRenderingContext2D,
        results.poseLandmarks,
        {
          color: '#FF0000',
          lineWidth: 2,
        }
      )

      // 判断姿势类型
      this.throttledDetectFaceRotation(results?.poseLandmarks)
    }
  }

  // 使用 lodash 的节流函数优化面部转动检测
  throttledDetectFaceRotation = throttle(this.detectPose, 200)

  // 检测姿势类型
  private detectPose(landmarks: any = []) {
    // 判断右手是否举起
    const isRightHandUp =
      landmarks[BODY_POSE_KEY_POINT_INDEX.RIGHT_WRIST]?.y <
        landmarks[BODY_POSE_KEY_POINT_INDEX.RIGHT_SHOULDER]?.y &&
      landmarks[BODY_POSE_KEY_POINT_INDEX.RIGHT_ELBOW]?.y <
        landmarks[BODY_POSE_KEY_POINT_INDEX.RIGHT_SHOULDER]?.y

    // 判断左手是否举起
    const isLeftHandUp =
      landmarks[BODY_POSE_KEY_POINT_INDEX.LEFT_WRIST]?.y <
        landmarks[BODY_POSE_KEY_POINT_INDEX.LEFT_SHOULDER]?.y &&
      landmarks[BODY_POSE_KEY_POINT_INDEX.LEFT_ELBOW]?.y <
        landmarks[BODY_POSE_KEY_POINT_INDEX.LEFT_SHOULDER]?.y

    if (isRightHandUp) {
      // 如果右手举起，则更新当前姿势类型
      this.currBodyPoseType.value = BODY_POSE_TYPE.RIGHT_HAND_UP
    } else if (isLeftHandUp) {
      // 如果左手举起，则更新当前姿势类型
      this.currBodyPoseType.value = BODY_POSE_TYPE.LEFT_HAND_UP
    } else {
      // 否则，更新当前姿势类型为正常
      this.currBodyPoseType.value = BODY_POSE_TYPE.NORMAL
    }
  }
}

export default new MediapipePose()
