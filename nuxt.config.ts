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
  devtools: { enabled: true },
  modules:  [
    '@nuxt/ui',
    '@nuxtjs/color-mode',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  runtimeConfig: {
    public: {
      workspacesDir:      `${ process.dev ? 'dev-' : '' }workspaces`,
      workspaceExtension: 'workspace',
      scriptExtension:    'gpt',
      workspaceScript:    'script.gpt',
    },
  },
  typescript: { shim: false },
  ssr:        false,
})
