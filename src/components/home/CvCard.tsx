"use client";

import Link from "next/link";
import type { CvData } from "@/types/cv";
import type { CvMeta } from "@/lib/cvRepository";
import { useLocale } from "@/hooks/useLocale";
import { LOCALE_TAGS } from "@/lib/i18n/locales";
import { CvThumbnail } from "./CvThumbnail";

// Tarihi seçili dilde yazar: "18 Kas 2026 11:43" / "18 Nov 2026, 11:43" ...
function formatUpdatedAt(timestamp: number, localeTag: string): string {
  return new Intl.DateTimeFormat(localeTag, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

type CvCardProps = {
  meta: CvMeta;
  data: CvData;
  onDelete: (meta: CvMeta) => void;
};

export function CvCard({ meta, data, onDelete }: CvCardProps) {
  const { locale, t } = useLocale();
  return (
    <li className="group relative">
      <div className="overflow-hidden rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_-10px_rgba(28,25,23,0.35)] ring-1 ring-stone-900/5 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_16px_32px_-12px_rgba(28,25,23,0.45)]">
        <CvThumbnail cv={data} templateId={meta.template} />
      </div>
      <p className="mt-3 truncate font-semibold text-stone-900 dark:text-stone-50" title={meta.name}>
        {meta.name}
      </p>
      <p className="text-xs text-stone-500 dark:text-stone-400">{formatUpdatedAt(meta.updatedAt, LOCALE_TAGS[locale])}</p>

      {/* "Uzatılmış bağlantı": kartın üstüne yayılan görünmez bağlantı. Küçük önizleme
          kendi içinde bağlantılar (e-posta, LinkedIn) barındırdığı için kartı <a> ile
          sarmalayamıyoruz — HTML'de bağlantı içinde bağlantı olamaz. */}
      <Link
        href={`/cv/${meta.id}`}
        aria-label={t.home.openCv(meta.name)}
        className="absolute inset-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:ring-offset-stone-100 dark:focus-visible:ring-offset-stone-950"
      />
      <button
        type="button"
        onClick={() => onDelete(meta)}
        aria-label={t.home.deleteCv(meta.name)}
        title={t.home.deleteTitle}
        className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-500 shadow-sm ring-1 ring-stone-900/10 backdrop-blur transition hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 dark:bg-stone-900/90 dark:text-stone-300 dark:ring-white/10 dark:hover:bg-red-950 dark:hover:text-red-300"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </li>
  );
}

type NewCvCardProps = {
  onClick: () => void;
};

// "+" kutusu: kartlarla aynı boyutta, kesik çizgili.
export function NewCvCard({ onClick }: NewCvCardProps) {
  const { t } = useLocale();
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group flex aspect-[210/297] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-stone-300 text-stone-500 transition hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 focus-visible:border-indigo-500 focus-visible:outline-none dark:border-stone-700 dark:text-stone-400 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-200/70 text-3xl font-light transition group-hover:scale-110 group-hover:bg-indigo-100 dark:bg-stone-800 dark:group-hover:bg-indigo-500/20">
          +
        </span>
        <span className="text-sm font-medium">{t.home.newCv}</span>
      </button>
    </li>
  );
}
