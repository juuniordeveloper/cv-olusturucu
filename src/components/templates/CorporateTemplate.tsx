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

// Kurumsal: lacivert üst bant, altında geniş ana sütun + açık gri bilgi paneli.

function MainHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-[12px] font-bold tracking-[0.18em] text-blue-950 uppercase">
      {children}
      <span className="mt-1.5 block h-[3px] w-10 bg-amber-500" />
    </h2>
  );
}

function SideHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2.5 border-b border-slate-300 pb-1 text-[11px] font-bold tracking-[0.18em] text-blue-950 uppercase">
      {children}
    </h2>
  );
}

type EntryProps = {
  title: string;
  subtitle?: ReactNode;
  date: string;
  children?: ReactNode;
};

function Entry({ title, subtitle, date, children }: EntryProps) {
  return (
    <article className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <span className="text-[11px] font-medium text-slate-500">{date}</span>
      </div>
      {subtitle && <p className="font-medium text-blue-800">{subtitle}</p>}
      {children}
    </article>
  );
}

export function CorporateTemplate({ cv, i18n }: TemplateProps) {
  const t = i18n.labels;
  const { personal } = cv;
  const contacts = getContactEntries(personal, t);
  const visible = getVisibleSections(cv);
  const languages = cv.languages.filter((language) => language.name.trim());

  return (
    <div className="flex min-h-[297mm] flex-col font-sans text-[12.5px] leading-relaxed text-slate-700 wrap-anywhere">
      <header className="flex items-center gap-7 bg-blue-950 px-12 py-9 text-white">
        {personal.photo && (
          <Photo src={personal.photo} className="h-28 w-28 shrink-0 rounded-lg ring-4 ring-amber-500/70" />
        )}
        <div className="min-w-0">
          <h1 className="text-[32px] leading-tight font-bold tracking-tight">
            {personal.fullName || t.placeholderName}
          </h1>
          {personal.title && (
            <p className="mt-1 text-[14px] font-semibold tracking-[0.12em] text-amber-400 uppercase">
              {personal.title}
            </p>
          )}
          {contacts.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11.5px] text-blue-100">
              {contacts.map((entry) => (
                <li key={entry.key}>
                  <ContactLink entry={entry} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_32%]">
        <main className="space-y-6 px-12 py-8">
          {visible.hasSummary && (
            <section>
              <MainHeading>{t.profile}</MainHeading>
              <p className="whitespace-pre-line">{cv.summary}</p>
            </section>
          )}

          {visible.hasExperience && (
            <section>
              <MainHeading>{t.workExperience}</MainHeading>
              <div className="space-y-4">
                {cv.experiences.map((item) => (
                  <Entry key={item.id} title={item.position} subtitle={item.company} date={i18n.formatRange(item.startDate, item.endDate)}>
                    <Bullets text={item.description} className="mt-1 marker:text-amber-500" />
                  </Entry>
                ))}
              </div>
            </section>
          )}

          {visible.hasProjects && (
            <section>
              <MainHeading>{t.projects}</MainHeading>
              <div className="space-y-4">
                {cv.projects.map((item) => (
                  <Entry
                    key={item.id}
                    title={item.name}
                    subtitle={item.link ? <ExternalLink url={item.link} /> : undefined}
                    date={i18n.formatRange(item.startDate, item.endDate)}
                  >
                    <Bullets text={item.description} className="mt-1 marker:text-amber-500" />
                  </Entry>
                ))}
              </div>
            </section>
          )}

          {visible.hasEducation && (
            <section>
              <MainHeading>{t.education}</MainHeading>
              <div className="space-y-3">
                {cv.educations.map((item) => (
                  <Entry key={item.id} title={item.school} subtitle={item.degree} date={i18n.formatRange(item.startDate, item.endDate)} />
                ))}
              </div>
            </section>
          )}
        </main>

        <aside data-sheet-column className="space-y-6 bg-slate-100 px-7 py-8">
          {visible.hasSkills && (
            <section>
              <SideHeading>{t.skills}</SideHeading>
              <ul className="space-y-1">
                {cv.skills.map((skill) => (
                  <li key={skill} className="flex items-start gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-amber-500" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {visible.hasLanguages && (
            <section>
              <SideHeading>{t.languages}</SideHeading>
              <ul className="space-y-1">
                {languages.map((language) => (
                  <li key={language.id} className="flex justify-between gap-2">
                    <span className="font-medium text-slate-900">{language.name}</span>
                    <span className="text-slate-500">{i18n.levels[language.level]}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {visible.hasCertificates && (
            <section>
              <SideHeading>{t.certificates}</SideHeading>
              <ul className="space-y-2.5">
                {cv.certificates.map((item) => (
                  <li key={item.id} className="break-inside-avoid">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-[11.5px] text-slate-500">{joinNonEmpty([item.issuer, i18n.formatMonth(item.date)])}</p>
                    <ExternalLink url={item.link} className="text-[11px] text-blue-800" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {visible.hasReferences && (
            <section>
              <SideHeading>{t.references}</SideHeading>
              <ul className="space-y-2.5">
                {cv.references.map((item) => (
                  <li key={item.id} className="break-inside-avoid">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    {item.position && <p className="text-[11.5px]">{item.position}</p>}
                    <p className="text-[11px] text-slate-500">{joinNonEmpty([item.email, item.phone])}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
