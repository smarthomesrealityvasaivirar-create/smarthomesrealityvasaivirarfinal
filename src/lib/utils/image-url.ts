/** Must match next.config.ts: unknown hosts break Next Image at runtime. */
export function isImageUrl(value: string): boolean {
  if (/^\/(?!\/)[a-zA-Z0-9/_-]+\.(webp|png|jpe?g)$/.test(value)) return true
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false
    if (url.hostname === 'images.unsplash.com' || url.hostname === 'media.base44.com') return true
    const configured = process.env.NEXT_PUBLIC_SUPABASE_URL
    const host = configured ? new URL(configured).hostname : null
    return !!host && url.hostname === host && url.pathname.startsWith('/storage/v1/object/public/')
  } catch { return false }
}
