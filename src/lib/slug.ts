import Product from '@/models/Product'

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generates a unique slug from a product name.
 * Pass `excludeId` when updating an existing product so it
 * doesn't collide with its own current slug.
 */
export async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || 'product'
  let slug = base
  let i = 1

  // Keep trying until we find a slug that isn't taken (handles duplicate product names)
  while (
    await Product.exists({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    slug = `${base}-${i}`
    i++
  }
  return slug
}