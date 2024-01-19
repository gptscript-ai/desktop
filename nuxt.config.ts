import pkg from './package.json'
import dotenv from 'dotenv'
import fs from 'node:fs'
import https from 'node:https'
import basicSsl from '@vitejs/plugin-basic-ssl'

dotenv.config()

import { isDev } from './config/server'
const port = 3100
const hmrPort = port + 1

const lifecycle = process.env.npm_lifecycle_event
const ssl = isDev && process.env.SSL !== 'false'

let hmrServer: any

if ( isDev && process.env.__NUXT_DEV__ ) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  hmrServer = https.createServer({
    key:  fs.readFileSync('server/tls/localhost.key'),
    cert: fs.readFileSync('server/tls/localhost.crt'),
  }).listen(hmrPort)
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  components: true,
  ssr: false,

  runtimeConfig: {
    public: {
      api: process.env.NUXT_PUBLIC_API || '/v1',
    },

    apiKey: process.env.NUXT_API_KEY || '',
  },

  devtools: { enabled: true },

  build: {
    analyze:   {
      filename:   '.nuxt/stats/{name}.html',
      template:   'treemap',
      brotliSize: true,
      gzipSize:   true,
    },

    // transpile: ['element-plus'],
    transpile: lifecycle === 'build' ? ['element-plus'] : [],
  },

  experimental: { reactivityTransform: true },
  nitro: { sourceMap: true },
  typescript: { strict: true },

  sourcemap: true,

  vite: {
    // ssr:     { format: 'cjs' },
    build:   {
      manifest:      true,
      ssrManifest:   true,
      sourcemap:     true,
      // ssr: true
      rollupOptions: {
        output: {
          banner:       `/* Rubra ${ pkg.version } */`,
          sourcemap:    true,
        },
      },
    },

    css:     {
      devSourcemap: true,
    },

    plugins: [
      basicSsl(),
    ],

    server: {
      https: {
        cert: 'server/tls/localhost.crt',
        key:  'server/tls/localhost.key',
      },

      middlewareMode: true,

      hmr:   {
        overlay:    false,
        protocol:   ssl ? 'wss' : 'ws',
        port:       hmrPort,
        clientPort: hmrPort,
        server:     hmrServer,
      },
    },
  },

  devServer: {
    port,
    https: {
      cert: 'server/tls/localhost.crt',
      key:  'server/tls/localhost.key',
    },
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  colorMode: {
    classSuffix: '',
  },
})
