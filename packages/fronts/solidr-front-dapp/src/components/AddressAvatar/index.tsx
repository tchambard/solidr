import { stringToColor } from '@/lib/colors';
import { Avatar } from '@mui/material';

function stringAvatar(name: string, size?: number) {
    return {
        sx: {
            width: size,
            height: size,
            bgcolor: stringToColor(name),
            fontSize: size ? size / 2 + 'px' : '20px',
        },
        children: name.substring(0, 2),
    };
}

interface IProps {
    address: string;
    size?: number;
}

export default ({ address, size }: IProps) => {
    return <Avatar {...stringAvatar(address, size)} />;
};
