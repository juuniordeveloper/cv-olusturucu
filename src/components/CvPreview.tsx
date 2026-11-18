"use client";

import { useEffect, useRef, useState } from "react";
import type { CvData, TemplateId } from "@/types/cv";
import { getTemplate } from "@/components/templates";
import { removeEmptyEntries } from "@/lib/cleanCv";
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  A4_WIDTH_PX,
  PAGE_MARGINS,
  getPageRanges,
  measurePageLayout,
} from "@/lib/pageLayout";
import type { PageLayout } from "@/lib/pageLayout";
import { PageCountWarning, PreviewSheet } from "@/components/PreviewSheet";
import { useLocale } from "@/hooks/useLocale";
import { getCvI18n } from "@/lib/i18n/cvI18n";

const DEFAULT_LAYOUT: PageLayout = {
  pageHeightPx: (A4_HEIGHT_MM * A4_WIDTH_PX) / A4_WIDTH_MM,
  breaks: [],
  pageCount: 1,
  margins: PAGE_MARGINS,
  columns: [],
};

type CvPreviewProps = {
  cv: CvData;
  templateId: TemplateId;
};

export function CvPreview({ cv, templateId }: CvPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [layout, setLayout] = useState<PageLayout>(DEFAULT_LAYOUT);
  const [contentHeight, setContentHeight] = useState(0);

  // Tarayıcıdan iki tür haber alıyoruz:
  // - ResizeObserver: önizleme alanının veya CV'nin boyutu değişti
  // - MutationObserver: CV'nin içeriği değişti (yazı yazıldı, şablon değişti)
  // Her ikisinde de ölçüm kopyasını ölçüp sayfaların nereden bölüneceğini hesaplıyoruz.
  useEffect(() => {
    const container = containerRef.current;
    const page = pageRef.current;
    if (!container || !page) return;

    const update = () => {
      setScale(Math.min(1, container.clientWidth / A4_WIDTH_PX));
      setContentHeight(page.offsetHeight);
      setLayout(measurePageLayout(page));
    };

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(container);
    resizeObserver.observe(page);
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(page, { subtree: true, childList: true, characterData: true });
    // Bir yazı tipi sonradan yüklenince (ör. Klasik şablonun serif fontu) satırlar
    // biraz kayar; içerik değişmediği için yukarıdakiler haber vermeyebilir.
    document.fonts.addEventListener("loadingdone", update);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      document.fonts.removeEventListener("loadingdone", update);
    };
  }, []);

  const { locale } = useLocale();
  const i18n = getCvI18n(locale);
  const Template = getTemplate(templateId).component;
  const visibleCv = removeEmptyEntries(cv);
  const ranges = getPageRanges(layout, contentHeight || layout.pageHeightPx);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Ölçüm kopyası: CV'nin bölünmemiş, gerçek boyutlu hâli. Görünmez (0x0 kutuda
          kırpılı) ama ölçülebilir. Sayfa hesabı ve PDF görüntüsü buradan alınır.
          Ctrl+P ile yazdırırken ise SADECE bu kopya basılır (sayfaları tarayıcı böler). */}
      <div
        aria-hidden
        inert
        className="pointer-events-none absolute top-0 left-0 h-0 w-0 overflow-hidden print:static print:h-auto print:w-auto print:overflow-visible"
      >
        <div ref={pageRef} id="cv-page" className="w-[210mm] bg-white">
          <Template cv={visibleCv} i18n={i18n} />
        </div>
      </div>

      <PageCountWarning pageCount={layout.pageCount} />

      <div className="flex flex-col items-center gap-6 print:hidden">
        {ranges.map((range, index) => (
          <PreviewSheet
            key={index}
            Template={Template}
            cv={visibleCv}
            i18n={i18n}
            range={range}
            columns={layout.columns}
            pageHeightPx={layout.pageHeightPx}
            scale={scale}
            pageNumber={index + 1}
            pageCount={ranges.length}
          />
        ))}
      </div>
    </div>
  );
}
