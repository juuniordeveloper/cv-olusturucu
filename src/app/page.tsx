import { HomeLoader } from "@/components/home/HomeLoader";

// Ana sayfa ("/"): kayıtlı CV'lerin listesi. page.tsx bir Server Component;
// etkileşimli kısım ("use client" olan) HomeLoader'da.
export default function Home() {
  return <HomeLoader />;
}
