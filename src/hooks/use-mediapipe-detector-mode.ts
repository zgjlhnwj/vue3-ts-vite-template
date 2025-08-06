// 手势检测模块 - 基于特征的鲁棒检测
interface Point {
    x: number,
    y: number,
}

class HandDetector {
    public threshold = 0.6; // 可见性阈值
    private name = "手势检测"; // 检测器名称
    private debugMode = false; // 调试模式

    getTypeName() {
        return "手势识别";
    }
    // 检查关键点可见性
    isLandmarkVisible(landmark: any) {
        return landmark && landmark.visibility !== undefined ?
            landmark.visibility > 0.5 : true;
    }

    // 计算两点间距离
    getDistance(point1: Point, point2: Point) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 计算角度（弧度）
    getAngle(point1: Point, point2: Point, point3: Point) {
        const vector1 = { x: point1.x - point2.x, y: point1.y - point2.y };
        const vector2 = { x: point3.x - point2.x, y: point3.y - point2.y };

        const dot = vector1.x * vector2.x + vector1.y * vector2.y;
        const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
        const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

        return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
    }

    // 计算手指的弯曲程度（0-1，0表示完全伸直，1表示完全弯曲）
    getFingerCurvature(landmarks: Point[], tip: number, pip: number, mcp: number) {
        const tipPoint = landmarks[tip];
        const pipPoint = landmarks[pip];
        const mcpPoint = landmarks[mcp];

        // 计算理想伸直时的距离
        const straightDistance = this.getDistance(mcpPoint, tipPoint);
        // 计算实际路径距离
        const actualDistance = this.getDistance(mcpPoint, pipPoint) + this.getDistance(pipPoint, tipPoint);

        // 弯曲度 = (实际距离 - 直线距离) / 直线距离
        const curvature = Math.max(0, Math.min(1, (actualDistance - straightDistance) / straightDistance));
        return curvature;
    }

    // 计算手指的伸展程度（基于到手腕的距离）
    getFingerExtension(landmarks: Point[], tip: number, mcp: number) {
        const wrist = landmarks[0];
        const tipDistance = this.getDistance(landmarks[tip], wrist);
        const mcpDistance = this.getDistance(landmarks[mcp], wrist);

        // 伸展比例
        return tipDistance / mcpDistance;
    }

    // 检测优化的胜利手势：食指中和指伸展，其他手指相对弯曲
    isVictoryGesture(landmarks: Point[], features: any) {
        // 1. 食指和中指必须伸展
        const indexExtended = features.indexExtension > 1.1; // 降低要求
        const middleExtended = features.middleExtension > 1.1; // 降低要求

        // 2. 无名指、小指相对弯曲（移除拇指限制）
        const ringBent = features.ringCurvature > 0.3; // 降低弯曲要求
        const pinkyBent = features.pinkyCurvature > 0.3; // 降低弯曲要求

        // 3. 食指和中指要分开
        const fingersSeparated = features.indexMiddleDistance > 0.03; // 降低要求

        // 4. 食指和中指都应该在手腕上方
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const wrist = landmarks[0];
        const fingersUp = indexTip.y < wrist.y && middleTip.y < wrist.y;

        // 5. 排除停止手势（手掌张开）
        const notOpenPalm = features.handSpread < 0.18; // 手掌不要太张开

        if (this.debugMode) {
            console.log('胜利手势检测:', {
                indexExtended,
                middleExtended,
                ringBent,
                pinkyBent,
                fingersSeparated,
                fingersUp,
                notOpenPalm,
                indexExtension: features.indexExtension.toFixed(2),
                middleExtension: features.middleExtension.toFixed(2),
                ringCurvature: features.ringCurvature.toFixed(2),
                pinkyCurvature: features.pinkyCurvature.toFixed(2),
                handSpread: features.handSpread.toFixed(3),
                indexMiddleDistance: features.indexMiddleDistance.toFixed(3)
            });
        }

        return indexExtended && middleExtended &&
            ringBent && pinkyBent && fingersSeparated && fingersUp && notOpenPalm;
    }

