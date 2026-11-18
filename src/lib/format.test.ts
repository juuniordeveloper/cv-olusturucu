import { describe, expect, test } from "vitest";
import { displayUrl, formatDateRange, formatMonth, toUrl } from "@/lib/format";

describe("formatMonth", () => {
  test("YYYY-AA formatını Türkçe aya çevirir", () => {
    expect(formatMonth("2023-01")).toBe("Oca 2023");
    expect(formatMonth("2020-12")).toBe("Ara 2020");
  });

  test("tanımadığı formatı olduğu gibi bırakır", () => {
    expect(formatMonth("2023")).toBe("2023");
    expect(formatMonth("2023-13")).toBe("2023-13");
  });

  test("seçilen dilde ay adı yazar", () => {
    expect(formatMonth("2023-01", "en-GB")).toBe("Jan 2023");
    expect(formatMonth("2023-01", "es-ES")).toBe("ene 2023");
    expect(formatMonth("2023-01", "it-IT")).toBe("gen 2023");
  });
});

describe("formatDateRange", () => {
  test("iki tarihi birleştirir", () => {
    expect(formatDateRange("2020-01", "2021-06")).toBe("Oca 2020 – Haz 2021");
  });

  test("bitiş boşsa 'Devam ediyor' yazar", () => {
    expect(formatDateRange("2020-01", "")).toBe("Oca 2020 – Devam ediyor");
  });

  test("ikisi de boşsa boş metin döner", () => {
    expect(formatDateRange("", "")).toBe("");
  });

  test("seçilen dilde tarih ve 'devam ediyor' metnini kullanır", () => {
    expect(formatDateRange("2020-01", "", { localeTag: "en-GB", present: "Present" })).toBe("Jan 2020 – Present");
    expect(formatDateRange("2020-01", "2021-06", { localeTag: "it-IT", present: "In corso" })).toBe("gen 2020 – giu 2021");
  });
});

describe("toUrl / displayUrl", () => {
  test("protokol yoksa https ekler", () => {
    expect(toUrl("github.com/x")).toBe("https://github.com/x");
    expect(toUrl("http://a.com")).toBe("http://a.com");
    expect(toUrl("  ")).toBe("");
  });

  test("gösterimde protokolü ve www'yu gizler", () => {
    expect(displayUrl("https://www.linkedin.com/in/x/")).toBe("linkedin.com/in/x");
  });
});
