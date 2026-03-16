import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { getSupabase } from '@/app/lib/supabase';
import { generateMockupPDFBuffer, fetchLogoAsDataUrl } from '@/app/lib/mockup';
import nodemailer from 'nodemailer';

interface OrderItem {
  reference: string;
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
  shippingRegion: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryName: string;
  deliveryAddress: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  invoiceName: string;
  invoiceNif: string;
  invoiceAddress: string;
  invoicePostalCode: string;
  invoiceCity: string;
}

const PAYMENT_LABELS: Record<string, string> = {
  stripe: 'Cartão (Stripe)',
  transfer: 'Transferência Bancária',
  paypal: 'PayPal',
  mbway: 'MB WAY',
};

const TECHNIQUE_LABELS: Record<string, string> = {
  tampografia: 'Tampografia',
  serigrafia: 'Serigrafia Rotativa',
};

const SHIPPING_LABELS: Record<string, string> = {
  'next-day': 'Entrega Expresso (~7 dias úteis)',
  '2-days': 'Envio Standard (~2 semanas)',
  'collect': 'Ponto Collectt (~2 semanas)',
  'standard': 'Envio Standard (~2 semanas)',
};

function fmtPrice(n: number): string {
  return n.toFixed(2).replace('.', ',') + '€';
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const row = (label: string, value: string) =>
  `<tr><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid #eee;color:#1B2A4A;white-space:nowrap">${label}</td><td style="padding:10px 12px;border-bottom:1px solid #eee;color:#555">${value}</td></tr>`;

function renderItemRows(item: OrderItem): string {
  const technique = TECHNIQUE_LABELS[item.printTechnique] || item.printTechnique;
  return `
    <div style="background:white;border-radius:8px;padding:16px;border:1px solid #e0e0e0;margin-bottom:12px">
      <table style="border-collapse:collapse;width:100%">
        ${row('Referência', `<strong style="font-family:monospace;letter-spacing:1px;color:#1B2A4A">${item.reference}</strong>`)}
        ${row('Produto', `${item.product} (${item.capacity})`)}
        ${row('Quantidade', `${item.quantity.toLocaleString('pt-PT')} unidades`)}
        ${row('Técnica', technique)}
        ${row('Cor de Impressão', item.printColor)}
        ${row('Preço Unitário', fmtPrice(item.unitPrice))}
        ${row('Subtotal Item', `<strong>${fmtPrice(item.itemTotal)}</strong>`)}
        ${item.fileName && item.fileUrl ? row('Ficheiro', `<a href="${item.fileUrl}" style="color:#2E86AB">${item.fileName}</a>`) : ''}
      </table>
    </div>
  `;
}

async function sendOrderEmails(data: OrderData) {
  const transporter = createTransporter();

  const hasInvoice = data.invoiceName || data.invoiceNif;
  const itemCount = data.items.reduce((sum, i) => sum + i.quantity, 0);
  const itemsSummary = data.items.map(i => `${i.product} ${i.capacity} ×${i.quantity}`).join(', ');

  // ==================== EMAIL TO ADMIN (full details) ====================
  const adminHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1B2A4A,#2E86AB);padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Nova Encomenda PrimeGift</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:16px">Referência: <strong style="color:white">${data.reference}</strong></p>
      </div>
      <div style="background:#f8f9fa;padding:24px 32px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="color:#1B2A4A;font-size:16px;margin:0 0 12px;border-bottom:2px solid #2E86AB;padding-bottom:8px">Cliente</h2>
        <table style="border-collapse:collapse;width:100%">
          ${row('Nome', data.customerName)}
          ${row('Email', data.customerEmail)}
          ${data.customerPhone ? row('Telefone', data.customerPhone) : ''}
        </table>

        <h2 style="color:#1B2A4A;font-size:16px;margin:20px 0 12px;border-bottom:2px solid #2E86AB;padding-bottom:8px">Itens do Pedido (${data.items.length})</h2>
        ${data.items.map(renderItemRows).join('')}

        <table style="border-collapse:collapse;width:100%;margin-top:8px">
          ${row('Subtotal', fmtPrice(data.subtotal))}
          ${row('Portes', fmtPrice(data.shippingCost))}
          ${row('IVA (23%)', fmtPrice(data.vat))}
          ${row('Total', `<strong style="color:#1B2A4A;font-size:16px">${fmtPrice(data.total)}</strong>`)}
        </table>

        <h2 style="color:#1B2A4A;font-size:16px;margin:20px 0 12px;border-bottom:2px solid #2E86AB;padding-bottom:8px">Entrega</h2>
        <table style="border-collapse:collapse;width:100%">
          ${row('Nome', data.deliveryName || '—')}
          ${row('Morada', data.deliveryAddress || '—')}
          ${row('Código Postal', data.deliveryPostalCode || '—')}
          ${row('Localidade', data.deliveryCity || '—')}
          ${row('Prazo', SHIPPING_LABELS[data.shippingMethod] || data.shippingMethod)}
        </table>

        <h2 style="color:#1B2A4A;font-size:16px;margin:20px 0 12px;border-bottom:2px solid #2E86AB;padding-bottom:8px">Pagamento</h2>
        <table style="border-collapse:collapse;width:100%">
          ${row('Método', PAYMENT_LABELS[data.paymentMethod] || data.paymentMethod)}
        </table>

        ${hasInvoice ? `
        <h2 style="color:#1B2A4A;font-size:16px;margin:20px 0 12px;border-bottom:2px solid #2E86AB;padding-bottom:8px">Faturação</h2>
        <table style="border-collapse:collapse;width:100%">
          ${data.invoiceName ? row('Nome/Empresa', data.invoiceName) : ''}
          ${data.invoiceNif ? row('NIF', data.invoiceNif) : ''}
          ${data.invoiceAddress ? row('Morada', `${data.invoiceAddress}${data.invoicePostalCode ? ', ' + data.invoicePostalCode : ''}${data.invoiceCity ? ' ' + data.invoiceCity : ''}`) : ''}
        </table>
        ` : ''}
      </div>
    </div>
  `;

  // ==================== EMAIL TO CUSTOMER (order confirmation) ====================
  const customerHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1B2A4A,#2E86AB);padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Confirmação de Encomenda</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">PrimeGift</p>
      </div>
      <div style="background:#f8f9fa;padding:24px 32px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#333;font-size:15px;margin:0 0 20px">Olá <strong>${data.customerName}</strong>, obrigado pela sua encomenda! Aqui está o resumo do seu pedido:</p>

        <div style="background:white;border-radius:8px;padding:16px;border:1px solid #e0e0e0;margin-bottom:12px">
          <table style="border-collapse:collapse;width:100%">
            ${row('Referência', `<strong style="font-family:monospace;letter-spacing:1px;color:#1B2A4A;font-size:16px">${data.reference}</strong>`)}
          </table>
        </div>

        ${data.items.map(item => {
          const technique = TECHNIQUE_LABELS[item.printTechnique] || item.printTechnique;
          return `
          <div style="background:white;border-radius:8px;padding:16px;border:1px solid #e0e0e0;margin-bottom:12px">
            <table style="border-collapse:collapse;width:100%">
              ${row('Produto', `${item.product} (${item.capacity})`)}
              ${row('Quantidade', `${item.quantity.toLocaleString('pt-PT')} unidades`)}
              ${row('Técnica de Impressão', technique)}
              ${row('Cor', item.printColor)}
              ${row('Preço Unitário', fmtPrice(item.unitPrice))}
              ${row('Subtotal', `<strong>${fmtPrice(item.itemTotal)}</strong>`)}
            </table>
          </div>
          `;
        }).join('')}

        <div style="background:white;border-radius:8px;padding:16px;border:1px solid #e0e0e0;margin-bottom:20px">
          <table style="border-collapse:collapse;width:100%">
            ${row('Subtotal', fmtPrice(data.subtotal))}
            ${row('Portes', fmtPrice(data.shippingCost))}
            ${row('IVA (23%)', fmtPrice(data.vat))}
            ${row('Total', `<strong style="color:#1B2A4A;font-size:18px">${fmtPrice(data.total)}</strong>`)}
          </table>
        </div>

        <p style="color:#555;font-size:13px;margin:0 0 8px">Método de pagamento: <strong>${PAYMENT_LABELS[data.paymentMethod] || data.paymentMethod}</strong></p>
        <p style="color:#555;font-size:13px;margin:0 0 20px">Prazo de entrega: <strong>${SHIPPING_LABELS[data.shippingMethod] || data.shippingMethod}</strong></p>

        <div style="background:#EBF5FB;border-radius:8px;padding:16px;border:1px solid #AED6F1;margin-bottom:20px">
          <p style="margin:0;font-size:14px;color:#1B4F72"><strong>Próximos passos:</strong></p>
          <p style="margin:8px 0 0;font-size:13px;color:#2C3E50">Iremos analisar o seu pedido. Após confirmação, a produção inicia em 5 dias úteis.</p>
        </div>

        <p style="color:#999;font-size:12px;margin:20px 0 0;text-align:center">PrimeGift<br>geral@primegift.pt</p>
      </div>
    </div>
  `;

  // Generate mockup PDFs for each item
  const mockupAttachments = await Promise.all(
    data.items.map(async (item, i) => {
      try {
        const logoDataUrl = item.fileUrl ? await fetchLogoAsDataUrl(item.fileUrl) : null;
        const itemRef = item.reference || data.reference;
        const pdfBuffer = await generateMockupPDFBuffer({
          capacity: item.capacity,
          printColor: item.printColor,
          logoDataUrl,
          reference: itemRef,
          productName: `${item.product} (${item.capacity})`,
          quantity: item.quantity,
          technique: item.printTechnique,
        });
        return {
          filename: `Maquete_${itemRef}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        };
      } catch (err) {
        console.error('Erro ao gerar maquete PDF:', err);
        return null;
      }
    })
  );

  const attachments = mockupAttachments.filter(Boolean) as { filename: string; content: Buffer; contentType: string }[];

  // Send both emails
  await Promise.all([
    transporter.sendMail({
      from: `"PrimeGift Encomendas" <${process.env.SMTP_USER}>`,
      to: 'geral@primegift.pt',
      subject: `Nova Encomenda ${data.reference} — ${itemsSummary} (${itemCount} un.)`,
      html: adminHtml,
      attachments,
    }),
    transporter.sendMail({
      from: `"PrimeGift" <${process.env.SMTP_USER}>`,
      to: data.customerEmail,
      replyTo: 'geral@primegift.pt',
      subject: `Confirmação de Encomenda ${data.reference} — PrimeGift`,
      html: customerHtml,
    }),
  ]);
}

const STOCK_INITIAL = 100000;
const STOCK_ALERT_THRESHOLD = 50000;
const STOCK_CAPACITIES = ['200ml', '250ml', '330ml', '500ml'];

async function checkStockAndAlert() {
  try {
    const sb = getSupabase();
    if (!sb) return;

    const { data: orders, error } = await sb.from('orders').select('order_data, status');
    if (error || !orders) return;

    const used: Record<string, number> = {};
    STOCK_CAPACITIES.forEach(c => { used[c] = 0; });

    for (const order of orders) {
      if (!['pending', 'paid', 'shipped', 'dispatched'].includes(order.status)) continue;
      const items = (order.order_data as Record<string, unknown>).items as Array<{ capacity: string; quantity: number }> | undefined;
      if (!items) continue;
      for (const item of items) {
        if (used[item.capacity] !== undefined) {
          used[item.capacity] += item.quantity;
        }
      }
    }

    const lowStock: { capacity: string; available: number }[] = [];
    for (const cap of STOCK_CAPACITIES) {
      const available = STOCK_INITIAL - used[cap];
      if (available < STOCK_ALERT_THRESHOLD) {
        lowStock.push({ capacity: cap, available });
      }
    }

    if (lowStock.length === 0) return;

    const transporter = createTransporter();
    const rows = lowStock.map(s =>
      `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${s.capacity}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:${s.available < 20000 ? '#E74C3C' : '#F39C12'};font-weight:700">${s.available.toLocaleString('pt-PT')} un.</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#999">${STOCK_INITIAL.toLocaleString('pt-PT')} un.</td></tr>`
    ).join('');

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#E74C3C,#C0392B);padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">Alerta de Stock Baixo</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">PrimeGift — Controlo de Armazém</p>
        </div>
        <div style="background:#f8f9fa;padding:24px 32px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px">
          <p style="color:#333;font-size:15px;margin:0 0 16px">Os seguintes produtos estão abaixo do limite de <strong>${STOCK_ALERT_THRESHOLD.toLocaleString('pt-PT')} unidades</strong>:</p>
          <table style="border-collapse:collapse;width:100%;background:white;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0">
            <tr style="background:#1B2A4A;color:white"><th style="padding:10px 12px;text-align:left;font-size:13px">Produto</th><th style="padding:10px 12px;text-align:left;font-size:13px">Disponível</th><th style="padding:10px 12px;text-align:left;font-size:13px">Capacidade</th></tr>
            ${rows}
          </table>
          <p style="color:#555;font-size:13px;margin:20px 0 0">Considere reabastecer o stock em breve.</p>
          <p style="color:#999;font-size:12px;margin:20px 0 0;text-align:center">PrimeGift</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"PrimeGift Stock" <${process.env.SMTP_USER}>`,
      to: 'geral@primegift.pt',
      subject: `Alerta Stock Baixo — ${lowStock.map(s => s.capacity).join(', ')} — PrimeGift`,
      html,
    });
  } catch (err) {
    console.error('Stock check error:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data: OrderData = await req.json();

    if (!data.reference || !data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Dados obrigatórios em falta' }, { status: 400 });
    }

    // Save to database synchronously (need orderId for Stripe)
    const sb = getSupabase();
    let orderId: number | null = null;
    if (sb) {
      const { data: row, error } = await sb
        .from('orders')
        .insert({ reference: data.reference, status: 'pending', order_data: data })
        .select('id')
        .single();
      if (error) {
        console.error('DB save error:', error);
        return NextResponse.json({ error: 'Erro ao guardar encomenda' }, { status: 500 });
      }
      orderId = row.id;
    }

    // Send emails and check stock in background
    waitUntil(
      sendOrderEmails(data).then(() => checkStockAndAlert())
    );

    return NextResponse.json({ success: true, reference: data.reference, orderId, total: data.total });
  } catch (error) {
    console.error('Erro ao processar encomenda:', error);
    return NextResponse.json({ error: 'Erro ao processar encomenda' }, { status: 500 });
  }
}
