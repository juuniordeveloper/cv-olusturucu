"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { CvData } from "@/types/cv";
import type { CvMeta, CvRepository } from "@/lib/cvRepository";

// Aynı sekmede liste değişince (ör. silme) haber vermek için kendi olayımız.
const LIST_CHANGED_EVENT = "cv-olusturucu:list-changed";

function subscribe(onChange: () => void): () => void {
  // "storage" olayı: BAŞKA bir sekmede localStorage değişince tetiklenir.
  window.addEventListener("storage", onChange);
  window.addEventListener(LIST_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LIST_CHANGED_EVENT, onChange);
  };
}

export function notifyCvListChanged(): void {
  window.dispatchEvent(new Event(LIST_CHANGED_EVENT));
}

export interface CvCardData {
  meta: CvMeta;
  data: CvData;
}

// CV listesini localStorage'dan okuyan hook.
// useSyncExternalStore: React dışındaki bir veriye (burada localStorage) abone olmanın
// doğru yolu. Abonelik bir efekt gibi davranır; Next.js sakladığı ana sayfayı tekrar
// gösterdiğinde yeniden abone olur, listeyi kontrol eder ve değiştiyse yeniden çizer.
export function useCvList(repository: CvRepository): CvCardData[] {
  const snapshot = useSyncExternalStore(subscribe, repository.snapshot, () => "");
  return useMemo(() => {
    void snapshot; // Liste değişince (snapshot) yeniden hesapla
    return repository.list().flatMap((meta) => {
      const entry = repository.get(meta.id);
      return entry ? [entry] : [];
    });
  }, [repository, snapshot]);
}
