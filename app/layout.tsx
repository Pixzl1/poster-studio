import type { Metadata } from 'next';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import './globals.css';

const appName = process.env.APP_NAME || 'Poster Studio';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  title: appName,
  description:
    'Create print-ready music and custom posters from your own artwork.',
  openGraph: {
    title: appName,
    description: 'Your artwork. Your poster. Ready to print.',
    images: ['/poster-studio-social.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description: 'Your artwork. Your poster. Ready to print.',
    images: ['/poster-studio-social.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
