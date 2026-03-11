'use client';
import React, { useState, useEffect, useMemo, CSSProperties } from 'react';
import dynamic from 'next/dynamic';

const CupViewer3D = dynamic(() => import('./CupViewer3D'), { ssr: false });

// ==================== I18N ====================

type Lang = 'pt' | 'es' | 'en' | 'fr';
type TFunc = (key: string) => string;

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'pt', flag: '\u{1F1F5}\u{1F1F9}', label: 'PT' },
  { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', label: 'ES' },
  { code: 'en', flag: '\u{1F1EC}\u{1F1E7}', label: 'EN' },
  { code: 'fr', flag: '\u{1F1EB}\u{1F1F7}', label: 'FR' },
];

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  pt: {
    // Nav
    'nav.home': 'Início',
    'nav.products': 'Produtos',
    'nav.howItWorks': 'Como Funciona',
    'nav.contact': 'Contacto',
    // Products data
    'product.pg200.name': 'Copo de 200ml',
    'product.pg200.desc': 'Café e degustação',
    'product.pg300.name': 'Copo de 300ml',
    'product.pg300.desc': 'Sumos e refrigerantes',
    'product.pg330.name': 'Copo de 330ml',
    'product.pg330.desc': 'Cerveja e cocktails',
    'product.pg500.name': 'Copo de 500ml',
    'product.pg500.desc': 'Festivais e eventos',
    // Colors
    'color.black': 'Preto',
    'color.white': 'Branco',
    'color.grey': 'Cinzento',
    // Regions
    'region.pt-continental': 'Portugal Continental',
    'region.pt-islands': 'Ilhas (Açores e Madeira)',
    'region.es-peninsular': 'Espanha Peninsular',
    'region.eu-zone2': 'Europa (Zona 2)',
    'region.eu-zone3': 'Europa (Zona 3)',
    'region.international': 'Internacional (fora da UE)',
    // Shipping methods
    'method.next-day': 'Entrega Expresso',
    'method.next-day.days': '~7 dias úteis (5 dias produção + 2 dias entrega)',
    'method.2-days': 'Envio Standard',
    'method.2-days.days': '~2 semanas (5 dias produção + 5 dias úteis entrega)',
    'method.collect': 'Ponto Collectt',
    'method.collect.days': '~2 semanas (5 dias produção + 5 dias úteis entrega)',
    'method.standard': 'Envio Standard',
    'method.standard.days': '~2 semanas (5 dias produção + 5 dias úteis entrega)',
    // Payment
    'payment.paypal': 'PayPal',
    'payment.transfer': 'Transferência Bancária',
    'payment.mbway': 'MB WAY',
    'payment.applepay': 'Apple Pay',
    // Hero
    'hero.tag': 'Festivais · Festas · Restaurantes',
    'hero.title1': 'A Sua Marca',
    'hero.title2': 'em Cada Copo',
    'hero.desc': 'Copos reutilizáveis personalizados com tampografia de alta qualidade. Produção própria, desde 100 unidades.',
    'hero.btnProducts': 'Ver Produtos',
    'hero.btnQuote': 'Pedir Orçamento',
    'hero.cupCaption1': 'Copo de 330ml',
    'hero.cupCaption2': 'Personalizado com a marca do seu evento',
    'hero.imgAlt': 'Festival de verão com pessoas e copos',
    // Trust bar
    'trust.0': 'Mín. 100 un.',
    'trust.1': 'Até 2 cores',
    'trust.2': '10 dias úteis',
    'trust.3': 'PT + ES + Int.',
    'trust.4': '4 formas de pagamento',
    // Home products
    'home.products.title': 'Os Nossos Produtos',
    'home.products.subtitle': 'Copos reutilizáveis de alta qualidade, prontos para a sua marca',
    'home.products.from': 'desde',
    // Gallery
    'gallery.0.label': 'Festivais de Verão',
    'gallery.0.desc': 'Milhares de copos personalizados em festivais por todo o país',
    'gallery.1.label': 'Festas & Eventos',
    'gallery.1.desc': 'Aniversários, casamentos e celebrações com a sua marca',
    'gallery.2.label': 'Bares & Restaurantes',
    'gallery.2.desc': 'Copos reutilizáveis que elevam a experiência do cliente',
    'gallery.3.label': 'Eventos Corporativos',
    'gallery.3.desc': 'Conferências e eventos de empresa com branding profissional',
    'gallery.4.label': 'Eventos ao Ar Livre',
    'gallery.4.desc': 'Feiras, mercados e eventos outdoor sustentáveis',
    'gallery.5.label': 'Cocktails & Bebidas',
    'gallery.5.desc': 'Apresentação premium para cocktails e bebidas especiais',
    'gallery.title': 'Os Nossos Copos em Acção',
    'gallery.subtitle': 'Festivais, festas, restaurantes — a sua marca presente em todos os momentos',
    // USPs
    'usp.title': 'Porquê a PrimeGift?',
    'usp.subtitle': 'Razões para confiar em nós para a personalização dos seus copos',
    'usp.0.title': 'Produção Própria',
    'usp.0.desc': 'Controlo total da qualidade em todas as fases do processo',
    'usp.1.title': 'Reutilizáveis',
    'usp.1.desc': 'Copos ecológicos e sustentáveis, prontos para centenas de utilizações',
    'usp.2.title': 'Personalização Total',
    'usp.2.desc': 'Tampografia e serigrafia de alta definição até 4 cores Pantone',
    'usp.3.title': 'Entrega em 10 Dias Úteis',
    'usp.3.desc': '5 dias de produção + 5 dias úteis de entrega para todo o território',
    'usp.4.title': 'Sem Mínimos Elevados',
    'usp.4.desc': 'Encomendas a partir de 100 unidades, ideal para pequenos negócios',
    'usp.5.title': 'Suporte Dedicado',
    'usp.5.desc': 'Acompanhamento personalizado do início ao fim, com maquete gratuita',
    // Testimonials
    'testimonials.title': 'O Que Dizem os Nossos Clientes',
    'testimonials.subtitle': 'Eventos reais, resultados reais',
    'testimonial.0.quote': 'Os copos ficaram incríveis e resistiram a todo o festival. A qualidade de impressão superou as expectativas e os participantes adoraram levar como recordação.',
    'testimonial.0.role': 'Festival Vilar de Mouros',
    'testimonial.1.quote': 'Substituímos os copos descartáveis pelos reutilizáveis da PrimeGift. Os clientes elogiam constantemente e poupamos no descartável. Excelente investimento.',
    'testimonial.1.role': 'Restaurante O Marinheiro',
    'testimonial.2.quote': 'Encomendámos para um evento de 500 pessoas e o resultado foi impecável. A maquete prévia ajudou-nos a acertar no design à primeira. Recomendo vivamente.',
    'testimonial.2.role': 'Eventos Corporativos LDA',
    // CTA
    'home.cta.title': 'Pronto para personalizar os seus copos?',
    'home.cta.subtitle': 'Comece agora e receba uma maquete digital gratuita. Sem compromisso.',
    'home.cta.button': 'Começar Agora',
    // How it works (home preview)
    'hiw.title': 'Como Funciona',
    'hiw.subtitle': 'Personalizar os seus copos é simples e rápido',
    'hiw.step1.title': 'Escolha',
    'hiw.step1.desc': 'Selecione o copo e a quantidade pretendida',
    'hiw.step2.title': 'Upload',
    'hiw.step2.desc': 'Envie o logótipo ou design da sua marca',
    'hiw.step3.title': 'Aprovação',
    'hiw.step3.desc': 'Receba e aprove a maquete digital gratuita',
    'hiw.step4.title': 'Entrega',
    'hiw.step4.desc': '5 dias de produção + 5 dias úteis de entrega (~2 semanas)',
    // Products page
    'products.title': 'Configure a Sua Encomenda',
    'products.subtitle': 'Selecione o produto, quantidade e personalize',
    'products.step1': 'Escolha o copo',
    'products.step2': 'Técnica de impressão',
    'products.step2.tampografia': 'Tampografia',
    'products.step2.tampografia.desc': 'Ideal para logos simples, até 4 cores',
    'products.step2.serigrafia': 'Serigrafia Rotativa',
    'products.step2.serigrafia.desc': 'Impressão 360° em toda a volta do copo',
    'products.step3': 'Quantidade e cores',
    'products.step3.qty': 'Quantidade',
    'products.step3.units': 'unidades',
    'products.step3.customQuote': '+10.000? Pedir orçamento personalizado',
    'products.step3.printColor': 'Cor de impressão',
    'products.step3.addToCart': '+ Adicionar ao Carrinho',
    'products.step4': 'Envie o seu ficheiro',
    'products.step4.fileUploaded': 'Ficheiro carregado com sucesso',
    'products.step4.clickToRemove': 'Clique para remover',
    'products.step4.dragOrClick': 'Arraste o ficheiro ou clique para enviar',
    'products.step4.formats': 'PDF, AI, EPS, PNG ou SVG (máx. 10MB)',
    'products.step4.bestResult': 'Para melhor resultado, envie PNG com fundo transparente ou SVG',
    'products.step4.autoRemoveBg': 'Remover fundo automaticamente',
    'products.step4.bgRemoved': 'Fundo removido',
    'products.step4.originalImage': 'Imagem original',
    'products.step4.fileTooLarge': 'Ficheiro demasiado grande. Máximo 10MB.',
    // Cart
    'cart.title': 'Carrinho',
    'cart.item': 'item',
    'cart.items': 'itens',
    'cart.remove': 'Remover',
    // Shipping
    'shipping.title': 'Entrega',
    'shipping.destination': 'Destino',
    'shipping.method': 'Método de envio',
    'shipping.international': 'Para envios internacionais fora da UE,',
    'shipping.internationalLink': 'contacte-nos',
    'shipping.internationalSuffix': 'para orçamento de envio personalizado.',
    'shipping.overweight': 'Envio de grande volume (acima de 30kg).',
    'shipping.overweightLink': 'Contacte-nos',
    'shipping.overweightSuffix': 'para melhor preço.',
    'shipping.freeShipping': 'Transporte OFERTA! Encomendas acima de 150€.',
    'shipping.estimatedWeight': 'Peso estimado:',
    'shipping.deadline': 'Prazo:',
    // Mockup
    'mockup.preview': 'Pré-visualização',
    'mockup.title': 'Mockup do Copo',
    'mockup.uploadHint': 'Envie um logo para ver a simulação',
    'mockup.removingBg': 'A remover fundo do logótipo...',
    'mockup.simulation': 'Simulação com o seu logo',
    'mockup.bgRemovedAuto': 'Fundo removido automaticamente.',
    'mockup.originalImg': 'Imagem original.',
    'mockup.finalApproval': 'A maquete final será enviada para aprovação.',
    'mockup.logoSize': 'Tamanho do logo',
    'mockup.download': 'Descarregar Mockup',
    // Order summary
    'order.title': 'Resumo do Orçamento',
    'order.subtotal': 'Subtotal',
    'order.shipping': 'Envio',
    'order.shippingFree': 'OFERTA',
    'order.vat': 'IVA (23%)',
    'order.total': 'Total',
    'order.freeMockup': 'Maquete digital gratuita incluída',
    'order.finalize': 'Finalizar Encomenda',
    'order.paymentMethods': 'Métodos de pagamento:',
    'order.emptyCart': 'Adicione produtos ao carrinho para ver o orçamento',
    // Price table
    'priceTable.title': 'Tabela de Preços Completa',
    'priceTable.subtitle': 'Preços por unidade, sem IVA. 1 cor incluída. Desconto progressivo por quantidade.',
    'priceTable.product': 'Produto',
    'priceTable.printColors': 'Impressão: Preto, Branco ou Cinzento',
    'priceTable.vatNote': 'IVA não incluído (23%)',
    'priceTable.freeShipping': 'Portes grátis para encomendas acima de 150€',
    // Modal
    'modal.title': 'Confirmar Encomenda',
    'modal.paymentMethod': 'Método de Pagamento',
    'modal.cancel': 'Cancelar',
    'modal.confirm': 'Confirmar Encomenda',
    // How it works page
    'hiwPage.step1.title': 'Escolha o Seu Copo',
    'hiwPage.step1.desc': 'Navegue pelo nosso catálogo e selecione o tamanho de copo mais adequado à sua necessidade. Temos opções desde os 200ml para cafés e degustações, até aos 500ml para festivais e grandes eventos. Cada copo é produzido em plástico reutilizável de alta qualidade.',
    'hiwPage.step2.title': 'Envie o Seu Design',
    'hiwPage.step2.desc': 'Carregue o logótipo ou design da sua marca nos formatos PDF, AI, EPS, PNG ou SVG. A nossa equipa de designers irá adaptar o seu ficheiro ao formato ideal para impressão por tampografia ou serigrafia, garantindo a melhor qualidade de reprodução.',
    'hiwPage.step3.title': 'Aprove a Maquete',
    'hiwPage.step3.desc': 'Receba gratuitamente uma maquete digital com a simulação do copo personalizado. Poderá solicitar ajustes até estar completamente satisfeito com o resultado. Só avançamos para produção após a sua aprovação final.',
    'hiwPage.step4.title': 'Receba a Sua Encomenda',
    'hiwPage.step4.desc': 'A sua encomenda é produzida nas nossas instalações em 5 dias, seguida de 5 dias úteis para entrega — aproximadamente duas semanas até chegar às suas mãos. Enviamos para Portugal Continental, Ilhas, Espanha e toda a Europa através da CTT Expresso.',
    'hiwPage.fileReq': 'Requisitos do Ficheiro',
    'hiwPage.formats': 'Formatos aceites',
    'hiwPage.formatsVal': 'PDF, AI, EPS, SVG (vetorial preferido), PNG (mín. 300dpi)',
    'hiwPage.resolution': 'Resolução mínima',
    'hiwPage.resolutionVal': '300 dpi para ficheiros raster (PNG, JPG)',
    'hiwPage.colorMode': 'Modo de cor',
    'hiwPage.colorModeVal': 'CMYK para melhor correspondência de cores na impressão',
    'hiwPage.printArea': 'Área útil de impressão',
    'hiwPage.printAreaVal': 'Variável por tamanho de copo — indicado na maquete',
    'hiwPage.numColors': 'Número de cores',
    'hiwPage.numColorsVal': '1 a 4 cores (Pantone) ou full color (CMYK)',
    'hiwPage.maxSize': 'Tamanho máximo',
    'hiwPage.maxSizeVal': '10 MB por ficheiro',
    // Contact page
    'contact.title': 'Contacto',
    'contact.subtitle': 'Estamos aqui para ajudar',
    'contact.sent.title': 'Mensagem Enviada!',
    'contact.sent.desc': 'Obrigado pelo seu contacto. Iremos responder em breve.',
    'contact.sent.newMsg': 'Enviar nova mensagem',
    'contact.form.title': 'Envie-nos uma Mensagem',
    'contact.form.name': 'Nome',
    'contact.form.namePlaceholder': 'O seu nome',
    'contact.form.email': 'Email',
    'contact.form.emailPlaceholder': 'email@exemplo.pt',
    'contact.form.company': 'Empresa',
    'contact.form.companyOptional': '(opcional)',
    'contact.form.companyPlaceholder': 'Nome da empresa',
    'contact.form.phone': 'Telefone',
    'contact.form.phonePlaceholder': '+351 900 000 000',
    'contact.form.message': 'Mensagem',
    'contact.form.messagePlaceholder': 'Descreva o que pretende...',
    'contact.form.submit': 'Enviar Mensagem',
    'contact.form.sending': 'A enviar...',
    'contact.form.error': 'Erro ao enviar mensagem. Tente novamente.',
    // Footer
    'footer.desc': 'Especialistas em personalização de copos de plástico reutilizáveis. Tampografia e serigrafia de alta qualidade.',
    'footer.tagline': 'A SUA MARCA EM CADA DETALHE',
    'footer.nav': 'Navegação',
    'footer.payment': 'Pagamento',
    'footer.copyright': '© 2026 PrimeGift. Todos os direitos reservados.',
    'products.step4.vectorNotice': 'Ficheiros PDF, AI e EPS não podem ser pré-visualizados no mockup. O seu ficheiro será usado na maquete final enviada para aprovação.',
    'testimonial.3.quote': 'Usámos os copos da PrimeGift no nosso casamento e foi um sucesso. Os convidados ficaram encantados com a personalização e muitos levaram como lembrança.',
    'testimonial.3.role': 'Casamento — Quinta do Lago',
    'testimonial.4.quote': 'Há 3 anos que encomendamos para os nossos festivais de verão. A consistência da qualidade e o cumprimento dos prazos fazem toda a diferença quando organizamos eventos de grande escala.',
    'testimonial.4.role': 'MEO Sudoeste',
    'testimonial.5.quote': 'Implementámos os copos reutilizáveis em toda a cadeia de lojas. Reduziu o nosso consumo de plástico em 80% e os clientes adoram o conceito eco-friendly.',
    'testimonial.5.role': 'Padaria Portuguesa',
    'legal.privacy.title': 'Política de Privacidade',
    'legal.terms.title': 'Termos e Condições',
    'legal.cookies.title': 'Política de Cookies',
    'legal.returns.title': 'Política de Devoluções',
    'legal.shipping.title': 'Política de Envio',
    'legal.lastUpdated': 'Última atualização',
    'legal.date': 'Março 2026',
    'footer.legal': 'Legal',
    'footer.privacy': 'Política de Privacidade',
    'footer.terms': 'Termos e Condições',
    'footer.cookies': 'Política de Cookies',
    'footer.returns': 'Devoluções',
    'footer.shipping': 'Política de Envio',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.products': 'Productos',
    'nav.howItWorks': 'Cómo Funciona',
    'nav.contact': 'Contacto',
    'product.pg200.name': 'Vaso de 200ml',
    'product.pg200.desc': 'Café y degustación',
    'product.pg300.name': 'Vaso de 300ml',
    'product.pg300.desc': 'Zumos y refrescos',
    'product.pg330.name': 'Vaso de 330ml',
    'product.pg330.desc': 'Cerveza y cócteles',
    'product.pg500.name': 'Vaso de 500ml',
    'product.pg500.desc': 'Festivales y eventos',
    'color.black': 'Negro',
    'color.white': 'Blanco',
    'color.grey': 'Gris',
    'region.pt-continental': 'Portugal Continental',
    'region.pt-islands': 'Islas (Azores y Madeira)',
    'region.es-peninsular': 'España Peninsular',
    'region.eu-zone2': 'Europa (Zona 2)',
    'region.eu-zone3': 'Europa (Zona 3)',
    'region.international': 'Internacional (fuera de la UE)',
    'method.next-day': 'Entrega Exprés',
    'method.next-day.days': '~7 días hábiles (5 días producción + 2 días entrega)',
    'method.2-days': 'Envío Estándar',
    'method.2-days.days': '~2 semanas (5 días producción + 5 días hábiles entrega)',
    'method.collect': 'Punto de Recogida',
    'method.collect.days': '~2 semanas (5 días producción + 5 días hábiles entrega)',
    'method.standard': 'Envío Estándar',
    'method.standard.days': '~2 semanas (5 días producción + 5 días hábiles entrega)',
    'payment.paypal': 'PayPal',
    'payment.transfer': 'Transferencia Bancaria',
    'payment.mbway': 'MB WAY',
    'payment.applepay': 'Apple Pay',
    'hero.tag': 'Festivales · Fiestas · Restaurantes',
    'hero.title1': 'Tu Marca',
    'hero.title2': 'en Cada Vaso',
    'hero.desc': 'Vasos reutilizables personalizados con tampografía de alta calidad. Producción propia, desde 100 unidades.',
    'hero.btnProducts': 'Ver Productos',
    'hero.btnQuote': 'Pedir Presupuesto',
    'hero.cupCaption1': 'Vaso de 330ml',
    'hero.cupCaption2': 'Personalizado con la marca de tu evento',
    'hero.imgAlt': 'Festival de verano con personas y vasos',
    'trust.0': 'Mín. 100 uds.',
    'trust.1': 'Hasta 2 colores',
    'trust.2': '10 días hábiles',
    'trust.3': 'PT + ES + Int.',
    'trust.4': '4 formas de pago',
    'home.products.title': 'Nuestros Productos',
    'home.products.subtitle': 'Vasos reutilizables de alta calidad, listos para tu marca',
    'home.products.from': 'desde',
    'gallery.title': 'Nuestros Vasos en Acción',
    'gallery.subtitle': 'Festivales, fiestas, restaurantes — tu marca presente en cada momento',
    'gallery.0.label': 'Festivales de Verano',
    'gallery.0.desc': 'Miles de vasos personalizados en festivales de todo el país',
    'gallery.1.label': 'Fiestas & Eventos',
    'gallery.1.desc': 'Cumpleaños, bodas y celebraciones con tu marca',
    'gallery.2.label': 'Bares & Restaurantes',
    'gallery.2.desc': 'Vasos reutilizables que elevan la experiencia del cliente',
    'gallery.3.label': 'Eventos Corporativos',
    'gallery.3.desc': 'Conferencias y eventos de empresa con branding profesional',
    'gallery.4.label': 'Eventos al Aire Libre',
    'gallery.4.desc': 'Ferias, mercados y eventos outdoor sostenibles',
    'gallery.5.label': 'Cócteles & Bebidas',
    'gallery.5.desc': 'Presentación premium para cócteles y bebidas especiales',
    'usp.title': '¿Por Qué PrimeGift?',
    'usp.subtitle': 'Razones para confiar en nosotros para la personalización de tus vasos',
    'usp.0.title': 'Producción Propia',
    'usp.0.desc': 'Control total de la calidad en todas las fases del proceso',
    'usp.1.title': 'Reutilizables',
    'usp.1.desc': 'Vasos ecológicos y sostenibles, listos para cientos de usos',
    'usp.2.title': 'Personalización Total',
    'usp.2.desc': 'Tampografía y serigrafía de alta definición hasta 4 colores Pantone',
    'usp.3.title': 'Entrega en 10 Días Hábiles',
    'usp.3.desc': '5 días de producción + 5 días hábiles de entrega a todo el territorio',
    'usp.4.title': 'Sin Mínimos Elevados',
    'usp.4.desc': 'Pedidos desde 100 unidades, ideal para pequeños negocios',
    'usp.5.title': 'Soporte Dedicado',
    'usp.5.desc': 'Acompañamiento personalizado de principio a fin, con maqueta gratuita',
    'testimonials.title': 'Lo Que Dicen Nuestros Clientes',
    'testimonials.subtitle': 'Eventos reales, resultados reales',
    'testimonial.0.quote': 'Los vasos quedaron increíbles y resistieron todo el festival. La calidad de impresión superó las expectativas y los participantes adoraron llevárselos de recuerdo.',
    'testimonial.0.role': 'Festival Vilar de Mouros',
    'testimonial.1.quote': 'Sustituimos los vasos desechables por los reutilizables de PrimeGift. Los clientes elogian constantemente y ahorramos en desechables. Excelente inversión.',
    'testimonial.1.role': 'Restaurante O Marinheiro',
    'testimonial.2.quote': 'Pedimos para un evento de 500 personas y el resultado fue impecable. La maqueta previa nos ayudó a acertar en el diseño a la primera. Lo recomiendo totalmente.',
    'testimonial.2.role': 'Eventos Corporativos LDA',
    'home.cta.title': '¿Listo para personalizar tus vasos?',
    'home.cta.subtitle': 'Empieza ahora y recibe una maqueta digital gratuita. Sin compromiso.',
    'home.cta.button': 'Empezar Ahora',
    'hiw.title': 'Cómo Funciona',
    'hiw.subtitle': 'Personalizar tus vasos es simple y rápido',
    'hiw.step1.title': 'Elección',
    'hiw.step1.desc': 'Selecciona el vaso y la cantidad deseada',
    'hiw.step2.title': 'Subida',
    'hiw.step2.desc': 'Envía el logotipo o diseño de tu marca',
    'hiw.step3.title': 'Aprobación',
    'hiw.step3.desc': 'Recibe y aprueba la maqueta digital gratuita',
    'hiw.step4.title': 'Entrega',
    'hiw.step4.desc': '5 días de producción + 5 días hábiles de entrega (~2 semanas)',
    'products.title': 'Configura Tu Pedido',
    'products.subtitle': 'Selecciona el producto, cantidad y personaliza',
    'products.step1': 'Elige el vaso',
    'products.step2': 'Técnica de impresión',
    'products.step2.tampografia': 'Tampografía',
    'products.step2.tampografia.desc': 'Ideal para logos simples, hasta 4 colores',
    'products.step2.serigrafia': 'Serigrafía Rotativa',
    'products.step2.serigrafia.desc': 'Impresión 360° alrededor del vaso',
    'products.step3': 'Cantidad y colores',
    'products.step3.qty': 'Cantidad',
    'products.step3.units': 'unidades',
    'products.step3.customQuote': '+10.000? Pedir presupuesto personalizado',
    'products.step3.printColor': 'Color de impresión',
    'products.step3.addToCart': '+ Añadir al Carrito',
    'products.step4': 'Sube tu fichero',
    'products.step4.fileUploaded': 'Fichero subido con éxito',
    'products.step4.clickToRemove': 'Haz clic para eliminar',
    'products.step4.dragOrClick': 'Arrastra el fichero o haz clic para subir',
    'products.step4.formats': 'PDF, AI, EPS, PNG o SVG (máx. 10MB)',
    'products.step4.bestResult': 'Para mejor resultado, envía PNG con fondo transparente o SVG',
    'products.step4.autoRemoveBg': 'Eliminar fondo automáticamente',
    'products.step4.bgRemoved': 'Fondo eliminado',
    'products.step4.originalImage': 'Imagen original',
    'products.step4.fileTooLarge': 'Fichero demasiado grande. Máximo 10MB.',
    'cart.title': 'Carrito',
    'cart.item': 'artículo',
    'cart.items': 'artículos',
    'cart.remove': 'Eliminar',
    'shipping.title': 'Entrega',
    'shipping.destination': 'Destino',
    'shipping.method': 'Método de envío',
    'shipping.international': 'Para envíos internacionales fuera de la UE,',
    'shipping.internationalLink': 'contáctenos',
    'shipping.internationalSuffix': 'para presupuesto de envío personalizado.',
    'shipping.overweight': 'Envío de gran volumen (más de 30kg).',
    'shipping.overweightLink': 'Contáctenos',
    'shipping.overweightSuffix': 'para mejor precio.',
    'shipping.freeShipping': '¡Transporte GRATIS! Pedidos superiores a 150€.',
    'shipping.estimatedWeight': 'Peso estimado:',
    'shipping.deadline': 'Plazo:',
    'mockup.preview': 'Previsualización',
    'mockup.title': 'Maqueta del Vaso',
    'mockup.uploadHint': 'Sube un logo para ver la simulación',
    'mockup.removingBg': 'Eliminando fondo del logotipo...',
    'mockup.simulation': 'Simulación con tu logo',
    'mockup.bgRemovedAuto': 'Fondo eliminado automáticamente.',
    'mockup.originalImg': 'Imagen original.',
    'mockup.finalApproval': 'La maqueta final será enviada para aprobación.',
    'mockup.logoSize': 'Tamaño del logo',
    'mockup.download': 'Descargar Maqueta',
    'order.title': 'Resumen del Presupuesto',
    'order.subtotal': 'Subtotal',
    'order.shipping': 'Envío',
    'order.shippingFree': 'GRATIS',
    'order.vat': 'IVA (23%)',
    'order.total': 'Total',
    'order.freeMockup': 'Maqueta digital gratuita incluida',
    'order.finalize': 'Finalizar Pedido',
    'order.paymentMethods': 'Métodos de pago:',
    'order.emptyCart': 'Añade productos al carrito para ver el presupuesto',
    'priceTable.title': 'Tabla de Precios Completa',
    'priceTable.subtitle': 'Precios por unidad, sin IVA. 1 color incluido. Descuento progresivo por cantidad.',
    'priceTable.product': 'Producto',
    'priceTable.printColors': 'Impresión: Negro, Blanco o Gris',
    'priceTable.vatNote': 'IVA no incluido (23%)',
    'priceTable.freeShipping': 'Portes gratis para pedidos superiores a 150€',
    'modal.title': 'Confirmar Pedido',
    'modal.paymentMethod': 'Método de Pago',
    'modal.cancel': 'Cancelar',
    'modal.confirm': 'Confirmar Pedido',
    'hiwPage.step1.title': 'Elige Tu Vaso',
    'hiwPage.step1.desc': 'Navega por nuestro catálogo y selecciona el tamaño de vaso más adecuado a tu necesidad. Tenemos opciones desde los 200ml para cafés y degustaciones, hasta los 500ml para festivales y grandes eventos. Cada vaso se produce en plástico reutilizable de alta calidad.',
    'hiwPage.step2.title': 'Envía Tu Diseño',
    'hiwPage.step2.desc': 'Sube el logotipo o diseño de tu marca en formatos PDF, AI, EPS, PNG o SVG. Nuestro equipo de diseñadores adaptará tu fichero al formato ideal para impresión por tampografía o serigrafía, garantizando la mejor calidad de reproducción.',
    'hiwPage.step3.title': 'Aprueba la Maqueta',
    'hiwPage.step3.desc': 'Recibe gratuitamente una maqueta digital con la simulación del vaso personalizado. Podrás solicitar ajustes hasta estar completamente satisfecho con el resultado. Solo avanzamos a producción tras tu aprobación final.',
    'hiwPage.step4.title': 'Recibe Tu Pedido',
    'hiwPage.step4.desc': 'Tu pedido se produce en nuestras instalaciones en 5 días, seguido de 5 días hábiles para entrega — aproximadamente dos semanas hasta llegar a tus manos. Enviamos a Portugal Continental, Islas, España y toda Europa a través de CTT Expresso.',
    'hiwPage.fileReq': 'Requisitos del Fichero',
    'hiwPage.formats': 'Formatos aceptados',
    'hiwPage.formatsVal': 'PDF, AI, EPS, SVG (vectorial preferido), PNG (mín. 300dpi)',
    'hiwPage.resolution': 'Resolución mínima',
    'hiwPage.resolutionVal': '300 dpi para ficheros raster (PNG, JPG)',
    'hiwPage.colorMode': 'Modo de color',
    'hiwPage.colorModeVal': 'CMYK para mejor correspondencia de colores en impresión',
    'hiwPage.printArea': 'Área útil de impresión',
    'hiwPage.printAreaVal': 'Variable por tamaño de vaso — indicado en la maqueta',
    'hiwPage.numColors': 'Número de colores',
    'hiwPage.numColorsVal': '1 a 4 colores (Pantone) o full color (CMYK)',
    'hiwPage.maxSize': 'Tamaño máximo',
    'hiwPage.maxSizeVal': '10 MB por fichero',
    'contact.title': 'Contacto',
    'contact.subtitle': 'Estamos aquí para ayudar',
    'contact.sent.title': '¡Mensaje Enviado!',
    'contact.sent.desc': 'Gracias por tu contacto. Responderemos pronto.',
    'contact.sent.newMsg': 'Enviar nuevo mensaje',
    'contact.form.title': 'Envíanos un Mensaje',
    'contact.form.name': 'Nombre',
    'contact.form.namePlaceholder': 'Tu nombre',
    'contact.form.email': 'Email',
    'contact.form.emailPlaceholder': 'email@ejemplo.es',
    'contact.form.company': 'Empresa',
    'contact.form.companyOptional': '(opcional)',
    'contact.form.companyPlaceholder': 'Nombre de la empresa',
    'contact.form.phone': 'Teléfono',
    'contact.form.phonePlaceholder': '+34 900 000 000',
    'contact.form.message': 'Mensaje',
    'contact.form.messagePlaceholder': 'Describe lo que necesitas...',
    'contact.form.submit': 'Enviar Mensaje',
    'contact.form.sending': 'Enviando...',
    'contact.form.error': 'Error al enviar el mensaje. Inténtelo de nuevo.',
    'footer.desc': 'Especialistas en personalización de vasos de plástico reutilizables. Tampografía y serigrafía de alta calidad.',
    'footer.tagline': 'TU MARCA EN CADA DETALLE',
    'footer.nav': 'Navegación',
    'footer.payment': 'Pago',
    'footer.copyright': '© 2026 PrimeGift. Todos los derechos reservados.',
    'products.step4.vectorNotice': 'Los archivos PDF, AI y EPS no pueden previsualizarse en la maqueta. Tu archivo será utilizado en la maqueta final enviada para aprobación.',
    'testimonial.3.quote': 'Usamos los vasos de PrimeGift en nuestra boda y fue un éxito. Los invitados quedaron encantados con la personalización y muchos se los llevaron de recuerdo.',
    'testimonial.3.role': 'Boda — Quinta do Lago',
    'testimonial.4.quote': 'Hace 3 años que pedimos para nuestros festivales de verano. La consistencia de la calidad y el cumplimiento de los plazos marcan la diferencia en eventos de gran escala.',
    'testimonial.4.role': 'MEO Sudoeste',
    'testimonial.5.quote': 'Implementamos los vasos reutilizables en toda la cadena de tiendas. Redujimos nuestro consumo de plástico en un 80% y los clientes adoran el concepto eco-friendly.',
    'testimonial.5.role': 'Padaria Portuguesa',
    'legal.privacy.title': 'Política de Privacidad',
    'legal.terms.title': 'Términos y Condiciones',
    'legal.cookies.title': 'Política de Cookies',
    'legal.returns.title': 'Política de Devoluciones',
    'legal.shipping.title': 'Política de Envío',
    'legal.lastUpdated': 'Última actualización',
    'legal.date': 'Marzo 2026',
    'footer.legal': 'Legal',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos y Condiciones',
    'footer.cookies': 'Política de Cookies',
    'footer.returns': 'Devoluciones',
    'footer.shipping': 'Política de Envío',
  },
  en: {
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.howItWorks': 'How It Works',
    'nav.contact': 'Contact',
    'product.pg200.name': '200ml Cup',
    'product.pg200.desc': 'Coffee & tasting',
    'product.pg300.name': '300ml Cup',
    'product.pg300.desc': 'Juices & soft drinks',
    'product.pg330.name': '330ml Cup',
    'product.pg330.desc': 'Beer & cocktails',
    'product.pg500.name': '500ml Cup',
    'product.pg500.desc': 'Festivals & events',
    'color.black': 'Black',
    'color.white': 'White',
    'color.grey': 'Grey',
    'region.pt-continental': 'Mainland Portugal',
    'region.pt-islands': 'Islands (Azores & Madeira)',
    'region.es-peninsular': 'Peninsular Spain',
    'region.eu-zone2': 'Europe (Zone 2)',
    'region.eu-zone3': 'Europe (Zone 3)',
    'region.international': 'International (outside EU)',
    'method.next-day': 'Express Delivery',
    'method.next-day.days': '~7 business days (5 days production + 2 days delivery)',
    'method.2-days': 'Standard Shipping',
    'method.2-days.days': '~2 weeks (5 days production + 5 business days delivery)',
    'method.collect': 'Collection Point',
    'method.collect.days': '~2 weeks (5 days production + 5 business days delivery)',
    'method.standard': 'Standard Shipping',
    'method.standard.days': '~2 weeks (5 days production + 5 business days delivery)',
    'payment.paypal': 'PayPal',
    'payment.transfer': 'Bank Transfer',
    'payment.mbway': 'MB WAY',
    'payment.applepay': 'Apple Pay',
    'hero.tag': 'Festivals · Parties · Restaurants',
    'hero.title1': 'Your Brand',
    'hero.title2': 'on Every Cup',
    'hero.desc': 'Custom reusable cups with high-quality pad printing. In-house production, from 100 units.',
    'hero.btnProducts': 'View Products',
    'hero.btnQuote': 'Request Quote',
    'hero.cupCaption1': '330ml Cup',
    'hero.cupCaption2': 'Customised with your event branding',
    'hero.imgAlt': 'Summer festival with people and cups',
    'trust.0': 'Min. 100 units',
    'trust.1': 'Up to 2 colours',
    'trust.2': '10 business days',
    'trust.3': 'PT + ES + Int.',
    'trust.4': '4 payment methods',
    'home.products.title': 'Our Products',
    'home.products.subtitle': 'High-quality reusable cups, ready for your brand',
    'home.products.from': 'from',
    'gallery.title': 'Our Cups in Action',
    'gallery.subtitle': 'Festivals, parties, restaurants — your brand present at every moment',
    'gallery.0.label': 'Summer Festivals',
    'gallery.0.desc': 'Thousands of custom cups at festivals across the country',
    'gallery.1.label': 'Parties & Events',
    'gallery.1.desc': 'Birthdays, weddings and celebrations with your brand',
    'gallery.2.label': 'Bars & Restaurants',
    'gallery.2.desc': 'Reusable cups that elevate the customer experience',
    'gallery.3.label': 'Corporate Events',
    'gallery.3.desc': 'Conferences and company events with professional branding',
    'gallery.4.label': 'Outdoor Events',
    'gallery.4.desc': 'Fairs, markets and sustainable outdoor events',
    'gallery.5.label': 'Cocktails & Drinks',
    'gallery.5.desc': 'Premium presentation for cocktails and specialty drinks',
    'usp.title': 'Why PrimeGift?',
    'usp.subtitle': 'Reasons to trust us with your cup customisation',
    'usp.0.title': 'In-House Production',
    'usp.0.desc': 'Full quality control at every stage of the process',
    'usp.1.title': 'Reusable',
    'usp.1.desc': 'Eco-friendly and sustainable cups, ready for hundreds of uses',
    'usp.2.title': 'Full Customisation',
    'usp.2.desc': 'High-definition pad printing and screen printing up to 4 Pantone colours',
    'usp.3.title': 'Delivery in 10 Business Days',
    'usp.3.desc': '5 days production + 5 business days delivery across the territory',
    'usp.4.title': 'No High Minimums',
    'usp.4.desc': 'Orders from 100 units, ideal for small businesses',
    'usp.5.title': 'Dedicated Support',
    'usp.5.desc': 'Personalised support from start to finish, with free mockup',
    'testimonials.title': 'What Our Customers Say',
    'testimonials.subtitle': 'Real events, real results',
    'testimonial.0.quote': 'The cups looked incredible and lasted the whole festival. The print quality exceeded expectations and participants loved taking them home as a keepsake.',
    'testimonial.0.role': 'Vilar de Mouros Festival',
    'testimonial.1.quote': 'We replaced disposable cups with PrimeGift reusables. Customers constantly compliment them and we save on disposables. Excellent investment.',
    'testimonial.1.role': 'O Marinheiro Restaurant',
    'testimonial.2.quote': 'We ordered for a 500-person event and the result was flawless. The preview mockup helped us get the design right first time. Highly recommended.',
    'testimonial.2.role': 'Corporate Events LDA',
    'home.cta.title': 'Ready to customise your cups?',
    'home.cta.subtitle': 'Start now and receive a free digital mockup. No commitment.',
    'home.cta.button': 'Get Started',
    'hiw.title': 'How It Works',
    'hiw.subtitle': 'Customising your cups is simple and fast',
    'hiw.step1.title': 'Choose',
    'hiw.step1.desc': 'Select the cup and desired quantity',
    'hiw.step2.title': 'Upload',
    'hiw.step2.desc': 'Send your logo or brand design',
    'hiw.step3.title': 'Approval',
    'hiw.step3.desc': 'Receive and approve the free digital mockup',
    'hiw.step4.title': 'Delivery',
    'hiw.step4.desc': '5 days production + 5 business days delivery (~2 weeks)',
    'products.title': 'Configure Your Order',
    'products.subtitle': 'Select the product, quantity and customise',
    'products.step1': 'Choose the cup',
    'products.step2': 'Printing technique',
    'products.step2.tampografia': 'Pad printing',
    'products.step2.tampografia.desc': 'Ideal for simple logos, up to 4 colours',
    'products.step2.serigrafia': 'Rotary screen printing',
    'products.step2.serigrafia.desc': '360° printing all around the cup',
    'products.step3': 'Quantity and colours',
    'products.step3.qty': 'Quantity',
    'products.step3.units': 'units',
    'products.step3.customQuote': '+10,000? Request custom quote',
    'products.step3.printColor': 'Print colour',
    'products.step3.addToCart': '+ Add to Cart',
    'products.step4': 'Upload your file',
    'products.step4.fileUploaded': 'File uploaded successfully',
    'products.step4.clickToRemove': 'Click to remove',
    'products.step4.dragOrClick': 'Drag file or click to upload',
    'products.step4.formats': 'PDF, AI, EPS, PNG or SVG (max. 10MB)',
    'products.step4.bestResult': 'For best results, send PNG with transparent background or SVG',
    'products.step4.autoRemoveBg': 'Remove background automatically',
    'products.step4.bgRemoved': 'Background removed',
    'products.step4.originalImage': 'Original image',
    'products.step4.fileTooLarge': 'File too large. Maximum 10MB.',
    'cart.title': 'Cart',
    'cart.item': 'item',
    'cart.items': 'items',
    'cart.remove': 'Remove',
    'shipping.title': 'Delivery',
    'shipping.destination': 'Destination',
    'shipping.method': 'Shipping method',
    'shipping.international': 'For international shipments outside the EU,',
    'shipping.internationalLink': 'contact us',
    'shipping.internationalSuffix': 'for a custom shipping quote.',
    'shipping.overweight': 'Large volume shipment (over 30kg).',
    'shipping.overweightLink': 'Contact us',
    'shipping.overweightSuffix': 'for a better price.',
    'shipping.freeShipping': 'FREE shipping! Orders over 150€.',
    'shipping.estimatedWeight': 'Estimated weight:',
    'shipping.deadline': 'Delivery time:',
    'mockup.preview': 'Preview',
    'mockup.title': 'Cup Mockup',
    'mockup.uploadHint': 'Upload a logo to see the simulation',
    'mockup.removingBg': 'Removing logo background...',
    'mockup.simulation': 'Simulation with your logo',
    'mockup.bgRemovedAuto': 'Background removed automatically.',
    'mockup.originalImg': 'Original image.',
    'mockup.finalApproval': 'The final mockup will be sent for approval.',
    'mockup.logoSize': 'Logo size',
    'mockup.download': 'Download Mockup',
    'order.title': 'Quote Summary',
    'order.subtotal': 'Subtotal',
    'order.shipping': 'Shipping',
    'order.shippingFree': 'FREE',
    'order.vat': 'VAT (23%)',
    'order.total': 'Total',
    'order.freeMockup': 'Free digital mockup included',
    'order.finalize': 'Finalise Order',
    'order.paymentMethods': 'Payment methods:',
    'order.emptyCart': 'Add products to cart to see the quote',
    'priceTable.title': 'Complete Price Table',
    'priceTable.subtitle': 'Prices per unit, excl. VAT. 1 colour included. Progressive volume discount.',
    'priceTable.product': 'Product',
    'priceTable.printColors': 'Print: Black, White or Grey',
    'priceTable.vatNote': 'VAT not included (23%)',
    'priceTable.freeShipping': 'Free shipping for orders over 150€',
    'modal.title': 'Confirm Order',
    'modal.paymentMethod': 'Payment Method',
    'modal.cancel': 'Cancel',
    'modal.confirm': 'Confirm Order',
    'hiwPage.step1.title': 'Choose Your Cup',
    'hiwPage.step1.desc': 'Browse our catalogue and select the cup size best suited to your needs. We offer options from 200ml for coffees and tastings, to 500ml for festivals and large events. Each cup is produced in high-quality reusable plastic.',
    'hiwPage.step2.title': 'Send Your Design',
    'hiwPage.step2.desc': 'Upload your logo or brand design in PDF, AI, EPS, PNG or SVG format. Our design team will adapt your file to the ideal format for pad printing or screen printing, ensuring the best reproduction quality.',
    'hiwPage.step3.title': 'Approve the Mockup',
    'hiwPage.step3.desc': 'Receive a free digital mockup with the simulation of your customised cup. You can request adjustments until you are completely satisfied with the result. We only proceed to production after your final approval.',
    'hiwPage.step4.title': 'Receive Your Order',
    'hiwPage.step4.desc': 'Your order is produced in our facilities in 5 days, followed by 5 business days for delivery — approximately two weeks until it reaches you. We ship to Mainland Portugal, Islands, Spain and all of Europe via CTT Expresso.',
    'hiwPage.fileReq': 'File Requirements',
    'hiwPage.formats': 'Accepted formats',
    'hiwPage.formatsVal': 'PDF, AI, EPS, SVG (vector preferred), PNG (min. 300dpi)',
    'hiwPage.resolution': 'Minimum resolution',
    'hiwPage.resolutionVal': '300 dpi for raster files (PNG, JPG)',
    'hiwPage.colorMode': 'Colour mode',
    'hiwPage.colorModeVal': 'CMYK for best colour matching in print',
    'hiwPage.printArea': 'Printable area',
    'hiwPage.printAreaVal': 'Varies by cup size — indicated on the mockup',
    'hiwPage.numColors': 'Number of colours',
    'hiwPage.numColorsVal': '1 to 4 colours (Pantone) or full colour (CMYK)',
    'hiwPage.maxSize': 'Maximum size',
    'hiwPage.maxSizeVal': '10 MB per file',
    'contact.title': 'Contact',
    'contact.subtitle': 'We are here to help',
    'contact.sent.title': 'Message Sent!',
    'contact.sent.desc': 'Thank you for your message. We will reply shortly.',
    'contact.sent.newMsg': 'Send new message',
    'contact.form.title': 'Send Us a Message',
    'contact.form.name': 'Name',
    'contact.form.namePlaceholder': 'Your name',
    'contact.form.email': 'Email',
    'contact.form.emailPlaceholder': 'email@example.com',
    'contact.form.company': 'Company',
    'contact.form.companyOptional': '(optional)',
    'contact.form.companyPlaceholder': 'Company name',
    'contact.form.phone': 'Phone',
    'contact.form.phonePlaceholder': '+44 700 000 000',
    'contact.form.message': 'Message',
    'contact.form.messagePlaceholder': 'Describe what you need...',
    'contact.form.submit': 'Send Message',
    'contact.form.sending': 'Sending...',
    'contact.form.error': 'Error sending message. Please try again.',
    'footer.desc': 'Specialists in customisation of reusable plastic cups. High-quality pad printing and screen printing.',
    'footer.tagline': 'YOUR BRAND IN EVERY DETAIL',
    'footer.nav': 'Navigation',
    'footer.payment': 'Payment',
    'footer.copyright': '© 2026 PrimeGift. All rights reserved.',
    'products.step4.vectorNotice': 'PDF, AI and EPS files cannot be previewed on the mockup. Your file will be used in the final mockup sent for approval.',
    'testimonial.3.quote': 'We used PrimeGift cups at our wedding and it was a huge success. Guests loved the personalisation and many took them home as souvenirs.',
    'testimonial.3.role': 'Wedding — Quinta do Lago',
    'testimonial.4.quote': 'We\'ve been ordering for our summer festivals for 3 years now. The consistency in quality and meeting deadlines makes all the difference for large-scale events.',
    'testimonial.4.role': 'MEO Sudoeste',
    'testimonial.5.quote': 'We implemented reusable cups across our entire chain of shops. It reduced our plastic consumption by 80% and customers love the eco-friendly concept.',
    'testimonial.5.role': 'Padaria Portuguesa',
    'legal.privacy.title': 'Privacy Policy',
    'legal.terms.title': 'Terms & Conditions',
    'legal.cookies.title': 'Cookie Policy',
    'legal.returns.title': 'Returns Policy',
    'legal.shipping.title': 'Shipping Policy',
    'legal.lastUpdated': 'Last updated',
    'legal.date': 'March 2026',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.cookies': 'Cookie Policy',
    'footer.returns': 'Returns',
    'footer.shipping': 'Shipping Policy',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.products': 'Produits',
    'nav.howItWorks': 'Comment ça Marche',
    'nav.contact': 'Contact',
    'product.pg200.name': 'Gobelet 200ml',
    'product.pg200.desc': 'Café et dégustation',
    'product.pg300.name': 'Gobelet 300ml',
    'product.pg300.desc': 'Jus et boissons fraîches',
    'product.pg330.name': 'Gobelet 330ml',
    'product.pg330.desc': 'Bière et cocktails',
    'product.pg500.name': 'Gobelet 500ml',
    'product.pg500.desc': 'Festivals et événements',
    'color.black': 'Noir',
    'color.white': 'Blanc',
    'color.grey': 'Gris',
    'region.pt-continental': 'Portugal Continental',
    'region.pt-islands': 'Îles (Açores et Madère)',
    'region.es-peninsular': 'Espagne Péninsulaire',
    'region.eu-zone2': 'Europe (Zone 2)',
    'region.eu-zone3': 'Europe (Zone 3)',
    'region.international': 'International (hors UE)',
    'method.next-day': 'Livraison Express',
    'method.next-day.days': '~7 jours ouvrés (5 jours production + 2 jours livraison)',
    'method.2-days': 'Envoi Standard',
    'method.2-days.days': '~2 semaines (5 jours production + 5 jours ouvrés livraison)',
    'method.collect': 'Point Relais',
    'method.collect.days': '~2 semaines (5 jours production + 5 jours ouvrés livraison)',
    'method.standard': 'Envoi Standard',
    'method.standard.days': '~2 semaines (5 jours production + 5 jours ouvrés livraison)',
    'payment.paypal': 'PayPal',
    'payment.transfer': 'Virement Bancaire',
    'payment.mbway': 'MB WAY',
    'payment.applepay': 'Apple Pay',
    'hero.tag': 'Festivals · Fêtes · Restaurants',
    'hero.title1': 'Votre Marque',
    'hero.title2': 'sur Chaque Gobelet',
    'hero.desc': 'Gobelets réutilisables personnalisés avec tampographie haute qualité. Production propre, à partir de 100 unités.',
    'hero.btnProducts': 'Voir les Produits',
    'hero.btnQuote': 'Demander un Devis',
    'hero.cupCaption1': 'Gobelet 330ml',
    'hero.cupCaption2': 'Personnalisé avec la marque de votre événement',
    'hero.imgAlt': 'Festival d\'été avec des personnes et des gobelets',
    'trust.0': 'Min. 100 unités',
    'trust.1': 'Jusqu\'à 2 couleurs',
    'trust.2': '10 jours ouvrés',
    'trust.3': 'PT + ES + Int.',
    'trust.4': '4 modes de paiement',
    'home.products.title': 'Nos Produits',
    'home.products.subtitle': 'Gobelets réutilisables de haute qualité, prêts pour votre marque',
    'home.products.from': 'à partir de',
    'gallery.title': 'Nos Gobelets en Action',
    'gallery.subtitle': 'Festivals, fêtes, restaurants — votre marque présente à chaque instant',
    'gallery.0.label': 'Festivals d\'Été',
    'gallery.0.desc': 'Des milliers de gobelets personnalisés dans les festivals du pays',
    'gallery.1.label': 'Fêtes & Événements',
    'gallery.1.desc': 'Anniversaires, mariages et célébrations avec votre marque',
    'gallery.2.label': 'Bars & Restaurants',
    'gallery.2.desc': 'Gobelets réutilisables qui rehaussent l\'expérience client',
    'gallery.3.label': 'Événements Corporatifs',
    'gallery.3.desc': 'Conférences et événements d\'entreprise avec branding professionnel',
    'gallery.4.label': 'Événements en Plein Air',
    'gallery.4.desc': 'Foires, marchés et événements outdoor durables',
    'gallery.5.label': 'Cocktails & Boissons',
    'gallery.5.desc': 'Présentation premium pour cocktails et boissons spéciales',
    'usp.title': 'Pourquoi PrimeGift ?',
    'usp.subtitle': 'Les raisons de nous faire confiance pour la personnalisation de vos gobelets',
    'usp.0.title': 'Production Propre',
    'usp.0.desc': 'Contrôle total de la qualité à chaque étape du processus',
    'usp.1.title': 'Réutilisables',
    'usp.1.desc': 'Gobelets écologiques et durables, prêts pour des centaines d\'utilisations',
    'usp.2.title': 'Personnalisation Totale',
    'usp.2.desc': 'Tampographie et sérigraphie haute définition jusqu\'à 4 couleurs Pantone',
    'usp.3.title': 'Livraison en 10 Jours Ouvrés',
    'usp.3.desc': '5 jours de production + 5 jours ouvrés de livraison sur tout le territoire',
    'usp.4.title': 'Pas de Minimums Élevés',
    'usp.4.desc': 'Commandes à partir de 100 unités, idéal pour les petites entreprises',
    'usp.5.title': 'Support Dédié',
    'usp.5.desc': 'Accompagnement personnalisé du début à la fin, avec maquette gratuite',
    'testimonials.title': 'Ce Que Disent Nos Clients',
    'testimonials.subtitle': 'Événements réels, résultats réels',
    'testimonial.0.quote': 'Les gobelets étaient incroyables et ont résisté à tout le festival. La qualité d\'impression a dépassé nos attentes et les participants ont adoré les garder en souvenir.',
    'testimonial.0.role': 'Festival Vilar de Mouros',
    'testimonial.1.quote': 'Nous avons remplacé les gobelets jetables par les réutilisables de PrimeGift. Les clients les complimentent constamment et nous économisons sur le jetable. Excellent investissement.',
    'testimonial.1.role': 'Restaurant O Marinheiro',
    'testimonial.2.quote': 'Nous avons commandé pour un événement de 500 personnes et le résultat était impeccable. La maquette préalable nous a aidés à réussir le design du premier coup. Je recommande vivement.',
    'testimonial.2.role': 'Eventos Corporativos LDA',
    'home.cta.title': 'Prêt à personnaliser vos gobelets ?',
    'home.cta.subtitle': 'Commencez maintenant et recevez une maquette numérique gratuite. Sans engagement.',
    'home.cta.button': 'Commencer',
    'hiw.title': 'Comment ça Marche',
    'hiw.subtitle': 'Personnaliser vos gobelets est simple et rapide',
    'hiw.step1.title': 'Choix',
    'hiw.step1.desc': 'Sélectionnez le gobelet et la quantité souhaitée',
    'hiw.step2.title': 'Envoi',
    'hiw.step2.desc': 'Envoyez votre logo ou design de marque',
    'hiw.step3.title': 'Approbation',
    'hiw.step3.desc': 'Recevez et approuvez la maquette numérique gratuite',
    'hiw.step4.title': 'Livraison',
    'hiw.step4.desc': '5 jours de production + 5 jours ouvrés de livraison (~2 semaines)',
    'products.title': 'Configurez Votre Commande',
    'products.subtitle': 'Sélectionnez le produit, la quantité et personnalisez',
    'products.step1': 'Choisissez le gobelet',
    'products.step2': 'Technique d\'impression',
    'products.step2.tampografia': 'Tampographie',
    'products.step2.tampografia.desc': 'Idéal pour logos simples, jusqu\'à 4 couleurs',
    'products.step2.serigrafia': 'Sérigraphie rotative',
    'products.step2.serigrafia.desc': 'Impression 360° sur tout le tour du gobelet',
    'products.step3': 'Quantité et couleurs',
    'products.step3.qty': 'Quantité',
    'products.step3.units': 'unités',
    'products.step3.customQuote': '+10 000 ? Demander un devis personnalisé',
    'products.step3.printColor': 'Couleur d\'impression',
    'products.step3.addToCart': '+ Ajouter au Panier',
    'products.step4': 'Envoyez votre fichier',
    'products.step4.fileUploaded': 'Fichier téléchargé avec succès',
    'products.step4.clickToRemove': 'Cliquez pour supprimer',
    'products.step4.dragOrClick': 'Glissez le fichier ou cliquez pour envoyer',
    'products.step4.formats': 'PDF, AI, EPS, PNG ou SVG (max. 10 Mo)',
    'products.step4.bestResult': 'Pour un meilleur résultat, envoyez un PNG avec fond transparent ou SVG',
    'products.step4.autoRemoveBg': 'Supprimer le fond automatiquement',
    'products.step4.bgRemoved': 'Fond supprimé',
    'products.step4.originalImage': 'Image originale',
    'products.step4.fileTooLarge': 'Fichier trop volumineux. Maximum 10 Mo.',
    'cart.title': 'Panier',
    'cart.item': 'article',
    'cart.items': 'articles',
    'cart.remove': 'Supprimer',
    'shipping.title': 'Livraison',
    'shipping.destination': 'Destination',
    'shipping.method': 'Mode d\'expédition',
    'shipping.international': 'Pour les envois internationaux hors UE,',
    'shipping.internationalLink': 'contactez-nous',
    'shipping.internationalSuffix': 'pour un devis d\'expédition personnalisé.',
    'shipping.overweight': 'Envoi volumineux (plus de 30kg).',
    'shipping.overweightLink': 'Contactez-nous',
    'shipping.overweightSuffix': 'pour un meilleur prix.',
    'shipping.freeShipping': 'Livraison OFFERTE ! Commandes supérieures à 150€.',
    'shipping.estimatedWeight': 'Poids estimé :',
    'shipping.deadline': 'Délai :',
    'mockup.preview': 'Aperçu',
    'mockup.title': 'Maquette du Gobelet',
    'mockup.uploadHint': 'Envoyez un logo pour voir la simulation',
    'mockup.removingBg': 'Suppression du fond du logo...',
    'mockup.simulation': 'Simulation avec votre logo',
    'mockup.bgRemovedAuto': 'Fond supprimé automatiquement.',
    'mockup.originalImg': 'Image originale.',
    'mockup.finalApproval': 'La maquette finale sera envoyée pour approbation.',
    'mockup.logoSize': 'Taille du logo',
    'mockup.download': 'Télécharger la Maquette',
    'order.title': 'Résumé du Devis',
    'order.subtotal': 'Sous-total',
    'order.shipping': 'Expédition',
    'order.shippingFree': 'OFFERT',
    'order.vat': 'TVA (23%)',
    'order.total': 'Total',
    'order.freeMockup': 'Maquette numérique gratuite incluse',
    'order.finalize': 'Finaliser la Commande',
    'order.paymentMethods': 'Modes de paiement :',
    'order.emptyCart': 'Ajoutez des produits au panier pour voir le devis',
    'priceTable.title': 'Tableau de Prix Complet',
    'priceTable.subtitle': 'Prix par unité, hors TVA. 1 couleur incluse. Remise progressive par quantité.',
    'priceTable.product': 'Produit',
    'priceTable.printColors': 'Impression : Noir, Blanc ou Gris',
    'priceTable.vatNote': 'TVA non incluse (23%)',
    'priceTable.freeShipping': 'Livraison gratuite pour commandes supérieures à 150€',
    'modal.title': 'Confirmer la Commande',
    'modal.paymentMethod': 'Mode de Paiement',
    'modal.cancel': 'Annuler',
    'modal.confirm': 'Confirmer la Commande',
    'hiwPage.step1.title': 'Choisissez Votre Gobelet',
    'hiwPage.step1.desc': 'Parcourez notre catalogue et sélectionnez la taille de gobelet la plus adaptée à vos besoins. Nous proposons des options allant de 200ml pour cafés et dégustations jusqu\'à 500ml pour festivals et grands événements. Chaque gobelet est produit en plastique réutilisable de haute qualité.',
    'hiwPage.step2.title': 'Envoyez Votre Design',
    'hiwPage.step2.desc': 'Téléchargez votre logo ou design de marque aux formats PDF, AI, EPS, PNG ou SVG. Notre équipe de designers adaptera votre fichier au format idéal pour l\'impression par tampographie ou sérigraphie, garantissant la meilleure qualité de reproduction.',
    'hiwPage.step3.title': 'Approuvez la Maquette',
    'hiwPage.step3.desc': 'Recevez gratuitement une maquette numérique avec la simulation de votre gobelet personnalisé. Vous pourrez demander des ajustements jusqu\'à être entièrement satisfait du résultat. Nous ne passons en production qu\'après votre approbation finale.',
    'hiwPage.step4.title': 'Recevez Votre Commande',
    'hiwPage.step4.desc': 'Votre commande est produite dans nos installations en 5 jours, suivie de 5 jours ouvrés de livraison — environ deux semaines jusqu\'à réception. Nous expédions vers le Portugal Continental, les Îles, l\'Espagne et toute l\'Europe via CTT Expresso.',
    'hiwPage.fileReq': 'Exigences du Fichier',
    'hiwPage.formats': 'Formats acceptés',
    'hiwPage.formatsVal': 'PDF, AI, EPS, SVG (vectoriel préféré), PNG (min. 300dpi)',
    'hiwPage.resolution': 'Résolution minimale',
    'hiwPage.resolutionVal': '300 dpi pour fichiers raster (PNG, JPG)',
    'hiwPage.colorMode': 'Mode couleur',
    'hiwPage.colorModeVal': 'CMYK pour meilleure correspondance des couleurs à l\'impression',
    'hiwPage.printArea': 'Zone d\'impression utile',
    'hiwPage.printAreaVal': 'Variable selon la taille du gobelet — indiqué sur la maquette',
    'hiwPage.numColors': 'Nombre de couleurs',
    'hiwPage.numColorsVal': '1 à 4 couleurs (Pantone) ou quadrichromie (CMYK)',
    'hiwPage.maxSize': 'Taille maximale',
    'hiwPage.maxSizeVal': '10 Mo par fichier',
    'contact.title': 'Contact',
    'contact.subtitle': 'Nous sommes là pour vous aider',
    'contact.sent.title': 'Message Envoyé !',
    'contact.sent.desc': 'Merci pour votre message. Nous répondrons rapidement.',
    'contact.sent.newMsg': 'Envoyer un nouveau message',
    'contact.form.title': 'Envoyez-nous un Message',
    'contact.form.name': 'Nom',
    'contact.form.namePlaceholder': 'Votre nom',
    'contact.form.email': 'Email',
    'contact.form.emailPlaceholder': 'email@exemple.fr',
    'contact.form.company': 'Entreprise',
    'contact.form.companyOptional': '(facultatif)',
    'contact.form.companyPlaceholder': 'Nom de l\'entreprise',
    'contact.form.phone': 'Téléphone',
    'contact.form.phonePlaceholder': '+33 6 00 00 00 00',
    'contact.form.message': 'Message',
    'contact.form.messagePlaceholder': 'Décrivez ce dont vous avez besoin...',
    'contact.form.submit': 'Envoyer le Message',
    'contact.form.sending': 'Envoi en cours...',
    'contact.form.error': "Erreur lors de l'envoi. Veuillez réessayer.",
    'footer.desc': 'Spécialistes en personnalisation de gobelets en plastique réutilisables. Tampographie et sérigraphie de haute qualité.',
    'footer.tagline': 'VOTRE MARQUE DANS CHAQUE DÉTAIL',
    'footer.nav': 'Navigation',
    'footer.payment': 'Paiement',
    'footer.copyright': '© 2026 PrimeGift. Tous droits réservés.',
    'products.step4.vectorNotice': 'Les fichiers PDF, AI et EPS ne peuvent pas être prévisualisés sur la maquette. Votre fichier sera utilisé dans la maquette finale envoyée pour approbation.',
    'testimonial.3.quote': 'Nous avons utilisé les gobelets PrimeGift pour notre mariage et ce fut un succès. Les invités ont adoré la personnalisation et beaucoup les ont gardés en souvenir.',
    'testimonial.3.role': 'Mariage — Quinta do Lago',
    'testimonial.4.quote': 'Cela fait 3 ans que nous commandons pour nos festivals d\'été. La constance de la qualité et le respect des délais font toute la différence pour les événements de grande envergure.',
    'testimonial.4.role': 'MEO Sudoeste',
    'testimonial.5.quote': 'Nous avons mis en place les gobelets réutilisables dans toute notre chaîne de magasins. Cela a réduit notre consommation de plastique de 80% et les clients adorent le concept éco-responsable.',
    'testimonial.5.role': 'Padaria Portuguesa',
    'legal.privacy.title': 'Politique de Confidentialité',
    'legal.terms.title': 'Conditions Générales',
    'legal.cookies.title': 'Politique de Cookies',
    'legal.returns.title': 'Politique de Retours',
    'legal.shipping.title': 'Politique de Livraison',
    'legal.lastUpdated': 'Dernière mise à jour',
    'legal.date': 'Mars 2026',
    'footer.legal': 'Légal',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.terms': 'Conditions Générales',
    'footer.cookies': 'Politique de Cookies',
    'footer.returns': 'Retours',
    'footer.shipping': 'Politique de Livraison',
  },
};

