import { AvatarGroup } from '@mui/material';
import AddressAvatar from '@/components/AddressAvatar';
import React from 'react';

interface IProps {
    addresses: string[];
    size?: number;
}

export default ({ addresses, size }: IProps) => {
    return <AvatarGroup max={4}>{addresses?.map((address) => <AddressAvatar key={`expense_owner_avatar_${address}`} address={address} size={size || 30} />)}</AvatarGroup>;
};
