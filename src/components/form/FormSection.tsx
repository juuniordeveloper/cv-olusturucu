"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/hooks/useLocale";

type FormSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

// <details> HTML'in yerleşik aç/kapa elemanıdır; JavaScript state'ine gerek kalmaz.
export function FormSection({ title, children, defaultOpen = true }: FormSectionProps) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-slate-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:shadow-none"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold text-slate-800 select-none dark:text-stone-100">
        {title}
        <span
          aria-hidden
          className="text-slate-400 transition-transform dark:text-stone-500 group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="space-y-3 border-t border-slate-100 px-4 py-4 dark:border-stone-800">{children}</div>
    </details>
  );
}

type ListItemCardProps = {
  title: string;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: ReactNode;
};

// Deneyim/eğitim gibi listelerdeki her kayıt için ortak kart.
export function ListItemCard({ title, onRemove, onMoveUp, onMoveDown, children }: ListItemCardProps) {
  const { t } = useLocale();
  const iconButton =
    "rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-stone-400 dark:hover:bg-stone-800";
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-stone-800 dark:bg-stone-950/50">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-slate-700 dark:text-stone-200">{title}</span>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onMoveUp} disabled={!onMoveUp} className={iconButton} aria-label={t.lists.moveUp}>
            ↑
          </button>
          <button type="button" onClick={onMoveDown} disabled={!onMoveDown} className={iconButton} aria-label={t.lists.moveDown}>
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            {t.lists.remove}
          </button>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

type AddButtonProps = {
  label: string;
  onClick: () => void;
};

export function AddButton({ label, onClick }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border-2 border-dashed border-slate-300 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-stone-700 dark:text-stone-400 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
    >
      + {label}
    </button>
  );
}
