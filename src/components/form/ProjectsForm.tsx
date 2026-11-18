"use client";

import type { Project } from "@/types/cv";
import { createEmptyProject } from "@/lib/defaultCv";
import { useLocale } from "@/hooks/useLocale";
import { TextAreaField, TextField } from "./Fields";
import { RepeatableSection } from "./RepeatableSection";

type ProjectsFormProps = {
  items: Project[];
  onChange: (items: Project[]) => void;
};

export function ProjectsForm({ items, onChange }: ProjectsFormProps) {
  const { t } = useLocale();
  return (
    <RepeatableSection
      title={t.sections.projects}
      addLabel={t.lists.addProject}
      items={items}
      onChange={onChange}
      createEmpty={createEmptyProject}
      getItemTitle={(item, index) => item.name || t.lists.projectFallback(index + 1)}
      renderFields={(item, update) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label={t.fields.projectName} value={item.name} onChange={update("name")} />
            <TextField label={t.fields.projectLink} value={item.link} onChange={update("link")} placeholder="github.com/..." />
            <TextField label={t.fields.start} type="month" value={item.startDate} onChange={update("startDate")} />
            <TextField label={t.fields.end} type="month" value={item.endDate} onChange={update("endDate")} />
          </div>
          <TextAreaField label={t.fields.description} value={item.description} onChange={update("description")} />
        </>
      )}
    />
  );
}
