import { describe, expect, test } from "vitest";
import { removeEmptyEntries } from "@/lib/cleanCv";
import {
  createEmptyCertificate,
  createEmptyEducation,
  createEmptyExperience,
  createEmptyProject,
  createEmptyReference,
  SAMPLE_CV,
} from "@/lib/defaultCv";

describe("removeEmptyEntries", () => {
  test("tamamen boş deneyim ve eğitim kayıtlarını çıkarır", () => {
    const cv = {
      ...SAMPLE_CV,
      experiences: [...SAMPLE_CV.experiences, createEmptyExperience()],
      educations: [createEmptyEducation(), ...SAMPLE_CV.educations],
    };

    const result = removeEmptyEntries(cv);

    expect(result.experiences).toEqual(SAMPLE_CV.experiences);
    expect(result.educations).toEqual(SAMPLE_CV.educations);
  });

  test("boş proje, sertifika ve referans kayıtlarını da çıkarır", () => {
    const cv = {
      ...SAMPLE_CV,
      projects: [...SAMPLE_CV.projects, createEmptyProject()],
      certificates: [createEmptyCertificate()],
      references: [createEmptyReference()],
    };

    const result = removeEmptyEntries(cv);

    expect(result.projects).toEqual(SAMPLE_CV.projects);
    expect(result.certificates).toEqual([]);
    expect(result.references).toEqual([]);
  });

  test("tek alanı dolu olan kaydı tutar", () => {
    const partial = { ...createEmptyExperience(), company: "ACME" };
    const result = removeEmptyEntries({ ...SAMPLE_CV, experiences: [partial] });
    expect(result.experiences).toEqual([partial]);
  });

  test("orijinal nesneyi değiştirmez", () => {
    const cv = { ...SAMPLE_CV, experiences: [createEmptyExperience()] };
    removeEmptyEntries(cv);
    expect(cv.experiences).toHaveLength(1);
  });
});