// ==================== DATA ====================

type Product = {
  id: string;
  name: string;
  capacity: string;
  description: string;
  weight: number;
  cupHeight: number;
  cupTopW: number;
  cupBotW: number;
  prices: Record<number, number>;
  serigrafiasPrices: Record<number, number>;
};

type CartItem = {
  itemId: string;
  productId: string;
  quantity: number;
  printColor: string;
  printTechnique: 'tampografia' | 'serigrafia';
};

const PRODUCTS: Product[] = [
  { id: 'pg200', name: 'Copo de 200ml', capacity: '200ml', description: 'Café e degustação', weight: 15, cupHeight: 65, cupTopW: 50, cupBotW: 36,
    prices: { 100: 0.30, 250: 0.25, 500: 0.20, 1000: 0.16, 2000: 0.14, 5000: 0.12 },
    serigrafiasPrices: { 100: 0.35, 250: 0.29, 500: 0.23, 1000: 0.19, 2000: 0.16, 5000: 0.14 } },
  { id: 'pg300', name: 'Copo de 300ml', capacity: '300ml', description: 'Sumos e refrigerantes', weight: 20, cupHeight: 80, cupTopW: 54, cupBotW: 38,
    prices: { 100: 0.33, 250: 0.28, 500: 0.23, 1000: 0.18, 2000: 0.16, 5000: 0.14 },
    serigrafiasPrices: { 100: 0.38, 250: 0.33, 500: 0.27, 1000: 0.21, 2000: 0.18, 5000: 0.16 } },
  { id: 'pg330', name: 'Copo de 330ml', capacity: '330ml', description: 'Cerveja e cocktails', weight: 22, cupHeight: 88, cupTopW: 56, cupBotW: 39,
    prices: { 100: 0.35, 250: 0.30, 500: 0.25, 1000: 0.20, 2000: 0.17, 5000: 0.15 },
    serigrafiasPrices: { 100: 0.40, 250: 0.35, 500: 0.29, 1000: 0.23, 2000: 0.20, 5000: 0.17 } },
  { id: 'pg500', name: 'Copo de 500ml', capacity: '500ml', description: 'Festivais e eventos', weight: 30, cupHeight: 105, cupTopW: 62, cupBotW: 42,
    prices: { 100: 0.42, 250: 0.36, 500: 0.30, 1000: 0.24, 2000: 0.21, 5000: 0.18 },
    serigrafiasPrices: { 100: 0.49, 250: 0.42, 500: 0.35, 1000: 0.28, 2000: 0.24, 5000: 0.21 } },
];

