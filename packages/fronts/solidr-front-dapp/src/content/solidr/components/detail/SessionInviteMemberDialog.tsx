import React, { useEffect } from 'react';
import { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { solidrClientState } from '@/store/wallet';
import { useRecoilValue } from 'recoil';
import { useAnchorWallet, useLocalStorage } from '@solana/wallet-adapter-react';
import { BN, Wallet } from '@coral-xyz/anchor';
import { sessionCurrentState } from '@/store/sessions';
import QRCode from 'qrcode.react';

interface IInviteMemberDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default ({ dialogVisible, setDialogVisible }: IInviteMemberDialogProps) => {
    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useRecoilValue(solidrClientState);
    const sessionCurrent = useRecoilValue(sessionCurrentState);
    const [invitationToken, setInvitationToken] = useLocalStorage(`solidr.sessions.${sessionCurrent?.session?.sessionId}`, "");

    const [url, setUrl] = useState('');

    const generateUrl = () => {
        const invitationUrl = `${window.location.origin}/sessions/${sessionCurrent.session.sessionId}#token=${invitationToken}`;
        setUrl(invitationUrl);
    };

    if (!anchorWallet || !solidrClient || !sessionCurrent) return <></>;

    useEffect(() => {
        if (invitationToken) {
            generateUrl()
        }
    }, [invitationToken]);

    return (
        <Dialog
            disableEscapeKeyDown
            maxWidth={'sm'}
            aria-labelledby={'register-member-title'}
            open={dialogVisible}
        >
            <DialogTitle id={'register-member-title'}>{'Invite a new member'}</DialogTitle>
            <DialogContent dividers>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="50vh"
                    p={2}
                >
                    <Typography variant="h4" gutterBottom>
                        Share
                    </Typography>
                    {url && invitationToken && (
                        <>
                            <TextField
                                label="URL générée"
                                variant="outlined"
                                value={url}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => navigator.clipboard.writeText(url)}>
                                                <ContentCopyIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                fullWidth
                                margin="normal"
                            />
                            <Box mt={4}>
                                <QRCode value={url} size={256} />
                            </Box>
                        </>
                    )}
                    <Button onClick={() => {
                        solidrClient.generateSessionLink(anchorWallet, new BN(sessionCurrent.session.sessionId))
                            .then(({ data: { token } }) => {
                                setInvitationToken(token);
                                generateUrl();
                            });
                    }}>
                        Generate new link
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={() => setDialogVisible(false)} color={'primary'}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
