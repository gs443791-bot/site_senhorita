import { Customer, Order, OrderStatus, Product, ProductCategory, StoreSettings } from '../types';
import { applyOrderStockDeduction, restoreOrderStock, generateUUID } from '../utils/shopLogic';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'senhorita_products_v1',
  ORDERS: 'senhorita_orders_v1',
  CUSTOMERS: 'senhorita_customers_v1',
  SETTINGS: 'senhorita_settings_v1',
  ADMIN_PIN: 'senhorita_admin_pin_v1',
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Senhorita Acessórios',
  tagline: '',
  whatsappNumber: '5511999999999',
  instagramHandle: '@acessorios.senhoritas',
  pixKey: 'contato@senhoritaacessorios.com.br',
  pixKeyType: 'E-mail',
  pixBeneficiary: 'Senhorita Acessórios',
  freeShippingAbove: 150,
  bannerNotice: '✨ Bem-vinda à Senhorita Acessórios! Escolha suas peças e finalize seu pedido com rapidez pelo WhatsApp! ✨',
  logoUrl: '/assets/aistudio/WhatsApp_Image_2026-09-11_at_10.11.39__1__6db93c46.jpeg',
  aboutText:
    'A Senhorita Acessórios nasceu para trazer brilho, delicadeza e sofisticação para os seus momentos especiais. Nossas peças combinam acabamento refinado com design atemporal.',
  heroTitle: 'Realce o seu brilho com a Senhorita Acessórios',
  adminPin: '@Gaeldavi22',
};

// Curated sample products available if user optionally clicks "Carregar Amostras de Teste"
export const SAMPLE_PRODUCTS: Omit<Product, 'id' | 'createdAt'>[] = [
  {
    code: 'BRI-001',
    name: 'Brinco Argola Cravejada Zircônia Ouro',
    category: 'brincos',
    price: 49.9,
    promotionalPrice: 39.9,
    stock: 8,
    description: 'Argola delicada com micro zircônias cravejadas. Fecho click anatômico e hipoalergênico.',
    materials: 'Banhado a Ouro 18k com dupla camada de verniz protetor',
    images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80'],
    featured: true,
  },
  {
    code: 'COL-001',
    name: 'Colar Choker Fita Laminada Dourada',
    category: 'choker',
    price: 89.9,
    promotionalPrice: 79.9,
    stock: 5,
    description: 'A clássica choker fita laminada com caimento perfeito no colo e brilho espelhado deslumbrante.',
    materials: 'Banhado a Ouro 18k com tecnologia antialérgica',
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'],
    featured: true,
  },
  {
    code: 'ANE-001',
    name: 'Anel Solitário Cristal Lapidado Rosa Champagne',
    category: 'aneis',
    price: 54.9,
    promotionalPrice: null,
    stock: 6,
    description: 'Anel solitário sofisticado com cristal lapidação cushion na cor rosa champagne suave.',
    materials: 'Liga metálica nobre banhada a Ouro com verniz protetor',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'],
    featured: true,
  },
  {
    code: 'PUL-001',
    name: 'Pulseira Riviera Zircônias Regulável',
    category: 'pulseiras',
    price: 69.9,
    promotionalPrice: 59.9,
    stock: 4,
    description: 'Pulseira estilo riviera flexível com fecho regulador gravatinha que se ajusta a qualquer pulso.',
    materials: 'Banhada a ouro com zircônias de alto brilho',
    images: ['https://images.unsplash.com/photo-1611591475870-c752678622c1?auto=format&fit=crop&w=800&q=80'],
    featured: true,
  },
];

