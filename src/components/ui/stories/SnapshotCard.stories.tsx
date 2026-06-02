import type { Meta, StoryObj } from "@storybook/react";
import { SnapshotCard } from "../SnapshotCard";
import { mobileViewport, forceHover, reducedMotion } from "./decorators";

const meta: Meta<typeof SnapshotCard> = {
  title: "UI/SnapshotCard",
  component: SnapshotCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SnapshotCard>;

export const DarkDefault: Story = {
  name: "Dark · default",
  parameters: { themes: { themeOverride: "dark" } },
  args: {
    meta: "问题解读 · 3 天前",
    title: "我应该换工作吗？",
    subtitle: "愚者 · 星币八 — 牌面像在说：先看清眼前这一步。",
    noteCount: 2,
  },
};

export const Pinned: Story = {
  name: "Dark · pinned",
  parameters: { themes: { themeOverride: "dark" } },
  args: { ...DarkDefault.args, pinned: true },
};

export const LightDefault: Story = {
  name: "Light · default",
  parameters: { themes: { themeOverride: "light" } },
  args: DarkDefault.args,
};

export const DarkHover: Story = {
  name: "Dark · hover",
  decorators: [forceHover],
  parameters: { themes: { themeOverride: "dark" } },
  args: { ...DarkDefault.args, onOpen: () => {} },
};

export const MobileDark: Story = {
  name: "Mobile · dark",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  args: DarkDefault.args,
};

export const ReducedMotion: Story = {
  name: "Reduced motion",
  decorators: [reducedMotion],
  parameters: { themes: { themeOverride: "dark" } },
  args: DarkDefault.args,
};
