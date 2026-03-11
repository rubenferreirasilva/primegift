import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const ALLOWED_EXTENSIONS = ['pdf', 'ai', 'eps', 'png', 'svg'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum ficheiro enviado' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ficheiro excede 10MB' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Formato .${ext} não suportado. Use: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const blob = await put(`uploads/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({
      success: true,
      fileName: file.name,
      url: blob.url,
      size: file.size,
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar o ficheiro' }, { status: 500 });
  }
}
