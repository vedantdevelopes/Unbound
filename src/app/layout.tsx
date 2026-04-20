import type { Metadata } from 'next';
import { Inter, Playfair_Display, Instrument_Serif, Outfit, Geist_Mono, Dancing_Script } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const instrument = Instrument_Serif({ weight: '400', style: 'italic', subsets: ['latin'], variable: '--font-instrument' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });
const dancingScript = Dancing_Script({ subsets: ['latin'], variable: '--font-cursive' });

export const metadata: Metadata = {
  title: 'Unbound | Stories for every moment',
  description: 'Create a private digital book and share it with one link.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${instrument.variable} ${outfit.variable} ${geistMono.variable} ${dancingScript.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
