import builder from 'electron-builder'

const Platform = builder.Platform

/**
 * @type {import('electron-builder').Configuration}
 */
const options = {
  appId:       'ai.gptscript',
  productName: 'GPTScript',

  extraFiles: [
    {
        from: '.next/standalone',
        to: 'web'
    },
    {
        from: '.next/static',
        to: 'web/.next/static'
    },
    {
        from: '.next/public',
        to: 'web/public'
    }
  ],

  extraResources: [
    'main.mjs',
    'server.mjs',
    'electron/preload.js'
  ],

  mac:  {
    hardenedRuntime:     true,
    gatekeeperAssess:    false,
    entitlements:        'electron/entitlements.mac.plist',
    entitlementsInherit: 'electron/entitlements.mac.plist',
    icon:                'electron/icon.icns',
    category:            'public.app-category.productivity',

    target: {
      target: 'default',
      arch:   ['x64', 'arm64'],
    },

    extraResources: ['binaries/gptscript-universal-apple-darwin'],
  },

  win: {
    // eslint-disable-next-line no-template-curly-in-string
    artifactName: '${productName}-Setup-${version}.${ext}',
    target:       {
      target: 'nsis',
      arch:   ['x64', 'ia32'],
    },
    extraResources: ['binaries/gptscript-x86_64-pc-windows-msvc.exe'],
  },

  linux: {
    maintainer: 'Acorn Labs',
    category:   'Office',
    desktop:    {
      StartupNotify: 'false',
      Encoding:      'UTF-8',
      MimeType:      'x-scheme-handler/deeplink',
    },
    target:         ['AppImage', 'rpm', 'deb'],
    extraResources: ['binaries/gptscript-x86_64-unknown-linux-gnu'],
  },

  // protocols: {
  // name: 'Your deeplink',
  // - Don't forget to set `MimeType: "x-scheme-handler/deeplink"` for `linux.desktop` entry!
  // schemes: ['deeplink']
  // },

  // - Electron auto-updater config
  // publish: [
  //   {
  //     provider: 'github',
  //     owner: 'gptscript-ai',
  //     repo: 'gptstudio',
  //     releaseType: 'release'
  //   }
  // ],

  // "store" | "normal" | "maximum" - For testing builds, use 'store' to reduce build time significantly.
  compression:                 'normal',
  removePackageScripts:        true,
  nodeGypRebuild:              false,
  buildDependenciesFromSource: false,
  directories:                 { output: 'electron-dist' },
  nsis:                        { deleteAppDataOnUninstall: true },
}

function go(platform) {
  builder
    .build({
      targets: Platform[platform.toUpperCase()].createTarget(),
      config:  options,
    })
    .then((result) => {
      console.info('----------------------------')
      console.info('Platform:', platform)
      console.info('Output:', JSON.stringify(result, null, 2))
    })
}

go(process.argv[2] || 'mac')
