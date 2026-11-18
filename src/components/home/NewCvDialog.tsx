"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { MAX_CV_NAME_LENGTH, validateCvName } from "@/lib/cvRepository";
import { inputClass } from "@/components/form/Fields";
import { useLocale } from "@/hooks/useLocale";

type NewCvDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => string | null; // Hata mesajı döner, başarılıysa null
};

// <dialog>: HTML'in yerleşik pencere elemanı. showModal() ile açılınca
// arka planı kilitler, Esc ile kapanır ve klavye odağını içinde tutar.
export function NewCvDialog({ isOpen, onClose, onCreate }: NewCvDialogProps) {
  const { t } = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputId = useId();
  const errorId = useId();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // isOpen prop'u ile tarayıcının dialog'unu senkronize tutuyoruz (dış sistem → effect).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateCvName(name);
    if (!validation.ok) {
      setError(validation.error === "required" ? t.newCv.nameRequired : t.newCv.nameTooLong(MAX_CV_NAME_LENGTH));
      return;
    }
    const createError = onCreate(validation.value);
    if (createError) setError(createError);
  }

  function handleClose() {
    setName("");
    setError(null);
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      aria-labelledby={`${inputId}-title`}
      className="m-auto w-[min(420px,calc(100vw-32px))] rounded-2xl bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-stone-950/40 backdrop:backdrop-blur-sm dark:bg-stone-900 dark:text-stone-100"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <h2 id={`${inputId}-title`} className="text-lg font-semibold">
            {t.newCv.title}
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {t.newCv.description}
          </p>
        </div>
        <div>
          <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
            {t.newCv.nameLabel}
          </label>
          <input
            id={inputId}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            maxLength={MAX_CV_NAME_LENGTH}
            autoFocus
            autoComplete="off"
            aria-invalid={error !== null}
            aria-describedby={error ? errorId : undefined}
            className={inputClass}
          />
          {error && (
            <p id={errorId} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            {t.newCv.cancel}
          </button>
          <button
            type="submit"
            className="rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-indigo-300"
          >
            {t.newCv.create}
          </button>
        </div>
      </form>
    </dialog>
  );
}
