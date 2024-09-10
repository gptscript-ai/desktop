import { app } from 'electron';
import { getPort } from 'get-port-please';
import { join, dirname, parse } from 'path';
import log from 'electron-log/main.js';
import util from 'util';
import { renameSync } from 'fs';
import os from 'os';

function appSettingsLocation() {
  const homeDir = os.homedir();
  let configDir;
  if (os.platform() === 'darwin') {
    configDir =
      process.env.XDG_CONFIG_HOME ||
      join(homeDir, 'Library', 'Application Support');
  } else if (os.platform() === 'win32') {
    configDir = join(homeDir, 'AppData', 'Local');
  } else if (os.platform() === 'linux') {
    configDir = process.env.XDG_CONFIG_HOME || join(homeDir, '.config');
  } else {
    throw new Error('Unsupported platform');
  }

  return join(configDir, 'acorn', 'settings.json');
}

// App config
const dev = !app.isPackaged;
const appName = 'Acorn';
const appDir = app.getAppPath();
const logsDir = app.getPath('logs');
const resourcesDir = dirname(appDir);
const dataDir = join(app.getPath('userData'), appName);
const threadsDir = process.env.THREADS_DIR || join(dataDir, 'threads');
const workspaceDir = process.env.WORKSPACE_DIR || join(dataDir, 'workspace');
const appSettingsFile = appSettingsLocation();
const port =
  process.env.PORT ||
  (!dev ? await getPort({ portRange: [30000, 40000] }) : 3000);
const gptscriptBin =
  process.env.GPTSCRIPT_BIN ||
  join(
    !dev ? join(resourcesDir, 'app.asar.unpacked') : '',
    'node_modules',
    '@gptscript-ai',
    'gptscript',
    'bin',
    `gptscript${process.platform === 'win32' ? '.exe' : ''}`
  );
const knowledgeBin =
  process.env.KNOWLEDGE_BIN ||
  (process.env.NODE_ENV === 'production'
    ? join(
        process.resourcesPath,
        'bin',
        'knowledge' + (process.platform === 'win32' ? '.exe' : '')
      )
    : join(process.cwd(), 'bin', 'knowledge'));
const gatewayUrl =
  process.env.GPTSCRIPT_GATEWAY_URL || 'https://gateway-api.gptscript.ai';

// Logging config
const logFormat = ({ data, level, message }) => [
  message.date.toISOString(),
  `[${message.variables.processType === 'main' ? 'server' : 'client'}]`,
  `[${level.toUpperCase()}]`,
  util.format(...data),
];

log.transports.console.format = logFormat;

Object.assign(log.transports.file, {
  format: logFormat,
  resolvePathFn: (variables) => {
    return join(logsDir, `${variables.appName}.log`);
  },
  archiveLogFn: (file) => {
    const filePath = file.toString();
    const info = parse(filePath);
    const timestamp = Math.floor(Date.now() / 1000);

    try {
      renameSync(
        filePath,
        join(info.dir, `${info.name}.${timestamp}${info.ext}`)
      );
    } catch (e) {
      console.warn('failed to rotate log file', e);
    }
  },
});

log.initialize({
  // Include logs gathered from clients via IPC
  spyRendererConsole: true,
  includeFutureSessions: true,
});

// Forward default console logging to electron-log
Object.assign(console, log.functions);

export const config = {
  dev,
  appName,
  logsDir,
  appDir,
  resourcesDir,
  dataDir,
  threadsDir,
  workspaceDir,
  port,
  gptscriptBin,
  gatewayUrl,
  knowledgeBin,
  appSettingsFile,
};
