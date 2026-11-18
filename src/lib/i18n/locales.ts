// Desteklenen diller ve "hangi dille açılsın?" kararı. Saf fonksiyonlar → kolay test.

export const LOCALES = ["tr", "en", "es", "it"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "tr";
export const LOCALE_STORAGE_KEY = "cv-olusturucu:locale:v1";

// Tarih biçimi gibi Intl işlemlerinde kullanılan tam dil etiketleri.
export const LOCALE_TAGS: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-GB",
  es: "es-ES",
  it: "it-IT",
};

// Dil menüsünde her dil KENDİ dilinde yazılır: İngilizce bilmeyen biri de "Türkçe"yi bulabilsin.
export const LOCALE_NAMES: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  es: "Español",
  it: "Italiano",
};

export function parseLocale(raw: unknown): Locale | null {
  return typeof raw === "string" && (LOCALES as readonly string[]).includes(raw) ? (raw as Locale) : null;
}

// Öncelik: 1) kullanıcının seçtiği dil, 2) tarayıcının dilleri sırayla ("es-MX" → "es"),
// 3) varsayılan (Türkçe).
export function pickInitialLocale(stored: string | null, browserLanguages: readonly string[]): Locale {
  const saved = parseLocale(stored);
  if (saved) return saved;
  for (const language of browserLanguages) {
    const match = parseLocale(language.toLowerCase().split("-")[0]);
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}

// Sayfa ilk boyanmadan önce <html lang="..."> değerini doğru dile ayarlayan küçük script
// (tema script'iyle aynı mantık). Ekran okuyucular ve tarayıcı çevirisi bu değere bakar.
export const LOCALE_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  LOCALE_STORAGE_KEY,
)});var l=${JSON.stringify(LOCALES)};var p=l.indexOf(s)>=0?s:null;if(!p){var n=navigator.languages||[navigator.language];for(var i=0;i<n.length&&!p;i++){var c=String(n[i]).toLowerCase().split("-")[0];if(l.indexOf(c)>=0)p=c}}document.documentElement.lang=p||${JSON.stringify(
  DEFAULT_LOCALE,
)}}catch(e){}})()`;
