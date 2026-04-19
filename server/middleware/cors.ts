const ALLOWED_ORIGINS = [
  'https://veluxeauto.com',
  'https://www.veluxeauto.com',
]

const isDev = process.env.NODE_ENV === 'development'

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true
  if (origin.startsWith('https://veluxe-auto-showroom') && origin.endsWith('.vercel.app')) return true
  return false
}

export default defineEventHandler((event) => {
  const origin = getRequestHeader(event, 'origin')

  if (isDev || (origin && isAllowedOrigin(origin))) {
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-cache-key',
      'Access-Control-Max-Age': '86400',
    })
  }

  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
