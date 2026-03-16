import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/app/lib/supabase';
import nodemailer from 'nodemailer';

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  if (!auth) return false;
  const token = auth.replace('Bearer ', '');
  return token === process.env.ADMIN_PASSWORD;
}

// GET — list all orders
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'Database não configurada' }, { status: 500 });

  try {
    const status = req.nextUrl.searchParams.get('status');
    const search = req.nextUrl.searchParams.get('search');
    const from = req.nextUrl.searchParams.get('from');
    const to = req.nextUrl.searchParams.get('to');

    let query = sb.from('orders').select('*').order('created_at', { ascending: false });
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.ilike('reference', `%${search}%`);
    }
    if (from) {
      query = query.gte('created_at', from);
    }
    if (to) {
      query = query.lte('created_at', to);
    }
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    console.error('Erro ao listar encomendas:', error);
    return NextResponse.json({ error: 'Erro ao listar encomendas' }, { status: 500 });
  }
}

// PATCH — update order status
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'Database não configurada' }, { status: 500 });

  try {
    const body = await req.json();
    const { id, status, notes, trackingNumber, trackingCarrier } = body;

    // Notes-only or tracking-only update (no status change)
    if (id && !status && (notes !== undefined || trackingNumber || trackingCarrier)) {
      const { data: current, error: fetchErr } = await sb.from('orders').select('order_data').eq('id', id).single();
      if (fetchErr || !current) return NextResponse.json({ error: 'Encomenda não encontrada' }, { status: 404 });
      const updatedData = { ...current.order_data };
      if (notes !== undefined) updatedData.notes = notes;
      if (trackingNumber) updatedData.trackingNumber = trackingNumber;
      if (trackingCarrier) updatedData.trackingCarrier = trackingCarrier;
      if (trackingNumber && trackingCarrier) {
        const url = generateTrackingUrl(trackingCarrier, trackingNumber);
        if (url) updatedData.trackingUrl = url;
      }
      const { error: updErr } = await sb.from('orders').update({ order_data: updatedData }).eq('id', id);
      if (updErr) throw updErr;
      const { data: order } = await sb.from('orders').select('*').eq('id', id).single();
      return NextResponse.json({ success: true, order });
    }

    if (!id || !status) {
      return NextResponse.json({ error: 'ID e status obrigatórios' }, { status: 400 });
    }

    const validStatuses = ['pending', 'paid', 'shipped', 'dispatched', 'complaint', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { status };
    if (status === 'paid') updates.paid_at = new Date().toISOString();
    if (status === 'shipped') updates.shipped_at = new Date().toISOString();

    // Merge notes and/or tracking into order_data when needed
    if ((status === 'complaint' && notes) || trackingNumber || trackingCarrier) {
      const { data: current } = await sb.from('orders').select('order_data').eq('id', id).single();
      if (current) {
        const mergedData = { ...current.order_data };
        if (notes) mergedData.notes = notes;
        if (trackingNumber) mergedData.trackingNumber = trackingNumber;
        if (trackingCarrier) mergedData.trackingCarrier = trackingCarrier;
        if (trackingNumber && trackingCarrier) {
          const url = generateTrackingUrl(trackingCarrier, trackingNumber);
          if (url) mergedData.trackingUrl = url;
        }
        updates.order_data = mergedData;
      }
    }

    const { error: updateError } = await sb.from('orders').update(updates).eq('id', id);
    if (updateError) throw updateError;

    const { data: order, error: fetchError } = await sb.from('orders').select('*').eq('id', id).single();
    if (fetchError || !order) {
      return NextResponse.json({ error: 'Encomenda não encontrada' }, { status: 404 });
    }

    // Send email on status change
    if (status === 'paid' || status === 'dispatched') {
      try {
        await sendStatusEmail(order.order_data, order.reference, status);
      } catch (emailError) {
        console.error('Erro ao enviar email de status:', emailError);
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Erro ao atualizar encomenda:', error);
    return NextResponse.json({ error: 'Erro ao atualizar encomenda' }, { status: 500 });
  }
}

// DELETE — remove order
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'Database não configurada' }, { status: 500 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const { error } = await sb.from('orders').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao apagar encomenda:', error);
    return NextResponse.json({ error: 'Erro ao apagar encomenda' }, { status: 500 });
  }
}

function generateTrackingUrl(carrier: string, number: string): string | null {
  const c = carrier.toLowerCase().trim();
  if (c === 'ctt') return `https://www.ctt.pt/feapl_2/app/open/cttexpresso/objectSearch/objectSearch.jspx?objects=${number}`;
  if (c === 'dpd') return `https://tracking.dpd.de/status/pt_PT/parcel/${number}`;
  if (c === 'gls') return `https://gls-group.com/PT/pt/seguimento-de-envios?match=${number}`;
  if (c === 'mrw') return `https://www.mrw.es/seguimiento_envios/MRWEnvio/MRWEnvio.asp?envio=${number}`;
  if (c === 'seur') return `https://www.seur.com/livetracking/?segOnlineIdentificador=${number}`;
  if (c === 'vasp') return `https://tracking.vasp.pt/?tracking=${number}`;
  return null;
}

function fmtPrice(n: number): string {
  return n.toFixed(2).replace('.', ',') + '€';
}

const TECHNIQUE_LABELS: Record<string, string> = {
  tampografia: 'Tampografia',
  serigrafia: 'Serigrafia Rotativa',
};

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

