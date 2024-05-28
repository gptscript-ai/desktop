// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  colorMode: {
    preference: 'system',
    fallback:   'dark',
  },
  components: true,
  css:        ['@/assets/css/main.scss'],
  devServer:  {
    port:  3000,
    host: '0.0.0.0',
  },
  devtools: { enabled: false },
  modules:  [
    '@nuxtjs/color-mode',
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  runtimeConfig: { public: {} },
  typescript:    { shim: false },
  ssr:           false,
  nitro:         { preset: 'node-server' },
})
