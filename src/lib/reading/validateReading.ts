/**
 * 解读结果校验（接 AI 后建议在校验通过再返回前端）
 */

import type { TarotReading } from "../schema";

export class ReadingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReadingValidationError";
  }
}

export function validateReading(reading: TarotReading): void {
  if (!reading.thesis?.trim()) {
    throw new ReadingValidationError("缺少 thesis 字段");
  }
  if (!Array.isArray(reading.scenes) || reading.scenes.length === 0) {
    throw new ReadingValidationError("scenes 必须是非空数组");
  }
  for (const scene of reading.scenes) {
    if (!scene.step_label?.trim()) {
      throw new ReadingValidationError(`scene ${scene.scene_id} 缺少 step_label`);
    }
    if (!scene.headline?.trim()) {
      throw new ReadingValidationError(`scene ${scene.scene_id} 缺少 headline`);
    }
    if (!scene.body?.trim()) {
      throw new ReadingValidationError(`scene ${scene.scene_id} 缺少 body`);
    }
  }
  if (!reading.image?.startsWith("/")) {
    throw new ReadingValidationError("image 必须是 /public 下的路径");
  }
}
