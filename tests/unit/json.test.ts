/**
 * parseJsonObject 单元测试
 */
import { describe, expect, it } from "vitest";
import { parseJsonObject } from "@/lib/ai/json";

describe("parseJsonObject", () => {
  it("解析有效 JSON 对象", () => {
    const result = parseJsonObject<{ name: string }>('{"name":"test"}');
    expect(result.name).toBe("test");
  });

  it("拒绝 JSON 数组", () => {
    expect(() => parseJsonObject("[1,2,3]")).toThrow(/not a JSON object/);
  });

  it("拒绝 null", () => {
    expect(() => parseJsonObject("null")).toThrow(/not a JSON object/);
  });

  it("拒绝非法 JSON", () => {
    expect(() => parseJsonObject("{broken")).toThrow(/Failed to parse/);
  });

  it("拒绝非对象类型", () => {
    expect(() => parseJsonObject('"just a string"')).toThrow(/not a JSON object/);
  });
});
