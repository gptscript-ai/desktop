import dotenv from 'dotenv'

dotenv.config()

// export const api = clean(process.env.API || process.env.NUXT_PUBLIC_API || 'http://localhost:2999')
export const api = clean(process.env.API || process.env.NUXT_PUBLIC_API || 'http://localhost:2999')
export const isDev = process.env.NODE_ENV === 'development'

function clean(url: string) {
  return (url || '').trim().replace(/\/+$/, '')
}
