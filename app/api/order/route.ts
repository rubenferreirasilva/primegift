import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import nodemailer from 'nodemailer';

interface OrderData {
  reference: string;
  product: string;
  capacity: string;
  quantity: number;
  printTechnique: string;
  printColor: string;
  unitPrice: number;
  subtotal: number;
  shippingCost: number;
  vat: number;
  total: number;
  paymentMethod: string;
  shippingMethod: string;
  shippingRegion: string;
  deliveryName: string;
  deliveryAddress: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  invoiceName: string;
  invoiceNif: string;
  invoiceAddress: string;
  invoicePostalCode: string;
  invoiceCity: string;
  fileUrl: string | null;
  fileName: string | null;
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

const SHIPPING_LABELS: Record<string, string> = {
  'next-day': 'Entrega Expresso (~7 dias úteis)',
  '2-days': 'Envio Standard (~2 semanas)',
  'collect': 'Ponto Collectt (~2 semanas)',
  'standard': 'Envio Standard (~2 semanas)',
};

async function sendOrderEmail(data: OrderData) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const row = (label: string, value: string) =>
    `<tr><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid #eee;color:#1B2A4A;white-space:nowrap">${label}</td><td style="padding:10px 12px;border-bottom:1px solid #eee;color:#555">${value}</td></tr>`;

  const hasInvoice = data.invoiceName || data.invoiceNif;
  const hasFile = data.fileName && data.fileUrl;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1B2A4A,#2E86AB);padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Nova Encomenda PrimeGift</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:16px">Referência: <strong style="color:white">${data.reference}</strong></p>
      </div>
      <div style="background:#f8f9fa;padding:24px 32px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="color:#1B2A4A;font-size:16px;margin:0 0 12px;border-bottom:2px solid #2E86AB;padding-bottom:8px">Detalhes do Pedido</h2>
        <table style="border-collapse:collapse;width:100%">
          ${row('Referência', `<strong>${data.reference}</strong>`)}
          ${row('Produto', `${data.product} (${data.capacity})`)}
          ${row('Quantidade', `${data.quantity.toLocaleString('pt-PT')} unidades`)}
          ${row('Técnica', TECHNIQUE_LABELS[data.printTechnique] || data.printTechnique)}
          ${row('Cor de Impressão', data.printColor)}
          ${row('Preço Unitário', `${data.unitPrice.toFixed(2).replace('.', ',')}€`)}
          ${row('Subtotal', `${data.subtotal.toFixed(2).replace('.', ',')}€`)}
          ${row('Portes', `${data.shippingCost.toFixed(2).replace('.', ',')}€`)}
          ${row('IVA (23%)', `${data.vat.toFixed(2).replace('.', ',')}€`)}
          ${row('Total', `<strong style="color:#1B2A4A;font-size:16px">${data.total.toFixed(2).replace('.', ',')}€</strong>`)}
        </table>

        ${hasFile ? `
        <h2 style="color:#1B2A4A;font-size:16px;margin:20px 0 12px;border-bottom:2px solid #2E86AB;padding-bottom:8px">Ficheiro</h2>
        <table style="border-collapse:collapse;width:100%">
          ${row('Ficheiro', `<a href="${data.fileUrl}" style="color:#2E86AB">${data.fileName}</a>`)}
        </table>
        ` : ''}

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

  await transporter.sendMail({
    from: `"PrimeGift Encomendas" <${process.env.SMTP_USER}>`,
    to: 'info@metalprime.pt',
    subject: `Nova Encomenda ${data.reference} — ${data.product} ${data.capacity} × ${data.quantity}`,
    html,
  });
}

export async function POST(req: NextRequest) {
  try {
    const data: OrderData = await req.json();

    if (!data.reference || !data.product || !data.quantity) {
      return NextResponse.json({ error: 'Dados obrigatórios em falta' }, { status: 400 });
    }

    waitUntil(sendOrderEmail(data));

    return NextResponse.json({ success: true, reference: data.reference });
  } catch (error) {
    console.error('Erro ao processar encomenda:', error);
    return NextResponse.json({ error: 'Erro ao processar encomenda' }, { status: 500 });
  }
}