const PRINT_COLORS = [
  { value: 'black', label: 'Preto', hex: '#000000', surcharge: 0 },
  { value: 'white', label: 'Branco', hex: '#FFFFFF', surcharge: 0 },
  { value: 'grey', label: 'Cinzento', hex: '#808080', surcharge: 0 },
];

const QUANTITIES = [100, 250, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];

const SHIPPING_REGIONS = [
  { value: 'pt-continental', label: 'Portugal Continental' },
  { value: 'pt-islands', label: 'Ilhas (Açores e Madeira)' },
  { value: 'es-peninsular', label: 'Espanha Peninsular' },
  { value: 'eu-zone2', label: 'Europa (Zona 2)' },
  { value: 'eu-zone3', label: 'Europa (Zona 3)' },
  { value: 'international', label: 'Internacional (fora da UE)' },
];

type ShippingMethodRates = Record<number, number>;
type ShippingRegionRates = Record<string, ShippingMethodRates>;
const SHIPPING_RATES: Record<string, ShippingRegionRates> = {
  'pt-continental': {
    'next-day': { 1: 3.68, 2: 3.80, 5: 4.02, 10: 4.19, 15: 5.00, 20: 5.26, 30: 6.71 },
    '2-days': { 1: 3.43, 2: 3.60, 5: 3.82, 10: 4.15, 15: 4.60, 20: 5.20, 30: 6.58 },
    'collect': { 1: 3.19, 2: 3.36, 5: 3.58, 10: 3.91, 15: 4.36, 20: 4.96, 30: 6.34 },
  },
  'pt-islands': {
    'next-day': { 1: 10.92, 5: 18.61, 10: 29.64, 20: 47.86, 30: 70.16 },
    '2-days': { 1: 6.83, 5: 8.36, 10: 11.00, 20: 17.83, 30: 24.22 },
    'collect': { 1: 6.59, 5: 8.12, 10: 10.76, 20: 17.59, 30: 23.98 },
  },
  'es-peninsular': {
    'next-day': { 1: 4.58, 2: 4.67, 5: 5.30, 10: 6.66, 20: 10.09, 30: 14.52 },
    '2-days': { 1: 4.37, 2: 4.55, 5: 5.06, 10: 6.37, 20: 9.89, 30: 13.90 },
    'collect': { 1: 4.13, 2: 4.31, 5: 4.82, 10: 6.13, 20: 9.65, 30: 13.66 },
  },
  'eu-zone2': {
    'standard': { 0.5: 13.72, 1: 14.70, 2: 17.29, 5: 25.06, 10: 38.04, 20: 63.96, 30: 89.87 },
  },
  'eu-zone3': {
    'standard': { 0.5: 17.17, 1: 18.70, 2: 22.46, 5: 33.79, 10: 52.68, 20: 90.46, 30: 128.23 },
  },
};

