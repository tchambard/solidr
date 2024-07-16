import { Program } from '@coral-xyz/anchor';
import {
    Alert,
    Box,
    CircularProgress,
    Container,
    Paper,
    Snackbar,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ReactNode, useEffect } from 'react';

import { connection, txState, solidrClientState } from '@/store/wallet';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Solidr, SolidrClient } from '@solidr';
import idl from '@solidr-idl';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useSetRecoilState } from 'recoil';

interface IWalletContainerWrapperProps {
    children?: ReactNode;
}

export default ({ children }: IWalletContainerWrapperProps) => {
    const theme = useTheme();
    const xsDisplay = useMediaQuery(theme.breakpoints.down('sm'));
    const { t } = useTranslation(['translation']);
    const { publicKey } = useWallet();
    const [tx, setTx] = useRecoilState(txState);
    const setSolidrClient = useSetRecoilState(solidrClientState);

    useEffect(() => {
        const program = new Program<Solidr>(idl as Solidr, { connection });

        setSolidrClient(
            new SolidrClient(
                program,
                { skipPreflight: false },
                async (fn): Promise<any> => {
                    try {
                        setTx({ pending: true });
                        const res = await fn();
                        setTx({ pending: false });
                        return res;
                    } catch (e: any) {
                        console.log('e :>> ', e);
                        setTx({
                            pending: false,
                            error: e?.transactionMessage || e?.message || 'Unknown error',
                        });
                    }
                },
            ),
        );
    }, []);

    if (!publicKey) {
        return (
            <>
                <Container maxWidth="sm">
                    <Box py={8}>
                        <Paper>
                            <Box px={xsDisplay ? 4 : 6} py={6}>
                                <Typography variant="h3">{t('pleaseConnect')}</Typography>
                                <Box pt={6}>
                                    <WalletMultiButton />
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Container>
            </>
        );
    }

    const handleCloseErrorSnack = (
        event?: React.SyntheticEvent | Event,
        reason?: string,
    ) => {
        setTx({ pending: false, error: undefined });
    };

    return (
        <>
            <Container sx={{ mt: 3, minHeight: '1024px' }} maxWidth="xl">
                {children}

                <Snackbar open={tx.error != null} onClose={handleCloseErrorSnack}>
                    <Alert
                        severity={'error'}
                        sx={{ width: '100%', color: 'red' }}
                        onClose={handleCloseErrorSnack}
                    >
                        {tx.error}
                    </Alert>
                </Snackbar>

                <Snackbar open={tx.pending}>
                    <Alert severity={'info'} sx={{ width: '100%' }}>
                        <CircularProgress size={16} disableShrink thickness={3} />
                        Transaction pending
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};
