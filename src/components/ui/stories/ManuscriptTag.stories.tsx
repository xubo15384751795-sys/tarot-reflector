import type { Meta, StoryObj } from "@storybook/react";
import { ManuscriptTag } from "../ManuscriptTag";
import { mobileViewport, forceHover } from "./decorators";

const meta: Meta<typeof ManuscriptTag> = {
  title: "UI/ManuscriptTag",
  component: ManuscriptTag,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ManuscriptTag>;

export const DarkDefault: Story = {
  name: "Dark · default",
  parameters: { themes: { themeOverride: "dark" } },
  args: { children: "自我" },
};

export const DarkActive: Story = {
  name: "Dark · active",
  parameters: { themes: { themeOverride: "dark" } },
  args: { children: "感情", active: true },
};

export const LightHover: Story = {
  name: "Light · hover",
  decorators: [forceHover],
  parameters: { themes: { themeOverride: "light" } },
  args: { children: "工作" },
};

export const MobileDark: Story = {
  name: "Mobile · dark",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  args: { children: "学习", active: true },
};
