# CV Oluşturucu — Proje Rehberi

Bu dosya projeyi baştan sona anlatır: nasıl çalıştığını, hangi sırayla kurulduğunu,
hangi dosyada ne olduğunu ve bir şeyi değiştirmek istediğinde nereye bakman gerektiğini.

> **VS Code ipucu:** Bu dosyayı `Cmd+Shift+V` ile önizleme modunda aç. Bağlantılara
> tıklayınca ilgili dosya o satırda açılır. Bir fonksiyonun nerede kullanıldığını görmek
> için adının üstünde sağ tık → **Find All References** (`Shift+F12`); tanımına gitmek
> için `Cmd+tık` (veya `F12`).

---

## 1. Büyük resim: uygulama nasıl çalışıyor?

Uygulamanın iki ekranı var:

| Adres | Ekran | Ana dosya |
|---|---|---|
| `/` | **CV'lerim** — kayıtlı CV kartları ve "+" kutusu | [HomeScreen.tsx](src/components/home/HomeScreen.tsx) |
| `/cv/<id>` | **Editör** — solda form, sağda canlı önizleme | [CvEditor.tsx](src/components/editor/CvEditor.tsx) |

Sunucu (backend) yok. Bütün veriler tarayıcının **localStorage**'ında duruyor.

### Veri akışı (yazdıkça önizleme nasıl güncelleniyor?)

```
 Kullanıcı formda yazar
        │
        ▼
 CvForm  ──setCv(...)──►  CvEditor'daki state (cv)  ──►  CvPreview  ──►  Şablon (ör. ModernTemplate)
                               │
                               │ 300 ms sonra (debounce)
                               ▼
                    usePersistentCv → cvRepository → localStorage
```

1. Form bir alan değiştiğinde, CV'nin **yeni bir kopyasını** oluşturup `setCv` ile bildirir.
   Eski nesne değiştirilmez; buna *immutable* güncelleme denir.
2. React state değişince `CvEditor`'ı yeniden çizer. Aynı `cv` önizlemeye de gittiği için
   önizleme kendiliğinden güncellenir. "Canlı önizleme" budur.
3. `usePersistentCv` hook'u 300 ms bekler, sonra veriyi localStorage'a yazar.

### Sayfalara bölme ve PDF nasıl çalışıyor?

```
 CvPreview
   ├─ Görünmez "ölçüm kopyası" (#cv-page): CV'nin bölünmemiş, gerçek A4 genişliğindeki hâli
   │      │
   │      ▼  measurePageLayout() → hangi y konumlarından bölünecek? (pagination.ts)
   │
   └─ Her sayfa için bir PreviewSheet (ekranda gördüğün ayrı A4 kâğıtlar)

 "PDF indir"  → ölçüm kopyasının resmi alınır, aynı noktalardan kesilip PDF'e konur (pdf.ts)
 "Yazdır"     → tarayıcının yazdırma penceresi; ölçüm kopyası basılır (globals.css'teki @media print)
```

---

## 2. Sırasıyla yaptığımız işlemler

