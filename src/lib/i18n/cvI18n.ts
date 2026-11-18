import { formatDateRange, formatMonth } from "@/lib/format";
import { LOCALE_TAGS } from "@/lib/i18n/locales";
import type { Locale } from "@/lib/i18n/locales";
import { MESSAGES } from "@/lib/i18n/messages";
import type { Messages } from "@/lib/i18n/messages";

// Şablonların ihtiyaç duyduğu her şey tek pakette: CV başlıkları, dil seviyeleri ve
// seçilen dilde tarih biçimlendirme. Şablonlar dil mantığını bilmek zorunda kalmaz.
export interface CvI18n {
  labels: Messages["cv"];
  levels: Messages["levels"];
  formatMonth: (value: string) => string;
  formatRange: (start: string, end: string) => string;
}

// Her dil için bir kez oluşturup saklıyoruz: aynı dil için hep aynı nesne döner,
// böylece React gereksiz yere yeniden çizim yapmaz.
const cache = new Map<Locale, CvI18n>();

export function getCvI18n(locale: Locale): CvI18n {
  const cached = cache.get(locale);
  if (cached) return cached;
  const messages = MESSAGES[locale];
  const localeTag = LOCALE_TAGS[locale];
  const i18n: CvI18n = {
    labels: messages.cv,
    levels: messages.levels,
    formatMonth: (value) => formatMonth(value, localeTag),
    formatRange: (start, end) => formatDateRange(start, end, { localeTag, present: messages.cv.present }),
  };
  cache.set(locale, i18n);
  return i18n;
}
