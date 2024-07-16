import React from 'react';
import { Grid, Box, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function ImageListLoading() {
    const theme = useTheme();
    return (
        <>
            <Box p={2}>
                <Box>
                    <Skeleton
                        variant="rectangular"
                        height={208}
                        width="100%"
                        sx={{
                            borderRadius: `${theme.shape.borderRadius}px`,
                        }}
                    />
                </Box>
            </Box>
        </>
    );
}
