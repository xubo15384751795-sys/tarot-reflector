import type { Meta, StoryObj } from "@storybook/react";
import Image from "next/image";
import { MotifHotspot } from "../MotifHotspot";
import { TarotCardFrame } from "../TarotCardFrame";
import { mobileViewport } from "./decorators";

const meta: Meta<typeof MotifHotspot> = {
  title: "UI/MotifHotspot",
  component: MotifHotspot,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MotifHotspot>;

const cardImage = "/cards/major/major_00_fool.jpg";

function HotspotStage({ active = false }: { active?: boolean }) {
  return (
    <TarotCardFrame solo>
      <Image src={cardImage} alt="愚者" fill sizes="360px" className="object-cover" />
      <MotifHotspot id="sun" label="太阳" x={0.72} y={0.18} active={active} dimmed={false} />
      <MotifHotspot id="dog" label="白狗" x={0.38} y={0.78} active={false} dimmed={active} />
    </TarotCardFrame>
  );
}

export const DarkDefault: Story = {
  name: "Dark · default",
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <HotspotStage />,
};

export const LightDefault: Story = {
  name: "Light · default",
  parameters: { themes: { themeOverride: "light" } },
  render: () => <HotspotStage />,
};

export const DarkHover: Story = {
  name: "Dark · hover",
  parameters: { themes: { themeOverride: "dark" } },
  render: () => (
    <div className="storybook-force-hover">
      <HotspotStage />
    </div>
  ),
};

export const DarkActive: Story = {
  name: "Dark · active",
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <HotspotStage active />,
};

export const MobileDark: Story = {
  name: "Mobile · dark",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <HotspotStage active />,
};
