import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { FaceMesh, FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE, FACEMESH_RIGHT_EYEBROW, FACEMESH_LEFT_EYEBROW, FACEMESH_LIPS, FACEMESH_FACE_OVAL } from '@mediapipe/face_mesh';
import { throttle } from 'lodash-es';

// 课堂模式 - 肢体姿势类型
export enum BODY_POSE_TYPE {
  RIGHT_HAND_UP = 'right_hand_up', // 右手向上
  LEFT_HAND_UP = 'left_hand_up', // 左手向上
  BOTH_HANDS_UP = 'both_hands_up', // 新增：双手向上
  NORMAL = 'normal', // 正常
}

// 课堂模式 - 面部旋转方向
export enum ROTATE_DIRECTION {
  RIGHT_ROTATE = 'RIGHT_ROTATE', // 右旋转
  LEFT_ROTATE = 'LEFT_ROTATE', // 左旋转
  NONE_ROTATE = 'NONE_ROTATE', // 无旋转
  NOT_FIND_FACE = 'NONE_FACE', // 未找到人脸
}

// 关键点索引 - 肢体
export enum BODY_POSE_KEY_POINT_INDEX {
  NOSE = 0,
  LEFT_SHOULDER = 11,
  RIGHT_SHOULDER = 12,
  LEFT_ELBOW = 13,
  RIGHT_ELBOW = 14,
  LEFT_WRIST = 15,
  RIGHT_WRIST = 16,
}

// 关键点索引 - 面部
export enum FACE_KEY_POINT_INDEX {
  LEFT_SIDE = 127, // 左侧颞部,
  RIGHT_SIDE = 356, // 右侧颞部,
  NOSE_TIP = 1, // 鼻尖
}

class MediapipeCombined {
  private pose: Pose | undefined;
  private faceMesh: FaceMesh | undefined;
  private videoElement: HTMLVideoElement | null;
  private outputCanvas: HTMLCanvasElement | null;
  private outputCanvasCtx: CanvasRenderingContext2D | null;
  private currBodyPoseType: Ref<BODY_POSE_TYPE> = ref(BODY_POSE_TYPE.NORMAL); // 当前肢体姿势类型
  private currFaceRotateDirection: Ref<ROTATE_DIRECTION> = ref(ROTATE_DIRECTION.NOT_FIND_FACE); // 当前人脸旋转方向

  constructor() {
    // 初始化变量
    this.videoElement = null;
    this.outputCanvas = null;
    this.outputCanvasCtx = null;
    // 初始化 Pose 和 FaceMesh
    this.createPoseMode();
    this.createFaceMeshMode();
  }