const SHIPPING_METHOD_LABELS: Record<string, { label: string; days: string }> = {
  'next-day': { label: 'Entrega Expresso', days: '~7 dias úteis (5 dias produção + 2 dias entrega)' },
  '2-days': { label: 'Envio Standard', days: '~2 semanas (5 dias produção + 5 dias úteis entrega)' },
  'collect': { label: 'Ponto Collectt', days: '~2 semanas (5 dias produção + 5 dias úteis entrega)' },
  'standard': { label: 'Envio Standard', days: '~2 semanas (5 dias produção + 5 dias úteis entrega)' },
};

const PAYMENT_METHODS = [
  { id: 'paypal', label: 'PayPal' },
  { id: 'transfer', label: 'Transferência Bancária' },
  { id: 'mbway', label: 'MB WAY' },
  { id: 'applepay', label: 'Apple Pay' },
];

// ==================== HELPERS ====================

function getUnitPrice(product: Product, quantity: number, technique: 'tampografia' | 'serigrafia' = 'tampografia'): number {
  const tiers = [100, 250, 500, 1000, 2000, 5000];
  let tier = 100;
  for (const t of tiers) {
    if (quantity >= t) tier = t;
  }
  const priceTable = technique === 'serigrafia' ? product.serigrafiasPrices : product.prices;
  return priceTable[tier];
}