    // 检测优化的比心手势：拇指和食指伸直交叉，其他手指小幅握拳
    isHeartGesture(landmarks: Point[], features: any) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        const wrist = landmarks[0];

        // 1. 拇指和食指都必须伸直
        const thumbExtended = features.thumbExtension > 1.2; // 保持原要求
        const indexExtended = features.indexExtension > 1.2; // 保持原要求

        // 2. 拇指和食指尖的距离应该很近（放宽要求）
        const thumbIndexDistance = this.getDistance(thumbTip, indexTip);
        const tipsClose = thumbIndexDistance < 0.20; // 从0.08放宽到0.20

        // 3. 检测交叉：拇指和食指应该形成X形交叉
        const thumbAngle = Math.atan2(thumbTip.y - wrist.y, thumbTip.x - wrist.x);
        const indexAngle = Math.atan2(indexTip.y - wrist.y, indexTip.x - wrist.x);
        const angleDiff = Math.abs(thumbAngle - indexAngle);

        // 交叉角度应该在合理范围内（放宽到10-150度）
        const validCrossAngle = angleDiff > Math.PI / 18 && angleDiff < Math.PI * 5 / 6;

        // 4. 拇指和食指的尖端都应该在手腕上方（向上交叉）
        const tipsAboveWrist = thumbTip.y < wrist.y && indexTip.y < wrist.y;

        // 5. 其他三个手指相对弯曲（大幅放宽要求）
        const middlePartialBent = features.middleCurvature > 0.2; // 从0.3降到0.2
        const ringPartialBent = features.ringCurvature > 0.2; // 从0.3降到0.2
        const pinkyPartialBent = features.pinkyCurvature > 0.15; // 从0.3降到0.15

        // 6. 其他手指不应该太伸展（大幅放宽要求）
        const middleNotTooExtended = features.middleExtension < 2.0; // 从1.3放宽到2.0
        const ringNotTooExtended = features.ringExtension < 2.0; // 从1.3放宽到2.0
        const pinkyNotTooExtended = features.pinkyExtension < 2.3; // 从1.3放宽到2.0

        // 7. 检查交叉的几何特征：放宽交叉要求
        const thumbRelativeX = thumbTip.x - wrist.x;
        const indexRelativeX = indexTip.x - wrist.x;

        // 修改交叉判断逻辑：
        // 1. 要么在不同侧（原逻辑）
        // 2. 要么距离足够远（降低阈值）
        // 3. 要么角度差足够大（新增条件）
        const crossingSides = Math.sign(thumbRelativeX) !== Math.sign(indexRelativeX) ||
            Math.abs(thumbRelativeX - indexRelativeX) > 0.01 || // 从0.05降到0.01
            angleDiff > Math.PI / 9; // 新增：角度差大于20度也算交叉

        // 8. 手掌张开度要求大幅放宽
        const notOpenPalm = features.handSpread < 0.50; // 从0.16大幅放宽到0.50

        if (this.debugMode) {
            console.log('比心手势检测:', {
                thumbExtended,
                indexExtended,
                tipsClose,
                validCrossAngle,
                tipsAboveWrist,
                middlePartialBent,
                ringPartialBent,
                pinkyPartialBent,
                middleNotTooExtended,
                ringNotTooExtended,
                pinkyNotTooExtended,
                crossingSides,
                notOpenPalm,
                thumbIndexDistance: thumbIndexDistance.toFixed(4),
                angleDiff: (angleDiff * 180 / Math.PI).toFixed(1) + '°',
                thumbAngle: (thumbAngle * 180 / Math.PI).toFixed(1) + '°',
                indexAngle: (indexAngle * 180 / Math.PI).toFixed(1) + '°',
                thumbExtension: features.thumbExtension.toFixed(2),
                indexExtension: features.indexExtension.toFixed(2),
                middleCurvature: features.middleCurvature.toFixed(2),
                ringCurvature: features.ringCurvature.toFixed(2),
                pinkyCurvature: features.pinkyCurvature.toFixed(2),
                handSpread: features.handSpread.toFixed(3),
                thumbRelativeX: thumbRelativeX.toFixed(3),
                indexRelativeX: indexRelativeX.toFixed(3)
            });
        }

