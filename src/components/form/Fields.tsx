import { useId } from "react";
import type { ReactNode } from "react";

// Tüm form alanlarında aynı görünümü kullanmak için ortak sınıflar.
// Genişlik (w-*) bilerek burada YOK: aynı elemana hem "w-full" hem "w-36" verilirse
// hangisinin kazanacağını sınıfların yazılış sırası değil, Tailwind'in ürettiği CSS
// sırası belirler — bu da sürpriz taşmalara yol açar. Genişliği kullanan yer versin.
const inputBaseClass =
  "min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/25";

export const inputClass = `w-full ${inputBaseClass}`;

type LabelWrapperProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
};

function LabelWrapper({ label, htmlFor, children, className = "" }: LabelWrapperProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-slate-600 dark:text-stone-400">
        {label}
      </label>
      {children}
    </div>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "url" | "month";
  placeholder?: string;
  className?: string;
};

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
}: TextFieldProps) {
  // useId: label ile input'u bağlamak için benzersiz bir id üretir (erişilebilirlik).
  const id = useId();
  return (
    <LabelWrapper label={label} htmlFor={id} className={className}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </LabelWrapper>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
}: TextAreaFieldProps) {
  const id = useId();
  return (
    <LabelWrapper label={label} htmlFor={id} className={className}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} resize-y`}
      />
    </LabelWrapper>
  );
}
