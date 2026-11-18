import { describe, expect, test } from "vitest";
import { moveItem, removeItem, updateItem } from "@/lib/listUtils";

const list = [
  { id: "a", name: "A" },
  { id: "b", name: "B" },
  { id: "c", name: "C" },
];

describe("updateItem", () => {
  test("sadece id'si eşleşen kaydı günceller ve orijinali değiştirmez", () => {
    const result = updateItem(list, "b", { name: "Yeni" });

    expect(result[1]).toEqual({ id: "b", name: "Yeni" });
    expect(result[0]).toBe(list[0]);
    expect(list[1].name).toBe("B");
  });
});

describe("removeItem", () => {
  test("id'si eşleşen kaydı siler", () => {
    expect(removeItem(list, "a").map((i) => i.id)).toEqual(["b", "c"]);
    expect(list).toHaveLength(3);
  });
});

describe("moveItem", () => {
  test("kaydı yukarı taşır", () => {
    expect(moveItem(list, "b", -1).map((i) => i.id)).toEqual(["b", "a", "c"]);
  });

  test("kaydı aşağı taşır", () => {
    expect(moveItem(list, "b", 1).map((i) => i.id)).toEqual(["a", "c", "b"]);
  });

  test("sınırın dışına taşımaya çalışınca sırayı değiştirmez", () => {
    expect(moveItem(list, "a", -1).map((i) => i.id)).toEqual(["a", "b", "c"]);
    expect(moveItem(list, "c", 1).map((i) => i.id)).toEqual(["a", "b", "c"]);
    expect(moveItem(list, "yok", 1).map((i) => i.id)).toEqual(["a", "b", "c"]);
  });
});
