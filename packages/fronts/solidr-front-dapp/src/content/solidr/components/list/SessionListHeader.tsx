import React from 'react';
import { useState } from 'react';
import { Grid, IconButton, Tooltip, Typography } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import SessionCreateDialog from './SessionCreateDialog';
import { useTranslation } from 'react-i18next';

export default () => {
    const { t } = useTranslation();

    const [createDialogVisible, setCreateDialogVisible] = useState(false);

    return (
        <>
            <Grid container justifyContent={'space-between'} alignItems={'center'}>
                <Grid item>
                    <Typography variant={'h5'} component={'h5'} gutterBottom>
                        {t('sessions.list.title')}
                    </Typography>
                </Grid>
                <Grid item>
                    <Tooltip placement={'bottom'} title={t('sessions.create.new')}>
                        <IconButton
                            color={'primary'}
                            onClick={() => setCreateDialogVisible(!createDialogVisible)}
                        >
                            <AddCircleIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
            {createDialogVisible && (
                <SessionCreateDialog
                    dialogVisible={createDialogVisible}
                    setDialogVisible={setCreateDialogVisible}
                />
            )}
        </>
    );
};
