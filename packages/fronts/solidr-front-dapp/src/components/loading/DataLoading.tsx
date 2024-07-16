import React from 'react';
import { Box, Skeleton } from '@mui/material';

export default function DataLoading() {
    return (
        <>
            <Box p={2}>
                <Skeleton height={24} width="100%" />
                <Skeleton height={24} width="90%" />
                <Skeleton height={24} width="80%" />
            </Box>
        </>
    );
}
