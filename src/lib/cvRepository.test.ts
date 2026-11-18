import { beforeEach, describe, expect, test } from "vitest";
import { createCvRepository, validateCvName, MAX_CV_NAME_LENGTH } from "@/lib/cvRepository";
import type { KeyValueStorage } from "@/lib/cvRepository";
import { EMPTY_CV, SAMPLE_CV } from "@/lib/defaultCv";

// Testlerde gerçek localStorage yerine bellekte çalışan sahte bir depolama kullanıyoruz.
function createMemoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

describe("validateCvName", () => {
  test("baştaki/sondaki boşlukları temizleyip kabul eder", () => {
    expect(validateCvName("  Frontend başvurusu ")).toEqual({ ok: true, value: "Frontend başvurusu" });
  });

  test("boş adı reddeder", () => {
    expect(validateCvName("   ").ok).toBe(false);
  });

  test("çok uzun adı reddeder", () => {
    expect(validateCvName("a".repeat(MAX_CV_NAME_LENGTH + 1)).ok).toBe(false);
    expect(validateCvName("a".repeat(MAX_CV_NAME_LENGTH)).ok).toBe(true);
  });
});

describe("createCvRepository", () => {
  let storage: ReturnType<typeof createMemoryStorage>;
  beforeEach(() => {
    storage = createMemoryStorage();
  });

  test("hiç kayıt yoksa boş liste döner", () => {
    expect(createCvRepository(storage).list()).toEqual([]);
  });

  test("yeni CV'yi verilen adla ve boş içerikle oluşturur", () => {
    const repo = createCvRepository(storage);

    const meta = repo.create("Frontend başvurusu");

    expect(meta.name).toBe("Frontend başvurusu");
    expect(repo.list().map((cv) => cv.id)).toEqual([meta.id]);
    expect(repo.get(meta.id)?.data).toEqual(EMPTY_CV);
  });

  test("kaydedilen CV'yi kaldığı yerden geri getirir ve güncellenme zamanını yeniler", () => {
    const repo = createCvRepository(storage);
    const meta = repo.create("Test");
    const edited = { ...EMPTY_CV, summary: "Yeni özet" };

    const result = repo.save(meta.id, edited, 5000);

    expect(result.ok).toBe(true);
    expect(repo.get(meta.id)?.data.summary).toBe("Yeni özet");
    expect(repo.get(meta.id)?.meta.updatedAt).toBe(5000);
  });

  test("listeyi son güncellenen en üstte olacak şekilde sıralar", () => {
    const repo = createCvRepository(storage);
    const first = repo.create("Birinci");
    const second = repo.create("İkinci");
    repo.save(first.id, EMPTY_CV, Date.now() + 10_000);

    expect(repo.list().map((cv) => cv.name)).toEqual(["Birinci", "İkinci"]);
    void second;
  });

  test("şablon seçimini CV'ye özel saklar", () => {
    const repo = createCvRepository(storage);
    const a = repo.create("A");
    const b = repo.create("B");

    repo.setTemplate(a.id, "klasik");

    expect(repo.get(a.id)?.meta.template).toBe("klasik");
    expect(repo.get(b.id)?.meta.template).toBe("modern");
  });

  test("sildiği CV'yi listeden ve depodan kaldırır", () => {
    const repo = createCvRepository(storage);
    const meta = repo.create("Silinecek");

    repo.remove(meta.id);

    expect(repo.list()).toEqual([]);
    expect(repo.get(meta.id)).toBeNull();
    expect([...storage.data.keys()].some((key) => key.includes(meta.id))).toBe(false);
  });

  test("liste her değiştiğinde farklı bir anlık görüntü (snapshot) verir", () => {
    const repo = createCvRepository(storage);
    repo.list();
    const empty = repo.snapshot();
    const meta = repo.create("A");
    const afterCreate = repo.snapshot();
    repo.save(meta.id, EMPTY_CV, 123);
    const afterSave = repo.snapshot();

    expect(new Set([empty, afterCreate, afterSave]).size).toBe(3);
    expect(repo.snapshot()).toBe(afterSave); // değişiklik yoksa aynı kalır
  });

  test("bilinmeyen id için null döner", () => {
    expect(createCvRepository(storage).get("yok")).toBeNull();
  });

  test("eski tek CV'yi (çoklu CV öncesi) ilk CV olarak taşır ve şablonunu korur", () => {
    storage = createMemoryStorage({
      "cv-olusturucu:cv:v1": JSON.stringify(SAMPLE_CV),
      "cv-olusturucu:template:v1": "minimal",
    });
    const repo = createCvRepository(storage);

    const list = repo.list();

    expect(list).toHaveLength(1);
    expect(list[0].name).toBe(SAMPLE_CV.personal.fullName);
    expect(list[0].template).toBe("minimal");
    expect(repo.get(list[0].id)?.data).toEqual(SAMPLE_CV);
    // Eski anahtarlar temizlenir, taşıma ikinci kez yapılmaz
    expect(storage.getItem("cv-olusturucu:cv:v1")).toBeNull();
    expect(createCvRepository(storage).list()).toHaveLength(1);
  });

  test("bozuk liste kaydında çökmez, boş liste döner", () => {
    storage = createMemoryStorage({ "cv-olusturucu:index:v1": "{bozuk" });
    expect(createCvRepository(storage).list()).toEqual([]);
  });

  test("depolama doluysa kaydetme hatasını bildirir", () => {
    const repo = createCvRepository(storage);
    const meta = repo.create("Dolu");
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };

    const result = repo.save(meta.id, EMPTY_CV);

    expect(result.ok).toBe(false);
  });
});
