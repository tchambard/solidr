import { useRecoilValue } from 'recoil';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';

import PageTitleWrapper from '@/components/PageTitleWrapper';
import { sessionCurrentState } from '@/store/sessions';
import * as _ from 'lodash';
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
                            Balances
                        </Typography>
                    </Grid>
                </Grid>
            </PageTitleWrapper>

            <Divider variant={'middle'} />

            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {_.map(sessionCurrent.balances, (owner, address) => (
                    <ListItem key={`voter_${address}`}>
                        <Tooltip title={address}>
                            <ListItemAvatar>
                                <AddressAvatar address={address} />
                            </ListItemAvatar>
                        </Tooltip>
                        <ListItemText primary={sessionCurrent.members[owner.owner.toString()].name} />
                        <ListItemText primary={owner.balance} />
                    </ListItem>
                ))}
            </List>
        </>
    );
};
