import type { Meta, StoryObj } from "@storybook/react";
import { ArchiveGroupCard } from "../ArchiveGroupCard";
import { mobileViewport, forceHover } from "./decorators";

const meta: Meta<typeof ArchiveGroupCard> = {
  title: "UI/ArchiveGroupCard",
  component: ArchiveGroupCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ArchiveGroupCard>;

const base = {
  meta: "MAJOR · 22",
  title: "大阿尔卡那",
  subtitle: "22 张命运原型，从愚者到世界。",
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
  name: "Dark · active",
  parameters: { themes: { themeOverride: "dark" } },
  args: { ...base, active: true },
};

export const MobileDark: Story = {
  name: "Mobile · dark",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  args: base,
};
