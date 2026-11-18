"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePersistentCv } from "@/hooks/usePersistentCv";
import { EMPTY_CV } from "@/lib/defaultCv";
import { CvForm } from "@/components/form/CvForm";
import { CvPreview } from "@/components/CvPreview";
import { Toolbar } from "@/components/Toolbar";
import { useDocumentLocale, useLocale } from "@/hooks/useLocale";

type MobileTab = "form" | "preview";

type CvEditorProps = {
  id: string;
};

// Tek bir CV'nin düzenleme ekranı. State burada yaşar; form ve önizleme aynı veriyi
// paylaşır → form değişince React önizlemeyi yeniden çizer (canlı güncelleme).
export default function CvEditor({ id }: CvEditorProps) {
  const router = useRouter();
  const { meta, cv, setCv, template, setTemplate, saveError, flush } = usePersistentCv(id);
  const { locale, t } = useLocale();
  const [mobileTab, setMobileTab] = useState<MobileTab>("form");
  const [isDownloading, setIsDownloading] = useState(false);
  // Mesajın kendisini değil "hata oldu mu?" bilgisini tutuyoruz: dil değişirse mesaj da değişsin.
  const [hasDownloadError, setHasDownloadError] = useState(false);
  useDocumentLocale(locale, meta ? `${meta.name} – ${t.app.name}` : t.app.name);

  if (!meta) return <CvNotFound />;

  // Geri: önce bekleyen değişiklikleri kaydet, sonra ana sayfaya dön.
  function handleBack() {
    const result = flush();
    if (!result.ok && !window.confirm(`${t.editor.saveFailed}\n\n${t.editor.leaveAnyway}`)) {
      return;
    }
    router.push("/");
  }

  async function handleDownload() {
    setIsDownloading(true);
    setHasDownloadError(false);
    try {
      const page = await getVisiblePage();
      // pdf.ts büyük kütüphaneler yüklüyor; sadece butona basılınca indirilsin (dynamic import).
      const { buildPdfFileName, downloadCvPdf } = await import("@/lib/pdf");
      await downloadCvPdf(page, buildPdfFileName(cv.personal.fullName || meta?.name || ""));
    } catch (error: unknown) {
      console.error("PDF oluşturulamadı", error);
      setHasDownloadError(true);
    } finally {
      setIsDownloading(false);
    }
  }

  // Yazdır: tarayıcının kendi yazdırma penceresi. Orada "PDF olarak kaydet" seçilirse
  // metni SEÇİLEBİLİR bir PDF çıkar (CV tarama sistemleri/ATS metni okuyabilir).
  // Dosya adı sayfa başlığından gelir; bu yüzden geçici olarak başlığı değiştiriyoruz.
  function handlePrint() {
    const previousTitle = document.title;
    const name = cv.personal.fullName.trim() || meta?.name.trim() || "";
    document.title = name ? `${name} - CV` : "CV";
    window.addEventListener("afterprint", () => (document.title = previousTitle), { once: true });
    window.print();
  }

  // Mobilde "Düzenle" sekmesindeyken önizleme gizlidir (display:none) ve ölçülemez.
  // Önce önizleme sekmesine geçip tarayıcının onu çizmesini bekliyoruz.
  async function getVisiblePage(): Promise<HTMLElement> {
    const findPage = () => document.getElementById("cv-page");
    if (!findPage()?.offsetWidth) {
      setMobileTab("preview");
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    const page = findPage();
    if (!page?.offsetWidth) throw new Error("CV önizlemesi bulunamadı");
    return page;
  }

  function handleReset() {
    if (window.confirm(t.editor.confirmReset)) {
      setCv(() => EMPTY_CV);
    }
  }

  const tabClass = (tab: MobileTab) =>
    `flex-1 rounded-full py-2 text-sm font-medium transition ${
      mobileTab === tab
        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
        : "text-stone-600 dark:text-stone-400"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 dark:bg-stone-950 print:bg-white">
      <Toolbar
        cvName={meta.name}
        onBack={handleBack}
        template={template}
        onTemplateChange={setTemplate}
        onPrint={handlePrint}
        onDownload={handleDownload}
        isDownloading={isDownloading}
        onReset={handleReset}
      />

      {[saveError && t.editor.saveFailed, hasDownloadError && t.editor.downloadFailed].filter(Boolean).map((message) => (
        <p
          key={String(message)}
          role="alert"
          className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200 print:hidden"
        >
          {message}
        </p>
      ))}

      {/* Mobilde form ve önizleme yan yana sığmaz; sekmelerle geçiş yapıyoruz. */}
      <nav aria-label={t.editor.viewTabs} className="sticky top-0 z-10 flex gap-1 bg-stone-100/90 p-2 backdrop-blur lg:hidden dark:bg-stone-950/90 print:hidden">
        <button type="button" className={tabClass("form")} onClick={() => setMobileTab("form")}>
          {t.editor.tabEdit}
        </button>
        <button type="button" className={tabClass("preview")} onClick={() => setMobileTab("preview")}>
          {t.editor.tabPreview}
        </button>
      </nav>

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[400px_minmax(0,1fr)] xl:grid-cols-[480px_minmax(0,1fr)] lg:py-6 print:block print:p-0">
        <section
          aria-label={t.editor.formRegion}
          className={`${mobileTab === "form" ? "block" : "hidden"} lg:block print:hidden`}
        >
          <CvForm cv={cv} setCv={setCv} />
        </section>

        <section
          aria-label={t.editor.previewRegion}
          className={`${mobileTab === "preview" ? "block" : "hidden"} lg:block print:block`}
        >
          <div className="lg:sticky lg:top-[81px] lg:max-h-[calc(100vh-105px)] lg:overflow-y-auto lg:rounded-2xl lg:bg-stone-200/60 lg:p-6 lg:dark:bg-stone-900 print:static print:max-h-none print:overflow-visible print:bg-transparent print:p-0">
            <CvPreview cv={cv} templateId={template} />
          </div>
        </section>
      </main>
    </div>
  );
}

function CvNotFound() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-100 p-6 text-center dark:bg-stone-950">
      <p className="text-lg font-semibold text-stone-900 dark:text-stone-50">{t.editor.notFoundTitle}</p>
      <p className="max-w-sm text-sm text-stone-600 dark:text-stone-400">{t.editor.notFoundText}</p>
      <Link
        href="/"
        className="rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-stone-100 dark:text-stone-900"
      >
        {t.editor.backShort}
      </Link>
    </main>
  );
}
