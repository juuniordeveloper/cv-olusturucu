import { describe, expect, test } from "vitest";
import { LOCALES } from "@/lib/i18n/locales";
import { MESSAGES } from "@/lib/i18n/messages";

// Bir çeviri nesnesini "a.b.c" yollarına düzleştirir; fonksiyonları örnek değerlerle çağırır.
function flatten(value: unknown, path = ""): Record<string, string> {
  if (typeof value === "string") return { [path]: value };
  if (typeof value === "function") return { [path]: String(value("Örnek", 2, 3)) };
  if (value && typeof value === "object") {
    return Object.assign({}, ...Object.entries(value).map(([key, child]) => flatten(child, path ? `${path}.${key}` : key)));
  }
  return { [path]: "" };
}

const turkishKeys = Object.keys(flatten(MESSAGES.tr)).sort();

describe.each(LOCALES)("%s çevirileri", (locale) => {
  const flat = flatten(MESSAGES[locale]);

  test("Türkçe ile aynı anahtarlara sahip (eksik veya fazla çeviri yok)", () => {
    expect(Object.keys(flat).sort()).toEqual(turkishKeys);
  });

  test("hiçbir çeviri boş değil", () => {
    const empty = Object.entries(flat).filter(([, text]) => text.trim() === "").map(([key]) => key);
    expect(empty).toEqual([]);
  });
});

describe("çeviriler gerçekten çevrilmiş", () => {
  test("İngilizce, İspanyolca ve İtalyanca butonlar Türkçe ile aynı değil", () => {
    for (const locale of ["en", "es", "it"] as const) {
      expect(MESSAGES[locale].editor.download).not.toBe(MESSAGES.tr.editor.download);
      expect(MESSAGES[locale].cv.experience).not.toBe(MESSAGES.tr.cv.experience);
    }
  });
});
