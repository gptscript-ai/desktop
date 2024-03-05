import dotenv from 'dotenv'

dotenv.config()

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  components: true,
  ssr: false,

  runtimeConfig: {
    api: process.env.NUXT_API || 'https://api.openai.com/v1',
    apiKey: process.env.NUXT_API_KEY || '',
    organization: process.env.NUXT_ORGANIZATION || '',
  },

  devtools: { enabled: true },

  devServer: {
    port: 3100,
    https: {
      cert: 'server/tls/localhost.crt',
      key: 'server/tls/localhost.key',
    },
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/ui',
    '@nuxtjs/tailwindcss'
  ],

  vite: {
    build: {
      manifest: true,
      ssrManifest: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          sourcemap: true,
        },
      },
    },

    css: {
      devSourcemap: true,
    },
  },

  colorMode: {
    classSuffix: '',
  },
})
