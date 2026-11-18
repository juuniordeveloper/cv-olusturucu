"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { ImageError, resizeImageToDataUrl } from "@/lib/image";
import { useLocale } from "@/hooks/useLocale";

type PhotoUploadProps = {
  photo: string;
  onChange: (photo: string) => void;
};

export function PhotoUpload({ photo, onChange }: PhotoUploadProps) {
  const { t } = useLocale();
  // Mesajı değil hata kodunu tutuyoruz: dil değişirse mesaj da yeni dilde görünsün.
  const [errorCode, setErrorCode] = useState<ImageError["code"] | "failed" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // Aynı dosyayı tekrar seçebilmek için input'u sıfırla
    if (!file) return;

    setIsProcessing(true);
    setErrorCode(null);
    try {
      onChange(await resizeImageToDataUrl(file));
    } catch (uploadError: unknown) {
      setErrorCode(uploadError instanceof ImageError ? uploadError.code : "failed");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-2xl text-slate-400 dark:bg-stone-800">
        {photo ? (
          // next/image yerine <img>: Base64 veriyi optimize edecek bir sunucu yok.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={t.photo.alt} className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden>👤</span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25">
            {isProcessing ? t.photo.processing : photo ? t.photo.change : t.photo.upload}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </label>
          {photo && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              {t.photo.remove}
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-stone-400">{t.photo.hint}</p>
        {errorCode && <p className="text-xs text-red-600 dark:text-red-400">{t.photo[errorCode]}</p>}
      </div>
    </div>
  );
}
