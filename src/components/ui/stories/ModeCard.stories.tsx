import type { Meta, StoryObj } from "@storybook/react";
import { ModeCard } from "../ModeCard";
import { mobileViewport, forceHover } from "./decorators";

const meta: Meta<typeof ModeCard> = {
  title: "UI/ModeCard",
  component: ModeCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ModeCard>;

const base = {
  index: 2,
  title: "问题解读",
  tagline: "带着一个具体问题进入。",
  description: "系统会先帮你澄清，再推荐合适的牌阵。",
  recommended: true,
};

export const DarkDefault: Story = {
  name: "Dark · default",
  parameters: { themes: { themeOverride: "dark" } },
  args: base,
};

export const LightDefault: Story = {
  name: "Light · default",
  parameters: { themes: { themeOverride: "light" } },
  args: base,
};

export const DarkHover: Story = {
  name: "Dark · hover",
  decorators: [forceHover],
  parameters: { themes: { themeOverride: "dark" } },
  args: base,
};

export const DarkActive: Story = {
  name: "Dark · active (chosen)",
  parameters: { themes: { themeOverride: "dark" } },
  args: { ...base, chosen: true },
};

export const MobileDark: Story = {
  name: "Mobile · dark",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  args: base,
};
