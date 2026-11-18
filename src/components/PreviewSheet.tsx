import type { ComponentType } from "react";
import type { CvData } from "@/types/cv";
import type { TemplateProps } from "@/components/templates/shared";
import { A4_WIDTH_PX } from "@/lib/pageLayout";
import type { CvI18n } from "@/lib/i18n/cvI18n";
import { useLocale } from "@/hooks/useLocale";
import type { PageRange, SheetColumn } from "@/lib/pageLayout";

type PreviewSheetProps = {
  Template: ComponentType<TemplateProps>;
  cv: CvData;
  i18n: CvI18n;
  range: PageRange; // Bu kâğıdın CV'nin hangi aralığını gösterdiği
  columns: SheetColumn[]; // Kâğıt boyunca uzanan renkli sütunlar (ör. yan çubuk)
  pageHeightPx: number; // Bir A4 sayfanın yüksekliği (≈1122.5px)
  scale: number; // Ekrana sığdırma oranı
  pageNumber: number;
  pageCount: number;
};

// Tek bir A4 kâğıt. Katmanlar (alttan üste):
// 1) Beyaz kâğıt + renkli sütunlar (üst/alt paylarda ve boş alanda da görünsün diye)
// 2) CV'nin [start, end) aralığı: içerik yukarı kaydırılır (translateY), fazlası kesilir.
//    2. sayfadan itibaren üst pay kadar aşağıdan başlar.
// PDF de tam olarak bu şekilde oluşturulduğu için ekran ile PDF birebir aynıdır.
export function PreviewSheet({
  Template,
  cv,
  i18n,
  range,
  columns,
  pageHeightPx,
  scale,
  pageNumber,
  pageCount,
}: PreviewSheetProps) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-end gap-1.5" style={{ width: A4_WIDTH_PX * scale }}>
      <span className="text-xs font-medium text-stone-500 tabular-nums dark:text-stone-400">
        {t.preview.pageOf(pageNumber, pageCount)}
      </span>
      <div
        role="img"
        aria-label={t.preview.sheetLabel(pageNumber)}
        className="relative overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_40px_-12px_rgba(28,25,23,0.35)]"
        style={{ width: A4_WIDTH_PX * scale, height: pageHeightPx * scale }}
      >
        {/* Önce gerçek A4 boyutunda diz, sonra görüntüyü küçült (transform: scale). */}
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: A4_WIDTH_PX, height: pageHeightPx, transform: `scale(${scale})` }}
        >
          {columns.map((column) => (
            <div
              key={`${column.left}-${column.width}`}
              className="absolute inset-y-0"
              style={{ left: column.left, width: column.width, backgroundColor: column.color }}
            />
          ))}
          <div
            className="absolute inset-x-0 overflow-hidden"
            style={{ top: range.offsetTop, height: range.end - range.start }}
          >
            <div style={{ transform: `translateY(${-range.start}px)` }}>
              <Template cv={cv} i18n={i18n} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// CV ideal olarak 1, en fazla 2 sayfa olmalı; daha uzunsa nazikçe uyarıyoruz.
const RECOMMENDED_MAX_PAGES = 2;

export function PageCountWarning({ pageCount }: { pageCount: number }) {
  const { t } = useLocale();
  if (pageCount <= RECOMMENDED_MAX_PAGES) return null;
  return (
    <p
      role="status"
      className="mx-auto mb-3 w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-500/15 dark:text-amber-200 print:hidden"
    >
      {t.preview.tooLong(pageCount)}
    </p>
  );
}
