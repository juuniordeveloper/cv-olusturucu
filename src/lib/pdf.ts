import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  getExactWidth,
  getPageRanges,
  measurePageLayout,
  measureRelative,
} from "@/lib/pageLayout";
import type { PageLayout, PageRange, RelativeRect } from "@/lib/pageLayout";

// Nasıl çalışıyor?
// 1) CV'nin kesintisiz (bölünmemiş) hâlinin yüksek çözünürlüklü görüntüsünü alıyoruz
//    (modern-screenshot). Bu, CvPreview'daki ekran dışı "ölçüm kopyası" (#cv-page).
// 2) Görüntüyü A4 sayfalara bölüp bir PDF'e yerleştiriyoruz (jsPDF).
// 3) Görüntüdeki bağlantıların üstüne tıklanabilir alanlar ekliyoruz.
// Not: Metin görüntü olduğu için PDF'te seçilemez; karşılığında yazdırma penceresi açılmaz.

const PIXEL_RATIO = 2; // 2x çözünürlük: çıktı keskin olsun ama dosya da şişmesin
const JPEG_QUALITY = 0.92;

// "Ayşe Yılmaz" → "Ayşe Yılmaz - CV.pdf". Dosya adlarında yasak karakterleri temizler.
export function buildPdfFileName(fullName: string): string {
  const safeName = fullName.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim();
  return safeName ? `${safeName} - CV.pdf` : "CV.pdf";
}

interface LinkArea extends RelativeRect {
  url: string;
}

function collectLinks(page: HTMLElement): LinkArea[] {
  return [...page.querySelectorAll<HTMLAnchorElement>("a[href]")]
    .filter((anchor) => /^(https?:|mailto:|tel:)/.test(anchor.href))
    .map((anchor) => ({ ...measureRelative(anchor, page), url: anchor.href }));
}

async function capturePage(page: HTMLElement): Promise<HTMLCanvasElement> {
  // Not: Önce "html-to-image" denedik; o kütüphane yazı boyutlarını kopyalarken
  // küçültüyor (12.5px → 11.9px) ve PDF'te satır aralıkları bozuluyordu.
  const { domToCanvas } = await import("modern-screenshot"); // Sadece tıklanınca yüklenir
  await document.fonts.ready; // Yazı tipleri yüklenmeden görüntü almayalım
  return domToCanvas(page, {
    scale: PIXEL_RATIO,
    backgroundColor: "#ffffff",
    width: getExactWidth(page),
    height: page.offsetHeight,
  });
}

// Tek bir PDF sayfasının görüntüsünü üretir. Katmanlar önizlemedeki kâğıtla aynı:
// beyaz kâğıt → renkli sütunlar → CV'nin [start, end) dilimi (üst pay kadar aşağıda).
// ratio: görüntünün 1 CSS pikseline düşen gerçek piksel sayısı (~PIXEL_RATIO).
function renderPageToJpeg(
  source: HTMLCanvasElement,
  ratio: number,
  range: PageRange,
  layout: PageLayout,
): string {
  const sheet = document.createElement("canvas");
  sheet.width = source.width;
  sheet.height = Math.round(layout.pageHeightPx * ratio);
  const context = sheet.getContext("2d");
  if (!context) throw new Error("Tarayıcınız PDF oluşturmayı desteklemiyor.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, sheet.width, sheet.height);
  layout.columns.forEach((column) => {
    context.fillStyle = column.color;
    context.fillRect(Math.round(column.left * ratio), 0, Math.round(column.width * ratio), sheet.height);
  });

  const sourceY = Math.round(range.start * ratio);
  const sliceHeight = Math.round((range.end - range.start) * ratio);
  const targetY = Math.round(range.offsetTop * ratio);
  context.drawImage(source, 0, sourceY, source.width, sliceHeight, 0, targetY, source.width, sliceHeight);
  return sheet.toDataURL("image/jpeg", JPEG_QUALITY);
}

export async function downloadCvPdf(page: HTMLElement, fileName: string): Promise<void> {
  const layout = measurePageLayout(page);
  const ranges = getPageRanges(layout, page.offsetHeight);
  const links = collectLinks(page);
  const [canvas, { jsPDF }] = await Promise.all([capturePage(page), import("jspdf")]);

  const widthPx = getExactWidth(page);
  const pxPerMm = widthPx / A4_WIDTH_MM;
  const ratio = canvas.width / widthPx;

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  ranges.forEach((range, index) => {
    if (index > 0) pdf.addPage();
    pdf.addImage(renderPageToJpeg(canvas, ratio, range, layout), "JPEG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

    // Bu sayfaya düşen bağlantıları tıklanabilir yap (üst pay kadar kaydırarak).
    links
      .filter((link) => link.top >= range.start && link.bottom <= range.end)
      .forEach((link) => {
        pdf.link(
          link.left / pxPerMm,
          (link.top - range.start + range.offsetTop) / pxPerMm,
          link.width / pxPerMm,
          (link.bottom - link.top) / pxPerMm,
          { url: link.url },
        );
      });
  });

  pdf.save(fileName);
}