class StorageService {
  // Products Management
  async getProducts(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            code: d.code,
            name: d.name,
            category: d.category as ProductCategory,
            price: Number(d.price),
            promotionalPrice: d.promotional_price ? Number(d.promotional_price) : null,
            stock: Number(d.stock),
            description: d.description || '',
            materials: d.materials || '',
            images: Array.isArray(d.images) ? d.images : [],
            featured: Boolean(d.featured),
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!local) {
      // PER USER EXPLICIT REQUEST: "nao cadastre nenhum produto deixe que eu cadastro tudo"
      // Start with empty catalog!
      return [];
    }
    try {
      return JSON.parse(local);
    } catch {
      return [];
    }
  }

  async saveProduct(product: Omit<Product, 'id' | 'createdAt'> & { id?: string }): Promise<Product> {
    const isNew = !product.id;
    const now = new Date().toISOString();
    const finalProduct: Product = {
      id: product.id || generateUUID(),
      code: product.code || `SR-${Math.floor(100 + Math.random() * 900)}`,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      promotionalPrice: product.promotionalPrice ? Number(product.promotionalPrice) : null,
      stock: Number(product.stock),
      description: product.description || '',
      materials: product.materials || '',
      images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'],
      featured: Boolean(product.featured),
      createdAt: isNew ? now : (product as Product).createdAt || now,
      updatedAt: now,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('products').upsert({
          id: finalProduct.id,
          code: finalProduct.code,
          name: finalProduct.name,
          category: finalProduct.category,
          price: finalProduct.price,
          promotional_price: finalProduct.promotionalPrice,
          stock: finalProduct.stock,
          description: finalProduct.description,
          materials: finalProduct.materials,
          images: finalProduct.images,
          featured: finalProduct.featured,
          updated_at: finalProduct.updatedAt,
        });
      } catch (err) {
        console.warn('Supabase saveProduct error:', err);
      }
    }

    const current = await this.getProducts();
    const idx = current.findIndex((p) => p.id === finalProduct.id);
    let updated: Product[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = finalProduct;
    } else {
      updated = [finalProduct, ...current];
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return finalProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteProduct error:', err);
      }
    }

    const current = await this.getProducts();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  }

  async updateStock(productId: string, newStock: number): Promise<void> {
    const current = await this.getProducts();
    const target = current.find((p) => p.id === productId);
    if (!target) return;
    target.stock = Math.max(0, newStock);
    target.updatedAt = new Date().toISOString();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('products')
          .update({ stock: target.stock, updated_at: target.updatedAt })
          .eq('id', productId);
      } catch (err) {
        console.warn('Supabase updateStock error:', err);
      }
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(current));
  }

  // Orders Management with AUTOMATIC STOCK REDUCTION
  async getOrders(): Promise<Order[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            orderNumber: d.order_number,
            createdAt: d.created_at,
            customerName: d.customer_name,
            customerPhone: d.customer_phone,
            customerAddress: d.customer_address || '',
            customerNotes: d.customer_notes || '',
            totalAmount: Number(d.total_amount),
            status: d.status as OrderStatus,
            paymentMethod: d.payment_method || 'WhatsApp / PIX',
            whatsappMessageSent: Boolean(d.whatsapp_message_sent),
            items: (d.order_items || []).map((oi: any) => ({
              productId: oi.product_id,
              productName: oi.product_name,
              productCode: oi.product_code,
              productImage: oi.product_image,
              unitPrice: Number(oi.unit_price),
              quantity: Number(oi.quantity),
              subtotal: Number(oi.subtotal),
            })),
          }));
        }
      } catch (err) {
        console.warn('Supabase getOrders error:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!local) return [];
    try {
      return JSON.parse(local);
    } catch {
      return [];
    }
  }

  async createOrder(order: Order): Promise<Order> {
    // 1. AUTOMATIC STOCK REDUCTION
    const products = await this.getProducts();
    const updatedProducts = applyOrderStockDeduction(
      products,
      order.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    );
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));

    // 2. Save order locally
    const currentOrders = await this.getOrders();
    const updatedOrders = [order, ...currentOrders];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));

    // 3. Register or update customer record
    await this.recordCustomerFromOrder(order);

    // 4. Sync with Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .insert({
            id: order.id,
            order_number: order.orderNumber,
            customer_name: order.customerName,
            customer_phone: order.customerPhone,
            customer_address: order.customerAddress,
            customer_notes: order.customerNotes,
            total_amount: order.totalAmount,
            status: order.status,
            payment_method: order.paymentMethod,
            whatsapp_message_sent: order.whatsappMessageSent,
          })
          .select()
          .single();

        if (orderData) {
          const itemsToInsert = order.items.map((i) => ({
            order_id: order.id,
            product_id: i.productId,
            product_name: i.productName,
            product_code: i.productCode,
            product_image: i.productImage,
            unit_price: i.unitPrice,
            quantity: i.quantity,
            subtotal: i.subtotal,
          }));
          await supabase.from('order_items').insert(itemsToInsert);
        }
      } catch (err) {
        console.warn('Supabase createOrder error:', err);
      }
    }

    return order;
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    const orders = await this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const oldStatus = order.status;
    order.status = newStatus;

    // If order was cancelled, restore the stock automatically!
    if (newStatus === 'cancelado' && oldStatus !== 'cancelado') {
      const products = await this.getProducts();
      const restored = restoreOrderStock(
        products,
        order.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(restored));
    }

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', orderId);
      } catch (err) {
        console.warn('Supabase updateOrderStatus error:', err);
      }
    }
  }

  // Customers Management
  async getCustomers(): Promise<Customer[]> {
    const local = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!local) return [];
    try {
      return JSON.parse(local);
    } catch {
      return [];
    }
  }

  private async recordCustomerFromOrder(order: Order): Promise<void> {
    const customers = await this.getCustomers();
    const existing = customers.find(
      (c) => c.phone.replace(/\D/g, '') === order.customerPhone.replace(/\D/g, '')
    );

    if (existing) {
      existing.name = order.customerName || existing.name;
      existing.address = order.customerAddress || existing.address;
      existing.ordersCount += 1;
      existing.totalSpent += order.totalAmount;
      existing.lastOrderDate = order.createdAt;
    } else {
      const newCustomer: Customer = {
        id: generateUUID(),
        name: order.customerName,
        phone: order.customerPhone,
        address: order.customerAddress,
        ordersCount: 1,
        totalSpent: order.totalAmount,
        lastOrderDate: order.createdAt,
      };
      customers.push(newCustomer);
    }

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  // Store Settings
  async getSettings(): Promise<StoreSettings> {
    let savedPin = (localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || '').trim();
    if (!savedPin || savedPin === '1234') {
      savedPin = '@Gaeldavi22';
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, '@Gaeldavi22');
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('id', 'default')
          .single();

        if (!error && data) {
          return {
            storeName: data.store_name || DEFAULT_SETTINGS.storeName,
            tagline: data.tagline || '',
            whatsappNumber: data.whatsapp_number || DEFAULT_SETTINGS.whatsappNumber,
            instagramHandle: data.instagram_handle || DEFAULT_SETTINGS.instagramHandle,
            pixKey: data.pix_key || '',
            pixKeyType: data.pix_key_type || 'Telefone',
            pixBeneficiary: data.pix_beneficiary || '',
            bannerNotice: data.banner_notice || DEFAULT_SETTINGS.bannerNotice,
            aboutText: data.about_text || DEFAULT_SETTINGS.aboutText,
            adminPin: savedPin,
            heroTitle: DEFAULT_SETTINGS.heroTitle,
          };
        }
      } catch (err) {
        console.warn('Supabase getSettings error:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!local) {
      return { ...DEFAULT_SETTINGS, adminPin: savedPin };
    }
    try {
      const parsed = JSON.parse(local);
      if (parsed.tagline === 'Semijoias & Bijuterias Finas') {
        parsed.tagline = '';
      }
      if (parsed.heroTitle === 'Realce sua beleza com a Senhorita Acessórios') {
        parsed.heroTitle = 'Realce o seu brilho com a Senhorita Acessórios';
      }
      if (
        !parsed.instagramHandle ||
        parsed.instagramHandle.includes('senhoritaacessorios') ||
        parsed.instagramHandle === '@senhoritaacessorios'
      ) {
        parsed.instagramHandle = '@acessorios.senhoritas';
      }
      const effectivePin = (savedPin && savedPin !== '1234') ? savedPin : '@Gaeldavi22';
      const merged = { ...DEFAULT_SETTINGS, ...parsed, adminPin: effectivePin };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      return merged;
    } catch {
      return { ...DEFAULT_SETTINGS, adminPin: savedPin };
    }
  }

  async saveSettings(settings: StoreSettings): Promise<StoreSettings> {
    let cleanPin = (settings.adminPin || '').trim();
    if (!cleanPin || cleanPin === '1234') {
      cleanPin = '@Gaeldavi22';
    }
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, cleanPin);
    const finalSettings = {
      ...settings,
      adminPin: cleanPin,
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(finalSettings));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('store_settings').upsert({
          id: 'default',
          store_name: finalSettings.storeName,
          tagline: finalSettings.tagline,
          whatsapp_number: finalSettings.whatsappNumber,
          instagram_handle: finalSettings.instagramHandle,
          pix_key: finalSettings.pixKey,
          pix_key_type: finalSettings.pixKeyType,
          pix_beneficiary: finalSettings.pixBeneficiary,
          banner_notice: finalSettings.bannerNotice,
          about_text: finalSettings.aboutText,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase saveSettings error:', err);
      }
    }

    return finalSettings;
  }


  // Sync all local data to Supabase with 1-click
  async syncLocalToSupabase(): Promise<{ productsCount: number; ordersCount: number }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase não está conectado.');
    }

    // 1. Sync products
    const localProducts = await this.getProducts();
    if (localProducts.length > 0) {
      const formatted = localProducts.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        category: p.category,
        price: p.price,
        promotional_price: p.promotionalPrice,
        stock: p.stock,
        description: p.description,
        materials: p.materials,
        images: p.images,
        featured: p.featured,
        updated_at: p.updatedAt || new Date().toISOString(),
      }));
      await supabase.from('products').upsert(formatted);
    }

    // 2. Sync settings
    const settings = await this.getSettings();
    await supabase.from('store_settings').upsert({
      id: 'default',
      store_name: settings.storeName,
      tagline: settings.tagline,
      whatsapp_number: settings.whatsappNumber,
      instagram_handle: settings.instagramHandle,
      pix_key: settings.pixKey,
      pix_key_type: settings.pixKeyType,
      pix_beneficiary: settings.pixBeneficiary,
      banner_notice: settings.bannerNotice,
      about_text: settings.aboutText,
      updated_at: new Date().toISOString(),
    });

    const localOrders = await this.getOrders();
    return { productsCount: localProducts.length, ordersCount: localOrders.length };
  }

  // Seed sample products (voluntary action inside Admin for testing)
  async loadSampleProducts(): Promise<Product[]> {
    const now = new Date().toISOString();
    const samples: Product[] = SAMPLE_PRODUCTS.map((p, idx) => ({
      ...p,
      id: `sample_${idx}_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }));

    const current = await this.getProducts();
    const merged = [...samples, ...current];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
    return merged;
  }

  // Clear catalog completely
  async clearAllProducts(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
  }

  // Backup & Migration
  exportData(): string {
    const data = {
      products: localStorage.getItem(STORAGE_KEYS.PRODUCTS),
      orders: localStorage.getItem(STORAGE_KEYS.ORDERS),
      customers: localStorage.getItem(STORAGE_KEYS.CUSTOMERS),
      settings: localStorage.getItem(STORAGE_KEYS.SETTINGS),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.products) localStorage.setItem(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.orders) localStorage.setItem(STORAGE_KEYS.ORDERS, data.orders);
      if (data.customers) localStorage.setItem(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, data.settings);
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new StorageService();
