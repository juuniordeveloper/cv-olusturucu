"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { LOCALES, LOCALE_NAMES } from "@/lib/i18n/locales";
import type { Locale } from "@/lib/i18n/locales";
import { useLocale } from "@/hooks/useLocale";
import { Flag } from "@/components/Flags";

// Menünün genişliği (w-44 = 176px) + ekran kenarıyla arasında bırakılacak pay.
const MENU_WIDTH_PX = 176;
const SCREEN_EDGE_GAP_PX = 8;

// Bayraklı dil butonu + açılır menü. Klavye: Enter/Space ile aç, ↑/↓ ile gez,
// Esc ile kapat. Dışarı tıklayınca da kapanır.
export function LanguageSwitcher() {
  const { locale, t, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  // Menü normalde butonun sağ kenarına hizalı açılır. Buton ekranın solundaysa (mobil)
  // menü ekrandan taşmasın diye sol kenara hizalıyoruz.
  const [alignment, setAlignment] = useState<"left" | "right">("right");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  // Bu Next.js sürümü sayfadan ayrılınca sayfayı saklıyor (Activity). Menü açıkken
  // başka sayfaya geçilirse geri dönünce açık kalmasın: gizlenirken kapatıyoruz.
  useLayoutEffect(() => () => setIsOpen(false), []);

  // Menü açıkken dışarı tıklanırsa kapat (document = dış sistem → effect).
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    // Açılınca odağı seçili dile taşı (klavye kullanıcıları için).
    itemRefs.current[LOCALES.indexOf(locale)]?.focus();
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, locale]);

  function toggleMenu() {
    const buttonRight = buttonRef.current?.getBoundingClientRect().right ?? Infinity;
    setAlignment(buttonRight < MENU_WIDTH_PX + SCREEN_EDGE_GAP_PX ? "left" : "right");
    setIsOpen((open) => !open);
  }

  function choose(next: Locale) {
    setLocale(next);
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = itemRefs.current.findIndex((item) => item === document.activeElement);
    const focusAt = (i: number) => itemRefs.current[(i + LOCALES.length) % LOCALES.length]?.focus();
    if (event.key === "ArrowDown") focusAt(index + 1);
    else if (event.key === "ArrowUp") focusAt(index - 1);
    else if (event.key === "Home") focusAt(0);
    else if (event.key === "End") focusAt(LOCALES.length - 1);
    else if (event.key === "Escape") {
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === "Tab") setIsOpen(false);
    else return;
    if (event.key !== "Tab") event.preventDefault();
  }

  const label = t.language.current(LOCALE_NAMES[locale]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={label}
        title={label}
        className="flex h-9 shrink-0 items-center gap-1 rounded-full px-2 text-stone-500 transition hover:bg-stone-200/70 dark:text-stone-400 dark:hover:bg-stone-800"
      >
        <Flag locale={locale} className="h-[14px] w-[21px]" />
        <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden>
          <path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={t.language.menuLabel}
          onKeyDown={handleMenuKeyDown}
          className={`absolute z-50 mt-2 w-44 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-stone-900/10 dark:bg-stone-900 dark:ring-white/10 ${
            alignment === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          }`}
        >
          {LOCALES.map((option, index) => {
            const isActive = option === locale;
            return (
              <button
                key={option}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                lang={option}
                onClick={() => choose(option)}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition outline-none focus-visible:bg-stone-100 dark:focus-visible:bg-stone-800 ${
                  isActive
                    ? "font-semibold text-stone-900 dark:text-white"
                    : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                }`}
              >
                <Flag locale={option} className="h-[14px] w-[21px]" />
                <span className="flex-1">{LOCALE_NAMES[option]}</span>
                {isActive && (
                  <svg viewBox="0 0 16 16" className="h-4 w-4 text-indigo-600 dark:text-indigo-300" aria-hidden>
                    <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
