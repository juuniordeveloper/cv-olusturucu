// Profil fotoğrafını tarayıcıda küçültüp Base64 metne çevirir.
// Sunucuya hiçbir şey gönderilmez. Küçültmemizin sebebi localStorage'ın
// sınırlı (~5 MB) olması: 4000px'lik bir fotoğraf onu tek başına doldurabilir.

const MAX_PHOTO_SIZE_PX = 400;
const JPEG_QUALITY = 0.85;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB üstü dosyaları hiç açmayalım

export type ImageErrorCode = "notImage" | "tooLarge" | "unreadable" | "unsupported";

// Hata mesajı yerine kod taşıyan hata: ekrandaki bileşen kodu seçili dilde mesaja çevirir.
export class ImageError extends Error {
  constructor(readonly code: ImageErrorCode) {
    super(code);
    this.name = "ImageError";
  }
}

export async function resizeImageToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new ImageError("notImage");
  if (file.size > MAX_FILE_BYTES) throw new ImageError("tooLarge");

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new ImageError("unreadable");
  });

  const scale = Math.min(1, MAX_PHOTO_SIZE_PX / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new ImageError("unsupported");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
