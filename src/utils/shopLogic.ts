import { CartItem, Order, Product, StoreSettings } from '../types';

/**
 * Formats a numeric value into Brazilian Real (BRL) currency string
 * Example: 49.9 -> "R$ 49,90"
 */
export function formatBRL(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'R$ 0,00';
  }
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Normalizes a Brazilian phone number to standard international WhatsApp digits format (e.g. 5511999999999)
 */
export function cleanPhoneNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';
  // If already starts with 55 and has 12 or 13 digits, keep
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }
  // If Brazilian standard 10 or 11 digits (e.g. 11987654321), prepend 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

/**
 * Formats phone number for display: (11) 98765-4321
 */
export function formatPhoneDisplay(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 13 && digits.startsWith('55')) {
    const local = digits.slice(2);
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  return rawPhone;
}

/**
 * Computes subtotal, items count, and total amount for a cart
 */
export function calculateCartTotals(items: CartItem[]): {
  subtotal: number;
  totalQuantity: number;
  savings: number;
} {
  let subtotal = 0;
  let totalQuantity = 0;
  let savings = 0;

  for (const item of items) {
    const qty = Math.max(1, item.quantity);
    const unitPrice =
      item.product.promotionalPrice && item.product.promotionalPrice > 0
        ? item.product.promotionalPrice
        : item.product.price;

    subtotal += unitPrice * qty;
    totalQuantity += qty;

    if (item.product.promotionalPrice && item.product.promotionalPrice < item.product.price) {
      savings += (item.product.price - item.product.promotionalPrice) * qty;
    }
  }

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalQuantity,
    savings: Number(savings.toFixed(2)),
  };
}

/**
 * Generates direct WhatsApp message URL for single product inquiry / purchase
 */
export function generateSingleProductWhatsAppUrl(
  product: Product,
  settings: StoreSettings
): string {
  const phone = cleanPhoneNumber(settings.whatsappNumber);
  const activePrice =
    product.promotionalPrice && product.promotionalPrice > 0
      ? product.promotionalPrice
      : product.price;

  const message = [
    `✨ *Olá, ${settings.storeName}!* ✨`,
    `Vi essa peça maravilhosa no catálogo e quero comprar:`,
    ``,
    `💎 *Produto:* ${product.name}`,
    `🔖 *Código:* ${product.code}`,
    `💰 *Valor:* ${formatBRL(activePrice)}`,
    product.materials ? `🔍 *Material:* ${product.materials}` : '',
    ``,
    `Ainda está disponível? Como faço para efetuar o pagamento e envio?`,
  ]
    .filter((line) => line !== '')
    .join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates structured WhatsApp message for full cart checkout
 */
export function generateCartWhatsAppUrl(
  order: Order,
  settings: StoreSettings
): string {
  const phone = cleanPhoneNumber(settings.whatsappNumber);

  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}* (${item.productCode})\n   ${item.quantity}x de ${formatBRL(
          item.unitPrice
        )} = *${formatBRL(item.subtotal)}*`
    )
    .join('\n\n');

  const lines = [
    `💖 *NOVO PEDIDO - ${settings.storeName.toUpperCase()}* 💖`,
    `📋 *Pedido:* #${order.orderNumber}`,
    ``,
    `👤 *Cliente:* ${order.customerName}`,
    `📱 *WhatsApp:* ${order.customerPhone}`,
    order.customerAddress ? `📍 *Endereço de Entrega:* ${order.customerAddress}` : '',
    order.customerNotes ? `📝 *Observação:* ${order.customerNotes}` : '',
    ``,
    `🛍️ *ITENS SELECIONADOS:*`,
    itemsList,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `💵 *TOTAL DO PEDIDO:* *${formatBRL(order.totalAmount)}*`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `Gostaria de confirmar a disponibilidade e a chave PIX para pagamento! Obrigada! ✨`,
  ].filter((line) => line !== '');

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Generates direct WhatsApp message URL directly from cart items (no on-site checkout needed)
 */
export function generateDirectCartWhatsAppUrl(
  cart: { product: Product; quantity: number }[],
  settings: StoreSettings,
  customerName?: string
): string {
  const phone = cleanPhoneNumber(settings.whatsappNumber);
  const { subtotal, totalQuantity } = calculateCartTotals(cart);

  const itemsList = cart
    .map((item, idx) => {
      const unitPrice =
        item.product.promotionalPrice && item.product.promotionalPrice > 0
          ? item.product.promotionalPrice
          : item.product.price;
      const itemTotal = unitPrice * item.quantity;
      return `${idx + 1}. *${item.product.name}* (Cód: ${item.product.code})\n   ${item.quantity}x de ${formatBRL(
        unitPrice
      )} = *${formatBRL(itemTotal)}*`;
    })
    .join('\n\n');

  const greeting = customerName && customerName.trim()
    ? `Olá, ${settings.storeName}! Meu nome é *${customerName.trim()}*.`
    : `Olá, ${settings.storeName}!`;

  const lines = [
    `✨ *PEDIDO DE COMPRA - ${settings.storeName.toUpperCase()}* ✨`,
    greeting,
    `Gostaria de fechar meu pedido com as seguintes peças da minha sacola:`,
    ``,
    `🛍️ *ITENS SELECIONADOS (${totalQuantity} ${totalQuantity === 1 ? 'peça' : 'peças'}):*`,
    itemsList,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `💵 *VALOR TOTAL:* *${formatBRL(subtotal)}*`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `Poderia me confirmar a disponibilidade e passar as opções de pagamento e envio? Muito obrigada! 💖`,
  ];

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Automatic stock deduction logic when an order is placed
 */
export function applyOrderStockDeduction(
  products: Product[],
  orderItems: { productId: string; quantity: number }[]
): Product[] {
  const quantityMap = new Map<string, number>();
  for (const item of orderItems) {
    const current = quantityMap.get(item.productId) || 0;
    quantityMap.set(item.productId, current + item.quantity);
  }

  return products.map((prod) => {
    const toDeduct = quantityMap.get(prod.id);
    if (!toDeduct) return prod;
    const newStock = Math.max(0, prod.stock - toDeduct);
    return {
      ...prod,
      stock: newStock,
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Restores stock if an order is cancelled
 */
export function restoreOrderStock(
  products: Product[],
  orderItems: { productId: string; quantity: number }[]
): Product[] {
  const quantityMap = new Map<string, number>();
  for (const item of orderItems) {
    const current = quantityMap.get(item.productId) || 0;
    quantityMap.set(item.productId, current + item.quantity);
  }

  return products.map((prod) => {
    const toAdd = quantityMap.get(prod.id);
    if (!toAdd) return prod;
    return {
      ...prod,
      stock: prod.stock + toAdd,
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Generates an elegant sequential order code (e.g. SR-8492)
 */
export function generateOrderNumber(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SR-${randomSuffix}`;
}

/**
 * Generates unique product code
 */
export function generateProductCode(category: string, currentCount: number): string {
  const prefix = category.slice(0, 3).toUpperCase();
  const num = String(currentCount + 1).padStart(3, '0');
  return `${prefix}-${num}`;
}

/**
 * Generates a valid RFC4122 v4 UUID
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

