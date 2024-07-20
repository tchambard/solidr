import { useRecoilValue } from 'recoil';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';

import PageTitleWrapper from '@/components/PageTitleWrapper';
import { sessionCurrentState } from '@/store/sessions';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import AddressAvatar from '@/components/AddressAvatar';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import SessionRefundsDialog from '@/content/solidr/components/detail/SessionRefundsDialog';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';

export default () => {
    const theme = useTheme();

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
                <Grid container justifyContent={'space-between'} alignItems={'center'}>
                    <Grid item>
                        <Typography variant={'h3'} component={'h3'} gutterBottom>
                            Refunds
                        </Typography>
                    </Grid>
                    <Grid item>
                        {haveRefunds && (
                            <Button variant="contained" color={'success'} onClick={() => setDisplayRefundDialog(true)}>
                                Refund my friends
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </PageTitleWrapper>

            <Divider variant={'middle'} />

            {sessionCurrent.transfers.length > 0 ? (
                <>
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {sessionCurrent?.transfers.map((transfer) => {
                            return (
                                <ListItem key={`transfer_${transfer.from.toString()}_${transfer.to.toString()}`}>
                                    <Tooltip title={transfer.from.toString()}>
                                        <ListItemAvatar>
                                            <AddressAvatar address={transfer.from.toString()} />
                                        </ListItemAvatar>
                                    </Tooltip>
                                    <ListItemText primary={sessionCurrent.members[transfer.from.toString()].name} />
                                    <ListItemText primary={`owes ${transfer.amount}$ to`} />
                                    <Tooltip title={transfer.to.toString()}>
                                        <ListItemAvatar>
                                            <AddressAvatar address={transfer.to.toString()} />
                                        </ListItemAvatar>
                                    </Tooltip>
                                    <ListItemText primary={sessionCurrent.members[transfer.to.toString()].name} />
                                </ListItem>
                            );
                        })}
                    </List>
                </>
            ) : (
                <Typography variant="body1" align="center" mt={2} pb={2}>
                    Refunds will be available as soon as costs become unbalanced
                </Typography>
            )}
            {displayRefundDialog && <SessionRefundsDialog dialogVisible={displayRefundDialog} setDialogVisible={setDisplayRefundDialog} />}
        </>
    );
};
