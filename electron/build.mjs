import builder from 'electron-builder';
import os from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { embedVersionInfo } from './utils.mjs';

const currentDir = dirname(fileURLToPath(import.meta.url));  // Directory where this script resides

const Platform = builder.Platform;

const options = {
    appId: 'ai.gptscript.acorn',
    productName: 'Acorn',
    files: [
        "**/*",
        "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
        "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
        "!**/node_modules/.bin",
        "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
        "!.editorconfig",
        "!**/._*",
        "!**/.next/cache",
        "!**/node_modules/@next/swc*",
        "!**/node_modules/@next/swc*/**",
        "!**/{.DS_Store,.git,.github,*.zip,*.tar.gz,.hg,.svn,CVS,RCS,SCCS,.gitignore,.vscode,.gitattributes,package-lock.json}",
        "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
        "!**/{appveyor.yml,.travis.yml,circle.yml}",
        "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
    ],
    extraResources: [
        {
            from: join(currentDir, 'version.json'),
            to: 'version.json'  // Include version.json in the resources directory of the packaged app
        }
    ],
    mac: {
        hardenedRuntime: true,
        gatekeeperAssess: false,
        entitlements: 'electron/entitlements.mac.plist',
        entitlementsInherit: 'electron/entitlements.mac.plist',
        icon: 'electron/icon.icns',
        category: 'public.app-category.productivity',
        target: 'dmg',
    },
    dmg: {
        writeUpdateInfo: false,
    },
    win: {
        artifactName: '${productName}-Setup-${version}.${ext}',
        target: {
            target: 'nsis',
        },
        icon: 'electron/icon.ico'
    },
    nsis: {
        deleteAppDataOnUninstall: true,
        differentialPackage: false
    },
    linux: {
        maintainer: 'Acorn Labs',
        category: 'Office',
        desktop: {
            StartupNotify: 'false',
            Encoding: 'UTF-8',
            MimeType: 'x-scheme-handler/deeplink',
        },
        icon: "electron/icon.png",
        target: ['AppImage'],
    },
    compression: 'normal',
    removePackageScripts: true,
    nodeGypRebuild: false,
    buildDependenciesFromSource: false,
    directories: {
        output: 'electron-dist'
    },
    publish: {
        provider: "github",
        publishAutoUpdate: false,
        releaseType: "release",
        vPrefixedTagName: true
    }
};

function go() {
    const platform = os.platform();
    let targetPlatform;
    switch (platform) {
        case 'darwin':
            targetPlatform = 'mac';
            break;
        case 'win32':
            targetPlatform = 'windows';
            break;
        case 'linux':
            targetPlatform = 'linux';
            break;
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }

    embedVersionInfo();  // Generate version.json in the same directory

    const publishOption = process.env.GH_TOKEN ? 'always' : 'never';

    builder.build({
        targets: Platform[targetPlatform.toUpperCase()].createTarget(),
        config: options,
        publish: publishOption,
    }).then((result) => {
        console.info('Build completed:', JSON.stringify(result, null, 2));
    });
}

go();