        return thumbExtended && indexExtended && tipsClose && validCrossAngle &&
            tipsAboveWrist && middlePartialBent && ringPartialBent && pinkyPartialBent &&
            middleNotTooExtended && ringNotTooExtended && pinkyNotTooExtended &&
            crossingSides && notOpenPalm;
    }

    // 获取手势特征向量
    getGestureFeatures(landmarks: Point[]) {
        const features = {
            // 手指弯曲度
            thumbCurvature: this.getFingerCurvature(landmarks, 4, 3, 2),
            indexCurvature: this.getFingerCurvature(landmarks, 8, 6, 5),
            middleCurvature: this.getFingerCurvature(landmarks, 12, 10, 9),
            ringCurvature: this.getFingerCurvature(landmarks, 16, 14, 13),
            pinkyCurvature: this.getFingerCurvature(landmarks, 20, 18, 17),

            // 手指伸展度
            thumbExtension: this.getFingerExtension(landmarks, 4, 2),
            indexExtension: this.getFingerExtension(landmarks, 8, 5),
            middleExtension: this.getFingerExtension(landmarks, 12, 9),
            ringExtension: this.getFingerExtension(landmarks, 16, 13),
            pinkyExtension: this.getFingerExtension(landmarks, 20, 17),

            // 手指间距离
            thumbIndexDistance: this.getDistance(landmarks[4], landmarks[8]),
            indexMiddleDistance: this.getDistance(landmarks[8], landmarks[12]),
            middleRingDistance: this.getDistance(landmarks[12], landmarks[16]),
            ringPinkyDistance: this.getDistance(landmarks[16], landmarks[20]),

            // 整体手势特征
            handSpread: this.getDistance(landmarks[4], landmarks[20]), // 拇指到小指的距离
            palmWidth: this.getDistance(landmarks[5], landmarks[17]), // 手掌宽度
        };

        return features;
    }

    // 基于特征的手势识别
    recognizeByFeatures(features: any, landmarks: Point[]) {
        // 比心手势：优先级最高，避免被误判为停止手势
        if (this.isHeartGesture(landmarks, features)) {
            return {
                name: '比心',
                emoji: '💖',
                confidence: 0.9,
                type: 'hand'
            };
        }

        // 胜利手势：第二优先级
        if (this.isVictoryGesture(landmarks, features)) {
            return {
                name: '胜利手势',
                emoji: '✌️',
                confidence: 0.9,
                type: 'hand'
            };
        }

        // 拳头：所有手指都弯曲，手掌紧握
        if (features.indexCurvature > 0.6 &&
            features.middleCurvature > 0.6 &&
            features.ringCurvature > 0.6 &&
            features.pinkyCurvature > 0.6 &&
            features.handSpread < 0.12) {
            return {
                name: '拳头',
                emoji: '✊',
                confidence: 0.9,
                type: 'hand'
            };
        }

        // 点赞：拇指伸展，其他手指弯曲
        if (!this.isThumbDown(landmarks) && features.thumbExtension > 1.3 &&
            features.indexCurvature > 0.5 &&
            features.middleCurvature > 0.5 &&
            features.ringCurvature > 0.5 &&
            features.pinkyCurvature > 0.5) {
            return {
                name: '点赞',
                emoji: '👍',
                confidence: 0.9,
                type: 'hand'
            };
        }

        // 点踩：拇指向下伸展，其他手指弯曲
        if (this.isThumbDown(landmarks) &&
            features.indexCurvature > 0.5 &&
            features.middleCurvature > 0.5 &&
            features.ringCurvature > 0.5 &&
            features.pinkyCurvature > 0.5) {
            return {
                name: '点踩',
                emoji: '👎',
                confidence: 0.9,
                type: 'hand'
            };
        }

        // 指向：只有食指伸展
        if (features.indexExtension > 1.3 &&
            features.middleCurvature > 0.5 &&
            features.ringCurvature > 0.5 &&
            features.pinkyCurvature > 0.5 &&
            features.thumbCurvature > 0.3) {
            return {
                name: '指向',
                emoji: '👉',
                confidence: 0.85,
                type: 'hand'
            };
        }

        // OK手势：拇指和食指接近，其他手指伸展
        if (features.thumbIndexDistance < 0.04 &&
            features.middleExtension > 1.1 &&
            features.ringExtension > 1.1 &&
            features.pinkyExtension > 1.1) {
            return {
                name: 'OK手势',
                emoji: '👌',
                confidence: 0.85,
                type: 'hand'
            };
        }

        // 停止手势：所有手指伸展，手掌张开（放在最后，避免误判）
        if (features.indexExtension > 1.2 &&
            features.middleExtension > 1.2 &&
            features.ringExtension > 1.2 &&
            features.pinkyExtension > 1.2 &&
            features.thumbExtension > 1.1 && // 增加拇指伸展要求
            features.handSpread > 0.16) { // 提高手掌张开要求
            return {
                name: '掌开手势',
                emoji: '✋',
                confidence: 0.8,
                type: 'hand'
            };
        }
        return null;
    }

    // 检测拇指向下的特殊函数
    isThumbDown(landmarks: Point[]) {
        const thumbTip = landmarks[4];
        const thumbIp = landmarks[3];
        const thumbMcp = landmarks[2];
        const wrist = landmarks[0];

        // 拇指向下的特征：
        // 1. 拇指尖在拇指关节下方
        const tipBelowJoint = thumbTip.y > thumbIp.y && thumbTip.y > thumbMcp.y;

        // 2. 拇指尖相对于手腕的位置（考虑手部可能的旋转）
        const thumbDirection = {
            x: thumbTip.x - wrist.x,
            y: thumbTip.y - wrist.y
        };

        // 3. 拇指应该远离手掌中心
        const thumbDistance = this.getDistance(thumbTip, wrist);
        const mcpDistance = this.getDistance(thumbMcp, wrist);
        const isExtended = thumbDistance > mcpDistance * 1.1;

        return tipBelowJoint && isExtended;
    }

    detect(results: any) {
        if (!results.leftHandLandmarks && !results.rightHandLandmarks) {
            return null;
        }

        const handLandmarks = results.rightHandLandmarks || results.leftHandLandmarks;
        if (!handLandmarks || handLandmarks.length < 21) {
            return null;
        }

        // 检查关键点可见性
        const fingerTips = [4, 8, 12, 16, 20];
        const visibleTips = fingerTips.filter(i => this.isLandmarkVisible(handLandmarks[i]));

        if (visibleTips.length < 3) {
            return null;
        }

        return this.recognizeGesture(handLandmarks);
    }

    recognizeGesture(landmarks: Point[]) {
        // 提取手势特征
        const features = this.getGestureFeatures(landmarks);

        if (this.debugMode) {
            console.log('手势特征:', {
                弯曲度: {
                    拇指: features.thumbCurvature.toFixed(2),
                    食指: features.indexCurvature.toFixed(2),
                    中指: features.middleCurvature.toFixed(2),
                    无名指: features.ringCurvature.toFixed(2),
                    小指: features.pinkyCurvature.toFixed(2)
                },
                伸展度: {
                    拇指: features.thumbExtension.toFixed(2),
                    食指: features.indexExtension.toFixed(2),
                    中指: features.middleExtension.toFixed(2),
                    无名指: features.ringExtension.toFixed(2),
                    小指: features.pinkyExtension.toFixed(2)
                },
                手掌张开度: features.handSpread.toFixed(3),
                拇指食指距离: features.thumbIndexDistance.toFixed(3)
            });
        }

        // 基于特征进行识别（传递landmarks参数）
        return this.recognizeByFeatures(features, landmarks);
    }
}

export {
    HandDetector
}