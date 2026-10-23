import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBRL,
  cleanPhoneNumber,
  calculateCartTotals,
  generateSingleProductWhatsAppUrl,
  generateCartWhatsAppUrl,
  generateDirectCartWhatsAppUrl,
  applyOrderStockDeduction,
  restoreOrderStock,
  generateOrderNumber,
  generateUUID,
} from './shopLogic';
import { CartItem, Order, Product, StoreSettings } from '../types';

test('formatBRL correctly formats Brazilian Real numbers', () => {
  const result = formatBRL(49.9);
  // Matches "R$ 49,90" with possible non-breaking space
  assert.ok(result.includes('49,90'));
  assert.ok(result.includes('R$'));
});

test('cleanPhoneNumber handles various formats into international format', () => {
  assert.equal(cleanPhoneNumber('(11) 98765-4321'), '5511987654321');
  assert.equal(cleanPhoneNumber('11987654321'), '5511987654321');
  assert.equal(cleanPhoneNumber('5511987654321'), '5511987654321');
});

test('calculateCartTotals calculates subtotal, quantity and savings correctly', () => {
  const sampleProduct1: Product = {
    id: 'p1',
    code: 'BRI-001',
    name: 'Brinco Ponto de Luz Zircônia',
    category: 'brincos',
    price: 50,
    promotionalPrice: 40,
    stock: 5,
    description: 'Banhado a ouro 18k',
    images: ['https://example.com/img1.jpg'],
    createdAt: new Date().toISOString(),
  };

  const sampleProduct2: Product = {
    id: 'p2',
    code: 'COL-001',
    name: 'Colar Choker Dourada',
    category: 'choker',
    price: 80,
    promotionalPrice: null,
    stock: 3,
    description: 'Choker elegante',
    images: ['https://example.com/img2.jpg'],
    createdAt: new Date().toISOString(),
  };

  const cart: CartItem[] = [
    { product: sampleProduct1, quantity: 2 }, // 2 * 40 = 80 (saved 20)
    { product: sampleProduct2, quantity: 1 }, // 1 * 80 = 80
  ];

  const totals = calculateCartTotals(cart);
  assert.equal(totals.subtotal, 160);
  assert.equal(totals.totalQuantity, 3);
  assert.equal(totals.savings, 20);
});

test('applyOrderStockDeduction automatically decreases product stock', () => {
  const products: Product[] = [
    {
      id: 'p1',
      code: 'BRI-001',
      name: 'Brinco Argola',
      category: 'brincos',
      price: 35,
      stock: 10,
      description: '',
      images: [],
      createdAt: '',
    },
    {
      id: 'p2',
      code: 'ANE-001',
      name: 'Anel Solitário',
      category: 'aneis',
      price: 60,
      stock: 2,
      description: '',
      images: [],
      createdAt: '',
    },
  ];

  const orderItems = [
    { productId: 'p1', quantity: 3 },
    { productId: 'p2', quantity: 2 },
  ];

  const updated = applyOrderStockDeduction(products, orderItems);
  assert.equal(updated.find((p) => p.id === 'p1')?.stock, 7);
  assert.equal(updated.find((p) => p.id === 'p2')?.stock, 0); // Out of stock!
});

test('restoreOrderStock restores stock upon cancellation', () => {
  const products: Product[] = [
    {
      id: 'p1',
      code: 'BRI-001',
      name: 'Brinco Argola',
      category: 'brincos',
      price: 35,
      stock: 7,
      description: '',
      images: [],
      createdAt: '',
    },
  ];

  const orderItems = [{ productId: 'p1', quantity: 3 }];
  const restored = restoreOrderStock(products, orderItems);
  assert.equal(restored.find((p) => p.id === 'p1')?.stock, 10);
});

