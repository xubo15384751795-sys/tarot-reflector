import type { Meta, StoryObj } from "@storybook/react";
import Image from "next/image";
import { TarotCardFrame } from "../TarotCardFrame";
import { mobileViewport } from "./decorators";

const meta: Meta<typeof TarotCardFrame> = {
  title: "UI/TarotCardFrame",
  component: TarotCardFrame,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TarotCardFrame>;

const cardImage = "/cards/major/major_00_fool.jpg";

function CardContent() {
  return (
    <Image
      src={cardImage}
      alt="愚者"
      fill
      sizes="360px"
      className="motif-canvas__image tarot-card-image object-cover"
    />
  );
}

export const DarkDefault: Story = {
  name: "Dark · default",
  parameters: { themes: { themeOverride: "dark" } },
  render: () => (
    <TarotCardFrame solo>
      <CardContent />
    </TarotCardFrame>
  ),
};

export const LightDefault: Story = {
  name: "Light · default",
  parameters: { themes: { themeOverride: "light" } },
  render: () => (
    <TarotCardFrame solo>
      <CardContent />
    </TarotCardFrame>
  ),
};

export const DarkHover: Story = {
  name: "Dark · hover",
  parameters: { themes: { themeOverride: "dark" } },
  render: () => (
    <div className="storybook-force-hover">
      <TarotCardFrame solo className="interactive-glow">
        <CardContent />
      </TarotCardFrame>
    </div>
  ),
};

export const DarkActive: Story = {
  name: "Dark · active",
  parameters: { themes: { themeOverride: "dark" } },
  render: () => (
    <TarotCardFrame solo className="ring-2 ring-[var(--accent)]">
      <CardContent />
    </TarotCardFrame>
  ),
};

export const MobileDark: Story = {
  name: "Mobile · dark",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  render: () => (
    <TarotCardFrame solo>
      <CardContent />
    </TarotCardFrame>
  ),
};
