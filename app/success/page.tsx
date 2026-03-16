'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const C = {
  primary: '#1B2A4A',
  accent: '#2E86AB',
  white: '#FFFFFF',
  lightBg: '#F8FAFC',
  success: '#27AE60',
};

function SuccessContent() {
  const params = useSearchParams();
  const ref = params.get('ref');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.lightBg, padding: 24 }}>
      <div style={{ background: C.white, borderRadius: 16, padding: 48, maxWidth: 500, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>&#x2705;</div>
        <h1 style={{ color: C.primary, margin: '0 0 12px', fontSize: 28, fontWeight: 700 }}>Pagamento Confirmado!</h1>
        <p style={{ color: '#555', margin: '0 0 24px', fontSize: 16, lineHeight: 1.6 }}>
          Obrigado pela sua encomenda. O pagamento foi processado com sucesso.
        </p>
        {ref && (
          <div style={{ background: C.lightBg, borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#999' }}>Referência da encomenda</p>
            <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, color: C.primary, fontFamily: 'monospace', letterSpacing: 2 }}>{ref}</p>
          </div>
        )}
        <div style={{ background: '#D5F5E3', borderRadius: 8, padding: 16, marginBottom: 24, border: '1px solid #A9DFBF' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#1E8449' }}>
            <strong>Próximos passos:</strong> Iremos analisar o seu pedido. Após confirmação, a produção inicia em 5 dias úteis.
          </p>
        </div>
        <a href="/" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: C.white, textDecoration: 'none', fontSize: 15, fontWeight: 700 }}>
          Voltar ao site
        </a>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A carregar...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
