import React, { useState } from 'react';
import { Product, StoreSettings } from '../types';
import { formatBRL, generateSingleProductWhatsAppUrl } from '../utils/shopLogic';
import {
  X,
  MessageCircle,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import { ImageLightboxModal } from './ImageLightboxModal';

interface ProductDetailModalProps {
  product: Product | null;
  settings: StoreSettings;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  onClose,
  onAddToCart,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'];

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const hasPromo = product.promotionalPrice && product.promotionalPrice < product.price;
  const activePrice = hasPromo ? product.promotionalPrice! : product.price;

  const whatsappUrl = generateSingleProductWhatsAppUrl(product, settings);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#F4CCD6] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fechar detalhes da peça"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#4A1D2B] border border-[#F4CCD6] flex items-center justify-center shadow-md transition-all cursor-pointer hover:rotate-90"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images Gallery */}
          <div className="bg-[#FFF5F7] p-6 flex flex-col justify-between">
            <div
              className="relative aspect-square w-full rounded-2xl overflow-hidden border border-[#F4CCD6]/60 bg-white shadow-xs cursor-zoom-in group"
              onClick={() => setIsLightboxOpen(true)}
              title="Clique para ver a foto ampliada"
            >
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />

              {/* Click to zoom badge */}
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md pointer-events-none group-hover:bg-black/80 transition-colors">
                <ZoomIn className="w-3.5 h-3.5 text-[#DFBA73]" />
                <span>Ampliar Foto</span>
              </div>

              {images.length > 1 && (
                <div
                  className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                    }}
                    className="pointer-events-auto w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#4A1D2B] flex items-center justify-center shadow-md cursor-pointer hover:scale-105"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                    }}
                    className="pointer-events-auto w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#4A1D2B] flex items-center justify-center shadow-md cursor-pointer hover:scale-105"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails if multiple images */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx ? 'border-[#DFBA73] scale-105' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Care note */}
            <div className="mt-4 p-3 rounded-xl bg-white/80 border border-[#F7D5DE] text-[11px] text-[#7A4B59] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C59B63] shrink-0" />
              <span>Dica de cuidado: guarde em local seco e evite contato com perfumes para máxima durabilidade.</span>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6]">
                  {product.category}
                </span>
                <span className="text-xs text-[#999] font-mono">
                  Ref: {product.code}
                </span>
              </div>

              <h2 className="font-serif text-2xl font-bold text-[#3B1522] leading-tight mb-2">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 my-3">
                <span className="font-serif text-3xl font-bold text-[#8C3A55]">
                  {formatBRL(activePrice)}
                </span>
                {hasPromo && (
                  <span className="text-sm text-[#999] line-through">
                    {formatBRL(product.price)}
                  </span>
                )}
              </div>

              {/* Stock status indicator */}
              <div className="mb-4">
                {isOutOfStock ? (
                  <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600 text-xs font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neutral-500"></span>
                    <span>Peça temporariamente esgotada</span>
                  </div>
                ) : isLowStock ? (
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span>Atenção: Apenas {product.stock} unidades restantes no estoque!</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{product.stock} unidades disponíveis a pronta entrega</span>
                  </div>
                )}
              </div>

              {/* Description & Materials */}
              {product.materials && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-[#4A1D2B]">Material & Banho:</div>
                  <div className="text-xs text-[#69424F] mt-0.5">{product.materials}</div>
                </div>
              )}

              {product.description && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-[#4A1D2B]">Descrição:</div>
                  <p className="text-xs text-[#69424F] mt-0.5 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-[#8C3A55] font-medium py-2 border-y border-[#F4CCD6]/60 my-3">
                <ShieldCheck className="w-4 h-4 text-[#C59B63]" />
                <span>Garantia de qualidade e atendimento direto com a proprietária</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-[#F5D5DE] flex flex-col gap-2.5">
              {!isOutOfStock && (
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#4A1D2B]">Quantidade:</span>
                  <div className="flex items-center border border-[#F4CCD6] rounded-xl overflow-hidden bg-[#FFF9FA]">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-1 text-sm text-[#4A1D2B] hover:bg-[#FCE7EC] disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-[#4A1D2B] min-w-[32px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="px-3 py-1 text-sm text-[#4A1D2B] hover:bg-[#FCE7EC] disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Direct WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Pedir Agora pelo WhatsApp</span>
              </a>

              {/* Add to Bag Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                  isOutOfStock
                    ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                    : addedAnimation
                    ? 'bg-emerald-600 text-white border-transparent'
                    : 'bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] border-[#F4CCD6] hover:border-[#DFBA73] cursor-pointer'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Adicionado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Adicionar à Sacola</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        initialIndex={selectedImageIndex}
        productTitle={product.name}
        productCode={product.code}
        whatsappUrl={whatsappUrl}
      />
    </div>
  );
};