| # | Ne yaptık | Değişen / eklenen dosyalar |
|---|---|---|
| 1 | `create-next-app` ile Next.js + TypeScript + Tailwind projesi kurduk. Paket adı büyük harf alamadığı için `cv-olusturucu` adıyla kurup klasörü `CvOlusturucu` yaptık. | `package.json`, `src/app/*` |
| 2 | CV verisinin şeklini TypeScript tipleriyle tanımladık, örnek ve boş CV verisi yazdık. | [types/cv.ts](src/types/cv.ts), [lib/defaultCv.ts](src/lib/defaultCv.ts) |
| 3 | `zod` (veri doğrulama) ve `vitest` (test) kurduk. localStorage'dan okunan veriyi doğrulayan şemayı yazdık. | [lib/storage.ts](src/lib/storage.ts) |
| 4 | Yardımcı fonksiyonlar: liste güncelleme, tarih biçimi, fotoğraf küçültme. | [lib/listUtils.ts](src/lib/listUtils.ts), [lib/format.ts](src/lib/format.ts), [lib/image.ts](src/lib/image.ts) |
| 5 | Form bileşenleri: kişisel bilgiler, özet, deneyim, eğitim, yetenekler, diller. | `src/components/form/*` |
| 6 | 3 CV şablonu: Modern, Klasik, Minimal. | `src/components/templates/*` |
| 7 | Ana ekran, şablon seçici, PDF (o zaman yazdırma penceresiyle), mobil sekmeler. | `CvBuilder` (bugünkü [CvEditor.tsx](src/components/editor/CvEditor.tsx)), [Toolbar.tsx](src/components/Toolbar.tsx) |
| 8 | Koyu tema: Tailwind `dark:` sınıfları ve sayfa açılırken temayı uygulayan script. | [lib/theme.ts](src/lib/theme.ts), [hooks/useTheme.ts](src/hooks/useTheme.ts), [app/layout.tsx](src/app/layout.tsx) |
| 9 | Önizlemedeki metin taşması: `zoom` yerine `transform: scale`, uzun kelimeler için `wrap-anywhere`. | [CvPreview.tsx](src/components/CvPreview.tsx), şablonlar |
| 10 | Diller/Yetenekler kutularının taşması, yetenek uzunluk sınırı. | [LanguagesForm.tsx](src/components/form/LanguagesForm.tsx), [SkillsForm.tsx](src/components/form/SkillsForm.tsx), [lib/skills.ts](src/lib/skills.ts) |
| 11 | Projeler, Sertifikalar, Referanslar bölümleri; tekrar eden form kodunu tek bileşende topladık. | [RepeatableSection.tsx](src/components/form/RepeatableSection.tsx) |
| 12 | Doğrudan PDF indirme (`modern-screenshot` + `jspdf`), 2 yeni şablon: Kurumsal, Zaman Çizelgesi. | [lib/pdf.ts](src/lib/pdf.ts), [CorporateTemplate.tsx](src/components/templates/CorporateTemplate.tsx), [TimelineTemplate.tsx](src/components/templates/TimelineTemplate.tsx) |
| 13 | Sayfa bölme: kayıtlar ortadan kesilmesin, başlıklar yalnız kalmasın, uzun paragraflar satır arasından bölünsün. | [lib/pagination.ts](src/lib/pagination.ts), [lib/pageLayout.ts](src/lib/pageLayout.ts) |
| 14 | Önizlemede ayrı A4 kâğıtlar, "Sayfa 1 / 2" etiketleri, sayfa payları, boydan boya renkli sütunlar. | [PreviewSheet.tsx](src/components/PreviewSheet.tsx) |
| 15 | Birden fazla CV: ana sayfa, "+" ile yeni CV, geri butonu, kaldığı yerden devam. | [lib/cvRepository.ts](src/lib/cvRepository.ts), `src/components/home/*`, [app/cv/[id]/page.tsx](src/app/cv/[id]/page.tsx) |
| 16 | "Yazdır" butonu: metni seçilebilir PDF için. | [CvEditor.tsx](src/components/editor/CvEditor.tsx), [globals.css](src/app/globals.css) |

---

## 3. Klasör yapısı

```
CvOlusturucu/
├── package.json           Paketler ve komutlar (npm run dev / test / build / lint)
├── next.config.ts         Next.js ayarları (oluşturulduğu gibi; dokunmadık)
├── vitest.config.mts      Test ayarı ("@/..." kısayolunu testlere tanıtır)
├── AGENTS.md              Next.js'in eklediği not (bu sürümün farklı olduğunu söyler)
└── src/
    ├── app/               SAYFALAR (Next.js App Router: klasör yapısı = adres yapısı)
    │   ├── layout.tsx         Tüm sayfaları saran iskelet: <html>, yazı tipleri, tema script'i
    │   ├── globals.css        Genel stiller, koyu tema, yazdırma (print) kuralları
    │   ├── page.tsx           "/"        → ana sayfa (CV'lerim)
    │   └── cv/[id]/page.tsx   "/cv/<id>" → editör
    │
    ├── components/        GÖRSEL PARÇALAR (React bileşenleri)
    │   ├── home/              Ana sayfa: kartlar, + kutusu, yeni CV penceresi
    │   ├── editor/            Editör ekranı
    │   ├── form/              Soldaki form ve tüm bölümleri
    │   ├── templates/         5 CV şablonu ve ortak parçaları
    │   ├── CvPreview.tsx      Sağdaki önizleme (ölçüm + sayfalar)
    │   ├── PreviewSheet.tsx   Önizlemedeki tek bir A4 kâğıt
    │   ├── Toolbar.tsx        Editörün üst çubuğu
    │   ├── ThemeToggle.tsx    Açık/koyu tema butonu
    │   └── LoadingScreen.tsx  "Yükleniyor…" ekranı
    │
    ├── hooks/             ÖZEL REACT HOOK'LARI (state + davranış)
    │   ├── usePersistentCv.ts  Bir CV'yi yükle, değişince kaydet
    │   ├── useCvList.ts        Ana sayfadaki CV listesi
    │   └── useTheme.ts         Tema durumu
    │
    ├── lib/               SAF MANTIK (React'ten bağımsız fonksiyonlar) + testleri (*.test.ts)
    │   ├── cvRepository.ts    CV'leri saklama/okuma (localStorage)
    │   ├── storage.ts         Okunan veriyi doğrulama (Zod şeması)
    │   ├── pagination.ts      Sayfayı nereden bölelim? (saf hesap)
    │   ├── pageLayout.ts      Ekranı ölç → pagination'a ver
    │   ├── pdf.ts             PDF oluşturma
    │   └── ...                Diğer yardımcılar (format, image, skills, theme...)
    │
    └── types/cv.ts        CV VERİSİNİN ŞEKLİ (TypeScript tipleri)
```

