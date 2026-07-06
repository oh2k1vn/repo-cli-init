export function getRelativeSlug(slug: string): string {
  if (!slug) return '/'
  if (slug.startsWith('http://') || slug.startsWith('https://')) {
    try {
      const url = new URL(slug)
      return url.pathname
    } catch (e) {
      // ignore
    }
  }
  return slug.startsWith('/') ? slug : `/${slug}`
}
