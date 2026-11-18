"use client";

import dynamic from "next/dynamic";
import { LoadingScreen } from "@/components/LoadingScreen";

// CvEditor ilk değerini localStorage'dan okuyor. localStorage sadece tarayıcıda var,
// sunucuda yok. ssr:false ile bu bileşeni sunucuda hiç çizmiyoruz; böylece
// sunucu HTML'i ile tarayıcıdaki ilk görüntü arasında uyuşmazlık (hydration hatası) olmuyor.
const CvEditor = dynamic(() => import("./CvEditor"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

type CvEditorLoaderProps = {
  id: string;
};

export function CvEditorLoader({ id }: CvEditorLoaderProps) {
  // key: başka bir CV'ye geçilirse editör sıfırdan kurulsun (eski CV'nin state'i taşınmasın).
  return <CvEditor key={id} id={id} />;
}