**Kural:** `components` ekranda görünen şeyler, `hooks` durum ve davranış, `lib` saf hesap
ve veri işleri. `lib` içindeki fonksiyonlar React'e bağlı olmadığı için kolayca test
edilebiliyor. Testler de hep `lib` içinde (`*.test.ts`).

---

## 4. Dosya dosya açıklama

### 4.1 `src/types/` — veri tipleri

**[types/cv.ts](src/types/cv.ts)** — Bir CV'de hangi alanların olduğu.
- [satır 4](src/types/cv.ts#L4) `PersonalInfo`: ad, unvan, e-posta, telefon, şehir, LinkedIn, GitHub, fotoğraf.
- [satır 15–55](src/types/cv.ts#L15): `Experience`, `Education`, `Project`, `Certificate`, `Reference`.
  Hepsinde bir `id` var. React listeleri bu id ile takip ediyor.
- [satır 57](src/types/cv.ts#L57) `LANGUAGE_LEVELS`: dil seviyeleri listesi. Yeni seviye eklemek için buraya yaz.
- [satır 73](src/types/cv.ts#L73) `CvData`: bir CV'nin tamamı.
- [satır 85](src/types/cv.ts#L85) `TEMPLATE_IDS`: şablon kimlikleri. Yeni şablon eklerken buraya da eklenir.

### 4.2 `src/app/` — sayfalar

**[app/layout.tsx](src/app/layout.tsx)** — Her sayfayı saran iskelet.
- [satır 2–17](src/app/layout.tsx#L2): Yazı tipleri. `Geist` genel yazı tipi, `Lora` Klasik şablonun serif yazı tipi.
  `latin-ext` Türkçe harfler (ş, ğ, ı) için gerekli.
- [satır 31](src/app/layout.tsx#L31) `suppressHydrationWarning`: Tema script'i `<html>`'e
  `dark` sınıfını React'ten önce ekliyor. React bu farkı hata sanmasın diye bu uyarıyı kapatıyoruz.
- [satır 37](src/app/layout.tsx#L37) `<Script strategy="beforeInteractive">`: Sayfa görünmeden
  önce temayı uygular. Böylece koyu temada sayfa bir an beyaz görünüp sonra kararmaz.

**[app/globals.css](src/app/globals.css)** — Genel stiller.
- [satır 5](src/app/globals.css#L5) `@custom-variant dark`: Tailwind'in `dark:` sınıflarını
  `<html class="dark">`'a bağlar. Böylece tema butonla değiştirilebilir.
- [satır 21](src/app/globals.css#L21) `.dark { color-scheme: dark }`: Tarayıcının kendi çizdiği
  parçaları da (tarih seçici, açılır menü) koyu yapar.
- [satır 34–77](src/app/globals.css#L34): **"Yazdır" kuralları.** `@page` kâğıt boyutu ve payları,
  `break-inside: avoid` (kayıtlar bölünmesin), `orphans/widows` (paragrafın iki tarafında
  en az 3 satır kalsın).

**[app/page.tsx](src/app/page.tsx)** — `/` adresi. Sadece `HomeLoader`'ı çizer.

**[app/cv/[id]/page.tsx](src/app/cv/[id]/page.tsx)** — `/cv/<id>` adresi.
- Klasör adındaki `[id]` "dinamik bölüm" demek: adresteki değer `params.id` olur.
- [satır 10–14](src/app/cv/[id]/page.tsx#L10): Bu Next.js sürümünde `params` bir Promise ve
  sayfa önceden oluşturulurken bilinmiyor. Bu yüzden `<Suspense>` içinde `params.then(...)` ile okunuyor.

### 4.3 `src/components/home/` — ana sayfa

**[HomeLoader.tsx](src/components/home/HomeLoader.tsx)** — `dynamic(..., { ssr: false })` ile
`HomeScreen`'i **sadece tarayıcıda** çizer. Sebebi: liste localStorage'dan okunuyor ve
localStorage sunucuda yok. Sunucuda da çizilseydi, sunucu HTML'i ile tarayıcıdaki görüntü
farklı olurdu (*hydration hatası*).

**[HomeScreen.tsx](src/components/home/HomeScreen.tsx)** — CV'lerim ekranı.
- [satır 19](src/components/home/HomeScreen.tsx#L19) `useCvList(repository)`: Güncel CV listesi.
- [satır 22](src/components/home/HomeScreen.tsx#L22) `handleCreate`: CV'yi oluşturur, pencereyi
  kapatır ve `/cv/<id>` adresine gider.
- [satır 35](src/components/home/HomeScreen.tsx#L35) `handleDelete`: Onay sorar, siler ve
  listeye "değişti" haberi verir.

**[CvCard.tsx](src/components/home/CvCard.tsx)** — Tek bir CV kartı ve "+" kutusu.
- [satır 6](src/components/home/CvCard.tsx#L6): Tarihi Türkçe biçimde yazar ("18 Kas 2026 11:43").
- [satır 34–38](src/components/home/CvCard.tsx#L34): **Uzatılmış bağlantı.** Kartın üstüne yayılan
  görünmez bir `<Link>`. Kartın tamamını bağlantı yapamıyoruz, çünkü içindeki önizlemede
  e-posta ve LinkedIn bağlantıları var; HTML'de bağlantı içinde bağlantı olamaz.
- [satır 59](src/components/home/CvCard.tsx#L59) `NewCvCard`: kesik çizgili "+" kutusu.

**[CvThumbnail.tsx](src/components/home/CvThumbnail.tsx)** — Karttaki küçük önizleme. Şablonu
gerçek A4 boyutunda çizip `scale(...)` ile küçültür ([satır 23](src/components/home/CvThumbnail.tsx#L23)).
[Satır 31](src/components/home/CvThumbnail.tsx#L31)'deki `inert`, önizlemedeki bağlantıların
tıklanmasını ve odaklanmasını engeller.

**[NewCvDialog.tsx](src/components/home/NewCvDialog.tsx)** — "Yeni CV" adı soran pencere.
- HTML'in yerleşik `<dialog>` elemanını kullanıyor. `showModal()` ile açılınca
  ([satır 27](src/components/home/NewCvDialog.tsx#L27)) arka plan kilitlenir, Esc ile kapanır.
- [satır 33](src/components/home/NewCvDialog.tsx#L33) `validateCvName`: Boş veya 60 karakterden uzun adı reddeder.

### 4.4 `src/components/editor/` — editör

**[CvEditorLoader.tsx](src/components/editor/CvEditorLoader.tsx)** — Editörü sadece tarayıcıda
çizer (`ssr: false`). [Satır 20](src/components/editor/CvEditorLoader.tsx#L20)'deki `key={id}`,
başka bir CV açıldığında editörün sıfırdan kurulmasını sağlar.

**[CvEditor.tsx](src/components/editor/CvEditor.tsx)** — Editör ekranının "beyni".
- [satır 22](src/components/editor/CvEditor.tsx#L22) `usePersistentCv(id)`: CV'yi yükler; kaydetme işini bu hook yapar.
- [satır 30](src/components/editor/CvEditor.tsx#L30) `handleBack`: **Geri butonu.** Önce `flush()` ile
  hemen kaydeder, sonra `/` adresine döner.
- [satır 38](src/components/editor/CvEditor.tsx#L38) `handleDownload`: **PDF indir.** `import("@/lib/pdf")`
  sayesinde PDF kütüphaneleri sadece butona basılınca yüklenir.
- [satır 57](src/components/editor/CvEditor.tsx#L57) `handlePrint`: **Yazdır.** Dosya adı sayfa
  başlığından geldiği için başlığı geçici olarak CV sahibinin adı yapar.
- [satır 67](src/components/editor/CvEditor.tsx#L67) `getVisiblePage`: Mobilde "Düzenle"
  sekmesindeyken önizleme gizli olduğu için önce önizleme sekmesine geçer.
- [satır 115](src/components/editor/CvEditor.tsx#L115): Mobildeki "Düzenle / Önizleme" sekmeleri.
- [satır 129 ve 137](src/components/editor/CvEditor.tsx#L129): Formun ve önizlemenin aynı `cv`'yi aldığı yer.
- `print:hidden` sınıfları: Yazdırırken bu parçalar gizlenir.

**[Toolbar.tsx](src/components/Toolbar.tsx)** — Editörün üst çubuğu: geri butonu ve CV adı,
şablon seçici (`role="radiogroup"`, [satır 59](src/components/Toolbar.tsx#L59)), tema,
Temizle, Yazdır ve PDF indir butonları.

### 4.5 `src/components/form/` — form

**[CvForm.tsx](src/components/form/CvForm.tsx)** — Bütün bölümleri sırayla dizer.
- [satır 21](src/components/form/CvForm.tsx#L21) `setField("summary")`: CV'nin tek bir alanını
  değiştiren fonksiyon üretir. `{ ...previous, [key]: value }` ile yeni bir kopya oluşturur.
- **Bölümlerin sırasını değiştirmek** için bu dosyadaki satırların yerini değiştirmen yeterli.

**[RepeatableSection.tsx](src/components/form/RepeatableSection.tsx)** — Deneyim, Eğitim,
Projeler, Sertifikalar ve Referanslar'ın ortak bileşeni. Ekleme, silme ve yukarı/aşağı taşıma burada.
- [satır 26](src/components/form/RepeatableSection.tsx#L26) `<T extends { id: string }>`: Bu bir
  **generic**: "T herhangi bir kayıt tipi olabilir, yeter ki `id`'si olsun".
- [satır 52](src/components/form/RepeatableSection.tsx#L52) `renderFields(item, update)`: Bölümler
  arasında değişen tek şey alanlar. Onları dışarıdan alıyoruz; bu yönteme **render prop** deseni denir.

**[ExperienceForm.tsx](src/components/form/ExperienceForm.tsx)**, [EducationForm](src/components/form/EducationForm.tsx),
[ProjectsForm](src/components/form/ProjectsForm.tsx), [CertificatesForm](src/components/form/CertificatesForm.tsx),
[ReferencesForm](src/components/form/ReferencesForm.tsx) — Her biri sadece kendi alanlarını tanımlıyor.
Yeni bir alan eklemek için `renderFields` içine bir `<TextField>` daha yazman yeterli
(tipe ve `createEmpty...` fonksiyonuna da eklemeyi unutma).

**[Fields.tsx](src/components/form/Fields.tsx)** — Ortak input'lar.
- [satır 8](src/components/form/Fields.tsx#L8) `inputBaseClass`: Bütün kutuların görünümü (kenarlık,
  odak rengi, koyu tema). **Form kutularının görünümünü değiştirmek için burası.**
- Genişlik (`w-full`) bilerek ayrı tutuluyor. Aynı elemana hem `w-full` hem `w-36` verilince hangisinin
  kazanacağı belli olmuyor; Diller kutusundaki taşmanın sebebi buydu.
- [satır 49](src/components/form/Fields.tsx#L49) `useId()`: Etiketi (`<label>`) kutuya bağlamak için
  benzersiz bir id üretir. Etikete tıklayınca kutuya odaklanılır, ekran okuyucular da etiketi okur.

**[FormSection.tsx](src/components/form/FormSection.tsx)** — Bölüm kutusu. HTML'in yerleşik
`<details>` elemanı sayesinde JavaScript'siz açılıp kapanır ([satır 12](src/components/form/FormSection.tsx#L12)).
Ayrıca liste kartı (`ListItemCard`) ve "+ ekle" butonu (`AddButton`) burada.

**[PhotoUpload.tsx](src/components/form/PhotoUpload.tsx)** — Fotoğraf seçer ve [lib/image.ts](src/lib/image.ts)
ile küçültür. Fotoğraf sunucuya gitmez; metin olarak (Base64) CV'nin içinde saklanır.

**[SkillsForm.tsx](src/components/form/SkillsForm.tsx)** — Virgülle ayrılmış yetenekleri ekler.
Kontrolü ([satır 21](src/components/form/SkillsForm.tsx#L21)) [lib/skills.ts](src/lib/skills.ts) yapar:
en fazla 40 karakter, tekrar yok.

**[LanguagesForm.tsx](src/components/form/LanguagesForm.tsx)** — Dil adı, seviye ve Sil butonu.
[Satır 27](src/components/form/LanguagesForm.tsx#L27)'deki 3 sütunlu grid, üçünün de satıra sığmasını sağlıyor.

### 4.6 `src/components/templates/` — CV şablonları

**[templates/index.ts](src/components/templates/index.ts)** — Şablon listesi ([satır 17](src/components/templates/index.ts#L17)).
Toolbar'daki butonlar bu listeden oluşuyor.

**[templates/shared.tsx](src/components/templates/shared.tsx)** — Şablonların ortak parçaları:
- `getContactEntries`: Boş olmayan iletişim bilgilerini sırayla listeler.
- `Bullets`: Açıklamadaki her satırı bir madde yapar.
- `getVisibleSections`: Boş bölümleri gizlemek için hangi bölümlerin dolu olduğunu hesaplar.
- `ExternalLink`, `ContactLink`, `Photo`.

**Şablonlar:** [Modern](src/components/templates/ModernTemplate.tsx), [Klasik](src/components/templates/ClassicTemplate.tsx),
[Minimal](src/components/templates/MinimalTemplate.tsx), [Kurumsal](src/components/templates/CorporateTemplate.tsx),
[Zaman Çizelgesi](src/components/templates/TimelineTemplate.tsx). Her biri `cv`'yi alıp kendi tasarımıyla çiziyor.
- Renkler ve yazı boyutları doğrudan Tailwind sınıflarında. Örneğin Modern'in yan çubuğu
  [satır 40](src/components/templates/ModernTemplate.tsx#L40)'taki `bg-slate-800`, vurgu rengi de `teal-...` sınıfları.
- `data-sheet-column` (Modern [satır 40](src/components/templates/ModernTemplate.tsx#L40), Kurumsal
  [satır 138](src/components/templates/CorporateTemplate.tsx#L138)): Bu sütunun sayfa boyunca uzanması gerektiğini söyler.
  Önizleme ve PDF bu sütunu sayfa paylarında da boyar.
- `min-h-[297mm]`: Şablon en az bir A4 boyunda.
- `wrap-anywhere`: Sığmayan uzun kelimeler bölünsün.
- Bölüm başlıkları hep `<h2>`, kayıtlar hep `<article>`. **Bu önemli:** sayfa bölme kuralları
  bu etiketlere bakıyor. Yeni şablon yazarken de aynı etiketleri kullan.

### 4.7 Önizleme

**[CvPreview.tsx](src/components/CvPreview.tsx)**
- [satır 81–85](src/components/CvPreview.tsx#L81): **Ölçüm kopyası** (`#cv-page`). 0×0'lık bir kutuda
  kırpılı durduğu için görünmüyor ama ölçülebiliyor. PDF görüntüsü de buradan alınıyor ve "Yazdır"da basılan da bu.
- [satır 53–60](src/components/CvPreview.tsx#L53): Üç "gözlemci":
  - `ResizeObserver`: boyut değişti.
  - `MutationObserver`: içerik değişti.
  - `fonts.loadingdone`: yazı tipi yüklendi.

  Herhangi biri tetiklenince sayfa bölünmesi yeniden hesaplanıyor.
- [satır 92](src/components/CvPreview.tsx#L92): Her sayfa için bir `PreviewSheet` çiziliyor.

**[PreviewSheet.tsx](src/components/PreviewSheet.tsx)** — Ekrandaki tek bir A4 kâğıt.
- Katmanlar alttan üste: beyaz kâğıt, renkli sütunlar ([satır 49](src/components/PreviewSheet.tsx#L49)),
  sonra CV'nin bu sayfaya düşen kısmı.
- [satır 60](src/components/PreviewSheet.tsx#L60) `translateY(-start)`: CV'nin tamamını yukarı kaydırıp
  sadece `[start, end)` aralığını gösterir; fazlası kesilir.
- [satır 71](src/components/PreviewSheet.tsx#L71) `RECOMMENDED_MAX_PAGES = 2`: Bundan uzun CV'de sarı uyarı çıkar.

### 4.8 `src/hooks/` — özel hook'lar

**[usePersistentCv.ts](src/hooks/usePersistentCv.ts)** — Editörün veri katmanı.
- [satır 10](src/hooks/usePersistentCv.ts#L10) `AUTOSAVE_DELAY_MS = 300`: Otomatik kaydetme beklemesi.
- [satır 37](src/hooks/usePersistentCv.ts#L37) `flush`: Bekleyen değişikliği **hemen** kaydeder (geri butonu bunu kullanır).
- [satır 47](src/hooks/usePersistentCv.ts#L47): Her değişiklikte 300 ms'lik zamanlayıcı kurar. Yeni bir değişiklik
  gelirse eskisini iptal eder; buna *debounce* denir.
- [satır 55](src/hooks/usePersistentCv.ts#L55) `pagehide`: Sekme kapanırken de kaydeder.

**[useCvList.ts](src/hooks/useCvList.ts)** — Ana sayfadaki liste.
- [satır 34](src/hooks/useCvList.ts#L34) `useSyncExternalStore`: React dışındaki bir veriye (burada localStorage)
  abone olmanın doğru yolu.
- **Neden gerekli?** Bu Next.js sürümü sayfadan ayrılınca sayfayı silmiyor, gizleyip state'iyle saklıyor
  (React `<Activity>`). Listeyi `useState`'te tutsaydık, geri dönünce eski liste görünürdü.

**[useTheme.ts](src/hooks/useTheme.ts)** — Tema durumu. Kullanıcı tema seçmediyse işletim sisteminin temasını izler.

### 4.9 `src/lib/` — saf mantık

| Dosya | Ne yapıyor | Önemli yer |
|---|---|---|
| [cvRepository.ts](src/lib/cvRepository.ts) | CV'leri saklar ve okur (**repository deseni**). Uygulamanın geri kalanı localStorage'ı bilmez, sadece `list/get/create/save/remove` çağırır. | [satır 17](src/lib/cvRepository.ts#L17) depolama anahtarları; [satır 86](src/lib/cvRepository.ts#L86) `loadIndex`: eski tek CV'yi yeni yapıya taşır; [satır 137](src/lib/cvRepository.ts#L137) `save` |
| [storage.ts](src/lib/storage.ts) | localStorage'dan okunan veriyi **Zod** ile doğrular. Bozuk veri uygulamayı çökertmez. | [satır 7](src/lib/storage.ts#L7) şema; `.default([])`: sonradan eklenen alanlar eski kayıtları bozmasın |
| [defaultCv.ts](src/lib/defaultCv.ts) | Boş CV, örnek CV, `createEmpty...` fonksiyonları | [satır 109](src/lib/defaultCv.ts#L109) `EMPTY_CV`: yeni CV'ler bununla başlar |
| [pagination.ts](src/lib/pagination.ts) | **Sayfa nereden bölünsün?** Sadece sayılarla çalışır, kolay test edilir. | [satır 22](src/lib/pagination.ts#L22) kayıt/satır kesilmesin; [satır 31](src/lib/pagination.ts#L31) başlık yalnız kalmasın; [satır 56](src/lib/pagination.ts#L56) ana fonksiyon |
| [pageLayout.ts](src/lib/pageLayout.ts) | Ekrandaki CV'yi ölçüp `pagination`'a verir | [satır 15](src/lib/pageLayout.ts#L15) **sayfa payları**; [satır 23](src/lib/pageLayout.ts#L23) kesilmeyecek etiketler; [satır 86](src/lib/pageLayout.ts#L86) her yazı satırını ölçer |
| [pdf.ts](src/lib/pdf.ts) | PDF indir: görüntü al, sayfalara kes, bağlantıları ekle | [satır 18](src/lib/pdf.ts#L18) çözünürlük; [satır 53](src/lib/pdf.ts#L53) tek sayfa çizimi; [satır 98](src/lib/pdf.ts#L98) tıklanabilir bağlantılar |
| [listUtils.ts](src/lib/listUtils.ts) | Listeyi değiştirmeden (yeni kopya döndürerek) güncelle, sil, taşı | — |
| [format.ts](src/lib/format.ts) | "2023-01" → "Oca 2023", bağlantıyı sadeleştirme | — |
| [image.ts](src/lib/image.ts) | Fotoğrafı en fazla 400px'e küçültür (localStorage ~5 MB sınırlı) | [satır 5](src/lib/image.ts#L5) |
| [skills.ts](src/lib/skills.ts) | Yetenek metnini ayırır ve kontrol eder | [satır 3](src/lib/skills.ts#L3) en fazla 40 karakter |
| [cleanCv.ts](src/lib/cleanCv.ts) | Önizlemede boş kayıtları gizler | — |
| [theme.ts](src/lib/theme.ts) | Tema seçimini kaydeder, uygular; açılış script'i | — |

---

## 5. "Şunu değiştirmek istiyorum" → hangi dosya?

| İstediğin şey | Bakacağın yer |
|---|---|
| Bir şablonun rengini, yazı boyutunu, düzenini değiştirmek | İlgili şablon dosyası, `src/components/templates/*Template.tsx` (Tailwind sınıfları) |
| **Yeni şablon eklemek** | 1) `templates/` altına yeni dosya (mevcut birini kopyala), 2) [types/cv.ts satır 85](src/types/cv.ts#L85) `TEMPLATE_IDS`'e id ekle, 3) [templates/index.ts](src/components/templates/index.ts) listesine bir satır ekle |
| CV'ye yeni bir **alan** eklemek (ör. "Web sitesi") | 1) [types/cv.ts](src/types/cv.ts) tipe ekle, 2) [storage.ts](src/lib/storage.ts) şemaya ekle (`.default("")` ile, eski kayıtlar bozulmasın), 3) [defaultCv.ts](src/lib/defaultCv.ts) boş/örnek veriye ekle, 4) ilgili form dosyası, 5) şablonlarda göster |
| CV'ye yeni bir **bölüm** eklemek (ör. "Hobiler") | Yukarıdaki adımlar + `RepeatableSection` kullanan yeni bir form (en iyi örnek [ReferencesForm.tsx](src/components/form/ReferencesForm.tsx)) + [CvForm.tsx](src/components/form/CvForm.tsx)'e ekle + [cleanCv.ts](src/lib/cleanCv.ts) |
| Formdaki bölümlerin sırası | [CvForm.tsx](src/components/form/CvForm.tsx) |
| Form kutularının görünümü | [Fields.tsx satır 8](src/components/form/Fields.tsx#L8) `inputBaseClass` |
| Üst çubuktaki butonlar | [Toolbar.tsx](src/components/Toolbar.tsx) (ne yaptıkları: [CvEditor.tsx](src/components/editor/CvEditor.tsx)) |
| Ana sayfa yazıları, kart düzeni | [HomeScreen.tsx](src/components/home/HomeScreen.tsx), [CvCard.tsx](src/components/home/CvCard.tsx) |
| CV adı sınırı (60 karakter) | [cvRepository.ts](src/lib/cvRepository.ts) `MAX_CV_NAME_LENGTH` |
| Yetenek uzunluk sınırı (40) | [skills.ts satır 3](src/lib/skills.ts#L3) |
| Dil seviyeleri | [types/cv.ts satır 57](src/types/cv.ts#L57) |
| Sayfa payları (üst/alt boşluk) | [pageLayout.ts satır 15](src/lib/pageLayout.ts#L15) **ve** "Yazdır" için [globals.css](src/app/globals.css) `@page` |
| Sayfa bölme kuralları | [pagination.ts](src/lib/pagination.ts) (önce [testlerine](src/lib/pagination.test.ts) bak) |
| PDF kalitesi / dosya boyutu | [pdf.ts](src/lib/pdf.ts) `PIXEL_RATIO`, `JPEG_QUALITY` |
| Otomatik kaydetme beklemesi | [usePersistentCv.ts satır 10](src/hooks/usePersistentCv.ts#L10) |
| Koyu tema renkleri | Her bileşendeki `dark:...` sınıfları; genel arka plan [globals.css](src/app/globals.css) |
| Yazı tipleri | [layout.tsx](src/app/layout.tsx) ve [globals.css](src/app/globals.css) `@theme` |
| Fotoğraf boyutu | [image.ts satır 5](src/lib/image.ts#L5) |
| Örnek CV verisi | [defaultCv.ts](src/lib/defaultCv.ts) `SAMPLE_CV` |

---

## 6. Komutlar ve dikkat edilecekler

```bash
npm run dev      # Geliştirme sunucusu (localhost:3000) — değişiklikler anında görünür
npm test         # Tüm testleri çalıştır (vitest)
npm run lint     # Kod kurallarını kontrol et (eslint)
npx tsc --noEmit # Tip hatalarını kontrol et (TypeScript)
npm run build    # Yayına hazır sürüm üret
```

**Dikkat edilecekler:**

1. **`npm run dev` çalışırken `npm run build` çalıştırma.** İkisi aynı `.next` klasörünü kullanıyor;
   geliştirme sunucusu eski CSS'te takılı kalabiliyor. Önce dev'i durdur (`Ctrl+C`), sonra build al.
2. **Bu Next.js sürümü farklı** (bkz. `AGENTS.md`). Doğru bilgi için `node_modules/next/dist/docs/` klasöründeki
   dokümanlara bak. Bu projede karşılaştığımız iki fark:
   - Dinamik adreslerde `params` bir Promise ve `<Suspense>` içinde okunuyor.
   - Sayfalar ayrılınca silinmiyor, gizleniyor (`<Activity>`). `useState` değerleri korunuyor.
3. **Veriye yeni alan eklerken** Zod şemasında `.default(...)` kullan. Yoksa eski kayıtlar geçersiz sayılır
   ve kullanıcının CV'leri kaybolmuş gibi olur.
4. **Piksel ölçümlerinde** `offsetWidth/offsetHeight` tam sayıya yuvarlar (793,7 → 794). Hassas ölçüm için
   `getBoundingClientRect()` veya `getComputedStyle(...).width` kullan. Sayfa sonunda yarım satır
   sorununun sebebi bu yuvarlamaydı.
5. **Veriler sadece o tarayıcıda.** Tarayıcı verisini silersen CV'ler de gider.

### localStorage anahtarları

| Anahtar | İçerik |
|---|---|
| `cv-olusturucu:index:v1` | CV listesi (ad, şablon, tarihler) |
| `cv-olusturucu:cv:v1:<id>` | Her CV'nin içeriği |
| `cv-olusturucu:theme:v1` | Tema tercihi |

Tarayıcıda görmek için: Geliştirici Araçları (`F12`) → **Application** → **Local Storage**.

---

## 7. Bilinen açık konular

- Sayfa sonunda "ş", "ç" gibi harflerin alt çengeli bazen kesilip sonraki sayfaya düşebiliyor.
  Çözüm fikri: [pagination.ts](src/lib/pagination.ts)'te bölme noktasını sonraki satırın başına
  değil, iki satırın tam ortasına koymak.
- Proje henüz git'e kaydedilmedi (commit yok).
