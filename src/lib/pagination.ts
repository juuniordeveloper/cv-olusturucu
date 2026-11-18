// CV'yi A4 sayfalara bölerken "nereden bölelim?" sorusunu cevaplar. İki kural var:
// 1) Bir satırı veya kaydı ortasından kesme (bloğun başından böl).
// 2) Bölüm başlığını sayfanın dibinde yalnız bırakma; başlık içeriğiyle birlikte
//    sonraki sayfaya geçsin ("keep with next" — kelime işlemcilerdeki ayarın aynısı).
// Saf fonksiyon: DOM'a dokunmaz, sadece sayılarla çalışır — bu yüzden kolay test edilir.

export interface Block {
  top: number;
  bottom: number;
  keepWithNext?: boolean; // Bölüm başlıkları için true
}

// 297mm ekranda 1122.5px eder; ölçüm 1123px çıkabilir. Bu kadarlık fazlalık
// yüzünden boş bir ikinci sayfa oluşmasın.
const OVERFLOW_TOLERANCE_PX = 4;

// Bölmeyi yukarı çekerken sayfanın en az yarısı dolu kalsın.
// (Aksi hâlde sayfadan uzun bir blok, sayfayı neredeyse boş bırakırdı.)
const MIN_PAGE_FILL_RATIO = 0.5;

// Kural 1: Çizginin üstüne denk gelen bloklar varsa en üsttekinin başına çek.
function avoidSplittingBlocks(line: number, blocks: readonly Block[], earliest: number): number {
  const straddling = blocks.filter(
    (block) => block.top < line && block.bottom > line && block.top >= earliest,
  );
  return straddling.length > 0 ? Math.min(...straddling.map((block) => block.top)) : line;
}

// Kural 2: Çizginin hemen üstünde, altında kendi sayfasında hiç içerik olmayan
// bir başlık varsa çizgiyi başlığın başına çek.
function avoidOrphanHeadings(line: number, blocks: readonly Block[], earliest: number): number {
  const orphanHeadings = blocks.filter((heading) => {
    if (!heading.keepWithNext || heading.top < earliest || heading.bottom > line) return false;
    const hasContentOnSamePage = blocks.some(
      (block) => !block.keepWithNext && block.top >= heading.top && block.bottom <= line,
    );
    return !hasContentOnSamePage;
  });
  return orphanHeadings.length > 0 ? Math.min(...orphanHeadings.map((heading) => heading.top)) : line;
}

// Sayfa kenar payları. top: SADECE 2. sayfadan itibaren (1. sayfanın üst boşluğunu
// şablon zaten veriyor). bottom: her sayfanın altında, yazı kenara yapışmasın diye.
export interface PageMargins {
  top: number;
  bottom: number;
}

export const NO_MARGINS: PageMargins = { top: 0, bottom: 0 };

// Bir sayfaya sığabilecek içerik yüksekliği.
export function getPageCapacity(pageHeight: number, pageIndex: number, margins: PageMargins): number {
  return pageHeight - (pageIndex > 0 ? margins.top : 0) - margins.bottom;
}

export function findPageBreaks(
  contentHeight: number,
  pageHeight: number,
  blocks: readonly Block[],
  margins: PageMargins = NO_MARGINS,
): number[] {
  const breaks: number[] = [];
  let pageStart = 0;

  for (;;) {
    const capacity = getPageCapacity(pageHeight, breaks.length, margins);
    if (contentHeight - pageStart <= capacity + OVERFLOW_TOLERANCE_PX) break;

    const earliestAllowed = pageStart + capacity * MIN_PAGE_FILL_RATIO;
    let breakAt = pageStart + capacity;

    // Çizgi her yukarı kaydığında yeni bir bloğa veya başlığa denk gelebilir;
    // bu yüzden iki kuralı, çizgi artık değişmeyene kadar tekrarlıyoruz.
    // Çizgi her adımda sadece yukarı gidebildiği ve alt sınırı olduğu için döngü biter.
    for (;;) {
      const next = avoidOrphanHeadings(
        avoidSplittingBlocks(breakAt, blocks, earliestAllowed),
        blocks,
        earliestAllowed,
      );
      if (next === breakAt) break;
      breakAt = next;
    }

    breaks.push(breakAt);
    pageStart = breakAt;
  }

  return breaks;
}
