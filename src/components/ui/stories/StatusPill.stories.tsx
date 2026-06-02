import type { Meta, StoryObj } from "@storybook/react";
import { StatusPill } from "../StatusPill";
import { mobileViewport } from "./decorators";

const meta: Meta<typeof StatusPill> = {
  title: "UI/StatusPill",
  component: StatusPill,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatusPill>;

export const DarkDefault: Story = {
  name: "Dark · default",
  parameters: { themes: { themeOverride: "dark" } },
  args: { children: "推荐", variant: "accent" },
};

export const LightDefault: Story = {
  name: "Light · default",
  parameters: { themes: { themeOverride: "light" } },
  args: { children: "推荐", variant: "accent" },
};

export const DarkHover: Story = {
  name: "Dark · hover",
  parameters: { themes: { themeOverride: "dark" } },
  args: { children: "等待牌面", variant: "status" },
};

export const DarkActive: Story = {
  name: "Dark · active",
  parameters: { themes: { themeOverride: "dark" } },
  args: { children: "已固定", variant: "muted" },
};

export const MobileDark: Story = {
  name: "Mobile · dark",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  args: { children: "推荐", variant: "accent" },
};
