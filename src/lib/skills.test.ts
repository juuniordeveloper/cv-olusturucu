import { describe, expect, test } from "vitest";
import { MAX_SKILL_LENGTH, parseSkillInput } from "@/lib/skills";

describe("parseSkillInput", () => {
  test("virgülle ayrılmış yetenekleri ayırır ve boşlukları temizler", () => {
    const result = parseSkillInput(" React , Figma,,  ", []);
    expect(result).toEqual({ added: ["React", "Figma"], tooLong: [] });
  });

  test("zaten var olanları ve tekrarları eklemez (büyük/küçük harf farkı önemsiz)", () => {
    const result = parseSkillInput("react, Vue, vue", ["React"]);
    expect(result.added).toEqual(["Vue"]);
  });

  test("çok uzun yetenekleri eklemez, ayrıca bildirir", () => {
    const long = "x".repeat(MAX_SKILL_LENGTH + 1);
    const exact = "y".repeat(MAX_SKILL_LENGTH);
    const result = parseSkillInput(`${long}, ${exact}`, []);
    expect(result).toEqual({ added: [exact], tooLong: [long] });
  });
});
