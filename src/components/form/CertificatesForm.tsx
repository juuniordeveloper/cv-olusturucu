"use client";

import type { Certificate } from "@/types/cv";
import { createEmptyCertificate } from "@/lib/defaultCv";
import { useLocale } from "@/hooks/useLocale";
import { TextField } from "./Fields";
import { RepeatableSection } from "./RepeatableSection";

type CertificatesFormProps = {
  items: Certificate[];
  onChange: (items: Certificate[]) => void;
};

export function CertificatesForm({ items, onChange }: CertificatesFormProps) {
  const { t } = useLocale();
  return (
    <RepeatableSection
      title={t.sections.certificates}
      addLabel={t.lists.addCertificate}
      items={items}
      onChange={onChange}
      createEmpty={createEmptyCertificate}
      getItemTitle={(item, index) => item.name || t.lists.certificateFallback(index + 1)}
      renderFields={(item, update) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label={t.fields.certificateName} value={item.name} onChange={update("name")} />
          <TextField label={t.fields.issuer} value={item.issuer} onChange={update("issuer")} placeholder={t.fields.issuerPlaceholder} />
          <TextField label={t.fields.date} type="month" value={item.date} onChange={update("date")} />
          <TextField label={t.fields.verificationLink} value={item.link} onChange={update("link")} />
        </div>
      )}
    />
  );
}
