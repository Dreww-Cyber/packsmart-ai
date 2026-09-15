import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PackSmart AI — A smarter packing list for every journey',
  description:
    'Enter your trip details and get a personalised, editable packing checklist you can tick off before you leave.',
};

export const viewport: Viewport = {
  themeColor: '#FAF8F4',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
