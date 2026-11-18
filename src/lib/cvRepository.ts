import { z } from "zod";
import { TEMPLATE_IDS } from "@/types/cv";
import type { CvData, TemplateId } from "@/types/cv";
import { createId, EMPTY_CV } from "@/lib/defaultCv";
import { parseCv, parseTemplate } from "@/lib/storage";

// "Repository" (depo) deseni: CV'leri nerede/nasıl sakladığımızı tek bir yerde
// topluyoruz. Uygulamanın geri kalanı sadece list/get/create/save/remove bilir;
// yarın localStorage yerine IndexedDB ya da bir sunucu kullanırsak sadece burası değişir.
//
// Depolama düzeni:
//   cv-olusturucu:index:v1      → tüm CV'lerin özet bilgisi (ad, şablon, tarihler)
//   cv-olusturucu:cv:v1:<id>    → her CV'nin içeriği ayrı anahtarda
// İçerikleri ayırmamızın sebebi: bir CV'yi kaydederken (fotoğraflı olabilir) diğer
// CV'lerin verisini tekrar tekrar yazmamak.

const INDEX_KEY = "cv-olusturucu:index:v1";
const dataKey = (id: string) => `cv-olusturucu:cv:v1:${id}`;
// Çoklu CV'den önceki tek CV'nin anahtarları (taşıma için).
const LEGACY_CV_KEY = "cv-olusturucu:cv:v1";
const LEGACY_TEMPLATE_KEY = "cv-olusturucu:template:v1";

export const MAX_CV_NAME_LENGTH = 60;
const DEFAULT_TEMPLATE: TemplateId = "modern";
const LEGACY_FALLBACK_NAME = "CV'm";

// localStorage'ın kullandığımız kısmı. Testlerde sahte bir depolama verebilmek için arayüz.
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const metaSchema = z.object({
  id: z.string(),
  name: z.string(),
  template: z.enum(TEMPLATE_IDS),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type CvMeta = z.infer<typeof metaSchema>;

// Hatalar metin değil KOD olarak dönüyor ("quota", "required"...). Bu dosya dilden
// bağımsız kalsın; mesajı ekrandaki bileşen seçili dile göre gösterir.
export type SaveResult = { ok: true } | { ok: false; error: "quota" };
export type NameValidation = { ok: true; value: string } | { ok: false; error: "required" | "tooLong" };

export function validateCvName(raw: string): NameValidation {
  const value = raw.trim();
  if (!value) return { ok: false, error: "required" };
  if (value.length > MAX_CV_NAME_LENGTH) return { ok: false, error: "tooLong" };
  return { ok: true, value };
}

export interface CvRepository {
  // Listenin ham hâli: liste her değiştiğinde (oluşturma, kaydetme, silme) farklı bir
  // metin döner. React'in useSyncExternalStore'u "değişti mi?" sorusunu buna bakarak cevaplar.
  snapshot(): string;
  list(): CvMeta[];
  get(id: string): { meta: CvMeta; data: CvData } | null;
  create(name: string): CvMeta;
  save(id: string, data: CvData, now?: number): SaveResult;
  setTemplate(id: string, template: TemplateId): void;
  remove(id: string): void;
}

export function createCvRepository(storage: KeyValueStorage): CvRepository {
  function readIndex(): CvMeta[] | null {
    const raw = storage.getItem(INDEX_KEY);
    if (raw === null) return null;
    try {
      const result = z.array(metaSchema).safeParse(JSON.parse(raw));
      return result.success ? result.data : [];
    } catch {
      return [];
    }
  }

  function writeIndex(index: readonly CvMeta[]): void {
    storage.setItem(INDEX_KEY, JSON.stringify(index));
  }

  // Liste hiç oluşturulmamışsa: eski tek CV varsa onu ilk CV yap, yoksa boş liste.
  function loadIndex(): CvMeta[] {
    const existing = readIndex();
    if (existing !== null) return existing;

    const legacyCv = parseCv(storage.getItem(LEGACY_CV_KEY));
    if (!legacyCv) {
      writeIndex([]);
      return [];
    }
    const now = Date.now();
    const meta: CvMeta = {
      id: createId(),
      name: legacyCv.personal.fullName.trim() || LEGACY_FALLBACK_NAME,
      template: parseTemplate(storage.getItem(LEGACY_TEMPLATE_KEY)) ?? DEFAULT_TEMPLATE,
      createdAt: now,
      updatedAt: now,
    };
    storage.setItem(dataKey(meta.id), JSON.stringify(legacyCv));
    writeIndex([meta]);
    storage.removeItem(LEGACY_CV_KEY);
    storage.removeItem(LEGACY_TEMPLATE_KEY);
    return [meta];
  }

  function updateMeta(id: string, patch: Partial<CvMeta>): void {
    writeIndex(loadIndex().map((meta) => (meta.id === id ? { ...meta, ...patch } : meta)));
  }

  return {
    snapshot() {
      return storage.getItem(INDEX_KEY) ?? "";
    },

    list() {
      return [...loadIndex()].sort((a, b) => b.updatedAt - a.updatedAt);
    },

    get(id) {
      const meta = loadIndex().find((item) => item.id === id);
      if (!meta) return null;
      return { meta, data: parseCv(storage.getItem(dataKey(id))) ?? EMPTY_CV };
    },

    create(name) {
      const now = Date.now();
      const meta: CvMeta = { id: createId(), name, template: DEFAULT_TEMPLATE, createdAt: now, updatedAt: now };
      storage.setItem(dataKey(meta.id), JSON.stringify(EMPTY_CV));
      writeIndex([...loadIndex(), meta]);
      return meta;
    },

    save(id, data, now = Date.now()) {
      try {
        storage.setItem(dataKey(id), JSON.stringify(data));
        updateMeta(id, { updatedAt: now });
        return { ok: true };
      } catch {
        return { ok: false, error: "quota" }; // En sık sebep: depolama kotası dolu
      }
    },

    setTemplate(id, template) {
      updateMeta(id, { template });
    },

    remove(id) {
      storage.removeItem(dataKey(id));
      writeIndex(loadIndex().filter((meta) => meta.id !== id));
    },
  };
}

// Uygulamanın kullandığı gerçek depo (tarayıcının localStorage'ı).
// Fonksiyon olarak veriyoruz: modül sunucuda yüklenirse window'a hemen erişip patlamasın.
export function getBrowserCvRepository(): CvRepository {
  return createCvRepository(window.localStorage);
}
