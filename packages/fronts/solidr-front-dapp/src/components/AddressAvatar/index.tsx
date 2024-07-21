import { stringToColor } from '@/lib/colors';
import { Avatar } from '@mui/material';

function stringAvatar(name: string, size?: number, marginLeft?: string) {
    return {
        sx: {
            width: size,
            height: size,
            bgcolor: stringToColor(name),
            fontSize: size ? size / 2 + 'px' : '20px',
            marginLeft: marginLeft,
        },
        children: name.substring(0, 2),
    };
}

interface IProps {
    address: string;
    size?: number;
    marginLeft?: string;
}

export default ({ address, size, marginLeft }: IProps) => {
    return <Avatar {...stringAvatar(address, size, marginLeft)} />;
};
