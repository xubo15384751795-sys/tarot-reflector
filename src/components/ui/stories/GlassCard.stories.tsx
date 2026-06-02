import type { Meta, StoryObj } from "@storybook/react";
import { GlassCard } from "../GlassCard";
import { mobileViewport, forceHover } from "./decorators";

const meta: Meta<typeof GlassCard> = {
  title: "UI/GlassCard",
  component: GlassCard,
  tags: ["autodocs"],
  parameters: {
    themes: { themeOverride: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof GlassCard>;

export const DarkDefault: Story = {
  name: "Dark · default",
  parameters: { themes: { themeOverride: "dark" } },
  args: {
    children: (
      <>
        <p className="text-[11px] tracking-[0.16em]" style={{ color: "var(--accent)" }}>
          COD.GLASS
        </p>
        <p className="mt-2 text-[15px]" style={{ color: "var(--text-primary)" }}>
          月光玻璃容器
        </p>
        <p className="mt-1 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          用于焦点内容，不是 Dashboard 卡片。
        </p>
      </>
    ),
    glow: true,
  },
};

export const LightDefault: Story = {
  name: "Light · default",
  parameters: { themes: { themeOverride: "light" } },
  args: { ...DarkDefault.args },
};

export const DarkHover: Story = {
  name: "Dark · hover",
  decorators: [forceHover],
  parameters: { themes: { themeOverride: "dark" } },
  args: { ...DarkDefault.args, className: "interactive-glow" },
};

export const DarkActive: Story = {
  name: "Dark · active",
  parameters: { themes: { themeOverride: "dark" } },
  args: {
    ...DarkDefault.args,
    className: "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-base)]",
  },
};

export const MobileDark: Story = {
  name: "Mobile · dark",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  args: DarkDefault.args,
};
