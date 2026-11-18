"use client";

import { useEffect, useState } from "react";
import {
  DARK_MEDIA_QUERY,
  applyTheme,
  readThemePreference,
  resolveTheme,
  saveThemePreference,
} from "@/lib/theme";
import type { Theme } from "@/lib/theme";

interface ThemeControls {
  theme: Theme;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  return resolveTheme(readThemePreference(), window.matchMedia(DARK_MEDIA_QUERY).matches);
}

// Not: Sadece tarayıcıda çizilen bileşenlerde kullanılmalı (CvBuilder gibi, ssr:false).
export function useTheme(): ThemeControls {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Kullanıcı henüz tema seçmediyse, işletim sistemi teması değişince biz de değişelim.
  useEffect(() => {
    const media = window.matchMedia(DARK_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      if (readThemePreference() !== null) return;
      const next = event.matches ? "dark" : "light";
      applyTheme(next);
      setTheme(next);
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    saveThemePreference(next);
    setTheme(next);
  }

  return { theme, toggleTheme };
}
