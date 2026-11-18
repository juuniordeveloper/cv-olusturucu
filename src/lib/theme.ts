export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "cv-olusturucu:theme:v1";
export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

// localStorage'dan gelen değere güvenmiyoruz; sadece iki geçerli değeri kabul ediyoruz.
export function parseThemePreference(raw: string | null): Theme | null {
  return raw === "light" || raw === "dark" ? raw : null;
}

// Kullanıcı bir tema seçtiyse o geçerli; seçmediyse işletim sisteminin ayarını izleriz.
export function resolveTheme(preference: Theme | null, systemPrefersDark: boolean): Theme {
  return preference ?? (systemPrefersDark ? "dark" : "light");
}

export function readThemePreference(): Theme | null {
  try {
    return parseThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveThemePreference(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Kaydedilemezse tema bu oturum boyunca yine çalışır; sadece hatırlanmaz.
  }
}

// Tailwind'in dark: sınıfları <html> üzerindeki "dark" sınıfına bakıyor (globals.css).
export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

// Sayfa ilk boyanmadan ÖNCE çalışan küçük script (layout.tsx'te <head> içinde).
// React yüklenmeyi beklerse sayfa bir an beyaz görünüp sonra kararır ("flash").
// Sabit bir metin; içinde kullanıcı verisi yok, bu yüzden güvenle gömülebilir.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var d=t==="dark"||(t!=="light"&&matchMedia(${JSON.stringify(
  DARK_MEDIA_QUERY,
)}).matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
