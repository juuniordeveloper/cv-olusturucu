import { describe, expect, test } from "vitest";
import { getPageRanges } from "@/lib/pageLayout";
import type { PageLayout } from "@/lib/pageLayout";

const base: PageLayout = {
  pageHeightPx: 1000,
  breaks: [],
  pageCount: 1,
  margins: { top: 40, bottom: 30 },
  columns: [],
};

describe("getPageRanges", () => {
  test("tek sayfada üst pay yok, sayfa yüksekliği kadar gösterir", () => {
    expect(getPageRanges(base, 1000)).toEqual([{ start: 0, end: 1000, offsetTop: 0 }]);
  });

  test("sonraki sayfalar üst pay kadar aşağıdan başlar", () => {
    const layout = { ...base, breaks: [900], pageCount: 2 };
    expect(getPageRanges(layout, 1500)).toEqual([
      { start: 0, end: 900, offsetTop: 0 },
      // Son sayfa: kâğıda sığan kadarını (1000 - 40) gösterir
      { start: 900, end: 1500, offsetTop: 40 },
    ]);
  });

  test("son sayfa CV'nin sonunu aşmaz", () => {
    const layout = { ...base, breaks: [900], pageCount: 2 };
    expect(getPageRanges(layout, 1200)[1]).toEqual({ start: 900, end: 1200, offsetTop: 40 });
  });
});
