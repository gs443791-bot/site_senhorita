import React, { useState } from 'react';
import { CartItem, Order, StoreSettings } from '../types';
import {
  calculateCartTotals,
  cleanPhoneNumber,
  formatBRL,
  generateCartWhatsAppUrl,
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
  Truck,
  CheckCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  if (!isOpen) return null;

  const { subtotal, totalQuantity, savings } = calculateCartTotals(cart);
  const freeShippingThreshold = settings.freeShippingAbove || 150;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Por favor, preencha seu nome e telefone WhatsApp para continuarmos!');
      return;
    }

    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const newOrder: Order = {
        id: generateUUID(),
        orderNumber: generateOrderNumber(),
        createdAt: new Date().toISOString(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerNotes: customerNotes.trim(),
        totalAmount: subtotal,
        status: 'pendente',
        paymentMethod: 'WhatsApp / PIX',
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

      // Save order and deduct stock automatically
      await onOrderPlaced(newOrder);

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DFBA73', '#F4B8C7', '#C59B63', '#B5486B'],
      });

      // Generate WhatsApp link
      const whatsappUrl = generateCartWhatsAppUrl(newOrder, settings);

      // Save completed order state to show confirmation
      setCompletedOrder(newOrder);
      onClearCart();

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Ocorreu um erro ao registrar o pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPixKey = () => {
    if (settings.pixKey) {
      navigator.clipboard.writeText(settings.pixKey);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    }
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
            className="w-8 h-8 rounded-full hover:bg-white text-[#4A1D2B] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {completedOrder ? (
            /* Order Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#3B1522]">
                Pedido Realizado com Sucesso!
              </h3>
              <p className="text-xs text-[#69424F]">
                Pedido <strong>#{completedOrder.orderNumber}</strong> foi gerado e enviado para o nosso WhatsApp.
              </p>

              {/* PIX Payment Card */}
              {settings.pixKey && (
                <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#DFBA73] text-left space-y-2 mt-4 shadow-gold-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8C3A55] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
                      Pagamento via PIX
                    </span>
                    <span className="text-[10px] bg-[#DFBA73]/20 text-[#84532B] px-2 py-0.5 rounded-full font-semibold">
                      Chave {settings.pixKeyType}
                    </span>
                  </div>

                  <div className="text-xs text-[#555]">
                    Favorecido: <strong>{settings.pixBeneficiary || settings.storeName}</strong>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#F4CCD6]">
                    <span className="text-xs font-mono font-medium text-[#333] truncate mr-2">
                      {settings.pixKey}
                    </span>
                    <button
                      onClick={copyPixKey}
                      className="px-2.5 py-1 text-xs font-semibold bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] rounded-lg border border-[#F4CCD6] flex items-center gap-1 shrink-0"
                    >
                      {pixCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar PIX</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col gap-2">
                <a
                  href={generateCartWhatsAppUrl(completedOrder, settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Reabrir Conversa no WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    setCompletedOrder(null);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#8C3A55] hover:bg-[#FCE7EC]"
                >
                  Continuar Navegando
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart View */
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F3] border border-[#F4CCD6] flex items-center justify-center mx-auto text-[#B5486B]">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#3B1522]">Sua sacola está vazia</h3>
              <p className="text-xs text-[#7A5461] max-w-xs mx-auto">
                Explore nossas coleções de brincos, colares, anéis e pulseiras para adicionar peças ao seu pedido.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#DFBA73] to-[#C59B63] hover:brightness-105 shadow-gold-sm"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            /* Filled Cart View */
            <>
              {/* Free Shipping Meter */}
              <div className="p-3 rounded-2xl bg-[#FFF9FA] border border-[#F4CCD6]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#8C3A55] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#C59B63]" />
                    {remainingForFreeShipping > 0
                      ? `Faltam ${formatBRL(remainingForFreeShipping)} para FRETE GRÁTIS!`
                      : 'Parabéns! Você ganhou Frete Grátis ✨'}
                  </span>
                  <span className="font-bold text-[#C59B63]">{freeShippingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#FCE7EC] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#DFBA73] to-[#C59B63] transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

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
                              className="p-1 text-[#4A1D2B] hover:bg-[#FCE7EC]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-[#4A1D2B] min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="p-1 text-[#4A1D2B] hover:bg-[#FCE7EC] disabled:opacity-30"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1 text-[#B5486B] hover:text-red-700 hover:bg-[#FFF0F3] rounded-lg transition-colors ml-auto"
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

              {/* Customer Info Form for Checkout */}
              <form id="checkout-form" onSubmit={handleCheckout} className="pt-2 space-y-3">
                <div className="text-xs font-bold text-[#4A1D2B] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DFBA73]"></span>
                  <span>Dados para entrega e contato</span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#69424F] mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Ana Clara Menezes"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#69424F] mb-1">
                    Seu WhatsApp com DDD *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#69424F] mb-1">
                    Endereço / Bairro / Cidade (opcional)
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Rua, número, bairro e cidade"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#69424F] mb-1">
                    Observação ou Dúvida (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Ex: É para presente, embalar com carinho..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73] resize-none"
                  />
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer with Totals & Finalize Button */}
        {!completedOrder && cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#F5D5DE] bg-[#FFFDFE] space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#69424F]">
                <span>Subtotal ({totalQuantity} itens)</span>
                <span>{formatBRL(subtotal + savings)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Desconto aplicado</span>
                  <span>-{formatBRL(savings)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#3B1522] pt-2 border-t border-[#F5D5DE]">
                <span>Total a Pagar</span>
                <span className="font-serif text-lg text-[#8C3A55]">{formatBRL(subtotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>{isSubmitting ? 'Gerando Pedido...' : 'Finalizar Pedido pelo WhatsApp'}</span>
            </button>

            <p className="text-[10px] text-center text-[#999]">
              Ao finalizar, seu pedido será salvo e a conversa abrirá com o pedido pronto!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
