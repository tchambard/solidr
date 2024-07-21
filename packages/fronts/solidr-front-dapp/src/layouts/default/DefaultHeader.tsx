import React from 'react';
import { Box, Container, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useNavigate } from 'react-router';

import ColorModeChanger from '@/components/theme/ColorModeChanger';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function DefaultHeader() {
    const navigate = useNavigate();
    const { connection } = useConnection();
    const theme = useTheme();
    const xsDisplay = useMediaQuery(theme.breakpoints.down('sm'));
    const { publicKey } = useWallet();

    const [solanaBalance, setSolanaBalance] = useState<number | null>(null);

    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then((balance) => setSolanaBalance(balance / LAMPORTS_PER_SOL));
        } else {
            setSolanaBalance(null);
        }
    }, [publicKey]);

    return (
        <>
            <Container maxWidth="lg">
                <Toolbar>
                    {
                        <Box
                            onClick={() => {
                                navigate('/');
                            }}
                            pt={'0.3em'}
                            style={{ cursor: 'pointer' }}
                        >
                            <LazyLoadImage
                                width="36"
                                height="36"
                                src={'/logo.png'}
                                alt="Logo"
                                effect="opacity"
                            />
                        </Box>
                    }

                    <div style={{ flexGrow: 1 }} />

                    <>
                        <LanguageSwitcher />
                        <ColorModeChanger />
                    </>
                    {!xsDisplay && (
                        <>
                            <div>
                                {solanaBalance !== null && (
                                    <div>
                                        <p>{solanaBalance} SOL</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <Box pl={2}>
                        <WalletMultiButton />
                    </Box>
                </Toolbar>
            </Container>
        </>
    );
}
