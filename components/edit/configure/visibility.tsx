import { Switch, Tooltip } from '@nextui-org/react';
import { MdPublic, MdPublicOff } from 'react-icons/md';

interface VisibilityProps {
  visibility: 'public' | 'private' | 'protected';
  setVisibility: React.Dispatch<
    React.SetStateAction<'public' | 'private' | 'protected'>
  >;
  className?: string;
}

const Visibility: React.FC<VisibilityProps> = ({
  visibility,
  setVisibility,
  className,
}) => {
  return (
    <Tooltip
      placement="top"
      offset={-2}
      closeDelay={0.5}
      content={
        <div>
          <p>{visibility === 'public' ? 'Public' : 'Private'}</p>
          <p className="text-tiny text-default-500">
            {visibility === 'public'
              ? 'Toggle to make visible to only you.'
              : 'Toggle to make visible to everyone.'}
          </p>
        </div>
      }
    >
      <div>
        <Switch
          className={className}
          isSelected={visibility === 'public'}
          onChange={(e) =>
            setVisibility(e.target.checked ? 'public' : 'private')
          }
          thumbIcon={visibility === 'public' ? <MdPublic /> : <MdPublicOff />}
        />
      </div>
    </Tooltip>
  );
};

export default Visibility;
