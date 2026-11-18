"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { MAX_SKILL_LENGTH, parseSkillInput } from "@/lib/skills";
import { useLocale } from "@/hooks/useLocale";
import { inputClass } from "./Fields";
import { FormSection } from "./FormSection";

type SkillsFormProps = {
  skills: string[];
  onChange: (skills: string[]) => void;
};

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const { t } = useLocale();
  const [draft, setDraft] = useState("");
  const [hasTooLongError, setHasTooLongError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Formun sayfayı yenilemesini engelle
    // Virgülle ayrılmış birden çok yeteneği tek seferde eklemeye izin veriyoruz.
    const { added, tooLong } = parseSkillInput(draft, skills);
    if (added.length > 0) onChange([...skills, ...added]);

    if (tooLong.length > 0) {
      // Çok uzun olanları kutuda bırakıyoruz ki kullanıcı kısaltıp tekrar ekleyebilsin.
      setDraft(tooLong.join(", "));
      setHasTooLongError(true);
      return;
    }
    setDraft("");
    setHasTooLongError(false);
  }

  return (
    <FormSection title={t.sections.skills}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setHasTooLongError(false);
          }}
          placeholder={t.skills.placeholder}
          aria-label={t.skills.inputLabel}
          aria-invalid={hasTooLongError}
          aria-describedby={hasTooLongError ? "skill-error" : undefined}
          className={inputClass}
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          {t.skills.add}
        </button>
      </form>
      {hasTooLongError && (
        <p id="skill-error" role="alert" className="text-xs text-red-600 dark:text-red-400">
          {t.skills.tooLong(MAX_SKILL_LENGTH)}
        </p>
      )}
      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            // max-w-full: etiket satırdan geniş olamaz. wrap-anywhere: boşluksuz uzun
            // bir kelime bile gerekirse bölünür. rounded-full yerine rounded-2xl:
            // metin iki satıra inerse dev bir ovale dönüşmesin.
            <li
              key={skill}
              className="flex max-w-full items-center gap-1 rounded-2xl bg-indigo-50 py-1 pr-1 pl-3 text-sm text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200"
            >
              <span className="min-w-0 wrap-anywhere">{skill}</span>
              <button
                type="button"
                onClick={() => onChange(skills.filter((s) => s !== skill))}
                className="shrink-0 rounded-full px-1.5 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-500/25 dark:hover:text-white"
                aria-label={t.skills.remove(skill)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </FormSection>
  );
}
