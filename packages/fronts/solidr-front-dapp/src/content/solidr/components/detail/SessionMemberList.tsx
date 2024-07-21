import * as _ from 'lodash';
import React, { useState } from 'react';
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
import { SessionMember, SessionStatus } from '@solidr';
import SessionInviteMemberDialog from './SessionInviteMemberDialog';
import SessionBalance from '@/content/solidr/components/detail/SessionBalance';
import SessionEditMemberDialog from '@/content/solidr/components/detail/SessionEditMemberDialog';
import { useWallet } from '@solana/wallet-adapter-react';
import { Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default () => {

    const { t } = useTranslation();

    const wallet = useWallet();
    const [addMemberDialogVisible, setAddMemberDialogVisible] = useState(false);
    const [inviteMemberDialogVisible, setInviteMemberDialogVisible] = useState(false);
    const [editExpenseDialogVisible, setEditExpenseDialogVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<SessionMember>(undefined);
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const handleMemberClick = (member: SessionMember) => {
        if (wallet.publicKey.toString() != member.addr.toString() && !sessionCurrent.isAdmin) {
            return;
        }

        setSelectedMember(member);
        setEditExpenseDialogVisible(true);
    };

    return (
        <>
            <PageTitleWrapper>
                <Grid container justifyContent={'space-between'} alignItems={'center'} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    <Grid item>
                        <Typography variant={'h5'} component={'h5'} gutterBottom>
                            {t('session.members.list.title')}
                        </Typography>
                    </Grid>
                    <Grid item>
                        {sessionCurrent.isAdmin && sessionCurrent.session?.status === SessionStatus.Opened && (
                            <>
                                <Tooltip placement={'bottom'} title={t('session.members.action.add')}>
                                    <IconButton color={'primary'} onClick={() => setAddMemberDialogVisible(!addMemberDialogVisible)}>
                                        <AddCircleIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip placement={'bottom'} title={t('session.members.action.invite')}>
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
                    <List sx={{ width: '100%' }}>
                        {_.map(sessionCurrent.members, (member, address) => {
                            return (
                                <ListItem key={`member_${address}`}>
                                    <Tooltip title={address}>
                                        <ListItemAvatar>
                                            <AddressAvatar address={address} />
                                        </ListItemAvatar>
                                    </Tooltip>
                                    {wallet.publicKey.toString() == member.addr.toString() || sessionCurrent.isAdmin ? (
                                        <>
                                            <ListItemText
                                                primary={member.name}
                                            />
                                            <IconButton color={'primary'} onClick={() => handleMemberClick(member)}>
                                                <Edit fontSize={'small'} />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <ListItemText primary={member.name} />
                                    )}
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
            {editExpenseDialogVisible && (
                <SessionEditMemberDialog member={selectedMember} dialogVisible={editExpenseDialogVisible} setDialogVisible={setEditExpenseDialogVisible} />
            )}
        </>
    );
};