function getColorSurcharge(printColor: string): number {
  return PRINT_COLORS.find(c => c.value === printColor)?.surcharge ?? 0;
}

function calculateWeightKg(product: Product, quantity: number): number {
  const cupWeight = product.weight * quantity;
  const packaging = 200 + Math.ceil(quantity / 100) * 50;
  return (cupWeight + packaging) / 1000;
}

function getShippingCost(weightKg: number, region: string, method: string): number | null {
  const rates = SHIPPING_RATES[region]?.[method];
  if (!rates) return null;
  const brackets = Object.keys(rates).map(Number).sort((a, b) => a - b);
  for (const bracket of brackets) {
    if (weightKg <= bracket) return rates[bracket];
  }
  return null;
}

function getAvailableMethods(region: string): string[] {
  return Object.keys(SHIPPING_RATES[region] || {});
}

function fmt(n: number): string {
  return n.toFixed(2).replace('.', ',') + '€';
}

function getCartSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (!product) return sum;
    return sum + (getUnitPrice(product, item.quantity, item.printTechnique) + getColorSurcharge(item.printColor)) * item.quantity;
  }, 0);
}

function getCartWeight(cart: CartItem[]): number {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (!product) return sum;
    return sum + calculateWeightKg(product, item.quantity);
  }, 0);
}

// ==================== BACKGROUND REMOVAL ====================

function removeBackground(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Cap processing size for performance
      const MAX = 600;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        const scale = MAX / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject('No canvas context'); return; }

      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const total = w * h;
      const visited = new Uint8Array(total);

      // Sample edge pixels to detect background color
      const step = Math.max(1, Math.floor(Math.max(w, h) / 30));
      let rSum = 0, gSum = 0, bSum = 0, sCount = 0;
      for (let x = 0; x < w; x += step) {
        for (const row of [0, h - 1]) {
          const i = (row * w + x) * 4;
          rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2]; sCount++;
        }
      }
      for (let y = 0; y < h; y += step) {
        for (const col of [0, w - 1]) {
          const i = (y * w + col) * 4;
          rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2]; sCount++;
        }
      }
      const bgR = Math.round(rSum / sCount);
      const bgG = Math.round(gSum / sCount);
      const bgB = Math.round(bSum / sCount);

      const tolerance = 55;
      const feather = 15;
      const maxDist = tolerance + feather;
      const maxDistSq = maxDist * maxDist;
      const tolSq = tolerance * tolerance;

      // Ring buffer queue for BFS (much faster than array push/pop)
      const queue = new Int32Array(total);
      let qHead = 0, qTail = 0;

      // Seed all edge pixels
      for (let x = 0; x < w; x++) {
        queue[qTail++] = x;
        queue[qTail++] = (h - 1) * w + x;
      }
      for (let y = 1; y < h - 1; y++) {
        queue[qTail++] = y * w;
        queue[qTail++] = y * w + (w - 1);
      }

      while (qHead < qTail) {
        const pos = queue[qHead++];
        if (visited[pos]) continue;
        visited[pos] = 1;
        const idx = pos * 4;
        const dr = data[idx] - bgR;
        const dg = data[idx + 1] - bgG;
        const db = data[idx + 2] - bgB;
        const distSq = dr * dr + dg * dg + db * db;
        if (distSq > maxDistSq) continue;

        if (distSq <= tolSq) {
          data[idx + 3] = 0;
        } else {
          const dist = Math.sqrt(distSq);
          const alpha = Math.round(((dist - tolerance) / feather) * data[idx + 3]);
          data[idx + 3] = Math.min(data[idx + 3], alpha);
        }

        const x = pos % w, y = (pos - x) / w;
        if (x > 0 && !visited[pos - 1]) queue[qTail++] = pos - 1;
        if (x < w - 1 && !visited[pos + 1]) queue[qTail++] = pos + 1;
        if (y > 0 && !visited[pos - w]) queue[qTail++] = pos - w;
        if (y < h - 1 && !visited[pos + w]) queue[qTail++] = pos + w;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject('Image load failed');
    img.src = URL.createObjectURL(file);
  });
}

// ==================== EXPORT MOCKUP ====================

function exportMockupPNG(productName: string) {
  const container = document.getElementById('cup-viewer-3d');
  if (!container) return;
  const canvas = container.querySelector('canvas');
  if (!canvas) return;
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mockup-${productName}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

// ==================== COLORS & STYLES ====================

const C = {
  primary: '#1B4F72',
  accent: '#2E86C1',
  lightBg: '#EBF5FB',
  text: '#2C3E50',
  textSec: '#5D6D7E',
  textMuted: '#7F8C8D',
  success: '#27AE60',
  gold: '#F39C12',
  goldLight: '#F1C40F',
  white: '#FFFFFF',
  border: '#D5DBDB',
  cardShadow: '0 2px 12px rgba(0,0,0,0.08)',
  cardShadowHover: '0 4px 20px rgba(0,0,0,0.14)',
};

const container: CSSProperties = { maxWidth: 1200, margin: '0 auto', padding: '0 24px' };

// ==================== SVG COMPONENTS ====================

function Logo({ variant = 'dark', height = 40 }: { variant?: 'dark' | 'white'; height?: number }) {
  const src = variant === 'white' ? '/logo-white.svg' : '/logo.svg';
  return <img src={src} alt="PrimeGift" style={{ height, width: 'auto' }} />;
}

function CupImage({ product, size = 120 }: { product: Product; size?: number }) {
  const h = size;
  const w = h * 0.65;
  const topW = (product.cupTopW / 62) * w * 0.85;
  const botW = (product.cupBotW / 62) * w * 0.6;
  const bodyH = h * 0.82;
  const topY = h * 0.08;
  const cx = w / 2;
  const uid = `cup-${product.id}-${size}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))' }}>
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e0e8ee" stopOpacity="0.6" />
          <stop offset="18%" stopColor="#f5f8fa" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#f0f4f8" stopOpacity="0.9" />
          <stop offset="75%" stopColor="#dce4ea" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c8d4de" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${uid}-shine`} x1="0.3" y1="0" x2="0.7" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fbfd" />
          <stop offset="50%" stopColor="#d0dce6" />
          <stop offset="100%" stopColor="#b8c8d4" />
        </linearGradient>
        <linearGradient id={`${uid}-base`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d0dae2" />
          <stop offset="100%" stopColor="#a8b8c4" />
        </linearGradient>
        <radialGradient id={`${uid}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx={cx} cy={h * 0.96} rx={botW * 0.7} ry={h * 0.03} fill={`url(#${uid}-shadow)`} />
      {/* Cup body */}
      <path d={`M${cx - topW / 2},${topY + 4} L${cx - botW / 2},${topY + bodyH} L${cx + botW / 2},${topY + bodyH} L${cx + topW / 2},${topY + 4} Z`} fill={`url(#${uid}-body)`} stroke="#c0ccd6" strokeWidth="0.8" />
      {/* Shine highlight */}
      <path d={`M${cx - topW * 0.15},${topY + 8} L${cx - botW * 0.08},${topY + bodyH - 4} L${cx + botW * 0.18},${topY + bodyH - 4} L${cx + topW * 0.22},${topY + 8} Z`} fill={`url(#${uid}-shine)`} />
      {/* Left edge reflection */}
      <path d={`M${cx - topW / 2 + 2},${topY + 10} L${cx - botW / 2 + 2},${topY + bodyH - 2} L${cx - botW / 2 + 5},${topY + bodyH - 2} L${cx - topW / 2 + 5},${topY + 10} Z`} fill="rgba(255,255,255,0.3)" />
      {/* Rim ellipse */}
      <ellipse cx={cx} cy={topY + 2} rx={topW / 2} ry={4} fill={`url(#${uid}-rim)`} stroke="#b8c8d4" strokeWidth="0.6" />
      {/* Inner rim */}
      <ellipse cx={cx} cy={topY + 2} rx={topW / 2 - 2.5} ry={2.8} fill="rgba(200,215,228,0.3)" stroke="rgba(180,195,210,0.4)" strokeWidth="0.4" />
      {/* Bottom ellipse */}
      <ellipse cx={cx} cy={topY + bodyH} rx={botW / 2} ry={2.5} fill={`url(#${uid}-base)`} stroke="#a0b0bc" strokeWidth="0.5" />
      {/* Capacity label */}
      <text x={cx} y={topY + bodyH * 0.5} textAnchor="middle" fontSize={h * 0.1} fontWeight="700" fill="#8898a8" fontFamily="system-ui, sans-serif" opacity="0.6">{product.capacity}</text>
    </svg>
  );
}



function PaymentIcon({ method }: { method: string }) {
  const s = 20;
  if (method === 'paypal') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><path d="M7.5,21L8.5,15H5.5L9.5,3H16C18.5,3 20,5 19.5,7.5C19,10 16.5,12 14,12H11.5L10.5,18H7.5Z" fill="#003087" /><path d="M9.5,19L10.5,13H7.5L11.5,3H16C18,3 19,4.5 18.5,6.5C18,9 16,10.5 14,10.5H12L11,16.5H8L9.5,19Z" fill="#009cde" /></svg>
  );
  if (method === 'transfer') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke={C.primary} strokeWidth="2" /><line x1="3" y1="10" x2="21" y2="10" stroke={C.primary} strokeWidth="2" /><rect x="5" y="14" width="6" height="2" rx="1" fill={C.primary} /></svg>
  );
  if (method === 'mbway') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="2" fill="none" stroke="#E4002B" strokeWidth="2" /><circle cx="12" cy="18" r="1.5" fill="#E4002B" /><text x="12" y="13" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#E4002B">MB</text></svg>
  );
  return (
    <svg width={s} height={s} viewBox="0 0 24 24"><path d="M17,3H7A4,4 0 003,7v10a4,4 0 004,4h10a4,4 0 004-4V7A4,4 0 0017,3Z" fill="none" stroke="#000" strokeWidth="1.5" /><path d="M12,7.5A3,3 0 009,10.5c0,3 3,5 3,5s3-2 3-5A3,3 0 0012,7.5Z" fill="#000" /></svg>
  );
}

// ==================== HEADER ====================

function Header({ page, setPage, t, lang, setLang }: { page: string; setPage: (p: string) => void; t: TFunc; lang: Lang; setLang: (l: Lang) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'products', label: t('nav.products') },
    { id: 'how-it-works', label: t('nav.howItWorks') },
    { id: 'contact', label: t('nav.contact') },
  ];
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => { setPage('home'); window.scrollTo(0, 0); }}>
          <Logo variant="white" height={44} />
        </div>
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setPage(item.id); setMenuOpen(false); window.scrollTo(0, 0); }}
              style={{ background: page === item.id ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none', color: C.white, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: page === item.id ? 600 : 400, transition: 'all 0.2s' }}>
              {item.label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                style={{ background: lang === l.code ? 'rgba(255,255,255,0.25)' : 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: lang === l.code ? 700 : 400, transition: 'all 0.2s' }}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </nav>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', color: C.white, fontSize: 24, cursor: 'pointer' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}

// ==================== HERO CUP (realistic with PrimeGift logo) ====================

function HeroCup() {
  const w = 340;
  const h = 520;
  const cx = w / 2;
  const topR = 116;
  const botR = 79;
  const topY = 42;
  const cupH = 400;
  const botY = topY + cupH;
  const rimH = 13;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.25))' }}>
      <defs>
        {/* Cup body gradient — realistic transparent plastic */}
        <linearGradient id="hero-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b8cdd8" stopOpacity="0.45" />
          <stop offset="8%" stopColor="#ccdce6" stopOpacity="0.55" />
          <stop offset="18%" stopColor="#e8f0f5" stopOpacity="0.7" />
          <stop offset="30%" stopColor="#f4f8fb" stopOpacity="0.82" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.88" />
          <stop offset="55%" stopColor="#f6fafc" stopOpacity="0.82" />
          <stop offset="70%" stopColor="#e2ecf2" stopOpacity="0.68" />
          <stop offset="85%" stopColor="#c8d8e4" stopOpacity="0.52" />
          <stop offset="100%" stopColor="#a8bfce" stopOpacity="0.4" />
        </linearGradient>
        {/* Main shine */}
        <linearGradient id="hero-shine" x1="0.22" y1="0" x2="0.38" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="30%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* Secondary shine right */}
        <linearGradient id="hero-shine2" x1="0.65" y1="0" x2="0.78" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* Rim gradient */}
        <linearGradient id="hero-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f5f8" />
          <stop offset="40%" stopColor="#dce6ee" />
          <stop offset="100%" stopColor="#b8cad6" />
        </linearGradient>
        {/* Rim top highlight */}
        <linearGradient id="hero-rim-top" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c8d6e0" />
          <stop offset="30%" stopColor="#f8fbfd" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f0f6fa" />
          <stop offset="100%" stopColor="#c0d0dc" />
        </linearGradient>
        {/* Base gradient */}
        <linearGradient id="hero-base" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a0b4c2" />
          <stop offset="50%" stopColor="#c8d8e2" />
          <stop offset="100%" stopColor="#a0b4c2" />
        </linearGradient>
        {/* Floor shadow */}
        <radialGradient id="hero-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#000" stopOpacity="0.18" />
          <stop offset="70%" stopColor="#000" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        {/* Thickness illusion — inner wall gradient */}
        <linearGradient id="hero-inner" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d0dde6" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#e8f0f5" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#d0dde6" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Floor shadow */}
      <ellipse cx={cx} cy={botY + 18} rx={botR * 1.2} ry={10} fill="url(#hero-floor)" />

      {/* Cup body */}
      <path d={`M${cx - topR},${topY + rimH} L${cx - botR},${botY} L${cx + botR},${botY} L${cx + topR},${topY + rimH} Z`}
        fill="url(#hero-body)" stroke="#b0c4d2" strokeWidth="0.8" />

      {/* Inner wall hint (thickness at top) */}
      <path d={`M${cx - topR + 4},${topY + rimH + 2} L${cx - botR + 3},${botY - 2} L${cx + botR - 3},${botY - 2} L${cx + topR - 4},${topY + rimH + 2} Z`}
        fill="url(#hero-inner)" />

      {/* Horizontal subtle lines (mold lines on plastic) */}
      <line x1={cx - topR * 0.85} y1={topY + cupH * 0.25} x2={cx + topR * 0.85} y2={topY + cupH * 0.25}
        stroke="rgba(180,200,215,0.2)" strokeWidth="0.5" />
      <line x1={cx - topR * 0.78} y1={topY + cupH * 0.5} x2={cx + topR * 0.78} y2={topY + cupH * 0.5}
        stroke="rgba(180,200,215,0.15)" strokeWidth="0.5" />
      <line x1={cx - topR * 0.7} y1={topY + cupH * 0.75} x2={cx + topR * 0.7} y2={topY + cupH * 0.75}
        stroke="rgba(180,200,215,0.12)" strokeWidth="0.5" />

      {/* PrimeGift logo printed on cup (black) */}
      <filter id="hero-logo-black">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </filter>
      <image
        href="/logo.svg"
        x={cx - 100}
        y={topY + cupH * 0.22}
        width={200}
        height={115}
        opacity="0.8"
        filter="url(#hero-logo-black)"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Main shine (left) */}
      <path d={`M${cx - topR + topR * 0.12},${topY + rimH + 4} L${cx - botR + botR * 0.12},${botY - 3} L${cx - botR + botR * 0.35},${botY - 3} L${cx - topR + topR * 0.38},${topY + rimH + 4} Z`}
        fill="url(#hero-shine)" />

      {/* Secondary shine (right) */}
      <path d={`M${cx + topR * 0.25},${topY + rimH + 6} L${cx + botR * 0.22},${botY - 4} L${cx + botR * 0.38},${botY - 4} L${cx + topR * 0.42},${topY + rimH + 6} Z`}
        fill="url(#hero-shine2)" />

      {/* Edge highlight left */}
      <path d={`M${cx - topR + 1},${topY + rimH + 2} L${cx - botR + 1},${botY - 1} L${cx - botR + 3},${botY - 1} L${cx - topR + 3},${topY + rimH + 2} Z`}
        fill="rgba(255,255,255,0.25)" />

      {/* Edge highlight right */}
      <path d={`M${cx + topR - 3},${topY + rimH + 2} L${cx + botR - 3},${botY - 1} L${cx + botR - 1},${botY - 1} L${cx + topR - 1},${topY + rimH + 2} Z`}
        fill="rgba(255,255,255,0.12)" />

      {/* Rim — outer ellipse */}
      <ellipse cx={cx} cy={topY + rimH} rx={topR} ry={rimH} fill="url(#hero-rim)" stroke="#aabfcc" strokeWidth="0.6" />

      {/* Rim — top ring highlight */}
      <ellipse cx={cx} cy={topY + rimH - 1} rx={topR - 1} ry={rimH - 1.5} fill="none" stroke="url(#hero-rim-top)" strokeWidth="1.8" />

      {/* Rim — inner opening */}
      <ellipse cx={cx} cy={topY + rimH} rx={topR - 4} ry={rimH - 3} fill="rgba(200,215,228,0.2)" stroke="rgba(170,190,208,0.3)" strokeWidth="0.5" />

      {/* Rim — inner depth shadow */}
      <ellipse cx={cx} cy={topY + rimH + 1} rx={topR - 6} ry={rimH - 4.5} fill="rgba(100,130,160,0.06)" />

      {/* Bottom ellipse */}
      <ellipse cx={cx} cy={botY} rx={botR} ry={5} fill="url(#hero-base)" stroke="#98adb8" strokeWidth="0.5" />

      {/* Bottom inner ring */}
      <ellipse cx={cx} cy={botY - 1} rx={botR - 3} ry={3.5} fill="rgba(180,195,210,0.15)" />

      {/* Subtle reflection on floor */}
      <path d={`M${cx - botR + 8},${botY + 6} L${cx - botR + 14},${botY + 35} L${cx + botR - 14},${botY + 35} L${cx + botR - 8},${botY + 6} Z`}
        fill="rgba(200,220,240,0.06)" />
    </svg>
  );
}

