import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import Header from '@/components/Header';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
});

export const metadata: Metadata = {
    title: 'Arc Prediction Market | Trade on Real-World Events',
    description: 'Decentralized prediction market on Arc Testnet. Trade YES/NO shares on real-world events using testnet USDC.',
    keywords: ['prediction market', 'arc testnet', 'defi', 'web3', 'blockchain'],
    openGraph: {
        title: 'Arc Prediction Market',
        description: 'Trade on real-world events with testnet USDC',
        type: 'website',
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${outfit.variable} antialiased`} suppressHydrationWarning>
                <Providers>
                    <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1">
                            {children}
                        </main>
                        <footer className="border-t border-dark-border py-8 mt-auto">
                            <div className="container-mobile">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-dark-muted">
                                    <p>© 2025 Arc Prediction Market. Testnet only.</p>
                                    <div className="flex gap-6">
                                        <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                                            Explorer
                                        </a>
                                        <a href={process.env.NEXT_PUBLIC_DOCS_URL || '#'} className="hover:text-primary-400 transition-colors">
                                            Docs
                                        </a>
                                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                                            GitHub
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </footer>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
