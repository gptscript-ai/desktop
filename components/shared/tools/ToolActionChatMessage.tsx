'use client';

import { Tooltip } from '@nextui-org/react';

export function ToolActionChatMessage({
  action,
  name,
  toolRef,
}: {
  action: 'Added' | 'Removed';
  name?: string;
  toolRef: string;
}) {
  return (
    <div className="flex gap-1">
      {action}{' '}
      {name ? (
        <Tooltip content={toolRef} placement="bottom">
          <p className="underline cursor-pointer">{name}</p>
        </Tooltip>
      ) : (
        toolRef
      )}
    </div>
  );
}
