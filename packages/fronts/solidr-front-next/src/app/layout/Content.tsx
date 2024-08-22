"use client";

import { SnackbarProvider } from 'notistack';

export default function Content({ children }: { children: React.ReactNode }) {

    return (
        <SnackbarProvider
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
        >
            {children}
        </SnackbarProvider>
    );
}
