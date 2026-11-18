"use client";

import type { PersonalInfo } from "@/types/cv";
import { useLocale } from "@/hooks/useLocale";
import { TextField } from "./Fields";
import { FormSection } from "./FormSection";
import { PhotoUpload } from "./PhotoUpload";

type PersonalInfoFormProps = {
  value: PersonalInfo;
  onChange: (value: PersonalInfo) => void;
};

export function PersonalInfoForm({ value, onChange }: PersonalInfoFormProps) {
  const { t } = useLocale();
  // Tek bir alanı güncelleyip geri kalanını kopyalayan yardımcı (immutable güncelleme).
  const update = (field: keyof PersonalInfo) => (next: string) =>
    onChange({ ...value, [field]: next });

  return (
    <FormSection title={t.sections.personal}>
      <PhotoUpload photo={value.photo} onChange={update("photo")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label={t.fields.fullName} value={value.fullName} onChange={update("fullName")} />
        <TextField label={t.fields.title} value={value.title} onChange={update("title")} placeholder={t.fields.titlePlaceholder} />
        <TextField label={t.fields.email} type="email" value={value.email} onChange={update("email")} />
        <TextField label={t.fields.phone} type="tel" value={value.phone} onChange={update("phone")} />
        <TextField label={t.fields.city} value={value.city} onChange={update("city")} />
        <TextField label={t.fields.linkedin} value={value.linkedin} onChange={update("linkedin")} placeholder="linkedin.com/in/..." />
        <TextField label={t.fields.github} value={value.github} onChange={update("github")} placeholder="github.com/..." className="sm:col-span-2" />
      </div>
    </FormSection>
  );
}
