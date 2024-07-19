import AutoGraphIcon from '@mui/icons-material/AutoGraph';

import ActionsMenu, { IActionMenuItem } from '@/components/ActionsMenu';
import React, { useState } from 'react';
import SessionCloseDialog from '@/content/solidr/components/detail/SessionCloseDialog';
import { DoDisturbOn } from '@mui/icons-material';
import { Session, SessionStatus } from '@solidr';

interface IProps {
    currentView: 'list' | 'edit' | 'detail';
    session: Session;
}

export default ({ session, currentView }: IProps) => {
    const [confirmVisibility, setConfirmVisibility] = useState<boolean>(false);

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
            onClick: () => setConfirmVisibility(true),
            color: 'primary',
            icon: <DoDisturbOn fontSize={'small'} />,
            hidden: currentView === 'detail',
        });
    }
    return (
        <>
            <ActionsMenu items={menuItems} />
            {confirmVisibility && <SessionCloseDialog sessionId={session.sessionId} dialogVisible={confirmVisibility} setDialogVisible={setConfirmVisibility} />}
        </>
    );
};
