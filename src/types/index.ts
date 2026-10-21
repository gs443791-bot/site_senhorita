export type ProductCategory =
  | 'brincos'
  | 'colares'
  | 'pulseiras'
  | 'braceletes'
  | 'acessorios-cabelo'
  | 'relogio'
  | 'choker'
  | 'conjuntos'
  | 'aneis';

export interface CategoryInfo {
  id: ProductCategory | 'todos';
  label: string;
  description: string;
  iconName: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'todos', label: 'Todos os Produtos', description: 'Todas as peças da coleção', iconName: 'Sparkles' },
  { id: 'brincos', label: 'Brincos', description: 'Argolas, studs, pêndulos e earcuffs', iconName: 'Sparkle' },
  { id: 'colares', label: 'Colares', description: 'Correntes, pingentes e pontos de luz', iconName: 'Gem' },
  { id: 'pulseiras', label: 'Pulseiras', description: 'Pulseiras delicadas e elos', iconName: 'CircleDot' },
  { id: 'braceletes', label: 'Braceletes', description: 'Braceletes rígidos e ajustáveis', iconName: 'Disc' },
  { id: 'acessorios-cabelo', label: 'Acessórios para Cabelo', description: 'Piranhas, presilhas, tiaras e grampos', iconName: 'Crown' },
  { id: 'relogio', label: 'Relógios', description: 'Relógios femininos sofisticados', iconName: 'Watch' },
  { id: 'choker', label: 'Chokers', description: 'Gargantilhas justas e elegantes', iconName: 'Shield' },
  { id: 'conjuntos', label: 'Conjuntos', description: 'Sets combinados de colar, brinco e pulseira', iconName: 'Layers' },
  { id: 'aneis', label: 'Anéis', description: 'Solitários, falanges e anéis cravejados', iconName: 'HeartHandshake' },
];

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  price: number;
  promotionalPrice?: number | null;
  stock: number;
  description: string;
  materials?: string;
  images: string[];
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'pendente'
  | 'aguardando_pagamento'
  | 'pago'
  | 'enviado'
  | 'concluido'
  | 'cancelado';

export interface OrderItem {
  productId: string;
  productName: string;
  productCode: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerNotes?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  whatsappMessageSent?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string; // e.g. "5511999999999"
  instagramHandle: string;
  pixKey: string;
  pixKeyType: 'CPF' | 'CNPJ' | 'Telefone' | 'E-mail' | 'Aleatória';
  pixBeneficiary: string;
  freeShippingAbove?: number;
  bannerNotice: string;
  logoUrl?: string;
  aboutText: string;
  heroTitle?: string;
  adminPin: string; // PIN for administrative access protection
}


