import { app, screen, shell, BrowserWindow } from 'electron';
import { startAppServer } from '../server/app.mjs';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import fixPath from 'fix-path';
import os from 'os';
import { config } from './config.mjs';

app.on('window-all-closed', () => app.quit());
app.on('ready', startServer);

async function startServer() {
  // Fix path so that tools can find binaries installed on the system.
  fixPath();

  // Ensure the app's data directory exists
  ensureDirExists(config.dataDir);

  // Set up the browser tool to run in headless mode.
  ensureDirExists(config.workspaceDir);
  writeFileSync(
    join(`${config.workspaceDir}`, 'browsersettings.json'),
    JSON.stringify({ headless: true })
  );

  // Project config onto environment variables to configure GPTScript/sdk-server and the Next.js app.
  process.env.LOGS_DIR = config.logsDir;
  process.env.GPTSCRIPT_BIN = config.gptscriptBin;
  process.env.KNOWLEDGE_BIN = config.knowledgeBin;
  process.env.THREADS_DIR = config.threadsDir;
  process.env.WORKSPACE_DIR = config.workspaceDir;
  process.env.GPTSCRIPT_GATEWAY_URL = config.gatewayUrl;
  process.env.GPTSCRIPT_OPENAPI_REVAMP = 'true';

  console.log(`GPTSCRIPT_BIN=${config.gptscriptBin}`);

  try {
    const url = await startAppServer({
      dev: config.dev,
      hostname: 'localhost',
      port: config.port,
      appDir: config.appDir,
    });
    console.log(`> ${config.dev ? 'Dev ' : ''}Electron app started at ${url}`);
    createWindow(url);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

function createWindow(url) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const isMac = os.platform() === 'darwin';
  const win = new BrowserWindow({
    width: Math.min(width, 1280),
    height: Math.min(height, 960),
    center: true,
    frame: !isMac,
    webPreferences: {
      preload: join(config.appDir, 'electron/preload.mjs'),
      nodeIntegration: true,
      allowRunningInsecureContent: true,
      webSecurity: false,
      disableBlinkFeatures: 'Autofill',
    },
  });

  // Check if the platform is macOS before calling setWindowButtonVisibility
  if (isMac) {
    win.setWindowButtonVisibility(true);
  }

  // Open the Next.js app
  win.loadURL(url);

  win.webContents.on('did-fail-load', () =>
    win.webContents.reloadIgnoringCache()
  );

  // Open all external links in the default system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Check if the URL is external
    if (url.startsWith('http') && !url.includes('localhost')) {
      shell.openExternal(url);
      return { action: 'deny' }; // Prevent Electron from opening the link in the app
    }

    // Allow navigation for internal URLs
    return { action: 'allow' };
  });
}

function ensureDirExists(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
