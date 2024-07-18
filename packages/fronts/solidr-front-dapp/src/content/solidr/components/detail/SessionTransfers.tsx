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

export default () => {
    const theme = useTheme();

    const sessionCurrent = useRecoilValue(sessionCurrentState);

    return (
        <>
            <PageTitleWrapper>
                <Grid container justifyContent={'space-between'} alignItems={'center'}>
                    <Grid item>
                        <Typography variant={'h3'} component={'h3'} gutterBottom>
                            Transfers
                        </Typography>
                    </Grid>
                </Grid>
            </PageTitleWrapper>

            <Divider variant={'middle'} />

            {sessionCurrent.transfers.length > 0 ? (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {sessionCurrent?.transfers.map((transfer) => {
                        return (
                            <ListItem key={`transfer_${transfer.from.toString()}_${transfer.to.toString()}`}>
                                <Tooltip title={transfer.from.toString()}>
                                    <ListItemAvatar>
                                        <AddressAvatar address={transfer.from.toString()} />
                                    </ListItemAvatar>
                                </Tooltip>
                                <Tooltip title={transfer.to.toString()}>
                                    <ListItemAvatar>
                                        <AddressAvatar address={transfer.from.toString()} />
                                    </ListItemAvatar>
                                </Tooltip>
                                <ListItemText primary={transfer.amount} />
                            </ListItem>
                        );
                    })}
                </List>
            ) : (
                <Typography variant="body1" align="center" mt={4}>
                    No transfers to display.
                </Typography>
            )}
        </>
    );
};