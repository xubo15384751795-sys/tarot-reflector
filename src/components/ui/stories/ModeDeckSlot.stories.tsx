import type { Meta, StoryObj } from "@storybook/react";
import { ModeDeckSlot } from "../ModeDeckSlot";
import { mobileViewport, forceHover } from "./decorators";

const meta: Meta<typeof ModeDeckSlot> = {
  title: "UI/ModeDeckSlot",
  component: ModeDeckSlot,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ModeDeckSlot>;

const base = {
  mode: "question",
  title: "问题解读",
  tagline: "带着一个具体问题进入。",
  description: "先澄清问题，再推荐合适的牌阵。",
  variant: "primary" as const,
};

export const DarkDefault: Story = {
  name: "Dark · primary",
  parameters: { themes: { themeOverride: "dark" } },
  args: base,
};

export const LightDefault: Story = {
  name: "Light · primary",
  parameters: { themes: { themeOverride: "light" } },
  args: base,
};

export const DarkHover: Story = {
  name: "Dark · hover",
  decorators: [forceHover],
  parameters: { themes: { themeOverride: "dark" } },
  args: base,
};

export const DarkChosen: Story = {
  name: "Dark · chosen",
  parameters: { themes: { themeOverride: "dark" } },
  args: { ...base, chosen: true },
};

export const TertiaryLight: Story = {
  name: "Light · tertiary",
  parameters: { themes: { themeOverride: "light" } },
  args: {
    mode: "deep",
    title: "深度牌阵",
    tagline: "反复出现、暂时说不清的问题",
    variant: "tertiary",
  },
};

export const MobileDark: Story = {
  name: "Mobile · dark",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  args: base,
};
