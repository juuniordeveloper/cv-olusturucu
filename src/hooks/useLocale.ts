"use client";

import { useEffect, useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, pickInitialLocale } from "@/lib/i18n/locales";
import type { Locale } from "@/lib/i18n/locales";
import { MESSAGES } from "@/lib/i18n/messages";
import type { Messages } from "@/lib/i18n/messages";

// Seçilen dil localStorage'da duruyor; React açısından bu bir "dış depo".
// useSyncExternalStore ile ona abone oluyoruz: dil değişince dili kullanan HER bileşen
// kendiliğinden yeniden çizilir. Ayrı bir Context/Provider sarmalayıcısına gerek kalmaz.

const LOCALE_CHANGED_EVENT = "cv-olusturucu:locale-changed";

function readLocale(): Locale {
  try {
    const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
    return pickInitialLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY), browserLanguages);
  } catch {
    return DEFAULT_LOCALE;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange); // başka sekmede dil değişirse
  window.addEventListener(LOCALE_CHANGED_EVENT, onChange); // bu sekmede değişirse
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCALE_CHANGED_EVENT, onChange);
  };
}

export function setLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Kaydedilemese de bu oturum boyunca dil değişir; sadece hatırlanmaz.
  }
  document.documentElement.lang = locale;
  window.dispatchEvent(new Event(LOCALE_CHANGED_EVENT));
}

interface LocaleControls {
  locale: Locale;
  t: Messages; // "translations" — t.editor.download gibi kullanılır
  setLocale: (locale: Locale) => void;
}

export function useLocale(): LocaleControls {
  // Üçüncü parametre sunucu için: sunucuda localStorage yok, varsayılan dili kullan.
  const locale = useSyncExternalStore(subscribe, readLocale, () => DEFAULT_LOCALE);
  return { locale, t: MESSAGES[locale], setLocale };
}

// Sekme başlığını ve <html lang>'ı seçilen dile göre günceller (tarayıcı = dış sistem → effect).
export function useDocumentLocale(locale: Locale, title: string): void {
  useEffect(() => {
    document.title = title;
    document.documentElement.lang = locale;
  }, [locale, title]);
}