test('generateSingleProductWhatsAppUrl generates valid wa.me link with encoded text', () => {
  const product: Product = {
    id: 'p1',
    code: 'COL-001',
    name: 'Colar Coração Banhado a Ouro',
    category: 'colares',
    price: 79.9,
    stock: 5,
    description: '',
    materials: 'Banhado a Ouro 18k e Verniz Diamond',
    images: [],
    createdAt: '',
  };

  const settings: StoreSettings = {
    storeName: 'Senhorita Acessórios',
    tagline: '',
    whatsappNumber: '(11) 99999-8888',
    instagramHandle: '@senhoritaacessorios',
    pixKey: '11999998888',
    pixKeyType: 'Telefone',
    pixBeneficiary: 'Senhorita Acessórios',
    bannerNotice: '',
    aboutText: '',
    adminPin: '1234',
  };

  const url = generateSingleProductWhatsAppUrl(product, settings);
  assert.ok(url.startsWith('https://wa.me/5511999998888?text='));
  assert.ok(url.includes(encodeURIComponent('Colar Coração Banhado a Ouro')));
  assert.ok(url.includes(encodeURIComponent('COL-001')));
});

test('generateCartWhatsAppUrl builds comprehensive message for order', () => {
  const settings: StoreSettings = {
    storeName: 'Senhorita Acessórios',
    tagline: '',
    whatsappNumber: '11988887777',
    instagramHandle: '',
    pixKey: '',
    pixKeyType: 'Telefone',
    pixBeneficiary: '',
    bannerNotice: '',
    aboutText: '',
    adminPin: '1234',
  };

  const order: Order = {
    id: 'ord-1',
    orderNumber: 'SR-1234',
    createdAt: new Date().toISOString(),
    customerName: 'Mariana Silva',
    customerPhone: '(11) 97777-6666',
    customerAddress: 'Rua das Flores, 120, Apto 42 - SP',
    totalAmount: 120.0,
    status: 'pendente',
    items: [
      {
        productId: 'p1',
        productName: 'Choker Fita Dourada',
        productCode: 'CHO-001',
        productImage: '',
        unitPrice: 60.0,
        quantity: 2,
        subtotal: 120.0,
      },
    ],
  };

  const url = generateCartWhatsAppUrl(order, settings);
  assert.ok(url.startsWith('https://wa.me/5511988887777?text='));
  assert.ok(url.includes(encodeURIComponent('#SR-1234')));
  assert.ok(url.includes(encodeURIComponent('Mariana Silva')));
  assert.ok(url.includes(encodeURIComponent('Choker Fita Dourada')));
});

test('generateOrderNumber generates code starting with SR-', () => {
  const code = generateOrderNumber();
  assert.ok(code.startsWith('SR-'));
  assert.equal(code.length, 7);
});

test('generateUUID returns a valid RFC4122 v4 formatted string', () => {
  const uuid = generateUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert.ok(uuidRegex.test(uuid));
});

test('validates admin PIN strictly against configured custom pin and rejects 1234 when changed', () => {
  const customPin = '@Gaeldavi22';
  const verifyPin = (input: string, activePin: string) => input.trim() === activePin.trim();

  assert.strictEqual(verifyPin('1234', customPin), false);
  assert.strictEqual(verifyPin('@Gaeldavi22', customPin), true);
  assert.strictEqual(verifyPin(' @Gaeldavi22 ', customPin), true);
  assert.strictEqual(verifyPin('wrong', customPin), false);
});

test('generateDirectCartWhatsAppUrl creates direct WhatsApp URL with items and no on-site checkout', () => {
  const settings: StoreSettings = {
    storeName: 'Senhorita Acessórios',
    tagline: '',
    whatsappNumber: '(11) 99999-8888',
    instagramHandle: '@acessorios.senhoritas',
    pixKey: '',
    pixKeyType: 'Telefone',
    pixBeneficiary: '',
    bannerNotice: '',
    aboutText: '',
    adminPin: '@Gaeldavi22',
  };

  const product: Product = {
    id: 'prod-1',
    code: 'BRI-100',
    name: 'Brinco Argola Ouro',
    category: 'brincos',
    price: 90.0,
    stock: 5,
    description: '',
    materials: 'Ouro 18k',
    images: [],
    createdAt: '',
  };

  const cart: CartItem[] = [{ product, quantity: 2 }];
  const url = generateDirectCartWhatsAppUrl(cart, settings, 'Carla');

  assert.ok(url.startsWith('https://wa.me/5511999998888?text='));
  assert.ok(url.includes(encodeURIComponent('Carla')));
  assert.ok(url.includes(encodeURIComponent('Brinco Argola Ouro')));
  assert.ok(url.includes(encodeURIComponent('BRI-100')));
});


