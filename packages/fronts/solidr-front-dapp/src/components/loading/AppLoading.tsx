import React from 'react';
import { Box, Grid, CircularProgress, Typography } from '@mui/material';

export default function AppLoading() {
    return (
        <>
            <Box height="100vh">
                <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                    height="92vh"
                >
                    <Grid item xs>
                        <Typography align="center">
                            <CircularProgress size={24} />
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}
