"use client";

import type { Experience } from "@/types/cv";
import { createEmptyExperience } from "@/lib/defaultCv";
import { useLocale } from "@/hooks/useLocale";
import { TextAreaField, TextField } from "./Fields";
import { RepeatableSection } from "./RepeatableSection";

type ExperienceFormProps = {
  items: Experience[];
  onChange: (items: Experience[]) => void;
};

export function ExperienceForm({ items, onChange }: ExperienceFormProps) {
  const { t } = useLocale();
  return (
    <RepeatableSection
      title={t.sections.experience}
      addLabel={t.lists.addExperience}
      items={items}
      onChange={onChange}
      createEmpty={createEmptyExperience}
      getItemTitle={(item, index) => item.position || item.company || t.lists.experienceFallback(index + 1)}
      renderFields={(item, update) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label={t.fields.position} value={item.position} onChange={update("position")} />
            <TextField label={t.fields.company} value={item.company} onChange={update("company")} />
            <TextField label={t.fields.start} type="month" value={item.startDate} onChange={update("startDate")} />
            <TextField label={t.fields.end} type="month" value={item.endDate} onChange={update("endDate")} />
          </div>
          <TextAreaField label={t.fields.description} value={item.description} onChange={update("description")} />
        </>
      )}
    />
  );
}
