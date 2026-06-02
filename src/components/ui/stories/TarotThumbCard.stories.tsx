import type { Meta, StoryObj } from "@storybook/react";
import { TarotThumbCard } from "../TarotThumbCard";
import { mobileViewport, forceHover, reducedMotion } from "./decorators";

const meta: Meta<typeof TarotThumbCard> = {
  title: "UI/TarotThumbCard",
  component: TarotThumbCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TarotThumbCard>;

const base = {
  nameZh: "愚者",
  nameEn: "The Fool",
  imageSrc: "/cards/major/the_fool.jpg",
  indexLabel: "00",
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
  args: { ...base, onClick: () => {} },
};

export const MobileDark: Story = {
  name: "Mobile · dark",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  args: base,
};

export const ReducedMotion: Story = {
  name: "Reduced motion",
  decorators: [reducedMotion],
  parameters: { themes: { themeOverride: "dark" } },
  args: base,
};
