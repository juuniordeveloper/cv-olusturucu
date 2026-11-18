// CV'deki tüm verinin "şeklini" TypeScript tipleriyle tanımlıyoruz.
// Böylece bir alanı yanlış yazarsak editör bizi hemen uyarır.

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  city: string;
  linkedin: string;
  github: string;
  photo: string; // Base64 "data URL" — fotoğraf sadece tarayıcıda tutulur
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Project {
  id: string;
  name: string;
  link: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string; // Ör. "Takım Lideri, Örnek A.Ş."
  email: string;
  phone: string;
}

export const LANGUAGE_LEVELS = [
  "Başlangıç",
  "Orta",
  "İleri",
  "Akıcı",
  "Anadil",
] as const;

export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

export interface Language {
  id: string;
  name: string;
  level: LanguageLevel;
}

export interface CvData {
  personal: PersonalInfo;
  summary: string;
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  certificates: Certificate[];
  skills: string[];
  languages: Language[];
  references: Reference[];
}

export const TEMPLATE_IDS = ["modern", "klasik", "minimal", "kurumsal", "zaman"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];
