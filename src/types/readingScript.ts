/**
 * ReadingScript — 统一解读脚本类型
 *
 * 同时服务：
 * - 网页交互解读
 * - 自动演示播放
 * - 未来 Remotion 视频导出
 */

export type VideoStyle = "moonlight_archive" | "moon_paper" | "black_gold";

export type AspectRatio = "9:16" | "16:9" | "1:1";

export type CameraMovement =
  | "static"
  | "slow_push_in"
  | "slow_pull_back"
  | "pan_to_motif"
  | "card_flip";

export type SceneTransition = "fade" | "blur" | "slide" | "card_flip";

export type SceneLayout =
  | "single_card"
  | "spread_overview"
  | "card_with_text"
  | "text_only"
  | "summary";

export type VideoSceneType =
  | "opening"
  | "shuffle"
  | "card_reveal"
  | "position_reading"
  | "motif_focus"
  | "relationship_analysis"
  | "advice"
  | "closing";

export type VideoScene = {
  scene_id: number;
  type: VideoSceneType;
  /** 该幕时长（秒） */
  duration: number;
  /** 大标题 */
  headline_zh: string;
  /** 正文 */
  body_zh: string;
  /** 旁白文案（适合朗读，自然口语） */
  voiceover_zh: string;
  /** 字幕文案（适合屏幕显示，更短） */
  subtitle_zh: string;
  /** 该幕聚焦的牌 */
  active_card_id?: string;
  /** 该幕聚焦的牌阵位置 */
  active_position_index?: number;
  /** 该幕聚焦的牌面元素 */
  focus_motif?: string | null;
  /** 牌面注释标签 */
  annotation_label_zh?: string | null;
  /** 视觉指令 */
  visual: {
    layout: SceneLayout;
    camera: CameraMovement;
    transition: SceneTransition;
    background: VideoStyle;
  };
};

export type VideoCover = {
  title_zh: string;
  subtitle_zh: string;
  keywords_zh: string[];
  cover_card_id: string;
};

export type ReadingScript = {
  reading_id: string;
  title_zh: string;
  video_style: VideoStyle;
  aspect_ratios: AspectRatio[];
  /** 总时长（秒） */
  total_duration: number;
  scenes: VideoScene[];
  cover: VideoCover;
  /** 原始解读 ID 关联 */
  source_reading_id?: string;
  generated_at: string;
};

/** 网页播放模式 */
export type PlaybackMode = "interactive" | "demo";

/** 演示播放器状态 */
export type DemoPlayerState = {
  currentScene: number;
  isPlaying: boolean;
  elapsed: number;
  /** 是否显示字幕 */
  showSubtitles: boolean;
  /** 是否显示旁白 */
  showVoiceover: boolean;
};
