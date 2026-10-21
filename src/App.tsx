import React, { useState, useEffect, useMemo } from 'react';
import {
  CartItem,
  Customer,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  StoreSettings,
} from './types';
import { storage, DEFAULT_SETTINGS } from './lib/storage';
import { isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { CategoryNav } from './components/CategoryNav';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { ProductFormModal } from './components/ProductFormModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Footer } from './components/Footer';
import { Sparkles, Plus, MessageCircle, Lock, ShieldCheck } from 'lucide-react';
import { cleanPhoneNumber } from './utils/shopLogic';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('senhorita_cart_v1');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Security: Client vs Admin mode
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('senhorita_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('senhorita_cart_v1', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Load initial data
  const refreshData = async () => {
    try {
      const [loadedProducts, loadedOrders, loadedCustomers, loadedSettings] =
        await Promise.all([
          storage.getProducts(),
          storage.getOrders(),
          storage.getCustomers(),
          storage.getSettings(),
        ]);

      setProducts(loadedProducts);
      setOrders(loadedOrders);
      setCustomers(loadedCustomers);
      setSettings(loadedSettings);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Category counts calculation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: products.length };
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  // Filtered products for customer storefront
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === 'todos' || p.category === activeCategory;
      const matchesSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.materials && p.materials.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  // Total cart items count
  const cartTotalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Admin Access Handlers
  const handleToggleAdmin = () => {
    if (isAdminView) {
      // Return to customer storefront
      setIsAdminView(false);
    } else {
      // Trying to enter Admin Panel
      if (isAdminAuthenticated) {
        setIsAdminView(true);
      } else {
        setIsLoginModalOpen(true);
      }
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('senhorita_admin_auth', 'true');
    } catch (e) {
      console.warn(e);
    }
    setIsLoginModalOpen(false);
    setIsAdminView(true);
    showToast('Acesso de administradora concedido! ✨');
  };

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('senhorita_admin_auth');
    } catch (e) {
      console.warn(e);
    }
    setIsAdminView(false);
    showToast('Modo administradora bloqueado. Exibindo visão da cliente.');
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast('Esta peça está temporariamente esgotada.');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        const updated = [...prev];
        updated[existingIndex] = { ...existing, quantity: newQty };
        return updated;
      } else {
        return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
      }
    });

    showToast(`"${product.name}" adicionado à sacola! ✨`);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const clamped = Math.min(item.product.stock, newQuantity);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Peça removida da sacola.');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderPlaced = async (newOrder: Order) => {
    await storage.createOrder(newOrder);
    await refreshData();
  };

  // Product CRUD (Restricted strictly to authenticated admin)
  const handleSaveProduct = async (
    productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (!isAdminAuthenticated) {
      showToast('Apenas a administradora da loja pode cadastrar ou alterar peças.');
      return;
    }
    await storage.saveProduct(productData);
    await refreshData();
    showToast('Peça salva no catálogo com sucesso! ✨');
  };

  const handleDeleteProduct = async (id: string) => {
    if (!isAdminAuthenticated) {
      showToast('Ação restrita à administradora.');
      return;
    }
    await storage.deleteProduct(id);
    await refreshData();
    showToast('Peça excluída.');
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    if (!isAdminAuthenticated) {
      showToast('Ação restrita à administradora.');
      return;
    }
    await storage.updateStock(productId, newStock);
    await refreshData();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!isAdminAuthenticated) {
      showToast('Ação restrita à administradora.');
      return;
    }
    await storage.updateOrderStatus(orderId, newStatus);
    await refreshData();
    showToast(`Status do pedido atualizado para "${newStatus}".`);
  };

  const handleSaveSettings = async (newSettings: StoreSettings) => {
    if (!isAdminAuthenticated) {
      showToast('Ação restrita à administradora.');
      return;
    }
    await storage.saveSettings(newSettings);
    setSettings(newSettings);
    showToast('Configurações da loja salvas com sucesso!');
  };

  const handleLoadSamples = async () => {
    if (!isAdminAuthenticated) {
      showToast('Ação restrita à administradora.');
      return;
    }
    await storage.loadSampleProducts();
    await refreshData();
    showToast('Amostras de teste carregadas no catálogo! ✨');
  };

  const handleClearCatalog = async () => {
    if (!isAdminAuthenticated) {
      showToast('Ação restrita à administradora.');
      return;
    }
    await storage.clearAllProducts();
    await refreshData();
    showToast('Catálogo limpo com sucesso.');
  };

  const handleExportData = () => {
    const jsonStr = storage.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_senhorita_acessorios_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup baixado com sucesso!');
  };

  const handleImportData = async (jsonStr: string) => {
    if (!isAdminAuthenticated) {
      showToast('Ação restrita à administradora.');
      return;
    }
    const success = storage.importData(jsonStr);
    if (success) {
      await refreshData();
      showToast('Dados restaurados com sucesso!');
    } else {
      alert('Arquivo de backup inválido.');
    }
  };

  const customerWhatsappContactUrl = `https://wa.me/${cleanPhoneNumber(
    settings.whatsappNumber
  )}?text=${encodeURIComponent(
    `Olá, ${settings.storeName}! Adorei as peças e gostaria de saber as novidades disponíveis para compra!`
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9FA] text-[#332227]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3B1522] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-[#DFBA73]/50 animate-in slide-in-from-bottom duration-300">
          <Sparkles className="w-4 h-4 text-[#DFBA73]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        settings={settings}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={isAdminView}
        onToggleAdmin={handleToggleAdmin}
      />

      {/* Main Content Area */}
      {isAdminView && isAdminAuthenticated ? (
        /* Admin Dashboard View (Authenticated only) */
        <main className="flex-1">
          <AdminPanel
            products={products}
            orders={orders}
            customers={customers}
            settings={settings}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateStock={handleUpdateStock}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onSaveSettings={handleSaveSettings}
            onLoadSamples={handleLoadSamples}
            onClearCatalog={handleClearCatalog}
            onOpenNewProductModal={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            onEditProduct={(prod) => {
              setProductToEdit(prod);
              setIsProductModalOpen(true);
            }}
            onExportData={handleExportData}
            onImportData={handleImportData}
            isSupabaseConnected={isSupabaseConfigured}
            onLogoutAdmin={handleLogoutAdmin}
          />
        </main>
      ) : (
        /* Customer Storefront View (Clients browsing) */
        <main className="flex-1">
          {/* Hero Banner */}
          <HeroBanner
            settings={settings}
            onExploreClick={() => {
              const el = document.getElementById('catalogo-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            productsCount={products.length}
          />

          {/* Category Navigation Sub-tabs */}
          <div id="catalogo-section">
            <CategoryNav
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categoryCounts={categoryCounts}
            />
          </div>

          {/* Products Grid & Collection Header */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8 border-b border-[#F5D5DE] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#B58448]">
                  {activeCategory === 'todos' ? 'Coleção Completa' : `Coleção • ${activeCategory}`}
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#3B1522] mt-0.5">
                  {activeCategory === 'todos'
                    ? 'Todas as Peças da Coleção'
                    : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                </h2>
              </div>

              <div className="text-xs text-[#7A5461]">
                Exibindo <strong>{filteredProducts.length}</strong>{' '}
                {filteredProducts.length === 1 ? 'peça' : 'peças'}
              </div>
            </div>

            {/* Empty catalog vs Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#F4CCD6] shadow-gold-sm max-w-2xl mx-auto my-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FFF0F3] border border-[#F4CCD6] flex items-center justify-center mx-auto text-[#B5486B]">
                  <Sparkles className="w-8 h-8 text-[#DFBA73]" />
                </div>

                {products.length === 0 ? (
                  /* Zero products: tailored strictly depending on whether Admin or Client */
                  isAdminAuthenticated ? (
                    <>
                      <h3 className="font-serif text-2xl font-bold text-[#3B1522]">
                        Catálogo pronto para o seu cadastro!
                      </h3>
                      <p className="text-xs text-[#7A5461] max-w-md mx-auto leading-relaxed">
                        Você está autenticada como Administradora. Suas clientes verão uma mensagem convidativa enquanto você adiciona as primeiras peças no catálogo.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setProductToEdit(null);
                            setIsProductModalOpen(true);
                          }}
                          className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#DFBA73] to-[#C59B63] hover:brightness-105 shadow-gold-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Cadastrar Peça no Catálogo</span>
                        </button>
                        <button
                          onClick={handleLoadSamples}
                          className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6] cursor-pointer"
                        >
                          Carregar Amostras (Teste)
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Customer view: NO product creation buttons! */
                    <>
                      <h3 className="font-serif text-2xl font-bold text-[#3B1522]">
                        Novas Coleções Chegando em Breve! ✨
                      </h3>
                      <p className="text-xs text-[#7A5461] max-w-md mx-auto leading-relaxed">
                        Nosso catálogo online exclusivo está sendo preparado com muito carinho. Para conhecer as novidades em primeira mão ou fazer pedidos especiais, fale diretamente conosco no WhatsApp!
                      </p>
                      <div className="pt-2 flex justify-center">
                        <a
                          href={customerWhatsappContactUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all shadow-md flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>Falar Conosco no WhatsApp</span>
                        </a>
                      </div>
                    </>
                  )
                ) : (
                  /* Products exist, but category filter has 0 */
                  <>
                    <h3 className="font-serif text-xl font-bold text-[#3B1522]">
                      Nenhuma peça encontrada nesta categoria
                    </h3>
                    <p className="text-xs text-[#7A5461] max-w-md mx-auto">
                      Tente selecionar outra sub-aba ou limpar a busca acima para ver mais peças.
                    </p>
                    <button
                      onClick={() => {
                        setActiveCategory('todos');
                        setSearchTerm('');
                      }}
                      className="px-5 py-2 rounded-full text-xs font-semibold text-[#8C3A55] bg-[#FFF0F3] border border-[#F4CCD6] hover:bg-[#FCE7EC]"
                    >
                      Ver Todas as Peças
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    settings={settings}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onOpenDetails={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Product Detail Modal (Clients & Admin) */}
      <ProductDetailModal
        product={selectedProduct}
        settings={settings}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
      />

      {/* Cart Drawer (Shopping & WhatsApp Checkout) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        settings={settings}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onOrderPlaced={handleOrderPlaced}
        onClearCart={handleClearCart}
      />

      {/* Product Form Modal (Admin Only - Authenticated) */}
      {isAdminAuthenticated && (
        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          productToEdit={productToEdit}
          onSave={handleSaveProduct}
          existingProductsCount={products.length}
        />
      )}

      {/* Admin Login Modal (Restricts access from customers) */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        correctPin={settings.adminPin || '1234'}
      />

      {/* Global Footer */}
      <Footer
        settings={settings}
        onSelectCategory={(cat) => {
          setIsAdminView(false);
          setActiveCategory(cat);
        }}
        onOpenAdmin={handleToggleAdmin}
      />
    </div>
  );
}
