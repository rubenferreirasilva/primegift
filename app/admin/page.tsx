'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const C = {
  primary: '#1B2A4A',
  accent: '#2E86AB',
  white: '#FFFFFF',
  lightBg: '#F8FAFC',
  text: '#1a1a2e',
  textSec: '#555',
  textMuted: '#999',
  border: '#E5E7EB',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: '#F39C12', bg: '#FEF9E7' },
  paid: { label: 'Produção', color: '#27AE60', bg: '#D5F5E3' },
  shipped: { label: 'Logística', color: '#3498DB', bg: '#D6EAF8' },
  dispatched: { label: 'Expedido', color: '#1ABC9C', bg: '#D1F2EB' },
  complaint: { label: 'Reclamação', color: '#8E44AD', bg: '#F4ECF7' },
  cancelled: { label: 'Cancelado', color: '#E74C3C', bg: '#FDEDEC' },
};

interface OrderItem {
  reference?: string;
  product: string;
  capacity: string;
  quantity: number;
  printTechnique: string;
  printColor: string;
  unitPrice: number;
  itemTotal: number;
  fileUrl: string | null;
  fileName: string | null;
}

interface OrderData {
  reference: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  vat: number;
  total: number;
  paymentMethod: string;
  shippingMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  invoiceName?: string;
  invoiceNif?: string;
  notes?: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingUrl?: string;
}

interface Order {
  id: number;
  reference: string;
  status: string;
  order_data: OrderData;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
}

const PAYMENT_LABELS: Record<string, string> = {
  transfer: 'Transferência Bancária',
  paypal: 'PayPal',
  mbway: 'MB WAY',
};

const TECHNIQUE_LABELS: Record<string, string> = {
  tampografia: 'Tampografia',
  serigrafia: 'Serigrafia Rotativa',
};

const CUP_SPECS: Record<string, { cupTopW: number; cupBotW: number; cupHeight: number }> = {
  '200ml': { cupHeight: 65, cupTopW: 50, cupBotW: 36 },
  '300ml': { cupHeight: 80, cupTopW: 54, cupBotW: 38 },
  '330ml': { cupHeight: 88, cupTopW: 56, cupBotW: 39 },
  '500ml': { cupHeight: 105, cupTopW: 62, cupBotW: 42 },
};

const PRINT_COLOR_HEX: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  grey: '#808080',
};

function CupMockup({ item, size = 120 }: { item: OrderItem; size?: number }) {
  const spec = CUP_SPECS[item.capacity] || CUP_SPECS['330ml'];
  const h = size;
  const w = h * 0.65;
  const topW = (spec.cupTopW / 62) * w * 0.85;
  const botW = (spec.cupBotW / 62) * w * 0.6;
  const bodyH = h * 0.82;
  const topY = h * 0.08;
  const cx = w / 2;
  const uid = `mock-${item.capacity}-${Math.random().toString(36).slice(2, 6)}`;
  const printHex = PRINT_COLOR_HEX[item.printColor] || '#000000';

  const logoW = topW * 0.5;
  const logoH = bodyH * 0.32;
  const logoX = cx - logoW / 2;
  const logoY = topY + bodyH * 0.22;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }}>
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e0e8ee" stopOpacity={0.6} />
          <stop offset="18%" stopColor="#f5f8fa" stopOpacity={0.85} />
          <stop offset="40%" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="55%" stopColor="#f0f4f8" stopOpacity={0.9} />
          <stop offset="75%" stopColor="#dce4ea" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#c8d4de" stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fbfd" />
          <stop offset="50%" stopColor="#d0dce6" />
          <stop offset="100%" stopColor="#b8c8d4" />
        </linearGradient>
        <radialGradient id={`${uid}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#000" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#000" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={h * 0.96} rx={botW * 0.7} ry={h * 0.03} fill={`url(#${uid}-shadow)`} />
      <path d={`M${cx - topW / 2},${topY + 4} L${cx - botW / 2},${topY + bodyH} L${cx + botW / 2},${topY + bodyH} L${cx + topW / 2},${topY + 4} Z`} fill={`url(#${uid}-body)`} stroke="#c0ccd6" strokeWidth={0.8} />
      <ellipse cx={cx} cy={topY + 2} rx={topW / 2} ry={4} fill={`url(#${uid}-rim)`} stroke="#b8c8d4" strokeWidth={0.6} />
      <ellipse cx={cx} cy={topY + bodyH} rx={botW / 2} ry={2.5} fill="#d0dae2" stroke="#a0b0bc" strokeWidth={0.5} />
      {/* Logo area */}
      {item.fileUrl ? (
        <image href={item.fileUrl} x={logoX} y={logoY} width={logoW} height={logoH} preserveAspectRatio="xMidYMid meet" opacity={0.85} />
      ) : (
        <>
          <rect x={logoX} y={logoY} width={logoW} height={logoH} rx={3} fill="none" stroke={printHex} strokeWidth={1} strokeDasharray="3,2" opacity={0.4} />
          <text x={cx} y={logoY + logoH / 2 + 3} textAnchor="middle" fontSize={h * 0.06} fill={printHex} fontFamily="system-ui" opacity={0.5}>Logo</text>
        </>
      )}
      {/* Print color dot */}
      <circle cx={cx + topW / 2 + 6} cy={topY + bodyH * 0.3} r={4} fill={printHex} stroke="#ccc" strokeWidth={0.5} />
      <text x={cx} y={topY + bodyH * 0.7} textAnchor="middle" fontSize={h * 0.07} fontWeight="700" fill="#8898a8" fontFamily="system-ui" opacity={0.4}>{item.capacity}</text>
    </svg>
  );
}

