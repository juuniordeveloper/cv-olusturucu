import { useId } from "react";
import type { Locale } from "@/lib/i18n/locales";

// Bayraklar emoji değil SVG: Windows'ta bayrak emojileri görünmüyor ("TR" harfleri çıkıyor).
// Hepsi 3:2 oranında çiziliyor; İngiltere bayrağı (2:1) kutuyu dolduracak şekilde kırpılıyor.

function TurkeyFlag() {
  return (
    <svg viewBox="0 0 30 20" aria-hidden>
      <rect width="30" height="20" fill="#E30A17" />
      <circle cx="11.25" cy="10" r="5" fill="#fff" />
      <circle cx="12.5" cy="10" r="4" fill="#E30A17" />
      <polygon
        fill="#fff"
        points="14.40,10.00 15.93,9.44 15.99,7.81 16.99,9.10 18.56,8.65 17.65,10.00 18.56,11.35 16.99,10.90 15.99,12.19 15.93,10.56"
      />
    </svg>
  );
}

function UnitedKingdomFlag() {
  // Aynı bayrak sayfada birden çok kez çizilebileceği için clipPath id'leri benzersiz olmalı.
  const id = useId();
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <clipPath id={`${id}-t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

function SpainFlag() {
  return (
    <svg viewBox="0 0 30 20" aria-hidden>
      <rect width="30" height="20" fill="#AA151B" />
      <rect y="5" width="30" height="10" fill="#F1BF00" />
    </svg>
  );
}

function ItalyFlag() {
  return (
    <svg viewBox="0 0 30 20" aria-hidden>
      <rect width="10" height="20" fill="#009246" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#CE2B37" />
    </svg>
  );
}

const FLAGS: Record<Locale, () => React.JSX.Element> = {
  tr: TurkeyFlag,
  en: UnitedKingdomFlag,
  es: SpainFlag,
  it: ItalyFlag,
};

type FlagProps = {
  locale: Locale;
  className?: string;
};

export function Flag({ locale, className = "" }: FlagProps) {
  const FlagSvg = FLAGS[locale];
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.12)] [&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className}`}
    >
      <FlagSvg />
    </span>
  );
}
