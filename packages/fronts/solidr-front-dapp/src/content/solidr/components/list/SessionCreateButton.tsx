import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SessionCreateDialog from '@/content/solidr/components/list/SessionCreateDialog';
import { useTranslation } from 'react-i18next';

export default () => {

    const { t } = useTranslation();

    const [createDialogVisible, setCreateDialogVisible] = useState(false);

    return (
        <>
            <Tooltip placement={'bottom'} title={t('sessions.create.new')}>
                <IconButton color={'primary'} onClick={() => setCreateDialogVisible(!createDialogVisible)}>
                    <AddCircleIcon />
                </IconButton>
            </Tooltip>
            {createDialogVisible && <SessionCreateDialog dialogVisible={createDialogVisible} setDialogVisible={setCreateDialogVisible} />}
        </>
    );
};
