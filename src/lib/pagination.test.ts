import { describe, expect, test } from "vitest";
import { findPageBreaks } from "@/lib/pagination";

const PAGE = 1000;

describe("findPageBreaks", () => {
  test("içerik tek sayfaya sığıyorsa bölme yapmaz", () => {
    expect(findPageBreaks(800, PAGE, [])).toEqual([]);
  });

  test("sayfa yüksekliğinden birkaç piksel fazlası için boş ikinci sayfa üretmez", () => {
    // 297mm ekranda 1122.5px; yuvarlama yüzünden 1123px ölçülebilir.
    expect(findPageBreaks(PAGE + 1, PAGE, [])).toEqual([]);
  });

  test("bloklar yoksa tam sayfa sınırlarından böler", () => {
    expect(findPageBreaks(2500, PAGE, [])).toEqual([1000, 2000]);
  });

  test("sınırın üstüne denk gelen bloğu bölmez, bloğun başından böler", () => {
    const blocks = [{ top: 950, bottom: 1050 }];
    expect(findPageBreaks(1500, PAGE, blocks)).toEqual([950]);
  });

  test("iç içe bloklarda en üstteki başlangıcı seçer", () => {
    const blocks = [
      { top: 900, bottom: 1100 }, // bir makale
      { top: 980, bottom: 1020 }, // içindeki bir satır
    ];
    expect(findPageBreaks(1500, PAGE, blocks)).toEqual([900]);
  });

  test("bölüm başlığı sayfanın dibinde yalnız kalmaz, içeriğiyle birlikte sonraki sayfaya geçer", () => {
    // "DENEYİM" başlığı 1. sayfanın dibinde, ilk deneyim kaydı sınırın üstünde
    const blocks = [
      { top: 900, bottom: 930, keepWithNext: true },
      { top: 950, bottom: 1100 },
    ];
    expect(findPageBreaks(1500, PAGE, blocks)).toEqual([900]);
  });

  test("başlığın altında aynı sayfada içerik varsa başlığı taşımaz", () => {
    const blocks = [
      { top: 700, bottom: 730, keepWithNext: true },
      { top: 750, bottom: 850 },
      { top: 950, bottom: 1100 },
    ];
    expect(findPageBreaks(1500, PAGE, blocks)).toEqual([950]);
  });

  test("içeriği başlığın yanında duran (yan yana) düzende başlığı taşımaz", () => {
    // Minimal şablon: solda küçük başlık, sağda aynı hizadan başlayan içerik
    const blocks = [
      { top: 900, bottom: 915, keepWithNext: true },
      { top: 900, bottom: 990 },
      { top: 995, bottom: 1100 },
    ];
    expect(findPageBreaks(1500, PAGE, blocks)).toEqual([995]);
  });

  test("alt pay her sayfanın kullanılabilir yüksekliğini azaltır", () => {
    // Alt pay 50: 1. sayfa en fazla 950'ye kadar dolar
    expect(findPageBreaks(1500, PAGE, [], { top: 0, bottom: 50 })).toEqual([950]);
  });

  test("üst pay sadece 2. sayfadan itibaren uygulanır", () => {
    // 1. sayfa: 0–1000; 2. sayfa üst pay 100 → 1000–1900; 3. sayfa 1900–...
    expect(findPageBreaks(2500, PAGE, [], { top: 100, bottom: 0 })).toEqual([1000, 1900]);
  });

  test("içerik paylarla birlikte tek sayfaya sığıyorsa bölmez", () => {
    expect(findPageBreaks(940, PAGE, [], { top: 40, bottom: 50 })).toEqual([]);
  });

  test("sayfadan uzun bir paragrafı satır aralarından böler, satırı ortadan kesmez", () => {
    // 110'dan 1890'a uzanan tek paragraf ve onun 20px'lik satırları
    const paragraph = { top: 110, bottom: 1890 };
    const lines = Array.from({ length: 89 }, (_, i) => ({ top: 110 + i * 20, bottom: 130 + i * 20 }));

    const breaks = findPageBreaks(1890, PAGE, [paragraph, ...lines]);

    // Sınır (1000) 990–1010 satırının ortasına düşüyor → o satırın başından böl
    expect(breaks[0]).toBe(990);
    breaks.forEach((at) => {
      expect(lines.some((line) => line.top < at && line.bottom > at)).toBe(false);
    });
  });

  test("sayfadan uzun bir blok varsa sonsuz döngüye girmez, sınırdan böler", () => {
    const blocks = [{ top: 100, bottom: 1900 }];
    expect(findPageBreaks(2000, PAGE, blocks)).toEqual([1000]);
  });
});
