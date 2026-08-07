import { IProduct } from '@/types'

/** দামের একক উৎস — সব জায়গায় এটাই ব্যবহার হবে */
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