  createPoseMode() {
    this.pose = new Pose({
      locateFile: (file: any) => {
        return `node_modules/@mediapipe/pose/${file}`;
      },
    });
    // 配置 Pose 选项
    this.pose.setOptions({
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  createFaceMeshMode() {
    this.faceMesh = new FaceMesh({
      locateFile: (file: any) => {
        return `node_modules/@mediapipe/face_mesh/${file}`;
      },
    });
    // 配置 FaceMesh 选项
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
    this.pose?.onResults(this.onPoseResults.bind(this));
    this.faceMesh?.onResults(this.onFaceMeshResults.bind(this));

    return this;
  }

  // 启动摄像头
  startCamera() {
    // 启动摄像头
    const camera = new Camera(this.videoElement as HTMLVideoElement, {
      onFrame: async () => {
        await this.pose?.send({ image: this.videoElement as HTMLVideoElement });
        await this.faceMesh?.send({ image: this.videoElement as HTMLVideoElement });
      },
      width: this.videoElement?.clientWidth,
      height: this.videoElement?.clientHeight,
    });
    camera.start();
  }

  getCurrBodyPoseType() {
    return this.currBodyPoseType;
  }

  getCurrFaceRotateDirection() {
    return this.currFaceRotateDirection;
  }

  // 清除画布
  private clearCanvas() {
    this.outputCanvasCtx?.clearRect(
      0,
      0,
      this.outputCanvas?.width || 0,
      this.outputCanvas?.height || 0
    );
  }

  // 处理 Pose 检测结果
  private onPoseResults(results: any) {
    this.clearCanvas();

    // console.error('onPoseResults', results);
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
      );
      drawLandmarks(
        this.outputCanvasCtx as CanvasRenderingContext2D,
        results.poseLandmarks,
        {
          color: '#FF0000',
          lineWidth: 2,
        }
      );

      // 判断姿势类型
      this.throttledDetectPose(results?.poseLandmarks);
    }
  }

  // 使用 lodash 的节流函数优化姿势检测
  private throttledDetectPose = throttle(this.detectPose, 200);

  // 检测姿势类型
  private detectPose(landmarks: any = []) {
    // 判断右手是否举起
    const isRightHandUp =
      landmarks[BODY_POSE_KEY_POINT_INDEX.RIGHT_WRIST]?.y <
      landmarks[BODY_POSE_KEY_POINT_INDEX.RIGHT_SHOULDER]?.y &&
      landmarks[BODY_POSE_KEY_POINT_INDEX.RIGHT_ELBOW]?.y <
      landmarks[BODY_POSE_KEY_POINT_INDEX.RIGHT_SHOULDER]?.y;

    // 判断左手是否举起
    const isLeftHandUp =
      landmarks[BODY_POSE_KEY_POINT_INDEX.LEFT_WRIST]?.y <
      landmarks[BODY_POSE_KEY_POINT_INDEX.LEFT_SHOULDER]?.y &&
      landmarks[BODY_POSE_KEY_POINT_INDEX.LEFT_ELBOW]?.y <
      landmarks[BODY_POSE_KEY_POINT_INDEX.LEFT_SHOULDER]?.y;

    if (isRightHandUp) {
      // 如果右手举起，则更新当前姿势类型
      this.currBodyPoseType.value = BODY_POSE_TYPE.RIGHT_HAND_UP;
    } else if (isLeftHandUp) {
      // 如果左手举起，则更新当前姿势类型
      this.currBodyPoseType.value = BODY_POSE_TYPE.LEFT_HAND_UP;
    } else {
      // 否则，更新当前姿势类型为正常
      this.currBodyPoseType.value = BODY_POSE_TYPE.NORMAL;
    }
  }

  // 处理 FaceMesh 检测结果
  private onFaceMeshResults(results: any) {
    // console.error('onFaceMeshResults', results);
    // this.clearCanvas();
    // 如果检测到面部
    if (results.multiFaceLandmarks) {
      // 绘制面部关键点和连接线
      //   for (const landmarks of results.multiFaceLandmarks) {
      //     if (this.outputCanvasCtx) {
      //       drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_TESSELATION, {
      //         color: '#C0C0C070',
      //         lineWidth: 1,
      //       });
      //       drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
      //         color: '#FF3030',
      //       });
      //       drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {
      //         color: '#FF3030',
      //       });
      //       drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_LEFT_EYE, {
      //         color: '#30FF30',
      //       });
      //       drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {
      //         color: '#30FF30',
      //       });
      //       drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_FACE_OVAL, {
      //         color: '#E0E0E0',
      //       });
      //       drawConnectors(this.outputCanvasCtx, landmarks, FACEMESH_LIPS, {
      //         color: '#FF8000',
      //       });
      //     }
      //   }
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
    const leftDist = landmarks[FACE_KEY_POINT_INDEX.LEFT_SIDE]?.x - landmarks[FACE_KEY_POINT_INDEX.NOSE_TIP].x;
    const rightDist = landmarks[FACE_KEY_POINT_INDEX.NOSE_TIP].x - landmarks[FACE_KEY_POINT_INDEX.RIGHT_SIDE].x;

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

  getCreateVideoStream() {
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
        console.error("摄像头访问失败:", err);
      });
    })
  }
}

export default new MediapipeCombined();