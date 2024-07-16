import React from 'react';
import { Container, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { colorModeState } from '@/store/colorMode';

export default function DefaultFooter() {
    const colorMode = useRecoilValue(colorModeState);
    return (
        <>
            <Container maxWidth="lg">
                <Toolbar>
                    <Typography variant="caption">
                        Alyra - Solana Foundation - ©2024
                    </Typography>
                </Toolbar>
            </Container>
        </>
    );
}
