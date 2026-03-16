// Cup mockup PDF generator (server-safe, no DOM needed)

interface CupSpec {
  capacity: string;
  cupHeight: number;
  cupTopW: number;
  cupBotW: number;
}

const CUP_SPECS: Record<string, CupSpec> = {
  '200ml': { capacity: '200ml', cupHeight: 65, cupTopW: 50, cupBotW: 36 },
  '300ml': { capacity: '300ml', cupHeight: 80, cupTopW: 54, cupBotW: 38 },
  '330ml': { capacity: '330ml', cupHeight: 88, cupTopW: 56, cupBotW: 39 },
  '500ml': { capacity: '500ml', cupHeight: 105, cupTopW: 62, cupBotW: 42 },
};

export interface MockupOptions {
  capacity: string;
  printColor: string;
  logoDataUrl?: string | null;
  reference: string;
  productName: string;
  quantity: number;
  technique: string;
}

const PRINT_COLOR_HEX: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  grey: '#808080',
};

const TECHNIQUE_LABELS: Record<string, string> = {
  tampografia: 'Tampografia',
  serigrafia: 'Serigrafia Rotativa',
};

/**
 * Fetches a logo from URL and converts it to a PNG data URL using sharp.
 * This handles PNG, JPEG, WebP, TIFF, GIF, and SVG inputs.
 * Returns null for unsupported formats (PDF, AI, EPS).
 */
export async function fetchLogoAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Logo fetch failed:', res.status, url);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());

    // Detect format from magic bytes
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50;
    const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;
    const isSVG = buffer.toString('utf8', 0, 100).trim().startsWith('<') && buffer.toString('utf8', 0, 500).includes('svg');
    const isWebP = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;

    // Only process formats sharp can handle
    if (!isPNG && !isJPEG && !isSVG && !isWebP) {
      // PDF, AI, EPS — can't convert to raster
      console.log('Logo format not convertible to raster, skipping:', url);
      return null;
    }

    // Convert to PNG using sharp for maximum compatibility with jsPDF
    const sharp = (await import('sharp')).default;
    const pngBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer();

    const base64 = pngBuffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (err) {
    console.error('Logo fetch/convert error:', err);
    return null;
  }
}

