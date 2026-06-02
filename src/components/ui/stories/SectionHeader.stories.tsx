import type { Meta, StoryObj } from "@storybook/react";
import { SectionHeader } from "../SectionHeader";
import { mobileViewport, forceHover, reducedMotion } from "./decorators";

const meta: Meta<typeof SectionHeader> = {
  title: "UI/SectionHeader",
  component: SectionHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const DarkDefault: Story = {
  name: "Dark · default",
  parameters: { themes: { themeOverride: "dark" } },
  args: {
    kicker: "ARCH.02",
    title: "科普",
    subtitle: "塔罗、牌阵与使用方式",
  },
};

export const LightDefault: Story = {
  name: "Light · default",
  parameters: { themes: { themeOverride: "light" } },
  args: { ...DarkDefault.args },
};

export const LeftAlign: Story = {
  name: "Dark · left",
  parameters: { themes: { themeOverride: "dark" } },
  args: { ...DarkDefault.args, align: "left" as const },
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
