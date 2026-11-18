"use client";

import type { Education } from "@/types/cv";
import { createEmptyEducation } from "@/lib/defaultCv";
import { useLocale } from "@/hooks/useLocale";
import { TextField } from "./Fields";
import { RepeatableSection } from "./RepeatableSection";

type EducationFormProps = {
  items: Education[];
  onChange: (items: Education[]) => void;
};

export function EducationForm({ items, onChange }: EducationFormProps) {
  const { t } = useLocale();
  return (
    <RepeatableSection
      title={t.sections.education}
      addLabel={t.lists.addEducation}
      items={items}
      onChange={onChange}
      createEmpty={createEmptyEducation}
      getItemTitle={(item, index) => item.school || t.lists.educationFallback(index + 1)}
      renderFields={(item, update) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label={t.fields.school} value={item.school} onChange={update("school")} />
          <TextField label={t.fields.degree} value={item.degree} onChange={update("degree")} />
          <TextField label={t.fields.start} type="month" value={item.startDate} onChange={update("startDate")} />
          <TextField label={t.fields.end} type="month" value={item.endDate} onChange={update("endDate")} />
        </div>
      )}
    />
  );
}
