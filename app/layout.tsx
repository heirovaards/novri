import type { Metadata } from 'next';
import { Source_Sans_3, Source_Code_Pro } from 'next/font/google';
import { ToastProvider } from '@frontend/shared/components/layout/toast-provider.component';
import './globals.css';

const sans = Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans' });
const mono = Source_Code_Pro({ subsets: ['latin'], variable: '--font-source-code' });

export const metadata: Metadata = {
  title: 'LKPS · Program Studi Sistem Informasi',
  description: 'Sistem Informasi Laporan Kinerja Program Studi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
