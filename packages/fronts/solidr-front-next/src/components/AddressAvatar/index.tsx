import { stringToColor } from '@/services/colors';

function stringAvatar(name: string, size?: number, marginLeft?: string) {
    const backgroundColor = stringToColor(name);
    const fontSize = size ? `${size / 2}px` : '20px';
    const widthHeight = size ? `${size}px` : '40px';

    return {
        style: {
            backgroundColor,
            fontSize,
            width: widthHeight,
            height: widthHeight,
            marginLeft: marginLeft || '0',
        },
        children: name.substring(0, 2).toUpperCase(),
    };
}

interface IProps {
    address: string;
    size?: number;
    marginLeft?: string;
}

export default function AddressAvatar({ address, size, marginLeft }: IProps) {
    const avatarProps = stringAvatar(address, size, marginLeft);

    return (
        <div
            className="flex items-center justify-center rounded-full text-white font-bold"
            style={avatarProps.style}
        >
            {avatarProps.children}
        </div>
    );
}
