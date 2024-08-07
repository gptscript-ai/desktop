import { app, BrowserWindow } from "electron";
import { getPort } from 'get-port-please';
import { startAppServer } from '../server/app.mjs';
import { join, dirname } from "path";
import { existsSync, mkdirSync } from "fs";
import fixPath from "fix-path";

const appName = 'Assistant Studio';
const gatewayUrl = process.env.GATEWAY_URL || 'https://gateway-api.gptscript.ai';
const resourcesDir = dirname(app.getAppPath());
const dataDir = getDataDir(appName);

function getDataDir(appName) {
  const userDataPath = app.getPath('userData');
  return join(userDataPath, appName);
}

function ensureDirExists(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function startServer(isPackaged) {
  const port = isPackaged ? await getPort({ portRange: [30000, 40000] }) : 3000;
  const gptscriptBin = join(isPackaged ? resourcesDir : "", "node_modules", "@gptscript-ai", "gptscript", "bin", `gptscript${process.platform === "win32" ? ".exe" : ""}`);

  process.env.GPTSCRIPT_BIN = process.env.GPTSCRIPT_BIN || gptscriptBin;
  process.env.THREADS_DIR = process.env.THREADS_DIR || join(dataDir, "threads");
  process.env.WORKSPACE_DIR = process.env.WORKSPACE_DIR || join(dataDir, "workspace");
  process.env.GATEWAY_URL = process.env.GATEWAY_URL || gatewayUrl;
  process.env.DISABLE_CACHE = "true"; // TODO: Remove after https://github.com/gptscript-ai/gptscript/issues/713 is addressed

  console.log(`Starting app server with GPTSCRIPT_BIN="${process.env.GPTSCRIPT_BIN}"`);

  try {
    const url = await startAppServer({ dev: !isPackaged, hostname: 'localhost', port, dir: app.getAppPath() });
    console.log(`> ${isPackaged ? "" : "Dev "}Electron app started at ${url}`);
    createWindow(url);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

function createWindow(url) {
  const win = new BrowserWindow({
    width: 1024,
    height: 720,
    frame: false, // This removes the title bar
    webPreferences: {
      preload: join(app.getAppPath(), "electron/preload.js"),
      nodeIntegration: true,
      allowRunningInsecureContent: true,
      webSecurity: false,
      disableBlinkFeatures: "Autofill",
    }
  });

  win.loadURL(url);
  win.webContents.on("did-fail-load", () => win.webContents.reloadIgnoringCache());
}

app.on("ready", () => {
  fixPath();
  ensureDirExists(dataDir);
  startServer(app.isPackaged);
});

app.on("window-all-closed", () => app.quit());
