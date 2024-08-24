import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Inter } from "next/font/google";

import "./globals.css";
import SolanaWalletProvider from '@/providers/solana/SolanaWalletProvider';
import DefaultHeader from '@/app/layout/Header';
import DefaultFooter from '@/app/layout/Footer';
import RecoilContextProvider from '@/providers/recoil/RecoilProvider';
import { MyThemeProvider } from '@/providers/theme/ThemeProvider';
import Content from './layout/Content';
import { getFormats } from '@/services/i18n/locale';
import { Author, IconDescriptor, ThemeColorDescriptor } from 'next/dist/lib/metadata/types/metadata-types';
// import { Author, IconDescriptor, ThemeColorDescriptor } from 'next/dist/lib/metadata/types/metadata-types';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SolidR",
    description: "The decentralized application for simple sharing expenses.",
    generator: "Next.js",
    manifest: "/manifest.json",
    keywords: ["solidr", "sharing expenses", "solana"],
    authors: [
        {
            name: "Teddy Chambard",
            url: "https://www.linkedin.com/in/teddy-chambard/",
        },
    ],
    icons: [
        { rel: "apple-touch-icon", url: "/favicon.svg" },
        { rel: "icon", url: "/favicon.svg" },
    ],
};

export const viewport: Viewport = {
    minimumScale: 1,
    initialScale: 1,
    width: 'device-width',
    viewportFit: 'cover',
    themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#1e1e1e" }],
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const messages = await getMessages();
    const formats = await getFormats();

    return (
        <html lang={locale} className={`${inter.className} dark`}>
            <head>
                <title>{metadata.title?.toString()}</title>
                <meta name="description" content={metadata.description?.toString()} />
                <meta name="generator" content={metadata.generator?.toString()} />
                <link rel="manifest" href={metadata.manifest?.toString()} />
                <meta name="keywords" content={(metadata.keywords as string[])?.join(", ")} />
                {(metadata.authors as Author[])?.map(({ name, url }, index) => (
                    <meta key={index} name="author" content={name} {...(url && { href: url })} />
                ))}
                {(metadata.icons as IconDescriptor[])?.map(({ rel, url }, index) => (
                    <link key={index} rel={rel} href={url as string} />
                ))}
                <meta property="og:image" content="/logo.png" />
                <meta property="og:site_name" content={metadata.title as string} />
                <meta property="og:title" content={metadata.title as string} />
                <meta property="og:description" content={metadata.description as string} />
                <meta property="og:url" content="https://solidr.vercel.app" />
            </head>
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
