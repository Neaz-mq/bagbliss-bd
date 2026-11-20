/**
 * Cloudinary ছবি ছোট ও দ্রুত করে: f_auto (WebP/AVIF), q_auto, নির্দিষ্ট প্রস্থ।
 * আগে থেকেই transform থাকলে বা Cloudinary-র URL না হলে অপরিবর্তিত ফেরত দেয়।
 */
export function cld(url: string | undefined | null, width: number, quality = 'q_auto'): string {
  if (!url) return ''
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  const m = url.match(/\/upload\/([^/]+)\//)
  if (m && /^[a-z]{1,3}_/.test(m[1])) return url // আগেই transform আছে
  return url.replace('/upload/', `/upload/f_auto,${quality},w_${width},c_limit/`)
}