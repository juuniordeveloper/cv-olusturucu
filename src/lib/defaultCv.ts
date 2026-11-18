import type {
  Certificate,
  CvData,
  Education,
  Experience,
  Language,
  Project,
  Reference,
} from "@/types/cv";

// Her liste kaydının benzersiz bir id'si olmalı; React listeleri bu id ile takip eder.
export function createId(): string {
  return crypto.randomUUID();
}

export function createEmptyExperience(): Experience {
  return {
    id: createId(),
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
  };
}

export function createEmptyEducation(): Education {
  return { id: createId(), school: "", degree: "", startDate: "", endDate: "" };
}

export function createEmptyLanguage(): Language {
  return { id: createId(), name: "", level: "Orta" };
}

export function createEmptyProject(): Project {
  return { id: createId(), name: "", link: "", startDate: "", endDate: "", description: "" };
}

export function createEmptyCertificate(): Certificate {
  return { id: createId(), name: "", issuer: "", date: "", link: "" };
}

export function createEmptyReference(): Reference {
  return { id: createId(), name: "", position: "", email: "", phone: "" };
}

// Örnek veri (testlerde ve eski kayıt taşımada kullanılır). İletişim bilgileri bilerek
// sahte: example.com örnekler için ayrılmış bir alan adıdır, numara da gerçek değildir.
export const SAMPLE_CV: CvData = {
  personal: {
    fullName: "Ayşe Yılmaz",
    title: "Frontend Geliştirici",
    email: "ayse@example.com",
    phone: "+90 000 000 00 00",
    city: "İstanbul",
    linkedin: "linkedin.com/in/kullanici-adi",
    github: "github.com/kullanici-adi",
    photo: "",
  },
  summary:
    "Kullanıcı odaklı, modern web arayüzleri geliştiren frontend geliştirici. React, Next.js ve TypeScript ile performanslı ve erişilebilir uygulamalar üretiyorum.",
  experiences: [
    {
      id: "ornek-deneyim-1",
      company: "Örnek Teknoloji A.Ş.",
      position: "Frontend Geliştirici",
      startDate: "2023-01",
      endDate: "",
      description:
        "Next.js ile müşteri paneli geliştirdim.\nSayfa yüklenme süresini %40 azalttım.",
    },
  ],
  educations: [
    {
      id: "ornek-egitim-1",
      school: "Örnek Üniversitesi",
      degree: "Bilgisayar Mühendisliği, Lisans",
      startDate: "2018-09",
      endDate: "2022-06",
    },
  ],
  projects: [
    {
      id: "ornek-proje-1",
      name: "CV Oluşturucu",
      link: "github.com/kullanici-adi/cv-olusturucu",
      startDate: "2024-03",
      endDate: "2024-04",
      description:
        "Next.js ve TypeScript ile canlı önizlemeli CV oluşturucu.\nVeriler sadece tarayıcıda saklanıyor, PDF olarak indirilebiliyor.",
    },
  ],
  certificates: [
    {
      id: "ornek-sertifika-1",
      name: "Meta Front-End Developer",
      issuer: "Coursera",
      date: "2023-06",
      link: "",
    },
  ],
  skills: ["JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS"],
  languages: [
    { id: "ornek-dil-1", name: "Türkçe", level: "Anadil" },
    { id: "ornek-dil-2", name: "İngilizce", level: "İleri" },
  ],
  references: [],
};

export const EMPTY_CV: CvData = {
  personal: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    city: "",
    linkedin: "",
    github: "",
    photo: "",
  },
  summary: "",
  experiences: [],
  educations: [],
  projects: [],
  certificates: [],
  skills: [],
  languages: [],
  references: [],
};
