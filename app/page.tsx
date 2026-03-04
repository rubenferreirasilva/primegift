'use client';
import React, { useState, useEffect, useMemo, CSSProperties } from 'react';
import dynamic from 'next/dynamic';

const CupViewer3D = dynamic(() => import('./CupViewer3D'), { ssr: false });

// ==================== DATA ====================

type Product = {
  id: string;
  name: string;
  capacity: string;
  description: string;
  weight: number;
  cupHeight: number;
  cupTopW: number;
  cupBotW: number;
  prices: Record<number, number>;
};

type CartItem = {
  itemId: string;
  productId: string;
  quantity: number;
  colors: number;
};

const PRODUCTS: Product[] = [
  { id: 'pg200', name: 'PG-200', capacity: '200ml', description: 'Café e degustação', weight: 15, cupHeight: 65, cupTopW: 50, cupBotW: 36, prices: { 25: 0.38, 50: 0.34, 100: 0.30, 250: 0.25, 500: 0.20, 1000: 0.16, 2000: 0.14, 5000: 0.12 } },
  { id: 'pg300', name: 'PG-300', capacity: '300ml', description: 'Sumos e refrigerantes', weight: 20, cupHeight: 80, cupTopW: 54, cupBotW: 38, prices: { 25: 0.42, 50: 0.38, 100: 0.33, 250: 0.28, 500: 0.23, 1000: 0.18, 2000: 0.16, 5000: 0.14 } },
  { id: 'pg330', name: 'PG-330', capacity: '330ml', description: 'Cerveja e cocktails', weight: 22, cupHeight: 88, cupTopW: 56, cupBotW: 39, prices: { 25: 0.45, 50: 0.40, 100: 0.35, 250: 0.30, 500: 0.25, 1000: 0.20, 2000: 0.17, 5000: 0.15 } },
  { id: 'pg500', name: 'PG-500', capacity: '500ml', description: 'Festivais e eventos', weight: 30, cupHeight: 105, cupTopW: 62, cupBotW: 42, prices: { 25: 0.55, 50: 0.48, 100: 0.42, 250: 0.36, 500: 0.30, 1000: 0.24, 2000: 0.21, 5000: 0.18 } },
];

const COLOR_OPTIONS = [
  { value: 1, label: '1 cor', surcharge: 0 },
  { value: 2, label: '2 cores', surcharge: 0.06 },
];

const QUANTITIES = [25, 50, 100, 250, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];

const SHIPPING_REGIONS = [
  { value: 'pt-continental', label: 'Portugal Continental' },
  { value: 'pt-islands', label: 'Ilhas (Açores e Madeira)' },
  { value: 'es-peninsular', label: 'Espanha Peninsular' },
  { value: 'eu-zone2', label: 'Europa (Zona 2)' },
  { value: 'eu-zone3', label: 'Europa (Zona 3)' },
  { value: 'international', label: 'Internacional (fora da UE)' },
];

type ShippingMethodRates = Record<number, number>;
type ShippingRegionRates = Record<string, ShippingMethodRates>;
const SHIPPING_RATES: Record<string, ShippingRegionRates> = {
  'pt-continental': {
    'next-day': { 1: 3.68, 2: 3.80, 5: 4.02, 10: 4.19, 15: 5.00, 20: 5.26, 30: 6.71 },
    '2-days': { 1: 3.43, 2: 3.60, 5: 3.82, 10: 4.15, 15: 4.60, 20: 5.20, 30: 6.58 },
    'collect': { 1: 3.19, 2: 3.36, 5: 3.58, 10: 3.91, 15: 4.36, 20: 4.96, 30: 6.34 },
  },
  'pt-islands': {
    'next-day': { 1: 10.92, 5: 18.61, 10: 29.64, 20: 47.86, 30: 70.16 },
    '2-days': { 1: 6.83, 5: 8.36, 10: 11.00, 20: 17.83, 30: 24.22 },
    'collect': { 1: 6.59, 5: 8.12, 10: 10.76, 20: 17.59, 30: 23.98 },
  },
  'es-peninsular': {
    'next-day': { 1: 4.58, 2: 4.67, 5: 5.30, 10: 6.66, 20: 10.09, 30: 14.52 },
    '2-days': { 1: 4.37, 2: 4.55, 5: 5.06, 10: 6.37, 20: 9.89, 30: 13.90 },
    'collect': { 1: 4.13, 2: 4.31, 5: 4.82, 10: 6.13, 20: 9.65, 30: 13.66 },
  },
  'eu-zone2': {
    'standard': { 0.5: 13.72, 1: 14.70, 2: 17.29, 5: 25.06, 10: 38.04, 20: 63.96, 30: 89.87 },
  },
  'eu-zone3': {
    'standard': { 0.5: 17.17, 1: 18.70, 2: 22.46, 5: 33.79, 10: 52.68, 20: 90.46, 30: 128.23 },
  },
};

const SHIPPING_METHOD_LABELS: Record<string, { label: string; days: string }> = {
  'next-day': { label: 'Entrega Amanhã', days: '1 dia útil' },
  '2-days': { label: 'Em Dois Dias', days: '2 dias úteis' },
  'collect': { label: 'Ponto Collectt', days: '2 dias úteis' },
  'standard': { label: 'Envio Standard', days: '4-7 dias úteis' },
};

const PAYMENT_METHODS = [
  { id: 'paypal', label: 'PayPal' },
  { id: 'transfer', label: 'Transferência Bancária' },
  { id: 'mbway', label: 'MB WAY' },
  { id: 'applepay', label: 'Apple Pay' },
];

// ==================== HELPERS ====================

function getUnitPrice(product: Product, quantity: number): number {
  const tiers = [25, 50, 100, 250, 500, 1000, 2000, 5000];
  let tier = 25;
  for (const t of tiers) {
    if (quantity >= t) tier = t;
  }
  return product.prices[tier];
}

function getColorSurcharge(colors: number): number {
  return COLOR_OPTIONS.find(c => c.value === colors)?.surcharge ?? 0;
}

function calculateWeightKg(product: Product, quantity: number): number {
  const cupWeight = product.weight * quantity;
  const packaging = 200 + Math.ceil(quantity / 100) * 50;
  return (cupWeight + packaging) / 1000;
}

function getShippingCost(weightKg: number, region: string, method: string): number | null {
  const rates = SHIPPING_RATES[region]?.[method];
  if (!rates) return null;
  const brackets = Object.keys(rates).map(Number).sort((a, b) => a - b);
  for (const bracket of brackets) {
    if (weightKg <= bracket) return rates[bracket];
  }
  return null;
}

function getAvailableMethods(region: string): string[] {
  return Object.keys(SHIPPING_RATES[region] || {});
}

function fmt(n: number): string {
  return n.toFixed(2).replace('.', ',') + '€';
}

function getCartSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (!product) return sum;
    return sum + (getUnitPrice(product, item.quantity) + getColorSurcharge(item.colors)) * item.quantity;
  }, 0);
}