function fmtPrice(n: number): string {
  return n.toFixed(2).replace('.', ',') + '€';
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [capacityFilter, setCapacityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'stock'>('orders');
  const [setupDone, setSetupDone] = useState(false);
  const [error, setError] = useState('');
  const [showComplaintSearch, setShowComplaintSearch] = useState(false);
  const [complaintSearchRef, setComplaintSearchRef] = useState('');
  const [orderNotes, setOrderNotes] = useState<Record<number, string>>({});
  const [savingNotes, setSavingNotes] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [trackingData, setTrackingData] = useState<Record<number, { carrier: string; number: string }>>({});
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const prevOrderCountRef = React.useRef(0);

  const authHeader = useCallback(() => ({ 'Authorization': `Bearer ${password}`, 'Content-Type': 'application/json' }), [password]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders?status=all', { headers: authHeader() });
      if (!res.ok) throw new Error('Erro');
      const data = await res.json();
      const orders = data.orders || [];
      if (orders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
        setNewOrderAlert(true);
        try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGcxKFqIwNvQfkUuRXaYx+DRhlE5S3GRwtfUi1k/T3eMvdPYkF1DUnOHuM/bmGFGVXCDs8rfmWVIV26ArsfgnmhLWm1+r8LjoGtNXGx8rcDlom5PXmt7q73mpXFRYGp5qbropnNTYml4p7Xqp3VVZGh2pbPsp3dXZmd1o7HtqHlZaGZzoa/uqXtba2VxnqzwqnxdbWRwm6rvq35fcGNumKfxrH9hdGNslqTyroBjdmJrkqHzr4Fle2Fpj5/0sIJnfmBnjpz1soNpgF9ljJn3s4VrhV5ki5f4tYZtiF1iiZT6t4dvil1hiJL7uIlwjFxghpD8u4pyjlxfhI3+vYt0kFteg4v/v4x2kltdgYkBwY14lFtcf4YDw455lltbfYQFxY97mFtae4IHx5B9mltZeYAJyZF/nFtYd34Lyw==').play().catch(() => {}); } catch {}
      }
      prevOrderCountRef.current = orders.length;
      setAllOrders(orders);
      setError('');
    } catch {
      setError('Erro ao carregar encomendas');
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    if (authed) fetchOrders();
  }, [authed, fetchOrders]);

  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(() => fetchOrders(), 30000);
    return () => clearInterval(interval);
  }, [authed, fetchOrders]);

  const filteredOrders = React.useMemo(() => {
    let orders = filter === 'all' ? allOrders : allOrders.filter(o => o.status === filter);
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      orders = orders.filter(o =>
        o.reference.toLowerCase().includes(q) ||
        o.order_data.customerName?.toLowerCase().includes(q) ||
        o.order_data.customerEmail?.toLowerCase().includes(q) ||
        o.order_data.customerPhone?.toLowerCase().includes(q)
      );
    }
    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      orders = orders.filter(o => new Date(o.created_at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      orders = orders.filter(o => new Date(o.created_at) <= to);
    }
    // Capacity filter
    if (capacityFilter !== 'all') {
      orders = orders.filter(o => o.order_data.items?.some((item: OrderItem) => item.capacity === capacityFilter));
    }
    return orders;
  }, [allOrders, filter, searchQuery, dateFrom, dateTo, capacityFilter]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders?status=all', {
        headers: { 'Authorization': `Bearer ${password}` },
      });
      if (res.ok) {
        setAuthed(true);
        const data = await res.json();
        setAllOrders(data.orders || []);
        setError('');
      } else {
        setError('Password incorreta');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setSetupDone(true);
        setError('');
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao criar tabela');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, newStatus: string) => {
    setActionLoading(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        await fetchOrders();
      } else {
        setError('Erro ao atualizar estado');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setActionLoading(null);
    }
  };

  const downloadMockup = async (reference: string, item: OrderItem) => {
    try {
      const res = await fetch('/api/admin/mockup', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ reference, item }),
      });
      if (!res.ok) throw new Error('Erro');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Maquete_${reference}_${item.capacity}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Erro ao gerar maquete PDF');
    }
  };

  const deleteOrder = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'DELETE',
        headers: authHeader(),
        body: JSON.stringify({ id: orderId }),
      });
      if (res.ok) {
        setExpandedId(null);
        await fetchOrders();
      } else {
        setError('Erro ao apagar encomenda');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setActionLoading(null);
    }
  };

  const saveNotes = async (orderId: number, notes: string) => {
    setSavingNotes(orderId);
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ id: orderId, notes }),
      });
    } catch {
      setError('Erro ao guardar notas');
    } finally {
      setSavingNotes(null);
    }
  };

  const saveTracking = async (orderId: number) => {
    const td = trackingData[orderId];
    if (!td || !td.number.trim()) return;
    setActionLoading(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ id: orderId, trackingNumber: td.number.trim(), trackingCarrier: td.carrier }),
      });
      if (res.ok) {
        await fetchOrders();
      } else {
        setError('Erro ao guardar tracking');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setActionLoading(null);
    }
  };

  // ==================== LOGIN SCREEN ====================
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: C.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: C.white, borderRadius: 16, padding: 40, maxWidth: 400, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: C.primary, fontSize: 24, fontWeight: 700, margin: '0 0 8px', textAlign: 'center' }}>PrimeGift Admin</h1>
          <p style={{ color: C.textSec, fontSize: 14, margin: '0 0 24px', textAlign: 'center' }}>Painel de gestão de encomendas</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, marginBottom: 16, boxSizing: 'border-box' }}
          />
          <button onClick={handleLogin} disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: C.white, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
            {loading ? 'A verificar...' : 'Entrar'}
          </button>
          {error && <p style={{ color: C.danger, fontSize: 13, textAlign: 'center', margin: '12px 0 0' }}>{error}</p>}
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD ====================
  const counts = {
    all: allOrders.length,
    pending: allOrders.filter(o => o.status === 'pending').length,
    paid: allOrders.filter(o => o.status === 'paid').length,
    shipped: allOrders.filter(o => o.status === 'shipped').length,
    dispatched: allOrders.filter(o => o.status === 'dispatched').length,
    complaint: allOrders.filter(o => o.status === 'complaint').length,
  };

  // ==================== STOCK ====================
  const STOCK_INITIAL = 100000;
  const STOCK_CUPS = [
    { id: 'pg200', label: 'Copo 200ml', capacity: '200ml' },
    { id: 'pg300', label: 'Copo 300ml', capacity: '300ml' },
    { id: 'pg330', label: 'Copo 330ml', capacity: '330ml' },
    { id: 'pg500', label: 'Copo 500ml', capacity: '500ml' },
  ];

  const activeStatuses = ['pending', 'paid', 'shipped', 'dispatched'];
  const stockUsed: Record<string, number> = {};
  STOCK_CUPS.forEach(c => { stockUsed[c.capacity] = 0; });
  allOrders.forEach(order => {
    if (!activeStatuses.includes(order.status)) return;
    order.order_data.items?.forEach((item: OrderItem) => {
      if (stockUsed[item.capacity] !== undefined) {
        stockUsed[item.capacity] += item.quantity;
      }
    });
  });

  return (
    <div style={{ minHeight: '100vh', background: C.lightBg }}>
      {/* Header */}
      <header style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, padding: '12px 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ color: C.white, fontSize: 20, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              PrimeGift Admin
              {newOrderAlert && (
                <span onClick={() => { setNewOrderAlert(false); setFilter('all'); }} style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#E74C3C', cursor: 'pointer', animation: 'pulse 1.5s infinite', boxShadow: '0 0 8px rgba(231,76,60,0.6)' }} title="Nova encomenda recebida!" />
              )}
            </h1>
            {newOrderAlert && <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }`}</style>}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {!setupDone && (
              <button onClick={handleSetup} style={{ padding: '8px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.2)', color: C.white, border: '1px solid rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                Criar Tabela DB
              </button>
            )}
            <button onClick={() => setActiveTab('orders')}
              style={{ padding: '8px 14px', borderRadius: 6, background: activeTab === 'orders' ? C.white : 'rgba(255,255,255,0.1)', color: activeTab === 'orders' ? C.primary : C.white, border: activeTab === 'orders' ? 'none' : '1px solid rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
              Encomendas
            </button>
            <button onClick={() => setActiveTab('stock')}
              style={{ padding: '8px 14px', borderRadius: 6, background: activeTab === 'stock' ? C.white : 'rgba(255,255,255,0.1)', color: activeTab === 'stock' ? C.primary : C.white, border: activeTab === 'stock' ? 'none' : '1px solid rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
              Stock
            </button>
            <button onClick={() => fetchOrders()} style={{ padding: '8px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.15)', color: C.white, border: '1px solid rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              Atualizar
            </button>
            <button onClick={() => { setAuthed(false); setPassword(''); }} style={{ padding: '8px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 12, cursor: 'pointer' }}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {error && (
          <div style={{ background: '#FDEDEC', border: '1px solid #F5B7B1', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ margin: 0, color: C.danger, fontSize: 13 }}>{error}</p>
          </div>
        )}

        {setupDone && (
          <div style={{ background: '#D5F5E3', border: '1px solid #A9DFBF', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ margin: 0, color: '#1E8449', fontSize: 13 }}>Tabela criada com sucesso! As encomendas vão ser guardadas automaticamente.</p>
          </div>
        )}

        {/* ==================== STOCK TAB ==================== */}
        {activeTab === 'stock' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.primary, margin: '0 0 20px' }}>Controlo de Stock — Armazém</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {STOCK_CUPS.map(cup => {
                const used = stockUsed[cup.capacity];
                const available = STOCK_INITIAL - used;
                const pct = Math.max(0, Math.min(100, (available / STOCK_INITIAL) * 100));
                const barColor = pct > 50 ? C.success : pct > 20 ? C.warning : C.danger;
                return (
                  <div key={cup.id} style={{ background: C.white, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.primary, marginBottom: 4 }}>{cup.label}</div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: barColor, marginBottom: 4 }}>
                      {available.toLocaleString('pt-PT')}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>
                      de {STOCK_INITIAL.toLocaleString('pt-PT')} unidades
                    </div>
                    {/* Progress bar */}
                    <div style={{ background: '#E5E7EB', borderRadius: 6, height: 10, overflow: 'hidden', marginBottom: 12 }}>
                      <div style={{ background: barColor, height: '100%', width: `${pct}%`, borderRadius: 6, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textSec }}>
                      <span>Encomendadas: <strong>{used.toLocaleString('pt-PT')}</strong></span>
                      <span style={{ color: barColor, fontWeight: 700 }}>{pct.toFixed(0)}%</span>
                    </div>
                    {/* Breakdown by status */}
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                      {(['pending', 'paid', 'shipped', 'dispatched'] as const).map(st => {
                        const qty = allOrders.filter(o => o.status === st).reduce((sum, o) =>
                          sum + (o.order_data.items?.filter((it: OrderItem) => it.capacity === cup.capacity).reduce((s: number, it: OrderItem) => s + it.quantity, 0) || 0), 0);
                        if (qty === 0) return null;
                        const stCfg = STATUS_CONFIG[st];
                        return (
                          <div key={st} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                            <span style={{ color: stCfg.color, fontWeight: 600 }}>{stCfg.label}</span>
                            <span style={{ color: C.text, fontWeight: 600 }}>{qty.toLocaleString('pt-PT')} un.</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Total summary */}
            <div style={{ marginTop: 24, background: C.white, borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Stock Total Disponível</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.primary }}>
                    {(STOCK_CUPS.reduce((sum, c) => sum + STOCK_INITIAL - stockUsed[c.capacity], 0)).toLocaleString('pt-PT')} un.
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Total Encomendado</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.warning }}>
                    {(STOCK_CUPS.reduce((sum, c) => sum + stockUsed[c.capacity], 0)).toLocaleString('pt-PT')} un.
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Capacidade Total</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.textSec }}>
                    {(STOCK_INITIAL * STOCK_CUPS.length).toLocaleString('pt-PT')} un.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ORDERS TAB ==================== */}
        {activeTab === 'orders' && <>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { key: 'all', label: 'Total', count: counts.all, color: C.primary },
            { key: 'pending', label: 'Pendentes', count: counts.pending, color: C.warning },
            { key: 'paid', label: 'Pagos/Produção', count: counts.paid, color: C.success },
            { key: 'shipped', label: 'Logística', count: counts.shipped, color: C.info },
            { key: 'dispatched', label: 'Expedidos', count: counts.dispatched, color: '#1ABC9C' },
            { key: 'complaint', label: 'Reclamações', count: counts.complaint, color: '#8E44AD' },
          ].map(stat => (
            <button key={stat.key} onClick={() => { setFilter(stat.key); setNewOrderAlert(false); }}
              style={{ background: filter === stat.key ? stat.color : C.white, color: filter === stat.key ? C.white : stat.color, border: `2px solid ${stat.color}`, borderRadius: 10, padding: '16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{stat.count}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 280px', minWidth: 200 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setNewOrderAlert(false); }}
              placeholder="Pesquisar por referência, nome, email ou telefone..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: 'border-box', background: C.white }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>De:</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{ padding: '9px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>Até:</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                style={{ padding: '9px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: `2px solid ${C.accent}` }}>
            {['all', '200ml', '300ml', '330ml', '500ml'].map(cap => (
              <button key={cap} onClick={() => setCapacityFilter(cap)}
                style={{ padding: '8px 14px', fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer', background: capacityFilter === cap ? C.accent : C.white, color: capacityFilter === cap ? C.white : C.accent, transition: 'all 0.2s' }}>
                {cap === 'all' ? 'Todos' : cap}
              </button>
            ))}
          </div>
          {(searchQuery || dateFrom || dateTo || capacityFilter !== 'all') && (
            <button onClick={() => { setSearchQuery(''); setDateFrom(''); setDateTo(''); setCapacityFilter('all'); }}
              style={{ padding: '9px 14px', borderRadius: 8, background: C.white, color: C.danger, border: `1px solid ${C.danger}`, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Add complaint from dispatched reference */}
        {filter === 'complaint' && (
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowComplaintSearch(!showComplaintSearch)}
              style={{ padding: '8px 16px', borderRadius: 8, background: '#8E44AD', color: C.white, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Adicionar Reclamação
            </button>
            {showComplaintSearch && (
              <div style={{ marginTop: 12, background: C.white, borderRadius: 10, padding: 16, border: `1px solid ${C.border}`, maxWidth: 500, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 8 }}>Introduza a referência de uma encomenda já expedida:</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={complaintSearchRef}
                    onChange={e => setComplaintSearchRef(e.target.value.toUpperCase())}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const ref = complaintSearchRef.trim();
                        const found = allOrders.find(o => o.status === 'dispatched' && (o.reference === ref || o.order_data.items?.some(it => it.reference === ref)));
                        if (found) {
                          updateStatus(found.id, 'complaint');
                          setComplaintSearchRef('');
                          setShowComplaintSearch(false);
                        } else {
                          setError('Referência não encontrada nas encomendas expedidas');
                        }
                      }
                    }}
                    placeholder="Ex: PG1A2B3C"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'monospace', letterSpacing: 1 }}
                  />
                  <button onClick={() => {
                    const ref = complaintSearchRef.trim();
                    const found = allOrders.find(o => o.status === 'dispatched' && (o.reference === ref || o.order_data.items?.some(it => it.reference === ref)));
                    if (found) {
                      updateStatus(found.id, 'complaint');
                      setComplaintSearchRef('');
                      setShowComplaintSearch(false);
                    } else {
                      setError('Referência não encontrada nas encomendas expedidas');
                    }
                  }}
                    style={{ padding: '10px 20px', borderRadius: 8, background: '#8E44AD', color: C.white, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Mover para Reclamação
                  </button>
                </div>
                {/* Show dispatched orders as quick-pick */}
                {(() => {
                  const dispatched = allOrders.filter(o => o.status === 'dispatched');
                  if (dispatched.length === 0) return <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted }}>Não há encomendas expedidas de momento.</div>;
                  const filtered = complaintSearchRef.trim()
                    ? dispatched.filter(o => o.reference.includes(complaintSearchRef.trim()) || o.order_data.items?.some(it => it.reference?.includes(complaintSearchRef.trim())))
                    : dispatched;
                  return (
                    <div style={{ marginTop: 10, maxHeight: 200, overflowY: 'auto' }}>
                      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Encomendas expedidas:</div>
                      {filtered.map(o => (
                        <div key={o.id} onClick={() => {
                          updateStatus(o.id, 'complaint');
                          setComplaintSearchRef('');
                          setShowComplaintSearch(false);
                        }}
                          style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 4, background: C.lightBg, border: `1px solid ${C.border}` }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F4ECF7'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = C.lightBg; }}>
                          <div>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: C.primary, letterSpacing: 1 }}>{o.reference}</span>
                            <span style={{ marginLeft: 10, color: C.textSec }}>{o.order_data.customerName}</span>
                          </div>
                          <span style={{ color: '#8E44AD', fontWeight: 600, fontSize: 12 }}>Selecionar</span>
                        </div>
                      ))}
                      {filtered.length === 0 && <div style={{ fontSize: 12, color: C.textMuted }}>Nenhuma correspondência encontrada.</div>}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}


        {/* Orders list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: C.textMuted }}>A carregar...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: C.textMuted, background: C.white, borderRadius: 12 }}>
            <p style={{ fontSize: 16, margin: 0 }}>Nenhuma encomenda {filter !== 'all' ? `com estado "${STATUS_CONFIG[filter]?.label}"` : ''}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredOrders.map(order => {
              const data = order.order_data;
              const isExpanded = expandedId === order.id;
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

              return (
                <div key={order.id} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  {/* Order header — clickable */}
                  <div onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ background: statusCfg.bg, color: statusCfg.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      {statusCfg.label}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: C.primary, letterSpacing: 1 }}>
                      {order.reference}
                    </div>
                    <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{data.customerName}</div>
                    <div style={{ fontSize: 13, color: C.textSec }}>{data.customerEmail}</div>
                    {order.status === 'pending' && <div style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 16, color: C.primary }}>{fmtPrice(data.total)}</div>}
                    <div style={{ fontSize: 12, color: C.textMuted }}>{fmtDate(order.created_at)}</div>
                    {(filter === 'all' || filter === 'pending') && (
                    <button onClick={(e) => { e.stopPropagation(); if (confirm('Tem a certeza que quer APAGAR esta encomenda?')) deleteOrder(order.id); }}
                      disabled={actionLoading === order.id}
                      style={{ padding: '4px 10px', borderRadius: 6, background: '#922B21', color: C.white, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', opacity: actionLoading === order.id ? 0.6 : 1 }}>
                      Apagar
                    </button>
                    )}
                    <span style={{ fontSize: 12, color: C.textMuted, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>&#x25BC;</span>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${C.border}` }}>
                      {/* Items */}
                      <div style={{ marginTop: 16 }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: C.primary }}>Itens ({data.items.length})</h4>
                        {data.items.map((item, i) => {
                          const itemRef = item.reference || order.reference;
                          return (
                          <div key={i} style={{ padding: '12px', background: C.lightBg, borderRadius: 8, marginBottom: 12, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                              <CupMockup item={item} size={100} />
                              <QRCodeSVG value={itemRef} size={64} level="M" />
                            </div>
                            <div style={{ flex: 1, minWidth: 180 }}>
                              <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: 1, marginBottom: 4 }}>Ref: {itemRef}</div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.product} ({item.capacity})</div>
                              <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>
                                {item.quantity.toLocaleString('pt-PT')} un. · {TECHNIQUE_LABELS[item.printTechnique] || item.printTechnique} · {item.printColor}{order.status === 'pending' ? ` · ${fmtPrice(item.unitPrice)}/un.` : ''}
                              </div>
                              {item.fileName && item.fileUrl && (
                                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.accent, marginTop: 4, display: 'inline-block' }}>
                                  &#x1F4CE; {item.fileName}
                                </a>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); downloadMockup(itemRef, item); }}
                                style={{ display: 'block', marginTop: 6, padding: '4px 10px', borderRadius: 5, background: C.primary, color: C.white, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                Descarregar Maquete PDF
                              </button>
                            </div>
                            {order.status === 'pending' && (
                            <div style={{ fontWeight: 700, fontSize: 14, color: C.primary }}>{fmtPrice(item.itemTotal)}</div>
                            )}
                          </div>
                          );
                        })}
                      </div>

                      {/* Totals — only visible for pending orders */}
                      {order.status === 'pending' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
                        <div style={{ padding: 12, background: C.lightBg, borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Subtotal</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{fmtPrice(data.subtotal)}</div>
                        </div>
                        <div style={{ padding: 12, background: C.lightBg, borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Portes</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{fmtPrice(data.shippingCost)}</div>
                        </div>
                        <div style={{ padding: 12, background: C.lightBg, borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>IVA</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{fmtPrice(data.vat)}</div>
                        </div>
                        <div style={{ padding: 12, background: C.lightBg, borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Total</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: C.primary }}>{fmtPrice(data.total)}</div>
                        </div>
                      </div>
                      )}

                      {/* Customer & Delivery — full details only for pending */}
                      {order.status !== 'pending' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginTop: 16 }}>
                        <div style={{ padding: 16, background: C.lightBg, borderRadius: 8 }}>
                          <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: C.primary }}>Cliente</h4>
                          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>
                            <div><strong>{data.customerName}</strong></div>
                            <div>{data.customerEmail}</div>
                            {data.customerPhone && <div>{data.customerPhone}</div>}
                          </div>
                        </div>
                      </div>
                      ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginTop: 16 }}>
                        <div style={{ padding: 16, background: C.lightBg, borderRadius: 8 }}>
                          <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: C.primary }}>Cliente</h4>
                          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>
                            <div><strong>{data.customerName}</strong></div>
                            <div>{data.customerEmail}</div>
                            {data.customerPhone && <div>{data.customerPhone}</div>}
                          </div>
                        </div>
                        <div style={{ padding: 16, background: C.lightBg, borderRadius: 8 }}>
                          <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: C.primary }}>Entrega</h4>
                          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>
                            <div>{data.deliveryAddress}</div>
                            <div>{data.deliveryPostalCode} {data.deliveryCity}</div>
                          </div>
                        </div>
                        <div style={{ padding: 16, background: C.lightBg, borderRadius: 8 }}>
                          <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: C.primary }}>Pagamento</h4>
                          <div style={{ fontSize: 13, color: C.text }}>
                            {PAYMENT_LABELS[data.paymentMethod] || data.paymentMethod}
                          </div>
                          {data.invoiceName && (
                            <div style={{ marginTop: 8, fontSize: 12, color: C.textSec }}>
                              <strong>Faturação:</strong> {data.invoiceName} {data.invoiceNif ? `(NIF: ${data.invoiceNif})` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      )}

                      {/* Timestamps */}
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, fontSize: 12, color: C.textMuted }}>
                        <span>Criada: {fmtDate(order.created_at)}</span>
                        {order.paid_at && <span>Paga: {fmtDate(order.paid_at)}</span>}
                        {order.shipped_at && <span>Logística: {fmtDate(order.shipped_at)}</span>}
                      </div>

                      {/* Tracking */}
                      {(order.status === 'shipped' || order.status === 'dispatched') && (
                        <div style={{ marginTop: 16, padding: 16, background: '#EBF5FB', borderRadius: 8, border: '1px solid #AED6F1' }}>
                          <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: C.info }}>Tracking de Envio</h4>
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>Transportadora</label>
                              <select
                                value={trackingData[order.id]?.carrier || data.trackingCarrier || ''}
                                onChange={e => setTrackingData(prev => ({ ...prev, [order.id]: { ...prev[order.id], carrier: e.target.value, number: prev[order.id]?.number || data.trackingNumber || '' } }))}
                                style={{ padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.white, minWidth: 140 }}>
                                <option value="">Selecionar...</option>
                                <option value="CTT">CTT</option>
                                <option value="DPD">DPD</option>
                                <option value="GLS">GLS</option>
                                <option value="MRW">MRW</option>
                                <option value="SEUR">SEUR</option>
                                <option value="Vasp">Vasp</option>
                                <option value="Outro">Outro</option>
                              </select>
                            </div>
                            <div style={{ flex: 1, minWidth: 180 }}>
                              <label style={{ display: 'block', fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>Número de Tracking</label>
                              <input
                                type="text"
                                value={trackingData[order.id]?.number !== undefined ? trackingData[order.id].number : (data.trackingNumber || '')}
                                onChange={e => setTrackingData(prev => ({ ...prev, [order.id]: { carrier: prev[order.id]?.carrier || data.trackingCarrier || '', number: e.target.value } }))}
                                placeholder="Ex: CTT123456789PT"
                                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: 'border-box', background: C.white, fontFamily: 'monospace' }}
                              />
                            </div>
                            <button onClick={() => saveTracking(order.id)} disabled={actionLoading === order.id}
                              style={{ padding: '9px 18px', borderRadius: 8, background: C.info, color: C.white, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', opacity: actionLoading === order.id ? 0.6 : 1 }}>
                              {actionLoading === order.id ? 'A guardar...' : 'Guardar Tracking'}
                            </button>
                          </div>
                          {data.trackingUrl && (
                            <div style={{ marginTop: 10 }}>
                              <a href={data.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.info, fontSize: 13, fontWeight: 600, textDecoration: 'underline' }}>
                                Seguir Envio
                              </a>
                            </div>
                          )}
                          {data.trackingNumber && !data.trackingUrl && (
                            <div style={{ marginTop: 8, fontSize: 12, color: C.textSec }}>
                              Tracking guardado: <strong>{data.trackingCarrier}</strong> — <span style={{ fontFamily: 'monospace' }}>{data.trackingNumber}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes — for complaint orders */}
                      {order.status === 'complaint' && (
                        <div style={{ marginTop: 16, padding: 16, background: '#F4ECF7', borderRadius: 8, border: '1px solid #D2B4DE' }}>
                          <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#8E44AD' }}>Notas da Reclamação</h4>
                          <textarea
                            value={orderNotes[order.id] !== undefined ? orderNotes[order.id] : (data.notes as string || '')}
                            onChange={e => setOrderNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                            placeholder="Escreva aqui as notas sobre esta reclamação..."
                            rows={3}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D2B4DE', fontSize: 13, resize: 'vertical', fontFamily: 'system-ui', boxSizing: 'border-box', background: C.white }}
                          />
                          <button onClick={() => {
                            const notes = orderNotes[order.id] !== undefined ? orderNotes[order.id] : (data.notes as string || '');
                            saveNotes(order.id, notes);
                          }}
                            disabled={savingNotes === order.id}
                            style={{ marginTop: 8, padding: '6px 16px', borderRadius: 6, background: '#8E44AD', color: C.white, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: savingNotes === order.id ? 0.6 : 1 }}>
                            {savingNotes === order.id ? 'A guardar...' : 'Guardar Notas'}
                          </button>
                        </div>
                      )}

                      {/* Show saved notes for non-complaint statuses if they exist */}
                      {order.status !== 'complaint' && data.notes && (
                        <div style={{ marginTop: 16, padding: 12, background: '#F4ECF7', borderRadius: 8, border: '1px solid #D2B4DE' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#8E44AD' }}>Nota: </span>
                          <span style={{ fontSize: 13, color: C.text }}>{data.notes as string}</span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Avançar — botão principal */}
                        {order.status === 'pending' && (
                          <button onClick={() => updateStatus(order.id, 'paid')} disabled={actionLoading === order.id}
                            style={{ padding: '10px 20px', borderRadius: 8, background: C.success, color: C.white, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: actionLoading === order.id ? 0.6 : 1 }}>
                            {actionLoading === order.id ? 'A processar...' : 'Confirmar Pagamento'}
                          </button>
                        )}
                        {order.status === 'paid' && (
                          <button onClick={() => updateStatus(order.id, 'shipped')} disabled={actionLoading === order.id}
                            style={{ padding: '10px 20px', borderRadius: 8, background: C.info, color: C.white, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: actionLoading === order.id ? 0.6 : 1 }}>
                            {actionLoading === order.id ? 'A processar...' : 'Enviar para Logística'}
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button onClick={() => updateStatus(order.id, 'dispatched')} disabled={actionLoading === order.id}
                            style={{ padding: '10px 20px', borderRadius: 8, background: '#1ABC9C', color: C.white, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: actionLoading === order.id ? 0.6 : 1 }}>
                            {actionLoading === order.id ? 'A processar...' : 'Marcar como Expedido'}
                          </button>
                        )}
                        {/* Retroceder */}
                        {order.status === 'paid' && (
                          <button onClick={() => updateStatus(order.id, 'pending')} disabled={actionLoading === order.id}
                            style={{ padding: '10px 20px', borderRadius: 8, background: C.white, color: C.warning, border: `2px solid ${C.warning}`, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: actionLoading === order.id ? 0.6 : 1 }}>
                            Voltar a Pendente
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button onClick={() => updateStatus(order.id, 'paid')} disabled={actionLoading === order.id}
                            style={{ padding: '10px 20px', borderRadius: 8, background: C.white, color: C.warning, border: `2px solid ${C.warning}`, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: actionLoading === order.id ? 0.6 : 1 }}>
                            Voltar a Produção
                          </button>
                        )}
                        {order.status === 'dispatched' && (
                          <button onClick={() => updateStatus(order.id, 'shipped')} disabled={actionLoading === order.id}
                            style={{ padding: '10px 20px', borderRadius: 8, background: C.white, color: C.warning, border: `2px solid ${C.warning}`, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: actionLoading === order.id ? 0.6 : 1 }}>
                            Voltar a Logística
                          </button>
                        )}
                        {order.status === 'dispatched' && (
                          <button onClick={() => updateStatus(order.id, 'complaint')} disabled={actionLoading === order.id}
                            style={{ padding: '10px 20px', borderRadius: 8, background: '#8E44AD', color: C.white, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: actionLoading === order.id ? 0.6 : 1 }}>
                            Marcar Reclamação
                          </button>
                        )}
                        {order.status === 'cancelled' && (
                          <button onClick={() => updateStatus(order.id, 'pending')} disabled={actionLoading === order.id}
                            style={{ padding: '10px 20px', borderRadius: 8, background: C.white, color: C.warning, border: `2px solid ${C.warning}`, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: actionLoading === order.id ? 0.6 : 1 }}>
                            Reabrir como Pendente
                          </button>
                        )}
                        {/* Separador visual */}
                        <div style={{ flex: 1 }} />
                        {/* Cancelar */}
                        {(order.status === 'pending' || order.status === 'paid') && (
                          <button onClick={() => { if (confirm('Tem a certeza que quer cancelar esta encomenda?')) updateStatus(order.id, 'cancelled'); }} disabled={actionLoading === order.id}
                            style={{ padding: '10px 20px', borderRadius: 8, background: C.white, color: C.danger, border: `1px solid ${C.danger}`, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                            Cancelar
                          </button>
                        )}
                        {/* Apagar — only visible in Total and Pendentes tabs */}
                        {(filter === 'all' || filter === 'pending') && (order.status === 'pending' || order.status === 'paid') && (
                        <button onClick={() => { if (confirm('Tem a certeza que quer APAGAR esta encomenda? Esta ação é irreversível.')) deleteOrder(order.id); }} disabled={actionLoading === order.id}
                          style={{ padding: '10px 20px', borderRadius: 8, background: '#922B21', color: C.white, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: actionLoading === order.id ? 0.6 : 1 }}>
                          Apagar
                        </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </>}
      </div>
    </div>
  );
}
