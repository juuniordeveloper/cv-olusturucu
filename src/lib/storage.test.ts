import { describe, expect, test } from "vitest";
import { parseCv, parseTemplate } from "@/lib/storage";
import { SAMPLE_CV } from "@/lib/defaultCv";

describe("parseCv", () => {
  test("geçerli JSON'u CV verisine çevirir", () => {
    // Arrange
    const raw = JSON.stringify(SAMPLE_CV);

    // Act
    const cv = parseCv(raw);

    // Assert
    expect(cv).toEqual(SAMPLE_CV);
  });

  test("yeni bölümler eklenmeden ÖNCE kaydedilmiş veriyi kaybetmez", () => {
    // Arrange: projeler/sertifikalar/referanslar alanı olmayan eski kayıt
    const { projects, certificates, references, ...oldCv } = SAMPLE_CV;
    void projects;
    void certificates;
    void references;

    // Act
    const cv = parseCv(JSON.stringify(oldCv));

    // Assert: eski veri korunur, yeni listeler boş gelir
    expect(cv).not.toBeNull();
    expect(cv?.personal).toEqual(SAMPLE_CV.personal);
    expect(cv?.projects).toEqual([]);
    expect(cv?.certificates).toEqual([]);
    expect(cv?.references).toEqual([]);
  });

  test("kayıt yoksa null döner", () => {
    expect(parseCv(null)).toBeNull();
  });

  test("bozuk JSON'da null döner", () => {
    expect(parseCv("{bozuk")).toBeNull();
  });

  test("şekli yanlış veride null döner", () => {
    const raw = JSON.stringify({ ...SAMPLE_CV, skills: "React" });
    expect(parseCv(raw)).toBeNull();
  });

  test("geçersiz dil seviyesini reddeder", () => {
    const raw = JSON.stringify({
      ...SAMPLE_CV,
      languages: [{ id: "1", name: "Almanca", level: "Süper" }],
    });
    expect(parseCv(raw)).toBeNull();
  });
});

describe("parseTemplate", () => {
  test("bilinen şablon adını kabul eder", () => {
    expect(parseTemplate("klasik")).toBe("klasik");
  });

  test("bilinmeyen şablon adında null döner", () => {
    expect(parseTemplate("renkli")).toBeNull();
    expect(parseTemplate(null)).toBeNull();
  });
});