export async function generateMockupPDFBuffer(opts: MockupOptions): Promise<Buffer> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const spec = CUP_SPECS[opts.capacity] || CUP_SPECS['330ml'];

  const pageW = 210;
  const pageH = 297;
  const margin = 20;

  // ====== HEADER ======
  doc.setFillColor(27, 42, 74);
  doc.rect(0, 0, pageW, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MAQUETE DE PRODUÇÃO', pageW / 2, 14, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`PrimeGift — Referência: ${opts.reference}`, pageW / 2, 26, { align: 'center' });

  // ====== CUP DRAWING (large, centered) ======
  const cupAreaTop = 42;
  const cupAreaH = 160;
  const cupCx = pageW / 2;

  // Background area
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(margin, cupAreaTop, pageW - margin * 2, cupAreaH, 6, 6, 'FD');

  // Cup proportions — big
  const cupScale = cupAreaH * 0.7;
  const cupTopW = (spec.cupTopW / 62) * cupScale * 0.4;
  const cupBotW = (spec.cupBotW / 62) * cupScale * 0.28;
  const bodyH = cupScale * 0.82;
  const cupTopY = cupAreaTop + (cupAreaH - bodyH) / 2 - 5;

  // Cup body — two triangles for trapezoid
  doc.setFillColor(235, 242, 248);
  doc.setDrawColor(180, 195, 210);
  doc.setLineWidth(0.4);
  doc.triangle(
    cupCx - cupTopW, cupTopY,
    cupCx + cupTopW, cupTopY,
    cupCx + cupBotW, cupTopY + bodyH,
    'FD'
  );
  doc.triangle(
    cupCx - cupTopW, cupTopY,
    cupCx + cupBotW, cupTopY + bodyH,
    cupCx - cupBotW, cupTopY + bodyH,
    'FD'
  );

  // Hide triangle seam
  doc.setFillColor(242, 247, 252);
  doc.setDrawColor(242, 247, 252);
  doc.triangle(cupCx, cupTopY + 2, cupCx + cupBotW * 0.02, cupTopY + bodyH - 1, cupCx - cupBotW * 0.02, cupTopY + bodyH - 1, 'F');

  // Redraw outer border
  doc.setDrawColor(180, 195, 210);
  doc.setLineWidth(0.4);
  doc.line(cupCx - cupTopW, cupTopY, cupCx - cupBotW, cupTopY + bodyH);
  doc.line(cupCx + cupTopW, cupTopY, cupCx + cupBotW, cupTopY + bodyH);
  doc.line(cupCx - cupBotW, cupTopY + bodyH, cupCx + cupBotW, cupTopY + bodyH);

  // Rim
  doc.setFillColor(215, 225, 235);
  doc.setDrawColor(180, 195, 210);
  doc.ellipse(cupCx, cupTopY, cupTopW, 4, 'FD');
  doc.setFillColor(230, 238, 245);
  doc.ellipse(cupCx, cupTopY, cupTopW - 3, 2.5, 'FD');

  // Bottom
  doc.setFillColor(200, 210, 220);
  doc.ellipse(cupCx, cupTopY + bodyH, cupBotW, 2.5, 'FD');

  // Shine line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.5);
  doc.line(cupCx - cupTopW * 0.65, cupTopY + 8, cupCx - cupBotW * 0.65, cupTopY + bodyH - 5);
  doc.setLineWidth(0.4);

  // ====== LOGO ON CUP ======
  const logoW = cupTopW * 1.2;
  const logoH = bodyH * 0.4;
  const logoX = cupCx - logoW / 2;
  const logoY = cupTopY + bodyH * 0.18;

  let logoAdded = false;

  if (opts.logoDataUrl) {
    try {
      // logoDataUrl is always PNG after conversion by fetchLogoAsDataUrl
      doc.addImage(opts.logoDataUrl, 'PNG', logoX, logoY, logoW, logoH);
      logoAdded = true;
    } catch (err) {
      console.error('jsPDF addImage failed:', err);
    }
  }

  if (!logoAdded) {
    doc.setDrawColor(150, 160, 170);
    doc.setLineDashPattern([2, 2], 0);
    doc.setLineWidth(0.3);
    doc.rect(logoX, logoY, logoW, logoH);
    doc.setLineDashPattern([], 0);
    doc.setTextColor(150, 160, 170);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const placeholderText = opts.logoDataUrl === null ? 'Sem logótipo enviado' : 'Logótipo (formato não suportado)';
    doc.text(placeholderText, cupCx, logoY + logoH / 2 + 2, { align: 'center' });
  }

  // Capacity label
  doc.setTextColor(150, 165, 180);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(spec.capacity, cupCx, cupTopY + bodyH * 0.72, { align: 'center' });

  // Print color indicator
  const colorHex = PRINT_COLOR_HEX[opts.printColor] || '#000000';
  const cr = parseInt(colorHex.slice(1, 3), 16);
  const cg = parseInt(colorHex.slice(3, 5), 16);
  const cb = parseInt(colorHex.slice(5, 7), 16);
  doc.setFillColor(cr, cg, cb);
  doc.setDrawColor(180, 180, 180);
  doc.circle(pageW - margin - 15, cupAreaTop + 15, 6, 'FD');
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text(`Cor: ${opts.printColor}`, pageW - margin - 15, cupAreaTop + 26, { align: 'center' });

  // ====== ORDER DETAILS ======
  const detailsY = cupAreaTop + cupAreaH + 12;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin, detailsY, pageW - margin * 2, 55, 4, 4, 'FD');

  let dy = detailsY + 12;
  doc.setTextColor(27, 42, 74);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhes do Pedido', margin + 10, dy);

  dy += 10;
  doc.setTextColor(85, 85, 85);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Produto: ${opts.productName}`, margin + 10, dy);
  dy += 8;
  doc.text(`Quantidade: ${opts.quantity.toLocaleString('pt-PT')} unidades`, margin + 10, dy);
  dy += 8;
  const techLabel = TECHNIQUE_LABELS[opts.technique] || opts.technique;
  doc.text(`Técnica: ${techLabel}  |  Cor de impressão: ${opts.printColor}`, margin + 10, dy);

  // ====== FOOTER ======
  doc.setTextColor(160, 160, 160);
  doc.setFontSize(8);
  doc.text('PrimeGift — Uma marca do Grupo MetalPrime — info@metalprime.pt', pageW / 2, pageH - 10, { align: 'center' });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