function getCartWeight(cart: CartItem[]): number {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (!product) return sum;
    return sum + calculateWeightKg(product, item.quantity);
  }, 0);
}

// ==================== BACKGROUND REMOVAL ====================

function removeBackground(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Cap processing size for performance
      const MAX = 600;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        const scale = MAX / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject('No canvas context'); return; }

      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const total = w * h;
      const visited = new Uint8Array(total);

      // Sample edge pixels to detect background color
      const step = Math.max(1, Math.floor(Math.max(w, h) / 30));
      let rSum = 0, gSum = 0, bSum = 0, sCount = 0;
      for (let x = 0; x < w; x += step) {
        for (const row of [0, h - 1]) {
          const i = (row * w + x) * 4;
          rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2]; sCount++;
        }
      }
      for (let y = 0; y < h; y += step) {
        for (const col of [0, w - 1]) {
          const i = (y * w + col) * 4;
          rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2]; sCount++;
        }
      }
      const bgR = Math.round(rSum / sCount);
      const bgG = Math.round(gSum / sCount);
      const bgB = Math.round(bSum / sCount);

      const tolerance = 55;
      const feather = 15;
      const maxDist = tolerance + feather;
      const maxDistSq = maxDist * maxDist;
      const tolSq = tolerance * tolerance;

      // Ring buffer queue for BFS (much faster than array push/pop)
      const queue = new Int32Array(total);
      let qHead = 0, qTail = 0;

      // Seed all edge pixels
      for (let x = 0; x < w; x++) {
        queue[qTail++] = x;
        queue[qTail++] = (h - 1) * w + x;
      }
      for (let y = 1; y < h - 1; y++) {
        queue[qTail++] = y * w;
        queue[qTail++] = y * w + (w - 1);
      }

      while (qHead < qTail) {
        const pos = queue[qHead++];
        if (visited[pos]) continue;
        visited[pos] = 1;
        const idx = pos * 4;
        const dr = data[idx] - bgR;
        const dg = data[idx + 1] - bgG;
        const db = data[idx + 2] - bgB;
        const distSq = dr * dr + dg * dg + db * db;
        if (distSq > maxDistSq) continue;

        if (distSq <= tolSq) {
          data[idx + 3] = 0;
        } else {
          const dist = Math.sqrt(distSq);
          const alpha = Math.round(((dist - tolerance) / feather) * data[idx + 3]);
          data[idx + 3] = Math.min(data[idx + 3], alpha);
        }

        const x = pos % w, y = (pos - x) / w;
        if (x > 0 && !visited[pos - 1]) queue[qTail++] = pos - 1;
        if (x < w - 1 && !visited[pos + 1]) queue[qTail++] = pos + 1;
        if (y > 0 && !visited[pos - w]) queue[qTail++] = pos - w;
        if (y < h - 1 && !visited[pos + w]) queue[qTail++] = pos + w;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject('Image load failed');
    img.src = URL.createObjectURL(file);
  });
}

// ==================== EXPORT MOCKUP ====================

function exportMockupPNG(productName: string) {
  const container = document.getElementById('cup-viewer-3d');
  if (!container) return;
  const canvas = container.querySelector('canvas');
  if (!canvas) return;
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mockup-${productName}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

// ==================== COLORS & STYLES ====================

const C = {
  primary: '#1B4F72',
  accent: '#2E86C1',
  lightBg: '#EBF5FB',
  text: '#2C3E50',
  textSec: '#5D6D7E',
  textMuted: '#7F8C8D',
  success: '#27AE60',
  gold: '#F39C12',
  goldLight: '#F1C40F',
  white: '#FFFFFF',
  border: '#D5DBDB',
  cardShadow: '0 2px 12px rgba(0,0,0,0.08)',
  cardShadowHover: '0 4px 20px rgba(0,0,0,0.14)',
};

const container: CSSProperties = { maxWidth: 1200, margin: '0 auto', padding: '0 24px' };

// ==================== SVG COMPONENTS ====================

function Logo({ variant = 'dark', height = 40 }: { variant?: 'dark' | 'white'; height?: number }) {
  const src = variant === 'white' ? '/logo-white.svg' : '/logo.svg';
  return <img src={src} alt="PrimeGift" style={{ height, width: 'auto' }} />;
}

const CUP_IMAGES: Record<string, string> = {
  pg200: '/cup-200-real.png',
  pg300: '/cup-300-real.png',
  pg330: '/cup-330-real.png',
  pg500: '/cup-500-real.png',
};

function CupImage({ product, size = 120 }: { product: Product; size?: number }) {
  return (
    <img
      src={CUP_IMAGES[product.id]}
      alt={`${product.name} — ${product.capacity}`}
      style={{ height: size, width: 'auto', objectFit: 'contain' }}
    />
  );
}



function PaymentIcon({ method }: { method: string }) {
  const s = 20;
  if (method === 'paypal') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><path d="M7.5,21L8.5,15H5.5L9.5,3H16C18.5,3 20,5 19.5,7.5C19,10 16.5,12 14,12H11.5L10.5,18H7.5Z" fill="#003087" /><path d="M9.5,19L10.5,13H7.5L11.5,3H16C18,3 19,4.5 18.5,6.5C18,9 16,10.5 14,10.5H12L11,16.5H8L9.5,19Z" fill="#009cde" /></svg>
  );
  if (method === 'transfer') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke={C.primary} strokeWidth="2" /><line x1="3" y1="10" x2="21" y2="10" stroke={C.primary} strokeWidth="2" /><rect x="5" y="14" width="6" height="2" rx="1" fill={C.primary} /></svg>
  );
  if (method === 'mbway') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="2" fill="none" stroke="#E4002B" strokeWidth="2" /><circle cx="12" cy="18" r="1.5" fill="#E4002B" /><text x="12" y="13" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#E4002B">MB</text></svg>
  );
  return (
    <svg width={s} height={s} viewBox="0 0 24 24"><path d="M17,3H7A4,4 0 003,7v10a4,4 0 004,4h10a4,4 0 004-4V7A4,4 0 0017,3Z" fill="none" stroke="#000" strokeWidth="1.5" /><path d="M12,7.5A3,3 0 009,10.5c0,3 3,5 3,5s3-2 3-5A3,3 0 0012,7.5Z" fill="#000" /></svg>
  );
}

// ==================== HEADER ====================

