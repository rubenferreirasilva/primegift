import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PrimeGift — A Sua Marca em Cada Copo',
  description: 'Personalização de copos de plástico reutilizáveis. Tampografia e serigrafia. Mínimo 25 unidades. Entrega em 5-10 dias.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif", color: '#2C3E50', background: '#fff' }}>
        {children}
      </body>
    </html>
  );
}
