import * as _ from 'lodash';
import { useState } from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SendIcon from '@mui/icons-material/Send';

import SessionAddMemberDialog from './SessionAddMemberDialog';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { sessionCurrentState } from '@/store/sessions';
import { useRecoilValue } from 'recoil';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import AddressAvatar from '@/components/AddressAvatar';
import ListItemText from '@mui/material/ListItemText';
import { SessionStatus } from '@solidr';
import SessionInviteMemberDialog from './SessionInviteMemberDialog';
import SessionBalance from '@/content/solidr/components/detail/SessionBalance';

export default () => {
    const [addMemberDialogVisible, setAddMemberDialogVisible] = useState(false);
    const [inviteMemberDialogVisible, setInviteMemberDialogVisible] = useState(false);
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    return (
        <>
            <PageTitleWrapper>
                <Grid container justifyContent={'space-between'} alignItems={'center'}>
                    <Grid item>
                        <Typography variant={'h5'} component={'h5'} gutterBottom>
                            List of members
                        </Typography>
                    </Grid>
                    <Grid item>
                        {sessionCurrent.isAdmin && sessionCurrent.session?.status === SessionStatus.Opened && (
                            <>
                                <Tooltip placement={'bottom'} title={'Register new member'}>
                                    <IconButton color={'primary'} onClick={() => setAddMemberDialogVisible(!addMemberDialogVisible)}>
                                        <AddCircleIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip placement={'bottom'} title={'Invite new member'}>
                                    <IconButton color={'primary'} onClick={() => setInviteMemberDialogVisible(!inviteMemberDialogVisible)}>
                                        <SendIcon />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
                    </Grid>
                </Grid>
            </PageTitleWrapper>

            <Divider variant={'middle'} />

            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {_.map(sessionCurrent.members, (member, address) => {
                            return (
                                <ListItem key={`member_${address}`}>
                                    <Tooltip title={address}>
                                        <ListItemAvatar>
                                            <AddressAvatar address={address} />
                                        </ListItemAvatar>
                                    </Tooltip>
                                    <ListItemText primary={member.name} />
                                </ListItem>
                            );
                        })}
                    </List>
                </Grid>
                <Grid item xs={12} md={8}>
                    <SessionBalance />
                </Grid>
            </Grid>

            {addMemberDialogVisible && <SessionAddMemberDialog dialogVisible={addMemberDialogVisible} setDialogVisible={setAddMemberDialogVisible} />}
            {inviteMemberDialogVisible && <SessionInviteMemberDialog dialogVisible={inviteMemberDialogVisible} setDialogVisible={setInviteMemberDialogVisible} />}
        </>
    );
};
