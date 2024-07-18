import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SessionCreateDialog from '@/content/solidr/components/list/SessionCreateDialog';

export default () => {
    const [createDialogVisible, setCreateDialogVisible] = useState(false);

    return (
        <>
            <Tooltip placement={'bottom'} title={'Create new session'}>
                <IconButton color={'primary'} onClick={() => setCreateDialogVisible(!createDialogVisible)}>
                    <AddCircleIcon />
                </IconButton>
            </Tooltip>
            {createDialogVisible && <SessionCreateDialog dialogVisible={createDialogVisible} setDialogVisible={setCreateDialogVisible} />}
        </>
    );
};
