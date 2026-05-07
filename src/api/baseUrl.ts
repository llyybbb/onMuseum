const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '')

export function withApiBase(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath
}
