import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabase } from '@/app/lib/supabase';

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { orderId, reference, total, customerEmail } = await req.json();

    if (!orderId || !reference || !total) {
      return NextResponse.json({ error: 'Dados em falta' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get('host')}`;
    const amountInCents = Math.round(total * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Encomenda PrimeGift ${reference}`,
              description: `Copos personalizados — Ref: ${reference}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        order_id: String(orderId),
        reference,
      },
      success_url: `${baseUrl}/success?ref=${reference}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?cancelled=true&ref=${reference}`,
    });

    // Store stripe session ID on order
    const sb = getSupabase();
    if (sb) {
      await sb.from('orders').update({ stripe_session_id: session.id }).eq('id', orderId);
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento' }, { status: 500 });
  }
}
