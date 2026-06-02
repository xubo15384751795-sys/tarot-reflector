import type { Meta, StoryObj } from "@storybook/react";
import ThemeToggle from "@/components/ThemeToggle";
import { mobileViewport, forceHover, reducedMotion } from "./decorators";

const meta: Meta<typeof ThemeToggle> = {
  title: "UI/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const PillDark: Story = {
  name: "Pill · dark",
  parameters: { themes: { themeOverride: "dark" } },
  args: { variant: "pill" },
};

export const PillLight: Story = {
  name: "Pill · light",
  parameters: { themes: { themeOverride: "light" } },
  args: { variant: "pill" },
};

export const IconDark: Story = {
  name: "Icon · dark",
  parameters: { themes: { themeOverride: "dark" } },
  args: { variant: "icon" },
};

export const IconHover: Story = {
  name: "Icon · hover",
  decorators: [forceHover],
  parameters: { themes: { themeOverride: "dark" } },
  args: { variant: "icon" },
};

export const MobileIcon: Story = {
  name: "Mobile · icon",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  args: { variant: "icon" },
};

export const ReducedMotion: Story = {
  name: "Reduced motion",
  decorators: [reducedMotion],
  parameters: { themes: { themeOverride: "dark" } },
  args: { variant: "pill" },
};
