import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "./messages/tr";
import { tr } from "./messages/tr";
import { en } from "./messages/en";
import { es } from "./messages/es";
import { it } from "./messages/it";

export type { Messages };

// Record<Locale, Messages>: her dil için bir çeviri nesnesi olmak ZORUNDA.
// LOCALES listesine yeni bir dil eklenip burada unutulursa TypeScript hata verir.
export const MESSAGES: Record<Locale, Messages> = { tr, en, es, it };
