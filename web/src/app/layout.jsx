import '@/src/index.css';
import '@/src/styles/theme.css';
import 'katex/dist/katex.min.css';
import '@/src/views/MaintenancePage.css';
import '@/src/views/LandingPage.css';
import '@/src/views/MarxBotPage.css';
import '@/src/components/KoFiButton.css';
import '@/src/components/WorldSim/worldsim.css';
import '@/src/components/visualizations/EnhancedChart.css';
import '@/src/components/visualizations/SplitView.css';
import '@/src/components/visualizations/StockMarketCrash.css';
import '@/src/components/visualizations/WhatIfAnalysis.css';
import '@/src/components/visualizations/DynamicBackground.css';
import Providers from './providers.jsx';

const description =
  'An independent collective dedicated to the critique of political economy and the renaissance of genuine Marxist analysis.';

export const metadata = {
  metadataBase: new URL('https://www.marxist.info'),
  title: 'The Marxist Research Collective',
  description,
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.marxist.info/',
    title: 'The Marxist Research Collective',
    description,
    images: ['https://www.marxist.info/marx.png'],
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://www.marxist.info/',
    title: 'The Marxist Research Collective',
    description,
    images: ['https://www.marxist.info/marx.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
