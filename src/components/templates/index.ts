import type { ComponentType } from "react";
import type { TemplateId } from "@/types/cv";
import type { TemplateProps } from "./shared";
import { ModernTemplate } from "./ModernTemplate";
import { ClassicTemplate } from "./ClassicTemplate";
import { MinimalTemplate } from "./MinimalTemplate";
import { CorporateTemplate } from "./CorporateTemplate";
import { TimelineTemplate } from "./TimelineTemplate";

interface TemplateOption {
  id: TemplateId;
  component: ComponentType<TemplateProps>;
}

// Yeni bir şablon eklemek için: bileşeni yaz, TEMPLATE_IDS'e id ekle, buraya bir satır ekle
// ve çeviri dosyalarındaki "templates" bölümüne şablonun adını yaz.
// (Şablon adları dile göre değiştiği için burada değil, çeviri dosyalarında duruyor.)
export const TEMPLATES: readonly TemplateOption[] = [
  { id: "modern", component: ModernTemplate },
  { id: "klasik", component: ClassicTemplate },
  { id: "minimal", component: MinimalTemplate },
  { id: "kurumsal", component: CorporateTemplate },
  { id: "zaman", component: TimelineTemplate },
];

export function getTemplate(id: TemplateId): TemplateOption {
  return TEMPLATES.find((template) => template.id === id) ?? TEMPLATES[0];
}
