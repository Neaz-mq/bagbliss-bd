export interface ColorInput {
  name?: string
  hex?: string
  stock?: number | string
}

/** Sum of per-color stock. Invalid / negative values count as 0. */
export function sumColorStock(colors: ColorInput[]): number {
  return colors.reduce((sum, c) => {
    const n = Number(c?.stock)
    return sum + (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0)
  }, 0)
}