"use client";

import { LANGUAGE_LEVELS } from "@/types/cv";
import type { Language, LanguageLevel } from "@/types/cv";
import { createEmptyLanguage } from "@/lib/defaultCv";
import { removeItem, updateItem } from "@/lib/listUtils";
import { useLocale } from "@/hooks/useLocale";
import { inputClass } from "./Fields";
import { AddButton, FormSection } from "./FormSection";

// Bir dil adı için makul üst sınır ("Brezilya Portekizcesi" bile 21 karakter).
const MAX_LANGUAGE_NAME_LENGTH = 30;

type LanguagesFormProps = {
  items: Language[];
  onChange: (items: Language[]) => void;
};

function isLanguageLevel(value: string): value is LanguageLevel {
  return (LANGUAGE_LEVELS as readonly string[]).includes(value);
}

export function LanguagesForm({ items, onChange }: LanguagesFormProps) {
  const { t } = useLocale();
  return (
    <FormSection title={t.sections.languages}>
      {items.map((item) => (
        // Grid: 1. sütun kalan alanı alır ama küçülebilir (minmax(0,1fr)),
        // 2. sütun seviye için sabit genişlik, 3. sütun "Sil" butonu kadar.
        // Mobilde seviye kutusunu biraz daraltıyoruz ki satır ekrana sığsın.
        <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_7.5rem_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto]">
          <input
            value={item.name}
            maxLength={MAX_LANGUAGE_NAME_LENGTH}
            onChange={(event) => onChange(updateItem(items, item.id, { name: event.target.value }))}
            placeholder={t.languages.namePlaceholder}
            aria-label={t.languages.nameLabel}
            className={inputClass}
          />
          <select
            value={item.level}
            onChange={(event) => {
              const level = event.target.value;
              if (isLanguageLevel(level)) onChange(updateItem(items, item.id, { level }));
            }}
            aria-label={t.languages.levelLabel}
            className={inputClass}
          >
            {LANGUAGE_LEVELS.map((level) => (
              // value: CV'de saklanan sabit değer; görünen yazı seçili dilde.
              <option key={level} value={level}>
                {t.levels[level]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onChange(removeItem(items, item.id))}
            className="rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
            aria-label={t.languages.remove(item.name || t.languages.unnamed)}
          >
            {t.lists.remove}
          </button>
        </div>
      ))}
      <AddButton label={t.lists.addLanguage} onClick={() => onChange([...items, createEmptyLanguage()])} />
    </FormSection>
  );
}