// ==================== HOME PAGE ====================

function HomePage({ setPage, onSelectProduct, t }: { setPage: (p: string) => void; onSelectProduct: (id: string) => void; t: TFunc }) {
  return (
    <div>
      {/* Hero Banner — Split diagonal: Festival + Copo personalizado */}
      <section style={{ position: 'relative', width: '100%', minHeight: 540, overflow: 'hidden', display: 'flex' }}>
        {/* Lado esquerdo — Festival */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          clipPath: 'polygon(0 0, 62% 0, 48% 100%, 0 100%)',
        }}>
          <img
            src="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&h=800&fit=crop"
            alt={t('hero.imgAlt')}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(27,79,114,0.80) 0%, rgba(27,79,114,0.55) 100%)' }} />
        </div>

        {/* Lado direito — Copo personalizado */}
        <div style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          clipPath: 'polygon(62% 0, 100% 0, 100% 100%, 48% 100%)',
          background: `linear-gradient(160deg, ${C.lightBg} 0%, #F0F7FC 100%)`,
        }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '52%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', textAlign: 'center', display: 'inline-block' }}>
              <HeroCup />
            </div>
          </div>
        </div>

        {/* Conteúdo texto — lado esquerdo */}
        <div style={{ position: 'relative', zIndex: 2, width: '50%', minHeight: 540, display: 'flex', alignItems: 'center', padding: '60px 48px 60px 5%' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 16, backdropFilter: 'blur(8px)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.white, letterSpacing: 0.5 }}>{t('hero.tag')}</span>
            </div>
            <h1 style={{ color: C.white, fontSize: 44, fontWeight: 800, margin: 0, lineHeight: 1.1, textShadow: '0 2px 16px rgba(0,0,0,0.25)' }}>
              {t('hero.title1')}<br />{t('hero.title2')}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: 18, marginTop: 16, lineHeight: 1.6, maxWidth: 420, textShadow: '0 1px 6px rgba(0,0,0,0.15)' }}>
              {t('hero.desc')}
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
              <button onClick={() => { setPage('products'); window.scrollTo(0, 0); }}
                style={{ background: C.white, color: C.primary, border: 'none', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', transition: 'all 0.2s' }}>
                {t('hero.btnProducts')}
              </button>
              <button onClick={() => { setPage('contact'); window.scrollTo(0, 0); }}
                style={{ background: 'rgba(255,255,255,0.15)', color: C.white, border: '2px solid rgba(255,255,255,0.7)', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }}>
                {t('hero.btnQuote')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '24px 0' }}>
        <div style={{ ...container, display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {[
            { icon: '📦', text: t('trust.0') },
            { icon: '🎨', text: t('trust.1') },
            { icon: '⚡', text: t('trust.2') },
            { icon: '🌍', text: t('trust.3') },
            { icon: '💳', text: t('trust.4') },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ padding: '96px 24px', background: C.lightBg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.primary, margin: '0 0 12px' }}>{t('home.products.title')}</h2>
          <p style={{ textAlign: 'center', color: C.textSec, fontSize: 16, margin: '0 0 48px' }}>{t('home.products.subtitle')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {PRODUCTS.map(product => (
              <div key={product.id} onClick={() => { onSelectProduct(product.id); window.scrollTo(0, 0); }}
                style={{ background: C.white, borderRadius: 12, padding: 28, cursor: 'pointer', boxShadow: C.cardShadow, transition: 'all 0.3s', textAlign: 'center', border: `1px solid transparent` }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadowHover; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadow; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <CupImage product={product} size={100} />
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: C.primary }}>{t(`product.${product.id}.name`)}</h3>
                <p style={{ margin: '0 0 4px', fontSize: 15, color: C.text, fontWeight: 500 }}>{product.capacity}</p>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: C.textSec }}>{t(`product.${product.id}.desc`)}</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.success }}>{t('home.products.from')} {fmt(product.prices[5000])}/un.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery: Copos em Acção */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.primary, margin: '0 0 12px' }}>{t('gallery.title')}</h2>
          <p style={{ textAlign: 'center', color: C.textSec, fontSize: 16, margin: '0 0 48px' }}>{t('gallery.subtitle')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {[
              { img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop', label: t('gallery.0.label'), desc: t('gallery.0.desc') },
              { img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop', label: t('gallery.1.label'), desc: t('gallery.1.desc') },
              { img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop', label: t('gallery.2.label'), desc: t('gallery.2.desc') },
              { img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop', label: t('gallery.3.label'), desc: t('gallery.3.desc') },
              { img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop', label: t('gallery.4.label'), desc: t('gallery.4.desc') },
              { img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=400&fit=crop', label: t('gallery.5.label'), desc: t('gallery.5.desc') },
            ].map((item, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '3/2', boxShadow: C.cardShadow }}>
                <img src={item.img} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', padding: '40px 20px 20px' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: C.white }}>{item.label}</h4>
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USPs: Porquê a PrimeGift? */}
      <section style={{ padding: '96px 24px', background: C.lightBg }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.primary, margin: '0 0 12px' }}>{t('usp.title')}</h2>
          <p style={{ textAlign: 'center', color: C.textSec, fontSize: 16, margin: '0 0 48px' }}>{t('usp.subtitle')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '🏭', title: t('usp.0.title'), desc: t('usp.0.desc') },
              { icon: '♻️', title: t('usp.1.title'), desc: t('usp.1.desc') },
              { icon: '🎨', title: t('usp.2.title'), desc: t('usp.2.desc') },
              { icon: '🚀', title: t('usp.3.title'), desc: t('usp.3.desc') },
              { icon: '📦', title: t('usp.4.title'), desc: t('usp.4.desc') },
              { icon: '🤝', title: t('usp.5.title'), desc: t('usp.5.desc') },
            ].map((item, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 12, padding: 28, textAlign: 'center', boxShadow: C.cardShadow, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: C.text }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: C.textSec, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.primary, margin: '0 0 12px' }}>{t('testimonials.title')}</h2>
          <p style={{ textAlign: 'center', color: C.textSec, fontSize: 16, margin: '0 0 48px' }}>{t('testimonials.subtitle')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { name: 'Ana Rodrigues', role: t('testimonial.0.role'), quote: t('testimonial.0.quote') },
              { name: 'Miguel Santos', role: t('testimonial.1.role'), quote: t('testimonial.1.quote') },
              { name: 'Carla Ferreira', role: t('testimonial.2.role'), quote: t('testimonial.2.quote') },
              { name: 'Ricardo Oliveira', role: t('testimonial.3.role'), quote: t('testimonial.3.quote') },
              { name: 'Sofia Martins', role: t('testimonial.4.role'), quote: t('testimonial.4.quote') },
              { name: 'João Almeida', role: t('testimonial.5.role'), quote: t('testimonial.5.quote') },
            ].map((item, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 12, padding: 28, boxShadow: C.cardShadow, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 32, color: C.accent, marginBottom: 12, lineHeight: 1 }}>&ldquo;</div>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: C.textSec, lineHeight: 1.7, flex: 1 }}>{item.quote}</p>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.text }}>{item.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: C.textMuted }}>{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`, padding: '96px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ color: C.white, fontSize: 32, fontWeight: 700, margin: '0 0 16px' }}>{t('home.cta.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, margin: '0 0 32px', lineHeight: 1.6 }}>
            {t('home.cta.subtitle')}
          </p>
          <button onClick={() => { setPage('products'); window.scrollTo(0, 0); }}
            style={{ background: C.white, color: C.primary, border: 'none', padding: '16px 40px', borderRadius: 8, fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', transition: 'all 0.2s' }}>
            {t('home.cta.button')}
          </button>
        </div>
      </section>

      {/* How It Works Preview */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.primary, margin: '0 0 48px' }}>{t('hiw.title')}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
            {[
              { n: '1', title: t('hiw.step1.title'), desc: t('hiw.step1.desc') },
              { n: '2', title: t('hiw.step2.title'), desc: t('hiw.step2.desc') },
              { n: '3', title: t('hiw.step3.title'), desc: t('hiw.step3.desc') },
              { n: '4', title: t('hiw.step4.title'), desc: t('hiw.step4.desc') },
            ].map(step => (
              <div key={step.n} style={{ textAlign: 'center', flex: '1 1 180px', maxWidth: 200 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, margin: '0 auto 16px' }}>
                  {step.n}
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: C.text }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: C.textSec, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ==================== PRODUCTS PAGE ====================

function ProductsPage({ goToContact, initialProduct, t }: { goToContact: () => void; initialProduct: string | null; t: TFunc }) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(initialProduct);
  const [printTechnique, setPrintTechnique] = useState<'tampografia' | 'serigrafia'>('tampografia');
  const [quantity, setQuantity] = useState(100);
  const [printColor, setPrintColor] = useState('black');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [shippingRegion, setShippingRegion] = useState('pt-continental');
  const [shippingMethod, setShippingMethod] = useState('2-days');
  const [showModal, setShowModal] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [logoYOffset, setLogoYOffset] = useState(0);
  const [logoScale, setLogoScale] = useState(100);
  const [cart, setCart] = useState<CartItem[]>([]);

  const ALLOWED_EXTS = ['pdf', 'ai', 'eps', 'png', 'svg', 'jpg', 'jpeg'];
  const validateFile = (file: File): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTS.includes(ext)) {
      alert(`Formato .${ext} não suportado. Use: ${ALLOWED_EXTS.join(', ')}`);
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(t('products.step4.fileTooLarge'));
      return false;
    }
    return true;
  };

  // Upload file to Vercel Blob when selected
  useEffect(() => {
    if (!uploadedFile) return;
    const formData = new FormData();
    formData.append('file', uploadedFile);
    fetch('/api/upload', { method: 'POST', body: formData })
      .then(r => r.json())
      .then(data => { if (data.error) console.error('Upload error:', data.error); })
      .catch(err => console.error('Upload failed:', err));
  }, [uploadedFile]);

  // Generate preview URL when file or autoRemoveBg changes
  useEffect(() => {
    if (!uploadedFile) {
      setLogoPreviewUrl(null);
      return;
    }
    const ext = uploadedFile.name.split('.').pop()?.toLowerCase() || '';
    const isImage = uploadedFile.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'svg'].includes(ext);
    const isVector = ['pdf', 'ai', 'eps'].includes(ext);
    if (!isImage && !isVector) {
      setLogoPreviewUrl(null);
      return;
    }
    if (isVector) {
      // Vector/PDF files can't be previewed but are accepted
      setLogoPreviewUrl(null);
      return;
    }
    // SVGs don't need background removal
    if (uploadedFile.name.endsWith('.svg')) {
      const url = URL.createObjectURL(uploadedFile);
      setLogoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    // If autoRemoveBg is off, show original image
    if (!autoRemoveBg) {
      const url = URL.createObjectURL(uploadedFile);
      setLogoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    // For raster images, auto-remove background
    let cancelled = false;
    setRemovingBg(true);
    removeBackground(uploadedFile)
      .then(dataUrl => {
        if (!cancelled) {
          setLogoPreviewUrl(dataUrl);
          setRemovingBg(false);
        }
      })
      .catch(() => {
        // Fallback: show original image
        if (!cancelled) {
          const url = URL.createObjectURL(uploadedFile);
          setLogoPreviewUrl(url);
          setRemovingBg(false);
        }
      });
    return () => { cancelled = true; };
  }, [uploadedFile, autoRemoveBg]);

  const product = PRODUCTS.find(p => p.id === selectedProduct) || null;

  // Cart calculations
  const cartSubtotal = getCartSubtotal(cart);
  const cartWeightKg = getCartWeight(cart);
  const overweight = cartWeightKg > 30;
  const isInternational = shippingRegion === 'international';
  const availableMethods = getAvailableMethods(shippingRegion);
  const freeShipping = cartSubtotal > 150;
  const shippingCost = (!isInternational && !overweight && cart.length > 0) ? (freeShipping ? 0 : (getShippingCost(cartWeightKg, shippingRegion, shippingMethod) ?? 0)) : 0;
  const totalBeforeVAT = cartSubtotal + shippingCost;
  const vat = totalBeforeVAT * 0.23;
  const total = totalBeforeVAT + vat;

  // Staging item price (for preview in configurator)
  const stagingUnitPrice = product ? getUnitPrice(product, quantity, printTechnique) + getColorSurcharge(printColor) : 0;
  const stagingSubtotal = stagingUnitPrice * quantity;

  // Reset shipping method when region changes
  const handleRegionChange = (r: string) => {
    setShippingRegion(r);
    const methods = getAvailableMethods(r);
    if (methods.length > 0 && !methods.includes(shippingMethod)) {
      setShippingMethod(methods[0]);
    }
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    setCart(prev => [...prev, {
      itemId: crypto.randomUUID(),
      productId: selectedProduct,
      quantity,
      printColor,
      printTechnique,
    }]);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.itemId !== itemId));
  };

  const sectionStyle: CSSProperties = { marginBottom: 32 };
  const stepTitleStyle: CSSProperties = { fontSize: 16, fontWeight: 700, color: C.primary, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 };
  const stepNumStyle: CSSProperties = { width: 28, height: 28, borderRadius: '50%', background: C.primary, color: C.white, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 };

  return (
    <div>
      <section style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ color: C.white, fontSize: 36, fontWeight: 700, margin: 0 }}>{t('products.title')}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '8px 0 0' }}>{t('products.subtitle')}</p>
      </section>

      <section style={{ ...container, padding: '48px 24px' }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* LEFT: Configurator */}
          <div style={{ flex: '1 1 520px', minWidth: 0 }}>
            {/* Step 1: Choose Product */}
            <div style={sectionStyle}>
              <h3 style={stepTitleStyle}><span style={stepNumStyle}>1</span> {t('products.step1')}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {PRODUCTS.map(p => (
                  <div key={p.id} onClick={() => setSelectedProduct(p.id)}
                    style={{ flex: '1 1 130px', maxWidth: 160, padding: 16, borderRadius: 10, border: `2px solid ${selectedProduct === p.id ? C.accent : C.border}`, background: selectedProduct === p.id ? C.lightBg : C.white, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <CupImage product={p} size={60} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, marginTop: 8 }}>{t(`product.${p.id}.name`)}</div>
                    <div style={{ fontSize: 13, color: C.textSec }}>{p.capacity}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{t(`product.${p.id}.desc`)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Printing Technique */}
            <div style={sectionStyle}>
              <h3 style={stepTitleStyle}><span style={stepNumStyle}>2</span> {t('products.step2')}</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {(['tampografia', 'serigrafia'] as const).map(tech => (
                  <div key={tech} onClick={() => setPrintTechnique(tech)}
                    style={{ flex: '1 1 200px', padding: '16px 20px', borderRadius: 10, border: `2px solid ${printTechnique === tech ? C.accent : C.border}`, background: printTechnique === tech ? C.lightBg : C.white, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: printTechnique === tech ? C.accent : C.text, marginBottom: 4 }}>{t(`products.step2.${tech}`)}</div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>{t(`products.step2.${tech}.desc`)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Quantity & Colors */}
            <div style={sectionStyle}>
              <h3 style={stepTitleStyle}><span style={stepNumStyle}>3</span> {t('products.step3')}</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>{t('products.step3.qty')}</label>
                  <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, color: C.text, background: C.white, cursor: 'pointer' }}>
                    {QUANTITIES.map(q => (
                      <option key={q} value={q}>{q.toLocaleString('pt-PT')} {t('products.step3.units')}</option>
                    ))}
                  </select>
                  <button onClick={() => { goToContact(); }}
                    style={{ marginTop: 8, background: 'none', border: 'none', color: C.accent, fontSize: 13, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                    {t('products.step3.customQuote')}
                  </button>
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>{t('products.step3.printColor')}</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {PRINT_COLORS.map(c => (
                      <button key={c.value} onClick={() => setPrintColor(c.value)}
                        style={{ padding: '10px 16px', borderRadius: 8, border: `2px solid ${printColor === c.value ? C.accent : C.border}`, background: printColor === c.value ? C.lightBg : C.white, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: printColor === c.value ? C.accent : C.text, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: c.hex, border: '1px solid #ccc', display: 'inline-block' }} />
                        {t(`color.${c.value}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Staging preview */}
              {product && (
                <div style={{ marginTop: 16, padding: 16, background: C.lightBg, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ fontSize: 14, color: C.text }}>
                    <strong>{t(`product.${product.id}.name`)}</strong> — {quantity.toLocaleString('pt-PT')} un. — {fmt(stagingUnitPrice)}/un. = <strong>{fmt(stagingSubtotal)}</strong>
                  </div>
                  <button onClick={addToCart}
                    style={{ padding: '10px 24px', borderRadius: 8, background: C.success, color: C.white, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                    {t('products.step3.addToCart')}
                  </button>
                </div>
              )}
            </div>

            {/* Step 4: File Upload */}
            <div style={sectionStyle}>
              <h3 style={stepTitleStyle}><span style={stepNumStyle}>4</span> {t('products.step4')}</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ai,.eps,.png,.svg,.jpg,.jpeg,application/pdf,application/postscript,image/png,image/svg+xml,image/jpeg"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file && validateFile(file)) {
                    setUploadedFile(file);
                  }
                }}
              />
              <div
                onClick={() => {
                  if (uploadedFile) {
                    setUploadedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file && validateFile(file)) {
                    setUploadedFile(file);
                  }
                }}
                style={{ border: `2px dashed ${uploadedFile ? C.success : C.border}`, borderRadius: 12, padding: 40, textAlign: 'center', cursor: 'pointer', background: uploadedFile ? '#EAFAF1' : '#FAFAFA', transition: 'all 0.2s' }}>
                {uploadedFile ? (
                  <>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>&#x2705;</div>
                    <p style={{ margin: 0, fontWeight: 600, color: C.success }}>{t('products.step4.fileUploaded')}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textMuted }}>{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(0)}KB) — {t('products.step4.clickToRemove')}</p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>&#x1F4C1;</div>
                    <p style={{ margin: 0, fontWeight: 600, color: C.text }}>{t('products.step4.dragOrClick')}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textMuted }}>{t('products.step4.formats')}</p>
                  </>
                )}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: C.textMuted }}>
                {t('products.step4.bestResult')}
              </p>
              {uploadedFile && !logoPreviewUrl && !removingBg && (
                <div style={{ marginTop: 12, padding: 12, background: '#FEF9E7', borderRadius: 8, border: '1px solid #F9E79F' }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#7D6608' }}>
                    {t('products.step4.vectorNotice')}
                  </p>
                </div>
              )}
              {/* Auto-remove background toggle */}
              {uploadedFile && !uploadedFile.name.endsWith('.svg') && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, cursor: 'pointer', fontSize: 14, color: C.text }}>
                  <input
                    type="checkbox"
                    checked={autoRemoveBg}
                    onChange={e => setAutoRemoveBg(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: C.accent }}
                  />
                  <span style={{ fontWeight: 600 }}>{t('products.step4.autoRemoveBg')}</span>
                  <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 4 }}>
                    ({autoRemoveBg ? t('products.step4.bgRemoved') : t('products.step4.originalImage')})
                  </span>
                </label>
              )}
            </div>

            {/* Cart Items */}
            {cart.length > 0 && (
              <div style={sectionStyle}>
                <h3 style={stepTitleStyle}>
                  <span style={{ ...stepNumStyle, background: C.success }}>&#x1F6D2;</span>
                  {t('cart.title')} ({cart.length} {cart.length === 1 ? t('cart.item') : t('cart.items')})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cart.map(item => {
                    const p = PRODUCTS.find(pr => pr.id === item.productId);
                    if (!p) return null;
                    const up = getUnitPrice(p, item.quantity, item.printTechnique) + getColorSurcharge(item.printColor);
                    const itemTotal = up * item.quantity;
                    return (
                      <div key={item.itemId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: C.white, borderRadius: 8, border: `1px solid ${C.border}` }}>
                        <CupImage product={p} size={36} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{t(`product.${p.id}.name`)} — {p.capacity}</div>
                          <div style={{ fontSize: 12, color: C.textSec }}>
                            {item.quantity.toLocaleString('pt-PT')} un. · {t(`color.${item.printColor}`)} · {fmt(up)}/un.
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, whiteSpace: 'nowrap' }}>{fmt(itemTotal)}</div>
                        <button onClick={() => removeFromCart(item.itemId)}
                          style={{ background: 'none', border: 'none', color: '#E74C3C', fontSize: 18, cursor: 'pointer', padding: '4px 8px', lineHeight: 1 }}
                          title={t('cart.remove')}>
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping */}
            <div style={sectionStyle}>
              <h3 style={stepTitleStyle}><span style={stepNumStyle}>5</span> {t('shipping.title')}</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>{t('shipping.destination')}</label>
                  <select value={shippingRegion} onChange={e => handleRegionChange(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.text, background: C.white }}>
                    {SHIPPING_REGIONS.map(r => (
                      <option key={r.value} value={r.value}>{t(`region.${r.value}`)}</option>
                    ))}
                  </select>
                </div>
                {!isInternational && (
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>{t('shipping.method')}</label>
                    <select value={shippingMethod} onChange={e => setShippingMethod(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.text, background: C.white }}>
                      {availableMethods.map(m => (
                        <option key={m} value={m}>{t(`method.${m}`)} ({t(`method.${m}.days`)})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              {isInternational && (
                <div style={{ marginTop: 12, padding: 16, background: '#FEF9E7', borderRadius: 8, border: '1px solid #F9E79F' }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#7D6608' }}>{t('shipping.international')} <a onClick={() => goToContact()} style={{ color: C.accent, cursor: 'pointer', textDecoration: 'underline' }}>{t('shipping.internationalLink')}</a> {t('shipping.internationalSuffix')}</p>
                </div>
              )}
              {overweight && !isInternational && (
                <div style={{ marginTop: 12, padding: 16, background: '#FDEDEC', borderRadius: 8, border: '1px solid #F5B7B1' }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#922B21' }}>{t('shipping.overweight')} <a onClick={() => goToContact()} style={{ color: C.accent, cursor: 'pointer', textDecoration: 'underline' }}>{t('shipping.overweightLink')}</a> {t('shipping.overweightSuffix')}</p>
                </div>
              )}
              {freeShipping && (
                <div style={{ marginTop: 12, padding: 12, background: '#EAFAF1', borderRadius: 8, border: '1px solid #82E0AA' }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#1E8449', fontWeight: 600 }}>{t('shipping.freeShipping')}</p>
                </div>
              )}
              {cart.length > 0 && !isInternational && !overweight && (
                <p style={{ margin: '8px 0 0', fontSize: 13, color: C.textMuted }}>
                  {t('shipping.estimatedWeight')} {cartWeightKg.toFixed(1)}kg — {t('shipping.deadline')} {t(`method.${shippingMethod}.days`)}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Mockup + Order Summary */}
          <div style={{ flex: '0 0 480px', position: 'sticky', top: 80, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Cup Mockup Preview */}
            {product && (
              <div style={{ background: C.white, borderRadius: 12, boxShadow: C.cardShadow, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ background: `linear-gradient(135deg, ${C.lightBg}, #F8F9FA)`, padding: '12px 24px', borderBottom: `1px solid ${C.border}` }}>
                  <h3 style={{ color: C.primary, margin: 0, fontSize: 16, fontWeight: 700 }}>
                    {logoPreviewUrl ? t('mockup.preview') : t('mockup.title')}
                  </h3>
                  {!logoPreviewUrl && <p style={{ margin: '4px 0 0', fontSize: 12, color: C.textMuted }}>{t('mockup.uploadHint')}</p>}
                </div>
                <div style={{ padding: 24, display: 'flex', justifyContent: 'center', background: '#FAFBFC' }}>
                  <CupViewer3D
                    radiusTop={product.cupTopW / 2}
                    radiusBottom={product.cupBotW / 2}
                    height={product.cupHeight}
                    logoUrl={logoPreviewUrl}
                    logoScale={logoScale}
                    logoYOffset={logoYOffset}
                    printColor={PRINT_COLORS.find(c => c.value === printColor)?.hex ?? '#000000'}
                    capacity={product.capacity}
                    rotating={printTechnique === 'serigrafia'}
                  />
                </div>
                {removingBg && (
                  <div style={{ padding: '8px 24px 16px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 12, color: C.accent, fontWeight: 600 }}>
                      &#x23F3; {t('mockup.removingBg')}
                    </p>
                  </div>
                )}
                {logoPreviewUrl && !removingBg && (
                  <div style={{ padding: '8px 24px 16px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 12, color: C.success, fontWeight: 600 }}>
                      &#x2705; {t('mockup.simulation')} — {t(`product.${product.id}.name`)} ({product.capacity})
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: C.textMuted }}>
                      {autoRemoveBg ? t('mockup.bgRemovedAuto') : t('mockup.originalImg')} {t('mockup.finalApproval')}
                    </p>
                  </div>
                )}
                {/* Logo position & size sliders */}
                {logoPreviewUrl && !removingBg && (
                  <div style={{ padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Size slider */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec }}>{t('mockup.logoSize')} ({logoScale}%)</label>
                        {logoScale !== 100 && (
                          <button onClick={() => setLogoScale(100)}
                            style={{ background: 'none', border: 'none', color: C.accent, fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                            Reset
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: C.textMuted }}>&#x2212;</span>
                        <input
                          type="range"
                          min={30}
                          max={300}
                          value={logoScale}
                          onChange={e => setLogoScale(Number(e.target.value))}
                          style={{ flex: 1, cursor: 'pointer', accentColor: C.accent }}
                        />
                        <span style={{ fontSize: 11, color: C.textMuted }}>+</span>
                      </div>
                    </div>
                    {/* Download mockup button */}
                    <button
                      onClick={() => product && exportMockupPNG(product.name)}
                      style={{ width: '100%', marginTop: 4, padding: '10px 16px', borderRadius: 8, background: 'transparent', color: C.accent, border: `2px solid ${C.accent}`, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {t('mockup.download')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Order Summary */}
            <div style={{ background: C.white, borderRadius: 12, boxShadow: C.cardShadow, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ background: C.primary, padding: '16px 24px' }}>
                <h3 style={{ color: C.white, margin: 0, fontSize: 18, fontWeight: 700 }}>{t('order.title')}</h3>
              </div>
              <div style={{ padding: 24 }}>
                {cart.length > 0 ? (
                  <>
                    {/* Cart items summary */}
                    <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
                      {cart.map(item => {
                        const p = PRODUCTS.find(pr => pr.id === item.productId);
                        if (!p) return null;
                        const up = getUnitPrice(p, item.quantity, item.printTechnique) + getColorSurcharge(item.printColor);
                        const itemTotal = up * item.quantity;
                        return (
                          <div key={item.itemId} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                            <CupImage product={p} size={32} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{t(`product.${p.id}.name`)}</div>
                              <div style={{ fontSize: 11, color: C.textSec }}>{item.quantity.toLocaleString('pt-PT')} un. × {fmt(up)}</div>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: C.text, whiteSpace: 'nowrap' }}>{fmt(itemTotal)}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: C.textSec }}>{t('order.subtotal')} ({cart.length} {cart.length === 1 ? t('cart.item') : t('cart.items')})</span>
                        <span style={{ fontWeight: 600 }}>{fmt(cartSubtotal)}</span>
                      </div>
                      {!isInternational && !overweight && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: C.textSec }}>{t('order.shipping')}</span>
                          <span style={{ fontWeight: 700, color: freeShipping ? C.success : undefined }}>{freeShipping ? t('order.shippingFree') : fmt(shippingCost)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: C.textSec }}>{t('order.vat')}</span>
                        <span style={{ fontWeight: 600 }}>{fmt(vat)}</span>
                      </div>
                      <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                        <span style={{ fontWeight: 700, color: C.primary }}>{t('order.total')}</span>
                        <span style={{ fontWeight: 700, color: C.primary }}>{fmt(total)}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: C.success, margin: '16px 0', fontWeight: 600 }}>✓ {t('order.freeMockup')}</p>
                    <button onClick={() => setShowModal(true)}
                      style={{ width: '100%', padding: '14px', borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: C.white, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {t('order.finalize')}
                    </button>
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                      <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 8px' }}>{t('order.paymentMethods')}</p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {PAYMENT_METHODS.map(pm => (
                          <div key={pm.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <PaymentIcon method={pm.id} />
                            <span style={{ fontSize: 11, color: C.textSec }}>{t('payment.' + pm.id)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: C.textMuted }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                    <p style={{ margin: 0, fontSize: 14 }}>{t('order.emptyCart')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Price Table */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: C.primary, margin: '0 0 8px' }}>{t('priceTable.title')}</h2>
          <p style={{ color: C.textSec, fontSize: 14, margin: '0 0 24px' }}>{t('priceTable.subtitle')}</p>
          {/* Technique toggle for price table */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: `2px solid ${C.primary}`, width: 'fit-content' }}>
            {(['tampografia', 'serigrafia'] as const).map(tech => (
              <button key={tech} onClick={() => setPrintTechnique(tech)}
                style={{ padding: '8px 20px', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', background: printTechnique === tech ? C.primary : C.white, color: printTechnique === tech ? C.white : C.primary, transition: 'all 0.2s' }}>
                {t(`products.step2.${tech}`)}
              </button>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.primary }}>
                  <th style={{ padding: '12px 16px', color: C.white, textAlign: 'left', fontWeight: 600 }}>{t('priceTable.product')}</th>
                  {[100, 250, 500, '1.000', '2.000', '5.000-10.000'].map((q, i) => (
                    <th key={i} style={{ padding: '12px 8px', color: C.white, textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>{typeof q === 'number' ? q : q} un.</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p, idx) => {
                  const prices = printTechnique === 'serigrafia' ? p.serigrafiasPrices : p.prices;
                  return (
                  <tr key={p.id} style={{ background: idx % 2 === 0 ? C.white : C.lightBg }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: C.text }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CupImage product={p} size={28} />
                        {t(`product.${p.id}.name`)} ({p.capacity})
                      </div>
                    </td>
                    {[100, 250, 500, 1000, 2000, 5000].map(q => (
                      <td key={q} style={{ padding: '12px 8px', textAlign: 'center', color: C.text }}>{fmt(prices[q])}</td>
                    ))}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: C.textMuted }}>
            <span>{t('priceTable.printColors')}</span>
            <span>{t('priceTable.vatNote')}</span>
            <span style={{ color: C.success, fontWeight: 600 }}>{t('priceTable.freeShipping')}</span>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {showModal && cart.length > 0 && (
        <ConfirmationModal cart={cart} cartSubtotal={cartSubtotal} shippingCost={shippingCost} freeShipping={freeShipping} vat={vat} total={total} shippingRegion={shippingRegion} shippingMethod={shippingMethod} isInternational={isInternational} overweight={overweight} onClose={() => setShowModal(false)} t={t} />
      )}
    </div>
  );
}

// ==================== CONFIRMATION MODAL ====================

function ConfirmationModal({ cart, cartSubtotal, shippingCost, freeShipping, vat, total, shippingRegion, shippingMethod, isInternational, overweight, onClose, t }: {
  cart: CartItem[]; cartSubtotal: number; shippingCost: number; freeShipping: boolean; vat: number; total: number; shippingRegion: string; shippingMethod: string; isInternational: boolean; overweight: boolean; onClose: () => void; t: TFunc;
}) {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const PAYMENT_URLS: Record<string, string> = {
    paypal: 'https://www.paypal.com',
    transfer: 'https://www.bancobpi.pt',
    mbway: 'https://www.mbway.pt',
    applepay: 'https://www.apple.com/apple-pay/',
  };

  const handleConfirm = () => {
    if (!selectedPayment) return;
    const url = PAYMENT_URLS[selectedPayment];
    if (url) window.open(url, '_blank');
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 24 }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: 16, padding: 32, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <h2 style={{ color: C.primary, margin: '0 0 24px', fontSize: 24 }}>{t('modal.title')}</h2>

        <div style={{ background: C.lightBg, borderRadius: 8, padding: 20, marginBottom: 24 }}>
          {/* Cart items */}
          {cart.map(item => {
            const p = PRODUCTS.find(pr => pr.id === item.productId);
            if (!p) return null;
            const up = getUnitPrice(p, item.quantity, item.printTechnique) + getColorSurcharge(item.printColor);
            const itemTotal = up * item.quantity;
            return (
              <div key={item.itemId} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <CupImage product={p} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t(`product.${p.id}.name`)} — {p.capacity}</div>
                  <div style={{ fontSize: 12, color: C.textSec }}>
                    {item.quantity.toLocaleString('pt-PT')} un. · {t(`color.${item.printColor}`)} · {fmt(up)}/un.
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.primary }}>{fmt(itemTotal)}</div>
              </div>
            );
          })}
          <div style={{ height: 1, background: C.border, margin: '12px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('order.subtotal')}</span><span style={{ fontWeight: 600 }}>{fmt(cartSubtotal)}</span></div>
            {!isInternational && !overweight && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('order.shipping')} ({t(`method.${shippingMethod}`)})</span><span style={{ fontWeight: 700, color: freeShipping ? C.success : undefined }}>{freeShipping ? t('order.shippingFree') : fmt(shippingCost)}</span></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('order.vat')}</span><span style={{ fontWeight: 600 }}>{fmt(vat)}</span></div>
            <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20 }}>
              <span style={{ fontWeight: 700, color: C.primary }}>{t('order.total')}</span>
              <span style={{ fontWeight: 700, color: C.primary }}>{fmt(total)}</span>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 12px' }}>{t('modal.paymentMethod')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {PAYMENT_METHODS.map(pm => (
            <label key={pm.id} onClick={() => setSelectedPayment(pm.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, border: `2px solid ${selectedPayment === pm.id ? C.accent : C.border}`, background: selectedPayment === pm.id ? C.lightBg : C.white, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedPayment === pm.id ? C.accent : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedPayment === pm.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.accent }} />}
              </div>
              <PaymentIcon method={pm.id} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>{t('payment.' + pm.id)}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '13px', borderRadius: 8, background: C.white, color: C.textSec, border: `1px solid ${C.border}`, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            {t('modal.cancel')}
          </button>
          <button onClick={handleConfirm} disabled={!selectedPayment}
            style={{ flex: 2, padding: '13px', borderRadius: 8, background: selectedPayment ? `linear-gradient(135deg, ${C.primary}, ${C.accent})` : '#BDC3C7', color: C.white, border: 'none', fontSize: 15, fontWeight: 700, cursor: selectedPayment ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
            {t('modal.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== HOW IT WORKS PAGE ====================

function HowItWorksPage({ t }: { t: TFunc }) {
  const steps = [
    { n: '1', title: t('hiwPage.step1.title'), desc: t('hiwPage.step1.desc') },
    { n: '2', title: t('hiwPage.step2.title'), desc: t('hiwPage.step2.desc') },
    { n: '3', title: t('hiwPage.step3.title'), desc: t('hiwPage.step3.desc') },
    { n: '4', title: t('hiwPage.step4.title'), desc: t('hiwPage.step4.desc') },
  ];

  return (
    <div>
      <section style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ color: C.white, fontSize: 36, fontWeight: 700, margin: 0 }}>{t('hiw.title')}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '8px 0 0' }}>{t('hiw.subtitle')}</p>
      </section>

      <section style={{ ...container, padding: '64px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {steps.map((step, idx) => (
            <div key={step.n} style={{ display: 'flex', gap: 24, marginBottom: idx < steps.length - 1 ? 40 : 0, position: 'relative' }}>
              {idx < steps.length - 1 && (
                <div style={{ position: 'absolute', left: 27, top: 56, width: 2, height: 'calc(100% - 20px)', background: `linear-gradient(to bottom, ${C.accent}, ${C.border})` }} />
              )}
              <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, position: 'relative', zIndex: 1 }}>
                {step.n}
              </div>
              <div style={{ paddingTop: 4 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: C.primary }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: 15, color: C.textSec, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* File Requirements */}
        <div style={{ maxWidth: 700, margin: '64px auto 0', background: C.lightBg, borderRadius: 12, padding: 32, border: `1px solid #AED6F1` }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: C.primary }}>{t('hiwPage.fileReq')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: t('hiwPage.formats'), value: t('hiwPage.formatsVal') },
              { label: t('hiwPage.resolution'), value: t('hiwPage.resolutionVal') },
              { label: t('hiwPage.colorMode'), value: t('hiwPage.colorModeVal') },
              { label: t('hiwPage.printArea'), value: t('hiwPage.printAreaVal') },
              { label: t('hiwPage.numColors'), value: t('hiwPage.numColorsVal') },
              { label: t('hiwPage.maxSize'), value: t('hiwPage.maxSizeVal') },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, fontSize: 14 }}>
                <span style={{ fontWeight: 700, color: C.text, minWidth: 180 }}>{item.label}:</span>
                <span style={{ color: C.textSec }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ==================== CONTACT PAGE ====================

function ContactPage({ t }: { t: TFunc }) {
  const [form, setForm] = useState({ nome: '', email: '', empresa: '', telefone: '', mensagem: '' });
  const [sent, setSent] = useState(false);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch (err) {
      setError(t('contact.form.error'));
    } finally {
      setSending(false);
    }
  };

  const inputStyle: CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, color: C.text, fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle: CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 6 };

  return (
    <div>
      <section style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ color: C.white, fontSize: 36, fontWeight: 700, margin: 0 }}>{t('contact.title')}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '8px 0 0' }}>{t('contact.subtitle')}</p>
      </section>

      <section style={{ ...container, padding: '64px 24px' }}>
        {/* Contact Form */}
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: 48, background: '#EAFAF1', borderRadius: 12 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ color: C.success, margin: '0 0 12px' }}>{t('contact.sent.title')}</h2>
              <p style={{ color: C.textSec, margin: '0 0 24px' }}>{t('contact.sent.desc')}</p>
              <button onClick={() => { setSent(false); setForm({ nome: '', email: '', empresa: '', telefone: '', mensagem: '' }); }}
                style={{ padding: '10px 24px', borderRadius: 8, background: C.primary, color: C.white, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {t('contact.sent.newMsg')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: C.white, borderRadius: 12, padding: 32, boxShadow: C.cardShadow, border: `1px solid ${C.border}` }}>
              <h2 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700, color: C.primary }}>{t('contact.form.title')}</h2>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>{t('contact.form.name')} *</label>
                  <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} style={inputStyle} placeholder={t('contact.form.namePlaceholder')} />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>{t('contact.form.email')} *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} placeholder={t('contact.form.emailPlaceholder')} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>{t('contact.form.company')} <span style={{ fontWeight: 400, color: C.textMuted }}>{t('contact.form.companyOptional')}</span></label>
                  <input value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} style={inputStyle} placeholder={t('contact.form.companyPlaceholder')} />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>{t('contact.form.phone')}</label>
                  <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} style={inputStyle} placeholder={t('contact.form.phonePlaceholder')} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>{t('contact.form.message')} *</label>
                <textarea required value={form.mensagem} onChange={e => setForm({ ...form, mensagem: e.target.value })}
                  style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} placeholder={t('contact.form.messagePlaceholder')} />
              </div>
              {error && <p style={{ color: '#e74c3c', fontSize: 14, marginBottom: 12 }}>{error}</p>}
              <button type="submit" disabled={sending}
                style={{ width: '100%', padding: '14px', borderRadius: 8, background: sending ? C.textMuted : `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: C.white, border: 'none', fontSize: 16, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                {sending ? t('contact.form.sending') : t('contact.form.submit')}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

// ==================== LEGAL PAGE ====================

function LegalPage({ type, t }: { type: string; t: TFunc }) {
  const content: Record<string, { title: string; sections: { heading: string; text: string }[] }> = {
    privacy: {
      title: t('legal.privacy.title'),
      sections: [
        { heading: 'Responsável pelo Tratamento', text: 'A PrimeGift, com sede em Portugal, é a responsável pelo tratamento dos dados pessoais recolhidos através deste website.' },
        { heading: 'Dados Recolhidos', text: 'Recolhemos os seguintes dados pessoais: nome, email, telefone, empresa e mensagem, exclusivamente quando submetidos voluntariamente através do formulário de contacto ou encomenda.' },
        { heading: 'Finalidade do Tratamento', text: 'Os dados pessoais são tratados com a finalidade de responder a pedidos de contacto, processar encomendas, enviar orçamentos e prestar apoio ao cliente.' },
        { heading: 'Base Legal', text: 'O tratamento dos dados baseia-se no consentimento do titular (ao submeter o formulário) e na execução de contrato ou diligências pré-contratuais.' },
        { heading: 'Conservação dos Dados', text: 'Os dados pessoais são conservados pelo período necessário ao cumprimento das finalidades para que foram recolhidos, ou pelo período exigido por lei.' },
        { heading: 'Direitos do Titular', text: 'Nos termos do RGPD, tem direito de acesso, retificação, apagamento, limitação do tratamento, portabilidade e oposição ao tratamento dos seus dados. Para exercer estes direitos, contacte-nos através de info@metalprime.pt.' },
        { heading: 'Segurança', text: 'Implementamos medidas técnicas e organizativas adequadas para proteger os dados pessoais contra perda, uso indevido, acesso não autorizado ou divulgação.' },
      ]
    },
    terms: {
      title: t('legal.terms.title'),
      sections: [
        { heading: 'Identificação', text: 'O presente website é propriedade e operado pela PrimeGift (MetalPrime), com sede em Portugal. Email: info@metalprime.pt.' },
        { heading: 'Produtos e Serviços', text: 'A PrimeGift comercializa copos de plástico reutilizáveis personalizados com tampografia e serigrafia. Os produtos apresentados no website são meramente ilustrativos, podendo existir ligeiras variações de cor ou dimensão.' },
        { heading: 'Encomendas', text: 'A encomenda mínima é de 100 unidades. Todas as encomendas estão sujeitas a aprovação de maquete digital antes da produção. O prazo de produção é de 5 dias úteis após aprovação da maquete, acrescido do prazo de entrega.' },
        { heading: 'Preços', text: 'Os preços indicados no website não incluem IVA (23%). Os preços incluem impressão a 1 cor. O transporte é calculado com base no peso e destino da encomenda. Portes grátis para encomendas acima de 150€ (antes de IVA).' },
        { heading: 'Pagamento', text: 'Aceitamos pagamento por PayPal, Transferência Bancária, MB WAY e Apple Pay. O pagamento é exigido na totalidade antes do início da produção.' },
        { heading: 'Propriedade Intelectual', text: 'O cliente garante que detém os direitos sobre os logótipos e designs enviados para personalização. A PrimeGift não se responsabiliza por violações de direitos de propriedade intelectual de terceiros.' },
        { heading: 'Limitação de Responsabilidade', text: 'A PrimeGift não se responsabiliza por atrasos causados por terceiros (transportadoras, serviços postais) ou por casos de força maior.' },
      ]
    },
    cookies: {
      title: t('legal.cookies.title'),
      sections: [
        { heading: 'O Que São Cookies', text: 'Cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando visita um website. São amplamente utilizados para fazer os websites funcionarem de forma mais eficiente.' },
        { heading: 'Cookies Utilizados', text: 'Este website utiliza apenas cookies essenciais e de funcionalidade: armazenamento da preferência de idioma (localStorage). Não utilizamos cookies de rastreamento, publicidade ou analytics de terceiros.' },
        { heading: 'Cookies Essenciais', text: 'primegift-lang: Armazena a sua preferência de idioma (PT, ES, EN, FR). Este cookie é estritamente necessário para o funcionamento do website e não pode ser desativado.' },
        { heading: 'Cookies de Terceiros', text: 'Não utilizamos cookies de terceiros. As imagens do website são servidas através do Unsplash, que pode utilizar os seus próprios cookies conforme a sua política de privacidade.' },
        { heading: 'Gestão de Cookies', text: 'Pode gerir ou eliminar cookies através das definições do seu browser. Note que a eliminação do cookie de idioma resultará no website ser apresentado em Português por defeito.' },
      ]
    },
    returns: {
      title: t('legal.returns.title'),
      sections: [
        { heading: 'Produtos Personalizados', text: 'Por se tratar de produtos personalizados feitos por encomenda, os copos com impressão personalizada não são elegíveis para devolução ou troca, exceto em caso de defeito de fabrico, conforme previsto no Decreto-Lei n.º 67/2003.' },
        { heading: 'Defeitos de Fabrico', text: 'Em caso de defeito de fabrico (impressão com defeito, produto danificado, quantidade incorreta), o cliente deve reportar o problema no prazo de 48 horas após a receção da encomenda, enviando fotografias do defeito para info@metalprime.pt.' },
        { heading: 'Processo de Reclamação', text: '1) Contacte-nos por email com fotografias do defeito; 2) Analisaremos a reclamação em 48 horas úteis; 3) Se o defeito for confirmado, procederemos à reposição ou reembolso total do valor.' },
        { heading: 'Aprovação de Maquete', text: 'Após aprovação da maquete digital pelo cliente, quaisquer erros presentes na maquete aprovada são da responsabilidade do cliente. Recomendamos uma revisão cuidadosa de todos os elementos antes da aprovação.' },
        { heading: 'Cancelamento', text: 'Encomendas podem ser canceladas sem custos antes do início da produção. Após o início da produção, não é possível cancelar a encomenda.' },
      ]
    },
    shipping: {
      title: t('legal.shipping.title'),
      sections: [
        { heading: 'Prazos de Entrega', text: 'Produção: 5 dias úteis após aprovação da maquete. Entrega Expresso: 2 dias úteis adicionais. Envio Standard: 5 dias úteis adicionais. Total estimado: 7 a 10 dias úteis.' },
        { heading: 'Zonas de Entrega', text: 'Portugal Continental, Ilhas (Açores e Madeira), Espanha Peninsular, Europa (Zona 2 e 3). Para envios internacionais fora da UE, contacte-nos para orçamento personalizado.' },
        { heading: 'Custos de Envio', text: 'Os custos de envio são calculados com base no peso total da encomenda e na zona de destino. Portes grátis para encomendas com subtotal superior a 150€ (antes de IVA). Para encomendas acima de 30kg, contacte-nos para o melhor preço.' },
        { heading: 'Transportadora', text: 'Os envios são realizados através da CTT Expresso para Portugal e Espanha, e através de transportadoras internacionais para a restante Europa.' },
        { heading: 'Rastreamento', text: 'Após o envio, receberá um email com o número de rastreamento para acompanhar a sua encomenda em tempo real.' },
        { heading: 'Receção da Encomenda', text: 'Na receção, verifique o estado da embalagem e dos produtos. Em caso de danos visíveis, recuse a entrega ou assinale os danos no comprovativo de entrega e contacte-nos imediatamente.' },
      ]
    },
  };

  const c = content[type];
  if (!c) return null;

  return (
    <div>
      <section style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ color: C.white, fontSize: 36, fontWeight: 700, margin: 0 }}>{c.title}</h1>
      </section>
      <section style={{ ...container, padding: '48px 24px', maxWidth: 800, margin: '0 auto' }}>
        {c.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.primary, margin: '0 0 12px' }}>{s.heading}</h2>
            <p style={{ fontSize: 15, color: C.textSec, lineHeight: 1.8, margin: 0 }}>{s.text}</p>
          </div>
        ))}
        <div style={{ marginTop: 48, padding: 24, background: C.lightBg, borderRadius: 12, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, color: C.textSec }}>
            {t('legal.lastUpdated')}: {t('legal.date')}
          </p>
        </div>
      </section>
    </div>
  );
}

// ==================== FOOTER ====================

function Footer({ setPage, t }: { setPage: (p: string) => void; t: TFunc }) {
  return (
    <footer style={{ background: C.primary, color: 'rgba(255,255,255,0.8)', padding: '48px 24px 24px' }}>
      <div style={{ ...container, display: 'flex', flexWrap: 'wrap', gap: 48, marginBottom: 32 }}>
        {/* Logo & Description */}
        <div style={{ flex: '1 1 280px' }}>
          <div style={{ marginBottom: 12 }}>
            <Logo variant="white" height={48} />
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, margin: '0 0 4px', opacity: 0.8 }}>
            {t('footer.desc')}
          </p>
          <p style={{ fontSize: 11, margin: 0, opacity: 0.6, fontStyle: 'italic' }}>{t('footer.tagline')}</p>
        </div>

        {/* Navigation */}
        <div style={{ flex: '0 0 160px' }}>
          <h4 style={{ color: C.white, fontSize: 14, fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>{t('footer.nav')}</h4>
          {[
            { id: 'home', key: 'nav.home' },
            { id: 'products', key: 'nav.products' },
            { id: 'how-it-works', key: 'nav.howItWorks' },
            { id: 'contact', key: 'nav.contact' },
          ].map(item => (
            <div key={item.id} style={{ marginBottom: 8 }}>
              <a onClick={() => { setPage(item.id); window.scrollTo(0, 0); }}
                style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.white)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>
                {t(item.key)}
              </a>
            </div>
          ))}
        </div>

        {/* Legal */}
        <div style={{ flex: '0 0 180px' }}>
          <h4 style={{ color: C.white, fontSize: 14, fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>{t('footer.legal')}</h4>
          {[
            { id: 'privacy', key: 'footer.privacy' },
            { id: 'terms', key: 'footer.terms' },
            { id: 'cookies', key: 'footer.cookies' },
            { id: 'returns', key: 'footer.returns' },
            { id: 'shipping-policy', key: 'footer.shipping' },
          ].map(item => (
            <div key={item.id} style={{ marginBottom: 8 }}>
              <a onClick={() => { setPage(item.id); window.scrollTo(0, 0); }}
                style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.white)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>
                {t(item.key)}
              </a>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div style={{ flex: '0 0 200px' }}>
          <h4 style={{ color: C.white, fontSize: 14, fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>{t('footer.payment')}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {PAYMENT_METHODS.map(pm => (
              <div key={pm.id} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PaymentIcon method={pm.id} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{t('payment.' + pm.id)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 20, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.6 }}>{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}

// ==================== MAIN APP ====================

export default function PrimeGiftApp() {
  const [page, setPage] = useState('home');
  const [initialProduct, setInitialProduct] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>('pt');

  useEffect(() => {
    const saved = localStorage.getItem('primegift-lang') as Lang | null;
    if (saved && ['pt', 'es', 'en', 'fr'].includes(saved)) setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('primegift-lang', lang);
  }, [lang]);

  const t: TFunc = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.pt[key] ?? key;

  const handleSelectProduct = (productId: string) => {
    setInitialProduct(productId);
    setPage('products');
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header page={page} setPage={setPage} t={t} lang={lang} setLang={setLang} />
      <main style={{ flex: 1 }}>
        {page === 'home' && <HomePage setPage={setPage} onSelectProduct={handleSelectProduct} t={t} />}
        {page === 'products' && <ProductsPage key={initialProduct ?? 'default'} goToContact={() => { setPage('contact'); window.scrollTo(0, 0); }} initialProduct={initialProduct} t={t} />}
        {page === 'how-it-works' && <HowItWorksPage t={t} />}
        {page === 'contact' && <ContactPage t={t} />}
        {page === 'privacy' && <LegalPage type="privacy" t={t} />}
        {page === 'terms' && <LegalPage type="terms" t={t} />}
        {page === 'cookies' && <LegalPage type="cookies" t={t} />}
        {page === 'returns' && <LegalPage type="returns" t={t} />}
        {page === 'shipping-policy' && <LegalPage type="shipping" t={t} />}
      </main>
      <Footer setPage={setPage} t={t} />
    </div>
  );
}
