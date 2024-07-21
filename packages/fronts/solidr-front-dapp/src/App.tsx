import '@/lib/i18n/config';
import { Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { enUS as dateEn } from 'date-fns/locale';
import AppLoading from '@/components/loading/AppLoading';
import { SnackbarProvider } from 'notistack';
import { makeTheme } from '@/constants/theme';
import DefaultLayout from '@/layouts/default/DefaultLayout';
import DefaultRoute from '@/routes/DefaultRoute';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { colorModeState } from '@/store/colorMode';
import SolanaWalletProvider from '@/components/provider/SolanaWalletProvider';
import { HelmetProvider } from 'react-helmet-async';
import { useLocalStorage } from '@solana/wallet-adapter-react';

function InnerApp() {
    const { i18n } = useTranslation();
    useMemo(() => i18n.language === 'en-US', [i18n]);

    const colorMode = useRecoilValue(colorModeState);
    const theme = makeTheme(colorMode);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateEn}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <SnackbarProvider
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                >
                    <HelmetProvider>
                        <SolanaWalletProvider>
                            <BrowserRouter>
                                <Routes>
                                    <Route
                                        path="*"
                                        element={
                                            <DefaultLayout>
                                                <DefaultRoute />
                                            </DefaultLayout>
                                        }
                                    />
                                </Routes>
                            </BrowserRouter>
                        </SolanaWalletProvider>
                    </HelmetProvider>
                </SnackbarProvider>
            </ThemeProvider>
        </LocalizationProvider>
    );
}

export default function App() {
    return (
        <RecoilRoot>
            <Suspense fallback={<AppLoading />}>
                <InnerApp />
            </Suspense>
        </RecoilRoot>
    );
}
