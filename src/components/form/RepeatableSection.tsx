import type { ReactNode } from "react";
import { moveItem, removeItem, updateItem } from "@/lib/listUtils";
import { AddButton, FormSection, ListItemCard } from "./FormSection";

// Deneyim, Eğitim, Projeler, Sertifikalar, Referanslar… Hepsi aynı davranıyor:
// kayıt ekle, sil, yukarı/aşağı taşı, alanları düzenle. Sadece ALANLAR farklı.
//
// Bu yüzden ortak davranışı tek bir "generic" bileşende topluyoruz.
// <T extends { id: string }> şu demek: "T herhangi bir tip olabilir, yeter ki id'si olsun".
// Farklı olan kısmı (alanları) renderFields fonksiyonuyla dışarıdan alıyoruz
// — buna "render prop" deseni denir.

// Bir kaydın tek bir metin alanını güncelleyen fonksiyon üretir.
export type FieldUpdater<T> = (field: keyof T & string) => (value: string) => void;

type RepeatableSectionProps<T extends { id: string }> = {
  title: string;
  addLabel: string;
  items: T[];
  onChange: (items: T[]) => void;
  createEmpty: () => T;
  getItemTitle: (item: T, index: number) => string;
  renderFields: (item: T, update: FieldUpdater<T>) => ReactNode;
};

export function RepeatableSection<T extends { id: string }>({
  title,
  addLabel,
  items,
  onChange,
  createEmpty,
  getItemTitle,
  renderFields,
}: RepeatableSectionProps<T>) {
  return (
    <FormSection title={title}>
      {items.map((item, index) => {
        const update: FieldUpdater<T> = (field) => (value) =>
          onChange(updateItem(items, item.id, { [field]: value } as Partial<T>));
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          // key olarak index değil id kullanıyoruz: sıralama değişince React karıştırmasın.
          <ListItemCard
            key={item.id}
            title={getItemTitle(item, index)}
            onRemove={() => onChange(removeItem(items, item.id))}
            onMoveUp={isFirst ? undefined : () => onChange(moveItem(items, item.id, -1))}
            onMoveDown={isLast ? undefined : () => onChange(moveItem(items, item.id, 1))}
          >
            {renderFields(item, update)}
          </ListItemCard>
        );
      })}
      <AddButton label={addLabel} onClick={() => onChange([...items, createEmpty()])} />
    </FormSection>
  );
}
