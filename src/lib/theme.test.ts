import { describe, expect, test } from "vitest";
import { parseThemePreference, resolveTheme } from "@/lib/theme";

describe("parseThemePreference", () => {
  test("geçerli tercihleri kabul eder", () => {
    expect(parseThemePreference("light")).toBe("light");
    expect(parseThemePreference("dark")).toBe("dark");
  });

  test("geçersiz veya boş değerde null döner", () => {
    expect(parseThemePreference("mavi")).toBeNull();
    expect(parseThemePreference(null)).toBeNull();
  });
});

describe("resolveTheme", () => {
  test("kullanıcı tercihi varsa sistem ayarını yok sayar", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  test("tercih yoksa sistem ayarını izler", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });
});
