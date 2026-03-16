import { NextRequest, NextResponse } from 'next/server';
import { generateMockupPDFBuffer, fetchLogoAsDataUrl } from '@/app/lib/mockup';

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  if (!auth) return false;
  const token = auth.replace('Bearer ', '');
  return token === process.env.ADMIN_PASSWORD;
}

// POST — generate mockup PDF for a specific order item
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { reference, item } = await req.json();
    if (!reference || !item) {
      return NextResponse.json({ error: 'Dados em falta' }, { status: 400 });
    }

    const logoDataUrl = item.fileUrl ? await fetchLogoAsDataUrl(item.fileUrl) : null;

    const pdfBuffer = await generateMockupPDFBuffer({
      capacity: item.capacity,
      printColor: item.printColor,
      logoDataUrl,
      reference,
      productName: `${item.product} (${item.capacity})`,
      quantity: item.quantity,
      technique: item.printTechnique,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Maquete_${reference}_${item.capacity}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar maquete:', error);
    return NextResponse.json({ error: 'Erro ao gerar maquete' }, { status: 500 });
  }
}
