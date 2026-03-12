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
  fileUrl: string | null;
  fileName: string | null;
}

const PAYMENT_LABELS: Record<string, string> = {
  transfer: 'Transferência Bancária',
  paypal: 'PayPal',
  mbway: 'MB WAY',
  revolut: 'Revolut',
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

async function sendOrderEmails(data: OrderData) {
  const transporter = createTransporter();

  const hasInvoice = data.invoiceName || data.invoiceNif;
  const hasFile = data.fileName && data.fileUrl;
  const technique = TECHNIQUE_LABELS[data.printTechnique] || data.printTechnique;

  // ==================== EMAIL TO METALPRIME (full details) ====================
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

        <h2 style="color:#1B2A4A;font-size:16px;margin:20px 0 12px;border-bottom:2px solid #2E86AB;padding-bottom:8px">Detalhes do Pedido</h2>
        <table style="border-collapse:collapse;width:100%">
          ${row('Referência', `<strong>${data.reference}</strong>`)}
          ${row('Produto', `${data.product} (${data.capacity})`)}
          ${row('Quantidade', `${data.quantity.toLocaleString('pt-PT')} unidades`)}
          ${row('Técnica', technique)}
          ${row('Cor de Impressão', data.printColor)}
          ${row('Preço Unitário', fmtPrice(data.unitPrice))}
          ${row('Subtotal', fmtPrice(data.subtotal))}
          ${row('Portes', fmtPrice(data.shippingCost))}
          ${row('IVA (23%)', fmtPrice(data.vat))}
          ${row('Total', `<strong style="color:#1B2A4A;font-size:16px">${fmtPrice(data.total)}</strong>`)}
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

  // ==================== EMAIL TO CUSTOMER (order confirmation) ====================
  const customerHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1B2A4A,#2E86AB);padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Confirmação de Encomenda</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">PrimeGift — Uma marca do Grupo MetalPrime</p>
      </div>
      <div style="background:#f8f9fa;padding:24px 32px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#333;font-size:15px;margin:0 0 20px">Olá <strong>${data.customerName}</strong>, obrigado pela sua encomenda! Aqui está o resumo do seu pedido:</p>

        <div style="background:white;border-radius:8px;padding:16px;border:1px solid #e0e0e0;margin-bottom:20px">
          <table style="border-collapse:collapse;width:100%">
            ${row('Referência', `<strong style="font-family:monospace;letter-spacing:1px;color:#1B2A4A;font-size:16px">${data.reference}</strong>`)}
            ${row('Produto', `${data.product} (${data.capacity})`)}
            ${row('Quantidade', `${data.quantity.toLocaleString('pt-PT')} unidades`)}
            ${row('Técnica de Impressão', technique)}
            ${row('Cor', data.printColor)}
            ${row('Preço Unitário', fmtPrice(data.unitPrice))}
          </table>
        </div>

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
          <p style="margin:8px 0 0;font-size:13px;color:#2C3E50">Iremos analisar o seu pedido e enviar a maquete digital para aprovação. Após aprovação, a produção inicia em 5 dias úteis.</p>
        </div>

        <p style="color:#999;font-size:12px;margin:20px 0 0;text-align:center">PrimeGift — Uma marca do Grupo MetalPrime<br>info@metalprime.pt</p>
      </div>
    </div>
  `;

  // Send both emails
  await Promise.all([
    transporter.sendMail({
      from: `"PrimeGift Encomendas" <${process.env.SMTP_USER}>`,
      to: 'info@metalprime.pt',
      subject: `Nova Encomenda ${data.reference} — ${data.product} ${data.capacity} × ${data.quantity}`,
      html: adminHtml,
    }),
    transporter.sendMail({
      from: `"PrimeGift" <${process.env.SMTP_USER}>`,
      to: data.customerEmail,
      replyTo: 'info@metalprime.pt',
      subject: `Confirmação de Encomenda ${data.reference} — PrimeGift`,
      html: customerHtml,
    }),
  ]);
}

export async function POST(req: NextRequest) {
  try {
    const data: OrderData = await req.json();

    if (!data.reference || !data.product || !data.quantity) {
      return NextResponse.json({ error: 'Dados obrigatórios em falta' }, { status: 400 });
    }

    waitUntil(sendOrderEmails(data));

    return NextResponse.json({ success: true, reference: data.reference });
  } catch (error) {
    console.error('Erro ao processar encomenda:', error);
    return NextResponse.json({ error: 'Erro ao processar encomenda' }, { status: 500 });
  }
}
