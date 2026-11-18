import { findPageBreaks } from "@/lib/pagination";
import type { Block, PageMargins } from "@/lib/pagination";

// CV sayfasını ölçen yardımcılar. Hem önizlemedeki ayrı A4 sayfalar hem de PDF
// AYNI hesabı kullanıyor; böylece ekranda gördüğün ile PDF birebir aynı oluyor.

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
// CSS'te 1mm = 96/25.4 px. A4 genişliği 793.7px eder — 794'e YUVARLAMIYORUZ:
// yuvarlama farkı aşağı indikçe birikip sayfa sınırını satırların ortasına kaydırıyordu.
const CSS_PX_PER_MM = 96 / 25.4;
export const A4_WIDTH_PX = A4_WIDTH_MM * CSS_PX_PER_MM;

// 2. sayfadan itibaren üstte, her sayfada altta bırakılan boşluk (piksel, ≈10mm / 8mm).
export const PAGE_MARGINS: PageMargins = { top: 40, bottom: 32 };

// Şablonların boydan boya uzanması gereken renkli sütunları (ör. Modern'in koyu yan
// çubuğu) bu işaretle belirtilir. Sayfa arka planına çizilir; böylece sayfa payında
// ve sayfanın boş kalan altında da sütun kesintisiz devam eder.
export const SHEET_COLUMN_ATTRIBUTE = "data-sheet-column";

// Sayfa bölünürken ortasından kesilmemesi gereken elemanlar.
const UNBREAKABLE_SELECTOR = "article, li, p, h1, h2, h3, img";
// Bölüm başlıkları: altındaki içerikle birlikte taşınmalı.
const HEADING_SELECTOR = "h2";

export interface RelativeRect extends Block {
  left: number;
  width: number;
}

export interface SheetColumn {
  left: number;
  width: number;
  color: string;
}

export interface PageLayout {
  pageHeightPx: number; // Bir A4 sayfanın piksel yüksekliği (≈1122.5)
  breaks: number[]; // Sayfaların bölündüğü y konumları
  pageCount: number;
  margins: PageMargins;
  columns: SheetColumn[];
}

export interface PageRange {
  start: number; // CV içinde bu sayfanın başladığı y
  end: number; // ...ve bittiği y
  offsetTop: number; // İçeriğin kâğıtta kaç piksel aşağıdan başladığı (üst pay)
}

// Sayfanın yuvarlanmamış genişliği. offsetWidth tam sayıya yuvarlar (793.7 → 794);
// hesaplanmış CSS genişliği ise gerçek değeri verir.
export function getExactWidth(page: HTMLElement): number {
  return parseFloat(getComputedStyle(page).width) || page.offsetWidth;
}

// Sayfa transform: scale ile küçültülmüşse ekrandaki ölçüleri gerçek boyuta çevirmek için.
function getScale(page: HTMLElement, pageRect: DOMRect): number {
  return pageRect.width / getExactWidth(page) || 1;
}

export function measureRelative(element: Element, page: HTMLElement): RelativeRect {
  const pageRect = page.getBoundingClientRect();
  const scale = getScale(page, pageRect);
  const rect = element.getBoundingClientRect();
  return {
    left: (rect.left - pageRect.left) / scale,
    top: (rect.top - pageRect.top) / scale,
    width: rect.width / scale,
    bottom: (rect.bottom - pageRect.top) / scale,
  };
}

function collectElementBlocks(page: HTMLElement): Block[] {
  return [...page.querySelectorAll(UNBREAKABLE_SELECTOR)].map((element) => {
    const { top, bottom } = measureRelative(element, page);
    return { top, bottom, keepWithNext: element.matches(HEADING_SELECTOR) };
  });
}

// Her yazı satırı da ayrı bir "kesilmez" parça. Bir paragraf sayfadan uzunsa
// bütün olarak taşınamaz; o zaman en azından iki satırın ARASINDAN bölünsün,
// bir satır yarısı bir sayfada yarısı diğerinde kalmasın.
// Range.getClientRects(): bir metnin ekranda kapladığı her satır için bir dikdörtgen verir.
function collectLineBlocks(page: HTMLElement): Block[] {
  const pageRect = page.getBoundingClientRect();
  const scale = getScale(page, pageRect);
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const lines: Block[] = [];

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    // Başlığın kendi satırı "içerik" sayılmasın; yoksa başlık kuralı hiç çalışmaz.
    const isHeadingText = Boolean(node.parentElement?.closest(HEADING_SELECTOR));
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      if (rect.height === 0) continue;
      lines.push({
        top: (rect.top - pageRect.top) / scale,
        bottom: (rect.bottom - pageRect.top) / scale,
        keepWithNext: isHeadingText,
      });
    }
  }
  return lines;
}

function collectBlocks(page: HTMLElement): Block[] {
  return [...collectElementBlocks(page), ...collectLineBlocks(page)];
}

function collectColumns(page: HTMLElement): SheetColumn[] {
  return [...page.querySelectorAll(`[${SHEET_COLUMN_ATTRIBUTE}]`)].map((element) => {
    const { left, width } = measureRelative(element, page);
    return { left, width, color: getComputedStyle(element).backgroundColor };
  });
}

export function measurePageLayout(page: HTMLElement): PageLayout {
  const pageHeightPx = (A4_HEIGHT_MM * getExactWidth(page)) / A4_WIDTH_MM;
  const blocks = collectBlocks(page);
  // Şablonlar en az bir A4 boyunda (min-height) ama sayfa sayısını belirleyen,
  // altta kalan boş alan değil, en alttaki yazının bittiği yer.
  const contentHeight = Math.max(0, ...blocks.map((block) => block.bottom));
  const breaks = findPageBreaks(contentHeight, pageHeightPx, blocks, PAGE_MARGINS);
  return {
    pageHeightPx,
    breaks,
    pageCount: breaks.length + 1,
    margins: PAGE_MARGINS,
    columns: collectColumns(page),
  };
}

// Her sayfanın CV'nin hangi aralığını, kâğıdın neresinden itibaren göstereceği.
export function getPageRanges(layout: PageLayout, totalHeight: number): PageRange[] {
  const starts = [0, ...layout.breaks];
  return starts.map((start, index) => {
    const offsetTop = index > 0 ? layout.margins.top : 0;
    // Son sayfa: kâğıtta kalan alan kadar göster (şablonun alt boşluğu dahil).
    const end = layout.breaks[index] ?? Math.min(totalHeight, start + layout.pageHeightPx - offsetTop);
    return { start, end, offsetTop };
  });
}
