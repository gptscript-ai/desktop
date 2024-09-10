'use server';

import fs from 'fs';
import os from 'os';
import path from 'path';

export type AppSettings = {
  confirmToolCalls: boolean;
  browser: BrowserAppSettings;
};

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

export async function getAppSettings() {
  if (!process.env.GPTSCRIPT_SETTINGS_FILE) {
    throw new Error('GPTSCRIPT_SETTINGS_FILE not set');
  }

  const location = process.env.GPTSCRIPT_SETTINGS_FILE;
  if (fs.existsSync(location)) {
    const AppSettings = fs.readFileSync(location, 'utf-8');
    return JSON.parse(AppSettings) as AppSettings;
  }
  return defaultAppSettings;
}

export async function setAppSettings(AppSettings: AppSettings) {
  if (!process.env.GPTSCRIPT_SETTINGS_FILE) {
    throw new Error('GPTSCRIPT_SETTINGS_FILE not set');
  }

  const location = process.env.GPTSCRIPT_SETTINGS_FILE;
  fs.writeFileSync(location, JSON.stringify(AppSettings, null, 2));
}
