import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { nome, email, empresa, telefone, mensagem } = await req.json();

    if (!nome || !email || !mensagem) {
      return NextResponse.json({ error: 'Campos obrigatórios em falta' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PrimeGift Website" <${process.env.SMTP_USER}>`,
      to: 'info@metalprime.pt',
      replyTo: email,
      subject: `Novo contacto PrimeGift - ${nome}`,
      html: `
        <h2>Novo contacto do website PrimeGift</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Nome</td><td style="padding:8px;border-bottom:1px solid #eee">${nome}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${email}</td></tr>
          ${empresa ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Empresa</td><td style="padding:8px;border-bottom:1px solid #eee">${empresa}</td></tr>` : ''}
          ${telefone ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Telefone</td><td style="padding:8px;border-bottom:1px solid #eee">${telefone}</td></tr>` : ''}
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Mensagem</td><td style="padding:8px;border-bottom:1px solid #eee">${mensagem}</td></tr>
        </table>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
