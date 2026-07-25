// @vitest-environment jsdom
/**
 * ReadingScrollDocument —— 解读卷轴。
 *
 * 这里锁的是 P1 重构的核心不变量：逐张解读、牌间关系、收束必须在
 * **同一份文档**里同时存在，而不是三个互相替换的全屏 stage。
 * 一旦有人把它改回「一屏一张 + 继续翻阅」，这些断言会失败。
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ReadingScrollDocument from "@/features/reading/components/ReadingScrollDocument";
import type { ReadingScript } from "@/features/reading/types/reading";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get:
        (_t, tag: string) =>
        ({ children, ...props }: React.ComponentPropsWithoutRef<"div">) => {
          const Tag = tag as "div";
          return <Tag {...props}>{children}</Tag>;
        },
    },
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

/** jsdom 没有 IntersectionObserver；卷轴用它回报「读到第几张」 */
class FakeIntersectionObserver {
  observed: Element[] = [];
  constructor(
    public cb: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }
  static instances: FakeIntersectionObserver[] = [];
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  /** 模拟某一段横跨判定线 */
  cross(el: Element) {
    this.cb(
      [{ target: el, isIntersecting: true } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

const card = (i: number, id: string, zh: string, position: string) => ({
  card_id: id,
  card_name: id,
  zh_name: zh,
  orientation: "upright" as const,
  image: `/cards/${id}.jpg`,
  position_name: position,
  position_index: i,
  motifs: [],
});

function makeScript(cardCount: number): ReadingScript {
  const cards = [
    card(0, "wands_7", "权杖七", "过去影响"),
    card(1, "cups_3", "圣杯三", "当前状态"),
    card(2, "swords_two", "宝剑二", "未来趋势"),
  ].slice(0, cardCount);

  return {
    title: "关于要不要换工作这件事",
    thesis: "你已经比自己以为的更清楚答案了。",
    spread_id: (cardCount > 1 ? "past_present_trend" : "single_card") as never,
    spread_name_zh: cardCount > 1 ? "过去现在趋势" : "单牌解读",
    cards,
    card_id: cards[0].card_id,
    card_name: cards[0].card_name,
    zh_name: cards[0].zh_name,
    orientation: cards[0].orientation,
    domain: "career",
    motifs: [],
    image: cards[0].image,
    scenes: cards.map((c, i) => ({
      scene_id: i,
      type: "position" as never,
      step_label: `第 ${i + 1} 幕`,
      headline: c.position_name,
      body: `这是第 ${i + 1} 张牌的解读正文。`,
      visual_direction: "",
      duration: 8,
    })),
    closing_line: "不用今天就决定。",
    disclaimer: "塔罗提供的是视角，不是预言。",
    analysis:
      cardCount > 1
        ? {
            major_arcana_count: 0,
            suit_counts: { wands: 1, cups: 1, swords: 1 },
            reversal_count: 1,
            element_balance: {},
            relationship_notes: ["三张牌分属火、水、风。"],
          }
        : undefined,
  } as ReadingScript;
}

type DocProps = React.ComponentProps<typeof ReadingScrollDocument>;

function renderDoc(cardCount: number, overrides: Partial<DocProps> = {}) {
  const props = {
    script: makeScript(cardCount),
    domain: "career",
    currentPosition: 0,
    aiPending: false,
    readingSlowHint: false,
    onPositionInView: vi.fn(),
    onReachSummary: vi.fn(),
    onReplay: vi.fn(),
    onWriteNote: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  const utils = render(<ReadingScrollDocument {...props} />);
  return { ...utils, props };
}

describe("ReadingScrollDocument", () => {
  it("把每张牌的解读、牌间关系、收束渲染进同一份文档", () => {
    const { container } = renderDoc(3);

    // 三张牌的正文同时在场——不是一次只显示一张
    expect(screen.getByText("这是第 1 张牌的解读正文。")).toBeInTheDocument();
    expect(screen.getByText("这是第 2 张牌的解读正文。")).toBeInTheDocument();
    expect(screen.getByText("这是第 3 张牌的解读正文。")).toBeInTheDocument();

    // 关系段与收束段也在同一棵树里
    expect(
      container.querySelector('[data-section="summary"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".reading-scroll__section--relations"),
    ).toBeInTheDocument();
  });

  it("不再渲染「继续翻阅 / 查看整体解读」这类翻页按钮", () => {
    renderDoc(3);
    expect(screen.queryByText(/继续翻阅/)).not.toBeInTheDocument();
    expect(screen.queryByText(/查看关系分析/)).not.toBeInTheDocument();
    expect(screen.queryByText(/查看整体解读/)).not.toBeInTheDocument();
  });

  it("滚动到某一段时回报对应的牌序号", () => {
    const { container, props } = renderDoc(3);
    const observer = FakeIntersectionObserver.instances[0];
    expect(observer).toBeTruthy();

    const second = container.querySelector('[data-position-index="1"]')!;
    observer.cross(second);
    expect(props.onPositionInView).toHaveBeenCalledWith(1);

    // 往回滚同样回报——幻灯片时代做不到这件事
    const first = container.querySelector('[data-position-index="0"]')!;
    observer.cross(first);
    expect(props.onPositionInView).toHaveBeenLastCalledWith(0);
  });

  it("滚到收束段时回报 onReachSummary 而不是当作某一张牌", () => {
    const { container, props } = renderDoc(3);
    const observer = FakeIntersectionObserver.instances[0];

    observer.cross(container.querySelector('[data-section="summary"]')!);
    expect(props.onReachSummary).toHaveBeenCalled();
    expect(props.onPositionInView).not.toHaveBeenCalled();
  });

  it("判定线是零高度的（同一时刻只有一段横跨），避免短段落选错牌", () => {
    renderDoc(3);
    const { options } = FakeIntersectionObserver.instances[0];
    const margins = String(options?.rootMargin ?? "").match(/-?\d+(?:\.\d+)?/g) ?? [];
    const top = Number(margins[0]);
    const bottom = Number(margins[2]);
    expect(top + bottom).toBe(-100);
  });

  it("sticky 牌面显示 currentPosition 指向的那张", () => {
    renderDoc(3, { currentPosition: 2 });
    expect(
      document.querySelector(".reading-scroll__stage-name")?.textContent,
    ).toBe("宝剑二");
  });

  it("单牌时不渲染关系段和序号", () => {
    const { container } = renderDoc(1);
    expect(
      container.querySelector(".reading-scroll__section--relations"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("1 / 1")).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-section="summary"]'),
    ).toBeInTheDocument();
  });

  it("aiPending 时显示柔和状态条，不阻挡内容", () => {
    const { container } = renderDoc(3, { aiPending: true });
    const hint = container.querySelector(".reading-pending-hint");
    expect(hint).toBeInTheDocument();
    expect(hint?.getAttribute("role")).toBe("status");
    // 内容仍然在场
    expect(screen.getByText("这是第 1 张牌的解读正文。")).toBeInTheDocument();
  });
});
