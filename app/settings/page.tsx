'use client';

import { Button, Divider } from '@nextui-org/react';
import { GoDownload } from 'react-icons/go';

export default function Settings() {
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
      </div>
    </div>
  );
}
