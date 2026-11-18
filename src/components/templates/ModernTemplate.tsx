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

// Modern: koyu renkli sol kenar çubuğu + geniş ana sütun.

function SidebarHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-white/20 pb-1 text-[11px] font-semibold tracking-[0.2em] text-teal-200 uppercase">
      {children}
    </h2>
  );
}

function MainHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-3 text-sm font-bold tracking-[0.15em] text-slate-800 uppercase">
      <span className="h-0.5 w-6 bg-teal-600" />
      {children}
    </h2>
  );
}

export function ModernTemplate({ cv, i18n }: TemplateProps) {
  const t = i18n.labels;
  const { personal } = cv;
  const contacts = getContactEntries(personal, t);
  const visible = getVisibleSections(cv);

  return (
    <div className="grid min-h-[297mm] grid-cols-[34%_minmax(0,1fr)] font-sans wrap-anywhere text-[13px] leading-relaxed text-slate-700">
      <aside data-sheet-column className="space-y-7 bg-slate-800 px-7 py-10 text-slate-200">
        {personal.photo && (
          <Photo src={personal.photo} className="mx-auto h-32 w-32 rounded-full ring-4 ring-teal-400/40" />
        )}
        {contacts.length > 0 && (
          <section>
            <SidebarHeading>{t.contact}</SidebarHeading>
            <ul className="space-y-2 text-[12px]">
              {contacts.map((entry) => (
                <li key={entry.key} className="break-words">
                  <span className="block text-[10px] tracking-wider text-slate-400 uppercase">{entry.label}</span>
                  <ContactLink entry={entry} />
                </li>
              ))}
            </ul>
          </section>
        )}
        {visible.hasSkills && (
          <section>
            <SidebarHeading>{t.skills}</SidebarHeading>
            <ul className="flex flex-wrap gap-1.5">
              {cv.skills.map((skill) => (
                <li key={skill} className="rounded bg-white/10 px-2 py-0.5 text-[12px]">
                  {skill}
                </li>
              ))}
            </ul>
          </section>
        )}
        {visible.hasLanguages && (
          <section>
            <SidebarHeading>{t.languages}</SidebarHeading>
            <ul className="space-y-1.5 text-[12px]">
              {cv.languages
                .filter((language) => language.name.trim())
                .map((language) => (
                  <li key={language.id} className="flex justify-between gap-2">
                    <span>{language.name}</span>
                    <span className="text-teal-200">{i18n.levels[language.level]}</span>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </aside>

      <main className="space-y-7 px-9 py-10">
        <header>
          <h1 className="text-[34px] leading-tight font-bold text-slate-900">
            {personal.fullName || t.placeholderName}
          </h1>
          {personal.title && <p className="mt-1 text-lg font-medium text-teal-700">{personal.title}</p>}
        </header>

        {visible.hasSummary && (
          <section>
            <MainHeading>{t.about}</MainHeading>
            <p className="whitespace-pre-line">{cv.summary}</p>
          </section>
        )}

        {visible.hasExperience && (
          <section>
            <MainHeading>{t.experience}</MainHeading>
            <div className="space-y-4">
              {cv.experiences.map((item) => (
                <article key={item.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="font-semibold text-slate-900">{item.position}</h3>
                    <span className="text-[11px] text-slate-500">{i18n.formatRange(item.startDate, item.endDate)}</span>
                  </div>
                  {item.company && <p className="text-teal-700">{item.company}</p>}
                  <Bullets text={item.description} className="mt-1" />
                </article>
              ))}
            </div>
          </section>
        )}

        {visible.hasProjects && (
          <section>
            <MainHeading>{t.projects}</MainHeading>
            <div className="space-y-4">
              {cv.projects.map((item) => (
                <article key={item.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <span className="text-[11px] text-slate-500">{i18n.formatRange(item.startDate, item.endDate)}</span>
                  </div>
                  <ExternalLink url={item.link} className="text-[12px] text-teal-700" />
                  <Bullets text={item.description} className="mt-1" />
                </article>
              ))}
            </div>
          </section>
        )}

        {visible.hasEducation && (
          <section>
            <MainHeading>{t.education}</MainHeading>
            <div className="space-y-3">
              {cv.educations.map((item) => (
                <article key={item.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="font-semibold text-slate-900">{item.school}</h3>
                    <span className="text-[11px] text-slate-500">{i18n.formatRange(item.startDate, item.endDate)}</span>
                  </div>
                  {item.degree && <p>{item.degree}</p>}
                </article>
              ))}
            </div>
          </section>
        )}
        {visible.hasCertificates && (
          <section>
            <MainHeading>{t.certificates}</MainHeading>
            <div className="space-y-2">
              {cv.certificates.map((item) => (
                <article key={item.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <span className="text-[11px] text-slate-500">{i18n.formatMonth(item.date)}</span>
                  </div>
                  {item.issuer && <p>{item.issuer}</p>}
                  <ExternalLink url={item.link} className="text-[12px] text-teal-700" />
                </article>
              ))}
            </div>
          </section>
        )}

        {visible.hasReferences && (
          <section>
            <MainHeading>{t.references}</MainHeading>
            <div className="grid grid-cols-2 gap-4">
              {cv.references.map((item) => (
                <article key={item.id} className="break-inside-avoid">
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  {item.position && <p className="text-teal-700">{item.position}</p>}
                  <p className="text-[12px] text-slate-500">{joinNonEmpty([item.email, item.phone])}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
