"use client";

import type { CvData } from "@/types/cv";
import { useLocale } from "@/hooks/useLocale";
import { TextAreaField } from "./Fields";
import { FormSection } from "./FormSection";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { ExperienceForm } from "./ExperienceForm";
import { EducationForm } from "./EducationForm";
import { SkillsForm } from "./SkillsForm";
import { LanguagesForm } from "./LanguagesForm";
import { ProjectsForm } from "./ProjectsForm";
import { CertificatesForm } from "./CertificatesForm";
import { ReferencesForm } from "./ReferencesForm";

type CvFormProps = {
  cv: CvData;
  setCv: (updater: (previous: CvData) => CvData) => void;
};

// Tüm bölümleri bir araya getiren form. Her bölüm CV'nin bir alanını günceller.
export function CvForm({ cv, setCv }: CvFormProps) {
  const { t } = useLocale();
  // Generic yardımcı: CV'nin tek bir anahtarını değiştiren güncelleyici üretir.
  const setField =
    <K extends keyof CvData>(key: K) =>
    (value: CvData[K]) =>
      setCv((previous) => ({ ...previous, [key]: value }));

  return (
    <div className="space-y-4">
      <PersonalInfoForm value={cv.personal} onChange={setField("personal")} />
      <FormSection title={t.sections.summary}>
        <TextAreaField
          label={t.fields.summary}
          value={cv.summary}
          onChange={setField("summary")}
          rows={5}
        />
      </FormSection>
      <ExperienceForm items={cv.experiences} onChange={setField("experiences")} />
      <ProjectsForm items={cv.projects} onChange={setField("projects")} />
      <EducationForm items={cv.educations} onChange={setField("educations")} />
      <CertificatesForm items={cv.certificates} onChange={setField("certificates")} />
      <SkillsForm skills={cv.skills} onChange={setField("skills")} />
      <LanguagesForm items={cv.languages} onChange={setField("languages")} />
      <ReferencesForm items={cv.references} onChange={setField("references")} />
    </div>
  );
}
