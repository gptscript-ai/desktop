'use client';

import { Tooltip } from '@nextui-org/react';

export function ToolActionChatMessage({
  action,
  name,
  toolRef,
}: {
  action: 'Added' | 'Removed';
  name?: string | null;
  toolRef: string;
}) {
  return (
    <div className="flex gap-1">
      {action}{' '}
      {name ? (
        <Tooltip content={toolRef} placement="bottom">
          <p className="underline underline-offset-2 decoration-dotted cursor-pointer">
            {name}
          </p>
        </Tooltip>
      ) : (
        toolRef
      )}
    </div>
  );
}
