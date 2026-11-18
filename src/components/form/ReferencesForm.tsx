"use client";

import type { Reference } from "@/types/cv";
import { createEmptyReference } from "@/lib/defaultCv";
import { useLocale } from "@/hooks/useLocale";
import { TextField } from "./Fields";
import { RepeatableSection } from "./RepeatableSection";

type ReferencesFormProps = {
  items: Reference[];
  onChange: (items: Reference[]) => void;
};

export function ReferencesForm({ items, onChange }: ReferencesFormProps) {
  const { t } = useLocale();
  return (
    <RepeatableSection
      title={t.sections.references}
      addLabel={t.lists.addReference}
      items={items}
      onChange={onChange}
      createEmpty={createEmptyReference}
      getItemTitle={(item, index) => item.name || t.lists.referenceFallback(index + 1)}
      renderFields={(item, update) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label={t.fields.fullName} value={item.name} onChange={update("name")} />
          <TextField
            label={t.fields.referencePosition}
            value={item.position}
            onChange={update("position")}
            placeholder={t.fields.referencePositionPlaceholder}
          />
          <TextField label={t.fields.email} type="email" value={item.email} onChange={update("email")} />
          <TextField label={t.fields.phone} type="tel" value={item.phone} onChange={update("phone")} />
        </div>
      )}
    />
  );
}
