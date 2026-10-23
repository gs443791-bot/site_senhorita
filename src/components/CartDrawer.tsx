import React, { useState } from 'react';
import { CartItem, Order, StoreSettings } from '../types';
import {
  calculateCartTotals,
  formatBRL,
  generateDirectCartWhatsAppUrl,
  generateOrderNumber,
  generateUUID,
} from '../utils/shopLogic';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: StoreSettings;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderPlaced: (order: Order) => Promise<void>;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onOrderPlaced,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState('');

  if (!isOpen) return null;

  const { subtotal, totalQuantity, savings } = calculateCartTotals(cart);

  const handleFinalizeOnWhatsApp = async () => {
    if (cart.length === 0) return;

    const whatsappUrl = generateDirectCartWhatsAppUrl(cart, settings, customerName);
    setLastWhatsAppUrl(whatsappUrl);

    // Also register the order in background for merchant admin panel tracking
    try {
      const backgroundOrder: Order = {
        id: generateUUID(),
        orderNumber: generateOrderNumber(),
        createdAt: new Date().toISOString(),
        customerName: customerName.trim() || 'Cliente WhatsApp',
        customerPhone: settings.whatsappNumber,
        customerAddress: 'A combinar no WhatsApp',
        customerNotes: 'Pedido direcionado para o WhatsApp',
        totalAmount: subtotal,
        status: 'pendente',
        paymentMethod: 'WhatsApp',
        whatsappMessageSent: true,
        items: cart.map((item) => {
          const unitPrice =
            item.product.promotionalPrice && item.product.promotionalPrice > 0
              ? item.product.promotionalPrice
              : item.product.price;
          return {
            productId: item.product.id,
            productName: item.product.name,
            productCode: item.product.code,
            productImage: item.product.images[0] || '',
            unitPrice,
            quantity: item.quantity,
            subtotal: unitPrice * item.quantity,
          };
        }),
      };
      await onOrderPlaced(backgroundOrder);
    } catch (e) {
      console.warn('Background order record error:', e);
    }

    setIsSent(true);

    // Open WhatsApp directly
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#F5D5DE] flex items-center justify-between bg-[#FFF5F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FCE7EC] border border-[#F4CCD6] flex items-center justify-center text-[#B5486B]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#3B1522]">Sua Sacola de Compras</h2>
              <p className="text-[11px] text-[#8C5D6C]">
                {totalQuantity} {totalQuantity === 1 ? 'peça selecionada' : 'peças selecionadas'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar sacola"
            className="w-8 h-8 rounded-full hover:bg-white text-[#4A1D2B] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F3] border border-[#F4CCD6] flex items-center justify-center mx-auto text-[#B5486B]">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#3B1522]">Sua sacola está vazia</h3>
                <p className="text-xs text-[#8C5D6C] mt-1">
                  Explore nosso catálogo e selecione suas peças favoritas!
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#DFBA73] to-[#C59B63] hover:brightness-105 shadow-gold-sm transition-all cursor-pointer"
              >
                Ver Catálogo de Peças
              </button>
            </div>
          ) : isSent ? (
            /* Post-Redirect Friendly Message */
            <div className="text-center py-8 space-y-4 bg-[#FFF9FA] p-6 rounded-3xl border border-[#F4CCD6]">
              <div className="w-14 h-14 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 fill-[#25D366]" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#3B1522]">
                Direcionando para o WhatsApp...
              </h3>
              <p className="text-xs text-[#69424F] leading-relaxed">
                Sua lista de peças foi organizada com sucesso e a conversa no WhatsApp foi aberta para você combinar a entrega e o pagamento diretamente com a proprietária! ✨
              </p>

              {lastWhatsAppUrl && (
                <div className="pt-2">
                  <a
                    href={lastWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-xs"
                  >
                    <span>Abrir WhatsApp Novamente</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-[#F5D5DE] flex justify-center gap-2">
                <button
                  onClick={() => {
                    setIsSent(false);
                    onClearCart();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8C3A55] hover:bg-[#FCE7EC] cursor-pointer"
                >
                  Continuar Navegando
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3">
                {cart.map((item) => {
                  const unitPrice =
                    item.product.promotionalPrice && item.product.promotionalPrice > 0
                      ? item.product.promotionalPrice
                      : item.product.price;
                  const itemTotal = unitPrice * item.quantity;
                  const itemImg = item.product.images[0] || '';

                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#F4CCD6]/70 shadow-xs"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFF5F7] shrink-0 border border-[#F5D5DE]">
                        <img
                          src={itemImg}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-[#A86F81] font-mono">{item.product.code}</div>
                        <h4 className="font-serif text-xs font-bold text-[#3B1522] truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-xs font-semibold text-[#8C3A55] mt-0.5">
                          {formatBRL(itemTotal)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-[#F4CCD6] rounded-lg overflow-hidden bg-[#FFF9FA]">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 text-[#4A1D2B] hover:bg-[#FCE7EC] cursor-pointer"
                              title="Diminuir"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-[#4A1D2B] min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="p-1 text-[#4A1D2B] hover:bg-[#FCE7EC] disabled:opacity-30 cursor-pointer"
                              title="Aumentar"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1 text-[#B5486B] hover:text-red-700 hover:bg-[#FFF0F3] rounded-lg transition-colors ml-auto cursor-pointer"
                            title="Remover peça"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informational WhatsApp Notice */}
              <div className="p-3.5 rounded-2xl bg-[#E8F8EE] border border-[#A7E9BE] text-[#128C7E] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D6359]">
                  <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                  <span>Atendimento & Venda Direta no WhatsApp</span>
                </div>
                <p className="text-[11px] text-[#1B6D5F] leading-relaxed">
                  Não cobramos nada pelo site! Ao clicar abaixo, a sua sacola completa será enviada para o nosso WhatsApp oficial para você tirar dúvidas, consultar formas de envio e combinar o pagamento diretamente com a proprietária.
                </p>
              </div>

              {/* Optional Client Name */}
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-[#4A1D2B] mb-1">
                  Seu Nome (opcional, para a mensagem no WhatsApp):
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Como gostaria de ser chamada?"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer with Totals & Finalize on WhatsApp Button */}
        {!isSent && cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#F5D5DE] bg-[#FFFDFE] space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#69424F]">
                <span>Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'itens'})</span>
                <span>{formatBRL(subtotal + savings)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Desconto aplicado</span>
                  <span>-{formatBRL(savings)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#3B1522] pt-2 border-t border-[#F5D5DE]">
                <span>Total Estimado</span>
                <span className="font-serif text-lg text-[#8C3A55]">{formatBRL(subtotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalizeOnWhatsApp}
              className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Finalizar Pedido pelo WhatsApp</span>
            </button>

            <p className="text-[10px] text-center text-[#8C5D6C]">
              ✨ Direciona direto para o WhatsApp oficial da Senhorita Acessórios
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
