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

// Zaman Çizelgesi: deneyim, proje ve eğitim kayıtları dikey bir çizgi üzerinde,
// her kayıt bir nokta ile işaretli. Vurgu rengi mor.

function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-3 text-[13px] font-bold tracking-[0.14em] text-violet-700 uppercase">
      {children}
      <span className="h-px flex-1 bg-violet-200" />
    </h2>
  );
}

type TimelineItemProps = {
  date: string;
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
};

// Sol kenarlık çizgiyi, ::before yerine mutlak konumlu bir span noktayı çiziyor.
function TimelineItem({ date, title, subtitle, children }: TimelineItemProps) {
  return (
    <article className="relative break-inside-avoid border-l-2 border-violet-200 pb-5 pl-6 last:pb-0">
      <span className="absolute top-1 -left-[7px] h-3 w-3 rounded-full border-2 border-white bg-violet-600 ring-2 ring-violet-200" />
      {date && <p className="text-[11px] font-semibold tracking-wide text-violet-600 uppercase">{date}</p>}
      <h3 className="text-[14px] font-bold text-slate-900">{title}</h3>
      {subtitle && <p className="text-slate-500">{subtitle}</p>}
      {children}
    </article>
  );
}

export function TimelineTemplate({ cv, i18n }: TemplateProps) {
  const t = i18n.labels;
  const { personal } = cv;
  const contacts = getContactEntries(personal, t);
  const visible = getVisibleSections(cv);
  const languages = cv.languages.filter((language) => language.name.trim());

  return (
    <div className="min-h-[297mm] px-14 py-12 font-sans text-[12.5px] leading-relaxed text-slate-700 wrap-anywhere">
      <header className="mb-8 flex items-center gap-6">
        {personal.photo && (
          <Photo src={personal.photo} className="h-24 w-24 shrink-0 rounded-full ring-4 ring-violet-100" />
        )}
        <div className="min-w-0">
          <h1 className="text-[34px] leading-none font-extrabold tracking-tight text-slate-900">
            {personal.fullName || t.placeholderName}
          </h1>
          {personal.title && <p className="mt-2 text-[15px] font-medium text-violet-700">{personal.title}</p>}
        </div>
      </header>

      {contacts.length > 0 && (
        <ul className="mb-8 flex flex-wrap gap-2 text-[11.5px]">
          {contacts.map((entry) => (
            <li key={entry.key} className="rounded-full bg-violet-50 px-3 py-1 text-violet-900">
              <ContactLink entry={entry} />
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-7">
        {visible.hasSummary && (
          <section>
            <Heading>{t.about}</Heading>
            <p className="whitespace-pre-line">{cv.summary}</p>
          </section>
        )}

        {visible.hasExperience && (
          <section>
            <Heading>{t.experience}</Heading>
            {cv.experiences.map((item) => (
              <TimelineItem key={item.id} date={i18n.formatRange(item.startDate, item.endDate)} title={item.position} subtitle={item.company}>
                <Bullets text={item.description} className="mt-1 marker:text-violet-400" />
              </TimelineItem>
            ))}
          </section>
        )}

        {visible.hasProjects && (
          <section>
            <Heading>{t.projects}</Heading>
            {cv.projects.map((item) => (
              <TimelineItem
                key={item.id}
                date={i18n.formatRange(item.startDate, item.endDate)}
                title={item.name}
                subtitle={item.link ? <ExternalLink url={item.link} className="text-violet-700" /> : undefined}
              >
                <Bullets text={item.description} className="mt-1 marker:text-violet-400" />
              </TimelineItem>
            ))}
          </section>
        )}

        {visible.hasEducation && (
          <section>
            <Heading>{t.education}</Heading>
            {cv.educations.map((item) => (
              <TimelineItem key={item.id} date={i18n.formatRange(item.startDate, item.endDate)} title={item.school} subtitle={item.degree} />
            ))}
          </section>
        )}

        {(visible.hasSkills || visible.hasLanguages || visible.hasCertificates) && (
          <div className="grid grid-cols-3 gap-6">
            {visible.hasSkills && (
              <section className="col-span-2">
                <Heading>{t.skills}</Heading>
                <ul className="flex flex-wrap gap-1.5">
                  {cv.skills.map((skill) => (
                    <li key={skill} className="rounded-md border border-violet-200 px-2 py-0.5 text-slate-800">
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {visible.hasLanguages && (
              <section>
                <Heading>{t.languages}</Heading>
                <ul className="space-y-1">
                  {languages.map((language) => (
                    <li key={language.id}>
                      <span className="font-semibold text-slate-900">{language.name}</span>
                      <span className="text-slate-500"> · {i18n.levels[language.level]}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {visible.hasCertificates && (
              <section className="col-span-3">
                <Heading>{t.certificates}</Heading>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {cv.certificates.map((item) => (
                    <li key={item.id} className="break-inside-avoid">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-[11.5px] text-slate-500">{joinNonEmpty([item.issuer, i18n.formatMonth(item.date)])}</p>
                      <ExternalLink url={item.link} className="text-[11px] text-violet-700" />
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
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
              {cv.references.map((item) => (
                <li key={item.id} className="break-inside-avoid">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  {item.position && <p>{item.position}</p>}
                  <p className="text-[11px] text-slate-500">{joinNonEmpty([item.email, item.phone])}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
