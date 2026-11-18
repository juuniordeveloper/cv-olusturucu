"use client";

import { useEffect, useRef, useState } from "react";
import type { CvData, TemplateId } from "@/types/cv";
import { getTemplate } from "@/components/templates";
import { removeEmptyEntries } from "@/lib/cleanCv";
import { A4_WIDTH_PX } from "@/lib/pageLayout";
import { useLocale } from "@/hooks/useLocale";
import { getCvI18n } from "@/lib/i18n/cvI18n";

type CvThumbnailProps = {
  cv: CvData;
  templateId: TemplateId;
};

// CV'nin ilk sayfasının küçük önizlemesi. Şablonu gerçek boyutunda çizip
// kutuya sığacak kadar küçültüyoruz (önizlemedeki yöntemin aynısı).
export function CvThumbnail({ cv, templateId }: CvThumbnailProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(() => setScale(box.clientWidth / A4_WIDTH_PX));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const { locale } = useLocale();
  const Template = getTemplate(templateId).component;
  return (
    // inert: önizlemedeki bağlantılar klavyeyle odaklanmasın, tıklanmasın (sadece görüntü).
    <div ref={boxRef} aria-hidden inert className="relative aspect-[210/297] w-full overflow-hidden bg-white">
      {scale > 0 && (
        <div className="pointer-events-none absolute top-0 left-0 w-[210mm] origin-top-left" style={{ transform: `scale(${scale})` }}>
          <Template cv={removeEmptyEntries(cv)} i18n={getCvI18n(locale)} />
        </div>
      )}
    </div>
  );
}
