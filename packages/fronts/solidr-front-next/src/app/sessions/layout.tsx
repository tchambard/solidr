import { SolidrClientProvider } from '@/providers/solidr/SolidrClientProvider';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SolidrClientProvider>
            {children}
        </SolidrClientProvider>
    );
}
