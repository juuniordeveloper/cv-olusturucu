"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserCvRepository } from "@/lib/cvRepository";
import type { CvMeta } from "@/lib/cvRepository";
import { notifyCvListChanged, useCvList } from "@/hooks/useCvList";
import { useDocumentLocale, useLocale } from "@/hooks/useLocale";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CvCard, NewCvCard } from "./CvCard";
import { NewCvDialog } from "./NewCvDialog";

// Ana sayfa: kayıtlı CV'ler kart olarak + yeni CV için "+" kutusu.
export default function HomeScreen() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [repository] = useState(getBrowserCvRepository);
  // Bu Next.js sürümü sayfadan ayrılınca sayfayı silmiyor, gizleyip state'iyle saklıyor
  // (React <Activity>). Listeyi useState'te tutsaydık geri dönünce eski hâli görünürdü;
  // useCvList her seferinde depodan güncel listeyi verir.
  const cards = useCvList(repository);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  useDocumentLocale(locale, t.app.name);

  // Başarılıysa null, değilse kullanıcıya gösterilecek hata mesajı döner.
  function handleCreate(name: string): string | null {
    try {
      const meta = repository.create(name);
      // Sayfa saklanacağı için pencereyi kapatmazsak geri dönünce açık kalırdı.
      setIsDialogOpen(false);
      router.push(`/cv/${meta.id}`);
      return null;
    } catch (error: unknown) {
      console.error("CV oluşturulamadı", error);
      return t.home.createFailed;
    }
  }

  function handleDelete(meta: CvMeta) {
    if (!window.confirm(t.home.confirmDelete(meta.name))) return;
    repository.remove(meta.id);
    notifyCvListChanged();
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <header className="border-b border-stone-200 bg-stone-50/85 dark:border-stone-800 dark:bg-stone-950/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black tracking-tight text-stone-900 dark:text-stone-50">{t.app.brandBold}</span>
            <span className="text-lg font-light text-stone-500 dark:text-stone-400">{t.app.brandRest}</span>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">{t.home.title}</h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            {cards.length === 0 ? t.home.emptyHint : t.home.hint}
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
          <NewCvCard onClick={() => setIsDialogOpen(true)} />
          {cards.map(({ meta, data }) => (
            <CvCard key={meta.id} meta={meta} data={data} onDelete={handleDelete} />
          ))}
        </ul>
      </main>

      <NewCvDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onCreate={handleCreate} />
    </div>
  );
}
