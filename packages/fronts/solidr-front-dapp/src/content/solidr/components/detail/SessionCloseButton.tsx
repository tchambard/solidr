import { Button, Chip } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { sessionCurrentState } from '@/store/sessions';
import React, { useState } from 'react';
import { SessionStatus } from '@solidr';
import SessionCloseDialog from '@/content/solidr/components/detail/SessionCloseDialog';

export default () => {
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const [confirmVisibility, setConfirmVisibility] = useState<boolean>(false);

    return (
        <>
            {sessionCurrent.session?.status == SessionStatus.Opened ? (
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                        setConfirmVisibility(true);
                    }}
                >
                    Close session
                </Button>
            ) : (
                <Chip label="Session Closed" color="error" variant="outlined" />
            )}
            {confirmVisibility && <SessionCloseDialog sessionId={sessionCurrent.session.sessionId} dialogVisible={confirmVisibility} setDialogVisible={setConfirmVisibility} />}
        </>
    );
};
