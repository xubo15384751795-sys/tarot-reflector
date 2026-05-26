/**
 * POST /api/reading/draw — 抽牌
 *
 * 纯本地逻辑，不需要 AI。随机抽取指定牌阵的牌。
 */

import { NextRequest, NextResponse } from "next/server";
import { drawForSpread, getSpread } from "@/lib/drawCards";
import type { SpreadId } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      spread_id?: string;
      allow_reversed?: boolean;
      seed?: string;
    };

    const spreadId = (body.spread_id ?? "single_card") as SpreadId;

    // 验证牌阵存在
    let spread;
    try {
      spread = getSpread(spreadId);
    } catch {
      return NextResponse.json(
        { error: `未知牌阵: ${spreadId}` },
        { status: 400 }
      );
    }

    // 抽牌
    const drawnCards = drawForSpread(spreadId);

    // 如果不允许逆位，全部设为正位
    if (body.allow_reversed === false) {
      drawnCards.forEach((dc) => {
        dc.orientation = "upright";
      });
    }

    const readingId = `reading_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    return NextResponse.json({
      reading_id: readingId,
      spread_id: spreadId,
      spread_name_zh: spread.name_zh,
      drawn_cards: drawnCards.map((dc) => ({
        position_index: dc.position_index,
        position_name_zh: dc.position.name_zh,
        card_id: dc.card.id,
        card_name_zh: dc.card.name_zh,
        card_name_en: dc.card.name_en,
        orientation: dc.orientation,
        orientation_zh: dc.orientation === "upright" ? "正位" : "逆位",
        image: dc.card.image,
      })),
    });
  } catch (error) {
    console.error("Draw failed:", error);
    return NextResponse.json(
      { error: "抽牌失败，请重试。" },
      { status: 500 }
    );
  }
}
