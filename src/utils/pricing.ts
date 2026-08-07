import { IProduct } from '@/types'

/** দামের একক উৎস — ProductCard, ProductDetail, cart সব জায়গায় এটাই */
export function getPricing(product: IProduct) {
  const listPrice = product.price

  const currentPrice =
    product.isFlashSale && product.flashSalePrice
      ? product.flashSalePrice
      : (product.discountPrice ?? product.price)

  const discountPercent =
    listPrice > currentPrice
      ? Math.round(((listPrice - currentPrice) / listPrice) * 100)
      : 0

  return { listPrice, currentPrice, discountPercent }
}

/**
 * কাঁচা DB ডকুমেন্ট থেকে বিক্রয়মূল্য।
 * সার্ভারে অর্ডারের দাম হিসাব করতে ব্যবহৃত — ক্লায়েন্টের পাঠানো
 * দাম কখনোই বিশ্বাস করা হয় না।
 */
export function getDbUnitPrice(raw: {
  price: number
  originalPrice?: number
  isFlashSale?: boolean
  flashSalePrice?: number
}): number {
  return raw.isFlashSale && raw.flashSalePrice ? raw.flashSalePrice : raw.price
}

/**
 * কাঁচা DB ডকুমেন্ট থেকে কাটা দাম (যেটা দেখানো হয়)।
 * DB তে `originalPrice` হলো আসল তালিকামূল্য, `price` হলো নিয়মিত ছাড়ের দাম।
 */
export function getDbListPrice(raw: {
  price: number
  originalPrice?: number
}): number {
  return raw.originalPrice && raw.originalPrice > raw.price
    ? raw.originalPrice
    : raw.price
}