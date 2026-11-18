"use client";

import { useLocale } from "@/hooks/useLocale";

export function LoadingScreen() {
  const { t } = useLocale();
  return (
    <div
      role="status"
      className="flex min-h-screen items-center justify-center bg-stone-100 text-sm text-stone-500 dark:bg-stone-950 dark:text-stone-400"
    >
      {t.app.loading}
    </div>
  );
}
