import { Select, SelectItem } from '@nextui-org/react';

interface VisibilityProps {
    visibility: 'public' | 'private' | 'protected';
    setVisibility: React.Dispatch<React.SetStateAction<'public' | 'private' | 'protected'>>;
}

const Visibility: React.FC<VisibilityProps> = ({ visibility, setVisibility }) => {
    return (
        <Select
            color="primary"
            label="Visibility"
            defaultSelectedKeys={[visibility]}
            variant="bordered"
            value={visibility}
            disableAnimation
            onChange={(e) => setVisibility(e.target.value as 'public' | 'private' | 'protected')}
        >
            <SelectItem key="public" value="public">
                Public
            </SelectItem>
            <SelectItem key="private" value="private">
                Private
            </SelectItem>
        </Select>
    );
};

export default Visibility;