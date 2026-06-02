import type { Meta, StoryObj } from "@storybook/react";
import { MotifHotspot } from "../MotifHotspot";
import { SymbolPopover } from "../SymbolPopover";
import { mobileViewport } from "./decorators";

const meta: Meta<typeof SymbolPopover> = {
  title: "UI/SymbolPopover",
  component: SymbolPopover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SymbolPopover>;

const trigger = (
  <MotifHotspot id="star" label="八芒星" x={0.5} y={0.5} active />
);

const content = (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] tracking-[0.14em]" style={{ color: "var(--accent)" }}>
      八芒星
    </span>
    <p className="text-[12px] leading-[1.65]" style={{ color: "var(--text-secondary)" }}>
      希望与疗愈的微光，从牌面符号附近浮现。
    </p>
  </div>
);

export const DarkDefault: Story = {
  name: "Dark · default",
  parameters: { themes: { themeOverride: "dark" } },
  args: { trigger, children: content, open: true },
};

export const LightDefault: Story = {
  name: "Light · default",
  parameters: { themes: { themeOverride: "light" } },
  args: { trigger, children: content, open: true },
};

export const DarkHover: Story = {
  name: "Dark · hover",
  parameters: { themes: { themeOverride: "dark" } },
  args: { trigger, children: content, open: true },
};

export const DarkActive: Story = {
  name: "Dark · active",
  parameters: { themes: { themeOverride: "dark" } },
  args: { trigger, children: content, open: true },
};

export const MobileDark: Story = {
  name: "Mobile · dark",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  args: { trigger, children: content, open: true },
};
