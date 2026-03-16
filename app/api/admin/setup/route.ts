import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: 'Cria a tabela no Supabase Dashboard → SQL Editor. Cola este SQL:',
    sql: `CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  order_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ
);`
  });
}
