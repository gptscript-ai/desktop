'use server';

import fs from 'fs';
import os from 'os';
import path from 'path';

export type BrowserSettings = {
  headless: boolean;
  useDefaultSession: boolean;
};

const defaultSettings: BrowserSettings = {
  headless: false,
  useDefaultSession: false,
};

export async function getBrowserSettings(): Promise<BrowserSettings> {
  const location = await browserSettingsLocation();
  if (fs.existsSync(location)) {
    const settings = fs.readFileSync(location, 'utf-8');
    return JSON.parse(settings) as BrowserSettings;
  }

  return defaultSettings;
}

export async function setBrowserSettings(settings: BrowserSettings) {
  const location = await browserSettingsLocation();
  fs.writeFileSync(location, JSON.stringify(settings, null, 2));
}

export async function browserSettingsLocation(): Promise<string> {
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

  return path.join(configDir, 'acorn', 'browsersettings.json');
}
