import { Button, Chip } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { sessionCurrentState } from '@/store/sessions';
import React, { useState } from 'react';
import { SessionStatus } from '@solidr';
import SessionCloseDialog from '@/content/solidr/components/detail/SessionCloseDialog';
import { useTranslation } from 'react-i18next';

export default () => {

    const { t } = useTranslation();

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
                    {t('session.close.button.title')}
                </Button>
            ) : (
                <Chip label="Session Closed" color="error" variant="outlined" />
            )}
            {confirmVisibility && <SessionCloseDialog sessionId={sessionCurrent.session.sessionId} dialogVisible={confirmVisibility} setDialogVisible={setConfirmVisibility} />}
        </>
    );
};
