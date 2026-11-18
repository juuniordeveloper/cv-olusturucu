const DEFAULT_LOCALE_TAG = "tr-TR";
const DEFAULT_PRESENT_LABEL = "Devam ediyor";

// Intl.DateTimeFormat: tarayıcının yerleşik tarih biçimlendiricisi. Ay adlarını her dilde
// doğru verir ("Oca", "Jan", "ene", "gen"); kendi ay listemizi tutmamıza gerek kalmaz.
// Biçimlendirici oluşturmak nispeten pahalı olduğu için dil başına bir kez oluşturuyoruz.
const monthFormatters = new Map<string, Intl.DateTimeFormat>();

function getMonthFormatter(localeTag: string): Intl.DateTimeFormat {
  const cached = monthFormatters.get(localeTag);
  if (cached) return cached;
  const formatter = new Intl.DateTimeFormat(localeTag, { month: "short", year: "numeric", timeZone: "UTC" });
  monthFormatters.set(localeTag, formatter);
  return formatter;
}

// "2023-01" → "Oca 2023" (ya da seçilen dilde). <input type="month"> bu formatta değer üretir.
export function formatMonth(value: string, localeTag: string = DEFAULT_LOCALE_TAG): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return value;
  return getMonthFormatter(localeTag).format(new Date(Date.UTC(year, monthIndex, 1)));
}

interface DateRangeOptions {
  localeTag?: string;
  present?: string; // Bitiş boşsa yazılacak metin ("Devam ediyor", "Present"...)
}

// Başlangıç-bitiş aralığını yazar; bitiş boşsa "Devam ediyor".
export function formatDateRange(start: string, end: string, options: DateRangeOptions = {}): string {
  if (!start && !end) return "";
  const localeTag = options.localeTag ?? DEFAULT_LOCALE_TAG;
  const startText = start ? formatMonth(start, localeTag) : "";
  const endText = end ? formatMonth(end, localeTag) : (options.present ?? DEFAULT_PRESENT_LABEL);
  return startText ? `${startText} – ${endText}` : endText;
}

// "linkedin.com/in/x" gibi girdileri tıklanabilir tam adrese çevirir.
export function toUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// Önizlemede "https://www." kısmını gizleyip daha temiz gösterir.
export function displayUrl(value: string): string {
  return value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}
