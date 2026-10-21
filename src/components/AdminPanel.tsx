import React, { useState } from 'react';
import {
  CATEGORIES,
  Customer,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  StoreSettings,
} from '../types';
import { formatBRL, cleanPhoneNumber, formatPhoneDisplay } from '../utils/shopLogic';
import {
  Package,
  Layers,
  ShoppingBag,
  Users,
  Settings,
  Database,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Search,
  Sparkles,
  Download,
  Upload,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Lock,
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  settings: StoreSettings;
  onSaveProduct: (productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateStock: (productId: string, newStock: number) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onSaveSettings: (settings: StoreSettings) => Promise<void>;
  onLoadSamples: () => Promise<void>;
  onClearCatalog: () => Promise<void>;
  onOpenNewProductModal: () => void;
  onEditProduct: (product: Product) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  isSupabaseConnected: boolean;
  onLogoutAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  orders,
  customers,
  settings,
  onSaveProduct,
  onDeleteProduct,
  onUpdateStock,
  onUpdateOrderStatus,
  onSaveSettings,
  onLoadSamples,
  onClearCatalog,
  onOpenNewProductModal,
  onEditProduct,
  onExportData,
  onImportData,
  isSupabaseConnected,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<
    'produtos' | 'estoque' | 'pedidos' | 'clientes' | 'config' | 'integracoes'
  >('produtos');

  // Product filters
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  // Orders filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('todos');

  // Settings form state
  const [storeForm, setStoreForm] = useState<StoreSettings>({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Copied helper
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Stock calculations
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const outOfStockProducts = products.filter((p) => p.stock <= 0);
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 3);

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'todos' || p.category === categoryFilter;
    const matchesSearch =
      !productSearch.trim() ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'todos') return true;
    return o.status === orderStatusFilter;
  });

  // Total sales revenue
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(storeForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) onImportData(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-[#FFF9FA] min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F4CCD6] shadow-gold-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#DFBA73] shadow-gold-sm bg-[#FFF0F3] shrink-0">
              <img
                src={settings.logoUrl || '/assets/aistudio/WhatsApp_Image_2026-09-11_at_10.11.39__1__6db93c46.jpeg'}
                alt={settings.storeName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-[#3B1522]">
                  Painel Administrativo
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6]">
                  {settings.storeName}
                </span>
              </div>
              <p className="text-xs text-[#7A5461]">
                Controle de peças, baixa automática de estoque, pedidos e clientes
              </p>
            </div>
          </div>

          {/* Quick Metrics Header */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="px-3.5 py-2 rounded-2xl bg-[#FFF5F7] border border-[#F4CCD6] text-center">
              <span className="block text-[10px] font-semibold text-[#8C5D6C] uppercase">
                Faturamento
              </span>
              <span className="font-serif text-sm font-bold text-[#8C3A55]">
                {formatBRL(totalRevenue)}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-[#FFF5F7] border border-[#F4CCD6] text-center">
              <span className="block text-[10px] font-semibold text-[#8C5D6C] uppercase">
                Pedidos
              </span>
              <span className="font-serif text-sm font-bold text-[#3B1522]">
                {orders.length}
              </span>
            </div>

            <button
              onClick={onOpenNewProductModal}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#DFBA73] to-[#C59B63] hover:brightness-105 shadow-gold-sm flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Peça</span>
            </button>

            <button
              onClick={onLogoutAdmin}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6] flex items-center gap-1.5 cursor-pointer"
              title="Encerrar sessão e bloquear o painel administrativo contra clientes"
            >
              <Lock className="w-3.5 h-3.5 text-[#B5486B]" />
              <span className="hidden sm:inline">Bloquear / Sair</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#F5D5DE] pb-2">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'produtos'
                ? 'bg-gradient-to-r from-[#DFBA73] to-[#C59B63] text-white shadow-gold-sm'
                : 'bg-white hover:bg-[#FCE7EC] text-[#692E41] border border-[#F4CCD6]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Peças & Catálogo ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('estoque')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'estoque'
                ? 'bg-gradient-to-r from-[#DFBA73] to-[#C59B63] text-white shadow-gold-sm'
                : 'bg-white hover:bg-[#FCE7EC] text-[#692E41] border border-[#F4CCD6]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Gestão de Estoque</span>
            {outOfStockProducts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-bold">
                {outOfStockProducts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pedidos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'pedidos'
                ? 'bg-gradient-to-r from-[#DFBA73] to-[#C59B63] text-white shadow-gold-sm'
                : 'bg-white hover:bg-[#FCE7EC] text-[#692E41] border border-[#F4CCD6]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'clientes'
                ? 'bg-gradient-to-r from-[#DFBA73] to-[#C59B63] text-white shadow-gold-sm'
                : 'bg-white hover:bg-[#FCE7EC] text-[#692E41] border border-[#F4CCD6]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'config'
                ? 'bg-gradient-to-r from-[#DFBA73] to-[#C59B63] text-white shadow-gold-sm'
                : 'bg-white hover:bg-[#FCE7EC] text-[#692E41] border border-[#F4CCD6]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações da Loja</span>
          </button>

          <button
            onClick={() => setActiveTab('integracoes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'integracoes'
                ? 'bg-gradient-to-r from-[#DFBA73] to-[#C59B63] text-white shadow-gold-sm'
                : 'bg-white hover:bg-[#FCE7EC] text-[#692E41] border border-[#F4CCD6]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>GitHub, Vercel & Supabase</span>
            {isSupabaseConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>

        {/* TAB 1: PRODUTOS & CATÁLOGO */}
        {activeTab === 'produtos' && (
          <div className="space-y-4">
            {/* Filters & Actions bar */}
            <div className="bg-white p-4 rounded-3xl border border-[#F4CCD6] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A87E8C]" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Buscar por nome ou código..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
                  />
                </div>

                {/* Category select */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] text-[#4A1D2B] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
                >
                  <option value="todos">Todas as Sub-abas ({products.length})</option>
                  {CATEGORIES.filter((c) => c.id !== 'todos').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} ({products.filter((p) => p.category === cat.id).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sample loader & Clear options */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onLoadSamples}
                  className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6] flex items-center gap-1.5"
                  title="Carregar 4 peças prontas para teste"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
                  <span>Carregar Amostras (Teste)</span>
                </button>

                {products.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Deseja realmente limpar todas as peças do catálogo?')) {
                        onClearCatalog();
                      }
                    }}
                    className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-white hover:bg-red-50 text-red-600 border border-red-200"
                    title="Limpar todos os produtos"
                  >
                    Limpar Catálogo
                  </button>
                )}
              </div>
            </div>

            {/* Products Table / Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#F4CCD6] shadow-xs space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#FFF0F3] border border-[#F4CCD6] flex items-center justify-center mx-auto text-[#B5486B]">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#3B1522]">
                  {products.length === 0
                    ? 'Nenhum produto cadastrado ainda'
                    : 'Nenhuma peça encontrada com estes filtros'}
                </h3>
                <p className="text-xs text-[#7A5461] max-w-md mx-auto">
                  {products.length === 0
                    ? 'Seu catálogo está vazio e limpinho conforme solicitado! Clique no botão abaixo para cadastrar suas próprias bijuterias e semijoias.'
                    : 'Tente alterar a busca ou selecionar outra sub-aba.'}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={onOpenNewProductModal}
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#DFBA73] to-[#C59B63] hover:brightness-105 shadow-gold-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Minha Primeira Peça</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#F4CCD6] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF5F7] border-b border-[#F5D5DE] text-[#69424F] font-semibold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Peça / Foto</th>
                        <th className="py-3 px-4">Código</th>
                        <th className="py-3 px-4">Sub-aba</th>
                        <th className="py-3 px-4">Preço</th>
                        <th className="py-3 px-4">Estoque</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5D5DE]/70">
                      {filteredProducts.map((product) => {
                        const isOut = product.stock <= 0;
                        const isLow = product.stock > 0 && product.stock <= 3;
                        const activePrice =
                          product.promotionalPrice && product.promotionalPrice > 0
                            ? product.promotionalPrice
                            : product.price;

                        return (
                          <tr key={product.id} className="hover:bg-[#FFF9FA] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FFF5F7] border border-[#F4CCD6] shrink-0">
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-[#3B1522] truncate max-w-xs">
                                    {product.name}
                                  </div>
                                  {product.materials && (
                                    <div className="text-[11px] text-[#8C5D6C] truncate max-w-xs">
                                      {product.materials}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[#7A5461]">{product.code}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6] uppercase">
                                {product.category}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#8C3A55]">
                                {formatBRL(activePrice)}
                              </div>
                              {product.promotionalPrice && (
                                <div className="text-[10px] text-gray-400 line-through">
                                  {formatBRL(product.price)}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => onUpdateStock(product.id, product.stock - 1)}
                                  className="w-6 h-6 rounded-lg bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#4A1D2B] flex items-center justify-center font-bold"
                                  title="Diminuir estoque"
                                >
                                  -
                                </button>
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-xs font-bold min-w-[28px] text-center ${
                                    isOut
                                      ? 'bg-neutral-800 text-white'
                                      : isLow
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {product.stock}
                                </span>
                                <button
                                  onClick={() => onUpdateStock(product.id, product.stock + 1)}
                                  className="w-6 h-6 rounded-lg bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#4A1D2B] flex items-center justify-center font-bold"
                                  title="Aumentar estoque"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onEditProduct(product)}
                                  className="p-1.5 rounded-lg text-[#7A5461] hover:text-[#3B1522] hover:bg-[#FCE7EC]"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Excluir a peça "${product.name}"?`)) {
                                      onDeleteProduct(product.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GESTÃO DE ESTOQUE AUTOMÁTICO */}
        {activeTab === 'estoque' && (
          <div className="space-y-4">
            {/* Automatic stock explanation card */}
            <div className="bg-gradient-to-r from-[#FFF5F7] via-white to-[#FFF5F7] p-5 rounded-3xl border border-[#DFBA73] shadow-gold-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C3A55] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#C59B63]" />
                  Sistema de Baixa Automática de Estoque
                </span>
                <p className="text-xs text-[#553640] max-w-2xl leading-relaxed">
                  Quando sua cliente finaliza o pedido pelo site e envia no WhatsApp, as unidades são baixadas automaticamente do estoque. Caso um pedido seja cancelado, as peças retornam automaticamente ao inventário!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white border border-[#F4CCD6] text-center min-w-[100px]">
                  <span className="block text-[10px] text-gray-500 font-semibold uppercase">Total Peças</span>
                  <span className="font-serif text-lg font-bold text-[#3B1522]">{totalStockCount}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-amber-200 text-center min-w-[100px]">
                  <span className="block text-[10px] text-amber-700 font-semibold uppercase">Estoque Baixo</span>
                  <span className="font-serif text-lg font-bold text-amber-600">{lowStockProducts.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-neutral-300 text-center min-w-[100px]">
                  <span className="block text-[10px] text-neutral-600 font-semibold uppercase">Esgotadas</span>
                  <span className="font-serif text-lg font-bold text-neutral-800">{outOfStockProducts.length}</span>
                </div>
              </div>
            </div>

            {/* Critical stock alert */}
            {outOfStockProducts.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Você possui {outOfStockProducts.length} peças esgotadas que precisam de reposição.</span>
                </div>
              </div>
            )}

            {/* Inventory table */}
            <div className="bg-white rounded-3xl border border-[#F4CCD6] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF5F7] border-b border-[#F5D5DE] text-[#69424F] font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Peça</th>
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Sub-aba</th>
                      <th className="py-3 px-4">Status de Estoque</th>
                      <th className="py-3 px-4">Reposição Imediata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5D5DE]/70">
                    {products.map((product) => {
                      const isOut = product.stock <= 0;
                      const isLow = product.stock > 0 && product.stock <= 3;

                      return (
                        <tr key={product.id} className="hover:bg-[#FFF9FA]">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#3B1522]">{product.name}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#7A5461]">{product.code}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FCE7EC] text-[#8C3A55]">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {isOut ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-800 text-white">
                                Esgotado (0 un)
                              </span>
                            ) : isLow ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                Crítico ({product.stock} un restantes)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                Normal ({product.stock} un)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onUpdateStock(product.id, product.stock + 5)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6]"
                              >
                                +5 Peças
                              </button>
                              <button
                                onClick={() => onUpdateStock(product.id, product.stock + 10)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6]"
                              >
                                +10 Peças
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            {/* Orders Filter */}
            <div className="bg-white p-4 rounded-3xl border border-[#F4CCD6] shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#4A1D2B]">Filtrar por Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] text-[#4A1D2B]"
                >
                  <option value="todos">Todos os Pedidos ({orders.length})</option>
                  <option value="pendente">Pendente</option>
                  <option value="aguardando_pagamento">Aguardando Pagamento</option>
                  <option value="pago">Pago</option>
                  <option value="enviado">Enviado</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#F4CCD6] shadow-xs space-y-2">
                <ShoppingBag className="w-8 h-8 text-[#B5486B] mx-auto opacity-50" />
                <h3 className="font-serif text-lg font-bold text-[#3B1522]">Nenhum pedido registrado</h3>
                <p className="text-xs text-[#7A5461]">
                  Quando suas clientes finalizarem pedidos pela sacola ou WhatsApp, eles aparecerão aqui com todos os detalhes!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const customerPhoneClean = cleanPhoneNumber(order.customerPhone);
                  const whatsappChatUrl = `https://wa.me/${customerPhoneClean}?text=${encodeURIComponent(
                    `Olá, ${order.customerName}! Aqui é da ${settings.storeName}. Estou entrando em contato sobre o seu pedido #${order.orderNumber}.`
                  )}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-5 border border-[#F4CCD6] shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5D5DE] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-base font-bold text-[#3B1522]">
                              Pedido #{order.orderNumber}
                            </span>
                            <span className="text-[11px] text-gray-500 font-normal">
                              {new Date(order.createdAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="text-xs text-[#69424F] mt-0.5">
                            Cliente: <strong>{order.customerName}</strong> •{' '}
                            {formatPhoneDisplay(order.customerPhone)}
                          </div>
                        </div>

                        {/* Order status selector */}
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-gray-500 font-semibold">Status:</label>
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] text-[#8C3A55]"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="aguardando_pagamento">Aguardando Pagamento</option>
                            <option value="pago">Pago</option>
                            <option value="enviado">Enviado</option>
                            <option value="concluido">Concluído</option>
                            <option value="cancelado">Cancelado (Repõe Estoque)</option>
                          </select>

                          {/* Direct WhatsApp chat button */}
                          <a
                            href={whatsappChatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center gap-1.5"
                            title="Conversar com a cliente no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-2xl bg-[#FFF9FA] border border-[#F5D5DE] flex items-center gap-2.5"
                          >
                            {item.productImage && (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#F4CCD6]"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-[#3B1522] truncate">
                                {item.productName}
                              </div>
                              <div className="text-[11px] text-[#8C5D6C]">
                                {item.quantity}x de {formatBRL(item.unitPrice)} = {formatBRL(item.subtotal)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Address & Notes */}
                      {(order.customerAddress || order.customerNotes) && (
                        <div className="text-xs text-[#69424F] bg-[#FFF5F7] p-3 rounded-2xl border border-[#F4CCD6]/70">
                          {order.customerAddress && (
                            <div>
                              📍 <strong>Endereço de Entrega:</strong> {order.customerAddress}
                            </div>
                          )}
                          {order.customerNotes && (
                            <div className="mt-1">
                              📝 <strong>Observação:</strong> {order.customerNotes}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-right pt-1 font-serif text-sm font-bold text-[#8C3A55]">
                        Total do Pedido: {formatBRL(order.totalAmount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CLIENTES (CRM) */}
        {activeTab === 'clientes' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-[#F4CCD6] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#3B1522]">
                    Base de Clientes Cadastrados
                  </h3>
                  <p className="text-xs text-[#7A5461]">
                    Lista de clientes que geraram pedidos com você no WhatsApp
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6]">
                  {customers.length} Clientes
                </span>
              </div>

              {customers.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#7A5461]">
                  Nenhum cliente cadastrado ainda. Conforme as clientes finalizarem pedidos, o cadastro é criado automaticamente!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF5F7] border-b border-[#F5D5DE] text-[#69424F] font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Nome</th>
                        <th className="py-3 px-4">WhatsApp</th>
                        <th className="py-3 px-4">Endereço</th>
                        <th className="py-3 px-4">Pedidos</th>
                        <th className="py-3 px-4">Total Gasto</th>
                        <th className="py-3 px-4 text-right">Contato</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5D5DE]/70">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-[#FFF9FA]">
                          <td className="py-3 px-4 font-semibold text-[#3B1522]">{c.name}</td>
                          <td className="py-3 px-4 font-mono text-[#7A5461]">
                            {formatPhoneDisplay(c.phone)}
                          </td>
                          <td className="py-3 px-4 text-[#7A5461]">{c.address || 'Não informado'}</td>
                          <td className="py-3 px-4 font-bold text-[#8C3A55]">{c.ordersCount}</td>
                          <td className="py-3 px-4 font-bold text-[#3B1522]">{formatBRL(c.totalSpent)}</td>
                          <td className="py-3 px-4 text-right">
                            <a
                              href={`https://wa.me/${cleanPhoneNumber(c.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-[#25D366] text-white"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white" />
                              <span>Falar</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CONFIGURAÇÕES DA LOJA */}
        {activeTab === 'config' && (
          <div className="bg-white rounded-3xl p-6 border border-[#F4CCD6] shadow-xs max-w-3xl space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#3B1522]">
                Dados da Senhorita Acessórios
              </h3>
              <p className="text-xs text-[#7A5461]">
                Configure seu número de WhatsApp para receber os pedidos das clientes e sua chave PIX
              </p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                    Nome da Loja *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                    Slogan / Subtítulo
                  </label>
                  <input
                    type="text"
                    value={storeForm.tagline}
                    onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                    placeholder="Ex: Acessórios Exclusivos (opcional)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
                  />
                </div>
              </div>

              {/* Hero Title */}
              <div>
                <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                  Frase Principal de Destaque no Topo
                </label>
                <input
                  type="text"
                  value={storeForm.heroTitle || ''}
                  onChange={(e) => setStoreForm({ ...storeForm, heroTitle: e.target.value })}
                  placeholder="Ex: Realce sua beleza com a Senhorita Acessórios"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
                />
              </div>

              {/* WhatsApp setup */}
              <div className="p-4 rounded-2xl bg-[#FFF5F7] border border-[#F4CCD6] space-y-2">
                <label className="block text-xs font-bold text-[#8C3A55] flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Seu Número de WhatsApp para Receber Pedidos *</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={storeForm.whatsappNumber}
                    onChange={(e) => setStoreForm({ ...storeForm, whatsappNumber: e.target.value })}
                    placeholder="Ex: 5511999999999 ou (11) 99999-9999"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
                  />
                  <a
                    href={`https://wa.me/${cleanPhoneNumber(storeForm.whatsappNumber)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#25D366] text-white flex items-center gap-1"
                    title="Testar se o WhatsApp abre corretamente"
                  >
                    <span>Testar Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-[#7A5461]">
                  Dígitos salvos: <code>{cleanPhoneNumber(storeForm.whatsappNumber)}</code>. Todas as mensagens e pedidos das suas clientes irão diretamente para este WhatsApp!
                </p>
              </div>

              {/* PIX configuration */}
              <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#DFBA73] space-y-3">
                <span className="text-xs font-bold text-[#8C3A55] block">
                  Configuração de Pagamento via PIX
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#4A1D2B] mb-1">
                      Tipo de Chave
                    </label>
                    <select
                      value={storeForm.pixKeyType}
                      onChange={(e) =>
                        setStoreForm({
                          ...storeForm,
                          pixKeyType: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-white"
                    >
                      <option value="Telefone">Telefone</option>
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                      <option value="E-mail">E-mail</option>
                      <option value="Aleatória">Chave Aleatória</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-[#4A1D2B] mb-1">
                      Chave PIX
                    </label>
                    <input
                      type="text"
                      value={storeForm.pixKey}
                      onChange={(e) => setStoreForm({ ...storeForm, pixKey: e.target.value })}
                      placeholder="Sua chave PIX para receber"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#4A1D2B] mb-1">
                    Nome do Titular / Favorecido
                  </label>
                  <input
                    type="text"
                    value={storeForm.pixBeneficiary}
                    onChange={(e) => setStoreForm({ ...storeForm, pixBeneficiary: e.target.value })}
                    placeholder="Nome completo ou da empresa"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-white"
                  />
                </div>
              </div>

              {/* Banner notice */}
              <div>
                <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                  Texto da Faixa Superior (Avisos e Frete Grátis)
                </label>
                <input
                  type="text"
                  value={storeForm.bannerNotice}
                  onChange={(e) => setStoreForm({ ...storeForm, bannerNotice: e.target.value })}
                  placeholder="Aviso do topo"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA]"
                />
              </div>

              {/* Security PIN for Admin Protection */}
              <div className="p-4 rounded-2xl bg-[#FFF5F7] border border-[#F4CCD6] space-y-2">
                <label className="block text-xs font-bold text-[#8C3A55] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C59B63]" />
                  <span>Senha de Acesso da Administradora (Proteção contra clientes)</span>
                </label>
                <input
                  type="text"
                  required
                  value={storeForm.adminPin || '1234'}
                  onChange={(e) => setStoreForm({ ...storeForm, adminPin: e.target.value })}
                  placeholder="Ex: 1234 ou sua senha pessoal"
                  className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
                />
                <p className="text-[11px] text-[#7A5461]">
                  Esta senha impede que clientes acessem o painel administrativo ou cadastrem produtos. Apenas quem souber esta senha pode entrar no painel.
                </p>
              </div>


              {/* Save Button */}
              <div className="pt-2 flex items-center justify-between">
                {settingsSaved ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Configurações salvas com sucesso!</span>
                  </span>
                ) : (
                  <span></span>
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#DFBA73] to-[#C59B63] hover:brightness-105 shadow-gold-sm"
                >
                  Salvar Configurações
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: INTEGRAÇÕES (GITHUB, VERCEL & SUPABASE) */}
        {activeTab === 'integracoes' && (
          <div className="space-y-6 max-w-4xl">
            {/* Status overview banner */}
            <div className="bg-white rounded-3xl p-6 border border-[#DFBA73] shadow-gold-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF5F7] border border-[#F4CCD6] flex items-center justify-center text-[#B5486B]">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#3B1522]">
                      Pronto para GitHub, Vercel & Supabase
                    </h3>
                    <p className="text-xs text-[#7A5461]">
                      Toda a estrutura do projeto foi arquitetada e organizada para você publicar na nuvem!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      isSupabaseConnected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    ></span>
                    <span>{isSupabaseConnected ? 'Supabase Conectado' : 'Modo Local Ativo'}</span>
                  </span>
                </div>
              </div>

              {/* 3 Step Deployment Guide */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* 1. GitHub */}
                <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F4CCD6] space-y-2">
                  <div className="text-xs font-bold text-[#3B1522] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#DFBA73] text-white flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Subir no GitHub</span>
                  </div>
                  <p className="text-[11px] text-[#69424F] leading-relaxed">
                    O repositório já contém todos os arquivos, <code>.gitignore</code>, <code>package.json</code> e configurações limpas para commit e push.
                  </p>
                </div>

                {/* 2. Supabase */}
                <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F4CCD6] space-y-2">
                  <div className="text-xs font-bold text-[#3B1522] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#DFBA73] text-white flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Criar Banco no Supabase</span>
                  </div>
                  <p className="text-[11px] text-[#69424F] leading-relaxed">
                    Crie um projeto gratuito em <code>supabase.com</code> e cole o código SQL abaixo no <strong>SQL Editor</strong> para criar as tabelas e gatilhos de estoque.
                  </p>
                </div>

                {/* 3. Vercel */}
                <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F4CCD6] space-y-2">
                  <div className="text-xs font-bold text-[#3B1522] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#DFBA73] text-white flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>Publicar na Vercel</span>
                  </div>
                  <p className="text-[11px] text-[#69424F] leading-relaxed">
                    Importe seu repositório do GitHub na Vercel. O arquivo <code>vercel.json</code> já está pronto para rotas e build ultra-rápido!
                  </p>
                </div>
              </div>
            </div>

            {/* Supabase SQL Schema Viewer & Copy */}
            <div className="bg-white rounded-3xl p-6 border border-[#F4CCD6] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#3B1522]">
                    Script SQL para o Supabase (Tabelas + Baixa Automática de Estoque)
                  </h4>
                  <p className="text-xs text-[#7A5461]">
                    Copie e execute no menu <strong>SQL Editor</strong> do seu painel do Supabase
                  </p>
                </div>

                <button
                  onClick={() =>
                    copyToClipboard(
                      `-- Cole no Supabase SQL Editor\n-- Arquivo salvo em /supabase/schema.sql`,
                      'sql'
                    )
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6] flex items-center gap-1.5"
                >
                  {copiedText === 'sql' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Schema SQL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#1e1e24] text-neutral-200 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                <pre>{`-- Arquivo completo disponível em /supabase/schema.sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2),
  stock INTEGER DEFAULT 0,
  ...
);
-- Trigger automático para deduzir estoque em cada pedido:
CREATE TRIGGER trg_deduct_stock AFTER INSERT ON order_items ...`}</pre>
              </div>
            </div>

            {/* Environment Variables Box */}
            <div className="bg-white rounded-3xl p-6 border border-[#F4CCD6] shadow-xs space-y-3">
              <h4 className="font-serif text-base font-bold text-[#3B1522]">
                Variáveis de Ambiente para a Vercel (.env)
              </h4>
              <p className="text-xs text-[#7A5461]">
                No painel da Vercel (Project Settings &gt; Environment Variables), adicione:
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#FFF9FA] border border-[#F4CCD6] flex items-center justify-between">
                  <div>
                    <span className="text-[#8C3A55] font-bold">VITE_SUPABASE_URL</span> ={' '}
                    <span className="text-gray-500">https://seu-projeto.supabase.co</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('VITE_SUPABASE_URL', 'v_url')}
                    className="text-xs text-[#8C3A55] hover:underline"
                  >
                    {copiedText === 'v_url' ? 'Copiado!' : 'Copiar Nome'}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#FFF9FA] border border-[#F4CCD6] flex items-center justify-between">
                  <div>
                    <span className="text-[#8C3A55] font-bold">VITE_SUPABASE_ANON_KEY</span> ={' '}
                    <span className="text-gray-500">sua_chave_anonima_publica</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('VITE_SUPABASE_ANON_KEY', 'v_key')}
                    className="text-xs text-[#8C3A55] hover:underline"
                  >
                    {copiedText === 'v_key' ? 'Copiado!' : 'Copiar Nome'}
                  </button>
                </div>
              </div>
            </div>

            {/* Data Backup & Restore */}
            <div className="bg-white rounded-3xl p-6 border border-[#F4CCD6] shadow-xs space-y-3">
              <h4 className="font-serif text-base font-bold text-[#3B1522]">
                Backup e Exportação de Dados (JSON)
              </h4>
              <p className="text-xs text-[#7A5461]">
                Você pode baixar um backup com todas as suas peças, pedidos e clientes ou restaurar em outro dispositivo.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={onExportData}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6] flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Dados (Backup JSON)</span>
                </button>

                <label className="cursor-pointer px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#FFF9FA] text-[#4A1D2B] border border-[#F4CCD6] flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>Restaurar / Importar Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
