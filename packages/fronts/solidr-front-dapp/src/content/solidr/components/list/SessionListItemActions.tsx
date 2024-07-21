import AutoGraphIcon from '@mui/icons-material/AutoGraph';

import ActionsMenu, { IActionMenuItem } from '@/components/ActionsMenu';
import React, { useEffect, useState } from 'react';
import SessionCloseDialog from '@/content/solidr/components/detail/SessionCloseDialog';
import { DeleteForever, DoDisturbOn, Edit } from '@mui/icons-material';
import { Session, SessionStatus } from '@solidr';
import SessionDeleteDialog from '@/content/solidr/components/detail/SessionDeleteDialog';
import SessionUpdateDialog from '@/content/solidr/components/list/SessionUpdateDialog';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

interface IProps {
    currentView: 'list' | 'edit' | 'detail';
    session: Session;
}

export default ({ session, currentView }: IProps) => {
    const anchorWallet = useAnchorWallet();
    const [confirmClose, setConfirmClose] = useState<boolean>(false);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const [updateSessionVisibility, setUpdateSessionVisibility] = useState<boolean>(false);
    const [menuItems, setMenuItems] = useState<IActionMenuItem[]>([]);

    useEffect(() => {
        const _menuItems: IActionMenuItem[] = [
            {
                title: 'Details',
                description: 'View session details',
                url: `/sessions/${session.sessionId}`,
                color: 'primary',
                icon: <AutoGraphIcon fontSize={'small'} />,
                hidden: currentView === 'detail',
            },
        ];

        if (session.admin.toString() === anchorWallet.publicKey.toString()) {
            if (session.status == SessionStatus.Opened) {
                _menuItems.push({
                    title: 'Close',
                    description: 'Close session',
                    onClick: () => setConfirmClose(true),
                    color: 'primary',
                    icon: <DoDisturbOn fontSize={'small'} />,
                });
                _menuItems.push({
                    title: 'Edit',
                    description: 'Edit session',
                    onClick: () => setUpdateSessionVisibility(true),
                    color: 'primary',
                    icon: <Edit fontSize={'small'} />,
                });
            }
            if (session.status == SessionStatus.Closed) {
                _menuItems.push({
                    title: 'Delete',
                    description: 'Delete session',
                    onClick: () => setConfirmDelete(true),
                    color: 'primary',
                    icon: <DeleteForever fontSize={'small'} />,
                });
            }
        }

        setMenuItems(_menuItems);
    }, [session]);

    return (
        <>
            <ActionsMenu items={menuItems} />
            {confirmClose && <SessionCloseDialog sessionId={session.sessionId} dialogVisible={confirmClose} setDialogVisible={setConfirmClose} />}
            {confirmDelete && <SessionDeleteDialog sessionId={session.sessionId} dialogVisible={confirmDelete} setDialogVisible={setConfirmDelete} />}
            {updateSessionVisibility && <SessionUpdateDialog session={session} dialogVisible={updateSessionVisibility} setDialogVisible={setUpdateSessionVisibility} />}
        </>
    );
};
