'use client';
import React, { useState, useMemo, CSSProperties } from 'react';

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

const PRINT_TECHNIQUES = [
  { id: 'tampografia', label: 'Tampografia', description: 'Ideal para logos simples', surcharge: 0 },
  { id: 'serigrafia', label: 'Serigrafia', description: 'Cores vivas e duráveis', surcharge: 0.02 },
  { id: 'serigrafia360', label: 'Serigrafia 360°', description: 'Impressão em toda a volta', surcharge: 0.08 },
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
  pg200: '/cup-200.png',
  pg300: '/cup-300.png',
  pg330: '/cup-330.png',
  pg500: '/cup-500.png',
};

function CupImage({ product, size = 120, showCapacity = false }: { product: Product; size?: number; showCapacity?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <img
          src={CUP_IMAGES[product.id]}
          alt={`${product.name} — ${product.capacity}`}
          style={{ width: size * 0.75, height: size * 0.9, objectFit: 'contain' }}
        />
      </div>
      {showCapacity && (
        <span style={{ fontSize: Math.max(11, size * 0.13), color: C.textSec, fontWeight: 600, marginTop: 4 }}>{product.capacity}</span>
      )}
    </div>
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

function HomePage({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ color: C.white, fontSize: 48, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
            A Sua Marca<br />em Cada Copo
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 20, marginTop: 20, lineHeight: 1.6 }}>
            Copos de plástico reutilizáveis personalizados com a sua marca. Tampografia e serigrafia de alta qualidade, produção própria.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
            <button onClick={() => { setPage('products'); window.scrollTo(0, 0); }}
              style={{ background: C.white, color: C.primary, border: 'none', padding: '14px 36px', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              Ver Produtos
            </button>
            <button onClick={() => { setPage('contact'); window.scrollTo(0, 0); }}
              style={{ background: 'transparent', color: C.white, border: '2px solid rgba(255,255,255,0.6)', padding: '14px 36px', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              Pedir Orçamento
            </button>
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
      <section style={{ padding: '64px 24px', background: C.lightBg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.primary, margin: '0 0 12px' }}>Os Nossos Produtos</h2>
          <p style={{ textAlign: 'center', color: C.textSec, fontSize: 16, margin: '0 0 48px' }}>Copos reutilizáveis de alta qualidade, prontos para a sua marca</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
            {PRODUCTS.map(product => (
              <div key={product.id} onClick={() => { setPage('products'); window.scrollTo(0, 0); }}
                style={{ background: C.white, borderRadius: 12, padding: 28, flex: '1 1 240px', maxWidth: 280, cursor: 'pointer', boxShadow: C.cardShadow, transition: 'all 0.3s', textAlign: 'center', border: `1px solid transparent` }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadowHover; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadow; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <CupImage product={product} size={100} showCapacity />
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: C.primary }}>{product.name}</h3>
                <p style={{ margin: '0 0 4px', fontSize: 14, color: C.textSec }}>{product.description}</p>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: C.textMuted }}>⌀{product.cupTopW}mm × {product.cupHeight}mm altura</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.success }}>desde {fmt(product.prices[5000])}/un.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section style={{ padding: '64px 24px' }}>
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

      {/* Reviews Section */}
      <section style={{ padding: '64px 24px', background: C.lightBg }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.primary, margin: '0 0 12px' }}>O Que Dizem os Nossos Clientes</h2>
          <p style={{ textAlign: 'center', color: C.textSec, fontSize: 16, margin: '0 0 48px' }}>Eventos reais, resultados reais</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
            {[
              { quote: 'Os copos ficaram incríveis e resistiram a todo o festival. A qualidade de impressão superou as expectativas e os participantes adoraram levar como recordação.', name: 'Ana Rodrigues', role: 'Festival Vilar de Mouros' },
              { quote: 'Substituímos os copos descartáveis pelos reutilizáveis da PrimeGift. Os clientes elogiam constantemente e poupamos no descartável. Excelente investimento.', name: 'Miguel Santos', role: 'Restaurante O Marinheiro' },
              { quote: 'Encomendámos para um evento de 500 pessoas e o resultado foi impecável. A maquete prévia ajudou-nos a acertar no design à primeira. Recomendo vivamente.', name: 'Carla Ferreira', role: 'Eventos Corporativos LDA' },
              { quote: 'A serigrafia 360° ficou espetacular nos nossos copos de cerveja artesanal. Os clientes perguntam sempre onde podem comprar!', name: 'Pedro Almeida', role: 'Cervejaria Artesanal Minho' },
              { quote: 'Trabalho com a PrimeGift há 2 anos. Qualidade consistente, prazos cumpridos e preços competitivos. São o nosso fornecedor de referência.', name: 'Sofia Costa', role: 'Agência EventosPro' },
              { quote: 'Os copos personalizados deram um toque premium ao nosso casamento. Todos os convidados levaram como lembrança. Simplesmente perfeito!', name: 'Ricardo & Joana', role: 'Casamento em Sintra' },
            ].map((review, idx) => (
              <div key={idx} style={{ flex: '1 1 300px', maxWidth: 340, background: C.white, borderRadius: 12, padding: 24, boxShadow: C.cardShadow }}>
                <div style={{ fontSize: 32, color: C.accent, marginBottom: 12 }}>"</div>
                <p style={{ margin: '0 0 16px', fontSize: 14, color: C.textSec, lineHeight: 1.6, fontStyle: 'italic' }}>{review.quote}</p>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: 15 }}>{review.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: C.textMuted }}>{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ==================== PRODUCTS PAGE ====================

function ProductsPage({ goToContact }: { goToContact: () => void }) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [colors, setColors] = useState(1);
  const [printTechnique, setPrintTechnique] = useState('tampografia');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; preview: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Erro no upload');
        setUploadedFile(null);
      } else {
        const isImage = file.type.startsWith('image/');
        setUploadedFile({
          name: data.fileName,
          size: data.size,
          preview: isImage ? URL.createObjectURL(file) : null,
        });
      }
    } catch {
      setUploadError('Erro de ligação ao servidor');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };
  const [shippingRegion, setShippingRegion] = useState('pt-continental');
  const [shippingMethod, setShippingMethod] = useState('2-days');
  const [showModal, setShowModal] = useState(false);

  const product = PRODUCTS.find(p => p.id === selectedProduct) || null;
  const technique = PRINT_TECHNIQUES.find(t => t.id === printTechnique);
  const techniqueSurcharge = technique?.surcharge ?? 0;
  const unitPrice = product ? getUnitPrice(product, quantity) + getColorSurcharge(colors) + techniqueSurcharge : 0;
  const subtotal = unitPrice * quantity;
  const weightKg = product ? calculateWeightKg(product, quantity) : 0;
  const overweight = weightKg > 30;
  const isInternational = shippingRegion === 'international';
  const availableMethods = getAvailableMethods(shippingRegion);
  const freeShipping = subtotal > 150;
  const shippingCost = (!isInternational && !overweight && product) ? (freeShipping ? 0 : (getShippingCost(weightKg, shippingRegion, shippingMethod) ?? 0)) : 0;
  const totalBeforeVAT = subtotal + shippingCost;
  const vat = totalBeforeVAT * 0.23;
  const total = totalBeforeVAT + vat;

  // Reset shipping method when region changes
  const handleRegionChange = (r: string) => {
    setShippingRegion(r);
    const methods = getAvailableMethods(r);
    if (methods.length > 0 && !methods.includes(shippingMethod)) {
      setShippingMethod(methods[0]);
    }
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
                    <CupImage product={p} size={60} showCapacity />
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, marginTop: 8 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>⌀{p.cupTopW}mm × {p.cupHeight}mm</div>
                    <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>{p.description}</div>
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
            </div>

            {/* Step 2.5: Print Technique */}
            <div style={sectionStyle}>
              <h3 style={stepTitleStyle}><span style={stepNumStyle}>2.5</span> Técnica de impressão</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {PRINT_TECHNIQUES.map(t => (
                  <div key={t.id} onClick={() => setPrintTechnique(t.id)}
                    style={{ flex: '1 1 140px', padding: '14px 16px', borderRadius: 10, border: `2px solid ${printTechnique === t.id ? C.accent : C.border}`, background: printTechnique === t.id ? C.lightBg : C.white, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: printTechnique === t.id ? C.accent : C.text, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{t.description}</div>
                    {t.surcharge > 0 && <div style={{ fontSize: 11, color: C.success, marginTop: 4 }}>+{fmt(t.surcharge)}/un.</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: File Upload */}
            <div style={sectionStyle}>
              <h3 style={stepTitleStyle}><span style={stepNumStyle}>3</span> Envie o seu ficheiro</h3>
              <input ref={fileInputRef} type="file" accept=".pdf,.ai,.eps,.png,.svg" style={{ display: 'none' }} onChange={handleFileInput} />
              <div
                onClick={() => { if (uploadedFile) { setUploadedFile(null); setUploadError(null); } else { fileInputRef.current?.click(); } }}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                style={{ border: `2px dashed ${uploadedFile ? C.success : uploadError ? '#E74C3C' : C.border}`, borderRadius: 12, padding: 40, textAlign: 'center', cursor: 'pointer', background: uploadedFile ? '#EAFAF1' : uploadError ? '#FDEDEC' : '#FAFAFA', transition: 'all 0.2s' }}>
                {uploading ? (
                  <>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>⏳</div>
                    <p style={{ margin: 0, fontWeight: 600, color: C.text }}>A enviar ficheiro...</p>
                  </>
                ) : uploadedFile ? (
                  <>
                    {uploadedFile.preview ? (
                      <img src={uploadedFile.preview} alt="Preview" style={{ maxWidth: 150, maxHeight: 100, marginBottom: 12, borderRadius: 8 }} />
                    ) : (
                      <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                    )}
                    <p style={{ margin: 0, fontWeight: 600, color: C.success }}>Ficheiro carregado com sucesso</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textMuted }}>{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(0)} KB) — Clique para remover</p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
                    <p style={{ margin: 0, fontWeight: 600, color: C.text }}>Arraste o ficheiro ou clique para enviar</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textMuted }}>PDF, AI, EPS, PNG ou SVG (máx. 10MB)</p>
                    {uploadError && <p style={{ margin: '8px 0 0', fontSize: 13, color: '#E74C3C', fontWeight: 600 }}>{uploadError}</p>}
                  </>
                )}
              </div>
            </div>

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
              {product && !isInternational && !overweight && (
                <p style={{ margin: '8px 0 0', fontSize: 13, color: C.textMuted }}>
                  Peso estimado: {weightKg.toFixed(1)}kg — Prazo: {SHIPPING_METHOD_LABELS[shippingMethod]?.days}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div style={{ flex: '0 0 360px', position: 'sticky', top: 80, maxWidth: '100%' }}>
            <div style={{ background: C.white, borderRadius: 12, boxShadow: C.cardShadow, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ background: C.primary, padding: '16px 24px' }}>
                <h3 style={{ color: C.white, margin: 0, fontSize: 18, fontWeight: 700 }}>Resumo do Orçamento</h3>
              </div>
              <div style={{ padding: 24 }}>
                {product ? (
                  <>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ position: 'relative' }}>
                        <CupImage product={product} size={60} />
                        <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', background: C.accent, color: C.white, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {product.capacity}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: C.text, fontSize: 16 }}>{product.name}</div>
                        <div style={{ fontSize: 13, color: C.textSec }}>{product.description}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>⌀{product.cupTopW}mm × {product.cupHeight}mm</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: C.textSec }}>Quantidade</span>
                        <span style={{ fontWeight: 600 }}>{quantity.toLocaleString('pt-PT')} un.</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: C.textSec }}>Cores</span>
                        <span style={{ fontWeight: 600 }}>{COLOR_OPTIONS.find(c => c.value === colors)?.label}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: C.textSec }}>Preço unitário</span>
                        <span style={{ fontWeight: 600 }}>{fmt(unitPrice)}</span>
                      </div>
                      <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: C.textSec }}>Subtotal (produtos)</span>
                        <span style={{ fontWeight: 600 }}>{fmt(subtotal)}</span>
                      </div>
                      {!isInternational && !overweight && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: C.textSec }}>Envio{freeShipping ? '' : ''}</span>
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
                    <p style={{ margin: 0, fontSize: 14 }}>Selecione um produto para ver o orçamento</p>
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
      {showModal && product && (
        <ConfirmationModal product={product} quantity={quantity} colors={colors} unitPrice={unitPrice} subtotal={subtotal} shippingCost={shippingCost} freeShipping={freeShipping} vat={vat} total={total} shippingRegion={shippingRegion} shippingMethod={shippingMethod} isInternational={isInternational} overweight={overweight} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

// ==================== CONFIRMATION MODAL ====================

function ConfirmationModal({ product, quantity, colors, unitPrice, subtotal, shippingCost, freeShipping, vat, total, shippingRegion, shippingMethod, isInternational, overweight, onClose }: {
  product: Product; quantity: number; colors: number; unitPrice: number; subtotal: number; shippingCost: number; freeShipping: boolean; vat: number; total: number; shippingRegion: string; shippingMethod: string; isInternational: boolean; overweight: boolean; onClose: () => void;
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
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <CupImage product={product} size={44} />
            <div>
              <div style={{ fontWeight: 700 }}>{product.name} — {product.capacity}</div>
              <div style={{ fontSize: 13, color: C.textSec }}>{quantity.toLocaleString('pt-PT')} un. · {COLOR_OPTIONS.find(c => c.value === colors)?.label}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span style={{ fontWeight: 600 }}>{fmt(subtotal)}</span></div>
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

        {/* Legal */}
        <div style={{ flex: '0 0 180px' }}>
          <h4 style={{ color: C.white, fontSize: 14, fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>Legal</h4>
          {[
            { id: 'privacy', label: 'Política de Privacidade' },
            { id: 'terms', label: 'Termos e Condições' },
            { id: 'returns', label: 'Devoluções e Reembolsos' },
            { id: 'shipping', label: 'Política de Envio' },
            { id: 'cookies', label: 'Política de Cookies' },
          ].map(item => (
            <div key={item.id} style={{ marginBottom: 6 }}>
              <a onClick={() => { setPage(item.id); window.scrollTo(0, 0); }}
                style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.white)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>
                {item.label}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 20, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.6 }}>© 2026 PrimeGift. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

// ==================== LEGAL PAGES ====================

function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <section style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ color: C.white, fontSize: 32, fontWeight: 700, margin: 0 }}>{title}</h1>
      </section>
      <section style={{ ...container, padding: '48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', fontSize: 15, color: C.text, lineHeight: 1.8 }}>
          {children}
        </div>
      </section>
    </div>
  );
}

function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidade">
      <p><strong>Última atualização:</strong> Março 2026</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>1. Responsável pelo Tratamento</h2>
      <p>A PrimeGift é responsável pelo tratamento dos dados pessoais recolhidos através deste website. Estamos empenhados em proteger a sua privacidade e em cumprir o Regulamento Geral de Proteção de Dados (RGPD).</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>2. Dados Recolhidos</h2>
      <p>Recolhemos os seguintes dados pessoais:</p>
      <ul>
        <li>Nome e email (para comunicação e processamento de encomendas)</li>
        <li>Morada de entrega (para envio de encomendas)</li>
        <li>Número de telefone (para contacto relacionado com encomendas)</li>
        <li>Dados de pagamento (processados por terceiros seguros)</li>
      </ul>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>3. Finalidade do Tratamento</h2>
      <p>Os seus dados são utilizados para:</p>
      <ul>
        <li>Processar e entregar as suas encomendas</li>
        <li>Comunicar sobre o estado das encomendas</li>
        <li>Enviar maquetes digitais para aprovação</li>
        <li>Responder a pedidos de informação</li>
      </ul>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>4. Direitos do Titular</h2>
      <p>Tem direito a aceder, retificar, apagar ou limitar o tratamento dos seus dados. Para exercer estes direitos, contacte-nos através do email: privacidade@primegift.pt</p>
    </LegalPage>
  );
}

