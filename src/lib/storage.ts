import { z } from "zod";
import { LANGUAGE_LEVELS, TEMPLATE_IDS } from "@/types/cv";
import type { CvData, TemplateId } from "@/types/cv";

// localStorage kullanıcı tarafından değiştirilebilir; ona körü körüne güvenmeyiz.
// Zod şeması, okunan verinin beklediğimiz şekle uyup uymadığını kontrol eder.
const cvSchema = z.object({
  personal: z.object({
    fullName: z.string(),
    title: z.string(),
    email: z.string(),
    phone: z.string(),
    city: z.string(),
    linkedin: z.string(),
    github: z.string(),
    photo: z.string(),
  }),
  summary: z.string(),
  experiences: z.array(
    z.object({
      id: z.string(),
      company: z.string(),
      position: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      description: z.string(),
    }),
  ),
  educations: z.array(
    z.object({
      id: z.string(),
      school: z.string(),
      degree: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }),
  ),
  // Aşağıdaki üç liste sonradan eklendi. Eski kayıtlarda bu alanlar yok;
  // .default([]) sayesinde eski veri reddedilmez, eksik liste boş kabul edilir.
  projects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        link: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        description: z.string(),
      }),
    )
    .default([]),
  certificates: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        issuer: z.string(),
        date: z.string(),
        link: z.string(),
      }),
    )
    .default([]),
  skills: z.array(z.string()),
  languages: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      level: z.enum(LANGUAGE_LEVELS),
    }),
  ),
  references: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        position: z.string(),
        email: z.string(),
        phone: z.string(),
      }),
    )
    .default([]),
});

const templateSchema = z.enum(TEMPLATE_IDS);

// Ham metni (JSON) doğrulanmış CV'ye çevirir; hatalıysa null döner.
export function parseCv(raw: string | null): CvData | null {
  if (raw === null) return null;
  try {
    const result = cvSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    // JSON.parse geçersiz metinde hata fırlatır — bunu "kayıt yok" sayıyoruz.
    return null;
  }
}

export function parseTemplate(raw: string | null): TemplateId | null {
  const result = templateSchema.safeParse(raw);
  return result.success ? result.data : null;
}
