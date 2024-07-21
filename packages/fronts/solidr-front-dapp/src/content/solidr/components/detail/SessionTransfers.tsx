import { useRecoilValue } from 'recoil';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import PageTitleWrapper from '@/components/PageTitleWrapper';
import { sessionCurrentState } from '@/store/sessions';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import AddressAvatar from '@/components/AddressAvatar';
import List from '@mui/material/List';
import { Avatar, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import SessionRefundsDialog from '@/content/solidr/components/detail/SessionRefundsDialog';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';
import { useTranslation } from 'react-i18next';
import { KeyboardDoubleArrowRight } from '@mui/icons-material';

export default () => {
    const { t } = useTranslation();

    const anchorWallet = useAnchorWallet() as Wallet;
    const sessionCurrent = useRecoilValue(sessionCurrentState);
    const [displayRefundDialog, setDisplayRefundDialog] = useState(false);
    const [haveRefunds, setHaveRefunds] = useState(false);

    useEffect(() => {
        if (!sessionCurrent) return;
        setHaveRefunds(sessionCurrent.transfers.filter((transfer) => transfer.from.toString() == anchorWallet.publicKey.toString()).length > 0);
    }, [sessionCurrent.transfers]);

    return (
        <>
            <PageTitleWrapper>
                <Grid container justifyContent={'space-between'} alignItems={'center'} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    <Grid item>
                        <Typography variant={'h5'} component={'h5'} gutterBottom>
                            {t('session.transfers.title')}
                        </Typography>
                    </Grid>
                    <Grid item>
                        {haveRefunds && (
                            <Button variant="contained" color={'success'} onClick={() => setDisplayRefundDialog(true)}>
                                {t('session.transfers.button.title')}
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </PageTitleWrapper>

            <Divider variant={'middle'} />

            {sessionCurrent.transfers.length > 0 ? (
                <>
                    <List sx={{ width: '100%' }}>
                        {sessionCurrent?.transfers.map((transfer, idx) => {
                            return (
                                <>
                                    <ListItem key={`transfer_${idx}`}>
                                        <Grid container alignItems="center" justifyContent={'space-between'} columns={5}>
                                            <Grid item xs={1} alignItems="flex-end">
                                                <Tooltip title={transfer.from.toString()}>
                                                    <ListItemAvatar>
                                                        <AddressAvatar address={transfer.from.toString()} />
                                                    </ListItemAvatar>
                                                </Tooltip>
                                                <Typography variant="body1" component="div" mt={2} pb={2}>
                                                    {sessionCurrent.members[transfer.from.toString()].name}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3} alignItems="center" container direction="column">
                                                <Grid item xs>
                                                    <Typography variant="caption" mt={2} pb={2}>
                                                        {t('session.transfers.item.label.owes')}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs>
                                                    <Avatar
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            bgcolor: '#ffffff',
                                                            color: 'rgb(66, 66, 66)',
                                                            fontSize: '12px',
                                                            marginLeft: '6px !important',
                                                        }}
                                                    >
                                                        <KeyboardDoubleArrowRight />
                                                    </Avatar>
                                                </Grid>
                                                <Grid item xs>
                                                    <Typography variant="h6" mt={2} pb={2}>
                                                        {transfer.amount}$
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <Tooltip title={transfer.to.toString()}>
                                                    <ListItemAvatar>
                                                        <AddressAvatar address={transfer.to.toString()} />
                                                    </ListItemAvatar>
                                                </Tooltip>
                                                <Typography variant="body1" mt={2} pb={2}>
                                                    {sessionCurrent.members[transfer.to.toString()].name}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <Divider variant={'middle'} />
                                </>
                            );
                        })}
                    </List>
                </>
            ) : (
                <Typography variant="body1" align="center" mt={2} pb={2}>
                    {t('session.transfers.list.empty.message')}
                </Typography>
            )}
            {displayRefundDialog && <SessionRefundsDialog dialogVisible={displayRefundDialog} setDialogVisible={setDisplayRefundDialog} />}
        </>
    );
};
