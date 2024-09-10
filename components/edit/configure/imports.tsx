import CustomTool from '@/components/edit/configure/customTool';
import { EditContext } from '@/contexts/edit';
import { Button, Tooltip, useDisclosure } from '@nextui-org/react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useRef, useState } from 'react';
import { GoGlobe, GoPencil, GoTools, GoTrash } from 'react-icons/go';

import { getToolDisplayName, verifyToolExists } from '@/actions/gptscript';
import {
  CatalogListBox,
  ToolCatalogRef,
} from '@/components/chat/chatBar/CatalogListBox';
import { UrlToolModal } from '@/components/shared/tools/UrlToolModal';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useAsync } from '@/hooks/useFetch';
import { FeaturedToolMap, ToolIcon } from '@/model/tools';
import { noop } from 'lodash';

interface ImportsProps {
  tools: string[] | undefined;
  setTools: (tools: string[]) => void;
  enableLocal?: boolean;
  className?: string;
}

const Imports: React.FC<ImportsProps> = ({
  tools,
  setTools,
  className,
  enableLocal = 'true',
}) => {
  // remoteTools contains a mapping of tool references to display names for
  const [remoteTools, setRemoteTools] = useState<Map<string, string>>(
    new Map()
  );
  const [localTools, setLocalTools] = useState<string[]>([]);
  const { createNewTool, deleteLocalTool } = useContext(EditContext);

  const updateRemoteTools = async (remoteRefs: string[]) => {
    const updatedRemoteTools = new Map(remoteTools);
    for (const ref of remoteRefs) {
      if (updatedRemoteTools.has(ref)) {
        // We've already the display name of this tool
        continue;
      }
      updatedRemoteTools.set(
        ref,
        FeaturedToolMap.get(ref)?.name || (await getToolDisplayName(ref)) || ref
      );
    }

    setRemoteTools(() => {
      const newRemoteTools = new Map();
      updatedRemoteTools.forEach((value, key) => {
        newRemoteTools.set(key, value);
      });
      return newRemoteTools;
    });
  };

  useEffect(() => {
    if (tools) {
      setLocalTools(tools.filter((t) => !isRemote(t)));
      updateRemoteTools(tools.filter(isRemote)).catch((e) => {
        console.error('failed to update remote tools', e);
      });
    }
  }, [tools]);

  const deleteRemoteTool = (tool: string) => {
    // Remove the remote tool's display name mapping
    setRemoteTools((prevRemoteTools) => {
      const newRemoteTools = new Map(prevRemoteTools);
      newRemoteTools.delete(tool);
      return newRemoteTools;
    });

    // Remove the tool from the assistant
    setTools(tools!.filter((t) => t !== tool));
  };

  const verifyAndAddToolUrl = useAsync(async (url: string) => {
    if (!url) throw new Error('Tool URL cannot be empty');

    const toolExists = await verifyToolExists(url);
    if (!toolExists) throw new Error(`Tool ${url} does not exist`);

    setTools([...(tools || []), url]);
  });

  const urlToolModal = useDisclosure({ onClose: verifyAndAddToolUrl.clear });

  const catalogRef = useRef<ToolCatalogRef>(null);
  const catalogMenu = useDisclosure();

  useEffect(() => {
    if (catalogMenu.isOpen) catalogRef.current?.focus();
  }, [catalogMenu.isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') catalogMenu.onClose();
    };

    document.addEventListener('keyup', handler);
    return () => {
      document.removeEventListener('keyup', handler);
    };
  }, [catalogMenu]);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const clickOutsideRef = useClickOutside({
    onClickOutside: catalogMenu.onClose,
    whitelist: [buttonRef.current].filter((el) => !!el),
  });

  return (
    <div className={`${className}`}>
      {remoteTools && remoteTools.size > 0 && (
        <div className="grid grid-cols-1 gap-2 w-full mb-2">
          {Array.from(remoteTools.keys()).map((ref, i) => (
            <div key={i} className="flex space-x-2">
              <div className="truncate w-full border-2 dark:border-zinc-700 text-sm pl-2 rounded-lg flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <ToolIcon toolName={ref} />
                  <p className="capitalize">{remoteTools.get(ref)!}</p>
                </div>
                <Button
                  variant="light"
                  isIconOnly
                  size="sm"
                  startContent={<GoTrash />}
                  onPress={() => deleteRemoteTool(ref)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {localTools && localTools.length > 0 && (
        <div className="grid grid-cols-1 gap-2 w-full mb-2">
          {localTools.map((tool, i) => (
            <div key={i} className="flex space-x-2">
              <div className="truncate w-full border-2 dark:border-zinc-700 text-sm pl-2 rounded-lg flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <GoTools />
                  <p className="">{tool}</p>
                </div>
                <div>
                  <CustomTool tool={tool} />
                  <Button
                    variant="light"
                    isIconOnly
                    size="sm"
                    startContent={<GoTrash />}
                    onPress={() => deleteLocalTool(tool)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={`flex flex-col gap-2`}>
        <Tooltip
          content={
            <div ref={clickOutsideRef}>
              <CatalogListBox
                equippedTools={tools || []}
                onAddTool={(tool) => {
                  setTools([...(tools || []), tool]);
                  catalogMenu.onClose();
                }}
                ref={catalogRef}
              />
            </div>
          }
          isOpen={catalogMenu.isOpen}
        >
          <Button
            startContent={<GoTools />}
            ref={buttonRef}
            variant="flat"
            className="w-full"
            color="primary"
            size="sm"
            onPress={catalogMenu.onOpenChange}
          >
            Featured Tools
          </Button>
        </Tooltip>

        <UrlToolModal
          isOpen={urlToolModal.isOpen}
          onAddTool={
            (url) =>
              verifyAndAddToolUrl
                .executeAsync(url)
                .then(urlToolModal.onClose)
                .catch(noop) // add catch to prevent unhandled promise rejection
          }
          onClose={urlToolModal.onClose}
          error={(verifyAndAddToolUrl.error as Error)?.message}
          isLoading={verifyAndAddToolUrl.pending}
        />

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            className="w-full"
            color="primary"
            startContent={<GoGlobe />}
            onClick={() => urlToolModal.onOpenChange()}
          >
            Add Tool via URL
          </Button>

          {enableLocal && (
            <Button
              size="sm"
              variant="flat"
              className="w-full"
              color="primary"
              startContent={<GoPencil />}
              onPress={() => createNewTool()}
            >
              Create a tool
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

Imports.propTypes = {
  // @ts-ignore
  tools: PropTypes.arrayOf(PropTypes.string).isRequired,
  setTools: PropTypes.func.isRequired,
  className: PropTypes.string,
  collapsed: PropTypes.bool,
  enableLocal: PropTypes.bool,
};

export default Imports;

function isRemote(ref: string): boolean {
  return (
    ref.startsWith('https://') ||
    ref.startsWith('http://') ||
    ref.startsWith('sys.') || // not local, but considered remote for the purposes of this component
    ref.startsWith('github.com')
  );
}
