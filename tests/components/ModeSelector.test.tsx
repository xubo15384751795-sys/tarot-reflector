// @vitest-environment jsdom
/**
 * ModeSelector 组件测试
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ModeSelector from "@/components/ModeSelector";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    button: ({ children, ...props }: React.ComponentPropsWithoutRef<"button">) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<"div">) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/lib/useFoilSpotlight", () => ({
  useFoilSpotlight: () => {},
}));

vi.mock("@/features/motion/modeFlip.gsap", () => ({
  captureModeFlipState: vi.fn(() => ({})),
  playModeSelectionFlip: vi.fn(),
}));

describe("ModeSelector", () => {
  it("渲染三种模式入口", () => {
    const onSelect = vi.fn();
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getByText("今日一牌")).toBeInTheDocument();
    expect(screen.getByText("问题解读")).toBeInTheDocument();
    expect(screen.getByText("深度牌阵")).toBeInTheDocument();
    expect(screen.getByAltText("塔罗牌背面")).toBeInTheDocument();
  });

  it("显示默认推荐提示", () => {
    const onSelect = vi.fn();
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getByText(/问题解读最常用/)).toBeInTheDocument();
  });

  it("显示描述文本", () => {
    const onSelect = vi.fn();
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getByText("没有具体问题时使用。")).toBeInTheDocument();
    expect(screen.getByText("带着一个具体问题进入。")).toBeInTheDocument();
    expect(screen.getByText("反复出现、暂时说不清的问题。")).toBeInTheDocument();
  });

  it("每个入口的 tagline 与 description 不重复", () => {
    const onSelect = vi.fn();
    const { container } = render(<ModeSelector onSelect={onSelect} />);

    for (const slot of container.querySelectorAll(".mode-deck-slot")) {
      const tagline = slot.querySelector(".mode-deck-slot__tagline")?.textContent;
      const description = slot.querySelector(
        ".mode-deck-slot__description",
      )?.textContent;
      expect(tagline).toBeTruthy();
      expect(description).toBeTruthy();
      // 「深度牌阵」原本两行说的是同一句话，读起来像重复排版事故
      expect(description).not.toContain(tagline!.replace(/。$/, ""));
    }
  });

  it("入口可点击触发 onSelect", async () => {
    const onSelect = vi.fn();
    render(<ModeSelector onSelect={onSelect} />);

    const dailyCard = screen.getByLabelText(/今日一牌/);
    dailyCard.click();

    await new Promise((r) => setTimeout(r, 50));
    expect(onSelect).toHaveBeenCalledWith("daily");
  });
});
