// Liste güncellemelerini "değiştirmeden" (immutable) yapan küçük yardımcılar.
// React, state'in yeni bir nesne olmasını görünce yeniden çizer; bu yüzden
// diziyi yerinde değiştirmek yerine her seferinde yeni dizi döndürüyoruz.

interface WithId {
  id: string;
}

export function updateItem<T extends WithId>(
  list: readonly T[],
  id: string,
  patch: Partial<T>,
): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function removeItem<T extends WithId>(list: readonly T[], id: string): T[] {
  return list.filter((item) => item.id !== id);
}

export function moveItem<T extends WithId>(
  list: readonly T[],
  id: string,
  direction: -1 | 1,
): T[] {
  const index = list.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= list.length) return [...list];
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}
