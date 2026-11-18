"use client";

import type { TemplateId } from "@/types/cv";
import { TEMPLATES } from "@/components/templates";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/hooks/useLocale";

type ToolbarProps = {
  cvName: string;
  onBack: () => void;
  template: TemplateId;
  onTemplateChange: (template: TemplateId) => void;
  onPrint: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  onReset: () => void;
};

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

const secondaryButton =
  "rounded-full px-3.5 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white";

export function Toolbar({
  cvName,
  onBack,
  template,
  onTemplateChange,
  onPrint,
  onDownload,
  isDownloading,
  onReset,
}: ToolbarProps) {
  const { t } = useLocale();

  return (
    // Mobilde başlık yapışkan değil (ekranda yer kaplamasın); lg ve üstünde yapışkan.
    <header className="z-20 border-b border-stone-200 bg-stone-50/85 backdrop-blur lg:sticky lg:top-0 dark:border-stone-800 dark:bg-stone-950/85 print:hidden">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
        <div className="mr-auto flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onBack}
            aria-label={t.editor.back}
            title={t.editor.backShort}
            className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-200/70 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <BackIcon />
          </button>
          <h1 className="truncate text-base font-semibold text-stone-900 dark:text-stone-50" title={cvName}>
            {cvName}
          </h1>
        </div>

        {/* role="radiogroup": ekran okuyuculara bunun tek seçimli bir grup olduğunu söyler.
            Mobilde "order-last w-full" ile alt satıra, tam genişliğe iniyor. */}
        <div
          role="radiogroup"
          aria-label={t.editor.templateGroup}
          className="order-last flex w-full overflow-x-auto rounded-full bg-stone-200/70 p-1 [scrollbar-width:none] sm:order-none sm:w-auto dark:bg-stone-800/80 [&>button]:flex-1 [&>button]:whitespace-nowrap"
        >
          {TEMPLATES.map((option) => {
            const isActive = option.id === template;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onTemplateChange(option.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-stone-900 shadow-sm dark:bg-stone-600 dark:text-white"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                }`}
              >
                {t.templates[option.id]}
              </button>
            );
          })}
        </div>

        {/* flex-wrap: bazı dillerde buton yazıları uzun (ör. "Descargar PDF"); dar ekranda
            sığmazsa taşmak yerine alt satıra geçsin. */}
        <div className="flex flex-wrap items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <button type="button" onClick={onReset} className={secondaryButton}>
            {t.editor.reset}
          </button>
          <button type="button" onClick={onPrint} title={t.editor.printHint} className={secondaryButton}>
            {t.editor.print}
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
            aria-busy={isDownloading}
            className="ml-1 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.97] disabled:cursor-wait disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-indigo-300"
          >
            {isDownloading ? t.editor.preparing : t.editor.download}
          </button>
        </div>
      </div>
    </header>
  );
}
