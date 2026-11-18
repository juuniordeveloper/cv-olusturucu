import type { CvData } from "@/types/cv";

// "id" dışındaki tüm metin alanları boşsa kayıt boş sayılır.
function hasContent(entry: { id: string }): boolean {
  return Object.entries(entry).some(
    ([key, value]) => key !== "id" && typeof value === "string" && value.trim() !== "",
  );
}

// Önizlemede, kullanıcının "ekle"ye basıp henüz doldurmadığı kayıtlar boşluk bırakmasın.
// Form tarafındaki veriye dokunmaz; sadece gösterim için yeni bir kopya üretir.
export function removeEmptyEntries(cv: CvData): CvData {
  return {
    ...cv,
    experiences: cv.experiences.filter(hasContent),
    educations: cv.educations.filter(hasContent),
    projects: cv.projects.filter(hasContent),
    certificates: cv.certificates.filter(hasContent),
    references: cv.references.filter(hasContent),
  };
}
