import { describe, expect, test } from "vitest";
import { buildPdfFileName } from "@/lib/pdf";

describe("buildPdfFileName", () => {
  test("addan dosya adı üretir ve Türkçe karakterleri korur", () => {
    expect(buildPdfFileName("Ayşe Yılmaz")).toBe("Ayşe Yılmaz - CV.pdf");
  });

  test("dosya adında yasak karakterleri ve fazla boşlukları temizler", () => {
    expect(buildPdfFileName('  Ali/Veli: "Test"  ')).toBe("AliVeli Test - CV.pdf");
  });

  test("ad boşsa varsayılan ad kullanır", () => {
    expect(buildPdfFileName("   ")).toBe("CV.pdf");
  });
});
