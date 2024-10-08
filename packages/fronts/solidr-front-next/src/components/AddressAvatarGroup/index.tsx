import React from 'react';
import AddressAvatar from '@/components/AddressAvatar';

interface IProps {
    addresses: string[];
    size?: number;
}

export default ({ addresses, size }: IProps) => {
    const maxAvatars = 4;

    return (
        <div className="flex -space-x-3">
            {addresses.slice(0, maxAvatars).map((address) => (
                <AddressAvatar
                    key={`expense_owner_avatar_${address}`}
                    address={address}
                    size={size || 30}
                />
            ))}
            {addresses.length > maxAvatars && (
                <div
                    className={`flex items-center justify-center rounded-full bg-zinc-300 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200`}
                    style={{ width: size || 30, height: size || 30, fontSize: `${(size || 30) / 2}px` }}
                >
                    +{addresses.length - maxAvatars}
                </div>
            )}
        </div>
    );
};