function Header({ page, setPage }: { page: string; setPage: (p: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { id: 'home', label: 'Início' },
    { id: 'products', label: 'Produtos' },
    { id: 'how-it-works', label: 'Como Funciona' },
    { id: 'contact', label: 'Contacto' },
  ];
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => { setPage('home'); window.scrollTo(0, 0); }}>
          <Logo variant="white" height={44} />
        </div>
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setPage(item.id); setMenuOpen(false); window.scrollTo(0, 0); }}
              style={{ background: page === item.id ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none', color: C.white, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: page === item.id ? 600 : 400, transition: 'all 0.2s' }}>
              {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', color: C.white, fontSize: 24, cursor: 'pointer' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}

// ==================== HOME PAGE ====================

function HomePage({ setPage, onSelectProduct }: { setPage: (p: string) => void; onSelectProduct: (id: string) => void }) {
  return (
    <div>
      {/* Hero Banner — Split diagonal: Festival + Copo personalizado */}
      <section style={{ position: 'relative', width: '100%', minHeight: 540, overflow: 'hidden', display: 'flex' }}>
        {/* Lado esquerdo — Festival */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          clipPath: 'polygon(0 0, 62% 0, 48% 100%, 0 100%)',
        }}>
          <img
            src="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&h=800&fit=crop"
            alt="Festival de verão com pessoas e copos"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(27,79,114,0.80) 0%, rgba(27,79,114,0.55) 100%)' }} />
        </div>

        {/* Lado direito — Copo personalizado */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          clipPath: 'polygon(62% 0, 100% 0, 100% 100%, 48% 100%)',
          background: `linear-gradient(160deg, ${C.lightBg} 0%, #F0F7FC 100%)`,
        }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '52%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', textAlign: 'center', display: 'inline-block' }}>
              <img
                src="/cup-330-real.png"
                alt="Copo PG-330 personalizado"
                style={{ height: 360, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.15))', display: 'block' }}
              />
              {/* Logo simulado na área de impressão real do copo */}
              <div style={{
                position: 'absolute',
                top: '28%', left: '28%', width: '44%', height: '30%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
                overflow: 'hidden',
                borderRadius: '45% / 5%',
              }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  opacity: 0.7,
                }}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect x="4" y="4" width="32" height="32" rx="6" stroke={C.accent} strokeWidth="2.5" strokeDasharray="4 3" />
                    <circle cx="20" cy="16" r="6" stroke={C.accent} strokeWidth="2" />
                    <path d="M10 28 Q15 22 20 24 Q25 26 30 20" stroke={C.accent} strokeWidth="2" fill="none" />
                  </svg>
                  <span style={{ fontSize: 10, fontWeight: 800, color: C.accent, letterSpacing: 1.2, textTransform: 'uppercase' }}>O Seu Logo</span>
                </div>
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 14, fontWeight: 700, color: C.primary }}>PG-330 · 330ml</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: C.textMuted }}>Personalizado com a marca do seu evento</p>
            </div>
          </div>
        </div>

        {/* Conteúdo texto — lado esquerdo */}
        <div style={{ position: 'relative', zIndex: 2, width: '50%', minHeight: 540, display: 'flex', alignItems: 'center', padding: '60px 48px 60px 5%' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 16, backdropFilter: 'blur(8px)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.white, letterSpacing: 0.5 }}>Festivais · Festas · Restaurantes</span>
            </div>
            <h1 style={{ color: C.white, fontSize: 44, fontWeight: 800, margin: 0, lineHeight: 1.1, textShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
              A Sua Marca<br />em Cada Copo
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: 18, marginTop: 16, lineHeight: 1.6, maxWidth: 420, textShadow: '0 1px 6px rgba(0,0,0,0.15)' }}>
              Copos reutilizáveis personalizados com tampografia de alta qualidade. Produção própria, desde 25 unidades.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
              <button onClick={() => { setPage('products'); window.scrollTo(0, 0); }}
                style={{ background: C.white, color: C.primary, border: 'none', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', transition: 'all 0.2s' }}>
                Ver Produtos
              </button>
              <button onClick={() => { setPage('contact'); window.scrollTo(0, 0); }}
                style={{ background: 'rgba(255,255,255,0.15)', color: C.white, border: '2px solid rgba(255,255,255,0.7)', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }}>
                Pedir Orçamento
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '24px 0' }}>
        <div style={{ ...container, display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {[
            { icon: '📦', text: 'Mín. 25 un.' },
            { icon: '🎨', text: 'Até 2 cores' },
            { icon: '⚡', text: '5-10 dias' },
            { icon: '🌍', text: 'PT + ES + Int.' },
            { icon: '💳', text: '4 formas de pagamento' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ padding: '96px 24px', background: C.lightBg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.primary, margin: '0 0 12px' }}>Os Nossos Produtos</h2>
          <p style={{ textAlign: 'center', color: C.textSec, fontSize: 16, margin: '0 0 48px' }}>Copos reutilizáveis de alta qualidade, prontos para a sua marca</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {PRODUCTS.map(product => (
              <div key={product.id} onClick={() => { onSelectProduct(product.id); window.scrollTo(0, 0); }}
                style={{ background: C.white, borderRadius: 12, padding: 28, cursor: 'pointer', boxShadow: C.cardShadow, transition: 'all 0.3s', textAlign: 'center', border: `1px solid transparent` }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadowHover; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadow; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <CupImage product={product} size={100} />
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: C.primary }}>{product.name}</h3>
                <p style={{ margin: '0 0 4px', fontSize: 15, color: C.text, fontWeight: 500 }}>{product.capacity}</p>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: C.textSec }}>{product.description}</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.success }}>desde {fmt(product.prices[5000])}/un.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery: Copos em Acção */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.primary, margin: '0 0 12px' }}>Os Nossos Copos em Acção</h2>
          <p style={{ textAlign: 'center', color: C.textSec, fontSize: 16, margin: '0 0 48px' }}>Festivais, festas, restaurantes — a sua marca presente em todos os momentos</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {[
              { img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop', label: 'Festivais de Verão', desc: 'Milhares de copos personalizados em festivais por todo o país' },
              { img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop', label: 'Festas & Eventos', desc: 'Aniversários, casamentos e celebrações com a sua marca' },
              { img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop', label: 'Bares & Restaurantes', desc: 'Copos reutilizáveis que elevam a experiência do cliente' },
              { img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop', label: 'Eventos Corporativos', desc: 'Conferências e eventos de empresa com branding profissional' },
              { img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop', label: 'Eventos ao Ar Livre', desc: 'Feiras, mercados e eventos outdoor sustentáveis' },
              { img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=400&fit=crop', label: 'Cocktails & Bebidas', desc: 'Apresentação premium para cocktails e bebidas especiais' },
            ].map((item, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '3/2', boxShadow: C.cardShadow }}>
                <img src={item.img} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', padding: '40px 20px 20px' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: C.white }}>{item.label}</h4>
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USPs: Porquê a PrimeGift? */}
      <section style={{ padding: '96px 24px', background: C.lightBg }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.primary, margin: '0 0 12px' }}>Porquê a PrimeGift?</h2>
          <p style={{ textAlign: 'center', color: C.textSec, fontSize: 16, margin: '0 0 48px' }}>Razões para confiar em nós para a personalização dos seus copos</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '🏭', title: 'Produção Própria', desc: 'Controlo total da qualidade em todas as fases do processo' },
              { icon: '♻️', title: 'Reutilizáveis', desc: 'Copos ecológicos e sustentáveis, prontos para centenas de utilizações' },
              { icon: '🎨', title: 'Personalização Total', desc: 'Tampografia e serigrafia de alta definição até 4 cores Pantone' },
              { icon: '🚀', title: 'Envio Rápido', desc: 'Produção e entrega em 5-10 dias úteis para todo o território' },
              { icon: '📦', title: 'Sem Mínimos Elevados', desc: 'Encomendas a partir de apenas 25 unidades, ideal para pequenos negócios' },
              { icon: '🤝', title: 'Suporte Dedicado', desc: 'Acompanhamento personalizado do início ao fim, com maquete gratuita' },
            ].map((item, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 12, padding: 28, textAlign: 'center', boxShadow: C.cardShadow, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: C.text }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: C.textSec, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.primary, margin: '0 0 12px' }}>O Que Dizem os Nossos Clientes</h2>
          <p style={{ textAlign: 'center', color: C.textSec, fontSize: 16, margin: '0 0 48px' }}>Eventos reais, resultados reais</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { name: 'Ana Rodrigues', role: 'Festival Vilar de Mouros', quote: 'Os copos ficaram incríveis e resistiram a todo o festival. A qualidade de impressão superou as expectativas e os participantes adoraram levar como recordação.' },
              { name: 'Miguel Santos', role: 'Restaurante O Marinheiro', quote: 'Substituímos os copos descartáveis pelos reutilizáveis da PrimeGift. Os clientes elogiam constantemente e poupamos no descartável. Excelente investimento.' },
              { name: 'Carla Ferreira', role: 'Eventos Corporativos LDA', quote: 'Encomendámos para um evento de 500 pessoas e o resultado foi impecável. A maquete prévia ajudou-nos a acertar no design à primeira. Recomendo vivamente.' },
            ].map((item, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 12, padding: 28, boxShadow: C.cardShadow, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 32, color: C.accent, marginBottom: 12, lineHeight: 1 }}>&ldquo;</div>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: C.textSec, lineHeight: 1.7, flex: 1 }}>{item.quote}</p>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.text }}>{item.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: C.textMuted }}>{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`, padding: '96px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ color: C.white, fontSize: 32, fontWeight: 700, margin: '0 0 16px' }}>Pronto para personalizar os seus copos?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, margin: '0 0 32px', lineHeight: 1.6 }}>
            Comece agora e receba uma maquete digital gratuita. Sem compromisso.
          </p>
          <button onClick={() => { setPage('products'); window.scrollTo(0, 0); }}
            style={{ background: C.white, color: C.primary, border: 'none', padding: '16px 40px', borderRadius: 8, fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', transition: 'all 0.2s' }}>
            Começar Agora
          </button>
        </div>
      </section>

      {/* How It Works Preview */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.primary, margin: '0 0 48px' }}>Como Funciona</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
            {[
              { n: '1', title: 'Escolha', desc: 'Selecione o copo e a quantidade pretendida' },
              { n: '2', title: 'Upload', desc: 'Envie o logótipo ou design da sua marca' },
              { n: '3', title: 'Aprovação', desc: 'Receba e aprove a maquete digital gratuita' },
              { n: '4', title: 'Entrega', desc: 'Produção e entrega em 5-10 dias úteis' },
            ].map(step => (
              <div key={step.n} style={{ textAlign: 'center', flex: '1 1 180px', maxWidth: 200 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, margin: '0 auto 16px' }}>
                  {step.n}
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: C.text }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: C.textSec, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ==================== PRODUCTS PAGE ====================

function ProductsPage({ goToContact, initialProduct }: { goToContact: () => void; initialProduct: string | null }) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(initialProduct);
  const [quantity, setQuantity] = useState(100);
  const [colors, setColors] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [shippingRegion, setShippingRegion] = useState('pt-continental');
  const [shippingMethod, setShippingMethod] = useState('2-days');
  const [showModal, setShowModal] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [logoYOffset, setLogoYOffset] = useState(0);
  const [logoScale, setLogoScale] = useState(100);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Generate preview URL when file or autoRemoveBg changes
  useEffect(() => {
    if (!uploadedFile) {
      setLogoPreviewUrl(null);
      return;
    }
    const isImage = uploadedFile.type.startsWith('image/') || uploadedFile.name.endsWith('.svg');
    if (!isImage) {
      setLogoPreviewUrl(null);
      return;
    }
    // SVGs don't need background removal
    if (uploadedFile.name.endsWith('.svg')) {
      const url = URL.createObjectURL(uploadedFile);
      setLogoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    // If autoRemoveBg is off, show original image
    if (!autoRemoveBg) {
      const url = URL.createObjectURL(uploadedFile);
      setLogoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    // For raster images, auto-remove background
    let cancelled = false;
    setRemovingBg(true);
    removeBackground(uploadedFile)
      .then(dataUrl => {
        if (!cancelled) {
          setLogoPreviewUrl(dataUrl);
          setRemovingBg(false);
        }
      })
      .catch(() => {
        // Fallback: show original image
        if (!cancelled) {
          const url = URL.createObjectURL(uploadedFile);
          setLogoPreviewUrl(url);
          setRemovingBg(false);
        }
      });
    return () => { cancelled = true; };
  }, [uploadedFile, autoRemoveBg]);

  const product = PRODUCTS.find(p => p.id === selectedProduct) || null;

  // Cart calculations
  const cartSubtotal = getCartSubtotal(cart);
  const cartWeightKg = getCartWeight(cart);
  const overweight = cartWeightKg > 30;
  const isInternational = shippingRegion === 'international';
  const availableMethods = getAvailableMethods(shippingRegion);
  const freeShipping = cartSubtotal > 150;
  const shippingCost = (!isInternational && !overweight && cart.length > 0) ? (freeShipping ? 0 : (getShippingCost(cartWeightKg, shippingRegion, shippingMethod) ?? 0)) : 0;
  const totalBeforeVAT = cartSubtotal + shippingCost;
  const vat = totalBeforeVAT * 0.23;
  const total = totalBeforeVAT + vat;

  // Staging item price (for preview in configurator)
  const stagingUnitPrice = product ? getUnitPrice(product, quantity) + getColorSurcharge(colors) : 0;
  const stagingSubtotal = stagingUnitPrice * quantity;

  // Reset shipping method when region changes
  const handleRegionChange = (r: string) => {
    setShippingRegion(r);
    const methods = getAvailableMethods(r);
    if (methods.length > 0 && !methods.includes(shippingMethod)) {
      setShippingMethod(methods[0]);
    }
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    setCart(prev => [...prev, {
      itemId: crypto.randomUUID(),
      productId: selectedProduct,
      quantity,
      colors,
    }]);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.itemId !== itemId));
  };

  const sectionStyle: CSSProperties = { marginBottom: 32 };
  const stepTitleStyle: CSSProperties = { fontSize: 16, fontWeight: 700, color: C.primary, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 };
  const stepNumStyle: CSSProperties = { width: 28, height: 28, borderRadius: '50%', background: C.primary, color: C.white, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 };

  return (
    <div>
      <section style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ color: C.white, fontSize: 36, fontWeight: 700, margin: 0 }}>Configure a Sua Encomenda</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '8px 0 0' }}>Selecione o produto, quantidade e personalize</p>
      </section>

      <section style={{ ...container, padding: '48px 24px' }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* LEFT: Configurator */}
          <div style={{ flex: '1 1 520px', minWidth: 0 }}>
            {/* Step 1: Choose Product */}
            <div style={sectionStyle}>
              <h3 style={stepTitleStyle}><span style={stepNumStyle}>1</span> Escolha o copo</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {PRODUCTS.map(p => (
                  <div key={p.id} onClick={() => setSelectedProduct(p.id)}
                    style={{ flex: '1 1 130px', maxWidth: 160, padding: 16, borderRadius: 10, border: `2px solid ${selectedProduct === p.id ? C.accent : C.border}`, background: selectedProduct === p.id ? C.lightBg : C.white, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <CupImage product={p} size={60} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, marginTop: 8 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: C.textSec }}>{p.capacity}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{p.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Quantity & Colors */}
            <div style={sectionStyle}>
              <h3 style={stepTitleStyle}><span style={stepNumStyle}>2</span> Quantidade e cores</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>Quantidade</label>
                  <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, color: C.text, background: C.white, cursor: 'pointer' }}>
                    {QUANTITIES.map(q => (
                      <option key={q} value={q}>{q.toLocaleString('pt-PT')} unidades</option>
                    ))}
                  </select>
                  <button onClick={() => { goToContact(); }}
                    style={{ marginTop: 8, background: 'none', border: 'none', color: C.accent, fontSize: 13, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                    +10.000? Pedir orçamento personalizado
                  </button>
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>Número de cores</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {COLOR_OPTIONS.map(c => (
                      <button key={c.value} onClick={() => setColors(c.value)}
                        style={{ padding: '10px 16px', borderRadius: 8, border: `2px solid ${colors === c.value ? C.accent : C.border}`, background: colors === c.value ? C.lightBg : C.white, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: colors === c.value ? C.accent : C.text, transition: 'all 0.2s' }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Staging preview */}
              {product && (
                <div style={{ marginTop: 16, padding: 16, background: C.lightBg, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ fontSize: 14, color: C.text }}>
                    <strong>{product.name}</strong> — {quantity.toLocaleString('pt-PT')} un. — {fmt(stagingUnitPrice)}/un. = <strong>{fmt(stagingSubtotal)}</strong>
                  </div>
                  <button onClick={addToCart}
                    style={{ padding: '10px 24px', borderRadius: 8, background: C.success, color: C.white, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                    + Adicionar ao Carrinho
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: File Upload */}
            <div style={sectionStyle}>
              <h3 style={stepTitleStyle}><span style={stepNumStyle}>3</span> Envie o seu ficheiro</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ai,.eps,.png,.svg,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      alert('Ficheiro demasiado grande. Máximo 10MB.');
                      return;
                    }
                    setUploadedFile(file);
                  }
                }}
              />
              <div
                onClick={() => {
                  if (uploadedFile) {
                    setUploadedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      alert('Ficheiro demasiado grande. Máximo 10MB.');
                      return;
                    }
                    setUploadedFile(file);
                  }
                }}
                style={{ border: `2px dashed ${uploadedFile ? C.success : C.border}`, borderRadius: 12, padding: 40, textAlign: 'center', cursor: 'pointer', background: uploadedFile ? '#EAFAF1' : '#FAFAFA', transition: 'all 0.2s' }}>
                {uploadedFile ? (
                  <>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>&#x2705;</div>
                    <p style={{ margin: 0, fontWeight: 600, color: C.success }}>Ficheiro carregado com sucesso</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textMuted }}>{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(0)}KB) — Clique para remover</p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>&#x1F4C1;</div>
                    <p style={{ margin: 0, fontWeight: 600, color: C.text }}>Arraste o ficheiro ou clique para enviar</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textMuted }}>PDF, AI, EPS, PNG ou SVG (máx. 10MB)</p>
                  </>
                )}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: C.textMuted }}>
                Para melhor resultado, envie PNG com fundo transparente ou SVG
              </p>
              {/* Auto-remove background toggle */}
              {uploadedFile && !uploadedFile.name.endsWith('.svg') && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, cursor: 'pointer', fontSize: 14, color: C.text }}>
                  <input
                    type="checkbox"
                    checked={autoRemoveBg}
                    onChange={e => setAutoRemoveBg(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: C.accent }}
                  />
                  <span style={{ fontWeight: 600 }}>Remover fundo automaticamente</span>
                  <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 4 }}>
                    ({autoRemoveBg ? 'Fundo removido' : 'Imagem original'})
                  </span>
                </label>
              )}
            </div>

            {/* Cart Items */}
            {cart.length > 0 && (
              <div style={sectionStyle}>
                <h3 style={stepTitleStyle}>
                  <span style={{ ...stepNumStyle, background: C.success }}>&#x1F6D2;</span>
                  Carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cart.map(item => {
                    const p = PRODUCTS.find(pr => pr.id === item.productId);
                    if (!p) return null;
                    const up = getUnitPrice(p, item.quantity) + getColorSurcharge(item.colors);
                    const itemTotal = up * item.quantity;
                    return (
                      <div key={item.itemId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: C.white, borderRadius: 8, border: `1px solid ${C.border}` }}>
                        <CupImage product={p} size={36} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{p.name} — {p.capacity}</div>
                          <div style={{ fontSize: 12, color: C.textSec }}>
                            {item.quantity.toLocaleString('pt-PT')} un. · {COLOR_OPTIONS.find(c => c.value === item.colors)?.label} · {fmt(up)}/un.
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, whiteSpace: 'nowrap' }}>{fmt(itemTotal)}</div>
                        <button onClick={() => removeFromCart(item.itemId)}
                          style={{ background: 'none', border: 'none', color: '#E74C3C', fontSize: 18, cursor: 'pointer', padding: '4px 8px', lineHeight: 1 }}
                          title="Remover">
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping */}
            <div style={sectionStyle}>
              <h3 style={stepTitleStyle}><span style={stepNumStyle}>4</span> Entrega</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>Destino</label>
                  <select value={shippingRegion} onChange={e => handleRegionChange(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.text, background: C.white }}>
                    {SHIPPING_REGIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                {!isInternational && (
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>Método de envio</label>
                    <select value={shippingMethod} onChange={e => setShippingMethod(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.text, background: C.white }}>
                      {availableMethods.map(m => (
                        <option key={m} value={m}>{SHIPPING_METHOD_LABELS[m]?.label} ({SHIPPING_METHOD_LABELS[m]?.days})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              {isInternational && (
                <div style={{ marginTop: 12, padding: 16, background: '#FEF9E7', borderRadius: 8, border: '1px solid #F9E79F' }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#7D6608' }}>Para envios internacionais fora da UE, <a onClick={() => goToContact()} style={{ color: C.accent, cursor: 'pointer', textDecoration: 'underline' }}>contacte-nos</a> para orçamento de envio personalizado.</p>
                </div>
              )}
              {overweight && !isInternational && (
                <div style={{ marginTop: 12, padding: 16, background: '#FDEDEC', borderRadius: 8, border: '1px solid #F5B7B1' }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#922B21' }}>Envio de grande volume (acima de 30kg). <a onClick={() => goToContact()} style={{ color: C.accent, cursor: 'pointer', textDecoration: 'underline' }}>Contacte-nos</a> para melhor preço.</p>
                </div>
              )}
              {freeShipping && (
                <div style={{ marginTop: 12, padding: 12, background: '#EAFAF1', borderRadius: 8, border: '1px solid #82E0AA' }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#1E8449', fontWeight: 600 }}>🎉 Transporte OFERTA! Encomendas acima de 150€.</p>
                </div>
              )}
              {cart.length > 0 && !isInternational && !overweight && (
                <p style={{ margin: '8px 0 0', fontSize: 13, color: C.textMuted }}>
                  Peso estimado: {cartWeightKg.toFixed(1)}kg — Prazo: {SHIPPING_METHOD_LABELS[shippingMethod]?.days}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Mockup + Order Summary */}
          <div style={{ flex: '0 0 480px', position: 'sticky', top: 80, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Cup Mockup Preview */}
            {product && (
              <div style={{ background: C.white, borderRadius: 12, boxShadow: C.cardShadow, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ background: `linear-gradient(135deg, ${C.lightBg}, #F8F9FA)`, padding: '12px 24px', borderBottom: `1px solid ${C.border}` }}>
                  <h3 style={{ color: C.primary, margin: 0, fontSize: 16, fontWeight: 700 }}>
                    {logoPreviewUrl ? 'Pré-visualização' : 'Mockup do Copo'}
                  </h3>
                  {!logoPreviewUrl && <p style={{ margin: '4px 0 0', fontSize: 12, color: C.textMuted }}>Envie um logo para ver a simulação</p>}
                </div>
                <div style={{ padding: 24, display: 'flex', justifyContent: 'center', background: '#FAFBFC' }}>
                  <CupViewer3D
                    radiusTop={product.cupTopW / 2}
                    radiusBottom={product.cupBotW / 2}
                    height={product.cupHeight}
                    logoUrl={logoPreviewUrl}
                    logoScale={logoScale}
                    logoYOffset={logoYOffset}
                  />
                </div>
                {removingBg && (
                  <div style={{ padding: '8px 24px 16px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 12, color: C.accent, fontWeight: 600 }}>
                      &#x23F3; A remover fundo do logótipo...
                    </p>
                  </div>
                )}
                {logoPreviewUrl && !removingBg && (
                  <div style={{ padding: '8px 24px 16px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 12, color: C.success, fontWeight: 600 }}>
                      &#x2705; Simulação com o seu logo — {product.name} ({product.capacity})
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: C.textMuted }}>
                      {autoRemoveBg ? 'Fundo removido automaticamente.' : 'Imagem original.'} A maquete final será enviada para aprovação.
                    </p>
                  </div>
                )}
                {/* Logo position & size sliders */}
                {logoPreviewUrl && !removingBg && (
                  <div style={{ padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Position slider */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec }}>Posição vertical</label>
                        {logoYOffset !== 0 && (
                          <button onClick={() => setLogoYOffset(0)}
                            style={{ background: 'none', border: 'none', color: C.accent, fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                            Reset
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: C.textMuted }}>&#x2191;</span>
                        <input
                          type="range"
                          min={-25}
                          max={25}
                          value={logoYOffset}
                          onChange={e => setLogoYOffset(Number(e.target.value))}
                          style={{ flex: 1, cursor: 'pointer', accentColor: C.accent }}
                        />
                        <span style={{ fontSize: 11, color: C.textMuted }}>&#x2193;</span>
                      </div>
                    </div>
                    {/* Size slider */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec }}>Tamanho do logo ({logoScale}%)</label>
                        {logoScale !== 100 && (
                          <button onClick={() => setLogoScale(100)}
                            style={{ background: 'none', border: 'none', color: C.accent, fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                            Reset
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: C.textMuted }}>&#x2212;</span>
                        <input
                          type="range"
                          min={30}
                          max={300}
                          value={logoScale}
                          onChange={e => setLogoScale(Number(e.target.value))}
                          style={{ flex: 1, cursor: 'pointer', accentColor: C.accent }}
                        />
                        <span style={{ fontSize: 11, color: C.textMuted }}>+</span>
                      </div>
                    </div>
                    {/* Download mockup button */}
                    <button
                      onClick={() => product && exportMockupPNG(product.name)}
                      style={{ width: '100%', marginTop: 4, padding: '10px 16px', borderRadius: 8, background: 'transparent', color: C.accent, border: `2px solid ${C.accent}`, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                      Descarregar Mockup
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Order Summary */}
            <div style={{ background: C.white, borderRadius: 12, boxShadow: C.cardShadow, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ background: C.primary, padding: '16px 24px' }}>
                <h3 style={{ color: C.white, margin: 0, fontSize: 18, fontWeight: 700 }}>Resumo do Orçamento</h3>
              </div>
              <div style={{ padding: 24 }}>
                {cart.length > 0 ? (
                  <>
                    {/* Cart items summary */}
                    <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
                      {cart.map(item => {
                        const p = PRODUCTS.find(pr => pr.id === item.productId);
                        if (!p) return null;
                        const up = getUnitPrice(p, item.quantity) + getColorSurcharge(item.colors);
                        const itemTotal = up * item.quantity;
                        return (
                          <div key={item.itemId} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                            <CupImage product={p} size={32} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{p.name}</div>
                              <div style={{ fontSize: 11, color: C.textSec }}>{item.quantity.toLocaleString('pt-PT')} un. × {fmt(up)}</div>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: C.text, whiteSpace: 'nowrap' }}>{fmt(itemTotal)}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: C.textSec }}>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'})</span>
                        <span style={{ fontWeight: 600 }}>{fmt(cartSubtotal)}</span>
                      </div>
                      {!isInternational && !overweight && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: C.textSec }}>Envio</span>
                          <span style={{ fontWeight: 700, color: freeShipping ? C.success : undefined }}>{freeShipping ? 'OFERTA' : fmt(shippingCost)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: C.textSec }}>IVA (23%)</span>
                        <span style={{ fontWeight: 600 }}>{fmt(vat)}</span>
                      </div>
                      <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                        <span style={{ fontWeight: 700, color: C.primary }}>Total</span>
                        <span style={{ fontWeight: 700, color: C.primary }}>{fmt(total)}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: C.success, margin: '16px 0', fontWeight: 600 }}>✓ Maquete digital gratuita incluída</p>
                    <button onClick={() => setShowModal(true)}
                      style={{ width: '100%', padding: '14px', borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: C.white, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                      Finalizar Encomenda
                    </button>
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                      <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 8px' }}>Métodos de pagamento:</p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {PAYMENT_METHODS.map(pm => (
                          <div key={pm.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <PaymentIcon method={pm.id} />
                            <span style={{ fontSize: 11, color: C.textSec }}>{pm.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: C.textMuted }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                    <p style={{ margin: 0, fontSize: 14 }}>Adicione produtos ao carrinho para ver o orçamento</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Price Table */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: C.primary, margin: '0 0 8px' }}>Tabela de Preços Completa</h2>
          <p style={{ color: C.textSec, fontSize: 14, margin: '0 0 24px' }}>Preços por unidade, sem IVA. 1 cor incluída. Desconto progressivo por quantidade.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.primary }}>
                  <th style={{ padding: '12px 16px', color: C.white, textAlign: 'left', fontWeight: 600 }}>Produto</th>
                  {[25, 50, 100, 250, 500, '1.000', '2.000-5.000', '5.000-10.000'].map((q, i) => (
                    <th key={i} style={{ padding: '12px 8px', color: C.white, textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>{typeof q === 'number' ? q : q} un.</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p, idx) => (
                  <tr key={p.id} style={{ background: idx % 2 === 0 ? C.white : C.lightBg }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CupImage product={p} size={28} />
                        {p.name} ({p.capacity})
                      </div>
                    </td>
                    {[25, 50, 100, 250, 500, 1000, 2000, 5000].map(q => (
                      <td key={q} style={{ padding: '12px 8px', textAlign: 'center', color: C.text }}>{fmt(p.prices[q])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: C.textMuted }}>
            <span>+1 cor extra: +0,06€/un.</span>
            <span>IVA não incluído (23%)</span>
            <span style={{ color: C.success, fontWeight: 600 }}>🎉 Portes grátis para encomendas acima de 150€</span>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {showModal && cart.length > 0 && (
        <ConfirmationModal cart={cart} cartSubtotal={cartSubtotal} shippingCost={shippingCost} freeShipping={freeShipping} vat={vat} total={total} shippingRegion={shippingRegion} shippingMethod={shippingMethod} isInternational={isInternational} overweight={overweight} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

// ==================== CONFIRMATION MODAL ====================

function ConfirmationModal({ cart, cartSubtotal, shippingCost, freeShipping, vat, total, shippingRegion, shippingMethod, isInternational, overweight, onClose }: {
  cart: CartItem[]; cartSubtotal: number; shippingCost: number; freeShipping: boolean; vat: number; total: number; shippingRegion: string; shippingMethod: string; isInternational: boolean; overweight: boolean; onClose: () => void;
}) {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const PAYMENT_URLS: Record<string, string> = {
    paypal: 'https://www.paypal.com',
    transfer: 'https://www.bancobpi.pt',
    mbway: 'https://www.mbway.pt',
    applepay: 'https://www.apple.com/apple-pay/',
  };

  const handleConfirm = () => {
    if (!selectedPayment) return;
    const url = PAYMENT_URLS[selectedPayment];
    if (url) window.open(url, '_blank');
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 24 }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: 16, padding: 32, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <h2 style={{ color: C.primary, margin: '0 0 24px', fontSize: 24 }}>Confirmar Encomenda</h2>

        <div style={{ background: C.lightBg, borderRadius: 8, padding: 20, marginBottom: 24 }}>
          {/* Cart items */}
          {cart.map(item => {
            const p = PRODUCTS.find(pr => pr.id === item.productId);
            if (!p) return null;
            const up = getUnitPrice(p, item.quantity) + getColorSurcharge(item.colors);
            const itemTotal = up * item.quantity;
            return (
              <div key={item.itemId} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <CupImage product={p} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name} — {p.capacity}</div>
                  <div style={{ fontSize: 12, color: C.textSec }}>
                    {item.quantity.toLocaleString('pt-PT')} un. · {COLOR_OPTIONS.find(c => c.value === item.colors)?.label} · {fmt(up)}/un.
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.primary }}>{fmt(itemTotal)}</div>
              </div>
            );
          })}
          <div style={{ height: 1, background: C.border, margin: '12px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span style={{ fontWeight: 600 }}>{fmt(cartSubtotal)}</span></div>
            {!isInternational && !overweight && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Envio ({SHIPPING_METHOD_LABELS[shippingMethod]?.label})</span><span style={{ fontWeight: 700, color: freeShipping ? C.success : undefined }}>{freeShipping ? 'OFERTA' : fmt(shippingCost)}</span></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>IVA (23%)</span><span style={{ fontWeight: 600 }}>{fmt(vat)}</span></div>
            <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20 }}>
              <span style={{ fontWeight: 700, color: C.primary }}>Total</span>
              <span style={{ fontWeight: 700, color: C.primary }}>{fmt(total)}</span>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 12px' }}>Método de Pagamento</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {PAYMENT_METHODS.map(pm => (
            <label key={pm.id} onClick={() => setSelectedPayment(pm.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, border: `2px solid ${selectedPayment === pm.id ? C.accent : C.border}`, background: selectedPayment === pm.id ? C.lightBg : C.white, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedPayment === pm.id ? C.accent : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedPayment === pm.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.accent }} />}
              </div>
              <PaymentIcon method={pm.id} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>{pm.label}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '13px', borderRadius: 8, background: C.white, color: C.textSec, border: `1px solid ${C.border}`, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={!selectedPayment}
            style={{ flex: 2, padding: '13px', borderRadius: 8, background: selectedPayment ? `linear-gradient(135deg, ${C.primary}, ${C.accent})` : '#BDC3C7', color: C.white, border: 'none', fontSize: 15, fontWeight: 700, cursor: selectedPayment ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
            Confirmar Encomenda
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== HOW IT WORKS PAGE ====================

function HowItWorksPage() {
  const steps = [
    { n: '1', title: 'Escolha o Seu Copo', desc: 'Navegue pelo nosso catálogo e selecione o tamanho de copo mais adequado à sua necessidade. Temos opções desde os 200ml para cafés e degustações, até aos 500ml para festivais e grandes eventos. Cada copo é produzido em plástico reutilizável de alta qualidade.' },
    { n: '2', title: 'Envie o Seu Design', desc: 'Carregue o logótipo ou design da sua marca nos formatos PDF, AI, EPS, PNG ou SVG. A nossa equipa de designers irá adaptar o seu ficheiro ao formato ideal para impressão por tampografia ou serigrafia, garantindo a melhor qualidade de reprodução.' },
    { n: '3', title: 'Aprove a Maquete', desc: 'Receba gratuitamente uma maquete digital com a simulação do copo personalizado. Poderá solicitar ajustes até estar completamente satisfeito com o resultado. Só avançamos para produção após a sua aprovação final.' },
    { n: '4', title: 'Receba a Sua Encomenda', desc: 'A sua encomenda é produzida nas nossas instalações em 5-10 dias úteis. Enviamos para Portugal Continental, Ilhas, Espanha e toda a Europa através da CTT Expresso, com opções de entrega rápida ou levantamento em ponto Collectt.' },
  ];

  return (
    <div>
      <section style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ color: C.white, fontSize: 36, fontWeight: 700, margin: 0 }}>Como Funciona</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '8px 0 0' }}>Personalizar os seus copos é simples e rápido</p>
      </section>

      <section style={{ ...container, padding: '64px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {steps.map((step, idx) => (
            <div key={step.n} style={{ display: 'flex', gap: 24, marginBottom: idx < steps.length - 1 ? 40 : 0, position: 'relative' }}>
              {idx < steps.length - 1 && (
                <div style={{ position: 'absolute', left: 27, top: 56, width: 2, height: 'calc(100% - 20px)', background: `linear-gradient(to bottom, ${C.accent}, ${C.border})` }} />
              )}
              <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, position: 'relative', zIndex: 1 }}>
                {step.n}
              </div>
              <div style={{ paddingTop: 4 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: C.primary }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: 15, color: C.textSec, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* File Requirements */}
        <div style={{ maxWidth: 700, margin: '64px auto 0', background: C.lightBg, borderRadius: 12, padding: 32, border: `1px solid #AED6F1` }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: C.primary }}>📋 Requisitos do Ficheiro</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Formatos aceites', value: 'PDF, AI, EPS, SVG (vetorial preferido), PNG (mín. 300dpi)' },
              { label: 'Resolução mínima', value: '300 dpi para ficheiros raster (PNG, JPG)' },
              { label: 'Modo de cor', value: 'CMYK para melhor correspondência de cores na impressão' },
              { label: 'Área útil de impressão', value: 'Variável por tamanho de copo — indicado na maquete' },
              { label: 'Número de cores', value: '1 a 4 cores (Pantone) ou full color (CMYK)' },
              { label: 'Tamanho máximo', value: '10 MB por ficheiro' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, fontSize: 14 }}>
                <span style={{ fontWeight: 700, color: C.text, minWidth: 180 }}>{item.label}:</span>
                <span style={{ color: C.textSec }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ==================== CONTACT PAGE ====================

function ContactPage() {
  const [form, setForm] = useState({ nome: '', email: '', empresa: '', telefone: '', mensagem: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const inputStyle: CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, color: C.text, fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle: CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 6 };

  return (
    <div>
      <section style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ color: C.white, fontSize: 36, fontWeight: 700, margin: 0 }}>Contacto</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '8px 0 0' }}>Estamos aqui para ajudar</p>
      </section>

      <section style={{ ...container, padding: '64px 24px' }}>
        {/* Contact Form */}
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: 48, background: '#EAFAF1', borderRadius: 12 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ color: C.success, margin: '0 0 12px' }}>Mensagem Enviada!</h2>
              <p style={{ color: C.textSec, margin: '0 0 24px' }}>Obrigado pelo seu contacto. Iremos responder em breve.</p>
              <button onClick={() => { setSent(false); setForm({ nome: '', email: '', empresa: '', telefone: '', mensagem: '' }); }}
                style={{ padding: '10px 24px', borderRadius: 8, background: C.primary, color: C.white, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Enviar nova mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: C.white, borderRadius: 12, padding: 32, boxShadow: C.cardShadow, border: `1px solid ${C.border}` }}>
              <h2 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700, color: C.primary }}>Envie-nos uma Mensagem</h2>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>Nome *</label>
                  <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} style={inputStyle} placeholder="O seu nome" />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} placeholder="email@exemplo.pt" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>Empresa <span style={{ fontWeight: 400, color: C.textMuted }}>(opcional)</span></label>
                  <input value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} style={inputStyle} placeholder="Nome da empresa" />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>Telefone</label>
                  <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} style={inputStyle} placeholder="+351 900 000 000" />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Mensagem *</label>
                <textarea required value={form.mensagem} onChange={e => setForm({ ...form, mensagem: e.target.value })}
                  style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} placeholder="Descreva o que pretende..." />
              </div>
              <button type="submit"
                style={{ width: '100%', padding: '14px', borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: C.white, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                Enviar Mensagem
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

// ==================== FOOTER ====================

function Footer({ setPage }: { setPage: (p: string) => void }) {
  return (
    <footer style={{ background: C.primary, color: 'rgba(255,255,255,0.8)', padding: '48px 24px 24px' }}>
      <div style={{ ...container, display: 'flex', flexWrap: 'wrap', gap: 48, marginBottom: 32 }}>
        {/* Logo & Description */}
        <div style={{ flex: '1 1 280px' }}>
          <div style={{ marginBottom: 12 }}>
            <Logo variant="white" height={48} />
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, margin: '0 0 4px', opacity: 0.8 }}>
            Especialistas em personalização de copos de plástico reutilizáveis. Tampografia e serigrafia de alta qualidade.
          </p>
          <p style={{ fontSize: 11, margin: 0, opacity: 0.6, fontStyle: 'italic' }}>A SUA MARCA EM CADA DETALHE</p>
        </div>

        {/* Navigation */}
        <div style={{ flex: '0 0 160px' }}>
          <h4 style={{ color: C.white, fontSize: 14, fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>Navegação</h4>
          {[
            { id: 'home', label: 'Início' },
            { id: 'products', label: 'Produtos' },
            { id: 'how-it-works', label: 'Como Funciona' },
            { id: 'contact', label: 'Contacto' },
          ].map(item => (
            <div key={item.id} style={{ marginBottom: 8 }}>
              <a onClick={() => { setPage(item.id); window.scrollTo(0, 0); }}
                style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.white)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>
                {item.label}
              </a>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div style={{ flex: '0 0 200px' }}>
          <h4 style={{ color: C.white, fontSize: 14, fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>Pagamento</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {PAYMENT_METHODS.map(pm => (
              <div key={pm.id} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PaymentIcon method={pm.id} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{pm.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 20, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.6 }}>© 2026 PrimeGift. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

// ==================== MAIN APP ====================

export default function PrimeGiftApp() {
  const [page, setPage] = useState('home');
  const [initialProduct, setInitialProduct] = useState<string | null>(null);

  const handleSelectProduct = (productId: string) => {
    setInitialProduct(productId);
    setPage('products');
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header page={page} setPage={setPage} />
      <main style={{ flex: 1 }}>
        {page === 'home' && <HomePage setPage={setPage} onSelectProduct={handleSelectProduct} />}
        {page === 'products' && <ProductsPage key={initialProduct ?? 'default'} goToContact={() => { setPage('contact'); window.scrollTo(0, 0); }} initialProduct={initialProduct} />}
        {page === 'how-it-works' && <HowItWorksPage />}
        {page === 'contact' && <ContactPage />}
      </main>
      <Footer setPage={setPage} />
    </div>
  );
}
