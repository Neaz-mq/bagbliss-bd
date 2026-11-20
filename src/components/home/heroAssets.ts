import { cld } from '@/utils/cloudinary'

// Hero ও home page preload — দুই জায়গায় একই URL যাতে ব্রাউজার একবারই নামায়
export const HERO_IMAGE_SRC = cld(
  'https://res.cloudinary.com/dzi3u164c/image/upload/v1790437709/a8e8c5d7-c8a1-46fe-963f-c84f80550737_gqpwsn.webp',
  1000
)
export const HERO_BG_SRC = cld(
  'https://res.cloudinary.com/dzi3u164c/image/upload/v1790437088/bag-bg_bk68l2.webp',
  1600,
  'q_auto:eco'
)