// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MotifNote } from "@/components/MotifNote";

describe("MotifNote", () => {
  it("shows only label when inactive", () => {
    render(
      <MotifNote
        id="veil"
        label_zh="石榴帷幕"
        meaning_zh="象征隐藏知识。"
        side="left"
        active={false}
      />,
    );
    expect(screen.getByText("石榴帷幕")).toBeInTheDocument();
    expect(screen.queryByText("象征隐藏知识。")).not.toBeInTheDocument();
  });

  it("shows label and meaning when active", () => {
    render(
      <MotifNote
        id="veil"
        label_zh="石榴帷幕"
        meaning_zh="象征隐藏知识。"
        side="right"
        active
      />,
    );
    expect(screen.getByText("石榴帷幕")).toBeInTheDocument();
    expect(screen.getByText("象征隐藏知识。")).toBeInTheDocument();
  });
});
