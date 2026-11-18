import { Suspense } from "react";
import { CvEditorLoader } from "@/components/editor/CvEditorLoader";
import { LoadingScreen } from "@/components/LoadingScreen";

// /cv/<id> adresi. [id] klasör adı "dinamik bölüm" demek: adresteki değer params.id olur.
// Bu Next.js sürümünde params bir Promise ve sayfa önceden oluşturulurken bilinmiyor;
// bu yüzden Suspense içinde açıyoruz (dokümandaki önerilen kalıp).
export default function CvPage({ params }: PageProps<"/cv/[id]">) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {params.then(({ id }) => (
        <CvEditorLoader id={id} />
      ))}
    </Suspense>
  );
}
