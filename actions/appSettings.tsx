'use server';

import fs from 'fs';

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
  } as BrowserAppSettings,
};

export async function getAppSettings() {
  if (!process.env.GPTSCRIPT_SETTINGS_FILE) {
    throw new Error('GPTSCRIPT_SETTINGS_FILE not set');
  }

  const location = process.env.GPTSCRIPT_SETTINGS_FILE;
  if (fs.existsSync(location)) {
    const AppSettings = fs.readFileSync(location, 'utf-8');
    try {
      return JSON.parse(AppSettings) as AppSettings;
    } catch {
      console.error('Malformed settings file, using default settings...');
    }
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