async function sendStatusEmail(data: Record<string, unknown>, reference: string, status: string) {
  const transporter = createTransporter();
  const customerName = data.customerName as string;
  const customerEmail = data.customerEmail as string;
  const items = data.items as Array<{
    product: string;
    capacity: string;
    quantity: number;
    printTechnique: string;
    printColor: string;
    unitPrice: number;
    itemTotal: number;
  }>;
  const total = data.total as number;

  if (status === 'paid') {
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#1B2A4A,#2E86AB);padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">Pagamento Confirmado &#x2705;</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">PrimeGift</p>
        </div>
        <div style="background:#f8f9fa;padding:24px 32px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px">
          <p style="color:#333;font-size:15px;margin:0 0 20px">Olá <strong>${customerName}</strong>,</p>
          <p style="color:#333;font-size:15px;margin:0 0 20px">O pagamento da sua encomenda <strong style="font-family:monospace;letter-spacing:1px;color:#1B2A4A">${reference}</strong> foi confirmado com sucesso!</p>

          <div style="background:white;border-radius:8px;padding:16px;border:1px solid #e0e0e0;margin-bottom:20px">
            <h3 style="margin:0 0 12px;font-size:15px;color:#1B2A4A">Resumo da encomenda:</h3>
            ${items.map(item => `
              <div style="padding:8px 0;border-bottom:1px solid #eee">
                <strong>${item.product} (${item.capacity})</strong><br>
                <span style="font-size:13px;color:#555">${item.quantity.toLocaleString('pt-PT')} un. · ${TECHNIQUE_LABELS[item.printTechnique] || item.printTechnique} · ${item.printColor} · ${fmtPrice(item.unitPrice)}/un.</span>
              </div>
            `).join('')}
            <div style="padding:12px 0 0;font-size:16px;font-weight:700;color:#1B2A4A">
              Total: ${fmtPrice(total)}
            </div>
          </div>

          <div style="background:#D5F5E3;border-radius:8px;padding:16px;border:1px solid #A9DFBF;margin-bottom:20px">
            <p style="margin:0;font-size:14px;color:#1E8449"><strong>Próximos passos:</strong></p>
            <p style="margin:8px 0 0;font-size:13px;color:#1E8449">A sua encomenda vai agora entrar em produção. Iremos enviar-lhe a maquete digital para aprovação antes de iniciar a impressão.</p>
          </div>

          <p style="color:#555;font-size:13px;margin:0 0 8px">Obrigado pela sua confiança!</p>
          <p style="color:#999;font-size:12px;margin:20px 0 0;text-align:center">PrimeGift<br>geral@primegift.pt</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"PrimeGift" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      replyTo: 'geral@primegift.pt',
      subject: `Pagamento Confirmado — ${reference} — PrimeGift`,
      html,
    });
  }

  if (status === 'dispatched') {
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#1B2A4A,#2E86AB);padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">Encomenda Enviada &#x1F4E6;</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">PrimeGift</p>
        </div>
        <div style="background:#f8f9fa;padding:24px 32px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px">
          <p style="color:#333;font-size:15px;margin:0 0 20px">Olá <strong>${customerName}</strong>,</p>
          <p style="color:#333;font-size:15px;margin:0 0 20px">A sua encomenda <strong style="font-family:monospace;letter-spacing:1px;color:#1B2A4A">${reference}</strong> foi enviada!</p>

          <div style="background:white;border-radius:8px;padding:16px;border:1px solid #e0e0e0;margin-bottom:20px">
            <h3 style="margin:0 0 12px;font-size:15px;color:#1B2A4A">Itens expedidos:</h3>
            ${items.map(item => `
              <div style="padding:8px 0;border-bottom:1px solid #eee">
                <strong>${item.product} (${item.capacity})</strong><br>
                <span style="font-size:13px;color:#555">${item.quantity.toLocaleString('pt-PT')} un. · ${TECHNIQUE_LABELS[item.printTechnique] || item.printTechnique} · ${item.printColor}${(item as Record<string, unknown>).reference ? ` · Ref: <span style="font-family:monospace">${(item as Record<string, unknown>).reference}</span>` : ''}</span>
              </div>
            `).join('')}
          </div>

          <div style="background:#EBF5FB;border-radius:8px;padding:16px;border:1px solid #AED6F1;margin-bottom:20px">
            <p style="margin:0;font-size:14px;color:#1B4F72"><strong>Informações de entrega:</strong></p>
            ${data.trackingNumber ? `
            <p style="margin:8px 0 0;font-size:13px;color:#2C3E50">
              <strong>Transportadora:</strong> ${data.trackingCarrier || 'N/A'}<br>
              <strong>Nº de tracking:</strong> <span style="font-family:monospace;letter-spacing:0.5px">${data.trackingNumber}</span>
            </p>
            ${data.trackingUrl ? `
            <div style="margin:12px 0 0;text-align:center">
              <a href="${data.trackingUrl}" target="_blank" style="display:inline-block;background:#2E86AB;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600">Seguir Envio</a>
            </div>` : ''}
            ` : `
            <p style="margin:8px 0 0;font-size:13px;color:#2C3E50">A encomenda será entregue na morada indicada dentro do prazo estimado. Se tiver alguma questão, não hesite em contactar-nos.</p>
            `}
          </div>

          <p style="color:#555;font-size:13px;margin:0 0 8px">Obrigado pela sua compra!</p>
          <p style="color:#999;font-size:12px;margin:20px 0 0;text-align:center">PrimeGift<br>geral@primegift.pt</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"PrimeGift" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      replyTo: 'geral@primegift.pt',
      subject: `Encomenda Enviada — ${reference} — PrimeGift`,
      html,
    });
  }
}
