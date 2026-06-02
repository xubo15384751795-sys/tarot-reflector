// @vitest-environment jsdom
/**
 * ModeSelector 组件测试
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ModeSelector from "@/components/ModeSelector";

// Mock framer-motion to avoid animation issues in tests
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

describe("ModeSelector", () => {
  it("渲染三种模式卡片", () => {
    const onSelect = vi.fn();
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getByText("今日一牌")).toBeInTheDocument();
    expect(screen.getByText("问题解读")).toBeInTheDocument();
    expect(screen.getByText("深度牌阵")).toBeInTheDocument();
  });

  it("显示推荐标签", () => {
    const onSelect = vi.fn();
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getByText("推荐")).toBeInTheDocument();
  });

  it("显示描述文本", () => {
    const onSelect = vi.fn();
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getByText("没有具体问题时使用。")).toBeInTheDocument();
    expect(screen.getByText("带着一个具体问题进入。")).toBeInTheDocument();
    expect(screen.getByText("适合反复出现、暂时说不清的问题。")).toBeInTheDocument();
  });

  it("卡片可点击触发 onSelect", async () => {
    const onSelect = vi.fn();
    render(<ModeSelector onSelect={onSelect} />);

    const dailyCard = screen.getByLabelText(/今日一牌/);
    dailyCard.click();

    // onSelect is called after a 420ms timeout
    await new Promise((r) => setTimeout(r, 500));
    expect(onSelect).toHaveBeenCalledWith("daily");
  });
});
