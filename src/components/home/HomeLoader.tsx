"use client";

import dynamic from "next/dynamic";
import { LoadingScreen } from "@/components/LoadingScreen";

// Ana sayfa da CV listesini localStorage'dan okuyor; editördeki gibi sadece tarayıcıda çiziyoruz.
const HomeScreen = dynamic(() => import("./HomeScreen"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export function HomeLoader() {
  return <HomeScreen />;
}
