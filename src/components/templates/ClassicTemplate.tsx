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

// Klasik: serif yazı tipi, ortalanmış başlık, ince çizgilerle ayrılmış tek sütun.

function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 border-b border-stone-800 pb-0.5 text-[13px] font-bold tracking-[0.18em] text-stone-900 uppercase">
      {children}
    </h2>
  );
}

export function ClassicTemplate({ cv, i18n }: TemplateProps) {
  const t = i18n.labels;
  const { personal } = cv;
  const contacts = getContactEntries(personal, t);
  const visible = getVisibleSections(cv);
  const languages = cv.languages.filter((language) => language.name.trim());

  return (
    <div className="min-h-[297mm] px-14 py-12 font-serif wrap-anywhere text-[13px] leading-relaxed text-stone-800">
      <header className="mb-6 flex items-center gap-6 border-b-2 border-double border-stone-800 pb-5">
        {personal.photo && <Photo src={personal.photo} className="h-24 w-24 shrink-0 rounded-sm" />}
        <div className={personal.photo ? "min-w-0" : "w-full text-center"}>
          <h1 className="text-[30px] leading-tight font-bold tracking-wide text-stone-900">
            {personal.fullName || t.placeholderName}
          </h1>
          {personal.title && <p className="text-[15px] text-stone-600 italic">{personal.title}</p>}
          {contacts.length > 0 && (
            <p className="mt-2 text-[12px] text-stone-600">
              {contacts.map((entry, index) => (
                <span key={entry.key}>
                  {index > 0 && <span className="mx-2 text-stone-400">·</span>}
                  <ContactLink entry={entry} />
                </span>
              ))}
            </p>
          )}
        </div>
      </header>

      <div className="space-y-5">
        {visible.hasSummary && (
          <section>
            <Heading>{t.summary}</Heading>
            <p className="whitespace-pre-line">{cv.summary}</p>
          </section>
        )}

        {visible.hasExperience && (
          <section>
            <Heading>{t.workExperience}</Heading>
            <div className="space-y-3">
              {cv.experiences.map((item) => (
                <article key={item.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3>
                      <span className="font-bold">{item.position}</span>
                      {item.company && <span className="italic">, {item.company}</span>}
                    </h3>
                    <span className="text-[12px] text-stone-500">{i18n.formatRange(item.startDate, item.endDate)}</span>
                  </div>
                  <Bullets text={item.description} className="mt-0.5" />
                </article>
              ))}
            </div>
          </section>
        )}

        {visible.hasProjects && (
          <section>
            <Heading>{t.projects}</Heading>
            <div className="space-y-3">
              {cv.projects.map((item) => (
                <article key={item.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3>
                      <span className="font-bold">{item.name}</span>
                      {item.link && (
                        <>
                          {", "}
                          <ExternalLink url={item.link} className="italic" />
                        </>
                      )}
                    </h3>
                    <span className="text-[12px] text-stone-500">{i18n.formatRange(item.startDate, item.endDate)}</span>
                  </div>
                  <Bullets text={item.description} className="mt-0.5" />
                </article>
              ))}
            </div>
          </section>
        )}

        {visible.hasEducation && (
          <section>
            <Heading>{t.education}</Heading>
            <div className="space-y-2">
              {cv.educations.map((item) => (
                <article key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-3 break-inside-avoid">
                  <h3>
                    <span className="font-bold">{item.school}</span>
                    {item.degree && <span className="italic">, {item.degree}</span>}
                  </h3>
                  <span className="text-[12px] text-stone-500">{i18n.formatRange(item.startDate, item.endDate)}</span>
                </article>
              ))}
            </div>
          </section>
        )}

        {visible.hasCertificates && (
          <section>
            <Heading>{t.certificates}</Heading>
            <div className="space-y-1">
              {cv.certificates.map((item) => (
                <article key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-3 break-inside-avoid">
                  <h3>
                    <span className="font-bold">{item.name}</span>
                    {item.issuer && <span className="italic">, {item.issuer}</span>}
                    {item.link && (
                      <>
                        {" — "}
                        <ExternalLink url={item.link} className="text-[12px] text-stone-500" />
                      </>
                    )}
                  </h3>
                  <span className="text-[12px] text-stone-500">{i18n.formatMonth(item.date)}</span>
                </article>
              ))}
            </div>
          </section>
        )}

        {(visible.hasSkills || visible.hasLanguages) && (
          <div className="grid grid-cols-2 gap-8">
            {visible.hasSkills && (
              <section>
                <Heading>{t.skills}</Heading>
                <p>{cv.skills.join(" · ")}</p>
              </section>
            )}
            {visible.hasLanguages && (
              <section>
                <Heading>{t.languages}</Heading>
                <ul>
                  {languages.map((language) => (
                    <li key={language.id}>
                      <span className="font-bold">{language.name}</span> — {i18n.levels[language.level]}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
        {visible.hasReferences && (
          <section>
            <Heading>{t.references}</Heading>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {cv.references.map((item) => (
                <article key={item.id} className="break-inside-avoid">
                  <h3 className="font-bold">{item.name}</h3>
                  {item.position && <p className="italic">{item.position}</p>}
                  <p className="text-[12px] text-stone-600">{joinNonEmpty([item.email, item.phone])}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
