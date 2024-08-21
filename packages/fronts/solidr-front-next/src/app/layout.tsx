import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import "./globals.css";
import SolanaWalletProvider from '@/providers/solana/SolanaWalletProvider';
import DefaultHeader from '@/app/layout/Header';
import DefaultFooter from '@/app/layout/Footer';
import RecoilContextProvider from '@/providers/recoil/RecoilProvider';
import { MyThemeProvider } from '@/providers/theme/ThemeProvider';
import Content from './layout/Content';
import { getFormats } from '@/services/i18n/locale';

export const metadata: Metadata = {
    title: "SolidR dApp",
    description: "",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const messages = await getMessages();
    const formats = await getFormats();

    return (
        <html lang={locale} className="dark">
            <body suppressHydrationWarning={true} className="bg-lightbg text-black dark:bg-darkbg dark:text-white">
                <RecoilContextProvider>
                    <MyThemeProvider>
                        <NextIntlClientProvider locale={locale} messages={messages} formats={formats}>
                            <Content>
                                <SolanaWalletProvider>
                                    <header>
                                        <DefaultHeader />
                                    </header>
                                    <main
                                        id="page-component"
                                        className="break-words min-h-[calc(100vh-112px)] py-4"
                                    >
                                        {children}
                                    </main>
                                    <footer>
                                        <DefaultFooter />
                                    </footer>
                                </SolanaWalletProvider>
                            </Content>
                        </NextIntlClientProvider>
                    </MyThemeProvider>
                </RecoilContextProvider>
            </body>
        </html>
    );
}