function TermsPage() {
  return (
    <LegalPage title="Termos e Condições">
      <p><strong>Última atualização:</strong> Março 2026</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>1. Objeto</h2>
      <p>Os presentes Termos e Condições regulam a utilização do website PrimeGift e a aquisição de produtos através do mesmo.</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>2. Encomendas</h2>
      <p>Todas as encomendas estão sujeitas a confirmação. Após aprovação da maquete digital, a encomenda será processada e o prazo de produção inicia-se.</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>3. Preços e Pagamento</h2>
      <p>Os preços indicados não incluem IVA (23%). O pagamento deve ser efetuado na totalidade antes do início da produção.</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>4. Propriedade Intelectual</h2>
      <p>O cliente garante que possui os direitos sobre os logótipos e designs fornecidos para personalização. A PrimeGift não se responsabiliza por violações de direitos de autor.</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>5. Limitação de Responsabilidade</h2>
      <p>A PrimeGift não se responsabiliza por atrasos causados por transportadoras ou por força maior.</p>
    </LegalPage>
  );
}

function ReturnsPage() {
  return (
    <LegalPage title="Política de Devoluções e Reembolsos">
      <p><strong>Última atualização:</strong> Março 2026</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>1. Produtos Personalizados</h2>
      <p>Por serem produtos personalizados e fabricados sob encomenda, <strong>não aceitamos devoluções</strong> exceto em caso de defeito de fabrico ou erro da nossa parte.</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>2. Defeitos de Fabrico</h2>
      <p>Se receber produtos com defeito, contacte-nos no prazo de 48 horas após a receção, enviando fotografias do problema. Após análise, procederemos à substituição ou reembolso.</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>3. Erros na Impressão</h2>
      <p>Caso a impressão não corresponda à maquete aprovada, procederemos à reposição sem custos adicionais.</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>4. Cancelamentos</h2>
      <p>Pode cancelar a encomenda gratuitamente antes da aprovação da maquete. Após aprovação, será cobrado 50% do valor. Após início da produção, não são aceites cancelamentos.</p>
    </LegalPage>
  );
}

