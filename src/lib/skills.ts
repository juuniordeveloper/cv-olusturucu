// Bir yetenek kısa bir etiket olmalı ("React", "Proje yönetimi").
// Paragraf uzunluğundaki metinler hem formu hem CV'yi bozar; bu yüzden sınır koyuyoruz.
export const MAX_SKILL_LENGTH = 40;

export interface SkillInputResult {
  added: string[];
  tooLong: string[];
}

// Kullanıcının yazdığı metni ("React, Figma") eklenecek yeteneklere çevirir.
// Saf fonksiyon: girdi aynıysa çıktı hep aynı; bu yüzden kolayca test edilebilir.
export function parseSkillInput(raw: string, existing: readonly string[]): SkillInputResult {
  const seen = new Set(existing.map((skill) => skill.toLocaleLowerCase("tr")));
  const added: string[] = [];
  const tooLong: string[] = [];

  for (const part of raw.split(",")) {
    const skill = part.trim();
    if (!skill) continue;
    if (skill.length > MAX_SKILL_LENGTH) {
      tooLong.push(skill);
      continue;
    }
    const key = skill.toLocaleLowerCase("tr");
    if (seen.has(key)) continue;
    seen.add(key);
    added.push(skill);
  }

  return { added, tooLong };
}
