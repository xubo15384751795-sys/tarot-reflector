import type { Meta, StoryObj } from "@storybook/react";
import Image from "next/image";
import { NoteCard } from "../NoteCard";
import { mobileViewport, forceHover } from "./decorators";

const meta: Meta<typeof NoteCard> = {
  title: "UI/NoteCard",
  component: NoteCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NoteCard>;

const cardImage = "/cards/major/major_17_star.jpg";

const thumbnail = (
  <div
    className="relative overflow-hidden rounded-[5px]"
    style={{
      width: 52,
      aspectRatio: "600/1050",
      border: "1px solid rgba(214,178,109,0.28)",
    }}
  >
    <Image src={cardImage} alt="星星" fill sizes="52px" className="object-cover" />
  </div>
);

const base = {
  meta: "3 天前 · 问题解读",
  title: "这段关系里，我真正害怕的是什么？",
  subtitle: "牌面先出现，笔记后来补上。这里保存的不是答案，而是靠近问题的方式。",
  thumbnail,
  onClick: () => {},
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
  name: "Dark · active (pinned)",
  parameters: { themes: { themeOverride: "dark" } },
  args: { ...base, pinned: true },
};

export const MobileDark: Story = {
  name: "Mobile · dark",
  decorators: [mobileViewport],
  parameters: { themes: { themeOverride: "dark" } },
  args: base,
};
