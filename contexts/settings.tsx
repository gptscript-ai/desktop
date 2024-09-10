import {
  AppSettings,
  getAppSettings,
  setAppSettings,
} from '@/actions/appSettings';
import { createContext, useEffect, useState } from 'react';

interface SettingsContextProps {
  children: React.ReactNode;
}

interface SettingsContextState {
  loading: boolean;
  settings: AppSettings;
  saveSettings: (settings: AppSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextState>(
  {} as SettingsContextState
);
const SettingsContextProvider: React.FC<SettingsContextProps> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    confirmToolCalls: false,
    browser: {
      headless: false,
      useDefaultSession: false,
    },
  });

  useEffect(() => {
    getAppSettings()
      .then((settings) => setSettings(settings))
      .then(() => setLoading(false));
  }, []);

  const saveSettings = async (settings: AppSettings) => {
    setAppSettings(settings).then(() => setSettings(settings)); // update the file
  };

  return (
    <SettingsContext.Provider
      value={{
        loading,
        settings,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext, SettingsContextProvider };
