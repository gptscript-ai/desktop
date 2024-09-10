'use client';

import { Button, Chip, Divider, Switch, Tooltip } from '@nextui-org/react';
import { GoDownload } from 'react-icons/go';
import { useContext, useState } from 'react';
import { SettingsContext } from '@/contexts/settings';

export default function SettingsPage() {
  const { settings, loading, saveSettings } = useContext(SettingsContext);
  const [pendingSettings, setPendingSettings] = useState(settings);
  const [saveButtonText, setSaveButtonText] = useState('Save Settings');

  return (
    <div className="container mx-auto max-w-6xl py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <Divider className="my-6 w-full" />
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
          <Button
            as="a"
            href="/api/logs"
            className="w-full md:w-auto"
            startContent={<GoDownload />}
            color="primary"
            variant="flat"
          >
            Export Acorn Logs
          </Button>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">General</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="mt-2 mb-2 flex items-center">
                <Switch
                  isSelected={pendingSettings.confirmToolCalls}
                  onValueChange={(isSelected) => {
                    setPendingSettings((prevState) => ({
                      ...prevState,
                      confirmToolCalls: isSelected,
                    }));
                  }}
                >
                  Tools Require Confirmation
                </Switch>
                <Tooltip
                  classNames={{ base: 'w-1/2' }}
                  content="Whenever the LLM decides to run a tool, it will ask for user confirmation before running the tool."
                  placement="right"
                >
                  <Chip className="ml-2 font-mono cursor-default">i</Chip>
                </Tooltip>
              </div>
            </>
          )}
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Browser Tool</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="mt-2 mb-2 flex items-center">
                <Switch
                  isSelected={pendingSettings.browser.headless}
                  onValueChange={(isSelected) => {
                    setPendingSettings((prevState) => ({
                      ...prevState,
                      browser: { ...prevState.browser, headless: isSelected },
                    }));
                  }}
                >
                  Headless Mode
                </Switch>
                <Tooltip
                  classNames={{ base: 'w-1/2' }}
                  content="Headless Mode runs the browser without a graphical interface."
                  placement="right"
                >
                  <Chip className="ml-2 font-mono cursor-default">i</Chip>
                </Tooltip>
              </div>
              <div className="mt-2 mb-2 flex items-center">
                <Switch
                  isSelected={pendingSettings.browser.useDefaultSession}
                  onValueChange={(isSelected) => {
                    setPendingSettings((prevState) => ({
                      ...prevState,
                      browser: {
                        ...prevState.browser,
                        useDefaultSession: isSelected,
                      },
                    }));
                  }}
                >
                  Use Default Session
                </Switch>
                <Tooltip
                  classNames={{ base: 'w-1/2' }}
                  content="Use Default Session will use your existing default Google Chrome session. When this setting is enabled, Chrome must be closed before running the browser tool."
                  placement="right"
                >
                  <Chip className="ml-2 font-mono cursor-default">i</Chip>
                </Tooltip>
              </div>
            </>
          )}
        </section>
        <Button
          className="w-full md:w-auto"
          onClick={() => {
            setSaveButtonText('Saving...');
            saveSettings(pendingSettings).then(() => {
              setSaveButtonText('Saved!');
              setTimeout(() => {
                setSaveButtonText('Save Settings');
              }, 1000);
            });
          }}
          color="primary"
          variant="flat"
        >
          {saveButtonText}
        </Button>
      </div>
    </div>
  );
}
