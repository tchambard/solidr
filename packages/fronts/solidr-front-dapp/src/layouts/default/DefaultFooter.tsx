import { Container, Toolbar, Typography, Box, IconButton } from '@mui/material';

export default function DefaultFooter() {
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
