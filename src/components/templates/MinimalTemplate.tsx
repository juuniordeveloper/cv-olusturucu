import type { ReactNode } from "react";
import {
  Bullets,
  ContactLink,
  ExternalLink,
  Photo,
  getContactEntries,
  getVisibleSections,
  joinNonEmpty,
} from "./shared";
import type { TemplateProps } from "./shared";

// Minimal: bol boşluk, solda küçük bölüm etiketleri, sağda içerik (iki sütunlu ızgara).

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-[120px_minmax(0,1fr)] gap-6 break-inside-avoid">
      <h2 className="pt-0.5 text-[10px] font-semibold tracking-[0.2em] text-zinc-400 uppercase">{label}</h2>
      <div>{children}</div>
    </section>
  );
}

export function MinimalTemplate({ cv, i18n }: TemplateProps) {
  const t = i18n.labels;
  const { personal } = cv;
  const contacts = getContactEntries(personal, t);
  const visible = getVisibleSections(cv);
  const languages = cv.languages.filter((language) => language.name.trim());

  return (
    <div className="min-h-[297mm] px-16 py-14 font-sans wrap-anywhere text-[13px] leading-relaxed text-zinc-700">
      <header className="mb-12 flex items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-[40px] leading-none font-light tracking-tight text-zinc-900">
            {personal.fullName || t.placeholderName}
          </h1>
          {personal.title && (
            <p className="mt-3 text-[13px] font-medium tracking-[0.25em] text-rose-600 uppercase">{personal.title}</p>
          )}
        </div>
        {personal.photo && <Photo src={personal.photo} className="h-20 w-20 shrink-0 rounded-2xl grayscale" />}
      </header>

      <div className="space-y-9">
        {contacts.length > 0 && (
          <Row label={t.contact}>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
              {contacts.map((entry) => (
                <li key={entry.key} className="break-words">
                  <ContactLink entry={entry} className="text-zinc-800" />
                </li>
              ))}
            </ul>
          </Row>
        )}

        {visible.hasSummary && (
          <Row label={t.profile}>
            <p className="whitespace-pre-line text-zinc-800">{cv.summary}</p>
          </Row>
        )}

        {visible.hasExperience && (
          <Row label={t.experience}>
            <div className="space-y-5">
              {cv.experiences.map((item) => (
                <article key={item.id} className="break-inside-avoid">
                  <p className="text-[11px] text-zinc-400">{i18n.formatRange(item.startDate, item.endDate)}</p>
                  <h3 className="font-semibold text-zinc-900">
                    {item.position}
                    {item.company && <span className="font-normal text-zinc-500"> — {item.company}</span>}
                  </h3>
                  <Bullets text={item.description} className="mt-1 marker:text-rose-400" />
                </article>
              ))}
            </div>
          </Row>
        )}

        {visible.hasProjects && (
          <Row label={t.projects}>
            <div className="space-y-5">
              {cv.projects.map((item) => (
                <article key={item.id} className="break-inside-avoid">
                  <p className="text-[11px] text-zinc-400">{i18n.formatRange(item.startDate, item.endDate)}</p>
                  <h3 className="font-semibold text-zinc-900">{item.name}</h3>
                  <ExternalLink url={item.link} className="text-[12px] text-rose-600" />
                  <Bullets text={item.description} className="mt-1 marker:text-rose-400" />
                </article>
              ))}
            </div>
          </Row>
        )}

        {visible.hasEducation && (
          <Row label={t.education}>
            <div className="space-y-3">
              {cv.educations.map((item) => (
                <article key={item.id}>
                  <p className="text-[11px] text-zinc-400">{i18n.formatRange(item.startDate, item.endDate)}</p>
                  <h3 className="font-semibold text-zinc-900">{item.school}</h3>
                  {item.degree && <p>{item.degree}</p>}
                </article>
              ))}
            </div>
          </Row>
        )}

        {visible.hasCertificates && (
          <Row label={t.certificates}>
            <div className="space-y-3">
              {cv.certificates.map((item) => (
                <article key={item.id}>
                  <p className="text-[11px] text-zinc-400">{i18n.formatMonth(item.date)}</p>
                  <h3 className="font-semibold text-zinc-900">
                    {item.name}
                    {item.issuer && <span className="font-normal text-zinc-500"> — {item.issuer}</span>}
                  </h3>
                  <ExternalLink url={item.link} className="text-[12px] text-rose-600" />
                </article>
              ))}
            </div>
          </Row>
        )}

        {visible.hasSkills && (
          <Row label={t.skills}>
            <p className="text-zinc-800">{cv.skills.join("  /  ")}</p>
          </Row>
        )}

        {visible.hasLanguages && (
          <Row label={t.languages}>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
              {languages.map((language) => (
                <li key={language.id}>
                  <span className="text-zinc-900">{language.name}</span>
                  <span className="text-zinc-400"> · {i18n.levels[language.level]}</span>
                </li>
              ))}
            </ul>
          </Row>
        )}
        {visible.hasReferences && (
          <Row label={t.references}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {cv.references.map((item) => (
                <article key={item.id}>
                  <h3 className="font-semibold text-zinc-900">{item.name}</h3>
                  {item.position && <p>{item.position}</p>}
                  <p className="text-[12px] text-zinc-400">{joinNonEmpty([item.email, item.phone])}</p>
                </article>
              ))}
            </div>
          </Row>
        )}
      </div>
    </div>
  );
}
