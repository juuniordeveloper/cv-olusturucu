import type { CvData, PersonalInfo } from "@/types/cv";
import { displayUrl, toUrl } from "@/lib/format";
import type { CvI18n } from "@/lib/i18n/cvI18n";

// Şablonların ortak kullandığı küçük parçalar.

export interface ContactEntry {
  key: string;
  label: string;
  text: string;
  href?: string;
}

// Boş olmayan iletişim bilgilerini, gösterilecek sırayla liste hâline getirir.
export function getContactEntries(personal: PersonalInfo, labels: CvI18n["labels"]): ContactEntry[] {
  const entries: ContactEntry[] = [
    { key: "email", label: labels.email, text: personal.email, href: `mailto:${personal.email}` },
    { key: "phone", label: labels.phone, text: personal.phone, href: `tel:${personal.phone.replace(/\s/g, "")}` },
    { key: "city", label: labels.city, text: personal.city },
    { key: "linkedin", label: labels.linkedin, text: displayUrl(personal.linkedin), href: toUrl(personal.linkedin) },
    { key: "github", label: labels.github, text: displayUrl(personal.github), href: toUrl(personal.github) },
  ];
  return entries.filter((entry) => entry.text.trim() !== "");
}

type ContactLinkProps = {
  entry: ContactEntry;
  className?: string;
};

export function ContactLink({ entry, className = "" }: ContactLinkProps) {
  if (!entry.href) return <span className={className}>{entry.text}</span>;
  return (
    <a href={entry.href} target="_blank" rel="noopener noreferrer" className={`${className} hover:underline`}>
      {entry.text}
    </a>
  );
}

type BulletsProps = {
  text: string;
  className?: string;
};

// Açıklamadaki her satırı ayrı bir madde olarak gösterir.
export function Bullets({ text, className = "" }: BulletsProps) {
  const lines = text
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <ul className={`list-disc space-y-0.5 pl-4 ${className}`}>
      {lines.map((line, index) => (
        // Bu satırlar metinden türetiliyor ve sıraları değişmiyor; index anahtar burada güvenli.
        <li key={index}>{line}</li>
      ))}
    </ul>
  );
}

type PhotoProps = {
  src: string;
  className?: string;
};

export function Photo({ src, className = "" }: PhotoProps) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={`object-cover ${className}`} />;
}

// Hangi bölümlerin doluluğa göre gösterileceğini tek yerde hesaplar.
export function getVisibleSections(cv: CvData) {
  return {
    hasSummary: cv.summary.trim() !== "",
    hasExperience: cv.experiences.length > 0,
    hasEducation: cv.educations.length > 0,
    hasSkills: cv.skills.length > 0,
    hasLanguages: cv.languages.some((language) => language.name.trim() !== ""),
    hasProjects: cv.projects.length > 0,
    hasCertificates: cv.certificates.length > 0,
    hasReferences: cv.references.length > 0,
  };
}

type ExternalLinkProps = {
  url: string;
  className?: string;
};

// Proje/sertifika bağlantılarını tıklanabilir ve sade ("https://www." olmadan) gösterir.
export function ExternalLink({ url, className = "" }: ExternalLinkProps) {
  if (!url.trim()) return null;
  return (
    <a href={toUrl(url)} target="_blank" rel="noopener noreferrer" className={`${className} hover:underline`}>
      {displayUrl(url)}
    </a>
  );
}

// Referansın iletişim bilgilerini "e-posta · telefon" şeklinde tek satırda birleştirir.
export function joinNonEmpty(values: readonly string[], separator = " · "): string {
  return values.map((value) => value.trim()).filter(Boolean).join(separator);
}

export type TemplateProps = {
  cv: CvData;
  i18n: CvI18n; // Seçili dildeki başlıklar, dil seviyeleri ve tarih biçimi
};
