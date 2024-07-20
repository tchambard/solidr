import AutoGraphIcon from '@mui/icons-material/AutoGraph';

import ActionsMenu, { IActionMenuItem } from '@/components/ActionsMenu';
import React, { useState } from 'react';
import SessionCloseDialog from '@/content/solidr/components/detail/SessionCloseDialog';
import { DeleteForever, DoDisturbOn } from '@mui/icons-material';
import { Session, SessionStatus } from '@solidr';
import SessionDeleteDialog from '@/content/solidr/components/detail/SessionDeleteDialog';

interface IProps {
    currentView: 'list' | 'edit' | 'detail';
    session: Session;
}

export default ({ session, currentView }: IProps) => {
    const [confirmClose, setConfirmClose] = useState<boolean>(false);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

    const menuItems: IActionMenuItem[] = [
        {
            title: 'Details',
            description: 'View session details',
            url: `/sessions/${session.sessionId}`,
            color: 'primary',
            icon: <AutoGraphIcon fontSize={'small'} />,
            hidden: currentView === 'detail',
        },
    ];

    if (session.status == SessionStatus.Opened) {
        menuItems.push({
            title: 'Close',
            description: 'Close session',
            onClick: () => setConfirmClose(true),
            color: 'primary',
            icon: <DoDisturbOn fontSize={'small'} />,
            hidden: currentView === 'detail',
        });
    }
    if (session.status == SessionStatus.Closed) {
        menuItems.push({
            title: 'Delete',
            description: 'Delete session',
            onClick: () => setConfirmDelete(true),
            color: 'primary',
            icon: <DeleteForever fontSize={'small'} />,
            hidden: currentView === 'detail',
        });
    }
    return (
        <>
            <ActionsMenu items={menuItems} />
            {confirmClose && <SessionCloseDialog sessionId={session.sessionId} dialogVisible={confirmClose} setDialogVisible={setConfirmClose} />}
            {confirmDelete && <SessionDeleteDialog sessionId={session.sessionId} dialogVisible={confirmDelete} setDialogVisible={setConfirmDelete} />}
        </>
    );
};
