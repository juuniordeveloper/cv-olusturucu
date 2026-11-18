import type { Metadata } from "next";
import { Geist, Lora } from "next/font/google";
import Script from "next/script";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { LOCALE_INIT_SCRIPT } from "@/lib/i18n/locales";
import "./globals.css";

// next/font yazı tiplerini derleme sırasında indirip projeyle birlikte sunar.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

// Klasik şablonun serif yazı tipi. latin-ext: ş, ğ, ı gibi Türkçe harfler için.
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "CV Oluşturucu",
  description: "Tarayıcıda çalışan, canlı önizlemeli CV oluşturucu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: tema script'i "dark" sınıfını React'ten önce ekliyor;
    // React bu farkı hata sanmasın diye sadece bu etiket için uyarıyı kapatıyoruz.
    <html
      lang="tr"
      className={`${geistSans.variable} ${lora.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        {children}
        {/* beforeInteractive: Next.js bu script'i ilk HTML'e koyar, React'ten önce çalışır.
            İçerik bizim yazdığımız sabit bir metin (kullanıcı verisi yok). */}
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {/* Seçili dili <html lang>'a yazar: ekran okuyucular ve tarayıcı çevirisi buna bakar. */}
        <Script id="locale-init" strategy="beforeInteractive">
          {LOCALE_INIT_SCRIPT}
        </Script>
      </body>
    </html>
  );
}
