import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import nodemailer from 'nodemailer';

async function sendEmail(data: { nome: string; email: string; empresa: string; telefone: string; mensagem: string }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"PrimeGift Website" <${process.env.SMTP_USER}>`,
    to: 'info@metalprime.pt',
    replyTo: data.email,
    subject: `Novo contacto PrimeGift - ${data.nome}`,
    html: `
      <h2>Novo contacto do website PrimeGift</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Nome</td><td style="padding:8px;border-bottom:1px solid #eee">${data.nome}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${data.email}</td></tr>
        ${data.empresa ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Empresa</td><td style="padding:8px;border-bottom:1px solid #eee">${data.empresa}</td></tr>` : ''}
        ${data.telefone ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Telefone</td><td style="padding:8px;border-bottom:1px solid #eee">${data.telefone}</td></tr>` : ''}
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Mensagem</td><td style="padding:8px;border-bottom:1px solid #eee">${data.mensagem}</td></tr>
      </table>
    `,
  });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.nome || !data.email || !data.mensagem) {
      return NextResponse.json({ error: 'Campos obrigatórios em falta' }, { status: 400 });
    }

    waitUntil(sendEmail(data));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
