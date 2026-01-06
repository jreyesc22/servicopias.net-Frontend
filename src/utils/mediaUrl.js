export function resolveMediaUrl(url) {
  if (!url) return url

  const raw = String(url)

  // Already absolute or special schemes
  if (/^(https?:)?\/\//i.test(raw)) return raw
  if (/^(data:|blob:)/i.test(raw)) return raw

  // Normalize filesystem paths (Windows backslashes -> slashes)
  const normalized = raw.replace(/\\/g, '/')

  // If the stored value contains a public uploads segment, extract it.
  // Examples:
  // - /uploads/images/a.jpg
  // - uploads/pdfs/a.pdf
  // - C:/app/uploads/images/a.jpg
  // - /var/www/app/uploads/pdfs/a.pdf
  const uploadsIndex = normalized.toLowerCase().indexOf('/uploads/')
  const publicPath = uploadsIndex >= 0 ? normalized.slice(uploadsIndex) : normalized

  const apiBase = String(process.env.VUE_APP_API_URL || '').replace(/\/$/, '')
  if (!apiBase) return raw

  // Media (uploads) is commonly served from the server root, not under /api.
  // Example:
  // - API:   http://192.168.1.41:3000/api
  // - Media: http://192.168.1.41:3000/uploads/...
  const mediaBaseFromEnv = String(process.env.VUE_APP_MEDIA_BASE_URL || '').replace(/\/$/, '')
  const mediaBase = mediaBaseFromEnv || apiBase.replace(/\/api$/i, '')

  const baseToUse = publicPath.toLowerCase().startsWith('/uploads/') ? mediaBase : apiBase

  if (publicPath.startsWith('/')) return `${baseToUse}${publicPath}`
  return `${baseToUse}/${publicPath}`
}
