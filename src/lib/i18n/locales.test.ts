import { describe, expect, test } from "vitest";
import { parseLocale, pickInitialLocale } from "@/lib/i18n/locales";

describe("parseLocale", () => {
  test("desteklenen dilleri kabul eder", () => {
    expect(parseLocale("en")).toBe("en");
    expect(parseLocale("it")).toBe("it");
  });

  test("desteklenmeyen veya bozuk değerde null döner", () => {
    expect(parseLocale("de")).toBeNull();
    expect(parseLocale(null)).toBeNull();
    expect(parseLocale(42)).toBeNull();
  });
});

describe("pickInitialLocale", () => {
  test("kullanıcının kaydettiği tercih her şeyden önce gelir", () => {
    expect(pickInitialLocale("it", ["en-US"])).toBe("it");
  });

  test("tercih yoksa tarayıcı dilini bölge kodunu yok sayarak kullanır", () => {
    expect(pickInitialLocale(null, ["es-MX", "en-US"])).toBe("es");
    expect(pickInitialLocale(null, ["EN-gb"])).toBe("en");
  });

  test("tarayıcının ilk dili desteklenmiyorsa sonraki dillere bakar", () => {
    expect(pickInitialLocale(null, ["de-DE", "it-IT"])).toBe("it");
  });

  test("hiçbiri uymuyorsa Türkçe döner; bozuk kayıt yok sayılır", () => {
    expect(pickInitialLocale(null, ["de-DE", "fr"])).toBe("tr");
    expect(pickInitialLocale("klingon", [])).toBe("tr");
  });
});
