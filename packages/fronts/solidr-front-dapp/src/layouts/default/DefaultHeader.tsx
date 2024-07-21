import React from 'react';
import { Box, Container, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useNavigate } from 'react-router';

import ColorModeChanger from '@/components/theme/ColorModeChanger';

import logo from '@/assets/img/logo/solana-sol-logo.svg';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getSolanaBalance } from '@/store/wallet';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function DefaultHeader() {
    const navigate = useNavigate();
    const theme = useTheme();
    const xsDisplay = useMediaQuery(theme.breakpoints.down('sm'));
    const { publicKey } = useWallet();

    const [solanaBalance, setSolanaBalance] = useState<number | null>(null);

    useEffect(() => {
        if (publicKey) {
            getSolanaBalance(publicKey.toBase58()).then((balance) =>
                setSolanaBalance(balance),
            );
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
                            style={{ cursor: 'pointer' }}
                        >
                            <LazyLoadImage
                                width="40"
                                height="40"
                                src={logo}
                                alt="Logo"
                                effect="opacity"
                            />
                        </Box>
                    }

                    <div style={{ flexGrow: 1 }} />

                    {!xsDisplay && (
                        <>
                            <LanguageSwitcher />
                            <ColorModeChanger />
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
