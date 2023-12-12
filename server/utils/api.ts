import OpenAI from 'openai'

export function emulateThreads() {
  const cfg = useRuntimeConfig()
  return !!cfg.api || cfg.api.includes('api.opanai.com')
}

export function useApi() {
  const cfg = useRuntimeConfig()

  if ( !cfg.apiKey ) {
    throw new Error('API Key not set')
  }

  const client = new OpenAI({
    apiKey: cfg.apiKey,
    baseURL: cfg.api || 'https://api.openai.com/v1',
  })

  return client
}
