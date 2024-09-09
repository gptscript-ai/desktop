'use server';

import fs from 'fs';
import os from 'os';
import path from 'path';

export type AppSettings = {
  confirmToolCalls: boolean;
  browser: BrowserAppSettings;
}

export type BrowserAppSettings = {
  headless: boolean;
  useDefaultSession: boolean;
};

const defaultAppSettings: AppSettings = {
  confirmToolCalls: false,
  browser: {
    headless: false,
    useDefaultSession: false,
  },
};

export async function getAppSettings(): Promise<AppSettings> {
  const location = await AppSettingsLocation();
  if (fs.existsSync(location)) {
    const AppSettings = fs.readFileSync(location, 'utf-8');
    return JSON.parse(AppSettings) as AppSettings;
  }
  return defaultAppSettings;
}

export async function setAppSettings(AppSettings: AppSettings) {
  const location = await AppSettingsLocation();
  fs.writeFileSync(location, JSON.stringify(AppSettings, null, 2));
}

export async function AppSettingsLocation(): Promise<string> {
  const homeDir = os.homedir();
  let configDir;
  if (os.platform() === 'darwin') {
    configDir =
      process.env.XDG_CONFIG_HOME ||
      path.join(homeDir, 'Library', 'Application Support');
  } else if (os.platform() === 'win32') {
    configDir = path.join(homeDir, 'AppData', 'Local');
  } else if (os.platform() === 'linux') {
    configDir = process.env.XDG_CONFIG_HOME || path.join(homeDir, '.config');
  } else {
    throw new Error('Unsupported platform');
  }

  return path.join(configDir, 'acorn', 'settings.json');
}