function ShippingPage() {
  return (
    <LegalPage title="Política de Envio">
      <p><strong>Última atualização:</strong> Março 2026</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>1. Prazos de Entrega</h2>
      <p>O prazo total inclui produção (5-10 dias úteis) mais tempo de envio:</p>
      <ul>
        <li><strong>Portugal Continental:</strong> 1-2 dias úteis</li>
        <li><strong>Ilhas (Açores/Madeira):</strong> 3-5 dias úteis</li>
        <li><strong>Espanha:</strong> 2-3 dias úteis</li>
        <li><strong>Europa:</strong> 4-7 dias úteis</li>
      </ul>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>2. Custos de Envio</h2>
      <p><strong>Portes grátis</strong> para encomendas acima de 150€ (Portugal Continental). Para outros destinos, consulte a tabela de preços no configurador.</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>3. Transportadora</h2>
      <p>Utilizamos a CTT Expresso para Portugal e Espanha, e transportadoras parceiras para outros destinos europeus.</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>4. Tracking</h2>
      <p>Receberá um código de tracking por email assim que a encomenda for expedida.</p>
    </LegalPage>
  );
}

function CookiesPage() {
  return (
    <LegalPage title="Política de Cookies">
      <p><strong>Última atualização:</strong> Março 2026</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>1. O que são Cookies?</h2>
      <p>Cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando visita um website. Permitem melhorar a experiência de navegação.</p>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>2. Cookies Utilizados</h2>
      <ul>
        <li><strong>Essenciais:</strong> Necessários para o funcionamento do site (carrinho, sessão)</li>
        <li><strong>Analíticos:</strong> Google Analytics para compreender como utiliza o site</li>
        <li><strong>Funcionais:</strong> Guardar preferências (idioma, região)</li>
      </ul>
      <h2 style={{ color: C.primary, fontSize: 20, marginTop: 32 }}>3. Gestão de Cookies</h2>
      <p>Pode desativar os cookies nas definições do seu browser. Note que isso pode afetar a funcionalidade do site.</p>
    </LegalPage>
  );
}

// ==================== MAIN APP ====================

export default function PrimeGiftApp() {
  const [page, setPage] = useState('home');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header page={page} setPage={setPage} />
      <main style={{ flex: 1 }}>
        {page === 'home' && <HomePage setPage={setPage} />}
        {page === 'products' && <ProductsPage goToContact={() => { setPage('contact'); window.scrollTo(0, 0); }} />}
        {page === 'how-it-works' && <HowItWorksPage />}
        {page === 'contact' && <ContactPage />}
        {page === 'privacy' && <PrivacyPage />}
        {page === 'terms' && <TermsPage />}
        {page === 'returns' && <ReturnsPage />}
        {page === 'shipping' && <ShippingPage />}
        {page === 'cookies' && <CookiesPage />}
      </main>
      <Footer setPage={setPage} />
    </div>
  );
}
