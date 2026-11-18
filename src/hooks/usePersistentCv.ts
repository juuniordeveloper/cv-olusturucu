"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CvData, TemplateId } from "@/types/cv";
import { EMPTY_CV } from "@/lib/defaultCv";
import { getBrowserCvRepository } from "@/lib/cvRepository";
import type { CvMeta, SaveResult } from "@/lib/cvRepository";

// Yazarken her tuşta kaydetmek yerine bu kadar bekleyip toplu kaydediyoruz (debounce).
const AUTOSAVE_DELAY_MS = 300;

interface PersistentCv {
  meta: CvMeta | null; // null → bu id'de bir CV yok (silinmiş ya da yanlış adres)
  cv: CvData;
  setCv: (updater: (previous: CvData) => CvData) => void;
  template: TemplateId;
  setTemplate: (template: TemplateId) => void;
  saveError: string | null;
  flush: () => SaveResult; // Bekleyen değişiklikleri HEMEN kaydet (ör. geri butonu)
}

// Özel hook: tek bir CV'yi depodan yükler, değişiklikleri otomatik kaydeder.
// Not: Sadece tarayıcıda çizilen bir bileşende kullanılmalı (ssr:false ile yüklüyoruz),
// çünkü ilk değeri localStorage'dan okuyor.
export function usePersistentCv(id: string): PersistentCv {
  // useState'e fonksiyon verirsek ("lazy initializer") sadece ilk render'da çalışır.
  const [repository] = useState(getBrowserCvRepository);
  const [initial] = useState(() => repository.get(id));
  const [cv, setCvState] = useState<CvData>(initial?.data ?? EMPTY_CV);
  const [template, setTemplateState] = useState<TemplateId>(initial?.meta.template ?? "modern");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Kaydedilmemiş son durum. Ref kullanıyoruz: değişmesi yeniden çizim gerektirmiyor,
  // ama flush() her an en güncel veriyi görebilmeli.
  const pendingRef = useRef<CvData | null>(null);

  const flush = useCallback((): SaveResult => {
    const pending = pendingRef.current;
    if (!pending || !initial) return { ok: true };
    const result = repository.save(id, pending);
    if (result.ok) pendingRef.current = null;
    setSaveError(result.ok ? null : result.error);
    return result;
  }, [id, initial, repository]);

  // CV değiştikçe "kaydedilecek" olarak işaretle ve kısa bir beklemeden sonra kaydet.
  useEffect(() => {
    if (!initial || cv === initial.data) return; // Sadece açmak "değişiklik" sayılmasın
    pendingRef.current = cv;
    const timer = window.setTimeout(flush, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [cv, flush, initial]);

  // Sekme kapanırken ya da sayfadan ayrılırken bekleyen değişiklik kaybolmasın.
  useEffect(() => {
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  const setTemplate = (next: TemplateId) => {
    setTemplateState(next);
    if (initial) repository.setTemplate(id, next);
  };

  return { meta: initial?.meta ?? null, cv, setCv: setCvState, template, setTemplate, saveError, flush };
}
